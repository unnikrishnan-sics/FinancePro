const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter (configure with your email provider)
    // For Development, you can use Mailtrap or similar
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or use host/port
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Support'} <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `<p>${options.message}</p>` // Simple HTML fallback
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
