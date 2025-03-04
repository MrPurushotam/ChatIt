import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full p-5 flex justify-between items-center bg-white shadow-lg border-b border-gray-200">
      <Logo />
      <div className="flex items-center space-x-5 text-normal">
        <Link className="text-black hover:text-themeOrange transition" to={"/"}>Home</Link>
        <Link className="text-black hover:text-themeOrange transition" to={"/aboutdev"}>About Developer</Link>
        <Link className="text-black hover:text-themeOrange transition" to={"/review"}>Feedback</Link>
      </div>

      <button className="px-5 py-2 bg-themeOrangeDarker text-black rounded-full shadow-md hover:bg-themeOrange transition" onClick={()=>navigate("/signin")}>
        Get Started
      </button>
    </div>
  );
};

export default Navbar;