import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusTileProps {
  label: string;
  value: string;
  meta?: string;
  icon: ReactNode;
  valueClassName?: string;
  valueTitle?: string;
}

export function StatusTile({
  label,
  value,
  meta,
  icon,
  valueClassName,
  valueTitle,
}: StatusTileProps) {
  return (
    <Card className="h-full min-w-0">
      <CardContent className="flex h-full min-w-0 items-start gap-4 p-5">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{icon}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "font-display text-xl font-semibold text-slate-900",
              valueClassName ? null : "truncate",
              valueClassName,
            )}
            title={valueTitle ?? value}
          >
            {value}
          </p>
          {meta ? (
            <p className="break-words text-sm leading-6 text-muted-foreground" title={meta}>
              {meta}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
