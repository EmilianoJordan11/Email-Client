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
    <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">📥 Bandeja de Entrada</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm flex items-center gap-1">
            Mostrar:
            <select 
              value={limit} 
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-auto px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
            className="w-auto px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="imap">IMAP</option>
            <option value="pop3">POP3</option>
          </select>
          <button 
            onClick={fetchEmails} 
            className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
            disabled={loading}
          >
            {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="spinner"></div>
          <p className="mt-4">Cargando correos...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {emails.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay correos para mostrar
            </p>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 bg-white rounded border-l-4 cursor-pointer transition-all ${
                  selectedId === email.id 
                    ? 'bg-blue-50 border-l-blue-600' 
                    : 'border-l-transparent hover:bg-gray-50 hover:border-l-blue-600'
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{email.from}</div>
                    <div className="font-medium text-blue-600">{email.subject}</div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="text-sm text-gray-500">{formatDate(email.date)}</div>
                    <button
                      onClick={(e) => handleDelete(email.id, e)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  {getPreview(email)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default EmailList;
