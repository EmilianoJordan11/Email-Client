# 📧 Cliente de Correo Electrónico

Cliente de correo completo con soporte para **SMTP**, **IMAP** y **POP3** desarrollado con Node.js y React.

## ✨ Características

- ✅ **Envío de correos** mediante SMTP
- ✅ **Recepción de correos** mediante IMAP y POP3
- ✅ **Responder correos** (individual o a todos)
- ✅ **Reenviar correos**
- ✅ **Eliminar correos**
- ✅ **Búsqueda avanzada** por múltiples criterios:
  - Remitente
  - Destinatario
  - Asunto
  - Cuerpo del mensaje
  - Rango de fechas
  - Estado de lectura
- ✅ Interfaz web moderna y responsiva
- ✅ Soporte para archivos adjuntos
- ✅ Cambio entre protocolos IMAP y POP3

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de correo con acceso SMTP/IMAP/POP3

### Paso 1: Clonar e instalar dependencias

```powershell
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### Paso 2: Configurar variables de entorno

1. Copiar el archivo de ejemplo:
```powershell
Copy-Item .env.example .env
```

2. Editar el archivo `.env` con tus credenciales:

```env
# Configuración del servidor
PORT=5000

# Configuración de correo (ejemplo con Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion

# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Configuración IMAP
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true

# Configuración POP3
POP3_HOST=pop.gmail.com
POP3_PORT=995
POP3_SECURE=true
```

### Configuración para Gmail

Para usar Gmail, necesitas crear una **Contraseña de Aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (actívala si no lo está)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `EMAIL_PASSWORD`

### Configuración para otros proveedores

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
POP3_HOST=outlook.office365.com
POP3_PORT=995
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
POP3_HOST=pop.mail.yahoo.com
POP3_PORT=995
```

## 🎯 Uso

### Iniciar el proyecto completo

```powershell
# Opción 1: Iniciar backend y frontend simultáneamente
npm run dev-all

# Opción 2: Iniciar por separado
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

### Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📚 Estructura del Proyecto

```
TP7/
├── backend/
│   ├── routes/
│   │   └── emailRoutes.js      # Rutas de la API
│   ├── services/
│   │   ├── smtpService.js      # Servicio SMTP (envío)
│   │   ├── imapService.js      # Servicio IMAP (recepción)
│   │   └── pop3Service.js      # Servicio POP3 (recepción)
│   └── server.js               # Servidor Express
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── ComposeEmail.js     # Redactar correo
│       │   ├── EmailList.js        # Lista de correos
│       │   ├── EmailDetail.js      # Detalle del correo
│       │   └── SearchEmails.js     # Búsqueda
│       ├── services/
│       │   └── emailService.js     # Cliente API
│       ├── App.js
│       ├── App.css
│       └── index.js
├── .env                        # Configuración (crear desde .env.example)
├── .env.example
├── package.json
└── README.md
```

## 🔌 API Endpoints

### SMTP (Envío)

- `POST /api/email/send` - Enviar correo
- `POST /api/email/reply` - Responder correo
- `POST /api/email/forward` - Reenviar correo

### IMAP (Recepción)

- `GET /api/email/inbox` - Obtener correos
- `GET /api/email/mailboxes` - Listar carpetas
- `POST /api/email/search` - Buscar correos
- `DELETE /api/email/imap/:emailId` - Eliminar correo
- `PUT /api/email/mark-read/:emailId` - Marcar como leído

### POP3 (Recepción)

- `GET /api/email/pop3/inbox` - Obtener correos
- `GET /api/email/pop3/info` - Info del buzón
- `DELETE /api/email/pop3/:msgNumber` - Eliminar correo

### Configuración

- `POST /api/email/configure` - Configurar credenciales

## 💡 Ejemplos de Uso

### Enviar un correo

```javascript
POST /api/email/send
{
  "to": "destinatario@ejemplo.com",
  "subject": "Asunto del correo",
  "text": "Contenido del mensaje",
  "cc": "copia@ejemplo.com",
  "bcc": "copia-oculta@ejemplo.com"
}
```

### Buscar correos

```javascript
POST /api/email/search
{
  "from": "remitente@ejemplo.com",
  "subject": "importante",
  "since": "2024-01-01",
  "unseen": true
}
```

### Responder correo

```javascript
POST /api/email/reply
{
  "originalEmail": { ... },
  "replyText": "Tu respuesta aquí",
  "replyAll": false
}
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Nodemailer** - Cliente SMTP
- **node-imap** - Cliente IMAP
- **poplib** - Cliente POP3
- **mailparser** - Parser de correos

### Frontend
- **React** - Librería UI
- **Axios** - Cliente HTTP
- **date-fns** - Formateo de fechas

## ⚠️ Notas Importantes

1. **Seguridad**: Nunca compartas tu archivo `.env` ni subas credenciales a repositorios públicos
2. **Gmail**: Requiere autenticación de 2 factores y contraseña de aplicación
3. **Límites**: Algunos proveedores tienen límites de envío diario
4. **Firewall**: Asegúrate de que los puertos SMTP/IMAP/POP3 no estén bloqueados

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las credenciales en `.env` sean correctas
- Para Gmail, usa una contraseña de aplicación, no tu contraseña normal
- Habilita "Acceso de aplicaciones menos seguras" si es necesario

### No se cargan los correos
- Verifica la conexión a internet
- Comprueba que los puertos IMAP/POP3 no estén bloqueados
- Revisa los logs del servidor para más detalles

### Error CORS
- Asegúrate de que el backend esté ejecutándose en el puerto 5000
- El frontend tiene configurado el proxy en `package.json`

## 📝 Funcionalidades Implementadas

- [x] Envío de correos (SMTP)
- [x] Recepción de correos (IMAP y POP3)
- [x] Responder correos
- [x] Responder a todos
- [x] Reenviar correos
- [x] Eliminar correos
- [x] Búsqueda por remitente
- [x] Búsqueda por destinatario
- [x] Búsqueda por asunto
- [x] Búsqueda por cuerpo del mensaje
- [x] Búsqueda por rango de fechas
- [x] Interfaz web responsiva
- [x] Visualización de adjuntos
- [x] Cambio entre IMAP y POP3

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos.

## 👨‍💻 Autor

Desarrollado para el curso de Redes - UTN FRM
