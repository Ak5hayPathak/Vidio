const TABS = ["Videos", "Tweets", "Playlists", "About"];

function ChannelTabs({ activeTab, onTabChange }) {
  return (
    <div className="mt-8 border-b border-white/10">
      <div className="flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            aria-current={activeTab === tab ? "page" : undefined}
            className={`
              px-1
              pb-4
              text-sm
              font-semibold
              transition
              ${
                activeTab === tab
                  ? "border-b-2 border-red-600 text-red-500"
                  : "font-medium text-gray-400 hover:text-white"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChannelTabs;