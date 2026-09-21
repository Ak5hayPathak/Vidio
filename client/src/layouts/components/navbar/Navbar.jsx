import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import FocusedSearch from "./FocusedSearch.jsx";
import NavbarLogo from "../../../components/logo/NavbarLogo.jsx";
import MobileMenuButton from "./MobileMenuButton.jsx";
import Search from "./Search.jsx";
import CreateButton from "./CreateButton.jsx";
import NotificationButton from "./NotificationButton.jsx";
import ProfileButton from "./ProfileButton.jsx";

function Navbar({ onMenuClick }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const { user } = useAuth();

  const handleSearchFocus = () => {
    setSearchFocused(true);
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
        />
        {/* Normal Navbar, visible on desktop */}
        <div
          className={`
            w-full
            items-center
            gap-2
            ${searchFocused ? "hidden" : "flex"}
            lg:flex
          `}
        >
          {/* Mobile Menu Button */}
          <MobileMenuButton onMenuClick={onMenuClick} />

          {/* Logo */}
          <NavbarLogo />

          {/* Search */}
          <Search handleSearchFocus={handleSearchFocus} />

          {/* Right Section */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            {/* Create */}
            <CreateButton />

            {/* Notification */}
            <NotificationButton />

            {/* Profile */}
            <ProfileButton user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;