"use client";

import { 
  Globe, 
  CheckCircle2, 
  Star, 
  Zap,
} from "lucide-react";

interface ProfileBadgesProps {
  isOpenToWork?: boolean;
  emailVerified?: boolean;
  yearsOfExperience?: number;
  hasWebsite?: boolean;
  hasGithub?: boolean;
}

interface BadgeConfig {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
}

export function ProfileBadges({
  isOpenToWork,
  emailVerified,
  yearsOfExperience = 0,
  hasWebsite,
  hasGithub,
}: ProfileBadgesProps) {
  const badgeConfigs: Record<string, BadgeConfig> = {
    remote: {
      label: "Available for Work",
      icon: <Globe className="h-3 w-3" />,
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-300",
      borderColor: "border-emerald-500/30",
      hoverBg: "hover:bg-emerald-500/30",
    },
    verified: {
      label: "Verified Email",
      icon: <CheckCircle2 className="h-3 w-3" />,
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-300",
      borderColor: "border-blue-500/30",
      hoverBg: "hover:bg-blue-500/30",
    },
    experienced: {
      label: "Top Rated Pro",
      icon: <Star className="h-3 w-3" />,
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-300",
      borderColor: "border-purple-500/30",
      hoverBg: "hover:bg-purple-500/30",
    },
    intermediate: {
      label: "Experienced",
      icon: <Zap className="h-3 w-3" />,
      bgColor: "bg-orange-500/20",
      textColor: "text-orange-300",
      borderColor: "border-orange-500/30",
      hoverBg: "hover:bg-orange-500/30",
    },
    github: {
      label: "GitHub Portfolio",
      icon: <Zap className="h-3 w-3" />,
      bgColor: "bg-cyan-500/20",
      textColor: "text-cyan-300",
      borderColor: "border-cyan-500/30",
      hoverBg: "hover:bg-cyan-500/30",
    },
    website: {
      label: "Portfolio Website",
      icon: <Globe className="h-3 w-3" />,
      bgColor: "bg-pink-500/20",
      textColor: "text-pink-300",
      borderColor: "border-pink-500/30",
      hoverBg: "hover:bg-pink-500/30",
    },
  };

  const badges: Array<{ key: string; config: BadgeConfig }> = [];

  if (isOpenToWork) {
    badges.push({ key: "remote", config: badgeConfigs.remote });
  }

  if (emailVerified) {
    badges.push({ key: "verified", config: badgeConfigs.verified });
  }

  if (yearsOfExperience >= 10) {
    badges.push({ key: "experienced", config: badgeConfigs.experienced });
  } else if (yearsOfExperience >= 5) {
    badges.push({ key: "intermediate", config: badgeConfigs.intermediate });
  }

  if (hasGithub) {
    badges.push({ key: "github", config: badgeConfigs.github });
  }

  if (hasWebsite) {
    badges.push({ key: "website", config: badgeConfigs.website });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(({ key, config }) => (
        <div
          key={key}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor} ${config.hoverBg} transition-colors text-xs font-semibold`}
        >
          {config.icon}
          {config.label}
        </div>
      ))}
    </div>
  );
}

