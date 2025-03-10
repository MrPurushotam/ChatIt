import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLinks = [
    { name: "Home", path: "/#hero" },
    { name: "About Developer", path: "/aboutdev" },
    { name: "Feedback", path: "/review" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 z-20 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Logo />
        <button
          className="md:hidden text-gray-800 text-2xl focus:outline-none"
          onClick={toggleSidebar}
        >
          {isOpen ? "✕" : "☰"}
        </button>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {NavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-800 hover:text-orange-500 transition-colors duration-300 font-medium"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => navigate("/signin")}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition duration-300 shadow-md"
          >
            Get Started
          </button>
        </div>
      </div>
      {/* Full-Width Mobile Menu Below Navbar */}
      {isOpen && (
        <div className="w-full bg-white shadow-md mt-1 py-4 px-6 space-y-4 md:hidden border-t-2 border-">
          {NavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block text-left text-gray-800 hover:text-orange-500 transition-colors duration-300 font-medium"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => {
              navigate("/signin");
              setIsOpen(false);
            }}
            className="text-left px-6 py-2 -ml-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300 shadow-md"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;