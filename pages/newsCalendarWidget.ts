export const ECONOMIC_CALENDAR_WIDGET_URL =
  'https://www.tradays.com/c/js/widgets/calendar/widget.js?v=15';

export const ECONOMIC_CALENDAR_WIDGET_CONFIG = Object.freeze({
  width: '100%',
  height: 620,
  mode: '2',
  fw: 'html',
  lang: 'ar',
});

interface CalendarWidgetScript {
  async: boolean;
  type: string;
  src: string;
  innerHTML: string;
  setAttribute(name: string, value: string): void;
}

interface CalendarWidgetContainer {
  innerHTML: string;
}

interface CalendarWidgetDocument {
  createElement(tagName: 'script'): CalendarWidgetScript;
}

export const mountEconomicCalendarWidget = (
  container: CalendarWidgetContainer,
  documentRef: CalendarWidgetDocument = document,
) => {
  container.innerHTML = '';

  const script = documentRef.createElement('script');
  script.async = true;
  script.type = 'text/javascript';
  script.setAttribute('data-type', 'calendar-widget');
  script.src = ECONOMIC_CALENDAR_WIDGET_URL;
  script.innerHTML = JSON.stringify(ECONOMIC_CALENDAR_WIDGET_CONFIG);
  (container as CalendarWidgetContainer & { appendChild(node: unknown): unknown }).appendChild(script);

  return () => {
    container.innerHTML = '';
  };
};
