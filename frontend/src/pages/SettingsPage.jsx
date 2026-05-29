import { Download, MonitorCog, Sparkles, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store/settingsStore";
import { usePresentationStore } from "../store/presentationStore";
import { useAuthStore } from "../store/authStore";
import ConfirmModal from "../components/ConfirmModal";
import { useState } from "react";

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/65 px-4 py-4">
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-8 w-14 items-center rounded-full border px-1 transition ${checked ? "border-cyan-300/35 bg-cyan-400/20 justify-end" : "border-slate-700 bg-slate-900 justify-start"}`}
    >
      <span className="h-6 w-6 rounded-full bg-white shadow-soft" />
    </button>
  </div>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const settings = useSettingsStore();
  const presentations = usePresentationStore((state) => state.presentations);
  const user = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const exportWorkspace = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      settings: {
        darkMode: settings.darkMode,
        animationsEnabled: settings.animationsEnabled,
        compactMode: settings.compactMode,
        defaultSlideCount: settings.defaultSlideCount,
        defaultTemplate: settings.defaultTemplate,
        imageProvider: settings.imageProvider
      },
      presentations
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "slidecraft-workspace-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Workspace data exported.");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Settings</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Tune the workspace behavior</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)]">
          <div className="flex items-center gap-3">
            <MonitorCog className="h-5 w-5 text-cyan-300" />
            <h3 className="font-display text-2xl font-bold text-white">General</h3>
          </div>
          <div className="mt-5 space-y-4">
            <ToggleRow
              label="Dark mode"
              description="Keep the current dark workspace shell active."
              checked={settings.darkMode}
              onChange={(value) => settings.setSetting("darkMode", value)}
            />
            <ToggleRow
              label="Animations"
              description="Enable subtle motion across generation and navigation."
              checked={settings.animationsEnabled}
              onChange={(value) => settings.setSetting("animationsEnabled", value)}
            />
            <ToggleRow
              label="Compact mode"
              description="Tighten cards and list rows for dense browsing."
              checked={settings.compactMode}
              onChange={(value) => settings.setSetting("compactMode", value)}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <h3 className="font-display text-2xl font-bold text-white">AI Settings</h3>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Default slide count</span>
              <select
                value={settings.defaultSlideCount}
                onChange={(event) => settings.setSetting("defaultSlideCount", Number(event.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
              >
                {Array.from({ length: 20 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>{value} slides</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Default template</span>
              <select
                value={settings.defaultTemplate}
                onChange={(event) => settings.setSetting("defaultTemplate", event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
              >
                <option value="Business">Business</option>
                <option value="Minimal">Minimal</option>
                <option value="Modern">Modern</option>
                <option value="Tech">Tech</option>
                <option value="Creative">Creative</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Image provider</span>
              <select
                value={settings.imageProvider}
                onChange={(event) => settings.setSetting("imageProvider", event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300"
              >
                <option value="Pexels">Pexels</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] xl:col-span-2">
          <h3 className="font-display text-2xl font-bold text-white">Account</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportWorkspace}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              <Download className="h-4 w-4" />
              Export data
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Delete account?"
        description="This permanently removes your profile and every presentation in the workspace."
        confirmLabel="Delete account"
        onConfirm={async () => {
          await deleteAccount();
          toast.success("Account deleted.");
          navigate("/login");
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </section>
  );
}
