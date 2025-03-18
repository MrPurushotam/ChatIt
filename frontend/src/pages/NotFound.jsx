import { Link } from "react-router-dom";

export default function NotFound() {
  return (
      <div className="flex flex-col items-center justify-center h-full bg-transparent text-gray-900 p-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
