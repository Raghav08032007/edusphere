// ==============================================================================
// EDUSPHERE DATE & TIME FORMATTING UTILITIES
// Prevents "Invalid Date" bugs with robust fallbacks and ISO validation
// ==============================================================================

export function formatSafeDate(
  dateInput?: string | number | Date | null,
  options?: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long' | 'relative';
  }
): string {
  if (!dateInput) return 'Recently';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Recently';
    }

    const format = options?.format || 'medium';

    if (format === 'relative') {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
    }

    if (format === 'short') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        ...(options?.includeTime && { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Default medium format: e.g. "Oct 26, 2026"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(options?.includeTime && { hour: '2-digit', minute: '2-digit' }),
    });
  } catch {
    return 'Recently';
  }
}
