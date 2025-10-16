# Ejemplos de Pruebas de la API

Este archivo contiene ejemplos de cómo probar la API usando PowerShell y curl.

## Configuración Inicial

Primero, asegúrate de que el servidor esté ejecutándose:

```powershell
npm run dev
```

## 1. Verificar Estado del Servidor

```powershell
curl http://localhost:5000/api/health
```

## 2. Enviar un Correo

```powershell
$body = @{
    to = "destinatario@ejemplo.com"
    subject = "Prueba desde la API"
    text = "Este es un correo de prueba enviado desde la API"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/email/send" -Method POST -Body $body -ContentType "application/json"
```

## 3. Obtener Correos (IMAP)

```powershell
# Obtener últimos 10 correos
Invoke-RestMethod -Uri "http://localhost:5000/api/email/inbox?limit=10" -Method GET

# Obtener de una carpeta específica
Invoke-RestMethod -Uri "http://localhost:5000/api/email/inbox?mailbox=INBOX&limit=20" -Method GET
```

## 4. Obtener Correos (POP3)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/pop3/inbox?limit=10" -Method GET
```

## 5. Buscar Correos

### Buscar por remitente
```powershell
$searchBody = @{
    from = "ejemplo@gmail.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/email/search" -Method POST -Body $searchBody -ContentType "application/json"
```

### Buscar por asunto
```powershell
$searchBody = @{
    subject = "importante"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/email/search" -Method POST -Body $searchBody -ContentType "application/json"
```

### Buscar por múltiples criterios
```powershell
$searchBody = @{
    from = "ejemplo@gmail.com"
    subject = "reunión"
    since = "2024-01-01"
    unseen = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/email/search" -Method POST -Body $searchBody -ContentType "application/json"
```

### Buscar en el cuerpo del mensaje
```powershell
$searchBody = @{
    body = "proyecto"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/email/search" -Method POST -Body $searchBody -ContentType "application/json"
```

## 6. Responder Correo

```powershell
$replyBody = @{
    originalEmail = @{
        from = "remitente@ejemplo.com"
        subject = "Asunto original"
        messageId = "<message-id@ejemplo.com>"
        text = "Mensaje original"
    }
    replyText = "Gracias por tu mensaje. Te respondo que..."
    replyAll = $false
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/email/reply" -Method POST -Body $replyBody -ContentType "application/json"
```

## 7. Reenviar Correo

```powershell
$forwardBody = @{
    originalEmail = @{
        from = "original@ejemplo.com"
        to = "destinatario@ejemplo.com"
        subject = "Asunto original"
        date = "2024-10-15T10:00:00Z"
        text = "Contenido del mensaje original"
    }
    to = "nuevo-destinatario@ejemplo.com"
    additionalMessage = "Te reenvío este correo para tu conocimiento."
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/email/forward" -Method POST -Body $forwardBody -ContentType "application/json"
```

## 8. Eliminar Correo

### Eliminar con IMAP
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/imap/1" -Method DELETE
```

### Eliminar con POP3
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/pop3/1" -Method DELETE
```

## 9. Marcar como Leído

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/mark-read/1" -Method PUT
```

## 10. Listar Carpetas (IMAP)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/mailboxes" -Method GET
```

## 11. Información del Buzón (POP3)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/email/pop3/info" -Method GET
```

## 12. Configurar Credenciales Personalizadas

```powershell
$configBody = @{
    smtp = @{
        host = "smtp.gmail.com"
        port = 587
        secure = $false
        user = "tu-email@gmail.com"
        password = "tu-contraseña"
    }
    imap = @{
        host = "imap.gmail.com"
        port = 993
        secure = $true
        user = "tu-email@gmail.com"
        password = "tu-contraseña"
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/email/configure" -Method POST -Body $configBody -ContentType "application/json"
```

## Pruebas con Curl (Alternativa)

Si prefieres usar curl en lugar de PowerShell:

### Enviar correo
```bash
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"destinatario@ejemplo.com\",\"subject\":\"Prueba\",\"text\":\"Mensaje de prueba\"}"
```

### Obtener correos
```bash
curl http://localhost:5000/api/email/inbox?limit=10
```

### Buscar correos
```bash
curl -X POST http://localhost:5000/api/email/search \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"ejemplo@gmail.com\"}"
```

## Notas Importantes

1. **Reemplaza los valores de ejemplo** con datos reales de tu cuenta de correo
2. **Asegúrate de que el servidor esté ejecutándose** antes de hacer las pruebas
3. **Verifica los logs del servidor** para ver información detallada de cada operación
4. **Maneja los errores** apropiadamente en producción

## Respuestas Esperadas

### Éxito
```json
{
  "success": true,
  "messageId": "<message-id>",
  "response": "250 OK"
}
```

### Error
```json
{
  "error": "Mensaje de error descriptivo"
}
```
