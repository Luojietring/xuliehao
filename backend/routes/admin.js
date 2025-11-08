const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }

    // 查询管理员
    const [rows] = await db.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      // 如果是默认管理员且表为空，创建默认管理员
      if (username === 'admin' && password === '123456') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
          'INSERT INTO admins (username, password) VALUES (?, ?)',
          [username, hashedPassword]
        );
        
        const token = jwt.sign({ username, id: 1 }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
          success: true,
          message: '登录成功',
          token,
          username
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    const admin = rows[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    // 如果是默认密码且数据库中是明文，也允许登录（兼容性处理）
    if (!isPasswordValid && password === '123456' && admin.password === '123456') {
      // 更新为加密密码
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, admin.id]
      );
      
      const token = jwt.sign({ username: admin.username, id: admin.id }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        message: '登录成功',
        token,
        username: admin.username
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 生成 token
    const token = jwt.sign({ username: admin.username, id: admin.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: '登录成功',
      token,
      username: admin.username
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

// 添加序列号
router.post('/serial', authMiddleware, async (req, res) => {
  try {
    const { serialNumber, holderName, status } = req.body;

    if (!serialNumber || !holderName) {
      return res.status(400).json({ 
        success: false, 
        message: '序列号和持有者姓名不能为空' 
      });
    }

    // 检查序列号是否已存在
    const [existing] = await db.execute(
      'SELECT id FROM serial_numbers WHERE serial_number = ?',
      [serialNumber]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '序列号已存在' 
      });
    }

    const serialStatus = status === 'inactive' ? 'inactive' : 'active';
    const activateTime = new Date();

    // 插入序列号
    const [result] = await db.execute(
      'INSERT INTO serial_numbers (serial_number, holder_name, status, activate_time) VALUES (?, ?, ?, ?)',
      [serialNumber, holderName, serialStatus, activateTime]
    );

    res.json({
      success: true,
      message: '序列号添加成功',
      data: {
        id: result.insertId,
        serialNumber,
        holderName,
        status: serialStatus,
        activateTime
      }
    });
  } catch (error) {
    console.error('添加序列号错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

// 获取所有序列号列表
router.get('/serials', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, search } = req.query;
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 20;
    const offset = (pageNum - 1) * pageSizeNum;

    let query = 'SELECT * FROM serial_numbers WHERE 1=1';
    let params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (serial_number LIKE ? OR holder_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // LIMIT 和 OFFSET 直接使用数字，不使用参数绑定
    query += ` ORDER BY activate_time DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;

    const [rows] = await db.execute(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM serial_numbers WHERE 1=1';
    let countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (serial_number LIKE ? OR holder_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        list: rows,
        total,
        page: pageNum,
        pageSize: pageSizeNum
      }
    });
  } catch (error) {
    console.error('获取序列号列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

// 修改序列号状态
router.put('/serial/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: '状态必须是 active 或 inactive' 
      });
    }

    // 检查序列号是否存在
    const [rows] = await db.execute(
      'SELECT * FROM serial_numbers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '序列号不存在' 
      });
    }

    // 更新状态
    await db.execute(
      'UPDATE serial_numbers SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: '状态更新成功',
      data: {
        id: parseInt(id),
        status
      }
    });
  } catch (error) {
    console.error('修改状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

// 删除序列号
router.delete('/serial/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查序列号是否存在
    const [rows] = await db.execute(
      'SELECT * FROM serial_numbers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '序列号不存在' 
      });
    }

    // 删除序列号
    await db.execute(
      'DELETE FROM serial_numbers WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: '序列号删除成功'
    });
  } catch (error) {
    console.error('删除序列号错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

// 修改序列号信息
router.put('/serial/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { serialNumber, holderName, status } = req.body;

    // 检查序列号是否存在
    const [rows] = await db.execute(
      'SELECT * FROM serial_numbers WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '序列号不存在' 
      });
    }

    // 如果修改序列号，检查新序列号是否已被其他记录使用
    if (serialNumber !== undefined && serialNumber !== rows[0].serial_number) {
      const [existing] = await db.execute(
        'SELECT id FROM serial_numbers WHERE serial_number = ? AND id != ?',
        [serialNumber, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '序列号已被使用' 
        });
      }
    }

    let updateFields = [];
    let params = [];

    if (serialNumber !== undefined) {
      updateFields.push('serial_number = ?');
      params.push(serialNumber);
    }

    if (holderName !== undefined) {
      updateFields.push('holder_name = ?');
      params.push(holderName);
    }

    if (status !== undefined && ['active', 'inactive'].includes(status)) {
      updateFields.push('status = ?');
      params.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '没有要更新的字段' 
      });
    }

    params.push(id);

    await db.execute(
      `UPDATE serial_numbers SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: '序列号更新成功'
    });
  } catch (error) {
    console.error('更新序列号错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

module.exports = router;

