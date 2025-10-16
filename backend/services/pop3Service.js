const POP3Client = require('poplib');
const { simpleParser } = require('mailparser');

class POP3Service {
  constructor() {
    this.client = null;
  }

  // Configurar conexión POP3
  configure(config) {
    const host = config.host || process.env.POP3_HOST;
    const port = config.port || process.env.POP3_PORT;
    const secure = config.secure !== undefined ? config.secure : process.env.POP3_SECURE === 'true';

    this.client = new POP3Client(port, host, {
      tlserrs: false,
      enabletls: secure,
      debug: false
    });

    this.user = config.user || process.env.EMAIL_USER;
    this.password = config.password || process.env.EMAIL_PASSWORD;
  }

  // Conectar y autenticar
  async connect() {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        this.configure({});
      }

      this.client.on('error', (err) => {
        reject(err);
      });

      this.client.on('connect', () => {
        this.client.login(this.user, this.password);
      });

      this.client.on('login', (status, rawdata) => {
        if (status) {
          resolve();
        } else {
          reject(new Error('POP3 login failed'));
        }
      });
    });
  }

  // Obtener lista de correos
  async listEmails() {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.client.list();

      this.client.on('list', (status, msgcount, msgnumber, data, rawdata) => {
        if (status === false) {
          reject(new Error('Failed to list emails'));
        } else {
          resolve({ count: msgcount, messages: data });
        }
      });
    });
  }

  // Obtener correos completos
  async fetchEmails(limit = 50) {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.client.list();

      this.client.on('list', async (status, msgcount, msgnumber, data, rawdata) => {
        if (!status) {
          reject(new Error('Failed to list emails'));
          return;
        }

        const emails = [];
        const fetchLimit = Math.min(limit, msgcount);

        for (let i = msgcount; i > msgcount - fetchLimit && i > 0; i--) {
          try {
            const email = await this.retrieveEmail(i);
            emails.push(email);
          } catch (error) {
            console.error(`Error fetching email ${i}:`, error);
          }
        }

        resolve(emails);
        this.client.quit();
      });
    });
  }

  // Obtener un correo específico
  async retrieveEmail(msgNumber) {
    return new Promise((resolve, reject) => {
      this.client.retr(msgNumber);

      this.client.on('retr', async (status, msgnumber, data, rawdata) => {
        if (!status) {
          reject(new Error(`Failed to retrieve email ${msgnumber}`));
          return;
        }

        try {
          const parsed = await simpleParser(data);
          
          resolve({
            id: msgnumber,
            messageId: parsed.messageId,
            from: parsed.from?.text || '',
            to: parsed.to?.text || '',
            cc: parsed.cc?.text || '',
            subject: parsed.subject || '(Sin asunto)',
            date: parsed.date,
            text: parsed.text,
            html: parsed.html,
            attachments: parsed.attachments?.map(att => ({
              filename: att.filename,
              contentType: att.contentType,
              size: att.size
            })) || []
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Eliminar correo
  async deleteEmail(msgNumber) {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.client.dele(msgNumber);

      this.client.on('dele', (status, msgnumber, data, rawdata) => {
        if (status) {
          resolve({ success: true, message: `Email ${msgnumber} deleted` });
        } else {
          reject(new Error(`Failed to delete email ${msgnumber}`));
        }
        this.client.quit();
      });
    });
  }

  // Obtener información del buzón
  async getMailboxInfo() {
    await this.connect();

    return new Promise((resolve, reject) => {
      this.client.list();

      this.client.on('list', (status, msgcount, msgnumber, data, rawdata) => {
        if (status) {
          resolve({ 
            messageCount: msgcount,
            messages: data 
          });
        } else {
          reject(new Error('Failed to get mailbox info'));
        }
        this.client.quit();
      });
    });
  }
}

module.exports = new POP3Service();
