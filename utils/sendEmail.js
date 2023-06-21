import nodemailer from "nodemailer";

const sendEmail = async (suject, message, mail_to, mail_from, reply_to) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const options = {};
};

export default sendEmail;
