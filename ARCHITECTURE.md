# ARCHITECTURE — nexus-agent-harness

> **版本**: 2.0 | **日期**: 2026-04-07  
> **定位**: 基于 VS Code + GitHub Copilot 的 Multi-Agent Harness，覆盖 SDLC 全链路  
> **核心链路**: JIRA Feature → 设计文档 → Confluence → JIRA Stories → 写代码 → PR → Merge

---

## 1. 系统愿景

```
┌──────────────────────────────────────────────────────────────────┐
│                    VS Code + GitHub Copilot                      │
│                                                                  │
│  用户 ──▶ /feature-e2e  /xcode-build  /task  /jira  ...          │
│              │             │      │          │                    │
│              ▼             ▼      ▼          ▼                    │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              nexus-agent-harness                          │     │
│  │                                                          │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │     │
│  │  │ mac-native-  │  │  mac-sdlc-   │  │ mac-common-   │  │     │
│  │  │ dev-plugin   │  │ agent-plugin │  │ agent-plugin  │  │     │
│  │  │              │  │              │  │               │  │     │
│  │  │ Build/Test   │  │ Architecture │  │ Git / JIRA    │  │     │
│  │  │ Interop      │  │ Feature Plan │  │ Analysis      │  │     │
│  │  │ Unit Test    │  │ Code Review  │  │ Copilot Asset │  │     │
│  │  │ Channels     │  │ Security     │  │               │  │     │
│  │  │ Dependencies │  │ Bug Fix      │  │               │  │     │
│  │  │ CI           │  │ Test Plan    │  │               │  │     │
│  │  └──────────────┘  └──────────────┘  └───────────────┘  │     │
│  │                                                          │     │
│  │  ┌───────────────────┐                                   │     │
│  │  │ mac-release-      │                                   │     │
│  │  │ management-plugin │                                   │     │
│  │  └───────────────────┘                                   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                             │
│              │    MCP Servers      │                             │
│              │ GitHub · Atlassian  │                             │
│              └─────────────────────┘                             │
└──────────────────────────────────────────────────────────────────┘

                         │
                         ▼
          ┌──────────────────────────┐
          │   target repository      │
          │  example-org/app-repo   │
          │                         │
          │                          │
          │  native client languages │
          │  native build tool · dependency manager │
          │  CI system · artifact repository   │
          │  XCTest · mock framework         │
          └──────────────────────────┘
```

---

## 2. 目标项目画像

| 属性 | 值 |
|------|-----|
| **语言** | native client languages and system integration |
| **构建** | Generic native build workflow |
| **平台** | supported desktop OS targets |
| **依赖** | Dependency management, artifact publishing, and external binary inputs |
| **测试** | Unit tests, integration tests, result bundles, and quality reports |
| **CI/CD** | CI workflow, local build script, artifact publishing |
| **关键域** | Integration channels, desktop UX, protocol integration, input/display behavior |
| **设计文档** | `Docs/` 和 `docs/` 目录下 Markdown 设计文档 |

---

## 3. Plugin 架构

### 3.0 仓库技术资产

本仓库发布 NexusAgent 的 VS Code Copilot agent plugin marketplace。面向用户的使用入口保留在 `README.md`；技术架构、资产结构、维护约定和验证命令集中记录在本文档和 `DEV-GUIDE.md`。

| 资产 | 路径 | 说明 |
|------|------|------|
| Marketplace manifest | `.github/plugin/marketplace.json` | 注册可安装的 NexusAgent plugins |
| Repository guidance | `.github/copilot-instructions.md` | 仓库级 Copilot 指令 |
| Plugin assets | `plugins/` | 可安装 plugins，每个 plugin 独立维护 commands、agents、skills、instructions |
| Evaluation assets | `eval/` | prompt 和 workflow eval suites，以及 mock provider/tooling |
| Maintainer guide | `DEV-GUIDE.md` | marketplace 维护、plugin 创建、发布前检查 |
| Setup notes | `SETUP.md` | 本地验证、依赖和 Phase 0 检查说明 |
| Architecture docs | `ARCHITECTURE.md`, `CAPABILITY_ARCHITECTURE.md` | 系统架构、能力架构和支持矩阵 |

维护者添加、删除或重命名 plugin 时，需要同步更新 marketplace manifest、plugin README、plugin AGENTS.md、eval 路径和能力文档。发布前运行：

```text
npm run phase0
```

该命令会执行资产验证、运行时依赖检查和 eval provider smoke test。

### 3.1 Plugin 清单

| Plugin | 职责 |
|--------|------|
| **nexus-common-agent-plugin** | 跨 plugin 共享能力: Git 操作、JIRA 管理、通用分析、Copilot Asset 工程 |
| **nexus-sdlc-agent-plugin** | SDLC 全链路编排: 架构设计、需求规划、开发协调、测试策略、安全审计、Bug 修复 |
| **nexus-macos-native-plugin** | Desktop-native workflows: build/test, interop, integration channels, CI pipeline |
| **nexus-release-management-plugin** | Release 管理: JIRA-GitHub 关联审计、完成度报告、Confluence 发布 |
| **nexus-cloud-troubleshooting-plugin** | Cloud/Kubernetes/Docker 运维排障: 告警分流、日志指标分析、基础设施诊断 |

### 3.2 目录结构

```
nexus-agent-harness/
├── .github/
│   ├── plugin/
│   │   ├── marketplace.json                     ← 注册全部 plugins
│   │   └── mcp.sample.json                      ← GitHub + Atlassian MCP 配置模板
│   └── copilot-instructions.md                  ← 全局指令
├── README.md
├── DEV-GUIDE.md
├── CODEOWNERS
├── ARCHITECTURE.md                              ← 本文件
├── plugins/
│   ├── nexus-common-agent-plugin/                 ← 共享基础
│   │   ├── agents/
│   │   │   ├── analyzer.agent.md
│   │   │   ├── article-publisher.agent.md
│   │   │   ├── git-ops.agent.md
│   │   │   ├── jira-manager.agent.md
│   │   │   └── prompt-engineer.agent.md
│   │   ├── commands/
│   │   │   ├── analyze.md
│   │   │   ├── article.md
│   │   │   ├── copilot-asset.md
│   │   │   ├── git.md
│   │   │   └── jira.md
│   │   ├── skills/
│   │   │   ├── analysis-framework/
│   │   │   ├── copilot-asset-validation/
│   │   │   ├── copilot-asset-workflow/
│   │   │   ├── git-workflow/
│   │   │   ├── prompt-techniques/
│   │   │   └── promptfoo-evals/
│   │   ├── instructions/
│   │   ├── agent-assets/
│   │   └── AGENTS.md
│   │
│   ├── nexus-sdlc-agent-plugin/                   ← SDLC 编排
│   │   ├── agents/
│   │   │   ├── architect.agent.md
│   │   │   ├── bugfix.agent.md
│   │   │   ├── dev-coordinator.agent.md
│   │   │   ├── developer.agent.md
│   │   │   ├── feature-planner.agent.md
│   │   │   ├── feature-testplan-author.agent.md
│   │   │   ├── router.agent.md
│   │   │   ├── security-engineer.agent.md
│   │   │   └── spec-author.agent.md
│   │   ├── commands/
│   │   │   ├── agentsmd.md
│   │   │   ├── architecture.md
│   │   │   ├── architecturemd.md
│   │   │   ├── bugfix.md
│   │   │   ├── code-review.md
│   │   │   ├── feature-e2e.md
│   │   │   ├── feature-plan.md
│   │   │   ├── feature-spec.md
│   │   │   ├── feature-testplan.md
│   │   │   ├── help.md
│   │   │   ├── project-init.md
│   │   │   ├── security.md
│   │   │   ├── start.md
│   │   │   ├── task.md
│   │   │   └── test.md
│   │   ├── skills/
│   │   │   ├── adr-generator/
│   │   │   ├── c4-diagrams/
│   │   │   ├── code-review-checklist/
│   │   │   ├── code-submission/
│   │   │   ├── epic-story-workflow/
│   │   │   ├── jira-context-discovery/
│   │   │   ├── repository-context-discovery/
│   │   │   ├── security-code-review/
│   │   │   ├── test-strategy/
│   │   │   └── threat-modeling/
│   │   ├── instructions/
│   │   ├── agent-assets/
│   │   └── AGENTS.md
│   │
│   ├── nexus-macos-native-plugin/                  ← desktop OS 原生开发
│   │   ├── .github/plugin/plugin.json
│   │   ├── .mcp.json
│   │   ├── AGENTS.md
│   │   ├── README.md
│   │   ├── agents/
│   │   │   ├── build-engineer.agent.md
│   │   │   └── vc-developer.agent.md
│   │   ├── commands/
│   │   │   ├── xcode-build.md
│   │   │   ├── xcode-test.md
│   │   │   └── vc-scaffold.md
│   │   ├── skills/
│   │   │   ├── xcode-build/
│   │   │   ├── xcode-test-runner/
│   │   │   ├── xcode-build-error-diagnosis/
│   │   │   ├── objc-swift-interop/
│   │   │   ├── xctest-patterns/
│   │   │   ├── macos-api-patterns/
│   │   │   ├── virtual-channel-sdk/
│   │   │   ├── virtual-channel-scaffold/
│   │   │   ├── cocoapods-management/
│   │   │   ├── jenkins-ci/
│   │   │   ├── crash-log-analysis/
│   │   │   ├── sonarqube-quality/
│   │   │   └── hdx-design-document/
│   │   └── instructions/
│   │       └── objc-swift-coding-conventions.instructions.md
│   │
│   └── nexus-release-management-plugin/
│       ├── agents/
│       ├── commands/
│       ├── config/
│       └── skills/
│
└── eval/                                        ← 评估框架
    ├── providers/
    └── tests/
        ├── nexus-common-agent-plugin/
        ├── nexus-sdlc-agent-plugin/
        └── nexus-macos-native-plugin/
```

---

## 4. 端到端交付链路（E2E Delivery Path）

### 4.1 完整链路图

```
用户输入: /feature-e2e jira=APP-12345
              │
              ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │ Phase 1: 设计文档                                               │
 │                                                                 │
 │  spec-author                                                    │
 │  ├─ 读取 JIRA Feature 需求（通过 Atlassian MCP）                │
 │  ├─ 分析需求质量（analysis-framework skill）                     │
 │  ├─ 撰写设计文档 → 保存到 specs/{JIRA-ID}-{Name}.spec.md       │
 │  ├─ 生成架构图 + 时序图                                         │
 │  └─ ⚠️ 显示 handoff 按钮                                       │
 │         [发布到 Confluence]  [创建 JIRA 任务]                    │
 └──────────────────────┬──────────────────────────────────────────┘
                        │ 点击 "发布到 Confluence"
                        ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │ Phase 2: 发布设计文档到 Confluence                               │
 │                                                                 │
 │  article-publisher（nexus-common-agent-plugin）                    │
 │  ├─ 读取 spec markdown 文件                                     │
 │  ├─ 转换为 Confluence 格式                                      │
 │  ├─ 通过 Atlassian MCP 创建/更新 Confluence 页面                │
 │  └─ ⚠️ 显示 handoff 按钮                                       │
 │         [返回 spec-author]  [创建 JIRA 任务]                     │
 └──────────────────────┬──────────────────────────────────────────┘
                        │ 点击 "创建 JIRA 任务"
                        ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │ Phase 3: 拆解 JIRA Stories                                      │
 │                                                                 │
 │  feature-planner                                                │
 │  ├─ 从 spec 文档提取工作项                                      │
 │  ├─ 创建 JIRA 层级: Epic → Stories（含 AC、估点）               │
 │  ├─ handoff → jira-manager 批量创建 tickets                     │
 │  └─ ⚠️ 显示 handoff 按钮                                       │
 │         [开始实现]                                               │
 └──────────────────────┬──────────────────────────────────────────┘
                        │ 点击 "开始实现"
                        ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │ Phase 4: 逐 Story 实现（循环）                                   │
 │                                                                 │
 │  dev-coordinator                                                │
 │  ├─ 选择 Story → JIRA 设为 "In Progress"                       │
 │  ├─ 创建 Git 分支 → 创建 task file                              │
 │  └─ ⚠️ 点击 "Start coding task"                                │
 │         │                                                       │
 │         ▼                                                       │
 │  developer                                                      │
 │  ├─ 读取 task file → 分析代码 → 制定实现计划                    │
 │  ├─ 实现代码 + 写单元测试                                       │
 │  ├─ 自检（code-review-checklist）                                │
 │  └─ 自动 handoff → security-engineer                            │
 │         │                                                       │
 │         ▼                                                       │
 │  security-engineer                                              │
 │  ├─ OWASP/CWE 安全审查                                         │
 │  ├─ PASS → 自动 handoff 回 developer                           │
 │  └─ FAIL → 要求修复后重新审查                                   │
 │         │                                                       │
 │         ▼                                                       │
 │  developer（Completion）                                         │
 │  ├─ code-submission skill: commit → push → 创建 PR              │
 │  └─ ⚠️ 点击 "return to coordinator"                            │
 │         │                                                       │
 │         ▼                                                       │
 │  dev-coordinator                                                │
 │  ├─ 验证 PR 状态 → merge                                       │
 │  ├─ JIRA 状态 → "Ready for Test"                                │
 │  └─ 如果是 Epic → 自动选下一个 Story → 循环 Phase 4             │
 └─────────────────────────────────────────────────────────────────┘
```

### 4.2 Agent 协作矩阵

| 阶段 | 执行 Agent | 所属 Plugin | 输入 | 输出 | 用户操作 |
|------|-----------|-------------|------|------|---------|
| 1. 写设计文档 | `spec-author` | mac-sdlc | JIRA Feature ID | `specs/*.spec.md` | 点 handoff |
| 2. 发布 Confluence | `article-publisher` | mac-common | spec markdown | Confluence 页面 | 点 handoff |
| 3. 拆 JIRA Stories | `feature-planner` → `jira-manager` | mac-sdlc → mac-common | spec + JIRA | Epic + Stories | 点 handoff |
| 4a. 编排开发 | `dev-coordinator` | mac-sdlc | Story ID | branch + task file | 点 "Start coding" |
| 4b. 写代码 | `developer` | mac-sdlc | task file | 代码 + 测试 | 自动 |
| 4c. 安全审查 | `security-engineer` | mac-sdlc | changed files | PASS/FAIL | 自动 |
| 4d. 提交 PR | `developer` (code-submission) | mac-sdlc | 代码 | PR | 点 "return" |
| 4e. Merge | `dev-coordinator` | mac-sdlc | PR | merged + JIRA updated | 如 Epic 自动循环 |

### 4.3 用户交互次数估算

| 场景 | 点击次数 | 说明 |
|------|---------|------|
| 单个 Story | ~6 次 | spec → publish → plan → start → return → merge |
| Epic (3 Stories) | ~12 次 | spec → publish → plan + 3×(start → return → merge) |
| Epic (5 Stories) | ~18 次 | spec → publish → plan + 5×(start → return → merge) |

> **注**: VS Code Copilot Agent 的 handoff 机制要求用户点击确认按钮才能切换 agent。这是平台限制，不是 harness 的问题。每次点击无需输入文字，纯确认操作。

### 4.4 E2E Command Roadmap

The harness plans four end-to-end commands, each covering a distinct SDLC scenario from trigger to closure.

#### 4.4.1 Command Overview

| Command | Scope | Agent Chain | User Clicks | Status |
|---------|-------|-------------|-------------|--------|
| `/feature-e2e` | JIRA Feature → Design Spec → Confluence → Story Breakdown → Code per Story → Security Review → PR → Merge | spec-author → article-publisher → feature-planner → jira-manager → dev-coordinator → developer → security-engineer | ~6-18 | **Done** |
| `/epic-e2e` | Create Epic → Search JIRA for similar tickets as reference → Define scope, functionality & task decomposition in Epic description | analyzer → feature-planner → jira-manager | ~2-4 | **Not Started** |
| `/bugfix-e2e` | JIRA Bug → Root Cause Analysis → Hypothesis Validation → Fix Implementation → Security Review → PR → Merge → JIRA Close | bugfix → dev-coordinator → developer → security-engineer → git-ops | ~5-8 | **Not Started** (existing `/bugfix` covers investigation only) |
| `/autotest-e2e` | JIRA Story/Feature → Test Plan → Test Case Generation → Test Code Implementation → Run & Validate → Coverage Report | feature-testplan-author → developer → (build-engineer) | ~4-8 | **Not Started** |

#### 4.4.2 Command Details

**`/feature-e2e`** — Full feature delivery (Done)

```
Input:  JIRA Feature ID
Phase 1: spec-author       -> specs/*.spec.md (design document)
Phase 2: article-publisher  -> Confluence page (publish)
Phase 3: feature-planner    -> Epic + Stories (JIRA hierarchy)
Phase 4: dev-coordinator    -> Branch + Code + PR (loop per Story)
Output: All Stories merged, JIRA all Done
```

**`/epic-e2e`** — Epic creation and grooming (no coding, no Story creation)

```
Input:  Feature description or JIRA Feature ID
Phase 1: analyzer           -> Search JIRA for similar existing tickets as reference
Phase 2: feature-planner    -> Define Epic scope, functionality, boundaries,
                               and task decomposition (all written into Epic description)
Phase 3: jira-manager       -> Create/update Epic in JIRA with rich description
Output: Well-defined Epic in JIRA with detailed description, ready for /feature-e2e
```

Difference from `/feature-e2e`: focuses purely on Epic-level definition. No Story creation, no design doc, no Confluence, no coding, no PR. Task decomposition is captured in the Epic description only — actual Story breakdown happens later when `/feature-e2e` picks up this Epic.

**`/bugfix-e2e`** — Full bug lifecycle from ticket to closure

```
Input:  JIRA Bug ID + optional logs
Phase 1: bugfix             -> Read bug context, form 3-5 hypotheses, investigate code
Phase 2: bugfix             -> Confirm root cause, generate fix plan
Phase 3: dev-coordinator    -> Create bugfix branch + task file
Phase 4: developer          -> Implement fix + regression tests
Phase 5: security-engineer  -> Security review
Phase 6: git-ops            -> Commit + PR + Merge
Phase 7: jira-manager       -> Bug -> Done, update Fix Version
Output: Bug fix merged, JIRA closed
```

Difference from existing `/bugfix`: current `/bugfix` stops at "investigation + handoff to dev-coordinator". `/bugfix-e2e` chains the entire coding, review, PR, and JIRA closure flow.

**`/autotest-e2e`** — From requirements to runnable tests

```
Input:  JIRA Story/Feature ID or spec file
Phase 1: feature-testplan-author -> Test plan (functional + non-functional cases)
Phase 2: developer               -> Implement test code (unit + integration)
Phase 3: build-engineer           -> Run tests, collect xcresult
Phase 4: developer               -> Analyze failures, fix/adjust
Phase 5: (optional) article-publisher -> Publish test report to Confluence
Output: Test code committed, coverage targets met
```

#### 4.4.3 Agent Reuse Matrix

| Existing Agent | feature-e2e | epic-e2e | bugfix-e2e | autotest-e2e |
|----------------|:-----------:|:--------:|:----------:|:------------:|
| spec-author | Yes | — | — | — |
| article-publisher | Yes | — | — | Optional |
| feature-planner | Yes | Yes | — | — |
| feature-testplan-author | — | — | — | Yes |
| analyzer | — | Yes | — | — |
| bugfix | — | — | Yes | — |
| dev-coordinator | Yes | — | Yes | — |
| developer | Yes | — | Yes | Yes |
| security-engineer | Yes | — | Yes | — |
| jira-manager | Yes | Yes | Yes | — |
| git-ops | Yes | — | Yes | Yes |
| build-engineer | — | — | — | Yes |

> All agents listed above already exist. The remaining work is primarily 3 new command `.md` files plus orchestration logic (especially the grooming flow in `/epic-e2e` and the test-run integration in `/autotest-e2e`).

---

## 5. 资产总览

### 5.1 统计概览

| 类别 | 合计 | common | sdlc | native-dev | release-mgmt | cloud-troubleshoot |
|------|------|--------|------|------------|--------------|--------------------|
| **Agents** | 22 | 5 | 9 | 2 | 2 | 4 |
| **Commands** | 31 | 5 | 15 | 3 | 4 | 4 |
| **Skills** | 41 | 6 | 10 | 13 | 2 | 10 |
| **Instructions** | 13 | 7 | 5 | 1 | — | — |

### 5.2 全部 Agents（22 个）

| Agent | Plugin | 描述 |
|-------|--------|------|
| `analyzer` | mac-common | 通用分析 agent，处理任意输入（配置、日志、spec、截图），使用 MECE 框架路由到专业分析 |
| `article-publisher` | mac-common | Confluence 文章创建与发布，支持图表、表格和富文本格式，通过 Atlassian MCP |
| `git-ops` | mac-common | Git 操作专家 — 分支管理、commit、PR 创建，遵循团队约定 |
| `jira-manager` | mac-common | JIRA 条目管理 — 创建、更新、列出单个 ticket（bug、story、task、epic） |
| `prompt-engineer` | mac-common | Copilot 资产的 Prompt/Context 工程师 — 指令层级设计、上下文工程、eval 门禁 |
| `architect` | mac-sdlc | 多专业架构师 — 方案设计、安全架构、系统文档，自动路由到合适的专业方向 |
| `bugfix` | mac-sdlc | Bug 调查与修复工作流 — 分析 JIRA bug、建立假设、调查代码、交接给 developer 实现 |
| `dev-coordinator` | mac-sdlc | 开发工作流编排 — JIRA 上下文、Git 分支、task 文件、Epic 编排、PR 完成与 merge |
| `developer` | mac-sdlc | 高级软件工程师 — 接收 task 文件、实现代码、编写测试、返回状态给 coordinator |
| `feature-planner` | mac-sdlc | 从技术 spec 创建 JIRA 层级结构（ENG → Epic → Story），含 AC 和估点 |
| `feature-testplan-author` | mac-sdlc | 高级 QA 架构师 — 从 feature spec 生成功能性/非功能性测试计划 |
| `router` | mac-sdlc | 智能路由器 — 分析用户输入和上下文，路由到最合适的 prompt/agent |
| `security-engineer` | mac-sdlc | 安全工程师 — 代码/配置/日志深度安全分析，应用 OWASP、NIST、CIS 标准 |
| `spec-author` | mac-sdlc | 高级软件架构师 — 将需求转化为完整的、可交付的 feature specification |
| `build-engineer` | mac-native-dev | native build tool 构建与测试编排 — xcodebuild 调用、构建错误诊断、dependency manager、CI 管道 |
| `vc-developer` | mac-native-dev | extension channel 开发专家 — integration channel 创建、SDK 集成、协议处理、测试模式 |
| `jira-github-report-analyzer` | mac-release-mgmt | 报告编排 — 查询 JIRA 完成项、关联 GitHub commits/PR、发布到 Confluence |
| `release-manager` | mac-release-mgmt | Release 追踪 — 定位 ENG 下所有变更、映射 Git 仓库、审计 Fix Version |
| `sre` | cloud-troubleshoot | Kubernetes 集群诊断、日志收集和事件调查 |
| `cloud-alert-triage` | cloud-troubleshoot | 告警分流与 RCA，关联指标、日志和服务上下文 |
| `service-troubleshoot` | cloud-troubleshoot | 微服务故障排查，覆盖崩溃、延迟、错误和依赖链 |
| `cloud-infra-troubleshoot` | cloud-troubleshoot | 云基础设施、节点、网络、存储和容器运行时排查 |

### 5.3 全部 Slash Commands（31 个）

| Command | Plugin | 描述 |
|---------|--------|------|
| `/analyze` | mac-common | 使用 MECE 框架分析技术输入（配置、日志、spec、截图） |
| `/article` | mac-common | 创建或更新 Confluence 文章，支持图表和富文本 |
| `/copilot-asset` | mac-common | 创建、审查或验证 Copilot 资产（agents、prompts、instructions、skills） |
| `/git` | mac-common | Git 操作 — 建分支、checkout、commit、push、生成 PR 摘要 |
| `/jira` | mac-common | 创建、更新或列出 JIRA 条目（bug、story、task、epic） |
| `/agentsmd` | mac-sdlc | 生成或更新 AGENTS.md — architect 扫描仓库，prompt-engineer 审查 AI-prompt 质量 |
| `/architecture` | mac-sdlc | 创建架构制品 — 图表、ADR、威胁模型、设计文档 |
| `/architecturemd` | mac-sdlc | 生成或更新仓库根目录的 ARCHITECTURE.md |
| `/bugfix` | mac-sdlc | 从 JIRA ticket 调查和修复 bug，含根因分析 |
| `/code-review` | mac-sdlc | 审查代码变更的质量、安全性和正确性 |
| `/feature-e2e` | mac-sdlc | 端到端 Feature 交付 — JIRA → 设计文档 → Confluence → Story 拆解 → 实现 → PR |
| `/feature-plan` | mac-sdlc | 从 spec 创建或更新 JIRA 层级（ENG → Epic → Story） |
| `/feature-spec` | mac-sdlc | 从多种来源创建 feature specification markdown 文件 |
| `/feature-testplan` | mac-sdlc | 从 feature spec 生成完整测试计划，输出到 Confluence |
| `/help` | mac-sdlc | 所有可用 prompts 和 agents 的快速参考及用法示例 |
| `/project-init` | mac-sdlc | 初始化仓库 — JIRA 上下文、feature 分支、AGENTS.md、ARCHITECTURE.md、PR |
| `/security` | mac-sdlc | 深度安全分析 — 代码/基础设施/配置/日志，使用 OWASP/NIST/CIS 标准 |
| `/start` | mac-sdlc | 智能入口 — 分析请求并路由到最佳专业 prompt/agent |
| `/task` | mac-sdlc | 启动开发任务 — 编排 JIRA 上下文、Git 设置、委派给 developer |
| `/test` | mac-sdlc | 定义测试策略 — 测试类型、覆盖率目标、测试用例推荐 |
| `/xcode-build` | mac-native-dev | 构建 target repository native build tool 项目 — 全量/增量/指定 target |
| `/xcode-test` | mac-native-dev | 运行 XCTest — 全量测试、指定 class 或 method |
| `/vc-scaffold` | mac-native-dev | 脚手架生成新的 extension channel 实现 |
| `/confluence-publish-report` | mac-release-mgmt | 将 JIRA 完成报告发布到 Confluence |
| `/github-jira-commit-linkage` | mac-release-mgmt | 查找关联 JIRA key 的 GitHub commits 和 PR |
| `/jira-completed-by-assignee` | mac-release-mgmt | 按 assignee 查询 JIRA 已完成条目 |
| `/jira-epic-enrichment` | mac-release-mgmt | 为 JIRA issue 列表补充关联 Epic 信息 |
| `/sre` | cloud-troubleshoot | 连接 Kubernetes 集群并收集运维诊断信息 |
| `/cloud-alert-triage` | cloud-troubleshoot | 从告警入口进行分流、证据收集和 RCA |
| `/service-troubleshoot` | cloud-troubleshoot | 排查微服务崩溃、延迟、错误和连接问题 |
| `/cloud-infra-troubleshoot` | cloud-troubleshoot | 排查云基础设施、节点、网络、存储和容器问题 |

### 5.4 Skills 分布

#### nexus-common-agent-plugin（6 个）

| Skill | 用途 |
|-------|------|
| `analysis-framework` | MECE 分析框架 |
| `copilot-asset-validation` | Copilot 资产验证规则 |
| `copilot-asset-workflow` | Copilot 资产创建/更新工作流 |
| `git-workflow` | Git 分支与 PR 工作流约定 |
| `prompt-techniques` | Prompt 工程技术参考 |
| `promptfoo-evals` | 基于 promptfoo 的评估框架 |

#### nexus-sdlc-agent-plugin（10 个）

| Skill | 用途 |
|-------|------|
| `adr-generator` | Architecture Decision Record 生成 |
| `c4-diagrams` | C4 架构图生成 |
| `code-review-checklist` | 代码审查检查清单 |
| `code-submission` | 代码提交（commit → push → PR）流程 |
| `epic-story-workflow` | Epic/Story 层级创建与管理 |
| `jira-context-discovery` | JIRA 上下文自动发现 |
| `repository-context-discovery` | 仓库结构与技术栈自动发现 |
| `security-code-review` | 安全代码审查（OWASP/CWE） |
| `test-strategy` | 测试策略制定 |
| `threat-modeling` | 威胁建模（STRIDE） |

#### nexus-macos-native-plugin（13 个）

| Skill | 用途 |
|-------|------|
| `xcode-build` | xcodebuild 命令封装与输出解析 |
| `xcode-test-runner` | XCTest 运行、xcresult 解析、coverage 报告 |
| `xcode-build-error-diagnosis` | 构建错误分类与修复建议 |
| `objc-swift-interop` | native language ↔ native UI 互操作模式 |
| `xctest-patterns` | XCTest + mock framework + HTTP stubbing framework 测试模式 |
| `macos-api-patterns` | desktop OS API 使用模式（AppKit, native UI, Keychain 等） |
| `virtual-channel-sdk` | extension channel SDK 架构与实现模式 |
| `virtual-channel-scaffold` | channel 脚手架代码生成 |
| `cocoapods-management` | dependency manager 依赖管理与故障排查 |
| `jenkins-ci` | CI system CI pipeline 与 Build.sh 集成 |
| `crash-log-analysis` | Crash log 分析与 symbolication |
| `sonarqube-quality` | SonarQube 代码质量门禁 |
| `hdx-design-document` | platform 设计文档模板 |

#### nexus-cloud-troubleshooting-plugin（10 个）

| Skill | 用途 |
|-------|------|
| `k8s-pod-diagnostics` | Pod 状态、日志、退出码、资源和探针诊断 |
| `k8s-cluster-diagnostics` | 集群节点、控制面、资源压力和系统组件诊断 |
| `docker-container-diagnostics` | Docker/containerd/Podman 容器运行时诊断 |
| `prometheus-alert-analyzer` | Prometheus/Grafana 告警指标分析 |
| `loki-log-analyzer` | Grafana Loki 日志模式和请求链路分析 |
| `network-connectivity-diagnostics` | DNS、Ingress、Service Mesh、网络策略和负载均衡诊断 |
| `cloud-health-checker` | 多云区域状态和服务健康检查 |
| `service-dependency-tracer` | Kubernetes 服务依赖链追踪 |
| `splunk-query-builder` | 日志平台查询语句生成和统计分析 |
| `splunk-connectivity-test` | 日志平台 MCP 连通性测试 |

---

## 6. 未来计划（Roadmap）

### 6.1 Slack 聊天记录集成

| 属性 | 说明 |
|------|------|
| **动机** | 许多 Feature 的核心讨论、决策和上下文散落在 Slack 频道中，当前仅依赖 JIRA ticket 获取需求会丢失关键信息 |
| **目标** | 通过 Slack MCP Server 读取指定频道/线程的聊天记录，自动提取 feature 相关讨论要点 |
| **典型场景** | `/feature-spec` 或 `/feature-e2e` 时，agent 自动从 Slack 频道拉取相关讨论，作为 spec 编写的补充输入 |
| **实现路径** | 1) 部署 Slack MCP Server（OAuth Bot Token）→ 2) 在 `.mcp.json` 中注册 → 3) 扩展 `spec-author` 和 `feature-planner` agent 支持 Slack 上下文 |
| **预期能力** | 按频道/用户/时间范围搜索消息、读取线程回复、提取讨论摘要与决策记录 |
| **优先级** | P1 |

### 6.2 Splunk Cloud 统计数据查阅

| 属性 | 说明 |
|------|------|
| **动机** | 团队使用 Splunk Cloud（`observability.example.com`）监控产品运行时数据和用户行为统计，bug 分析和 feature 优先级排序需要查阅这些数据 |
| **目标** | 通过 MCP Server 查询 Splunk 仪表盘和搜索结果，将统计数据直接注入 agent 工作流 |
| **典型场景** | `/bugfix` 时查询错误频率和影响范围；`/feature-spec` 时获取功能使用率数据作为需求验证依据 |
| **实现路径** | 1) 开发 Splunk MCP Server（Splunk REST API + Token Auth）→ 2) 支持 saved searches / dashboards 查询 → 3) 扩展 `analyzer` 和 `bugfix` agent |
| **预期能力** | 执行 SPL 查询、读取 saved search 结果、获取 dashboard panel 数据、按时间范围过滤 |
| **优先级** | P2 |

### 6.3 data analytics platform 仪表盘数据查阅

| 属性 | 说明 |
|------|------|
| **动机** | 团队在 data analytics platform（`data-platform.example.com`）上维护数据分析仪表盘，包含产品 KPI、用户行为分析等关键指标 |
| **目标** | 通过 MCP Server 读取 data analytics platform SQL 仪表盘数据，为 feature 规划和质量分析提供数据支撑 |
| **典型场景** | `/feature-plan` 时引用用户活跃度和功能采纳率；`/analyze` 时获取性能基线数据 |
| **实现路径** | 1) 开发 data analytics platform MCP Server（data analytics platform REST API / SQL Warehouse）→ 2) 支持 dashboard 查询和 SQL 执行 → 3) 集成到 `analyzer` 和 `feature-planner` agent |
| **预期能力** | 读取 dashboard 内容、执行 SQL 查询、获取表/视图数据、返回结构化结果 |
| **优先级** | P2 |

### 6.4 Crash Monitoring 智能审阅

| 属性 | 说明 |
|------|------|
| **动机** | target repository 使用 crash monitoring 进行崩溃监控，开发者经常需要手动查阅 crash monitoring issue 页面。希望直接粘贴 crash monitoring URL，agent 即可自动获取并分析 crash 信息 |
| **目标** | 通过 crash monitoring MCP Server 读取 crash event 详情，自动完成 symbolication、堆栈分析、根因推测 |
| **典型场景** | 用户粘贴 crash monitoring issue URL → agent 自动获取 crash 堆栈、设备信息、breadcrumbs → 结合代码库分析根因 → 输出修复建议 |
| **实现路径** | 1) 部署 crash monitoring MCP Server（crash monitoring Web API + Auth Token）→ 2) 支持 issue/event 读取 → 3) 与 `crash-log-analysis` skill 和 `bugfix` agent 深度集成 |
| **预期能力** | 按 URL 获取 issue 详情、读取 event 堆栈和 breadcrumbs、查询 issue 趋势、关联 JIRA ticket |
| **优先级** | P1 |

### 6.5 Roadmap 总览

```
2026 Q2                          2026 Q3                          2026 Q4
─────────────────────────────────────────────────────────────────────────────
▶ Slack MCP Server               ▶ Splunk MCP Server              ▶ 全链路数据增强
  - OAuth Bot 部署                 - SPL 查询支持                    - /feature-e2e 自动
  - spec-author 集成               - Dashboard 数据读取               拉取 Slack + Splunk
  - feature-planner 集成           - analyzer/bugfix 集成             + data analytics platform 数据

▶ crash monitoring MCP Server              ▶ data analytics platform MCP Server
  - Issue/Event API 对接           - SQL Warehouse 查询
  - crash-log-analysis 集成        - Dashboard 读取
  - bugfix agent 集成              - feature-planner 集成
```

### 6.6 MCP Server 扩展预览

未来 `.mcp.json` 将扩展为：

```jsonc
{
  "servers": {
    "github": { /* 已有 */ },
    "atlassian": { /* 已有 */ },
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/sse",
      "headers": { "Authorization": "Bearer ${SLACK_BOT_TOKEN}" }
    },
    "splunk": {
      "type": "http",
      "url": "https://observability.example.com/mcp/sse",
      "headers": { "Authorization": "Bearer ${SPLUNK_TOKEN}" }
    },
    "databricks": {
      "type": "http",
      "url": "https://data-platform.example.com/mcp/sse",
      "headers": { "Authorization": "Bearer ${DATABRICKS_TOKEN}" }
    },
    "sentry": {
      "type": "http",
      "url": "https://sentry.io/api/mcp/sse",
      "headers": { "Authorization": "Bearer ${SENTRY_AUTH_TOKEN}" }
    }
  }
}
```

---

## 7. Plugin 效能评估体系（Eval Methodology）

### 7.1 评估目标

每个 plugin 向系统注入了大量 agent 定义、skill 知识、playbook 流程和约束指令。评估体系要回答的核心问题：

> **有了这个 plugin 后，AI 在特定场景中的表现是否可验证地优于没有 plugin 时？**

### 7.2 当前评估基础设施

框架基于 [promptfoo](https://www.promptfoo.dev)，已覆盖部分 plugin：

| Plugin | 测试套件数 | 覆盖状态 |
|--------|----------|---------|
| `nexus-common-agent-plugin` | 7 | 已覆盖 |
| `nexus-sdlc-agent-plugin` | 15 | 已覆盖 |
| `nexus-cloud-troubleshooting-plugin` | 0 | 待建设 |
| `nexus-macos-native-plugin` | 0 | 待建设 |
| `nexus-release-management-plugin` | 0 | 待建设 |

### 7.3 评估代码详解 —— 端到端执行流程

> 本节完整拆解 `eval/` 下每个文件的职责、调用关系和数据流向，帮助理解"跑一次 eval 时代码里到底发生了什么"。

#### 7.3.1 整体调用链

```
用户执行:
  promptfoo eval -c tests/nexus-common-agent-plugin/jira-command
         |
         | 1. 读取 promptfooconfig.yaml
         v
+---------------------------+
|   promptfooconfig.yaml    |  定义: prompt loader、LLM provider、测试文件
+---------------------------+
         |
         | 2. 加载 prompt（用户指令）
         v
+---------------------------+
| copilot-prompt-loader.js  |  读 plugin 的 commands/*.md，替换 ${input:var} 占位符
+---------------------------+
         |
         | 3. prompt 文本传给 provider
         v
+---------------------------+
| generic-llm-provider.js    |  核心 provider，分两个角色:
|                           |    A) Agent 执行器 — 构建 system prompt + agentic loop
|                           |    B) Grader 评分器 — LLM-as-Judge 对输出打分
+---------------------------+
    |           |
    |           | 3a. 构建增强 system prompt
    |           v
    |   +---------------------------+
    |   | agent-context-loader.js   |  自动发现 plugin workspace 中的:
    |   |                           |    - AGENTS.md (workspace 概览)
    |   |                           |    - instructions/*.instructions.md (全局规则)
    |   |                           |    - agents/*.agent.md (agent 定义)
    |   |                           |    - agent-assets/*.playbook.md (流程手册)
    |   |                           |    - skills/*/SKILL.md (领域知识)
    |   +---------------------------+
    |
    | 3b. 调用 LLM API（带 tools 定义）
    v
+---------------------------+    LLM 返回 tool_calls
|   Generic LLM API        | ----------------------+
+---------------------------+                       |
                                                    v
                                    +-------------------------------+
                                    | Mock Tool 路由 (provider 内部) |
                                    |                               |
                                    |  tool name 以 mcp_atlassian_  |
                                    |  开头? ----YES----> atlassian-mock-tool-impl.js
                                    |     |                         |
                                    |     NO                        |
                                    |     |                         |
                                    |  tool name 以 repo_ 或 git_  |
                                    |  开头? ----YES----> general-tools-api.js
                                    +-------------------------------+
                                                    |
                                            mock 结果返回给 LLM
                                            (循环直到 LLM 不再调用 tool)
                                                    |
                                                    v
                                            最终 LLM 输出文本
                                                    |
         +------------------------------------------+
         |
         | 4. promptfoo 对输出执行 assertion
         v
+---------------------------+
|   LLM Rubric Assertion    |  用同一个 LLM（provider 的 Grader 模式）
|                           |  按 tests.yaml 中的 rubric 标准打分
|                           |  threshold=1.0 → PASS / FAIL
+---------------------------+
         |
         v
    评估结果 (JSON / SQLite)
    promptfoo view -y 查看
```

#### 7.3.2 文件清单与职责

```
eval/
  providers/
    copilot-prompt-loader.js       <-- [1] Prompt 加载器
    generic-llm-provider.js         <-- [2] LLM Provider（Agent + Grader）
    package.json                   <-- openai + js-yaml 依赖
    tools/
      agent-context-loader.js      <-- [3] Plugin Context 自动发现
      atlassian/
        jira-tools-spec.js         <-- [4a] JIRA tool 定义（8 个 function）
        confluence-tools-spec.js   <-- [4b] Confluence tool 定义（7 个 function）
        atlassian-mock-tool-impl.js <-- [5a] Atlassian mock 响应
      general/
        general-tools-spec.js      <-- [4c] Repo/Git tool 定义（13 个 function）
        general-tools-api.js       <-- [5b] Repo/Git mock 响应
    dataset/
      mock-jira-data.js            <-- [6a] JIRA mock 数据集
      mock-confluence-data.js      <-- [6b] Confluence mock 数据集
      mock-confluence-page-*.json  <-- [6c] Confluence 页面 fixture
      AGENTS.md                    <-- [6d] mock 仓库的 AGENTS.md
  tests/
    nexus-common-agent-plugin/
      run-all-evals.sh             <-- 批量执行脚本
      analyze-command/
        promptfooconfig.yaml       <-- 测试配置
        tests.yaml                 <-- 测试用例
      jira-command/
        ...
    nexus-sdlc-agent-plugin/
      run-all-evals.sh
      task-command/
        ...
```

#### 7.3.3 第 1 步: Prompt 加载器 (`copilot-prompt-loader.js`)

**职责**：读取 plugin 的 slash command `.md` 文件，将 `${input:varName}` 占位符替换为 test vars。

**代码逻辑**：

```
输入: vars = { __promptFile: "nexus-common-agent-plugin/commands/jira.md",
               action: "create", jira: "APP-1234" }

1. 解析 __promptFile，读取 plugins/nexus-common-agent-plugin/commands/jira.md
2. 用正则 /\$\{input:(\w+)(:[^}]*)?\}/g 找到所有占位符
   例如: ${input:action:The JIRA action} → 替换为 "create"
         ${input:jira:The JIRA key}     → 替换为 "APP-1234"
3. 如果 vars 中有 __userPrompt，也做同样的替换并拼接
4. 返回: 替换后的完整 prompt 文本
```

**关键点**：这个 loader 让 promptfoo 可以直接复用 VS Code Copilot 格式的 `.md` prompt 文件，无需另外维护测试专用 prompt。

#### 7.3.4 第 2 步: LLM Provider (`generic-llm-provider.js`)

Provider 是整个评估的核心，它同时扮演两个角色：

**角色 A — Agent 执行器**（处理普通 prompt）：

```
1. 根据环境变量自动选择 OpenAI-compatible LLM 后端:
  - EVAL_PROVIDER=openai/deepseek/openrouter/gemini/ollama
  - 如果未显式配置 provider，则按可用 API key 推断
  - 都没有 → 报错并提示设置方法

2. 从 __promptFile 路径推断 plugin workspace 根目录:
   例如: "nexus-sdlc-agent-plugin/commands/task.md"
         → workspaceRoot = "plugins/nexus-sdlc-agent-plugin"

3. 调用 agent-context-loader.js 加载 plugin 的全部 context

4. 构建 enhanced system prompt:
   基础 system prompt（你是 AI coding assistant，有 MCP tools...）
     + copilot-instructions.md 内容
     + AGENTS.md 内容
     + 全局 instructions（applyTo: "**"）
     + 引用的 agent 定义
     + 引用的 playbook
     + 引用的 skills

5. 注册 28 个 mock tools（8 JIRA + 7 Confluence + 13 Repo/Git）

6. 调用 LLM:
   messages = [{ system: enhanced_prompt }, { user: prompt_text }]
   tools = 28 个 function 定义

7. 进入 Agentic Loop（关键！）:
   while (LLM 返回 tool_calls) {
     for 每个 tool_call:
       - 解析 function name + arguments
       - 路由到 mock: general-tools-api.js 或 atlassian-mock-tool-impl.js
       - 把 mock 响应作为 tool role message 加入 messages
     再次调用 LLM（带完整 messages 历史）
     累加 token usage
   }

8. 返回: { output: 最终文本, tokenUsage: 累计 token }
```

**角色 B — Grader 评分器**（处理 rubric prompt）：

```
当 prompt 内容包含 "You are grading output according to a user-specified rubric":
  → 跳过 agent 模式
  → 直接调 LLM API（无 tools，无 context）
  → 返回评分结果

这是 promptfoo 的 llm-rubric assertion 内部机制:
  它把"被评分的 output + rubric 标准"打包成一个 grading prompt，
  送给同一个 provider 来打分。
```

#### 7.3.5 第 3 步: Plugin Context 自动发现 (`agent-context-loader.js`)

**职责**：模拟 VS Code Copilot 运行时的 context 注入行为 — 根据 prompt 引用关系，自动找到并加载 plugin 的所有相关资产。

**发现逻辑**：

```
loadAgentContext(prompt, workspaceRoot):

1. 从 workspaceRoot 向上查找 AGENTS.md 确定 plugin 根目录

2. 加载全局 context:
   - AGENTS.md → context.agentsMd
   - copilot-instructions.md → context.copilotInstructions

3. 加载 instructions:
   - 扫描 instructions/*.instructions.md
   - 解析 YAML frontmatter 获取 applyTo
   - 只加载 applyTo: "**" 的全局 instructions
   - 跳过 applyTo: "**/*.agent.md" 等角色专用指令

4. 加载 agents:
   - 从 prompt 的 YAML frontmatter 中提取 agent: <name>
   - 只加载被引用的 agent（不是全部 agent）
   - 解析 agent 的 name/description/tools/handoffs

5. 加载 playbooks（跟随 agent）:
   - 先找 agent-assets/<agent-name>/ 目录下的 *.playbook.md
   - 找不到则找 agent-assets/<agent-name>.playbook.md

6. 加载 skills:
   - 从 prompt body 中用正则提取 ../skills/<name>/SKILL.md 引用
   - 只加载被引用的 skills（不是全部 skill）
   - 如果 prompt 没引用任何 skill，则加载全部

buildEnhancedSystemPrompt(basePrompt, context, includeFlags):
  → 按顺序拼接: base + copilot-instructions + AGENTS.md
                 + instructions + agents + skills + playbooks
  → 每种资产用 markdown section 格式化（## Instructions, ## Agents, 等）
```

**这就是为什么评估能反映真实 VS Code 行为** — 它按照同样的优先级和加载规则注入 context。

#### 7.3.6 第 4 步: Mock Tool 定义（tool specs）

LLM 通过 OpenAI function calling 格式调用工具。三个 spec 文件定义了工具签名：

| 文件 | 工具数 | 类别 |
|------|--------|------|
| `jira-tools-spec.js` | 8 | JIRA CRUD + 搜索 + 状态流转 |
| `confluence-tools-spec.js` | 7 | Confluence 页面 CRUD + 搜索 |
| `general-tools-spec.js` | 13 | 仓库文件操作 + Git 分支/commit/push |

**工具命名约定**：

- JIRA/Confluence: `mcp_atlassian_*` — 模拟 Atlassian MCP Server
- 仓库: `repo_*` — 模拟 VS Code 文件系统
- Git: `git_*` — 模拟 VS Code Git 扩展

**完整工具清单**：

```
JIRA (8):
  mcp_atlassian_getAccessibleAtlassianResources  获取可用资源
  mcp_atlassian_getJiraIssue / getIssue          读取 Issue 详情
  mcp_atlassian_search                           JQL 搜索
  mcp_atlassian_fetch                            按 ARI 获取
  mcp_atlassian_addComment                       添加评论
  mcp_atlassian_transitionJiraIssue              状态流转
  mcp_atlassian_createJiraIssue                  创建 Issue

Confluence (7):
  mcp_atlassian_createContent                    创建页面（REST 格式）
  mcp_atlassian_createConfluencePage             创建页面（简化）
  mcp_atlassian_updateConfluencePage             更新页面
  mcp_atlassian_getConfluencePage                读取页面
  mcp_atlassian_getConfluenceSpaces              列出空间
  mcp_atlassian_searchConfluenceUsingCql         CQL 搜索
  mcp_atlassian_getPagesInConfluenceSpace        列出空间页面

Repo/Git (13):
  repo_listDir / readFile / search / fileExists  文件读取
  repo_createDirectory / writeFile / editFile    文件写入
  git_status / currentBranch                     Git 状态
  git_createBranch / checkoutBranch              分支管理
  git_commit / git_push                          提交推送
```

#### 7.3.7 第 5 步: Mock Tool 实现（mock implementations）

Mock 不调用任何外部服务，只返回预设的假数据，使测试可以离线运行。

**`atlassian-mock-tool-impl.js`** — 路由逻辑：

```
1. 从 prompt 中正则匹配 mcp_atlassian_<toolName>
2. 从 prompt/vars 中提取 JIRA ID (如 APP-1234)
3. 从 dataset/mock-jira-data.js 获取对应 mock 数据
4. switch(toolName) 返回不同响应:
   - getJiraIssue → 返回 issue 详情 JSON
   - createJiraIssue → 生成随机 issue key，返回创建结果
   - transitionJiraIssue → 返回 { success: true, newStatus }
   - createConfluencePage → 返回 page ID + URL
   - 等等...
```

**`general-tools-api.js`** — 模拟了一个 **完整的 React 微前端项目**：

```
1. 内建了一个虚拟文件系统 (mockData.files):
   /workspace/sample-ui-module/
     app/package.json          frontend framework + state management
     app/src/App.js            主组件
     app/src/Routes.js         路由配置
     app/src/features/         Feature 组件 + 样式 + 测试
     app/src/data/             state store + API
     test/cypress/             E2E 测试
     .github/tasks/            Task 文件（动态生成）
     AGENTS.md / ARCHITECTURE.md

2. 模拟 repo 操作:
   - repo_listDir → 返回目录结构
   - repo_readFile → 返回文件内容（支持行范围）
   - repo_search → 根据 query + glob 匹配文件
   - repo_fileExists → 检查路径是否在 mock 中
   - repo_writeFile/editFile → 返回 { success: true }

3. 模拟 Git 操作:
   - git_currentBranch → 返回 "master"
   - git_createBranch → 返回 { success, branchName: "feature/APP-1234-..." }
   - git_commit → 返回 { success, commit: "abc1234" }
   - git_push → 返回 { success, pushed: true }
```

**这意味着**: LLM 在 eval 中可以"读取代码"、"创建分支"、"写 task 文件"、"提交代码" — 全部是假的，但对 LLM 来说看起来是真实的。这让我们可以端到端测试 agent 的行为逻辑，而不需要真实的 Git 仓库或 JIRA 实例。

#### 7.3.8 第 6 步: 测试用例与评分 (tests.yaml)

每个测试套件由两个文件组成：

**`promptfooconfig.yaml`** — 把各组件连接起来：

```yaml
description: 'Task Prompt Evaluation'
prompts:
  - file://../../../providers/copilot-prompt-loader.js    # [1] Prompt Loader
defaultTest:
  vars:
    __promptFile: nexus-sdlc-agent-plugin/commands/task.md # 指向哪个 slash command
  options:
    provider: file://../../../providers/generic-llm-provider.js  # [2] LLM Provider
providers:
  - file://../../../providers/generic-llm-provider.js
tests: file://tests.yaml                                    # 测试用例文件
```

**`tests.yaml`** — 定义输入变量 + 评分标准：

```yaml
- description: "Create JIRA story with full context"
  vars:
    action: create
    jira: APP-1234
    __userPrompt: "Create a story for implementing auth module"
  assert:
    - type: llm-rubric
      value: |
        Score 1.0 if ALL of the following are true:
        - Correctly called mcp_atlassian_createJiraIssue
        - Used appropriate project key
        - Included meaningful summary and description
        - Applied AI-Generated label
        Score 0.0 if any criterion is not met.
      threshold: 1
```

**评分机制**：

```
1. Agent 执行完毕，得到 output 文本
2. promptfoo 把 output + rubric 打包成一个新 prompt:
   "You are grading output according to a user-specified rubric..."
   + 被评估的 output
   + rubric 标准
3. 这个 grading prompt 发给同一个 provider
4. Provider 检测到 grading prompt → 走 callModelForGrading() 路径
  （直接调 grader model，不带 tools，不带 agent context）
5. LLM 返回评分: pass (1.0) 或 fail (0.0)
6. 与 threshold 比较: score >= 1.0 → PASS，否则 → FAIL
```

#### 7.3.9 批量执行 (`run-all-evals.sh`)

```bash
# 用法:
./run-all-evals.sh                          # 全部套件，每套间隔 60s
./run-all-evals.sh 30                       # 全部套件，间隔 30s
./run-all-evals.sh 0 task-command jira-command  # 指定套件，无间隔

# 逻辑:
1. 自动扫描当前目录下所有包含 promptfooconfig.yaml 的子目录
2. 如果指定了套件名（第2个参数起），则只跑匹配的
3. 对每个套件执行: promptfoo eval -c <suite-path>
4. 套件之间等待指定秒数（防止 API rate limiting）
```

#### 7.3.10 Provider 自动检测（已改造）

当前 provider 支持 agent model 和 grader model 分开配置。`generic-llm-provider.js` 通过 `model-client.js` 创建两个 client：

```
agent model:
  EVAL_PROVIDER / EVAL_MODEL / EVAL_API_KEY / EVAL_BASE_URL

grader model:
  GRADER_PROVIDER / GRADER_MODEL / GRADER_API_KEY / GRADER_BASE_URL
  未配置时回退到 EVAL_* 配置
```

支持的 provider family：

| Provider | 默认模型/端点 | 说明 |
|----------|---------------|------|
| `openai` | `gpt-4o` | OpenAI 直连或 OpenAI-compatible endpoint |
| `deepseek` | `deepseek-chat` | DeepSeek OpenAI-compatible API |
| `openrouter` | `openai/gpt-4o-mini` | OpenRouter API |
| `gemini` | `gemini-2.0-flash` | Gemini OpenAI-compatible endpoint |
| `ollama` | `llama3.1`, `http://localhost:11434/v1` | 本地模型，默认 API key 为 `ollama` |

**环境变量一览**：

| 变量 | 说明 |
|------|------|
| `EVAL_PROVIDER` | agent 执行模型 provider |
| `EVAL_MODEL` | agent 执行模型名 |
| `EVAL_API_KEY` | agent 执行模型 API key |
| `EVAL_BASE_URL` | agent 执行模型 OpenAI-compatible base URL |
| `GRADER_PROVIDER` | grader 评分模型 provider，可独立于 agent model |
| `GRADER_MODEL` | grader 评分模型名 |
| `GRADER_API_KEY` | grader 评分模型 API key |
| `GRADER_BASE_URL` | grader 评分模型 OpenAI-compatible base URL |

### 7.4 五维评估模型

#### 维度 1: A/B 对比测试（有 Plugin vs 无 Plugin）

最核心的评估维度。对同一任务准备两组测试、对比结果差异：

- **Baseline 组（无 context）**：仅给 LLM 原始用户指令，不注入任何 agent/skill/playbook/instruction
- **Enhanced 组（有 plugin context）**：注入完整 plugin context（`agent-context-loader.js` 输出）

**实现方式**：在 provider 中增加 `skip_context` 开关：

```yaml
# A/B test example in tests.yaml
- description: "WITH plugin context"
  vars:
    __userPrompt: "Connect to staging Kubernetes cluster and check pod health"
    skip_context: false
  assert:
    - type: llm-rubric
      value: |
        Score 1.0 if: uses correct kubectl commands, follows read-only policy,
        produces structured investigation report, masks sensitive data
      threshold: 1

- description: "WITHOUT plugin context (baseline)"
  vars:
    __userPrompt: "Connect to staging Kubernetes cluster and check pod health"
    skip_context: true
  assert:
    - type: llm-rubric
      value: |
        Score 1.0 if: uses correct kubectl commands, follows read-only policy,
        produces structured investigation report, masks sensitive data
      threshold: 1
```

**对比指标**：

| 指标 | 说明 | 计算方式 |
|------|------|---------|
| 任务完成率 | 通过 rubric 判定 pass 的比例 | pass_count / total_count |
| 回答质量分 | LLM-as-Judge 1-5 分 | 两组均值差 |
| 约束遵循率 | 是否遵循安全/只读/格式约束 | 违规次数对比 |
| 幻觉率 | 编造不存在命令/API/参数的次数 | 幻觉实例 / 总输出 |

#### 维度 2: Token 效率

Plugin context 注入会增加 prompt token，但如果能减少 agentic loop 轮次和避免 trial-and-error，总体 token 可能更少：

```
效率比 = (质量得分_enhanced / tokens_enhanced) / (质量得分_baseline / tokens_baseline)
```

| 情况 | 效率比 | 解读 |
|------|--------|------|
| > 1.0 | Plugin 提升了 token 效率 | context 帮助模型更快到位 |
| = 1.0 | 持平 | context 增加的 prompt token 被节省的 completion token 抵消 |
| < 1.0 | Plugin 降低了 token 效率 | context 可能过大或与任务无关 |

**数据来源**：`generic-llm-provider.js` 已在返回值中携带 `tokenUsage`（prompt_tokens + completion_tokens + tool_call_tokens），可直接使用。

#### 维度 3: Tool Call 精准度

衡量 agent 是否"一次到位"还是反复调错工具：

| 指标 | 公式 | 优秀范围 |
|------|------|---------|
| 有效调用率 | 成功 tool calls / 总 tool calls | > 90% |
| 首轮正确率 | 第一轮 tool call 就对的比例 | > 80% |
| Loop 轮数 | Agentic loop 总迭代次数 | 越少越好 |
| 参数准确率 | Tool call 参数无需修正的比例 | > 95% |

**数据来源**：在 provider 的 agentic loop 中记录每轮的 `tool_calls[]`（name + args + result），通过 `type: javascript` assertion 计算。

#### 维度 4: 场景覆盖度矩阵

为每个 plugin 定义一组 **核心场景（Core Scenarios）**，分别在 Baseline 和 Enhanced 模式下测试：

```
+-----+-------------------------------+-----------+-----------+
| #   | 场景                          | Enhanced  | Baseline  |
+-----+-------------------------------+-----------+-----------+
| S1  | JIRA Story 创建               | PASS      | PASS      |
| S2  | Feature Spec 生成             | PASS      | PARTIAL   |
| S3  | 安全代码审查                   | PASS      | FAIL      |
| S4  | Kubernetes CrashLoop 诊断            | PASS      | PARTIAL   |
| S5  | native build tool 构建错误修复             | PASS      | FAIL      |
| S6  | 多服务依赖链追踪               | PASS      | FAIL      |
+-----+-------------------------------+-----------+-----------+
Plugin Lift = 改善场景数 / 总场景数 = 4/6 = 67%
```

**建议核心场景数量**：

| Plugin | 建议场景数 | 重点领域 |
|--------|----------|---------|
| nexus-common-agent-plugin | 10-15 | JIRA CRUD、Git 操作、通用分析、Confluence 发布 |
| nexus-sdlc-agent-plugin | 15-20 | Spec 生成、Story 拆解、代码实现、安全审查、PR 流程 |
| nexus-cloud-troubleshooting-plugin | 10-15 | Kubernetes 诊断、告警分流、Docker 排障、日志分析、依赖追踪 |
| nexus-macos-native-plugin | 8-12 | native build tool 构建、测试运行、构建错误诊断、channel 脚手架 |
| nexus-release-management-plugin | 5-8 | JIRA 完成查询、Commit 关联、Confluence 报告发布 |

#### 维度 5: 回归检测（Prompt Regression）

每次修改 plugin 后运行对比，确保改动不引入退化：

```bash
# 记录 baseline（修改前）
promptfoo eval -c tests/<plugin>/<command> --output /tmp/baseline.json

# 修改 plugin 后跑同一套
promptfoo eval -c tests/<plugin>/<command> --output /tmp/current.json

# 自动比较差异
promptfoo diff /tmp/baseline.json /tmp/current.json
```

**回归判定规则**：

| 变化 | 判定 | 动作 |
|------|------|------|
| 全部 PASS → 全部 PASS | 安全 | 可合入 |
| 质量分提升 ≥ 0.5 | 改善 | 可合入 |
| 任何 PASS → FAIL | 回归 | 阻断合入，修复后重测 |
| 质量分下降 > 0.3 | 退化 | 复查改动，确认是否预期 |

### 7.5 评估数据采集架构

```
+-------------------+     +-------------------+     +-------------------+
|   Test Suite      |     |   promptfoo       |     |   Results Store   |
|   (tests.yaml)    |---->|   eval engine     |---->|   (JSON / SQLite) |
+-------------------+     +-------------------+     +-------------------+
                                  |                         |
                                  v                         v
                          +---------------+         +-------------------+
                          | Provider      |         | promptfoo view    |
                          | (generic LLM) |         | (Browser viewer)  |
                          +---------------+
                                  |
                          Collects per test:
                          - response content
                          - token usage (prompt / completion / tool)
                          - tool calls (name, args, success/fail)
                          - loop iterations count
                          - wall-clock time
```

### 7.6 评估成熟度路线图

```
Level 0 (现状)            Level 1                   Level 2                   Level 3
------------------        ------------------        ------------------        ------------------
手工烟雾测试               自动化正确性测试           A/B 效能对比               CI 门禁 + 趋势看板
- 人工跑 prompt            - promptfoo 套件           - skip_context A/B         - PR 触发回归检测
- 目测输出                   覆盖全部 plugin           - 五维指标自动采集          - 历史趋势对比
- 无量化指标               - LLM rubric pass/fail     - token 效率对比           - 质量分晴雨表
                           - 跑 run-all-evals.sh      - 场景覆盖矩阵             - 阻断门禁规则
```

**当前状态**：common-plugin 和 sdlc-plugin 处于 Level 1，其余 plugin 处于 Level 0。

**近期目标**：全部 plugin 达到 Level 1，common / sdlc 推进到 Level 2。

### 7.7 本地快速运行评估测试

#### 前置条件

```bash
# 1. 全局安装 promptfoo
npm install -g promptfoo@latest

# 2. 安装 provider 依赖
cd eval/providers && npm install && cd ../..
```

#### 配置 LLM Provider

评估需要调用真实 LLM 来执行 agent 任务和 LLM-as-Judge 评分。当前通过 `generic-llm-provider.js` 支持多个 provider family，并允许 agent model 与 grader model 分开配置。

| Provider | 示例模型 | 关键环境变量 | 状态 |
|----------|----------|--------------|------|
| OpenAI | `gpt-4o` | `EVAL_PROVIDER=openai`, `EVAL_API_KEY` | 已支持 |
| DeepSeek | `deepseek-chat` | `EVAL_PROVIDER=deepseek`, `DEEPSEEK_API_KEY` | 已支持 |
| OpenRouter | `openai/gpt-4o-mini` | `EVAL_PROVIDER=openrouter`, `OPENROUTER_API_KEY` | 已支持 |
| Gemini | `gemini-2.0-flash` | `EVAL_PROVIDER=gemini`, `GEMINI_API_KEY` | 已支持 |
| Ollama | `llama3.1` | `EVAL_PROVIDER=ollama` | 已支持 |

设置环境变量示例：

```bash
# agent model
export EVAL_PROVIDER="openai"
export EVAL_MODEL="gpt-4o"
export EVAL_API_KEY="<your-agent-model-key>"

# optional grader model; unset values fall back to EVAL_*
export GRADER_PROVIDER="openai"
export GRADER_MODEL="gpt-4o-mini"
export GRADER_API_KEY="<your-grader-model-key>"
```

> **为什么需要 API Key？**
>
> promptfoo 评估框架在本地直接调用 LLM API 来模拟 Copilot 的 agent 行为。
> 与在 VS Code Chat 中使用 plugin 不同（VS Code 使用 GitHub Copilot 的内置模型，无需额外 key），
> 本地评估需要独立的 LLM 端点来：
> 1. **执行 agent 任务** — 注入 plugin context + mock tools，运行 agentic tool-call loop
> 2. **LLM-as-Judge 评分** — 用同一模型对输出质量进行 rubric 打分
>
> 这意味着你需要有权访问至少一个支持 function calling 的 LLM 服务。
> 如果单独配置 `GRADER_*`，评分会使用 grader model；否则评分回退到 agent model。

#### 运行单个测试套件

```bash
# 进入 eval 目录
cd eval

# 跑 analyze 命令的测试（1 个 test case，最快）
promptfoo eval -c tests/nexus-common-agent-plugin/analyze-command

# 跑 task 命令的测试
promptfoo eval -c tests/nexus-sdlc-agent-plugin/task-command

# 跑 jira 命令的测试
promptfoo eval -c tests/nexus-common-agent-plugin/jira-command
```

#### 运行整个 Plugin 的全部测试

```bash
# common plugin（7 个套件）
bash tests/nexus-common-agent-plugin/run-all-evals.sh

# sdlc plugin（15 个套件）
bash tests/nexus-sdlc-agent-plugin/run-all-evals.sh
```

#### 查看测试结果

```bash
# 在浏览器中打开结果看板
promptfoo view -y
```

浏览器看板中可以查看：
- 每个 test case 的 **PASS / FAIL** 状态
- LLM rubric **评分详情**与评分理由
- 完整的 **prompt / response** 内容
- **Token 用量**统计（prompt + completion + tool call）

#### 测试套件结构

每个测试套件包含两个文件：

```
tests/<plugin-name>/<command-name>/
    promptfooconfig.yaml   <-- 配置: provider、prompt loader、default vars
    tests.yaml             <-- 测试用例: vars + llm-rubric assertions
```

`promptfooconfig.yaml` 示例：

```yaml
description: 'Analyze Prompt Evaluation'
prompts:
  - file://../../../providers/copilot-prompt-loader.js
defaultTest:
  vars:
    __promptFile: nexus-common-agent-plugin/commands/analyze.md
    tool_choice: none
  options:
    provider: file://../../../providers/generic-llm-provider.js
providers:
  - file://../../../providers/generic-llm-provider.js
tests: file://tests.yaml
```

`tests.yaml` 示例：

```yaml
- vars:
    type: logs
    focus: authentication failures
  assert:
    - type: llm-rubric
      value: |
        Score 1.0 if ALL of the following are true:
        - Acts as an analyzer agent
        - Correctly handles log analysis with focus on authentication failures
      threshold: 1
```

### 7.8 Provider 扩展状态

当前评估框架只保留 `generic-llm-provider.js`。promptfoo 测试统一引用 generic provider，实际模型由环境变量决定。

| 能力 | 状态 | 说明 |
|------|------|------|
| Agent/Grader 分离 | 已支持 | agent 使用 `EVAL_*`，grader 使用 `GRADER_*`，未配置时 grader 回退到 `EVAL_*` |
| OpenAI-compatible API | 已支持 | OpenAI、DeepSeek、OpenRouter、Gemini、Ollama 均通过统一 client 接入 |
| 新 provider family | 可扩展 | 在 `model-client.js` 中增加 defaults、key/baseURL 解析即可 |

**目标**：开发者只需要调整 `.env` 或 shell 环境变量，即可使用自己有权限的大模型服务运行同一批 eval。测试配置无需因模型供应商变化而改动。
