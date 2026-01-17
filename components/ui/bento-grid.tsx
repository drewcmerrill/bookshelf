"use client";

import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-5 gap-1.5 sm:gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  onClick,
}: {
  className?: string;
  title?: string | number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg sm:rounded-xl bg-white border border-gray-200 p-2 sm:p-3 cursor-pointer",
        "hover:bg-gray-50 active:bg-gray-100 transition-colors",
        "flex items-center justify-center",
        "text-base sm:text-xl font-semibold text-gray-800",
        "select-none min-h-[44px] sm:min-h-[52px]",
        className
      )}
    >
      <p>{title}</p>
    </div>
  );
}
