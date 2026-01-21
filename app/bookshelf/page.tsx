import { Shelf } from "@/components/Shelf";
import { Stats } from "@/components/Stats";
import { prisma } from "@/lib/prisma";
import { Book } from "@/data/types";
import Link from "next/link";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  weight: "400",
  subsets: ["latin"],
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
    <div className="min-h-screen flex flex-col gap-0 relative">
      {/* Fixed background layer */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/paper-texture.jpg')" }}
      />
      <header className="relative px-8 py-8 flex items-center mb-5">
        <Link
          href="/"
          className={`${cinzel.className} text-[#6b5a4a] hover:text-[#3d2e1f] transition-colors flex items-center gap-2`}
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
          className={`${cinzel.className} text-2xl md:text-5xl text-[#3d2e1f] absolute left-1/2 -translate-x-1/2`}
        >
          My Bookshelf
        </h1>

        <Link
          href="/admin"
          className={`${cinzel.className} ml-auto text-[#6b5a4a] hover:text-[#3d2e1f] transition-colors`}
        >
          Edit
        </Link>
      </header>

      <Stats books={books}></Stats>
      <Shelf books={books}></Shelf>
    </div>
  );
}
