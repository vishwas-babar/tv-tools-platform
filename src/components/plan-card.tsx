interface PlanCardProps {
  durationDays: number;
  price: number;
}

function formatDuration(days: number): string {
  if (days === 365) return "1 Year";
  if (days === 90) return "3 Months";
  if (days === 30) return "1 Month";
  if (days === 7) return "1 Week";
  return `${days} Days`;
}

export function PlanCard({ durationDays, price }: PlanCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-sm font-medium text-gray-500">
        {formatDuration(durationDays)}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        ${price.toFixed(2)}
      </p>
      <button className="mt-3 w-full rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700">
        Subscribe
      </button>
    </div>
  );
}
