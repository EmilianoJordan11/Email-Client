const express = require('express');
const router = express.Router();
const smtpService = require('../services/smtpService');
const imapService = require('../services/imapService');
const pop3Service = require('../services/pop3Service');

// ============= SMTP ROUTES (Envío) =============

// Enviar correo
router.post('/send', async (req, res) => {
  try {
    const { to, cc, bcc, subject, text, html, attachments } = req.body;
    
    const result = await smtpService.sendEmail({
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reenviar correo
router.post('/forward', async (req, res) => {
  try {
    const { originalEmail, to, additionalMessage } = req.body;
    
    const result = await smtpService.forwardEmail(originalEmail, to, additionalMessage);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Responder correo
router.post('/reply', async (req, res) => {
  try {
    const { originalEmail, replyText, replyAll } = req.body;
    
    const result = await smtpService.replyEmail(originalEmail, replyText, replyAll);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= IMAP ROUTES (Recepción) =============

// Obtener correos con IMAP
router.get('/inbox', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const mailbox = req.query.mailbox || 'INBOX';
    
    const emails = await imapService.fetchEmails(mailbox, limit);
    
    res.json({ 
      success: true, 
      count: emails.length,
      emails 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar carpetas IMAP
router.get('/mailboxes', async (req, res) => {
  try {
    const mailboxes = await imapService.listMailboxes();
    
    res.json({ 
      success: true, 
      mailboxes 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar correos por criterios
router.post('/search', async (req, res) => {
  try {
    const criteria = req.body;
    
    const emails = await imapService.searchEmails(criteria);
    
    res.json({ 
      success: true, 
      count: emails.length,
      emails 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar correo (IMAP)
router.delete('/imap/:emailId', async (req, res) => {
  try {
    const emailId = req.params.emailId;
    
    const result = await imapService.deleteEmail(emailId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar como leído
router.put('/mark-read/:emailId', async (req, res) => {
  try {
    const emailId = req.params.emailId;
    
    const result = await imapService.markAsRead(emailId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= POP3 ROUTES (Recepción alternativa) =============

// Obtener correos con POP3
router.get('/pop3/inbox', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const emails = await pop3Service.fetchEmails(limit);
    
    res.json({ 
      success: true, 
      count: emails.length,
      emails 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Información del buzón POP3
router.get('/pop3/info', async (req, res) => {
  try {
    const info = await pop3Service.getMailboxInfo();
    
    res.json({ 
      success: true, 
      ...info 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar correo (POP3)
router.delete('/pop3/:msgNumber', async (req, res) => {
  try {
    const msgNumber = parseInt(req.params.msgNumber);
    
    const result = await pop3Service.deleteEmail(msgNumber);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CONFIGURACIÓN =============

// Configurar credenciales
router.post('/configure', async (req, res) => {
  try {
    const { smtp, imap, pop3 } = req.body;
    
    if (smtp) {
      smtpService.configure(smtp);
    }
    if (imap) {
      imapService.configure(imap);
    }
    if (pop3) {
      pop3Service.configure(pop3);
    }
    
    res.json({ 
      success: true, 
      message: 'Configuration updated' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
