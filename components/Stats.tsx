"use client";
import { Book } from "@/data/types";

type StatsProps = {
  books: Book[];
};

export function Stats({ books }: StatsProps) {
  const totalReadBooks = books.filter((book) => book.read === "Read").length;
  const totalUnreadBooks = books.filter((book) => book.read !== "Read").length;
  const totalReadPages = books
    .filter((book) => book.read === "Read")
    .reduce((sum, book) => sum + (book.pages || 0), 0);
  const totalUnreadPages = books
    .filter((book) => book.read !== "Read")
    .reduce((sum, book) => sum + (book.pages || 0), 0);
  const averagePages =
    books.length > 0
      ? Math.round(
          books.reduce((sum, book) => sum + (book.pages || 0), 0) / books.length
        )
      : 0;

  return (
    // Full-width wrapper
    <div className="w-full flex justify-center">
      {/* Centered stats box */}
      <div
        className="max-w-3xl w-full overflow-hidden shadow-lg"
        style={{
          background: "#fef9ed", // paper tone
          fontFamily: "'Georgia', serif",
          border: "2px solid #A07A55", // shelf plank color
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <p className="text-center text-2xl mt-4">My Bookshelf</p>

        <hr className="mt-2 mx-10 border-t border-black" />

        {/* Stats content */}
        <div className="px-6 py-4 space-y-2 text-black text-center">
          <p>Total books: {books.length}</p>
          <p>Read: {totalReadBooks}</p>
          <p>Unread: {totalUnreadBooks}</p>
          <p>Pages read: {totalReadPages}</p>
          {/* <p>Pages unread: {totalUnreadPages}</p> */}
          <p>Average pages per book: {averagePages}</p>
        </div>
      </div>
    </div>
  );
}
