import { useEffect, useMemo, useState } from "react";
import { CheckCheck, LoaderCircle, PlugZap, ShieldBan, TestTube2 } from "lucide-react";
import { toast } from "sonner";

import { appApi } from "@/lib/tauri-api/app";
import { formatDateTime } from "@/lib/utils";
import { useAppShellStore } from "@/store/app-shell-store";
import type { BatchConnectionTestItem, TemplateKind } from "@/types/domain";
import {
  filterProfilesByStatus,
  resolveBatchSelection,
  summarizeBatchResults,
  type ProfileStatusFilter,
} from "@/features/templates/batch-test-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function TemplateAndTest() {
  const bootstrap = useAppShellStore((state) => state.bootstrap);
  const setBootstrap = useAppShellStore((state) => state.setBootstrap);
  const selectedProfileId = useAppShellStore((state) => state.selectedProfileId);
  const [activeTab, setActiveTab] = useState<TemplateKind>("openAi");
  const [openAiTemplate, setOpenAiTemplate] = useState(bootstrap?.templates.openAi ?? "");
  const [apiKeyTemplate, setApiKeyTemplate] = useState(bootstrap?.templates.apiKey ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [overrideModel, setOverrideModel] = useState("");
  const [disableOnFailure, setDisableOnFailure] = useState(true);
  const [profileFilter, setProfileFilter] = useState<ProfileStatusFilter>("all");
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<BatchConnectionTestItem[]>([]);
  const apiKeyProfiles = useMemo(
    () => (bootstrap?.profiles ?? []).filter((profile) => profile.providerCategory === "apiKey"),
    [bootstrap?.profiles],
  );
  const enabledProfiles = useMemo(() => filterProfilesByStatus(apiKeyProfiles, "enabled"), [apiKeyProfiles]);
  const disabledProfiles = useMemo(() => filterProfilesByStatus(apiKeyProfiles, "disabled"), [apiKeyProfiles]);
  const visibleProfiles = useMemo(
    () => filterProfilesByStatus(apiKeyProfiles, profileFilter),
    [apiKeyProfiles, profileFilter],
  );
  const restorableProfiles = useMemo(
    () => visibleProfiles.filter((profile) => profile.autoDisabled),
    [visibleProfiles],
  );
  const selectedCount = selectedProfileIds.length;
  const resultSummary = useMemo(() => summarizeBatchResults(testResults), [testResults]);

  useEffect(() => {
    if (!bootstrap) {
      return;
    }
    setOpenAiTemplate(bootstrap.templates.openAi);
    setApiKeyTemplate(bootstrap.templates.apiKey);
  }, [bootstrap]);

  useEffect(() => {
    setTestResults([]);
  }, [apiKeyProfiles.length]);

  useEffect(() => {
    if (!apiKeyProfiles.length) {
      setSelectedProfileIds([]);
      return;
    }

    setSelectedProfileIds((current) => {
      return resolveBatchSelection(apiKeyProfiles, current, selectedProfileId);
    });
  }, [apiKeyProfiles, selectedProfileId]);

  const resultByProfileId = useMemo(
    () => new Map(testResults.map((item) => [item.profileId, item])),
    [testResults],
  );

  function toggleProfile(profileId: string, checked: boolean) {
    setSelectedProfileIds((current) => {
      if (checked) {
        return current.includes(profileId) ? current : [...current, profileId];
      }
      return current.filter((item) => item !== profileId);
    });
  }

  function selectAllEnabledProfiles() {
    setSelectedProfileIds(enabledProfiles.map((profile) => profile.id));
  }

  function clearSelection() {
    setSelectedProfileIds([]);
  }

  function restoreDisabledProfiles() {
    if (restorableProfiles.length === 0) {
      return;
    }

    setIsRestoring(true);
    const restoredProfileIds = new Set(restorableProfiles.map((profile) => profile.id));

    void Promise.all(
      restorableProfiles.map((profile) => appApi.setProfileTestDisabled(profile.id, false)),
    )
      .then(() => appApi.loadBootstrap())
      .then((data) => {
        setBootstrap(data);
        setTestResults((current) =>
          current.map((item) =>
            restoredProfileIds.has(item.profileId) ? { ...item, autoDisabled: false } : item,
          ),
        );
        toast.success(`已恢复 ${restorableProfiles.length} 个禁用组合`);
      })
      .catch((error) => toast.error(error.message ?? "批量恢复启用失败"))
      .finally(() => setIsRestoring(false));
  }

  if (!bootstrap) {
    return null;
  }

  return (
    <div className="grid h-full min-h-0 gap-4 overflow-y-auto pr-1 xl:grid-cols-[1.05fr_0.95fr] xl:grid-rows-[minmax(0,1fr)] xl:overflow-hidden">
      <Card className="flex min-h-0 flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>模板编辑器</CardTitle>
          <CardDescription>
            分别维护 OpenAI / APIKEY 模板，APIKEY 模板支持
            {" {base_url} "}、{" {provider_name} "}、{" {provider_key} "}变量。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Tabs
            className="flex min-h-0 flex-1 flex-col"
            onValueChange={(value) => setActiveTab(value as TemplateKind)}
            value={activeTab}
          >
            <TabsList>
              <TabsTrigger value="openAi">OpenAI 模板</TabsTrigger>
              <TabsTrigger value="apiKey">APIKEY 模板</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4 flex min-h-0 flex-1" value="openAi">
              <Textarea
                className="h-full min-h-[420px] flex-1"
                onChange={(event) => setOpenAiTemplate(event.target.value)}
                value={openAiTemplate}
              />
            </TabsContent>
            <TabsContent className="mt-4 flex min-h-0 flex-1" value="apiKey">
              <Textarea
                className="h-full min-h-[420px] flex-1"
                onChange={(event) => setApiKeyTemplate(event.target.value)}
                value={apiKeyTemplate}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={isSaving}
              onClick={() => {
                setIsSaving(true);
                void appApi
                  .saveTemplate({
                    content: activeTab === "openAi" ? openAiTemplate : apiKeyTemplate,
                    kind: activeTab,
                  })
                  .then((data) => {
                    setBootstrap(data);
                    setOpenAiTemplate(data.templates.openAi);
                    setApiKeyTemplate(data.templates.apiKey);
                    toast.success("模板已保存");
                  })
                  .catch((error) => toast.error(error.message ?? "模板保存失败"))
                  .finally(() => setIsSaving(false));
              }}
            >
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              保存模板
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => {
                setIsSaving(true);
                void appApi
                  .resetTemplate(activeTab)
                  .then((data) => {
                    setBootstrap(data);
                    setOpenAiTemplate(data.templates.openAi);
                    setApiKeyTemplate(data.templates.apiKey);
                    toast.success("模板已重置");
                  })
                  .catch((error) => toast.error(error.message ?? "重置失败"))
                  .finally(() => setIsSaving(false));
              }}
              variant="outline"
            >
              重置当前模板
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>连接测试</CardTitle>
          <CardDescription>
            现在支持批量执行 APIKEY 测试，可临时覆盖测试模型，并在失败后自动标记禁用。
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <div className="grid gap-3 rounded-3xl border border-border bg-slate-50/80 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="override-model">测试模型覆盖</Label>
              <Input
                id="override-model"
                onChange={(event) => setOverrideModel(event.target.value)}
                placeholder="留空时使用组合内测试模型或默认 gpt-5.4-mini"
                value={overrideModel}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 md:min-w-[220px]">
              <div>
                <p className="text-sm font-medium text-slate-900">失败自动禁用</p>
                <p className="text-xs text-muted-foreground">失败后会标记组合，避免后续批量重复请求。</p>
              </div>
              <Switch checked={disableOnFailure} onCheckedChange={setDisableOnFailure} />
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-border bg-white/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">批量选择 APIKEY 组合</p>
                <p className="text-sm text-muted-foreground">
                  已选择 {selectedCount} 个，可用 {enabledProfiles.length} 个，禁用 {disabledProfiles.length} 个。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  onValueChange={(value) => setProfileFilter(value as ProfileStatusFilter)}
                  value={profileFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="筛选状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部组合</SelectItem>
                    <SelectItem value="enabled">仅看启用</SelectItem>
                    <SelectItem value="disabled">仅看禁用</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={selectAllEnabledProfiles} type="button" variant="outline">
                  <CheckCheck className="h-4 w-4" />
                  全选启用项
                </Button>
                <Button onClick={clearSelection} type="button" variant="outline">
                  清空选择
                </Button>
                {restorableProfiles.length > 0 ? (
                  <Button
                    disabled={isRestoring}
                    onClick={restoreDisabledProfiles}
                    type="button"
                    variant="outline"
                  >
                    {isRestoring ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    批量恢复禁用项
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
              {visibleProfiles.map((profile) => {
                const latestResult = resultByProfileId.get(profile.id);
                const isChecked = selectedProfileIds.includes(profile.id);
                return (
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                      profile.autoDisabled
                        ? "border-rose-200 bg-rose-50/70"
                        : isChecked
                          ? "border-primary bg-sky-50/60"
                          : "border-border bg-slate-50/60 hover:border-slate-300"
                    }`}
                    key={profile.id}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={profile.autoDisabled}
                      onCheckedChange={(checked) => toggleProfile(profile.id, checked === true)}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{profile.name}</span>
                        {profile.autoDisabled ? <Badge variant="red">已禁用</Badge> : null}
                        {latestResult ? (
                          <Badge
                            variant={
                              latestResult.status === "success"
                                ? "green"
                                : latestResult.status === "warning"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {latestResult.status}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {profile.baseUrl || "使用导入 config.toml 提供 Base URL"}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>测试模型：{profile.testModel || "默认 gpt-5.4-mini"}</span>
                        {profile.autoDisabledAtUtc ? (
                          <span>禁用时间：{formatDateTime(profile.autoDisabledAtUtc)}</span>
                        ) : null}
                      </div>
                      {profile.autoDisabledReason ? (
                        <p className="text-xs text-rose-700">{profile.autoDisabledReason}</p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
              {visibleProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  当前筛选条件下没有可显示的组合。
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={selectedCount === 0 || isTesting}
              onClick={() => {
                if (selectedCount === 0) {
                  return;
                }
                setIsTesting(true);
                void appApi
                  .batchTestProfileConnections({
                    disableOnFailure,
                    overrideModel: overrideModel.trim() || null,
                    profileIds: selectedProfileIds,
                  })
                  .then((response) => {
                    setBootstrap(response.bootstrap);
                    setTestResults(response.results);
                    const disabledCount = response.results.filter((item) => item.autoDisabled).length;
                    if (disabledCount > 0 && disableOnFailure) {
                      toast.warning(`批量测试完成，已有 ${disabledCount} 个组合被自动禁用`);
                    } else {
                      toast.success("批量连接测试已完成");
                    }
                  })
                  .catch((error) => {
                    toast.error(error.message ?? "批量连接测试失败");
                  })
                  .finally(() => setIsTesting(false));
              }}
              type="button"
            >
              {isTesting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <PlugZap className="h-4 w-4" />
              )}
              执行批量连接测试
            </Button>

            {disabledProfiles.length > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <ShieldBan className="h-4 w-4" />
                已禁用组合不会加入本次批量测试，可在配置管理中恢复启用。
              </div>
            ) : null}
          </div>

          {testResults.length > 0 ? (
            <div className="space-y-3 rounded-3xl border border-border bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="green">成功 {resultSummary.success}</Badge>
                <Badge variant="amber">警告 {resultSummary.warning}</Badge>
                <Badge variant="red">失败 {resultSummary.failure}</Badge>
                {resultSummary.autoDisabled > 0 ? (
                  <Badge variant="red">自动禁用 {resultSummary.autoDisabled}</Badge>
                ) : null}
              </div>

              <div className="space-y-3">
                {testResults.map((result) => (
                  <div className="rounded-2xl border border-border bg-white/90 p-4" key={result.profileId}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{result.profileName}</p>
                      <Badge
                        variant={
                          result.status === "success"
                            ? "green"
                            : result.status === "warning"
                              ? "amber"
                              : "red"
                        }
                      >
                        {result.status}
                      </Badge>
                      <Badge variant="blue">{result.model}</Badge>
                      {result.autoDisabled ? <Badge variant="red">已自动禁用</Badge> : null}
                    </div>
                    <p className="mt-3 text-sm text-slate-900">{result.message}</p>
                    <p className="mt-3 break-all text-sm text-muted-foreground">
                      Endpoint：{result.endpoint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <TestTube2 className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
              选择启用的 APIKEY 组合后即可批量测试；如需统一换模型，可在上方输入覆盖值。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
