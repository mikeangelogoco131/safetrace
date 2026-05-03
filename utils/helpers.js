export function normalizeE164Phone(phone) {
  if (!phone) {
    return null;
  }

  const cleaned = String(phone).trim().replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return null;
  }

  const digits = cleaned.slice(1).replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(digits)) {
    return null;
  }

  return `+${digits}`;
}

export function isE164Phone(phone) {
  return /^\+[1-9]\d{7,14}$/.test(String(phone || '').trim());
}

export function buildMapsUrl(latitude, longitude) {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export function safeErrorMessage(error, fallback = 'Unexpected error') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || fallback;
}