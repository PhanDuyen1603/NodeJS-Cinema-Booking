const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, html) {
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'doanweb2@gmail.com',
        pass: 'doanlaptrinhweb' 
    },
  });

  const info = await transporter.sendMail({
    from: '"VN Cinema"<1660736@gmail.com>',
    to: to,
    subject: subject,
    text: text,
    html: html
  });
  return info;
}

module.exports = sendEmail;
