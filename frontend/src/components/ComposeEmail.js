import React, { useState } from 'react';
import emailService from '../services/emailService';

function ComposeEmail({ onEmailSent }) {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    text: '',
    html: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await emailService.sendEmail(formData);
      setMessage({ type: 'success', text: '¡Correo enviado exitosamente!' });
      
      // Limpiar formulario
      setFormData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        text: '',
        html: ''
      });

      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Redactar Correo</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="to">Para: *</label>
          <input
            type="email"
            id="to"
            name="to"
            className="form-control"
            value={formData.to}
            onChange={handleChange}
            placeholder="destinatario@ejemplo.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cc">CC:</label>
          <input
            type="text"
            id="cc"
            name="cc"
            className="form-control"
            value={formData.cc}
            onChange={handleChange}
            placeholder="cc@ejemplo.com (separar múltiples con comas)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bcc">BCC:</label>
          <input
            type="text"
            id="bcc"
            name="bcc"
            className="form-control"
            value={formData.bcc}
            onChange={handleChange}
            placeholder="bcc@ejemplo.com (separar múltiples con comas)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Asunto: *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="form-control"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Asunto del correo"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Mensaje: *</label>
          <textarea
            id="text"
            name="text"
            className="form-control"
            value={formData.text}
            onChange={handleChange}
            placeholder="Escribe tu mensaje aquí..."
            rows="10"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : '✉️ Enviar Correo'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setFormData({
              to: '', cc: '', bcc: '', subject: '', text: '', html: ''
            })}
          >
            🗑️ Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComposeEmail;
