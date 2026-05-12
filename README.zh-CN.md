# NexusAgent

English version: [README.md](README.md)

NexusAgent 是一个面向工程团队的 VS Code + GitHub Copilot 多 Agent Harness。它通过可安装的 Copilot agent plugins，把需求分析、规格文档、JIRA 工作项拆解、开发交接、代码审查、测试规划、发布报告和排障流程带到 Copilot Chat 里。

普通使用者从这份 README 开始就够了。[SETUP.md](SETUP.md)、[DEV-GUIDE.md](DEV-GUIDE.md)、[ARCHITECTURE.md](ARCHITECTURE.md)、[CAPABILITY_ARCHITECTURE.md](CAPABILITY_ARCHITECTURE.md) 面向的是开发、验证或发布当前 repo 的维护者。

## 特色能力

- Feature E2E 交付：`/feature-e2e` 串起需求理解、feature spec、Confluence 发布、JIRA Story 拆解、开发交接、审查和 PR 准备。
- 多 Agent 协作：规格、规划、开发协调、编码、安全审查、测试、发布报告和排障都有专用 agent。
- Copilot 原生体验：在 VS Code Copilot Chat 中直接使用 `/help`、`/start`、`/feature-spec`、`/task`、`/bugfix` 等 slash commands。
- 按需安装：先安装共享插件，再按需安装 SDLC、原生开发、发布管理或云排障插件。
- 效果可量化：当前 eval 显示任务完成率提升 27%，token 使用率降低 47%。

## 核心链路

| 入口 | 适合场景 | 输出结果 |
| --- | --- | --- |
| `/feature-e2e` | 从 JIRA Feature 或需求入口完成端到端交付 | Feature spec、Confluence 页面、JIRA Stories、实现任务、审查流程、PR 准备 |
| `/feature-spec` | 把粗略需求变成可评审设计 | Markdown feature specification，可继续发布或拆解 |
| `/feature-plan` | 把已批准的 spec 拆成可执行 JIRA 工作 | Epic、Stories、验收标准和估点建议 |
| `/task` | 开始实现一个 JIRA Story | 分支/task 设置、实现计划、代码/测试交接、PR 准备 |
| `/bugfix` | 调查 bug ticket、日志或故障现象 | 假设、证据、根因方向、修复计划、开发交接 |
| `/code-review`, `/security`, `/test` | 需要质量、安全或测试策略把关 | 问题发现、风险说明、修复建议和覆盖策略 |

## 能力概览

| 能力域 | 能做什么 | 常用命令 |
| --- | --- | --- |
| 通用工程操作 | 技术分析、Git、JIRA、Confluence、Copilot 资产工作 | `/analyze`, `/git`, `/jira`, `/article`, `/copilot-asset` |
| SDLC 交付 | Spec、规划、实现、Bug 调查、审查、安全、测试 | `/start`, `/feature-spec`, `/feature-plan`, `/feature-e2e`, `/task`, `/bugfix`, `/code-review`, `/security`, `/test` |
| 原生桌面开发 | 构建、测试、原生平台模式、集成通道脚手架 | `/xcode-build`, `/xcode-test`, `/vc-scaffold` |
| 发布管理 | 完成项报告、JIRA/GitHub 追踪、Confluence 报告 | `/jira-completed-by-assignee`, `/github-jira-commit-linkage`, `/jira-epic-enrichment`, `/confluence-publish-report` |
| 云端排障 | Kubernetes、Docker、服务依赖、日志、指标、告警、基础设施排查 | `/sre`, `/cloud-alert-triage`, `/service-troubleshoot`, `/cloud-infra-troubleshoot` |

## 安装和使用

### 1. 准备 VS Code

1. 安装最新版 VS Code 或 VS Code Insiders。
2. 安装并登录 GitHub Copilot 和 GitHub Copilot Chat。
3. 在 VS Code 设置中启用 Copilot plugin 支持。
4. 获取团队发布的 NexusAgent marketplace 名称或 URL。

### 2. 添加 Marketplace

推荐从 VS Code Settings 添加：

1. 打开 VS Code Settings。
2. 搜索 `Chat Plugins Marketplaces`。
3. 添加团队提供的 NexusAgent marketplace 名称或 URL。
4. 搜索 `Chat Plugins Enabled` 并确认已启用。
5. Reload VS Code。

也可以在 Copilot Chat 中执行：

```text
/plugin marketplace add NexusAgent
/plugin marketplace browse NexusAgent
```

如果团队使用了不同的 marketplace 名称，请用实际名称替换 `NexusAgent`。

### 3. 安装插件

推荐通过 VS Code Command Palette 安装：

1. macOS 按 `Cmd+Shift+P`，Windows/Linux 按 `Ctrl+Shift+P`。
2. 执行 `Plugins: Install Agent Plugin`，或搜索 `agent plugin install`。
3. 选择 NexusAgent marketplace。
4. 先安装 `nexus-common-agent-plugin`。
5. 再按工作需要安装专用插件。

也可以在 Copilot Chat 中安装。先安装共享插件：

```text
/plugin install nexus-common-agent-plugin@NexusAgent
```

再按需安装专用插件：

```text
/plugin install nexus-sdlc-agent-plugin@NexusAgent
/plugin install nexus-macos-native-plugin@NexusAgent
/plugin install nexus-release-management-plugin@NexusAgent
/plugin install cloud-troubleshooting-plugin@NexusAgent
```

### 4. 验证安装

1. Reload VS Code。
2. 打开 Extensions view，搜索 `@agentPlugins`。
3. 确认已安装的 NexusAgent 插件处于 enabled 状态。
4. 打开 Copilot Chat，确认以下命令能自动补全：

```text
/help
/analyze
/jira
/feature-spec
```

## 常用入口

- 不确定该用什么：从 `/start` 或 `/help` 开始。
- 分析日志、配置、截图或需求：使用 `/analyze`。
- 从需求生成 feature spec：使用 `/feature-spec`。
- 把 spec 拆成 JIRA 工作项：使用 `/feature-plan`。
- 端到端交付 feature：使用 `/feature-e2e`。
- 开始实现 JIRA Story：使用 `/task`。
- 调查 bug：使用 `/bugfix`。
- 做代码或安全审查：使用 `/code-review` 或 `/security`。
- 规划测试：使用 `/test` 或 `/feature-testplan`。
- 运行原生构建或测试：使用 `/xcode-build` 或 `/xcode-test`。

## 评测和打分器

NexusAgent 使用 promptfoo suites、mock repository context、mock JIRA data 和 mock Confluence data 做评测。当前评测显示任务完成率提升 27%，token 使用率降低 47%。

打分器使用通用 OpenAI-compatible 大模型 API。评测时，provider 先用 agent model 执行被测命令；当 promptfoo 执行 `llm-rubric` 断言时，provider 切换到 grader model，并按测试用例中的 rubric 判断输出是否达标。

模型通过环境变量配置：

```text
Agent model:  EVAL_PROVIDER / EVAL_MODEL / EVAL_API_KEY / EVAL_BASE_URL
Grader model: GRADER_PROVIDER / GRADER_MODEL / GRADER_API_KEY / GRADER_BASE_URL
```

如果没有配置 `GRADER_*`，grader 会回退到 `EVAL_*`。这套评测配置是给 repo 维护者用的；普通插件使用者不需要配置这些变量。

## 文档地图

| 文档 | 读者 | 用途 |
| --- | --- | --- |
| [README.md](README.md) | 普通用户和首次阅读者 | NexusAgent 是什么、如何安装、如何使用 |
| [README.zh-CN.md](README.zh-CN.md) | 中文读者 | 这份用户指南的中文版本 |
| [SETUP.md](SETUP.md) | 维护者和贡献者 | 本地验证、模型环境变量、Phase 0 检查 |
| [DEV-GUIDE.md](DEV-GUIDE.md) | 维护者和插件作者 | Marketplace 和 plugin 维护指南 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 维护者和架构读者 | 技术架构和 eval 内部机制 |
| [CAPABILITY_ARCHITECTURE.md](CAPABILITY_ARCHITECTURE.md) | 维护者和干系人 | 能力矩阵、支持等级和当前差距 |

## 简单排障

- 插件没有出现：Reload VS Code 后重新搜索 `@agentPlugins`。
- 命令没有自动补全：确认对应插件已经安装并启用。
- Marketplace 无法浏览：确认团队提供的 marketplace 名称或 URL 正确。
- 外部系统不可用：确认你的工作流所需的 GitHub、JIRA、Confluence、云平台或观测系统访问权限已经配置好。

热烈欢迎各位想加入进来一起贡献 NexusAgent 的程序员。
