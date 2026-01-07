import { Shelf } from "@/components/Shelf";
import { books } from "@/data/books";
import { Stats } from "@/components/Stats";

export default async function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen">
      <main className="flex flex-col gap-0 row-start-2 items-center ">
        <Stats books={books}></Stats>
        <Shelf books={books}></Shelf>
      </main>
    </div>
  );
}
