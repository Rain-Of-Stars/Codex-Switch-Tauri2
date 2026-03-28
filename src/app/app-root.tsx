import { lazy, Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import { appApi } from "@/lib/tauri-api/app";
import { useBootstrap } from "@/hooks/use-bootstrap";
import { useAppShellStore, type AppRoute } from "@/store/app-shell-store";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";

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

    return (
      <CenteredLoader message="正在加载 Tauri 控制台…" />
    );
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

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4 lg:flex-row">
      <Sidebar
        collapsed={collapsed}
        onRouteChange={(nextRoute) => navigate(nextRoute)}
        onToggle={() => {
          void updateSidebarCollapsed(!collapsed);
        }}
        route={route}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-4">
        <AppHeader
          bootstrap={currentBootstrap}
          onOpenDataDirectory={() => {
            void appApi.openDataDirectory().catch((error) => {
              toast.error(error instanceof Error ? error.message : "打开目录失败");
            });
          }}
          onRouteChange={(nextRoute) => navigate(nextRoute)}
          route={route}
        />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-[28px] border border-border bg-white/55 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.04)] sm:p-4 lg:p-5">
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
  );
}

function CenteredLoader({ message }: { message: string }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/75 px-5 py-4 shadow-lg">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
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
    <div className="grid h-full place-items-center">
      <div className="w-full max-w-xl rounded-[28px] border border-red-200 bg-white px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-medium text-red-700">启动初始化失败</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{errorMessage}</p>
        <button
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          onClick={onRetry}
          type="button"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
