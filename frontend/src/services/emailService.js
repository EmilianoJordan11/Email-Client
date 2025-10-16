import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/email';

class EmailService {
  // ============= SMTP =============
  
  async sendEmail(emailData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/send`, emailData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al enviar correo');
    }
  }

  async forwardEmail(originalEmail, to, additionalMessage = '') {
    try {
      const response = await axios.post(`${API_BASE_URL}/forward`, {
        originalEmail,
        to,
        additionalMessage
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al reenviar correo');
    }
  }

  async replyEmail(originalEmail, replyText, replyAll = false) {
    try {
      const response = await axios.post(`${API_BASE_URL}/reply`, {
        originalEmail,
        replyText,
        replyAll
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al responder correo');
    }
  }

  // ============= IMAP =============

  async getEmails(limit = 50, mailbox = 'INBOX') {
    try {
      const response = await axios.get(`${API_BASE_URL}/inbox`, {
        params: { limit, mailbox }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener correos');
    }
  }

  async getMailboxes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/mailboxes`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener carpetas');
    }
  }

  async searchEmails(criteria) {
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, criteria);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al buscar correos');
    }
  }

  async deleteEmail(emailId, protocol = 'imap') {
    try {
      const url = protocol === 'pop3' 
        ? `${API_BASE_URL}/pop3/${emailId}`
        : `${API_BASE_URL}/imap/${emailId}`;
      
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar correo');
    }
  }

  async markAsRead(emailId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/mark-read/${emailId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al marcar como leído');
    }
  }

  // ============= POP3 =============

  async getEmailsPOP3(limit = 50) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pop3/inbox`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener correos POP3');
    }
  }

  async getPOP3Info() {
    try {
      const response = await axios.get(`${API_BASE_URL}/pop3/info`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al obtener info POP3');
    }
  }

  // ============= CONFIGURACIÓN =============

  async configure(config) {
    try {
      const response = await axios.post(`${API_BASE_URL}/configure`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al configurar');
    }
  }
}

export default new EmailService();
