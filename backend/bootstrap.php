<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'message'=>'Método no permitido']); exit; }
$configFile=__DIR__.'/config.php';
if (!is_file($configFile)) { http_response_code(503); echo json_encode(['ok'=>false,'message'=>'Backend no configurado']); exit; }
$config=require $configFile;
try { $pdo=new PDO($config['db']['dsn'],$config['db']['user'],$config['db']['pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]); }
catch(Throwable $e){ http_response_code(500); echo json_encode(['ok'=>false,'message'=>'No se pudo conectar con el sistema.']); exit; }
function clean(string $v,int $max=500): string { $v=trim($v); return mb_substr($v,0,$max); }
