export function formatDuration(days: number): string {
  if (days === 365) return "1 Year";
  if (days === 90) return "3 Months";
  if (days === 30) return "1 Month";
  if (days === 7) return "1 Week";
  return `${days} Days`;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
