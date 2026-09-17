'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled global application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0E1420] text-[#E8EAF0] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161D2C] border border-[#2A3346] rounded p-6 shadow-2xl text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-[#B4694A]/20 border border-[#B4694A]/40 flex items-center justify-center mx-auto text-[#B4694A] font-bold text-lg">
          !
        </div>

        <h2 className="text-base font-semibold text-[#E8EAF0]">
          Something went wrong loading this view
        </h2>

        <p className="text-xs text-[#8B92A8] leading-relaxed">
          An unexpected error occurred while rendering the dashboard. Your inputs have not been lost.
        </p>

        {error.message && (
          <div className="text-[11px] font-mono bg-[#0E1420] border border-[#2A3346] p-2.5 rounded text-[#8B92A8] text-left break-words">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#C9A15D] hover:bg-[#b58e4b] text-[#0E1420] font-semibold text-xs rounded transition"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-[#0E1420] hover:bg-[#1a2336] text-[#E8EAF0] border border-[#2A3346] font-medium text-xs rounded transition"
          >
            Reload app
          </button>
        </div>
      </div>
    </div>
  );
}
