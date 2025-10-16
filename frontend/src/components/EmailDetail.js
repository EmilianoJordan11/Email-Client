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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-center text-gray-500 py-8">
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
    <div className="bg-white rounded-lg p-8 shadow-sm">
      {message && (
        <div className={`px-4 py-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="border-b border-gray-300 pb-4 mb-4">
        <h2 className="text-2xl font-medium mb-4">{email.subject}</h2>
        
        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <div><strong className="text-gray-800">De:</strong> {email.from}</div>
          <div><strong className="text-gray-800">Para:</strong> {email.to}</div>
          {email.cc && <div><strong className="text-gray-800">CC:</strong> {email.cc}</div>}
          <div><strong className="text-gray-800">Fecha:</strong> {formatDate(email.date)}</div>
          {email.attachments && email.attachments.length > 0 && (
            <div>
              <strong className="text-gray-800">Adjuntos:</strong> {email.attachments.map(att => att.filename).join(', ')}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-300">
          <button 
            onClick={() => {
              setShowReply(!showReply);
              setShowForward(false);
            }}
            className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 transition-all inline-flex items-center gap-2"
          >
            ↩️ Responder
          </button>
          <button 
            onClick={() => handleReply(true)}
            className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            disabled={!showReply || loading}
          >
            ↩️↩️ Responder a todos
          </button>
          <button 
            onClick={() => {
              setShowForward(!showForward);
              setShowReply(false);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all inline-flex items-center gap-2"
          >
            ➡️ Reenviar
          </button>
          <button 
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-all inline-flex items-center gap-2"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {showReply && (
        <div className="mt-4 bg-gray-50 rounded-lg p-6">
          <h3 className="mb-4 text-lg font-medium">Responder</h3>
          <textarea
            className="w-full px-3 py-3 border border-gray-300 rounded resize-y min-h-[100px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows="5"
          />
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => handleReply(false)}
              className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
            <button 
              onClick={() => {
                setShowReply(false);
                setReplyText('');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showForward && (
        <div className="mt-4 bg-gray-50 rounded-lg p-6">
          <h3 className="mb-4 text-lg font-medium">Reenviar a</h3>
          <div className="mb-4">
            <label className="block mb-2 text-gray-800 font-medium">Destinatario:</label>
            <input
              type="email"
              className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="destinatario@ejemplo.com"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-800 font-medium">Mensaje adicional (opcional):</label>
            <textarea
              className="w-full px-3 py-3 border border-gray-300 rounded resize-y min-h-[100px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={forwardMessage}
              onChange={(e) => setForwardMessage(e.target.value)}
              placeholder="Mensaje adicional..."
              rows="3"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleForward}
              className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="py-4 leading-relaxed text-gray-800">
        <h3 className="mb-4 text-lg font-medium">Mensaje:</h3>
        {email.html ? (
          <div dangerouslySetInnerHTML={{ __html: email.html }} />
        ) : (
          <pre className="whitespace-pre-wrap font-sans">
            {email.text}
          </pre>
        )}
      </div>
    </div>
  );
}

export default EmailDetail;
