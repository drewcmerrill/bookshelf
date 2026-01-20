export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/paper-texture.jpg')" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-slate-900 font-medium">Loading bookshelf...</p>
      </div>
    </div>
  );
}
