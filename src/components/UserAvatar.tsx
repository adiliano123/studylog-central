import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  profileImageUrl?: string | null;
  firstName?: string;
  lastName?: string;
  /** sm=24  md=32  lg=40  xl=64 */
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-xl",
};

/** Deterministic background colour based on initials */
const colours = [
  "bg-blue-500",  "bg-purple-500", "bg-green-500",
  "bg-orange-500","bg-red-500",    "bg-teal-500",
  "bg-pink-500",  "bg-indigo-500",
];

function pickColour(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colours[Math.abs(hash) % colours.length];
}

const UserAvatar = ({
  profileImageUrl,
  firstName = "",
  lastName = "",
  size = "md",
  onClick,
  className,
}: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever the URL changes (e.g. after a new upload)
  const prevUrl = useRef<string | null | undefined>(null);
  if (profileImageUrl !== prevUrl.current) {
    prevUrl.current = profileImageUrl;
    if (imgError) setImgError(false);
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  const colour = pickColour(firstName + lastName);
  const hasImage = !!profileImageUrl && !imgError;

  // Build full URL — if path is relative (/uploads/…) prefix the backend base.
  // Append a cache-busting query param so the browser fetches the latest file
  // instead of serving a cached copy of the previous picture.
  const imgSrc = (() => {
    if (!profileImageUrl) return undefined;
    const base = profileImageUrl.startsWith("http")
      ? profileImageUrl
      : `http://localhost:8080${profileImageUrl}`;
    // Use last segment of path as a stable cache-buster (contains timestamp)
    const bust = profileImageUrl.split("/").pop() ?? Date.now();
    return `${base}?v=${bust}`;
  })();

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        onClick ? "cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all" : "",
        className,
      )}
      onClick={onClick}
    >
      {hasImage && imgSrc && (
        <AvatarImage
          src={imgSrc}
          alt={`${firstName} ${lastName}`}
          onError={() => setImgError(true)}
        />
      )}
      <AvatarFallback className={cn(colour, "text-white font-semibold")}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
