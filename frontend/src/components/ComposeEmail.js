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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-medium">Redactar Correo</h2>
      
      {message && (
        <div className={`px-4 py-3 rounded mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="to" className="block mb-2 text-gray-800 font-medium">Para: *</label>
          <input
            type="email"
            id="to"
            name="to"
            className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={formData.to}
            onChange={handleChange}
            placeholder="destinatario@ejemplo.com"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cc" className="block mb-2 text-gray-800 font-medium">CC:</label>
          <input
            type="text"
            id="cc"
            name="cc"
            className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={formData.cc}
            onChange={handleChange}
            placeholder="cc@ejemplo.com (separar múltiples con comas)"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bcc" className="block mb-2 text-gray-800 font-medium">BCC:</label>
          <input
            type="text"
            id="bcc"
            name="bcc"
            className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={formData.bcc}
            onChange={handleChange}
            placeholder="bcc@ejemplo.com (separar múltiples con comas)"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="subject" className="block mb-2 text-gray-800 font-medium">Asunto: *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="w-full px-3 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Asunto del correo"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="text" className="block mb-2 text-gray-800 font-medium">Mensaje: *</label>
          <textarea
            id="text"
            name="text"
            className="w-full px-3 py-3 border border-gray-300 rounded resize-y min-h-[100px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={formData.text}
            onChange={handleChange}
            placeholder="Escribe tu mensaje aquí..."
            rows="10"
            required
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2" 
            disabled={loading}
          >
            {loading ? 'Enviando...' : '✉️ Enviar Correo'}
          </button>
          <button 
            type="button" 
            className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all inline-flex items-center gap-2"
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
