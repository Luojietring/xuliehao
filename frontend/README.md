# 序列号查询系统 - 前端

## 项目简介

这是序列号查询系统的前端项目，使用 Vue 3 + Vite 开发。

## 功能特性

### 用户端
- 序列号查询界面
- 显示序列号详细信息（真实性、激活时间、状态、持有者）

### 管理员端
- 管理员登录
- 序列号列表展示（支持分页、搜索、筛选）
- 添加序列号
- 编辑序列号信息
- 修改序列号状态
- 删除序列号

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 请求封装
│   │   ├── request.js   # Axios 配置
│   │   ├── serial.js    # 序列号相关 API
│   │   └── admin.js     # 管理员相关 API
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── views/           # 页面组件
│   │   ├── UserQuery.vue      # 用户查询页面
│   │   ├── AdminLogin.vue    # 管理员登录页面
│   │   └── AdminDashboard.vue # 管理后台页面
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置
```

## 安装步骤

1. **进入前端目录**
```bash
cd frontend
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 运行。

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 预览生产构建

```bash
npm run preview
```

## 开发说明

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 代理配置

开发环境下，Vite 已配置代理，所有 `/api` 开头的请求会自动代理到后端服务器 `http://localhost:3000`。

### 路由说明

- `/` - 用户查询页面
- `/admin/login` - 管理员登录页面
- `/admin/dashboard` - 管理后台（需要登录）

### Token 管理

管理员登录后，token 会保存在 `localStorage` 中，key 为 `admin_token`。所有需要认证的请求会自动在请求头中添加 token。

### API 请求

所有 API 请求都封装在 `src/api/` 目录下：
- `request.js` - Axios 实例配置，包含请求/响应拦截器
- `serial.js` - 序列号查询相关接口
- `admin.js` - 管理员相关接口

## 注意事项

1. **后端服务**：确保后端服务已启动并运行在 `http://localhost:3000`
2. **跨域问题**：开发环境下已配置代理，生产环境需要配置 CORS 或使用反向代理
3. **Token 过期**：Token 过期后会自动跳转到登录页面
4. **浏览器兼容性**：建议使用现代浏览器（Chrome、Firefox、Edge 等）

## 开发建议

1. 使用 Vue DevTools 进行调试
2. 查看浏览器控制台的网络请求，了解 API 调用情况
3. 使用 Vue Router 的导航守卫进行权限控制

