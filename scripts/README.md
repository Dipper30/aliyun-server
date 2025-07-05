# Scripts 目录说明

这个目录包含了项目的各种实用脚本。

## 脚本列表

### gen-token.ts - 生成用户 Token

基于 auth service 和 token service 实现的用户 token 生成脚本。

#### 使用方法

```bash
# 基本用法
npm run gen-token [username]

# 示例
npm run gen-token SuperAdmin
npm run gen-token admin
```

#### 功能特性

- ✅ 验证用户是否存在
- ✅ 获取用户详细信息（用户名、ID、角色等）
- ✅ 获取用户权限信息
- ✅ 生成 JWT token
- ✅ 显示 token 过期时间
- ✅ 显示剩余有效时间
- ✅ 提供多种使用方式（请求头、Cookie、URL参数）
- ✅ 详细的错误处理和提示信息

#### 输出示例

```
🔍 正在查找用户: SuperAdmin
✅ 找到用户: SuperAdmin (ID: 1)

🎉 Token 生成成功!
============================================================
👤 用户信息:
   用户名: SuperAdmin
   用户ID: 1
   角色: super_admin
   角色描述: 超级管理员
   权限数量: 6

🔑 Token 信息:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
============================================================
⏰ 过期时间: 2024/1/15 下午3:30:00
⏱️  剩余时间: 1439 分钟

🔐 用户权限:
   1. 权限ID: 1
   2. 权限ID: 5
   3. 权限ID: 10
   4. 权限ID: 15
   5. 权限ID: 1000
   6. 权限ID: 2000

💡 使用提示:
📋 在请求头中使用:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🍪 在 Cookie 中使用:
   token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔗 在 URL 参数中使用:
   ?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

⚙️  Token 配置:
   密钥: 已配置
   过期时间: 24h
```

#### 错误处理

脚本包含完善的错误处理机制：

- 用户不存在时的友好提示
- 数据库连接错误的处理
- Token 生成失败的错误信息
- 详细的错误堆栈信息

#### 依赖服务

- `authService`: 用于用户验证和信息获取
- `tokenService`: 用于 token 生成和验证
- `APP_CONFIG`: 用于获取配置信息

#### 注意事项

1. 确保数据库连接正常
2. 确保用户已存在于数据库中
3. 确保 token 配置正确（密钥、过期时间等）
4. 脚本需要 ts-node 支持

## 添加新脚本

要添加新的脚本，请遵循以下步骤：

1. 在 `scripts/` 目录下创建新的 `.ts` 文件
2. 在 `package.json` 的 `scripts` 部分添加对应的命令
3. 更新此 README 文档
4. 确保脚本有适当的错误处理
5. 添加使用示例和说明

### 脚本模板

```typescript
#!/usr/bin/env ts-node

/**
 * 脚本描述
 * 使用方法: npm run script-name [参数]
 */
async function main() {
  try {
    // 脚本逻辑
    console.log('脚本执行成功');
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

export { main };
```
