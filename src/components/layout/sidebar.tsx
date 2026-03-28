import {
  ArrowLeftRight,
  BookTemplate,
  DatabaseBackup,
  LayoutDashboard,
  Logs,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";

import type { AppRoute } from "@/store/app-shell-store";
import { AppBrandMark } from "@/components/branding/app-brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems: Array<{
  route: AppRoute;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { route: "/", label: "工作台", icon: LayoutDashboard },
  { route: "/profiles", label: "配置管理", icon: SlidersHorizontal },
  { route: "/switch", label: "切换执行", icon: ArrowLeftRight },
  { route: "/templates", label: "模板与连接测试", icon: BookTemplate },
  { route: "/backups", label: "备份与恢复", icon: DatabaseBackup },
  { route: "/settings", label: "系统设置", icon: Settings2 },
  { route: "/logs", label: "运行日志 / 关于", icon: Logs },
];

interface SidebarProps {
  route: AppRoute;
  collapsed: boolean;
  onRouteChange: (route: AppRoute) => void;
  onToggle: () => void;
}

export function Sidebar({
  route,
  collapsed,
  onRouteChange,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-auto w-full shrink-0 flex-col rounded-[28px] border border-border bg-slate-950 px-4 py-5 text-slate-200 shadow-[0_30px_90px_rgba(15,23,42,0.18)] lg:h-full",
        collapsed ? "lg:w-[92px]" : "lg:w-[280px]",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white/6 ring-1 ring-white/10">
            <AppBrandMark className="h-9 w-9" />
          </div>
          <div className={cn("min-w-0", collapsed ? "lg:hidden" : null)}>
            <p className="truncate font-display text-base font-semibold tracking-wide">
              Codex Switch
            </p>
            <p className="truncate text-xs text-slate-400">Tauri Enterprise Console</p>
          </div>
        </div>
        <Button
          className="shrink-0 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          size="icon"
          variant="outline"
          onClick={onToggle}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="mt-5 grid flex-1 gap-1 sm:grid-cols-2 lg:block lg:space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;

          return (
            <button
              key={item.route}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-colors",
                active
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-white/8 hover:text-white",
              )}
              onClick={() => onRouteChange(item.route)}
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", collapsed ? "lg:hidden" : null)}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "rounded-2xl border border-white/8 bg-white/5 p-4",
          collapsed ? "lg:hidden" : null,
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          数据兼容
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          旧数据按 migration version 做兼容导入、升级保护与回退备份。
        </p>
      </div>
    </aside>
  );
}
