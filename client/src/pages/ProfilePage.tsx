import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  GraduationCap,
  Globe,
  BookMarked,
  Activity,
  Edit3,
  Calendar,
  Star,
  GitBranch,
} from "lucide-react";
import { useUserProfile } from "../hooks/useVCS.js";
import { useRepositoriesList } from "../hooks/useRepositories.js";
import { formatDate } from "../lib/utils.js";
import { Monogram } from "../components/ui/Monogram.js";

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading } = useUserProfile(username);
  const { data: repositories = [] } = useRepositoriesList();

  if (isLoading || !profile) {
    return (
      <div className="p-8 text-center font-mono text-xs text-matte-400">
        Loading developer profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs max-w-5xl">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 bg-matte-900/60 border border-white/[0.08] rounded-2xl space-y-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <Monogram name={profile.username} size="xl" glow status="online" />

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-matte-50">{profile.username}</h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sage-500/10 text-sage-300 border border-sage-500/20 font-sans">
                  Student Developer
                </span>
              </div>
              <p className="text-xs text-matte-300 font-sans leading-relaxed max-w-xl">{profile.headline || profile.bio}</p>
              <div className="text-[11px] text-matte-500 flex items-center gap-1.5 pt-1 font-mono">
                <Calendar size={12} />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-matte-200 rounded-full text-xs font-semibold transition self-start"
          >
            <Edit3 size={13} className="text-sage-400" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Details & Location Row */}
        <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-white/[0.06] text-xs text-matte-400">
          {profile.institution && (
            <div className="flex items-center gap-2">
              <GraduationCap size={14} className="text-matte-500" />
              <span>{profile.institution}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-matte-500" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-matte-500" />
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-sage-400 hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>

        {/* Skills Tag Pills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-matte-500 text-[10px] uppercase tracking-wider mr-1">Skills:</span>
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-matte-300 text-[11px]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Contributions Heatmap Grid Simulation */}
      <div className="p-6 sm:p-8 bg-matte-900/60 border border-white/[0.08] rounded-2xl space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity size={16} className="text-sage-400" />
            <h3 className="text-sm font-bold text-matte-50">Contribution Activity</h3>
          </div>
          <span className="text-matte-400 text-xs">
            {profile.contributionsThisYear} contributions this academic term
          </span>
        </div>

        <div className="p-4 bg-matte-950/80 border border-white/[0.06] rounded-xl overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {Array.from({ length: 52 * 7 }).map((_, i) => {
              const intensity = (i * 7 + 13) % 17;
              const bg =
                intensity > 13
                  ? "bg-emerald-500"
                  : intensity > 9
                  ? "bg-emerald-650 bg-emerald-700"
                  : intensity > 5
                  ? "bg-emerald-900"
                  : "bg-white/[0.04]";
              return <div key={i} className={`w-2.5 h-2.5 rounded-sm ${bg}`} />;
            })}
          </div>
        </div>
      </div>

      {/* Repositories authored */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <BookMarked size={16} className="text-sage-400" />
          <h3 className="text-sm font-bold text-matte-50">Repositories</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-matte-300 border border-white/[0.08]">
            {repositories.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {repositories.map((repo) => (
            <Link
              key={repo.id}
              to={`/repositories/${repo.id}`}
              className="p-5 bg-matte-900/60 hover:bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl transition space-y-2.5 group backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-matte-100 group-hover:text-sage-300 transition text-sm">
                  {repo.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-matte-300">
                  {repo.visibility}
                </span>
              </div>
              <p className="text-xs text-matte-400 font-sans line-clamp-2 leading-relaxed">
                {repo.description || "No description provided."}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-matte-500 pt-1 font-mono">
                <span className="flex items-center gap-1">
                  <GitBranch size={11} />
                  <span>{repo.counts?.branches || 1}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Star size={11} />
                  <span>4</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
