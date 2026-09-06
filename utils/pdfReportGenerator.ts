import { jsPDF } from 'jspdf';
import { Trade } from './tradingUtils';
import {
    MonthlyTradingReportModel,
    buildMonthlyTradingReportModel,
    getTradingReportFilename,
} from './tradingReportModel';

export interface ReportData {
    trades: Trade[];
    startingBalance: number;
    currentBalance: number;
    month: number;
    year: number;
    userEmail?: string;
}

export interface MonthlyReportDocumentOptions {
    unicodeFontBase64?: string;
}

type PdfColor = readonly [number, number, number];

interface PdfTypography {
    hasUnicodeFont: boolean;
}

const UNICODE_FONT_FILE = 'NotoSansArabic-Regular.ttf';
const UNICODE_FONT_FAMILY = 'NotoSansArabic';
const ARABIC_TEXT_PATTERN = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;

const COLORS = {
    forest: [16, 46, 36] as PdfColor,
    canopy: [35, 75, 59] as PdfColor,
    parchment: [243, 239, 228] as PdfColor,
    paper: [255, 253, 247] as PdfColor,
    brass: [200, 154, 73] as PdfColor,
    ink: [22, 35, 30] as PdfColor,
    muted: [91, 106, 98] as PdfColor,
    line: [220, 215, 201] as PdfColor,
    profit: [47, 138, 103] as PdfColor,
    loss: [198, 91, 80] as PdfColor,
    white: [255, 255, 255] as PdfColor,
};

const setFill = (doc: jsPDF, color: PdfColor) => doc.setFillColor(color[0], color[1], color[2]);
const setText = (doc: jsPDF, color: PdfColor) => doc.setTextColor(color[0], color[1], color[2]);
const setDraw = (doc: jsPDF, color: PdfColor) => doc.setDrawColor(color[0], color[1], color[2]);

const usesArabicScript = (value: string | string[]): boolean => (
    ARABIC_TEXT_PATTERN.test(Array.isArray(value) ? value.join(' ') : value)
);

const setJournalFont = (
    doc: jsPDF,
    value: string | string[],
    typography: PdfTypography,
    fallbackStyle: 'normal' | 'bold' = 'normal',
): boolean => {
    const useUnicodeFont = typography.hasUnicodeFont && usesArabicScript(value);
    doc.setFont(useUnicodeFont ? UNICODE_FONT_FAMILY : 'helvetica', useUnicodeFont ? 'normal' : fallbackStyle);
    return useUnicodeFont;
};

const formatMoney = (amount: number, sign = false): string => {
    const prefix = sign && amount > 0 ? '+' : amount < 0 ? '-' : '';
    return `${prefix}$${Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatMetric = (value: number, suffix = ''): string => (
    Number.isFinite(value) && value < 999 ? `${value.toFixed(2)}${suffix}` : '--'
);

const formatProfitFactor = (value: number): string => value >= 999 ? 'No losses' : value.toFixed(2);

const getClampedTextLines = (
    doc: jsPDF,
    value: string,
    maxWidth: number,
    maxLines: number,
    typography: PdfTypography,
): string[] => {
    setJournalFont(doc, value, typography);
    doc.setFontSize(7);
    const wrapped = doc.splitTextToSize(value, maxWidth) as string[];
    if (wrapped.length <= maxLines) return wrapped;

    const visible = wrapped.slice(0, maxLines);
    let finalLine = visible[maxLines - 1].trimEnd();
    while (finalLine.length > 0 && doc.getTextWidth(`${finalLine}...`) > maxWidth) {
        finalLine = finalLine.slice(0, -1).trimEnd();
    }
    visible[maxLines - 1] = `${finalLine}...`;
    return visible;
};

export const filterTradesByMonth = (trades: Trade[], month: number, year: number): Trade[] => (
    trades.filter((trade) => {
        const tradeDate = trade.entryDate?.toDate?.();
        return Boolean(tradeDate && tradeDate.getUTCMonth() === month && tradeDate.getUTCFullYear() === year);
    })
);

export const getAvailableMonths = (trades: Trade[]): { month: number; year: number; label: string }[] => {
    const months = new Map<string, { month: number; year: number }>();

    trades.forEach((trade) => {
        const date = trade.entryDate?.toDate?.();
        if (!date) return;
        months.set(`${date.getUTCFullYear()}-${date.getUTCMonth()}`, {
            month: date.getUTCMonth(),
            year: date.getUTCFullYear(),
        });
    });

    return Array.from(months.values())
        .sort((a, b) => b.year - a.year || b.month - a.month)
        .map((period) => ({
            ...period,
            label: new Date(Date.UTC(period.year, period.month, 1)).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
            }),
        }));
};

const drawBrandMark = (doc: jsPDF, x: number, y: number, scale = 1, inverse = false) => {
    const leaf = inverse ? COLORS.paper : COLORS.canopy;
    setFill(doc, leaf);
    doc.ellipse(x - 4.2 * scale, y, 3.2 * scale, 5.7 * scale, 'F');
    doc.ellipse(x + 4.2 * scale, y, 3.2 * scale, 5.7 * scale, 'F');
    setFill(doc, COLORS.brass);
    doc.roundedRect(x - 1.35 * scale, y - 5.2 * scale, 2.7 * scale, 8.3 * scale, 1.2, 1.2, 'F');
    setDraw(doc, inverse ? COLORS.forest : COLORS.paper);
    doc.setLineWidth(0.75 * scale);
    doc.line(x - 7 * scale, y + 4.2 * scale, x, y + 8.1 * scale);
    doc.line(x + 7 * scale, y + 4.2 * scale, x, y + 8.1 * scale);
};

const drawWordmark = (doc: jsPDF, x: number, y: number, inverse = false) => {
    drawBrandMark(doc, x + 6, y - 2.5, 0.72, inverse);
    setText(doc, inverse ? COLORS.paper : COLORS.forest);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Ta7leel', x + 17, y);
};

const drawPageHeader = (doc: jsPDF, label: string) => {
    drawWordmark(doc, 17, 17);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.25);
    doc.text(label.toUpperCase(), 193, 16, { align: 'right' });
    setDraw(doc, COLORS.line);
    doc.setLineWidth(0.25);
    doc.line(17, 24, 193, 24);
};

const drawSectionTitle = (doc: jsPDF, eyebrow: string, title: string, y: number) => {
    setText(doc, COLORS.brass);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(eyebrow.toUpperCase(), 17, y, { charSpace: 1.4 });
    setText(doc, COLORS.ink);
    doc.setFontSize(20);
    doc.text(title, 17, y + 9);
};

const drawMetricCard = (
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    label: string,
    value: string,
    tone: PdfColor = COLORS.ink,
) => {
    setFill(doc, COLORS.paper);
    setDraw(doc, COLORS.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, width, 28, 2.5, 2.5, 'FD');
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + 5, y + 8, { charSpace: 0.8 });
    setText(doc, tone);
    doc.setFontSize(15);
    doc.text(value, x + 5, y + 20);
};

const drawEquityChart = (doc: jsPDF, model: MonthlyTradingReportModel, y: number) => {
    const x = 17;
    const width = 176;
    const height = 52;
    setFill(doc, COLORS.paper);
    setDraw(doc, COLORS.line);
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');

    setText(doc, COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Performance inkline', x + 7, y + 10);
    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${model.equityCurve.length - 1} recorded trades`, x + width - 7, y + 10, { align: 'right' });

    const chartX = x + 8;
    const chartY = y + 16;
    const chartW = width - 16;
    const chartH = height - 23;
    const values = model.equityCurve.map((point) => point.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 1);

    setDraw(doc, COLORS.line);
    doc.setLineWidth(0.2);
    for (let index = 0; index < 3; index += 1) {
        const gridY = chartY + (chartH / 2) * index;
        doc.line(chartX, gridY, chartX + chartW, gridY);
    }

    const points = model.equityCurve.map((point, index) => ({
        x: chartX + (model.equityCurve.length === 1 ? 0 : (index / (model.equityCurve.length - 1)) * chartW),
        y: chartY + chartH - ((point.balance - min) / range) * chartH,
    }));
    setDraw(doc, model.returnAmount >= 0 ? COLORS.profit : COLORS.loss);
    doc.setLineWidth(1.1);
    points.slice(1).forEach((point, index) => {
        const previous = points[index];
        doc.line(previous.x, previous.y, point.x, point.y);
    });
    points.forEach((point) => {
        setFill(doc, COLORS.brass);
        doc.circle(point.x, point.y, 1.15, 'F');
    });
};

const addCoverPage = (
    doc: jsPDF,
    model: MonthlyTradingReportModel,
    typography: PdfTypography,
    userEmail?: string,
) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    setFill(doc, COLORS.forest);
    doc.rect(0, 0, width, height, 'F');

    drawWordmark(doc, 19, 24, true);
    setText(doc, COLORS.brass);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TRADING FIELDBOOK / MONTHLY REVIEW', 19, 64, { charSpace: 1.7 });

    setText(doc, COLORS.paper);
    doc.setFontSize(34);
    doc.text(model.periodLabel, 19, 90);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'normal');
    doc.text('A record of performance, risk, and decision quality.', 19, 105);

    setDraw(doc, COLORS.brass);
    doc.setLineWidth(1.25);
    doc.line(19, 128, 149, 128);
    doc.line(149, 128, 181, 107);
    setFill(doc, COLORS.brass);
    doc.circle(149, 128, 2.1, 'F');
    doc.circle(181, 107, 2.1, 'F');

    setFill(doc, COLORS.canopy);
    doc.roundedRect(19, 155, 172, 60, 4, 4, 'F');
    setText(doc, COLORS.paper);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('MONTHLY CLOSE', 29, 171, { charSpace: 1.25 });
    doc.setFontSize(27);
    doc.text(formatMoney(model.closingBalance), 29, 190);
    setText(doc, model.returnAmount >= 0 ? [141, 214, 180] : [244, 161, 150]);
    doc.setFontSize(12);
    doc.text(`${formatMoney(model.returnAmount, true)}  /  ${model.returnPercent >= 0 ? '+' : ''}${model.returnPercent.toFixed(2)}%`, 29, 203);
    setText(doc, COLORS.paper);
    doc.setFontSize(9);
    doc.text(`${model.stats.totalTrades} trades`, 177, 174, { align: 'right' });
    doc.text(`${model.stats.winRate.toFixed(1)}% win rate`, 177, 186, { align: 'right' });
    doc.text(model.stats.profitFactor >= 999 ? 'No losing trades' : `${formatProfitFactor(model.stats.profitFactor)} profit factor`, 177, 198, { align: 'right' });

    setText(doc, [185, 198, 190]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (userEmail) {
        const isRtl = setJournalFont(doc, userEmail, typography);
        doc.text(userEmail, isRtl ? 120 : 19, 267, isRtl ? { align: 'right', R2L: true } : undefined);
    }
    doc.setFont('helvetica', 'normal');
    doc.text(`REPORT ID  ${model.periodKey}`, 191, 267, { align: 'right', charSpace: 0.8 });
};

const addExecutivePage = (doc: jsPDF, model: MonthlyTradingReportModel, typography: PdfTypography) => {
    doc.addPage();
    setFill(doc, COLORS.parchment);
    doc.rect(0, 0, 210, 297, 'F');
    drawPageHeader(doc, `${model.periodLabel} / Executive review`);
    drawSectionTitle(doc, '01 / Performance', 'The month at a glance', 38);

    const cardWidth = 54;
    const gap = 7;
    drawMetricCard(doc, 17, 57, cardWidth, 'Net result', formatMoney(model.returnAmount, true), model.returnAmount >= 0 ? COLORS.profit : COLORS.loss);
    drawMetricCard(doc, 17 + cardWidth + gap, 57, cardWidth, 'Win rate', `${model.stats.winRate.toFixed(1)}%`, model.stats.winRate >= 50 ? COLORS.profit : COLORS.loss);
    drawMetricCard(doc, 17 + (cardWidth + gap) * 2, 57, cardWidth, 'Profit factor', formatProfitFactor(model.stats.profitFactor), model.stats.profitFactor >= 1 ? COLORS.profit : COLORS.loss);

    drawMetricCard(doc, 17, 91, cardWidth, 'Expectancy', formatMoney(model.advancedStats.expectancy, true));
    drawMetricCard(doc, 17 + cardWidth + gap, 91, cardWidth, 'Max drawdown', formatMoney(-model.advancedStats.maxDrawdownValue), model.advancedStats.maxDrawdownValue > 0 ? COLORS.loss : COLORS.muted);
    drawMetricCard(doc, 17 + (cardWidth + gap) * 2, 91, cardWidth, 'Average R', `${formatMetric(model.advancedStats.avgR)}R`);

    setText(doc, COLORS.muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('OPENING BALANCE', 17, 132, { charSpace: 0.8 });
    doc.text('CLOSING BALANCE', 193, 132, { align: 'right', charSpace: 0.8 });
    setText(doc, COLORS.ink);
    doc.setFontSize(13);
    doc.text(formatMoney(model.openingBalance), 17, 141);
    doc.text(formatMoney(model.closingBalance), 193, 141, { align: 'right' });
    setDraw(doc, COLORS.brass);
    doc.setLineWidth(0.9);
    doc.line(69, 138, 141, 138);
    setFill(doc, COLORS.brass);
    doc.circle(105, 138, 1.7, 'F');

    drawEquityChart(doc, model, 151);

    setText(doc, COLORS.brass);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DECISION QUALITY', 17, 219, { charSpace: 1.2 });
    setText(doc, COLORS.ink);
    doc.setFontSize(15);
    doc.text('Repeat what worked. Remove what leaked.', 17, 228);

    const insightY = 236;
    const insightWidth = 84.5;
    [
        {
            label: 'BEST SETUP',
            value: model.highlights.bestSetup?.label ?? 'More data needed',
            note: model.highlights.bestSetup
                ? `${formatMoney(model.highlights.bestSetup.totalPnL, true)} across ${model.highlights.bestSetup.trades} trade${model.highlights.bestSetup.trades === 1 ? '' : 's'}`
                : 'Log setups to reveal an edge.',
            color: COLORS.profit,
        },
        {
            label: 'COSTLIEST EMOTION',
            value: model.highlights.costliestEmotion?.label ?? 'No pattern yet',
            note: model.highlights.costliestEmotion
                ? `${formatMoney(model.highlights.costliestEmotion.totalPnL, true)} across ${model.highlights.costliestEmotion.trades} trade${model.highlights.costliestEmotion.trades === 1 ? '' : 's'}`
                : 'Tag emotions to expose leakage.',
            color: COLORS.loss,
        },
    ].forEach((insight, index) => {
        const x = 17 + index * (insightWidth + 7);
        setFill(doc, COLORS.paper);
        setDraw(doc, COLORS.line);
        doc.roundedRect(x, insightY, insightWidth, 38, 3, 3, 'FD');
        setText(doc, insight.color);
        doc.setFontSize(7.5);
        doc.text(insight.label, x + 6, insightY + 9, { charSpace: 0.8 });
        setText(doc, COLORS.ink);
        doc.setFontSize(12);
        const isRtl = setJournalFont(doc, insight.value, typography, 'bold');
        doc.text(
            insight.value,
            isRtl ? x + insightWidth - 6 : x + 6,
            insightY + 20,
            isRtl ? { align: 'right', R2L: true } : undefined,
        );
        setText(doc, COLORS.muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(insight.note, x + 6, insightY + 29);
        doc.setFont('helvetica', 'bold');
    });
};

const drawLedgerHeader = (doc: jsPDF, model: MonthlyTradingReportModel, continued = false) => {
    setFill(doc, COLORS.parchment);
    doc.rect(0, 0, 210, 297, 'F');
    drawPageHeader(doc, `${model.periodLabel} / Trade ledger`);
    drawSectionTitle(doc, '02 / Ledger', continued ? 'Trade ledger, continued' : 'Every decision, in sequence', 38);
};

const drawTableHeader = (doc: jsPDF, y: number) => {
    setFill(doc, COLORS.forest);
    doc.roundedRect(17, y, 176, 10, 2, 2, 'F');
    setText(doc, COLORS.paper);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const headers = [
        ['DATE', 21],
        ['MARKET', 46],
        ['SIDE', 76],
        ['SETUP', 96],
        ['R', 139],
        ['RESULT', 156],
    ] as const;
    headers.forEach(([label, x]) => doc.text(label, x, y + 6.5, { charSpace: 0.45 }));
};

const addLedgerPages = (doc: jsPDF, model: MonthlyTradingReportModel, typography: PdfTypography) => {
    doc.addPage();
    drawLedgerHeader(doc, model);
    let y = 59;
    drawTableHeader(doc, y);
    y += 13;

    if (model.tradeRows.length === 0) {
        setFill(doc, COLORS.paper);
        setDraw(doc, COLORS.line);
        doc.roundedRect(17, y, 176, 56, 3, 3, 'FD');
        setText(doc, COLORS.ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('No trades recorded in this period.', 105, y + 23, { align: 'center' });
        setText(doc, COLORS.muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('The opening balance carries forward unchanged.', 105, y + 35, { align: 'center' });
        return;
    }

    model.tradeRows.forEach((trade, index) => {
        const notes = trade.notes || `${trade.emotion} execution`;
        const noteLines = getClampedTextLines(doc, notes, 124, 2, typography);
        const rowHeight = 20 + Math.max(0, noteLines.length - 1) * 3.5;

        if (y + rowHeight > 276) {
            doc.addPage();
            drawLedgerHeader(doc, model, true);
            y = 59;
            drawTableHeader(doc, y);
            y += 13;
        }

        if (index % 2 === 0) {
            setFill(doc, COLORS.paper);
            doc.roundedRect(17, y - 2, 176, rowHeight, 2, 2, 'F');
        }
        setText(doc, COLORS.ink);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(trade.date.replace(`, ${model.periodKey.slice(0, 4)}`, ''), 21, y + 5);
        const symbol = trade.symbol.slice(0, 12);
        const symbolIsRtl = setJournalFont(doc, symbol, typography, 'bold');
        doc.text(symbol, symbolIsRtl ? 70 : 46, y + 5, symbolIsRtl ? { align: 'right', R2L: true } : undefined);
        setText(doc, trade.direction === 'LONG' ? COLORS.profit : COLORS.loss);
        doc.setFont('helvetica', 'bold');
        doc.text(trade.direction, 76, y + 5);
        setText(doc, COLORS.ink);
        const setup = trade.setup.slice(0, 20);
        const setupIsRtl = setJournalFont(doc, setup, typography, 'bold');
        doc.text(setup, setupIsRtl ? 133 : 96, y + 5, setupIsRtl ? { align: 'right', R2L: true } : undefined);
        doc.setFont('helvetica', 'bold');
        doc.text(trade.rr === null ? '--' : `${trade.rr.toFixed(1)}R`, 139, y + 5);
        setText(doc, trade.pnl >= 0 ? COLORS.profit : COLORS.loss);
        doc.text(formatMoney(trade.pnl, true), 189, y + 5, { align: 'right' });

        setText(doc, COLORS.muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const emotionIsRtl = setJournalFont(doc, trade.emotion, typography);
        if (emotionIsRtl) {
            doc.text(trade.emotion, 58, y + 12, { align: 'right', R2L: true });
            doc.setFont('helvetica', 'normal');
            doc.text(trade.status, 21, y + 12);
        } else {
            doc.text(`${trade.emotion}  /  ${trade.status}`, 21, y + 12);
        }
        const notesAreRtl = setJournalFont(doc, noteLines, typography);
        doc.text(noteLines, notesAreRtl ? 189 : 63, y + 12, notesAreRtl ? { align: 'right', R2L: true } : undefined);
        y += rowHeight + 2;
    });
};

const addFooters = (doc: jsPDF, model: MonthlyTradingReportModel) => {
    const pageCount = doc.getNumberOfPages();
    const generated = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        if (page === 1) continue;
        setDraw(doc, COLORS.line);
        doc.setLineWidth(0.2);
        doc.line(17, 284, 193, 284);
        setText(doc, COLORS.muted);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Ta7leel Trading Fieldbook  /  Generated ${generated}`, 17, 290);
        doc.text(`${model.periodKey}  /  ${page} of ${pageCount}`, 193, 290, { align: 'right' });
    }
};

export const createMonthlyReportDocument = async (
    data: ReportData,
    options: MonthlyReportDocumentOptions = {},
): Promise<jsPDF> => {
    const model = buildMonthlyTradingReportModel(data);
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });
    const typography: PdfTypography = {
        hasUnicodeFont: Boolean(options.unicodeFontBase64),
    };

    if (options.unicodeFontBase64) {
        doc.addFileToVFS(UNICODE_FONT_FILE, options.unicodeFontBase64);
        doc.addFont(UNICODE_FONT_FILE, UNICODE_FONT_FAMILY, 'normal');
    }

    doc.setProperties({
        title: `Ta7leel Trading Fieldbook - ${model.periodLabel}`,
        subject: 'Monthly trading performance, risk, and discipline review',
        author: data.userEmail || 'Ta7leel',
        creator: 'Ta7leel Trading Journal',
        keywords: 'trading journal, monthly review, performance, risk, discipline',
    });

    addCoverPage(doc, model, typography, data.userEmail);
    addExecutivePage(doc, model, typography);
    addLedgerPages(doc, model, typography);
    addFooters(doc, model);
    return doc;
};

export const generateMonthlyReport = async (data: ReportData): Promise<void> => {
    const response = await fetch('/fonts/NotoSansArabic-Regular.ttf');
    if (!response.ok) {
        throw new Error(`Unable to load the PDF Unicode font (${response.status}).`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    const doc = await createMonthlyReportDocument(data, {
        unicodeFontBase64: btoa(binary),
    });
    doc.save(getTradingReportFilename(data.month, data.year));
};

export default generateMonthlyReport;
