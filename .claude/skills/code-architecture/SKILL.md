---
name: code-architecture
description: |
  代码架构规范：确保每个文件不超过 800 行，组件职责单一，数据与 UI 分离。
  当用户提到架构、重构、拆分、文件太大、代码规范、组件设计时使用此 skill。
  TRIGGER: 任何涉及文件大小、代码组织、组件拆分、架构优化的任务。
---

# 代码架构规范

## 硬性规则

### 文件大小限制
- **每个 `.ts` / `.tsx` 文件不超过 800 行**。超过则必须拆分。
- 组件文件不超过 500 行（含 JSX）。
- 数据文件（如 store、配方表）不超过 800 行。

### 组件设计原则
- **每个组件只做一件事**。如果组件同时处理数据获取、UI 渲染、状态管理，拆分。
- 组件放在 `src/components/` 下，一个组件一个文件。
- 页面放在 `src/pages/` 下。
- 纯数据（配方、常量、配置）放在 `src/data/` 下。
- 工具函数放在 `src/utils/` 下。

### 数据与 UI 分离
- Store（`store.ts`）只管理状态和 actions，不包含 JSX。
- 组件只渲染 UI 和调用 store actions，不直接操作 localStorage 或 API。
- 共享类型放在 `src/types.ts` 或就近的 `types.ts`。

### 命名规范
- 组件文件：`PascalCase.tsx`（如 `HeavenlyBottle.tsx`）
- 数据文件：`camelCase.ts`（如 `craftingData.ts`）
- 工具文件：`camelCase.ts`（如 `vibration.ts`）
- Store：单一 `store.ts`，但超过 800 行时拆分为多个 slice

## 拆分策略

### Store 拆分
当 `store.ts` 超过 800 行时：
1. 将大型 feature 的 state + actions 提取到 `src/data/` 或独立 slice 文件
2. 在 `store.ts` 中只保留核心状态（用户、设置、饮水日志）
3. Feature 系统（掌天瓶、剑阵、灵兽等）各自管理自己的 state

### 组件拆分
当组件超过 500 行时：
1. 提取子组件到同目录或 `components/` 下
2. 提取纯逻辑到 `utils/` 或自定义 hook
3. 提取数据到 `data/` 下

### 页面拆分
当页面超过 500 行时：
1. 提取页面内的 section 为独立组件
2. 提取页面内的游戏/子系统为独立组件
3. Modal 独立为组件

## 重构优先级

1. `store.ts`（3000+ 行）→ 拆分为多个 slice
2. `Home.tsx`（3700 行）→ 提取 sections 和子组件
3. `Games.tsx`（1300 行）→ 每个游戏独立文件
4. `Cave.tsx`（600+ 行）→ 已达上限，需拆分

## 重构步骤

每次重构一个文件，遵循：
1. 读取文件，分析结构
2. 识别可拆分的独立模块
3. 创建新文件，移动代码
4. 更新所有 import 引用
5. 运行 `npx tsc --noEmit` 验证
6. 运行 `npx vite build` 验证
7. 确认功能正常后继续下一个文件
