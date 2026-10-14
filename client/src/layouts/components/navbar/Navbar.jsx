import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import FocusedSearch from "./FocusedSearch.jsx";
import NavbarLogo from "../../../components/logo/NavbarLogo.jsx";
import MobileMenuButton from "./MobileMenuButton.jsx";
import Search from "./Search.jsx";
import CreateButton from "./CreateButton.jsx";
import NotificationButton from "./notifications/components/NotificationButton.jsx";
import ProfileButton from "./ProfileButton.jsx";

function Navbar({ onMenuClick }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);
  const { user } = useAuth();

  const handleSearchFocus = (focused = true) => {
    setSearchFocused(focused);
  };

  const handleBack = () => {
    setSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090b]">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-6">
        <FocusedSearch
          searchFocused={searchFocused}
          searchInputRef={searchInputRef}
          handleBack={handleBack}
          query={query}
          setQuery={setQuery}
        />

        <div
          className={`
            w-full items-center gap-2
            ${searchFocused ? "hidden" : "flex"}
            lg:flex
          `}
        >
          <MobileMenuButton onMenuClick={onMenuClick} />
          <NavbarLogo />

          <Search
            handleSearchFocus={handleSearchFocus}
            query={query}
            setQuery={setQuery}
          />

          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            <CreateButton />
            <NotificationButton />
            <ProfileButton user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;