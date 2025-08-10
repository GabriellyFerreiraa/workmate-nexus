import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Size = "xs" | "sm" | "md" | number;

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
}

const sizeToClasses = (size: Size) => {
  if (typeof size === "number") return `h-${size} w-${size}`;
  switch (size) {
    case "xs":
      return "h-6 w-6";
    case "sm":
      return "h-8 w-8";
    case "md":
    default:
      return "h-10 w-10";
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size = "sm", className }) => {
  const initials = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <Avatar className={`${sizeToClasses(size)} ${className || ""}`.trim()}>
      <AvatarImage src={src || undefined} alt={name ? `${name} avatar` : "User avatar"} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
