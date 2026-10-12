import { LoaderCircle } from "lucide-react";

function PlaylistLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-400">
      <LoaderCircle size={30} className="animate-spin" />
      <p className="text-sm">Loading playlist...</p>
    </div>
  );
}

export default PlaylistLoading;
