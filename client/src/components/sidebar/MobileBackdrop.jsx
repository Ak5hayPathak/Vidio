import React from "react";

function MobileBackdrop({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            lg:hidden
          "
        />
      )}
    </>
  );
}

export default MobileBackdrop;
