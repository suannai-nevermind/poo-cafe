const nodemailer = require('nodemailer');

// 邮件配置
const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    const currentTime = new Date().toLocaleString('zh-CN');

    // 生成邮件内容
    let emailContent = `
新订单通知！

下单时间: ${currentTime}
顾客姓名: ${orderData.customerName}
备注信息: ${orderData.note || '无'}

订单明细:
`;

    orderData.items.forEach(item => {
      emailContent += `\n${item.name} x ${item.quantity} - ¥${item.price * item.quantity}`;
    });

    if (orderData.bean) {
      emailContent += `\n咖啡豆: ${orderData.bean.name} +¥${orderData.bean.price}`;
    }

    emailContent += `\n\n总计: ¥${orderData.total}`;

    // 发送邮件
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.STORE_EMAIL,
      subject: `Poo Cafe - 新订单 - ${orderData.customerName} - ¥${orderData.total}`,
      text: emailContent
    });

    res.status(200).json({ success: true, message: "订单已提交成功！" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 