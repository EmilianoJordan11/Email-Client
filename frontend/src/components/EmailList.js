import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import emailService from '../services/emailService';

function EmailList({ onEmailSelect }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [protocol, setProtocol] = useState('imap'); // 'imap' o 'pop3'
  const [limit, setLimit] = useState(20); // Cantidad de correos a mostrar

  useEffect(() => {
    fetchEmails();
  }, [protocol, limit]);

  const fetchEmails = async () => {
    setLoading(true);
    setMessage(null);

    try {
      let result;
      if (protocol === 'imap') {
        result = await emailService.getEmails(limit);
      } else {
        result = await emailService.getEmailsPOP3(limit);
      }
      
      setEmails(result.emails || []);
      if (result.emails.length === 0) {
        setMessage({ type: 'info', text: 'No hay correos en la bandeja de entrada' });
      } else {
        setMessage({ type: 'success', text: `${result.emails.length} correo(s) cargado(s)` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedId(email.id);
    if (onEmailSelect) {
      onEmailSelect(email, protocol);
    }
  };

  const handleDelete = async (emailId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este correo?')) {
      return;
    }

    try {
      await emailService.deleteEmail(emailId, protocol);
      setMessage({ type: 'success', text: 'Correo eliminado exitosamente' });
      fetchEmails();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm');
    } catch {
      return date.toString();
    }
  };

  const getPreview = (email) => {
    const text = email.text || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  return (
    <div className="card">
      <div style={{ width:'50vw' ,display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📥 Bandeja de Entrada</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Mostrar:
            <select 
              value={limit} 
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="form-control"
              style={{ width: 'auto', padding: '0.5rem' }}
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </label>
          <select 
            value={protocol} 
            onChange={(e) => setProtocol(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="imap">IMAP</option>
            <option value="pop3">POP3</option>
          </select>
          <button onClick={fetchEmails} className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando correos...</p>
        </div>
      ) : (
        <div className="email-list">
          {emails.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No hay correos para mostrar
            </p>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className={`email-item ${selectedId === email.id ? 'selected' : ''}`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="email-header">
                  <div>
                    <div className="email-from">{email.from}</div>
                    <div className="email-subject">{email.subject}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                    <div className="email-date">{formatDate(email.date)}</div>
                    <button
                      onClick={(e) => handleDelete(email.id, e)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="email-preview">{getPreview(email)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default EmailList;
