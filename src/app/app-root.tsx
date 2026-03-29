import { lazy, Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import { appApi } from "@/lib/tauri-api/app";
import { useBootstrap } from "@/hooks/use-bootstrap";
import { useAppShellStore, type AppRoute } from "@/store/app-shell-store";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { WindowTitlebar } from "@/components/layout/window-titlebar";

const WorkbenchPage = lazy(() =>
  import("@/pages/workbench-page").then((module) => ({ default: module.WorkbenchPage })),
);
const ProfilesPage = lazy(() =>
  import("@/pages/profiles-page").then((module) => ({ default: module.ProfilesPage })),
);
const SwitchPage = lazy(() =>
  import("@/pages/switch-page").then((module) => ({ default: module.SwitchPage })),
);
const TemplatesPage = lazy(() =>
  import("@/pages/templates-page").then((module) => ({ default: module.TemplatesPage })),
);
const BackupsPage = lazy(() =>
  import("@/pages/backups-page").then((module) => ({ default: module.BackupsPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings-page").then((module) => ({ default: module.SettingsPage })),
);
const LogsPage = lazy(() =>
  import("@/pages/logs-page").then((module) => ({ default: module.LogsPage })),
);

export function AppRoot() {
  return (
    <>
      <MemoryRouter>
        <Shell />
      </MemoryRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}

function Shell() {
  const { bootstrap, bootstrapError, retryBootstrap } = useBootstrap();
  const isBootstrapping = useAppShellStore((state) => state.isBootstrapping);
  const location = useLocation();
  const navigate = useNavigate();

  if (!bootstrap || isBootstrapping) {
    if (bootstrapError && !isBootstrapping) {
      return <BootstrapErrorState errorMessage={bootstrapError} onRetry={retryBootstrap} />;
    }

    return <CenteredLoader message="正在加载 Tauri 控制台…" />;
  }

  const route = (location.pathname || "/") as AppRoute;
  const currentBootstrap = bootstrap;
  const collapsed = currentBootstrap.settings.uiPreferences.sidebarCollapsed;

  async function updateSidebarCollapsed(nextValue: boolean) {
    try {
      const data = await appApi.updateSettings({
        ...currentBootstrap.settings,
        uiPreferences: {
          sidebarCollapsed: nextValue,
        },
      });
      useAppShellStore.getState().setBootstrap(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新侧边栏偏好失败");
    }
  }

  const handleOpenDataDirectory = () => {
    void appApi.openDataDirectory().catch((error) => {
      toast.error(error instanceof Error ? error.message : "打开目录失败");
    });
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[var(--titlebar-height)_minmax(0,1fr)] bg-transparent text-foreground">
      <WindowTitlebar
        bootstrap={currentBootstrap}
        route={route}
      />

      <div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)] gap-4 overflow-hidden p-4">
        <div className="overflow-hidden rounded-xl shadow-sm bg-white border border-slate-200 shadow-slate-200/50">
          <Sidebar
            collapsed={collapsed}
            onRouteChange={(nextRoute) => navigate(nextRoute)}
            onToggle={() => {
              void updateSidebarCollapsed(!collapsed);
            }}
            route={route}
          />
        </div>

        <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
          <div className="rounded-xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden bg-white">
            <AppHeader
              bootstrap={currentBootstrap}
              onOpenDataDirectory={handleOpenDataDirectory}
              onRouteChange={(nextRoute) => navigate(nextRoute)}
              route={route}
            />
          </div>

          <main className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <Suspense fallback={<CenteredLoader message="正在加载页面…" />}>
              <Routes>
                <Route element={<WorkbenchPage />} path="/" />
                <Route element={<ProfilesPage />} path="/profiles" />
                <Route element={<SwitchPage />} path="/switch" />
                <Route element={<TemplatesPage />} path="/templates" />
                <Route element={<BackupsPage />} path="/backups" />
                <Route element={<SettingsPage />} path="/settings" />
                <Route element={<LogsPage />} path="/logs" />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function CenteredLoader({ message }: { message: string }) {
  return (
    <div className="grid h-full place-items-center bg-transparent px-6">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-slate-700">{message}</span>
      </div>
    </div>
  );
}

function BootstrapErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid h-full place-items-center bg-transparent px-6">
      <div className="w-full max-w-xl rounded-xl border border-red-200 bg-red-50/50 px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-red-600">启动初始化失败</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{errorMessage}</p>
        <button
          className="mt-5 inline-flex h-9 items-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500"
          onClick={onRetry}
          type="button"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
