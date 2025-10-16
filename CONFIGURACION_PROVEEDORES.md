# Guía de Configuración por Proveedor de Correo

Esta guía te ayudará a configurar el cliente de correo con diferentes proveedores.

## 📧 Gmail

### Requisitos Previos
1. Cuenta de Gmail
2. Verificación en dos pasos activada
3. Contraseña de aplicación generada

### Paso a Paso

1. **Activar verificación en dos pasos**
   - Ve a https://myaccount.google.com/security
   - Busca "Verificación en dos pasos"
   - Sigue las instrucciones para activarla

2. **Generar contraseña de aplicación**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y tu dispositivo
   - Copia la contraseña generada (16 caracteres)

3. **Configurar .env**
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Contraseña de aplicación

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true

POP3_HOST=pop.gmail.com
POP3_PORT=995
POP3_SECURE=true
```

### Solución de Problemas Gmail
- **Error de autenticación**: Verifica que uses la contraseña de aplicación, no tu contraseña normal
- **No se reciben correos**: Asegúrate de haber habilitado IMAP en Gmail (Configuración → Ver toda la configuración → Reenvío y correo POP/IMAP)

---

