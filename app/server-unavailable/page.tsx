'use client';

import { useRouter } from 'next/navigation';

export default function ServerUnavailablePage() {
  const router = useRouter();

  const handleRetry = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.push('/manage-profile');
    } else {
      router.push('/login');
    }
    router.refresh();
  };

  const handleGoToLogin = () => {
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <svg
              className="h-16 w-16 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
          Server nicht erreichbar
        </h1>
        <p className="text-gray-400 mb-6 text-base">
          Der Backend-Server ist derzeit nicht erreichbar. Bitte prüfen Sie Ihre Internetverbindung
          oder versuchen Sie es später erneut.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-white bg-[#585C5B] hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-gray-500 transition-colors"
          >
            Erneut versuchen
          </button>
          <button
            type="button"
            onClick={handleGoToLogin}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#141414] focus:ring-gray-500 transition-colors"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    </div>
  );
}
