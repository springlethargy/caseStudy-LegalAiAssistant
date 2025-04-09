# Ask-UCASS

基于 Dify RAG 引擎的大语言模型问答系统

## 功能特点

- 使用 Dify 作为 RAG (Retrieval Augmented Generation) 引擎
- 支持流式响应 (Streaming)
- 对话历史记录保存及恢复
- 多主题会话支持
- 深色/浅色主题切换
- 显示令牌使用量和响应处理时间

## 技术架构

- Next.js 应用框架
- React 前端界面
- TypeScript 类型系统
- TailwindCSS 样式库
- Server-Sent Events (SSE) 实现流式响应
- Zustand 全局状态管理

## 流式响应实现

系统通过以下方式实现与 Dify 的流式响应交互：

1. **事件监听**：使用 Server-Sent Events 接收 Dify 的流式响应
2. **事件解析**：解析不同类型的事件（消息内容、工作流状态、元数据等）
3. **增量更新**：将收到的部分内容逐步更新到界面，实现打字机效果
4. **元数据显示**：在界面显示响应过程相关的元数据（令牌使用量、处理时间）

## 开发

```bash
# 安装依赖
bun install

# 运行开发服务器
bun run dev
```

## 环境变量

在 `.env` 文件中配置以下环境变量：

```
DIFY_URL=<Your Dify Server URL>
DIFY_KEY=<Your Dify API Key>
```

## API 接口

### 聊天接口

- 路径: `/api/chat`
- 方法: `POST`
- 请求参数:
  ```json
  {
    "message": "用户消息内容",
    "conversationId": "可选，现有会话ID"
  }
  ```
- 响应: Server-Sent Events 流，包含以下事件类型:
  - `content`: 消息内容片段
  - `metadata`: 会话元数据（令牌使用量、处理时间等）
  - `error`: 错误信息
  - `done`: 结束标记

## Dify 集成

系统与 Dify 通过以下方式集成：

1. 使用 Dify 的 API 进行对话生成
2. 解析 Dify 返回的各类事件（workflow_started, node_started, message 等）
3. 保存会话 ID 用于后续对话的上下文连贯性

## 未来计划

- 添加语音输入支持
- 集成多种知识库来源
- 改进错误处理及重试机制
- 增加用户认证系统
