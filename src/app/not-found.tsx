import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0E1420] text-[#E8EAF0] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161D2C] border border-[#2A3346] rounded p-6 shadow-2xl text-center space-y-4">
        <h1 className="text-3xl font-bold font-mono text-[#C9A15D]">404</h1>

        <h2 className="text-base font-semibold text-[#E8EAF0]">
          Page not found
        </h2>

        <p className="text-xs text-[#8B92A8] leading-relaxed">
          The requested route does not exist or has been moved.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#C9A15D] hover:bg-[#b58e4b] text-[#0E1420] font-semibold text-xs rounded transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
