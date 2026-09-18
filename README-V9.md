# Hospital Centenario — Portal V9

Esta versión convierte el sitio institucional en un portal navegable y preparado para operación real.

## Incluye
- Inicio con carrusel automático de 5 segundos y 650px de alto.
- Páginas independientes: Pacientes, Servicios, Institucional, Noticias, Contacto y Turnos.
- Buscador/filtros de especialidades.
- FAQ interactivo.
- Formulario de solicitud de turno por pasos.
- Cancelación de turnos mediante WhatsApp.
- Formulario de contacto.
- Modal de noticias.
- Accesibilidad para aumentar/reestablecer tamaño de texto.
- Backend PHP + MySQL de ejemplo para guardar solicitudes y consultas.

## Importante
El formulario de turno **solicita** un turno; no inventa disponibilidad ni confirma un horario. Para confirmar turnos de verdad hay que conectar el backend con el sistema de turnos/admisión que utilice el hospital.

## Activar backend
1. Crear una base MySQL.
2. Ejecutar `database.sql`.
3. Copiar `backend/config.example.php` como `backend/config.php`.
4. Completar credenciales y correo institucional.
5. Subir el proyecto a un hosting con PHP 8+ y MySQL/MariaDB.
6. Activar HTTPS.
7. Antes de producción, agregar autenticación de administración, protección CSRF, rate limiting, logs y política de privacidad.
