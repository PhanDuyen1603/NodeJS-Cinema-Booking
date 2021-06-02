const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, html) {
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: '17k1.web2.demo@gmail.com',
        pass: 'abcXYZ123~' 
    },
  });

  const info = await transporter.sendMail({
    from: '<17k1.web2.demo@gmail.com>',
    to: to,
    subject: subject,
    text: text,
    html: html
  });
  return info;
}

module.exports = sendEmail;
