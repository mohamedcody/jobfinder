const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export const normalizeExternalUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmed);
    return SAFE_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
};

