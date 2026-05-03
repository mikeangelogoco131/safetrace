export function formatDateTime(value, options = {}) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  const locale = options.locale || undefined; // use runtime locale by default
  const defaultOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  };

  const formatter = new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options });
  return formatter.format(date);
}

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  const locale = options.locale || undefined;
  const defaultOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}

export function formatTime(value, options = {}) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  const locale = options.locale || undefined;
  const defaultOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' };
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
}
