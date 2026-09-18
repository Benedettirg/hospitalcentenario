<?php
declare(strict_types=1); require __DIR__.'/../backend/bootstrap.php';
$nombre=clean((string)($_POST['nombre']??''),120); $telefono=clean((string)($_POST['telefono']??''),40); $especialidad=clean((string)($_POST['especialidad']??''),120); $fecha=clean((string)($_POST['fecha']??''),10); $franja=clean((string)($_POST['franja']??''),40);
if($nombre===''||$telefono===''||$especialidad===''||$fecha===''){http_response_code(422);echo json_encode(['ok'=>false,'message'=>'Completá los campos obligatorios.']);exit;}
if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',$fecha)){http_response_code(422);echo json_encode(['ok'=>false,'message'=>'La fecha no es válida.']);exit;}
$stmt=$pdo->prepare('INSERT INTO solicitudes_turno(nombre,telefono,especialidad,fecha_preferida,franja) VALUES(?,?,?,?,?)');$stmt->execute([$nombre,$telefono,$especialidad,$fecha,$franja?:null]);
// En producción se recomienda disparar aquí un correo/notificación interna mediante un servicio transaccional.
echo json_encode(['ok'=>true,'message'=>'Solicitud recibida. El hospital debe verificar disponibilidad y confirmar el turno.']);
