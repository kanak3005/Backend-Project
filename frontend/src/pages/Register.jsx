import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ImagePlus } from "lucide-react";
import { registerUser } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Backend ke registerUser controller ko avatar file ZAROORI chahiye
    if (!avatarFile) {
      setError("Avatar image is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend multer.fields([{name:"avatar"}, {name:"coverImage"}]) expect karta hai,
      // isliye humein FormData banani hogi, plain JSON nahi.
      const data = new FormData();
      data.append("fullname", formData.fullname);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("avatar", avatarFile);
      if (coverImageFile) data.append("coverImage", coverImageFile);

      await registerUser(data);
      // Registration ke baad backend automatically login nahi karta,
      // isliye user ko login page par bhej rahe hai
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-gray-400">Join the platform</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Avatar picker */}
          <div className="flex items-center gap-4">
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-surface-border bg-surface text-gray-500 hover:border-brand-500">
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={20} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="text-sm text-gray-400">
              Avatar <span className="text-red-400">*</span>
              <p className="text-xs text-gray-500">Required</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Full name</label>
            <input
              type="text"
              name="fullname"
              required
              value={formData.fullname}
              onChange={handleChange}
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
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
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
