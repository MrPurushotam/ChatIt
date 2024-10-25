import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="w-full p-3 bg-black flex items-center justify-between">
      <div className="text-2xl text-white font-bold">Chat<span className="font-bold mx-1 text-yellow-500 text-3xl">I</span>t</div>
      <div className="text-white text-lg font-semibold space-x-3">
        <Link className="hover:underline" to={"/"}>Home</Link>
        <Link className="hover:underline" to={"/dashboard"}>Dashboard</Link>
      </div>

      {/* Show the number of user used this app dynamically. */}
    </div>
  )
}

export default Navbar
