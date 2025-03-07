import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const lastScrollY = useRef(0);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e) => {
      if (e.clientY < 50) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const NavLinks = [
    { name: "Home", path: "/#hero" },
    { name: "About Developer", path: "/aboutdev" },
    { name: "Feedback", path: "/review" },
  ];

  return (
    <nav
      className={`${isVisible ? "fixed" : "absolute"
        } top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 z-20 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Logo />
          <button
            ref={buttonRef}
            className="md:hidden focus:outline-none"
            onClick={toggleDropdown}
          >
            {isOpen ? (
              <i className="ph-duotone ph-x text-gray-800 text-2xl hover:text-orange-500 transition-colors duration-300"></i>
            ) : (
              <i className="ph-duotone ph-list text-gray-800 text-2xl hover:text-red-500 transition-colors duration-300"></i>
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300 shadow-md"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-1 top-[75%] w-1/2 max-w-48 bg-white md:hidden shadow-lg z-30 animate-slide-down border-gray-300"
          >
            <div className="flex flex-col p-4 space-y-4 border-t border-gray-100">
              {NavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-800 hover:text-orange-500 transition-colors duration-300 font-medium text-center py-2 rounded-md hover:bg-gray-50"
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  navigate("/signin");
                  setIsOpen(false);
                }}
                className="relative flex items-center justify-center border-none w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-300 shadow-md overflow-hidden"
              >
                <div className="dots_border"></div>
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
