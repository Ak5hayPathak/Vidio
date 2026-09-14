function CategoryBar() {
  const categories = [
    "All",
    "Music",
    "Gaming",
    "Programming",
    "Technology",
    "Movies",
    "Education",
    "Live",
    "Podcasts",
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category, index) => (
        <button
          key={category}
          className={`
    shrink-0
    rounded-lg
    px-4
    py-2
    text-sm
    font-medium
    transition
    ${
      index === 0
        ? "bg-red-600 text-white"
        : "bg-[#111318] text-gray-300 hover:bg-white/10"
    }
  `}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
