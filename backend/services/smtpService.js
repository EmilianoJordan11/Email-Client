const nodemailer = require('nodemailer');

class SMTPService {
  constructor() {
    this.transporter = null;
  }

  // Configurar conexión SMTP
  configure(config) {
    const password = (config.password || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
    
    this.transporter = nodemailer.createTransport({
      host: config.host || process.env.SMTP_HOST,
      port: config.port || process.env.SMTP_PORT,
      secure: config.secure !== undefined ? config.secure : process.env.SMTP_SECURE === 'true',
      auth: {
        user: config.user || process.env.EMAIL_USER,
        pass: password
      }
    });
    
    console.log(`📧 SMTP configurado para: ${config.user || process.env.EMAIL_USER}`);
  }

  // Enviar correo
  async sendEmail(mailOptions) {
    try {
      if (!this.transporter) {
        this.configure({});
      }

      const info = await this.transporter.sendMail({
        from: mailOptions.from || process.env.EMAIL_USER,
        to: mailOptions.to,
        cc: mailOptions.cc,
        bcc: mailOptions.bcc,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
        attachments: mailOptions.attachments
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Reenviar correo
  async forwardEmail(originalEmail, to, additionalMessage = '') {
    const forwardContent = `
---------- Forwarded message ---------
From: ${originalEmail.from}
Date: ${originalEmail.date}
Subject: ${originalEmail.subject}
To: ${originalEmail.to}

${originalEmail.text || originalEmail.html}
    `;

    return await this.sendEmail({
      to: to,
      subject: `Fwd: ${originalEmail.subject}`,
      text: additionalMessage + '\n\n' + forwardContent,
      attachments: originalEmail.attachments
    });
  }

  // Responder correo
  async replyEmail(originalEmail, replyText, replyAll = false) {
    const recipients = replyAll 
      ? [originalEmail.from, ...(originalEmail.cc || [])].join(',')
      : originalEmail.from;

    return await this.sendEmail({
      to: recipients,
      subject: originalEmail.subject.startsWith('Re:') 
        ? originalEmail.subject 
        : `Re: ${originalEmail.subject}`,
      text: `${replyText}\n\n--- Original Message ---\n${originalEmail.text || ''}`,
      inReplyTo: originalEmail.messageId,
      references: originalEmail.messageId
    });
  }
}

module.exports = new SMTPService();
