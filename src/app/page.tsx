// src/app/page.tsx

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 font-sans dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-20 px-6 bg-white/80 backdrop-blur-sm dark:bg-black/80 sm:px-8 lg:px-12 rounded-3xl shadow-2xl m-4">
        
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13v4m0-8h.01" />
            </svg>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400 sm:text-6xl lg:text-7xl">
          Product Label Generator
        </h1>
        
        <p className="mt-6 text-xl text-center text-gray-600 dark:text-gray-300 max-w-2xl">
          Create professional, compliant product labels in seconds. Perfect for food, cosmetics, and retail products.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-8 text-white font-semibold transition-all hover:from-amber-700 hover:to-orange-700 hover:shadow-lg sm:w-auto"
            href="/generator"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start Generating
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border-2 border-amber-600 px-8 text-amber-700 font-semibold transition-all hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950 sm:w-auto"
            href="/examples"
          >
            View Examples
          </a>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-900 shadow-md">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generate labels in seconds with our AI-powered system</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-900 shadow-md">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compliant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Meets FDA and EU labeling requirements</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-900 shadow-md">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Professional Templates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose from 50+ beautiful label designs</p>
          </div>
        </div>
      </main>
    </div>
  );
}