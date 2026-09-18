<?php
declare(strict_types=1); require __DIR__.'/../backend/bootstrap.php';
$nombre=clean((string)($_POST['nombre']??''),120);$email=clean((string)($_POST['email']??''),190);$motivo=clean((string)($_POST['motivo']??''),80);$mensaje=clean((string)($_POST['mensaje']??''),4000);
if($nombre===''||!filter_var($email,FILTER_VALIDATE_EMAIL)||$motivo===''||mb_strlen($mensaje)<10){http_response_code(422);echo json_encode(['ok'=>false,'message'=>'Revisá los datos del formulario.']);exit;}
$stmt=$pdo->prepare('INSERT INTO consultas_web(nombre,email,motivo,mensaje) VALUES(?,?,?,?)');$stmt->execute([$nombre,$email,$motivo,$mensaje]);
echo json_encode(['ok'=>true,'message'=>'Consulta recibida correctamente.']);
