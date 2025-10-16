import React, { useState } from 'react';
import ComposeEmail from './components/ComposeEmail';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import SearchEmails from './components/SearchEmails';

function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState('imap');
  const [searchResults, setSearchResults] = useState(null);

  const handleEmailSelect = (email, protocol) => {
    setSelectedEmail(email);
    setSelectedProtocol(protocol);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    if (results && results.length > 0) {
      setActiveTab('search-results');
    }
  };

  const renderSearchResults = () => {
    if (!searchResults || searchResults.length === 0) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-center text-gray-500 py-8">
            No hay resultados de búsqueda
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-medium">Resultados de Búsqueda ({searchResults.length})</h2>
        <div className="flex flex-col gap-2">
          {searchResults.map((email) => (
            <div
              key={email.id}
              className="p-4 bg-white rounded border-l-4 border-l-transparent hover:bg-gray-50 hover:border-l-blue-600 cursor-pointer transition-all"
              onClick={() => handleEmailSelect(email, 'imap')}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{email.from}</div>
                  <div className="font-medium text-blue-600">{email.subject}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(email.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                {(email.text || '').substring(0, 100)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-8 py-4 shadow-md">
        <h1 className="text-2xl font-medium">📧 Cliente de Correo Electrónico</h1>
        <p className="mt-2 text-sm opacity-90">
          Soporte para SMTP, IMAP y POP3
        </p>
      </header>

      <div className="w-[95vw] mx-auto px-8 py-8">
        <nav className="flex gap-4 mb-8 border-b-2 border-gray-300 pb-0">
          <button
            className={`px-6 py-3 border-b-4 transition-all ${
              activeTab === 'inbox' 
                ? 'text-blue-700 border-blue-700 font-medium' 
                : 'text-gray-500 border-transparent hover:text-blue-700'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            📥 Bandeja de Entrada
          </button>
          <button
            className={`px-6 py-3 border-b-4 transition-all ${
              activeTab === 'compose' 
                ? 'text-blue-700 border-blue-700 font-medium' 
                : 'text-gray-500 border-transparent hover:text-blue-700'
            }`}
            onClick={() => setActiveTab('compose')}
          >
            ✏️ Redactar
          </button>
          <button
            className={`px-6 py-3 border-b-4 transition-all ${
              activeTab === 'search' 
                ? 'text-blue-700 border-blue-700 font-medium' 
                : 'text-gray-500 border-transparent hover:text-blue-700'
            }`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Buscar
          </button>
          {searchResults && searchResults.length > 0 && (
            <button
              className={`px-6 py-3 border-b-4 transition-all ${
                activeTab === 'search-results' 
                  ? 'text-blue-700 border-blue-700 font-medium' 
                  : 'text-gray-500 border-transparent hover:text-blue-700'
              }`}
              onClick={() => setActiveTab('search-results')}
            >
              📋 Resultados ({searchResults.length})
            </button>
          )}
        </nav>

        {activeTab === 'inbox' && (
          <div className="grid grid-cols-2 gap-4">
            <EmailList onEmailSelect={handleEmailSelect} />
            <EmailDetail 
              email={selectedEmail} 
              protocol={selectedProtocol}
              onClose={() => setSelectedEmail(null)}
              onEmailSent={() => setActiveTab('inbox')}
            />
          </div>
        )}

        {activeTab === 'compose' && (
          <ComposeEmail onEmailSent={() => setActiveTab('inbox')} />
        )}

        {activeTab === 'search' && (
          <div>
            <SearchEmails onSearchResults={handleSearchResults} />
          </div>
        )}

        {activeTab === 'search-results' && (
          <div className="grid grid-cols-2 gap-4">
            {renderSearchResults()}
            <EmailDetail 
              email={selectedEmail} 
              protocol="imap"
              onClose={() => setSelectedEmail(null)}
              onEmailSent={() => {
                setSearchResults(null);
                setActiveTab('inbox');
              }}
            />
          </div>
        )}
      </div>

      <footer className="text-center px-8 py-8 text-gray-500 border-t border-gray-300 mt-8">
        <p>Cliente de Correo - Soporte SMTP, IMAP y POP3</p>
        <p className="text-sm mt-2">
          Implementado con Node.js, Express y React
        </p>
      </footer>
    </div>
  );
}

export default App;
