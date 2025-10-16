const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { promisify } = require('util');

class IMAPService {
  constructor() {
    this.imap = null;
    this.config = null;
  }

  // Configurar conexión IMAP
  configure(config) {
    const password = (config.password || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
    
    this.config = {
      user: config.user || process.env.EMAIL_USER,
      password: password,
      host: config.host || process.env.IMAP_HOST,
      port: parseInt(config.port || process.env.IMAP_PORT),
      tls: config.secure !== undefined ? config.secure : process.env.IMAP_SECURE === 'true',
      tlsOptions: { 
        rejectUnauthorized: false,
        servername: config.host || process.env.IMAP_HOST
      },
      authTimeout: 10000,
      connTimeout: 10000,
      keepalive: false
    };
    
    console.log(`🔐 IMAP configurado para: ${this.config.user}`);
  }

  // Crear nueva instancia de IMAP
  createConnection() {
    if (!this.config) {
      this.configure({});
    }
    
    // Siempre crear una nueva instancia
    return new Imap(this.config);
  }

  // Conectar a IMAP
  async connect() {
    return new Promise((resolve, reject) => {
      // Crear nueva conexión cada vez
      this.imap = this.createConnection();

      this.imap.once('ready', () => {
        resolve();
      });

      this.imap.once('error', (err) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  // Desconectar
  disconnect() {
    if (this.imap && this.imap.state !== 'disconnected') {
      try {
        this.imap.end();
      } catch (err) {
        console.error('Error al desconectar IMAP:', err.message);
      }
    }
    this.imap = null;
  }

  // Listar carpetas
  async listMailboxes() {
    try {
      await this.connect();
      
      return await new Promise((resolve, reject) => {
        this.imap.getBoxes((err, boxes) => {
          this.disconnect();
          if (err) {
            reject(err);
          } else {
            resolve(boxes);
          }
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  // Obtener correos
  async fetchEmails(mailbox = 'INBOX', limit = 50, searchCriteria = ['ALL']) {
    let connection = null;
    
    try {
      await this.connect();
      connection = this.imap;

      return await new Promise((resolve, reject) => {
        // Timeout de seguridad
        const timeout = setTimeout(() => {
          this.disconnect();
          reject(new Error('Timeout al obtener correos'));
        }, 30000);

        connection.openBox(mailbox, true, (err, box) => {
          if (err) {
            clearTimeout(timeout);
            this.disconnect();
            reject(err);
            return;
          }

          // Verificar que hay correos
          if (!box.messages.total || box.messages.total === 0) {
            clearTimeout(timeout);
            this.disconnect();
            resolve([]);
            return;
          }

          const totalMessages = box.messages.total;
          console.log(`Total de correos en buzón: ${totalMessages}`);
          
          // Obtener más correos para asegurar que capturamos todos los recientes
          // (algunos correos pueden tener fechas más antiguas que su posición en la bandeja)
          const maxToFetch = Math.min(totalMessages, limit * 5);
          const start = Math.max(1, totalMessages - maxToFetch + 1);
          const fetchRange = `${start}:${totalMessages}`;
          
          console.log(`Obteniendo correos del ${start} al ${totalMessages}`);

          const f = connection.fetch(fetchRange, { 
            bodies: '',
            struct: true
          });
          
          const emails = [];
          const parsePromises = [];

          f.on('message', (msg, seqno) => {
            const parsePromise = new Promise((resolveMsg, rejectMsg) => {
              let emailData = {
                id: seqno,
                messageId: '',
                from: '',
                to: '',
                cc: '',
                subject: '(Sin asunto)',
                date: new Date(),
                text: '',
                html: '',
                attachments: []
              };

              let chunks = [];

              msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                  chunks.push(chunk);
                });

                stream.once('end', () => {
                  const buffer = Buffer.concat(chunks);
                  
                  simpleParser(buffer, (err, parsed) => {
                    if (err) {
                      console.error('Error parsing email:', err);
                      resolveMsg(emailData);
                      return;
                    }

                    emailData.messageId = parsed.messageId || '';
                    emailData.from = parsed.from?.text || '';
                    emailData.to = parsed.to?.text || '';
                    emailData.cc = parsed.cc?.text || '';
                    emailData.subject = parsed.subject || '(Sin asunto)';
                    emailData.date = parsed.date || new Date();
                    emailData.text = parsed.text || '';
                    emailData.html = parsed.html || '';
                    emailData.attachments = parsed.attachments?.map(att => ({
                      filename: att.filename,
                      contentType: att.contentType,
                      size: att.size
                    })) || [];

                    resolveMsg(emailData);
                  });
                });
              });

              msg.once('end', () => {
                // El mensaje está completo, pero esperamos al parser
              });
            });

            parsePromises.push(parsePromise);
          });

          f.once('error', (err) => {
            clearTimeout(timeout);
            console.error('Error en fetch:', err);
            this.disconnect();
            reject(err);
          });

          f.once('end', async () => {
            try {
              // Esperar a que todos los correos se parseen
              const parsedEmails = await Promise.all(parsePromises);
              
              clearTimeout(timeout);
              this.disconnect();
              
              // Ordenar por FECHA (del más reciente al más antiguo)
              parsedEmails.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Más reciente primero
              });
              
              console.log(`✓ ${parsedEmails.length} correos obtenidos y ordenados por fecha`);
              resolve(parsedEmails.slice(0, limit));
            } catch (error) {
              clearTimeout(timeout);
              this.disconnect();
              reject(error);
            }
          });
        });
      }); // Cierre del openBox callback
    } catch (error) {
      console.error('Error en fetchEmails:', error);
      this.disconnect();
      throw error;
    }
  }

  // Buscar correos por criterios
  async searchEmails(criteria) {
    let connection = null;
    
    try {
      await this.connect();
      connection = this.imap;

      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.disconnect();
          reject(new Error('Timeout en búsqueda'));
        }, 30000);

        connection.openBox('INBOX', true, (err, box) => {
          if (err) {
            clearTimeout(timeout);
            this.disconnect();
            reject(err);
            return;
          }

          // Construir criterios de búsqueda IMAP
          const searchCriteria = this.buildSearchCriteria(criteria);

          connection.search(searchCriteria, (err, results) => {
            if (err) {
              clearTimeout(timeout);
              this.disconnect();
              reject(err);
              return;
            }

            if (!results || results.length === 0) {
              clearTimeout(timeout);
              this.disconnect();
              resolve([]);
              return;
            }

            const f = connection.fetch(results, { 
              bodies: '',
              struct: true
            });
            
            const parsePromises = [];

            f.on('message', (msg, seqno) => {
              const parsePromise = new Promise((resolveMsg, rejectMsg) => {
                let emailData = {
                  id: seqno,
                  messageId: '',
                  from: '',
                  to: '',
                  subject: '(Sin asunto)',
                  date: new Date(),
                  text: '',
                  html: ''
                };

                let chunks = [];

                msg.on('body', (stream, info) => {
                  stream.on('data', (chunk) => {
                    chunks.push(chunk);
                  });

                  stream.once('end', () => {
                    const buffer = Buffer.concat(chunks);
                    
                    simpleParser(buffer, (err, parsed) => {
                      if (err) {
                        resolveMsg(emailData);
                        return;
                      }

                      emailData.messageId = parsed.messageId || '';
                      emailData.from = parsed.from?.text || '';
                      emailData.to = parsed.to?.text || '';
                      emailData.subject = parsed.subject || '(Sin asunto)';
                      emailData.date = parsed.date || new Date();
                      emailData.text = parsed.text || '';
                      emailData.html = parsed.html || '';

                      resolveMsg(emailData);
                    });
                  });
                });

                msg.once('end', () => {
                  // Esperamos al parser
                });
              });

              parsePromises.push(parsePromise);
            });

            f.once('error', (err) => {
              clearTimeout(timeout);
              this.disconnect();
              reject(err);
            });

            f.once('end', async () => {
              try {
                const parsedEmails = await Promise.all(parsePromises);
                
                clearTimeout(timeout);
                this.disconnect();
                
                // Ordenar por FECHA (del más reciente al más antiguo)
                parsedEmails.sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  return dateB - dateA; // Más reciente primero
                });
                
                resolve(parsedEmails);
              } catch (error) {
                clearTimeout(timeout);
                this.disconnect();
                reject(error);
              }
            });
          });
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  // Construir criterios de búsqueda
  buildSearchCriteria(criteria) {
    const searchArray = [];

    if (criteria.from) {
      searchArray.push(['FROM', criteria.from]);
    }
    if (criteria.to) {
      searchArray.push(['TO', criteria.to]);
    }
    if (criteria.subject) {
      searchArray.push(['SUBJECT', criteria.subject]);
    }
    if (criteria.body) {
      searchArray.push(['BODY', criteria.body]);
    }
    if (criteria.since) {
      searchArray.push(['SINCE', criteria.since]);
    }
    if (criteria.before) {
      searchArray.push(['BEFORE', criteria.before]);
    }
    if (criteria.unseen) {
      searchArray.push('UNSEEN');
    }

    return searchArray.length > 0 ? searchArray : ['ALL'];
  }

  // Eliminar correo
  async deleteEmail(emailId) {
    let connection = null;
    
    try {
      await this.connect();
      connection = this.imap;

      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.disconnect();
          reject(new Error('Timeout al eliminar correo'));
        }, 15000);

        connection.openBox('INBOX', false, (err, box) => {
          if (err) {
            clearTimeout(timeout);
            this.disconnect();
            reject(err);
            return;
          }

          connection.addFlags(emailId, ['\\Deleted'], (err) => {
            if (err) {
              clearTimeout(timeout);
              this.disconnect();
              reject(err);
              return;
            }

            connection.expunge((err) => {
              clearTimeout(timeout);
              this.disconnect();
              
              if (err) {
                reject(err);
              } else {
                resolve({ success: true, message: 'Email deleted' });
              }
            });
          });
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  // Marcar como leído
  async markAsRead(emailId) {
    let connection = null;
    
    try {
      await this.connect();
      connection = this.imap;

      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.disconnect();
          reject(new Error('Timeout al marcar como leído'));
        }, 15000);

        connection.openBox('INBOX', false, (err, box) => {
          if (err) {
            clearTimeout(timeout);
            this.disconnect();
            reject(err);
            return;
          }

          connection.addFlags(emailId, ['\\Seen'], (err) => {
            clearTimeout(timeout);
            this.disconnect();
            
            if (err) {
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        });
      });
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }
}

module.exports = new IMAPService();
