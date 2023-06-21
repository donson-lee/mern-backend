import nodeMailer from "nodemailer";

const sendEmail = async (subject, message, mail_to, mail_from, reply_to) => {
  const transporter = nodeMailer.createTransport({
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

  const options = {
    from: mail_from,
    to: mail_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };
  //send email
  transporter.sendMail(options, function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log(success);
    }
  });
};

export default sendEmail;
