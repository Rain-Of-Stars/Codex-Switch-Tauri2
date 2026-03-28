import { Cog, DatabaseBackup, FolderOpen, MonitorCog } from "lucide-react";

import type { AppBootstrap } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const titleMap = {
  "/": "工作台",
  "/profiles": "配置管理",
  "/switch": "切换执行",
  "/templates": "模板与连接测试",
  "/backups": "备份与恢复",
  "/settings": "系统设置",
  "/logs": "运行日志 / 关于",
} as const;

interface AppHeaderProps {
  route: keyof typeof titleMap;
  bootstrap: AppBootstrap;
  onOpenDataDirectory: () => void;
  onRouteChange: (route: "/backups" | "/settings" | "/logs") => void;
}

export function AppHeader({
  route,
  bootstrap,
  onOpenDataDirectory,
  onRouteChange,
}: AppHeaderProps) {
  return (
    <header className="rounded-[28px] border border-border bg-white/80 px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-6 sm:py-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="blue">{titleMap[route]}</Badge>
            <Badge variant="slate">V{bootstrap.appMeta.version}</Badge>
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">
            {titleMap[route]}
          </h1>
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="shrink-0">当前激活配置：</span>
            <span
              className="min-w-0 max-w-full break-all font-medium text-slate-600 xl:max-w-[52rem]"
              title={bootstrap.dashboard.activeProfileName ?? "未执行切换"}
            >
              {bootstrap.dashboard.activeProfileName ?? "未执行切换"}
            </span>
            <span className="hidden text-slate-400 sm:inline">•</span>
            <span className="w-full sm:w-auto">
              目标：{bootstrap.dashboard.selectedTargetLabels.join("、") || "未选择"}
            </span>
          </div>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap xl:justify-end">
          <Button
            className="w-full justify-center xl:w-auto"
            onClick={onOpenDataDirectory}
            variant="outline"
          >
            <FolderOpen className="h-4 w-4" />
            数据目录
          </Button>
          <Button
            className="w-full justify-center xl:w-auto"
            onClick={() => onRouteChange("/backups")}
            variant="outline"
          >
            <DatabaseBackup className="h-4 w-4" />
            恢复入口
          </Button>
          <Button
            className="w-full justify-center xl:w-auto"
            onClick={() => onRouteChange("/settings")}
            variant="outline"
          >
            <Cog className="h-4 w-4" />
            设置
          </Button>
          <Button
            className="w-full justify-center xl:w-auto"
            onClick={() => onRouteChange("/logs")}
            variant="secondary"
          >
            <MonitorCog className="h-4 w-4" />
            日志 / 关于
          </Button>
        </div>
      </div>
    </header>
  );
}
