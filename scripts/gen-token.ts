#!/usr/bin/env ts-node
import 'module-alias/register';
import { AuthService, TokenService } from '../src/services';

/**
 * 生成用户 token 的脚本
 * 使用方法: npm run gen-token [username]
 */
async function generateToken() {
  try {
    // 获取命令行参数
    const args = process.argv.slice(2);
    const username = args[0];

    if (!username) {
      console.error('❌ 错误: 请提供用户名');
      console.log('\n📖 使用方法:');
      console.log('  npm run gen-token [username]');
      console.log('  npm run gen-token admin');
      console.log('  npm run gen-token SuperAdmin');
      console.log('\n💡 示例:');
      console.log('  npm run gen-token SuperAdmin');
      process.exit(1);
    }

    console.log(`🔍 正在查找用户: ${username}`);

    // 检查用户是否存在
    const isExisting = await AuthService.isUsernameExisting(username);
    if (!isExisting) {
      console.error(`❌ 错误: 用户 "${username}" 不存在`);
      console.log('\n💡 提示: 请检查用户名是否正确，或者先创建用户');
      process.exit(1);
    }

    // 获取用户信息
    const users = await AuthService.getUsers({ username });
    if (!users.rows || users.rows.length === 0) {
      console.error(`❌ 错误: 无法获取用户 "${username}" 的信息`);
      process.exit(1);
    }

    const user = users.rows[0];
    console.log(`✅ 找到用户: ${user.username} (ID: ${user.id})`);

    // 获取用户权限信息
    let userAuth: number[] = [];
    try {
      userAuth = await AuthService.getAuthByUserId(user.id);
    } catch (error) {
      console.log('⚠️  无法获取用户权限信息');
    }

    // 生成 token
    const token = await TokenService.generateToken({ id: user.id });

    console.log('\n🎉 Token 生成成功!');
    console.log('='.repeat(60));
    console.log(`👤 用户信息:`);
    console.log(`   用户名: ${user.username}`);
    console.log(`   用户ID: ${user.id}`);
    console.log(`   角色: ${user.role?.name || '未知'}`);
    console.log(`   角色描述: ${user.role?.description || '无'}`);
    console.log(`   权限数量: ${userAuth.length}`);
    console.log('='.repeat(60));

    // 显示权限信息
    if (userAuth.length > 0) {
      console.log('\n🔐 用户权限:');
      userAuth.forEach((authId, index) => {
        console.log(`   ${index + 1}. 权限ID: ${authId}`);
      });
    }

    // 显示 token 详细信息
    try {
      const decoded = await TokenService.verifyToken(token);
      const expireTime = new Date(decoded.exp * 1000);
      const now = new Date();
      const timeLeft = Math.floor(
        (decoded.exp * 1000 - now.getTime()) / 1000 / 60 / 60 / 24,
      ); // 天

      console.log(`⏰ 过期时间: ${expireTime.toLocaleString()}`);
      console.log(`⏱️  剩余时间: ${timeLeft} 天`);
    } catch (error) {
      console.log('⚠️  无法解析 token 过期时间');
    }

    console.log('\n🔑 Token 信息:');
    console.log(`   ${token}`);
  } catch (error) {
    console.error('❌ 生成 token 时发生错误:', error);

    // 提供更详细的错误信息
    if (error instanceof Error) {
      console.log('\n🔍 错误详情:');
      console.log(`   错误类型: ${error.constructor.name}`);
      console.log(`   错误信息: ${error.message}`);

      if (error.stack) {
        console.log('\n📚 错误堆栈:');
        console.log(error.stack);
      }
    }

    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateToken().catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

export { generateToken };
