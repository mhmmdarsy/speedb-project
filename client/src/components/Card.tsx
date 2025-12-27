interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  interactive = true,
}: CardProps) {
  const clickableStyles =
    onClick && interactive
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
