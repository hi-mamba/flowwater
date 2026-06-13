# SessionStart Hook 功能审查

**日期:** 2026-06-07
**应用:** 悦泉修仙
**审查范围:** Capacitor 应用生命周期管理、提醒系统、多人连接

---

## 验证结果

**Verdict:** FAIL — 8 个问题，4 个 P0 阻塞性问题

---

## 运行时验证

| 检查项 | 结果 |
|--------|------|
| Dev server 启动 | ✅ 正常 |
| Socket.io 服务端 | ✅ `/socket.io/` 响应正常 |
| App.tsx 路由类型 | ⚠️ `BrowserRouter`（不兼容 Capacitor） |
| ReminderManager 轮询 | ❌ `setInterval` + `new Notification()` |
| Capacitor 生命周期代码 | ❌ 零引用 |
| Socket.io 客户端连接 | ❌ `io()` 无参数，无重连 |

---

## P0 阻塞性问题

### 1. 零 Capacitor App 生命周期监听
- `@capacitor/core` 在 `package.json` 中但从未导入使用
- 全局搜索 `src/` 无 `App.addListener`、`appStateChange`、`resume`、`pause`
- 应用从后台恢复时无法触发状态刷新或提醒检查

### 2. setInterval 在 Android WebView 后台冻结
- `ReminderManager.tsx` 使用 `setInterval(checkReminder, 1000)` 每秒轮询
- Android WebView 后台会冻结 JS 定时器
- 触发窗口仅 60 秒 (`now - next < 60000`)，错过窗口后提醒永不触发

### 3. Web Notification API 在 Android WebView 无效
- 使用 `new Notification()` — Android WebView 不支持
- Settings 页面声称"应用在后台也会通知" — 当前实现下不成立

### 4. Socket.io 客户端连接不可靠
- `io()` 无参数调用，Capacitor `file://` 协议下无法正确连接
- 无重连配置，组件卸载即断开
- Socket 仅在 Home 页面存在

---

## P1 重要问题

### 5. BrowserRouter 与 Capacitor 不兼容
- Capacitor 使用 `file://` 协议，`BrowserRouter` 依赖 `pushState` API

### 6. 无原生后台调度
- 无 `AlarmManager`/`WorkManager`，无 `BOOT_COMPLETED` receiver
- 应用被杀后所有提醒丢失

### 7. Zustand persist 存储介质不明确
- 使用 `persist` 中间件但未指定 Capacitor 兼容的 storage engine

---

## P2 次要问题

### 8. main.tsx 无 Capacitor 初始化
- 仅 React 渲染，未初始化 Capacitor 插件系统

---

## 修复路线图

### 短期（最小改动）
1. 添加 `visibilitychange` + Capacitor `appStateChange` 生命周期监听
2. 扩大提醒触发窗口 (60s → 300s)
3. 替换 `new Notification()` 为 `@capacitor/local-notifications`
4. 将 `BrowserRouter` 改为 `HashRouter`

### 中期（正确架构）
5. 安装 `@capacitor/local-notifications` 使用原生通知
6. 添加 Android `WorkManager` 后台定时
7. Socket.io 全局化 + 生命周期感知重连

### 长期（完善体验）
8. 添加 `BOOT_COMPLETED` receiver
9. 使用 `@capacitor/preferences` 替代 localStorage
