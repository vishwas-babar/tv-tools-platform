export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8">
        {children}
      </div>
    </div>
  );
}
