const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text, html) {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'motchutfilm@gmail.com',
      pass: '123456Mc'
    },
  });

  const info = await transporter.sendMail({
    from: 'motchutfilm@gmail.com',
    to: to,
    subject: subject,
    text: text,
    html: html
  });
  return info;
}

module.exports = sendEmail;
