const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 查询序列号
router.get('/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;

    if (!serialNumber) {
      return res.status(400).json({ 
        success: false, 
        message: '序列号不能为空' 
      });
    }

    // 查询序列号
    const [rows] = await db.execute(
      'SELECT * FROM serial_numbers WHERE serial_number = ?',
      [serialNumber]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          isReal: false,
          message: '序列号不存在'
        }
      });
    }

    const serial = rows[0];
    
    res.json({
      success: true,
      data: {
        isReal: true,
        serialNumber: serial.serial_number,
        holderName: serial.holder_name,
        status: serial.status === 'active' ? '生效' : '失效',
        activateTime: serial.activate_time
      }
    });
  } catch (error) {
    console.error('查询序列号错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: error.message 
    });
  }
});

module.exports = router;

