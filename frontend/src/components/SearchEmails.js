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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-medium">🔍 Buscar Correos</h2>

      {message && (
        <div className={`px-4 py-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="from" className="block mb-2 text-gray-800 font-medium">De:</label>
            <input
              type="text"
              id="from"
              name="from"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.from}
              onChange={handleChange}
              placeholder="remitente@ejemplo.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="to" className="block mb-2 text-gray-800 font-medium">Para:</label>
            <input
              type="text"
              id="to"
              name="to"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.to}
              onChange={handleChange}
              placeholder="destinatario@ejemplo.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="block mb-2 text-gray-800 font-medium">Asunto:</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.subject}
              onChange={handleChange}
              placeholder="Palabras en el asunto"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="body" className="block mb-2 text-gray-800 font-medium">Cuerpo del mensaje:</label>
            <input
              type="text"
              id="body"
              name="body"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.body}
              onChange={handleChange}
              placeholder="Palabras en el mensaje"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="since" className="block mb-2 text-gray-800 font-medium">Desde (fecha):</label>
            <input
              type="date"
              id="since"
              name="since"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.since}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="before" className="block mb-2 text-gray-800 font-medium">Hasta (fecha):</label>
            <input
              type="date"
              id="before"
              name="before"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={criteria.before}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="unseen"
              className="w-4 h-4"
              checked={criteria.unseen}
              onChange={handleChange}
            />
            <span className="text-gray-800">Solo correos no leídos</span>
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2" 
            disabled={loading}
          >
            {loading ? '🔍 Buscando...' : '🔍 Buscar'}
          </button>
          <button 
            type="button" 
            onClick={handleClear} 
            className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all inline-flex items-center gap-2"
          >
            🗑️ Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchEmails;
