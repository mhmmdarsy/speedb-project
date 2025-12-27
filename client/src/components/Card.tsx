import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  onClick,
}: CardProps) {
  const clickableStyles = onClick
    ? "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95"
    : "";

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}