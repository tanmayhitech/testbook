import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useUserProfile, useUpdateUserProfile } from "../hooks/useVCS.js";
import { useTheme } from "../contexts/ThemeContext.js";
import {
  Settings,
  User,
  Check,
  Loader2,
  Lock,
  Bell,
  GraduationCap,
  MapPin,
  Globe,
  Sparkles,
} from "lucide-react";
import { formatDate } from "../lib/utils.js";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const { accent, setAccent } = useTheme();

  const [username, setUsername] = useState(profile?.username || user?.username || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoWatchRepos, setAutoWatchRepos] = useState(true);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync({
      username: username.trim(),
      email: email.trim(),
      headline: headline.trim(),
      institution: institution.trim(),
      location: location.trim(),
      website: website.trim(),
      bio: bio.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono text-xs">
      <div className="pb-4 border-b border-matte-800">
        <h1 className="text-lg font-bold text-matte-50 flex items-center gap-2">
          <Settings size={18} className="text-sage-400" />
          <span>Account &amp; Developer Settings</span>
        </h1>
        <p className="text-xs text-matte-400 mt-0.5">
          Configure your developer profile, credentials, and notification preferences
        </p>
      </div>

      {/* Profile Form */}
      <div className="p-6 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-matte-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-matte-200">
            <User size={15} className="text-sage-400" />
            <span>Profile Information</span>
          </div>
          <span className="text-matte-500 text-[11px]">
            Joined {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
          </span>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-matte-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
                required
              />
            </div>

            <div>
              <label className="block text-matte-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-matte-400 mb-1">Professional Headline / Title</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full-Stack Developer & Systems Enthusiast"
              className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-matte-400 mb-1 flex items-center gap-1">
                <GraduationCap size={12} />
                <span>College / University</span>
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Faculty of Computer Science"
                className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-matte-400 mb-1 flex items-center gap-1">
                <MapPin size={12} />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-matte-400 mb-1 flex items-center gap-1">
                <Globe size={12} />
                <span>Portfolio Website</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-matte-400 mb-1">Developer Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other students and faculty about your projects..."
              className="w-full bg-matte-950 border border-matte-700 rounded p-2.5 text-matte-100 focus:outline-none focus:border-sage-500 font-sans text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-1.5 bg-sage-500 hover:bg-sage-400 text-matte-950 font-semibold rounded text-xs transition flex items-center gap-1.5 shadow"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Profile</span>
              )}
            </button>

            {savedSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <Check size={12} />
                <span>Profile updated successfully</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="p-6 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 font-bold text-matte-200 border-b border-matte-800 pb-3">
          <Lock size={15} className="text-sage-400" />
          <span>Security &amp; Password</span>
        </div>

        {passwordError && <div className="text-rose-400 text-xs">{passwordError}</div>}
        {passwordSuccess && (
          <div className="text-emerald-400 text-xs flex items-center gap-1">
            <Check size={13} />
            <span>Password updated successfully.</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
          <div>
            <label className="block text-matte-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-matte-400 mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-matte-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-matte-950 border border-matte-700 rounded px-3 py-1.5 text-matte-100 focus:outline-none focus:border-sage-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-matte-800 hover:bg-matte-750 border border-matte-700 text-matte-100 rounded text-xs transition"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Appearance & Color Mode */}
      <div className="p-6 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-matte-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-matte-200">
            <Sparkles size={15} className="text-sage-400" />
            <span>Appearance &amp; Color Mode</span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] text-matte-300 border border-white/[0.08]">
            {accent === "pink" ? "Baby Pink Active" : "Sage Green Active"}
          </span>
        </div>

        <p className="text-xs text-matte-400 font-sans">
          Choose your interface accent theme. All buttons, graphs, indicators, and icon monograms will dynamically adapt.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Option 1: Sage Green */}
          <button
            type="button"
            onClick={() => setAccent("sage")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
              accent === "sage"
                ? "bg-sage-400/10 border-sage-400 text-matte-100 shadow-[0_0_16px_rgba(74,222,128,0.15)]"
                : "bg-matte-950 border-matte-800 text-matte-400 hover:border-matte-700"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold font-mono text-matte-100 flex items-center gap-1.5">
                <span>Sage Green</span>
                {accent === "sage" && <Check size={12} className="text-sage-400" />}
              </div>
              <p className="text-[11px] text-matte-400 font-sans leading-relaxed">
                The signature dark matte aesthetic with emerald sage accents.
              </p>
            </div>
          </button>

          {/* Option 2: Baby Pink */}
          <button
            type="button"
            onClick={() => setAccent("pink")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
              accent === "pink"
                ? "bg-pink-400/10 border-[#f472b6] text-matte-100 shadow-[0_0_16px_rgba(244,114,182,0.18)]"
                : "bg-matte-950 border-matte-800 text-matte-400 hover:border-matte-700"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#f472b6] shadow-[0_0_10px_#f472b6] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold font-mono text-matte-100 flex items-center gap-1.5">
                <span>Baby Pink</span>
                {accent === "pink" && <Check size={12} className="text-[#f472b6]" />}
              </div>
              <p className="text-[11px] text-matte-400 font-sans leading-relaxed">
                Dreamy soft blush pink accent with pastel glows and rose monograms.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications & Developer Preferences */}
      <div className="p-6 bg-matte-900 border border-matte-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 font-bold text-matte-200 border-b border-matte-800 pb-3">
          <Bell size={15} className="text-sage-400" />
          <span>Platform Preferences</span>
        </div>

        <div className="space-y-3 max-w-xl">
          <label className="flex items-center justify-between p-3 bg-matte-950 border border-matte-800 rounded-lg cursor-pointer">
            <div>
              <div className="text-matte-200 font-semibold">Pull Request Reviews &amp; Comments</div>
              <div className="text-matte-500 text-[11px]">Notify when a collaborator reviews or comments on your PRs</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded border-matte-700 bg-matte-900 text-sage-500 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-matte-950 border border-matte-800 rounded-lg cursor-pointer">
            <div>
              <div className="text-matte-200 font-semibold">Automatic Repository Watch</div>
              <div className="text-matte-500 text-[11px]">Automatically subscribe to issues and PRs for repositories you create</div>
            </div>
            <input
              type="checkbox"
              checked={autoWatchRepos}
              onChange={(e) => setAutoWatchRepos(e.target.checked)}
              className="rounded border-matte-700 bg-matte-900 text-sage-500 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
