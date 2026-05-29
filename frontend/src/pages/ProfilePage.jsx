import { Camera, KeyRound, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    setName(user?.name || "");
    setAvatarUrl(user?.avatarUrl || "");
  }, [user]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Profile</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Manage your workspace identity</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)]">
          <div className="flex flex-col items-center text-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="h-28 w-28 rounded-[2rem] object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-slate-700 bg-slate-900 text-cyan-300">
                <UserCircle2 className="h-12 w-12" />
              </div>
            )}
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
              <Camera className="h-4 w-4" />
              Upload avatar
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            <p className="mt-5 text-xl font-semibold text-white">{user?.name}</p>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              Joined {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)]">
            <h3 className="font-display text-2xl font-bold text-white">Profile details</h3>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    await updateProfile({ name, avatarUrl });
                    toast.success("Profile updated.");
                  }}
                  className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)]">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-cyan-300" />
              <h3 className="font-display text-2xl font-bold text-white">Change password</h3>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Current password</span>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">New password</span>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  await changePassword(passwords);
                  setPasswords({ currentPassword: "", newPassword: "" });
                  toast.success("Password updated.");
                }}
                className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
