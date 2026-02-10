// PDF Report Generator for Trading Journal
// Uses jspdf to generate professional monthly trading reports

import { jsPDF } from 'jspdf';
import { Trade, TradingStats, calculateStats } from './tradingUtils';

interface ReportData {
    trades: Trade[];
    startingBalance: number;
    currentBalance: number;
    month: number; // 0-11
    year: number;
    userEmail?: string;
}

/**
 * Filter trades by month and year
 */
export const filterTradesByMonth = (trades: Trade[], month: number, year: number): Trade[] => {
    return trades.filter(trade => {
        const tradeDate = trade.entryDate?.toDate?.();
        if (!tradeDate) return false;
        return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
    });
};

/**
 * Get available months that have trades
 */
export const getAvailableMonths = (trades: Trade[]): { month: number; year: number; label: string }[] => {
    const monthsSet = new Map<string, { month: number; year: number }>();

    trades.forEach(trade => {
        const date = trade.entryDate?.toDate?.();
        if (!date) return;
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthsSet.has(key)) {
            monthsSet.set(key, { month: date.getMonth(), year: date.getFullYear() });
        }
    });

    const months = Array.from(monthsSet.values())
        .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        })
        .map(m => ({
            ...m,
            label: new Date(m.year, m.month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            })
        }));

    return months;
};

/**
 * Format currency for PDF
 */
const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '' : '-';
    return `${sign}$${Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Helper to load image
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

/**
 * Generate a professional PDF trading report
 */
export const generateMonthlyReport = async (data: ReportData): Promise<void> => {
    const { trades, startingBalance, currentBalance, month, year, userEmail } = data;

    const monthlyTrades = filterTradesByMonth(trades, month, year);
    const stats = calculateStats(monthlyTrades);

    const monthName = new Date(year, month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // === Header ===
    const headerHeight = 60; // Increased to fit logo
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Logo
    try {
        const logo = await loadImage('/favicon/logo-white.png');
        const logoWidth = 40;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);
    } catch (error) {
        console.error('Failed to load logo:', error);
    }

    doc.setTextColor(255, 255, 255);

    // Title (Centered, Smaller)
    doc.setFontSize(18); // Reduced from 24
    doc.setFont('helvetica', 'bold');
    doc.text('Trading Report', pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(monthName, pageWidth / 2, 53, { align: 'center' });

    // User info (Top Right)
    doc.setFontSize(10);
    // doc.text('Ta7leel Trading Journal', pageWidth - 20, 25, { align: 'right' });
    // Removed specific app name to clean up header, or keep it small
    if (userEmail) {
        doc.text(userEmail, pageWidth - 10, 15, { align: 'right' });
    }

    yPos = headerHeight + 15;

    // === Summary Stats Section ===
    doc.setTextColor(17, 24, 39); // Dark gray
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Summary', 20, yPos);
    yPos += 12;

    // Stats Grid
    const statsData = [
        { label: 'Total P&L', value: formatCurrency(stats.totalPnL), color: stats.totalPnL >= 0 ? [16, 185, 129] : [239, 68, 68] },
        { label: 'Win Rate', value: `${stats.winRate}%`, color: stats.winRate >= 50 ? [16, 185, 129] : [239, 68, 68] },
        { label: 'Profit Factor', value: stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1 ? [16, 185, 129] : [239, 68, 68] },
        { label: 'Total Trades', value: stats.totalTrades.toString(), color: [107, 114, 128] },
        { label: 'Wins', value: stats.wins.toString(), color: [16, 185, 129] },
        { label: 'Losses', value: stats.losses.toString(), color: [239, 68, 68] },
    ];

    const boxWidth = 55;
    const boxHeight = 25;
    const boxMargin = 5;

    statsData.forEach((stat, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 20 + col * (boxWidth + boxMargin);
        const y = yPos + row * (boxHeight + boxMargin);

        // Box background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');

        // Label
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(stat.label, x + 5, y + 10);

        // Value
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value, x + 5, y + 20);
    });

    yPos += 60;

    // === Balance Overview ===
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Overview', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Starting Balance: ${formatCurrency(startingBalance)}`, 20, yPos);
    yPos += 7;
    doc.text(`Current Balance: ${formatCurrency(currentBalance)}`, 20, yPos);
    yPos += 7;

    const change = currentBalance - startingBalance;
    const changePercent = ((change / startingBalance) * 100).toFixed(2);
    const changeColor = change >= 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(`Total Return: ${formatCurrency(change)} (${changePercent}%)`, 20, yPos);
    yPos += 15;

    // === Trade Log Table ===
    if (monthlyTrades.length > 0) {
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Trade Log', 20, yPos);
        yPos += 10;

        // Table Header
        const headers = ['Date', 'Symbol', 'Direction', 'P&L', 'Status'];
        const colWidths = [35, 30, 30, 40, 25];

        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos, pageWidth - 40, 8, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(75, 85, 99);

        let xPos = 22;
        headers.forEach((header, i) => {
            doc.text(header, xPos, yPos + 5.5);
            xPos += colWidths[i];
        });
        yPos += 10;

        // Table Rows
        doc.setFont('helvetica', 'normal');

        // Sort trades by date
        const sortedTrades = [...monthlyTrades].sort((a, b) =>
            (b.entryDate?.toMillis?.() || 0) - (a.entryDate?.toMillis?.() || 0)
        );

        sortedTrades.forEach((trade, index) => {
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            // Alternate row background
            if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(20, yPos - 3, pageWidth - 40, 8, 'F');
            }

            const tradeDate = trade.entryDate?.toDate?.();
            const dateStr = tradeDate ? tradeDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }) : '-';

            xPos = 22;
            doc.setTextColor(55, 65, 81);
            doc.text(dateStr, xPos, yPos + 2);
            xPos += colWidths[0];

            doc.text(trade.symbol, xPos, yPos + 2);
            xPos += colWidths[1];

            doc.setTextColor(trade.direction === 'LONG' ? 16 : 239, trade.direction === 'LONG' ? 185 : 68, trade.direction === 'LONG' ? 129 : 68);
            doc.text(trade.direction, xPos, yPos + 2);
            xPos += colWidths[2];

            doc.setTextColor(trade.pnl >= 0 ? 16 : 239, trade.pnl >= 0 ? 185 : 68, trade.pnl >= 0 ? 129 : 68);
            doc.text(formatCurrency(trade.pnl), xPos, yPos + 2);
            xPos += colWidths[3];

            const statusColor = trade.status === 'WIN' ? [16, 185, 129] : trade.status === 'LOSS' ? [239, 68, 68] : [107, 114, 128];
            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.text(trade.status, xPos, yPos + 2);

            yPos += 8;
        });
    } else {
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(11);
        doc.text('No trades recorded for this month.', 20, yPos);
    }

    // === Footer ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} | Page ${i} of ${pageCount}`,
            pageWidth / 2,
            285,
            { align: 'center' }
        );
    }

    // Save the PDF
    const fileName = `Trading_Report_${monthName.replace(' ', '_')}.pdf`;
    doc.save(fileName);
};

export default generateMonthlyReport;
