import { Plus } from "lucide-react";

function CreateButton() {
  return (
    <button
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        border
        border-white/10
        text-white
        transition
        hover:bg-white/5
        sm:h-auto
        sm:w-auto
        sm:gap-2
        sm:px-4
        sm:py-2
      "
    >
      <Plus size={18} />
      <span className="hidden sm:inline">Create</span>
    </button>
  );
}

export default CreateButton;