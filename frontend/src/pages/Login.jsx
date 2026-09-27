import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // Backend "email" ya "username" dono accept karta hai - hum user ka
      // input dono me try karwa denge based on @ ki presence
      const isEmail = formData.identifier.includes("@");
      await login({
        email: isEmail ? formData.identifier : undefined,
        username: isEmail ? undefined : formData.identifier,
        password: formData.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Backend ApiError ka shape: { message: "..." }
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-400">Log in to continue</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-gray-300">Email or Username</label>
            <input
              type="text"
              name="identifier"
              required
              value={formData.identifier}
              onChange={handleChange}
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 pr-10 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-500 py-2 font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
