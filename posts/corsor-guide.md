---
title: 用 Cursor 打造生产级产品：全流程实战指南
---

# 用 Cursor 打造生产级产品：全流程实战指南

“能跑”和“能上线赚钱”之间隔着一个银河系。如果只是让 Cursor 胡乱写一通代码，你大概率会在深夜的某个时刻发现：看似正常的 App，每一个认证检查都是不安全的。

本指南将以 **“一人公司 SaaS 订阅制应用”** 为实战目标，手把手带你走完从 **0 到部署上线** 的全流程。你会看到，资深的独立开发者如何将 Cursor 从一个“代码生成器”驯化成**可控、可预测的生产力工具**。


## 第一阶段：项目启动与知识固化（30 分钟）

> **核心目标**：在 Cursor 接触任何代码之前，先把“游戏规则”刻进它的 DNA。

80% 的开发者在新建项目后，立刻打开 Cmd+I 让 AI 写代码。这是最大的错误——AI 没有上下文，只能产生“看起来对，但不符合你架构规范”的垃圾代码。资深开发者的做法是：**先建立约束，再让 AI 做事**。

### 1.1 创建项目并在 Cursor 中打开

````bash
mkdir my-saas-app && cd my-saas-app
cursor .
````

### 1.2 创建模块化规则体系（生产级关键步骤）

摒弃单一的 `.cursorrules` 大文件，使用 `.cursor/rules/*.mdc` 目录创建**模块化、可作用域限定**的规则文件。每个规则文件都有三个核心控制点：`globs` 限定哪些文件类型触发、`alwaysApply` 控制是否强制加载、`description` 帮助 Cursor 理解何时应用。

**第一步：创建项目根规则（`alwaysApply: true`）**

在 `.cursor/rules/project-context.mdc` 写入：

````markdown
---
description: 项目的核心上下文与技术约束
globs: "**/*"
alwaysApply: true
---

# 项目概述
这是一个 SaaS 订阅制 Web 应用，技术栈为 Next.js 15 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL。

# 目录边界
- 只允许修改：app/、components/、lib/、prisma/、actions/
- 禁止修改：node_modules/、.next/、scripts/、配置文件（除非我明确要求）

# 代码规范
- 所有组件默认是 Server Components，需要交互才加 "use client"
- 禁止使用 any 类型，遇到不确定的类型先提问
- API 路由只用于 Webhook，其他数据操作一律用 Server Actions
- 数据库查询必须在 Server Component 或 Server Action 中直接执行
````

**第二步：创建 Next.js 专属规则（scoped by globs）**

在 `.cursor/rules/nextjs-patterns.mdc` 写入：

````markdown
---
description: Next.js 15 App Router 编码规范
globs: "**/*.tsx"
alwaysApply: false
---

# App Router 最佳实践
- 页面文件使用 `export default async function Page()`
- 数据获取直接在组件内 await，不要额外封装 API
- 客户端组件必须显式声明，且放在组件树的最末端

# Server Actions 规范
- 所有 Server Actions 统一放在 `app/actions/` 目录
- 每个 Action 必须包含 Zod 校验
- 使用 `useTransition` 和 `useFormStatus` 实现加载状态
````

**第三步：创建质量控制规则**

在 `.cursor/rules/quality-gates.mdc` 写入：

````markdown
---
description: 代码质量控制规则
globs: "**/*"
alwaysApply: true
---

# 输出格式要求
【必须遵守】对于任何非 trivial 的改动：
1. 先输出改动计划：文件清单 + 每个文件的修改点 + 影响范围分析
2. 等我确认后，再生成代码补丁
3. 代码生成后，必须附上验证步骤（lint/typecheck/build）

# 禁止事项
- 不要为了“更优雅”而跨目录移动文件
- 不要新增未经我批准的依赖包
- 不要吞掉错误（所有 catch 块必须有明确的错误处理）
````

这个“计划先行”的策略来自资深开发者的经验——改动文件 ≤ 2 时用 Cmd+K，≥ 3 时用 Agent 模式，但无论哪种，都**必须先输出改动计划**。

### 1.3 配置 `.cursorignore` 控制索引范围

````gitignore
# .cursorignore
node_modules/
.next/
dist/
build/
*.log
.env*
coverage/
.git/
````

排除构建产物和依赖能显著提升索引质量，避免 AI 被无关内容干扰。


## 第二阶段：AI 驱动全栈开发（2-3 小时）

> **核心目标**：用 Agent 模式一次性生成完整的项目骨架和核心功能。

有了规则体系，Cursor 现在有了清晰的“工作指南”。接下来用 **Cmd+I（Agent 模式）** 下达核心指令。

### 2.1 生成项目骨架（Cmd+I）

打开 Composer（Cmd+I），选择 **Agent 模式**，输入以下提示词：

````markdown
按照以下需求搭建完整的 Next.js 15 SaaS 项目骨架：

【技术栈】
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- shadcn/ui 作为 UI 组件库
- Prisma ORM + PostgreSQL（连接 Supabase）
- Clerk 做用户认证
- Stripe 做订阅支付

【功能需求】
1. 用户注册/登录（使用 Clerk）
2. 用户仪表盘页面（展示订阅状态和使用情况）
3. 定价页面（支持月付/年付两个套餐）
4. 结账流程（Stripe Checkout）
5. Webhook 处理 Stripe 订阅状态变更

【项目结构】
- app/(auth)/ - 认证相关页面
- app/(dashboard)/ - 仪表盘布局和页面
- app/api/webhooks/stripe/ - Stripe Webhook
- app/actions/ - Server Actions 集中目录
- components/ui/ - shadcn/ui 组件
- lib/db.ts - 数据库连接
- lib/stripe.ts - Stripe 客户端初始化

请先输出完整的文件清单和每个文件的核心职责，确认后生成代码。
````

Agent 模式会自动完成：创建目录结构、安装依赖、生成所有必要的代码文件、配置环境变量模板。

这个提示词的设计遵循了一个关键原则：**只给约束和目标，不给实现细节**——让 Cursor 自己决定最佳实现，但规则文件确保了它不会偏离架构方向。

### 2.2 用 Chat 迭代优化（Cmd+L）

生成骨架后，用 Cmd+L 打开 AI Chat，进行针对性优化：

- “检查所有 Server Action 是否都包含了 Zod 校验”
- “为数据库查询添加错误边界，避免页面崩溃”
- “确保所有客户端组件都已显式标记 'use client'”
- “在 Webhook 处理中添加幂等性逻辑，防止重复处理”

### 2.3 关键原则：先写测试，再写实现

这是资深开发者最核心的防坑技巧。不要直接让 Cursor 写业务代码，**先让它写测试断言**。

**正确做法**（以价格计算函数为例）：

先问：“这个价格计算函数需要满足哪些规则？请先输出测试用例。”

Cursor 会生成类似这样的测试草稿：

````typescript
// 正常输入返回正确金额
// 折扣码为空时按默认逻辑处理
// 过期折扣码应被拒绝
// 非法输入抛出可识别错误
// 订阅升级时的 proration 计算正确
````

**确认测试覆盖了所有业务边界后**，再让它生成实现。这确保 AI 的产出是可验证的，而不是“看起来对，但边界全漏”。

另一个被社区验证的有效技巧是：**先写状态表，再写代码**。对于复杂 UI 逻辑，先让 Cursor 输出互斥状态列表、允许的事件和禁止的状态转换，确认后再生成 reducer 代码。这能彻底消灭“布尔值地狱”（isLoading、isSaving、hasError、showSuccess 五个布尔值产生 32 种状态组合的混乱局面）。


## 第三阶段：质量控制与安全审计（1 小时）

> **核心目标**：通过“双人复核”机制，将 AI 产出的潜在风险降到最低。

### 3.1 安全审计清单（最容易踩坑的地方）

这是一个在真实 Next.js 项目中血泪教训的总结——代码看起来正确、类型通过编译，但部署到生产环境后发现所有认证检查都是不安全的。

````markdown
【必须人工复核】
1. 所有 Server Action 是否都有用户权限校验
2. 环境变量是否都已在 next.config.js 中显式声明
3. Stripe Webhook 是否验证了签名
4. 数据库查询是否使用了参数化（防止 SQL 注入）
5. 任何涉及价格/订阅的逻辑，是否在服务端执行
````

在 Cursor 中创建 `.cursor/rules/security-checklist.mdc`，将这些检查项固化下来。

### 3.2 建立双人复核机制

资深开发者常用的技巧是让 Cursor 扮演两个角色：**“执行者”（Maker）和“审核者”（Checker）**。

**第一步：让 Cursor 以 Maker 身份实现功能**
用 Agent 模式生成代码。

**第二步：切换角色，让 Cursor 以 Checker 身份审查**
复制刚生成的代码，在 Chat 中问：

````markdown
请严格审查以下代码，重点关注：
1. 安全性：是否有权限校验漏洞、注入风险
2. 边界条件：空值、异常输入是否被正确处理
3. 性能：是否有不必要的数据库查询或重复渲染
4. 一致性：是否遵循了项目的编码规范
````

这个“复核”步骤会让 Cursor 发现它自己生成代码中的问题——就像两个不同的人做代码审查。


## 第四阶段：部署上线（30 分钟）

> **核心目标**：实现“代码提交即自动部署”的自动化流水线。

### 4.1 配置 Git 和 Vercel

````bash
# 在 Cursor 内置终端中执行
git init
git add .
git commit -m "feat: initial saas app with auth and payments"
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
````

然后访问 [vercel.com](https://vercel.com)，用 GitHub 登录，Import 你的仓库。Vercel 会自动识别 Next.js 项目并完成构建配置。

### 4.2 注入环境变量

在 Vercel 项目 Dashboard 的 **Settings → Environment Variables** 中，添加以下变量（从 `.env.local` 复制值）：
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`（Supabase 连接串）
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Vercel 自动为每个环境变量启用加密存储，并支持 Preview/Production 环境隔离。

### 4.3 部署后验证

部署完成后，Vercel 会给你一个 `https://你的项目名.vercel.app` 的域名。**务必进行以下验证**：

1. 用户注册流程是否正常
2. 订阅支付能否跳转到 Stripe Checkout
3. Webhook 是否能正常接收订阅状态变更
4. 生产环境的数据库连接是否正确

### 4.4 持续迭代

后续每次 `git push`，Vercel 会自动触发新的部署。Cursor 的 Agent 模式可以结合 GitHub MCP 实现自动化工作流：通过自定义规则自动化 Git 流程（分支创建、代码提交、CI 调试）。


## 第五阶段：建立迭代闭环

> **核心目标**：让 Cursor 从“一次性工具”变成“长期协作伙伴”。

### 5.1 规则持续优化

在完成每个功能后，把 **“本轮有效的提示词 + 验证清单 + 易错点”** 沉淀进规则文件。例如，如果发现 Cursor 总是漏掉错误处理，就在规则文件中强化这条约束。

### 5.2 建立记忆库

在 Cursor 的 **Settings → Features → Memories** 中，记录项目中反复出现的偏好和注意事项。下次启动新功能时，Cursor 会自动参考这些记忆。

### 5.3 测试驱动迭代

每次新增功能，先用测试定义验收标准，再让 Cursor 实现。修改核心逻辑后，运行最小回归测试集，确保改动没有破坏原有行为。


## 总结：生产级 Cursor 工作流的核心要点

| 阶段 | 关键动作 | 预期产出 |
|------|---------|---------|
| **启动期** | 创建 `.cursor/rules/*.mdc` 模块化规则、配置 `.cursorignore` | AI 行为可预测、输出一致 |
| **开发期** | Agent 模式生成骨架 → Chat 迭代优化 → 测试先行 | 功能完整、边界覆盖 |
| **质检期** | Maker-Checker 双人复核 + 安全审计清单 | 代码安全可靠、无隐藏缺陷 |
| **部署期** | Git + Vercel 一键部署 + 环境变量注入 | 自动 CI/CD、即时上线 |
| **迭代期** | 规则持续优化 + 记忆库沉淀 + 回归测试 | Cursor 越用越“懂你” |

Cursor 官方分享过核心洞察：高质量产出靠的不是更花哨的提示词，而是三层控制——任务控制、上下文控制、变更控制。NVIDIA 的 30,000 名开发者已将这套方法论落地，代码提交量提升了 3 倍以上，整个 SDLC 都被 Cursor 加速了。

把这套流程跑通一次后，你的一人公司技术栈就具备了**快速迭代、安全交付**的核心能力。现在就按照这个清单，一步步构建你的第一个生产级产品吧。


<div align="right" style="color: gray; font-size: 0.9em;">

— 本文由 AI 生成，内容仅供参考，请仔细甄别

</div>