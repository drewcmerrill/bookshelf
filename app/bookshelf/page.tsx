import { Shelf } from "@/components/Shelf";
import { Stats } from "@/components/Stats";
import { prisma } from "@/lib/prisma";
import { Book } from "@/data/types";
import Link from "next/link";
import { Tangerine } from "next/font/google";

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: "700",
});

export const dynamic = "force-dynamic";

export default async function BookshelfPage() {
  const dbBooks = await prisma.book.findMany({
    orderBy: { position: "asc" },
  });

  // Transform Prisma types to match existing Book type
  const books: Book[] = dbBooks.map((book: (typeof dbBooks)[number]) => ({
    title: book.title,
    img: book.img,
    height: book.height,
    read: book.read ?? undefined,
    dateStarted: book.dateStarted ?? undefined,
    dateFinished: book.dateFinished ?? undefined,
    author: book.author ?? undefined,
    pages: book.pages ?? undefined,
    genre: book.genre ?? undefined,
    description: book.description ?? undefined,
    // Multi-factor ratings
    ratingWriting: book.ratingWriting ?? undefined,
    ratingPlot: book.ratingPlot ?? undefined,
    ratingCharacters: book.ratingCharacters ?? undefined,
    ratingPacing: book.ratingPacing ?? undefined,
    ratingWorldBuilding: book.ratingWorldBuilding ?? undefined,
    ratingEnjoyment: book.ratingEnjoyment ?? undefined,
    ratingRecommend: book.ratingRecommend ?? undefined,
    ratingOverall: book.ratingOverall ?? undefined,
    ratingOverrideManual: book.ratingOverrideManual ?? undefined,
  }));

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col bg-cover bg-center bg-no-repeat gap-0  "
      style={{ backgroundImage: "url('/paper-texture.jpg')" }}
    >
      <header className="relative bg-white border-b border-slate-200 px-4 py-8 flex items-center mb-5">
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
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
          Back
        </Link>

        <h1
          className={`${tangerine.className} text-5xl text-slate-900 absolute left-1/2 -translate-x-1/2`}
        >
          My Bookshelf
        </h1>

        <Link
          href="/admin"
          className="ml-auto text-slate-400 hover:text-slate-600 transition-colors text-sm"
        >
          Edit
        </Link>
      </header>

      <Stats books={books}></Stats>
      <Shelf books={books}></Shelf>
    </div>
  );
}
