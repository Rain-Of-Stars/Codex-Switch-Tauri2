import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppHeader } from "@/components/layout/app-header";
import { createBootstrapFixture } from "./test_fixtures";

describe("AppHeader", () => {
  it("顶部操作区使用响应式网格和换行，避免右上角按钮溢出", () => {
    const bootstrap = createBootstrapFixture();
    bootstrap.dashboard.activeProfileName =
      "一个非常长的当前激活配置名称用于验证页头在窄宽度下的换行与折断效果";

    render(
      <AppHeader
        bootstrap={bootstrap}
        onOpenDataDirectory={vi.fn()}
        onRouteChange={vi.fn()}
        route="/"
      />,
    );

    const dataRootButton = screen.getByRole("button", { name: /数据目录/i });
    const actionArea = dataRootButton.parentElement;
    const activeProfile = screen.getByText(
      "一个非常长的当前激活配置名称用于验证页头在窄宽度下的换行与折断效果",
    );

    expect(actionArea?.className).toContain("grid");
    expect(actionArea?.className).toContain("sm:grid-cols-2");
    expect(actionArea?.className).toContain("xl:flex");
    expect(dataRootButton.className).toContain("w-full");
    expect(activeProfile.className).toContain("break-all");
  });
});