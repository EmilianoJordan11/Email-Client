import React, { useState } from 'react';
import { format } from 'date-fns';
import emailService from '../services/emailService';

function EmailDetail({ email, protocol, onClose, onEmailSent }) {
  const [showReply, setShowReply] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [forwardMessage, setForwardMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!email) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          Selecciona un correo para ver los detalles
        </p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), "dd/MM/yyyy 'a las' HH:mm");
    } catch {
      return date.toString();
    }
  };

  const handleReply = async (replyAll = false) => {
    if (!replyText.trim()) {
      setMessage({ type: 'error', text: 'El mensaje de respuesta no puede estar vacío' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await emailService.replyEmail(email, replyText, replyAll);
      setMessage({ type: 'success', text: '¡Respuesta enviada exitosamente!' });
      setReplyText('');
      setShowReply(false);
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!forwardTo.trim()) {
      setMessage({ type: 'error', text: 'Debes especificar un destinatario' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await emailService.forwardEmail(email, forwardTo, forwardMessage);
      setMessage({ type: 'success', text: '¡Correo reenviado exitosamente!' });
      setForwardTo('');
      setForwardMessage('');
      setShowForward(false);
      
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este correo?')) {
      return;
    }

    try {
      await emailService.deleteEmail(email.id, protocol);
      setMessage({ type: 'success', text: 'Correo eliminado exitosamente' });
      
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="email-detail">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="email-detail-header">
        <h2 className="email-detail-subject">{email.subject}</h2>
        
        <div className="email-meta">
          <div><strong>De:</strong> {email.from}</div>
          <div><strong>Para:</strong> {email.to}</div>
          {email.cc && <div><strong>CC:</strong> {email.cc}</div>}
          <div><strong>Fecha:</strong> {formatDate(email.date)}</div>
          {email.attachments && email.attachments.length > 0 && (
            <div>
              <strong>Adjuntos:</strong> {email.attachments.map(att => att.filename).join(', ')}
            </div>
          )}
        </div>

        <div className="email-actions">
          <button 
            onClick={() => {
              setShowReply(!showReply);
              setShowForward(false);
            }}
            className="btn btn-primary"
          >
            ↩️ Responder
          </button>
          <button 
            onClick={() => handleReply(true)}
            className="btn btn-primary"
            disabled={!showReply || loading}
          >
            ↩️↩️ Responder a todos
          </button>
          <button 
            onClick={() => {
              setShowForward(!showForward);
              setShowReply(false);
            }}
            className="btn btn-secondary"
          >
            ➡️ Reenviar
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {showReply && (
        <div className="card" style={{ marginTop: '1rem', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ marginBottom: '1rem' }}>Responder</h3>
          <textarea
            className="form-control"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows="5"
          />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => handleReply(false)}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
            <button 
              onClick={() => {
                setShowReply(false);
                setReplyText('');
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showForward && (
        <div className="card" style={{ marginTop: '1rem', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ marginBottom: '1rem' }}>Reenviar a</h3>
          <div className="form-group">
            <label>Destinatario:</label>
            <input
              type="email"
              className="form-control"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="destinatario@ejemplo.com"
            />
          </div>
          <div className="form-group">
            <label>Mensaje adicional (opcional):</label>
            <textarea
              className="form-control"
              value={forwardMessage}
              onChange={(e) => setForwardMessage(e.target.value)}
              placeholder="Mensaje adicional..."
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleForward}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Reenviando...' : 'Reenviar'}
            </button>
            <button 
              onClick={() => {
                setShowForward(false);
                setForwardTo('');
                setForwardMessage('');
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="email-body">
        <h3 style={{ marginBottom: '1rem' }}>Mensaje:</h3>
        {email.html ? (
          <div dangerouslySetInnerHTML={{ __html: email.html }} />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {email.text}
          </pre>
        )}
      </div>
    </div>
  );
}

export default EmailDetail;
