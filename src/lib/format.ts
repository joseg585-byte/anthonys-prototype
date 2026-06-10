export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// Compact "+$4.50" style for add-on chips.
export function formatAddon(cents: number): string {
  return `+${formatPrice(cents)}`;
}

export function timeAgo(epochMs: number): string {
  const secs = Math.max(0, Math.floor((Date.now() - epochMs) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export function clockTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
