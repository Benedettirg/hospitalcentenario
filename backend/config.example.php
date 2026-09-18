<?php
// Copiá este archivo como backend/config.php y completá los datos de tu servidor.
return [
  'db' => [
    'dsn' => 'mysql:host=localhost;dbname=hospital_centenario;charset=utf8mb4',
    'user' => 'TU_USUARIO',
    'pass' => 'TU_CONTRASEÑA',
  ],
  // Correo institucional que recibirá las notificaciones del portal.
  'notify_email' => 'contacto@TU-DOMINIO.ORG',
];
