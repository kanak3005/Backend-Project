import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Compass size={40} className="mb-4 text-gray-600" />
      <h1 className="text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-gray-400">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Go home
      </Link>
    </div>
  );
}
