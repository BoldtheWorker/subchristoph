import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Book a Session", path: "/booking" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlideMenu = ({ isOpen, onClose }: SlideMenuProps) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-80 border-l-2 border-green/40 bg-gradient-to-b from-green-muted to-background p-12 flex flex-col justify-center"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 font-heading text-sm tracking-widest text-primary hover:text-gold-light transition-colors"
            >
              CLOSE
            </button>
            <ul className="space-y-6">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`font-heading text-2xl tracking-tight transition-colors hover:text-primary ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-green-light"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-12 border-t border-green/30 pt-6">
              <p className="text-sm text-green-light">
                Lagos, Nigeria
              </p>
              <p className="text-sm text-primary mt-1">
                info@christophstudios.com
              </p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideMenu;
