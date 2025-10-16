import React, { useState } from 'react';
import './App.css';
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
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No hay resultados de búsqueda
          </p>
        </div>
      );
    }

    return (
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Resultados de Búsqueda ({searchResults.length})</h2>
        <div className="email-list">
          {searchResults.map((email) => (
            <div
              key={email.id}
              className="email-item"
              onClick={() => handleEmailSelect(email, 'imap')}
            >
              <div className="email-header">
                <div>
                  <div className="email-from">{email.from}</div>
                  <div className="email-subject">{email.subject}</div>
                </div>
                <div className="email-date">
                  {new Date(email.date).toLocaleDateString()}
                </div>
              </div>
              <div className="email-preview">
                {(email.text || '').substring(0, 100)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📧 Cliente de Correo Electrónico</h1>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Soporte para SMTP, IMAP y POP3
        </p>
      </header>

      <div className="container">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            📥 Bandeja de Entrada
          </button>
          <button
            className={`nav-tab ${activeTab === 'compose' ? 'active' : ''}`}
            onClick={() => setActiveTab('compose')}
          >
            ✏️ Redactar
          </button>
          <button
            className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Buscar
          </button>
          {searchResults && searchResults.length > 0 && (
            <button
              className={`nav-tab ${activeTab === 'search-results' ? 'active' : ''}`}
              onClick={() => setActiveTab('search-results')}
            >
              📋 Resultados ({searchResults.length})
            </button>
          )}
        </nav>

        {activeTab === 'inbox' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#666',
        borderTop: '1px solid #e0e0e0',
        marginTop: '2rem'
      }}>
        <p>Cliente de Correo - Soporte SMTP, IMAP y POP3</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Implementado con Node.js, Express y React
        </p>
      </footer>
    </div>
  );
}

export default App;
