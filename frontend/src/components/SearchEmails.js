import React, { useState } from 'react';
import emailService from '../services/emailService';

function SearchEmails({ onSearchResults }) {
  const [criteria, setCriteria] = useState({
    from: '',
    to: '',
    subject: '',
    body: '',
    since: '',
    before: '',
    unseen: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCriteria({
      ...criteria,
      [e.target.name]: value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Filtrar campos vacíos
    const searchCriteria = Object.fromEntries(
      Object.entries(criteria).filter(([_, value]) => {
        if (typeof value === 'boolean') return value;
        return value !== '';
      })
    );

    if (Object.keys(searchCriteria).length === 0) {
      setMessage({ type: 'error', text: 'Debes especificar al menos un criterio de búsqueda' });
      setLoading(false);
      return;
    }

    try {
      const result = await emailService.searchEmails(searchCriteria);
      
      if (result.emails.length === 0) {
        setMessage({ type: 'info', text: 'No se encontraron correos con esos criterios' });
      } else {
        setMessage({ type: 'success', text: `Se encontraron ${result.count} correo(s)` });
      }

      if (onSearchResults) {
        onSearchResults(result.emails);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCriteria({
      from: '',
      to: '',
      subject: '',
      body: '',
      since: '',
      before: '',
      unseen: false
    });
    setMessage(null);
    if (onSearchResults) {
      onSearchResults(null);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>🔍 Buscar Correos</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSearch}>
        <div className="search-form">
          <div className="form-group">
            <label htmlFor="from">De:</label>
            <input
              type="text"
              id="from"
              name="from"
              className="form-control"
              value={criteria.from}
              onChange={handleChange}
              placeholder="remitente@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="to">Para:</label>
            <input
              type="text"
              id="to"
              name="to"
              className="form-control"
              value={criteria.to}
              onChange={handleChange}
              placeholder="destinatario@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Asunto:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-control"
              value={criteria.subject}
              onChange={handleChange}
              placeholder="Palabras en el asunto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Cuerpo del mensaje:</label>
            <input
              type="text"
              id="body"
              name="body"
              className="form-control"
              value={criteria.body}
              onChange={handleChange}
              placeholder="Palabras en el mensaje"
            />
          </div>

          <div className="form-group">
            <label htmlFor="since">Desde (fecha):</label>
            <input
              type="date"
              id="since"
              name="since"
              className="form-control"
              value={criteria.since}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="before">Hasta (fecha):</label>
            <input
              type="date"
              id="before"
              name="before"
              className="form-control"
              value={criteria.before}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="unseen"
              checked={criteria.unseen}
              onChange={handleChange}
            />
            Solo correos no leídos
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '🔍 Buscando...' : '🔍 Buscar'}
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            🗑️ Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchEmails;
