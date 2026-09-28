import { useState } from "react";
import { changePassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await updateAccountDetails({ fullname: fullname.trim(), email: email.trim() });
      setUser(response.data.data);
      showToast("Profile details updated.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update your profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setIsSavingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      showToast("Password changed.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not change your password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleImageUpload = async (event, updateImage, label) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await updateImage(file);
      setUser(response.data.data);
      showToast(`${label} updated.`);
    } catch (err) {
      showToast(err?.response?.data?.message || `Could not update your ${label.toLowerCase()}.`, "error");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Preferences</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Settings</h1>
      <p className="mt-2 text-sm text-gray-500">Manage your public profile and account security.</p>

      <div className="mt-7 space-y-5">
        <section className="rounded-2xl border border-white/[0.07] bg-surface-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">Channel appearance</h2>
          <p className="mt-1 text-sm text-gray-500">These details appear on your Vuelo channel.</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <img src={user?.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <label className="cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-brand-400">
              {isUploading ? "Uploading..." : "Update avatar"}
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => handleImageUpload(event, updateUserAvatar, "Avatar")}
              />
            </label>
            <label className="cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:border-brand-400">
              Update cover
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => handleImageUpload(event, updateUserCoverImage, "Cover image")}
              />
            </label>
          </div>
        </section>

        <form onSubmit={handleProfileSave} className="rounded-2xl border border-white/[0.07] bg-surface-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">Profile details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-400">
              Display name
              <input
                value={fullname}
                onChange={(event) => setFullname(event.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3.5 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm text-gray-400">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3.5 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </label>
          </div>
          <button disabled={isSavingProfile} className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50">
            {isSavingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="rounded-2xl border border-white/[0.07] bg-surface-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">Password</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-400">
              Current password
              <input
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3.5 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm text-gray-400">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-surface px-3.5 py-3 text-sm text-white outline-none focus:border-brand-500"
              />
            </label>
          </div>
          <button disabled={isSavingPassword} className="mt-5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-brand-400 disabled:opacity-50">
            {isSavingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}