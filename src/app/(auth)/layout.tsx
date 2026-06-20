export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8">
        {children}
      </div>
    </div>
  );
}
