// Script de prueba rápida para verificar la conexión IMAP
require('dotenv').config();
const imapService = require('./backend/services/imapService');

async function testIMAP() {
  console.log('🔄 Probando conexión IMAP...\n');
  
  try {
    console.log('📧 Configuración:');
    console.log(`   Usuario: ${process.env.EMAIL_USER}`);
    console.log(`   Host IMAP: ${process.env.IMAP_HOST}:${process.env.IMAP_PORT}\n`);
    
    console.log('📥 Obteniendo últimos 50 correos...');
    const emails = await imapService.fetchEmails('INBOX', 50);
    
    console.log(`\n✅ Éxito! Se obtuvieron ${emails.length} correos (ordenados por fecha):\n`);
    
    emails.forEach((email, index) => {
      console.log(`${index + 1}. [ID: ${email.id}]`);
      console.log(`   De: ${email.from}`);
      console.log(`   Asunto: ${email.subject}`);
      console.log(`   Fecha: ${email.date}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

testIMAP();
