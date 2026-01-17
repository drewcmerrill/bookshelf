import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Drew
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/bookshelf"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all"
          >
            {/* <div className="text-5xl mb-4">📚</div> */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              Bookshelf
            </h2>
            {/* <p className="text-gray-600">
              Browse my book collection and see what I&apos;ve been reading.
            </p> */}
          </Link>

          <Link
            href="/krypto"
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all"
          >
            {/* <div className="text-5xl mb-4">🔢</div> */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              Krypto
            </h2>
            {/* <p className="text-gray-600">
              Use math operations to reach the target number.
            </p> */}
          </Link>
        </div>
      </div>
    </div>
  );
}
