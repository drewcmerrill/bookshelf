"use client";

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/paper-texture.jpg')" }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated book with turning pages */}
        <div className="relative w-16 h-14">
          {/* Book base (open book shape) */}
          <svg
            width="64"
            height="56"
            viewBox="0 0 64 56"
            className="absolute inset-0"
          >
            {/* Left page */}
            <path
              d="M32 8 L32 48 Q24 46, 8 48 L8 8 Q24 6, 32 8"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right page */}
            <path
              d="M32 8 L32 48 Q40 46, 56 48 L56 8 Q40 6, 32 8"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Left page lines */}
            <line
              x1="14"
              y1="16"
              x2="28"
              y2="14"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <line
              x1="14"
              y1="24"
              x2="28"
              y2="22"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <line
              x1="14"
              y1="32"
              x2="28"
              y2="30"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            {/* Right page lines */}
            <line
              x1="36"
              y1="14"
              x2="50"
              y2="16"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <line
              x1="36"
              y1="22"
              x2="50"
              y2="24"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
            <line
              x1="36"
              y1="30"
              x2="50"
              y2="32"
              stroke="#1f2937"
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>

          {/* Turning page 1 */}
          <svg
            width="64"
            height="56"
            viewBox="0 0 64 56"
            className="absolute inset-0 origin-[32px_28px] animate-page-turn-1"
          >
            <path
              d="M32 8 L32 48 Q40 46, 56 48 L56 8 Q40 6, 32 8"
              fill="white"
              stroke="#1f2937"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Turning page 2 */}
          <svg
            width="64"
            height="56"
            viewBox="0 0 64 56"
            className="absolute inset-0 origin-[32px_28px] animate-page-turn-2"
          >
            <path
              d="M32 8 L32 48 Q40 46, 56 48 L56 8 Q40 6, 32 8"
              fill="white"
              stroke="#1f2937"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Turning page 3 */}
          <svg
            width="64"
            height="56"
            viewBox="0 0 64 56"
            className="absolute inset-0 origin-[32px_28px] animate-page-turn-3"
          >
            <path
              d="M32 8 L32 48 Q40 46, 56 48 L56 8 Q40 6, 32 8"
              fill="white"
              stroke="#1f2937"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-gray-800 font-medium">Loading bookshelf...</p>
      </div>

      <style jsx>{`
        @keyframes page-turn-1 {
          0%,
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          25% {
            transform: rotateY(-180deg);
            opacity: 0;
          }
          26%,
          99% {
            opacity: 0;
          }
        }
        @keyframes page-turn-2 {
          0%,
          33% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          58% {
            transform: rotateY(-180deg);
            opacity: 0;
          }
          59%,
          100% {
            opacity: 0;
          }
        }
        @keyframes page-turn-3 {
          0%,
          66% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          91% {
            transform: rotateY(-180deg);
            opacity: 0;
          }
          92%,
          100% {
            opacity: 0;
          }
        }
        .animate-page-turn-1 {
          animation: page-turn-1 2.4s ease-in-out infinite;
        }
        .animate-page-turn-2 {
          animation: page-turn-2 2.4s ease-in-out infinite;
        }
        .animate-page-turn-3 {
          animation: page-turn-3 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
