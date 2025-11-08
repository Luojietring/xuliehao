# 序列号查询系统 - 后端API

## 项目简介

这是一个序列号查询系统的后端服务，使用 Node.js + Express + MySQL 开发。系统提供用户端查询功能和管理员端管理功能。

## 功能特性

### 用户端
- 查询序列号信息（真实性、激活时间、状态、持有者名字）

### 管理员端
- 管理员登录认证
- 添加序列号到数据库
- 查看序列号列表（支持分页、搜索、筛选）
- 修改序列号状态（生效/失效）
- 修改序列号信息
- 删除序列号

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **MySQL2** - MySQL 数据库驱动
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

## 项目结构

```
Demo/
├── config/
│   └── database.js          # 数据库配置和连接池
├── middleware/
│   └── auth.js              # JWT 认证中间件
├── routes/
│   ├── serial.js            # 序列号查询路由（用户端）
│   └── admin.js             # 管理员路由（登录、CRUD操作）
├── scripts/
│   └── initAdmin.js         # 初始化管理员脚本
├── server.js                # 主服务器文件
├── package.json             # 项目依赖配置
└── README.md                # 项目文档
```

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

确保 MySQL 数据库已创建并配置好：

- **数据库名**：xfsz
- **用户名**：root
- **密码**：123456
- **端口**：3306
- **主机**：localhost

确保数据库中已经创建了以下两张表：

```sql
-- 创建序列号表
CREATE TABLE serial_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    holder_name VARCHAR(50) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    activate_time DATETIME,
    INDEX idx_serial (serial_number),
    INDEX idx_status (status)
);

-- 创建管理员表
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

### 3. 初始化管理员账号（可选）

如果数据库中没有管理员账号，可以运行初始化脚本：

```bash
node scripts/initAdmin.js
```

**默认管理员账号：**
- 用户名：`admin`
- 密码：`123456`

> **注意**：如果不运行初始化脚本，首次登录时会自动创建默认管理员账号。

### 4. 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

服务器默认运行在 `http://localhost:3000`

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token（Bearer Token）

---

## 使用 Postman 测试接口

### 准备工作

1. **启动服务器**
   - 确保数据库已启动并连接正常
   - 运行 `npm start` 启动服务器
   - 服务器运行在 `http://localhost:3000`

2. **打开 Postman**
   - 下载并安装 [Postman](https://www.postman.com/downloads/)
   - 创建一个新的 Collection（集合），命名为 "序列号查询系统"

3. **设置环境变量（推荐）**
   - 在 Postman 中创建一个新环境
   - 添加变量：
     - `base_url`: `http://localhost:3000`
     - `token`: （登录后会自动设置）

---

### 接口测试步骤

## 1. 健康检查接口

**目的**：测试服务器是否正常运行

**请求信息：**
- **方法**：`GET`
- **URL**：`http://localhost:3000/health`

**Postman 操作步骤：**
1. 在 Postman 中选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/health`
3. 点击 `Send` 按钮

**预期响应：**
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

**状态码**：`200 OK`

---

## 2. 查询序列号（用户端）

**目的**：用户输入序列号，查询序列号信息

**请求信息：**
- **方法**：`GET`
- **URL**：`http://localhost:3000/api/serial/:serialNumber`
- **参数说明**：将 `:serialNumber` 替换为实际的序列号

**Postman 操作步骤：**
1. 选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/api/serial/SN123456`
   - 将 `SN123456` 替换为你要查询的序列号
3. 点击 `Send` 按钮

**测试用例 1：查询不存在的序列号**

- **URL**：`http://localhost:3000/api/serial/SN999999`
- **预期响应**：
```json
{
  "success": true,
  "data": {
    "isReal": false,
    "message": "序列号不存在"
  }
}
```

**测试用例 2：查询存在的序列号（需要先添加序列号）**

- **URL**：`http://localhost:3000/api/serial/SN123456`
- **预期响应**：
```json
{
  "success": true,
  "data": {
    "isReal": true,
    "serialNumber": "SN123456",
    "holderName": "张三",
    "status": "生效",
    "activateTime": "2024-01-01T10:00:00.000Z"
  }
}
```

**状态码**：`200 OK`

---

## 3. 管理员登录

**目的**：管理员登录获取认证令牌

**请求信息：**
- **方法**：`POST`
- **URL**：`http://localhost:3000/api/admin/login`
- **Headers**：
  - `Content-Type: application/json`
- **Body**：
  - 选择 `raw` 和 `JSON` 格式

**Postman 操作步骤：**
1. 选择 `POST` 方法
2. 输入 URL：`http://localhost:3000/api/admin/login`
3. 点击 `Headers` 标签，添加：
   - Key: `Content-Type`
   - Value: `application/json`
4. 点击 `Body` 标签
5. 选择 `raw` 单选按钮
6. 在下拉菜单中选择 `JSON`
7. 输入以下 JSON 数据：
```json
{
  "username": "admin",
  "password": "123456"
}
```
8. 点击 `Send` 按钮

**预期响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOjEsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoxNzAwMDg2Mzk5fQ.xxxxxxxxxxxxx",
  "username": "admin"
}
```

**重要：保存 Token**
1. 复制响应中的 `token` 值
2. 在 Postman 环境变量中设置 `token` 变量，或在后续请求中手动添加

**状态码**：`200 OK`

**错误情况：**
- 用户名或密码错误：`401 Unauthorized`
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

## 4. 添加序列号

**目的**：管理员添加新的序列号到数据库

**请求信息：**
- **方法**：`POST`
- **URL**：`http://localhost:3000/api/admin/serial`
- **Headers**：
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` （将 `<token>` 替换为登录后获取的 token）
- **Body**：JSON 格式

**Postman 操作步骤：**
1. 选择 `POST` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serial`
3. 点击 `Headers` 标签，添加：
   - Key: `Content-Type`
   - Value: `application/json`
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` （使用登录时获取的 token）
     > **提示**：如果设置了环境变量 `token`，可以使用 `Bearer {{token}}`
4. 点击 `Body` 标签
5. 选择 `raw` 和 `JSON` 格式
6. 输入以下 JSON 数据：
```json
{
  "serialNumber": "SN123456",
  "holderName": "张三",
  "status": "active"
}
```
7. 点击 `Send` 按钮

**参数说明：**
- `serialNumber`（必填）：序列号，必须唯一
- `holderName`（必填）：持有者姓名
- `status`（可选）：状态，`active`（生效）或 `inactive`（失效），默认为 `active`

**预期响应：**
```json
{
  "success": true,
  "message": "序列号添加成功",
  "data": {
    "id": 1,
    "serialNumber": "SN123456",
    "holderName": "张三",
    "status": "active",
    "activateTime": "2024-01-15T10:30:00.000Z"
  }
}
```

**状态码**：`200 OK`

**错误情况：**
- 未认证：`401 Unauthorized`
```json
{
  "success": false,
  "message": "未提供认证令牌"
}
```
- 序列号已存在：`400 Bad Request`
```json
{
  "success": false,
  "message": "序列号已存在"
}
```
- 缺少必填字段：`400 Bad Request`
```json
{
  "success": false,
  "message": "序列号和持有者姓名不能为空"
}
```

**测试建议：**
- 添加多个不同的序列号用于后续测试
- 测试添加重复序列号的情况

---

## 5. 获取序列号列表

**目的**：管理员查看所有序列号列表，支持分页、搜索、筛选

**请求信息：**
- **方法**：`GET`
- **URL**：`http://localhost:3000/api/admin/serials`
- **Headers**：
  - `Authorization: Bearer <token>`
- **Query Parameters**（可选）：
  - `page`: 页码，默认为 1
  - `pageSize`: 每页数量，默认为 20
  - `status`: 筛选状态，`active` 或 `inactive`
  - `search`: 搜索关键字（序列号或持有者姓名）

**Postman 操作步骤：**

**测试用例 1：获取所有序列号（第一页）**
1. 选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serials`
3. 点击 `Headers` 标签，添加：
   - Key: `Authorization`
   - Value: `Bearer <token>`
4. 点击 `Send` 按钮

**测试用例 2：带分页参数**
1. 选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serials?page=1&pageSize=10`
3. 添加 Authorization Header
4. 点击 `Send` 按钮

**测试用例 3：筛选状态**
1. 选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serials?status=active`
3. 添加 Authorization Header
4. 点击 `Send` 按钮

**测试用例 4：搜索序列号**
1. 选择 `GET` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serials?search=SN123`
3. 添加 Authorization Header
4. 点击 `Send` 按钮

**预期响应：**
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "serial_number": "SN123456",
        "holder_name": "张三",
        "status": "active",
        "activate_time": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "serial_number": "SN789012",
        "holder_name": "李四",
        "status": "inactive",
        "activate_time": "2024-01-15T11:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20
  }
}
```

**状态码**：`200 OK`

---

## 6. 修改序列号状态

**目的**：管理员修改序列号的状态（生效/失效）

**请求信息：**
- **方法**：`PUT`
- **URL**：`http://localhost:3000/api/admin/serial/:id/status`
  - 将 `:id` 替换为序列号的 ID
- **Headers**：
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**：JSON 格式

**Postman 操作步骤：**
1. 选择 `PUT` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serial/1/status`
   - 将 `1` 替换为实际的序列号 ID（可以从获取列表接口中获取）
3. 点击 `Headers` 标签，添加：
   - Key: `Content-Type`
   - Value: `application/json`
   - Key: `Authorization`
   - Value: `Bearer <token>`
4. 点击 `Body` 标签
5. 选择 `raw` 和 `JSON` 格式
6. 输入以下 JSON 数据：
```json
{
  "status": "inactive"
}
```
7. 点击 `Send` 按钮

**参数说明：**
- `status`（必填）：`active`（生效）或 `inactive`（失效）

**预期响应：**
```json
{
  "success": true,
  "message": "状态更新成功",
  "data": {
    "id": 1,
    "status": "inactive"
  }
}
```

**状态码**：`200 OK`

**错误情况：**
- 序列号不存在：`404 Not Found`
```json
{
  "success": false,
  "message": "序列号不存在"
}
```
- 状态值无效：`400 Bad Request`
```json
{
  "success": false,
  "message": "状态必须是 active 或 inactive"
}
```

**测试建议：**
- 先查询序列号列表，获取一个序列号的 ID
- 测试将状态改为 `inactive`
- 然后查询该序列号，验证状态是否已更新

---

## 7. 修改序列号信息

**目的**：管理员修改序列号的持有者姓名和状态

**请求信息：**
- **方法**：`PUT`
- **URL**：`http://localhost:3000/api/admin/serial/:id`
  - 将 `:id` 替换为序列号的 ID
- **Headers**：
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**：JSON 格式

**Postman 操作步骤：**
1. 选择 `PUT` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serial/1`
   - 将 `1` 替换为实际的序列号 ID
3. 点击 `Headers` 标签，添加：
   - Key: `Content-Type`
   - Value: `application/json`
   - Key: `Authorization`
   - Value: `Bearer <token>`
4. 点击 `Body` 标签
5. 选择 `raw` 和 `JSON` 格式
6. 输入以下 JSON 数据（可以只更新部分字段）：
```json
{
  "holderName": "王五",
  "status": "active"
}
```
7. 点击 `Send` 按钮

**参数说明：**
- `holderName`（可选）：持有者姓名
- `status`（可选）：状态，`active` 或 `inactive`

**预期响应：**
```json
{
  "success": true,
  "message": "序列号更新成功"
}
```

**状态码**：`200 OK`

**测试建议：**
- 可以只更新 `holderName` 或只更新 `status`
- 也可以同时更新两个字段

---

## 8. 删除序列号

**目的**：管理员删除序列号

**请求信息：**
- **方法**：`DELETE`
- **URL**：`http://localhost:3000/api/admin/serial/:id`
  - 将 `:id` 替换为序列号的 ID
- **Headers**：
  - `Authorization: Bearer <token>`

**Postman 操作步骤：**
1. 选择 `DELETE` 方法
2. 输入 URL：`http://localhost:3000/api/admin/serial/1`
   - 将 `1` 替换为要删除的序列号 ID
3. 点击 `Headers` 标签，添加：
   - Key: `Authorization`
   - Value: `Bearer <token>`
4. 点击 `Send` 按钮

**预期响应：**
```json
{
  "success": true,
  "message": "序列号删除成功"
}
```

**状态码**：`200 OK`

**错误情况：**
- 序列号不存在：`404 Not Found`
```json
{
  "success": false,
  "message": "序列号不存在"
}
```

**测试建议：**
- 删除后再次查询该序列号，验证是否已删除
- 删除后再次查询序列号列表，验证列表中是否还存在

---

## 完整测试流程建议

### 推荐测试顺序：

1. **健康检查** → 验证服务器运行正常
2. **查询序列号**（不存在的）→ 验证返回"序列号不存在"
3. **管理员登录** → 获取 token，保存到环境变量
4. **添加序列号** → 添加几个测试序列号
5. **查询序列号**（存在的）→ 验证可以查询到刚添加的序列号
6. **获取序列号列表** → 查看所有序列号
7. **修改序列号状态** → 测试状态修改功能
8. **修改序列号信息** → 测试信息更新功能
9. **删除序列号** → 测试删除功能
10. **再次查询序列号**（已删除的）→ 验证删除后查询返回"序列号不存在"

### Postman 环境变量设置

1. 点击右上角的"眼睛"图标或"环境"下拉菜单
2. 点击"添加"创建新环境
3. 添加变量：
   - `base_url`: `http://localhost:3000`
   - `token`: （登录后手动设置，或使用脚本自动设置）

4. 在 URL 中使用变量：`{{base_url}}/api/admin/login`
5. 在 Headers 中使用变量：`Bearer {{token}}`

### Postman 测试脚本（自动保存 Token）

在"管理员登录"请求的 **Tests** 标签中添加以下脚本：

```javascript
// 自动保存 token 到环境变量
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
        console.log("Token 已保存到环境变量");
    }
}
```

这样登录成功后，token 会自动保存到环境变量中，后续请求可以直接使用 `{{token}}`。

---

## 注意事项

1. **Token 有效期**：JWT token 有效期为 24 小时，过期后需要重新登录
2. **序列号唯一性**：序列号在数据库中必须唯一，不能重复添加
3. **状态值**：序列号状态只能是 `active`（生效）或 `inactive`（失效）
4. **认证要求**：所有管理员接口都需要在请求头中携带有效的 token
5. **数据库连接**：确保 MySQL 数据库已启动，且连接信息正确
6. **CORS**：已启用跨域支持，前端可以正常调用接口

---

## 常见问题

### 1. 连接数据库失败

**问题**：启动服务器时提示数据库连接失败

**解决方案**：
- 检查 MySQL 服务是否启动
- 检查数据库连接信息（host、port、user、password、database）是否正确
- 检查数据库 `xfsz` 是否已创建
- 检查数据库表是否已创建

### 2. Token 无效或过期

**问题**：调用管理员接口时返回 401 错误

**解决方案**：
- 检查 token 是否正确添加到请求头
- 检查 token 格式：`Bearer <token>`（注意 Bearer 后面有空格）
- Token 可能已过期，重新登录获取新 token

### 3. 序列号已存在

**问题**：添加序列号时提示"序列号已存在"

**解决方案**：
- 序列号在数据库中必须唯一
- 使用不同的序列号，或先删除已存在的序列号

### 4. 端口被占用

**问题**：启动服务器时提示端口被占用

**解决方案**：
- 修改 `server.js` 中的端口号
- 或关闭占用 3000 端口的其他程序

---

## 开发说明

### 修改端口

在 `server.js` 文件中修改：

```javascript
const PORT = process.env.PORT || 3000; // 修改默认端口
```

或使用环境变量：

```bash
PORT=8080 npm start
```

### 修改 JWT 密钥

在 `.env` 文件中添加（如果使用 dotenv）：

```
JWT_SECRET=your-secret-key-here
```

或在 `routes/admin.js` 和 `middleware/auth.js` 中修改 `JWT_SECRET` 变量。

---

## 许可证

ISC

---

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实现用户端序列号查询功能
- 实现管理员端完整 CRUD 功能
- 实现 JWT 认证机制
