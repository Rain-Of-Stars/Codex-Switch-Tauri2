import brandMarkUrl from "@/assets/codex-switch-mark.svg";
import { cn } from "@/lib/utils";

interface AppBrandMarkProps {
  className?: string;
}

export function AppBrandMark({ className }: AppBrandMarkProps) {
  return (
    <img
      alt="Codex Switch"
      className={cn("h-full w-full object-contain", className)}
      draggable={false}
      src={brandMarkUrl}
    />
  );
}
