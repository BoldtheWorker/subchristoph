import { useState } from "react";
import { Link } from "react-router-dom";
import SlideMenu from "./SlideMenu";
import logo from "@/assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 md:px-12 bg-gradient-to-b from-green-muted/95 to-transparent backdrop-blur-sm border-b border-green/20">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Christoph Media Hub" className="h-12 md:h-14 w-auto" />
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          className="font-heading text-sm font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors px-4 py-2 border-2 border-green-light rounded-sm hover:bg-green/30 hover:border-primary"
        >
          MENU
        </button>
      </header>
      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;
