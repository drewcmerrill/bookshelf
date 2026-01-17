import { Calculator } from "@/components/Calculator";
import Link from "next/link";

export default function KryptoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-md mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors p-1"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Krypto
          </h1>
          <div className="w-5 sm:w-6" />
        </div>

        <Calculator />
      </div>
    </div>
  );
}
