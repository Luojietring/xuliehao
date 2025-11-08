const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'xfsz'
  });

  try {
    // 检查管理员表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'admins'"
    );

    if (tables.length === 0) {
      console.log('管理员表不存在，请先创建数据库表');
      return;
    }

    // 检查是否已有管理员
    const [admins] = await connection.execute(
      'SELECT * FROM admins WHERE username = ?',
      ['admin']
    );

    if (admins.length > 0) {
      console.log('默认管理员已存在');
      return;
    }

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('123456', 10);
    await connection.execute(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      ['admin', hashedPassword]
    );

    console.log('默认管理员创建成功！');
    console.log('用户名: admin');
    console.log('密码: 123456');
  } catch (error) {
    console.error('初始化管理员失败:', error.message);
  } finally {
    await connection.end();
  }
}

initAdmin();

