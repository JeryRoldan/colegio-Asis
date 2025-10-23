<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

$nombre = $_POST['nombre'] ?? '';
$grado = $_POST['grado'] ?? '';
$motivo = $_POST['motivo'] ?? '';
$fecha = $_POST['fecha'] ?? '';

if (empty($nombre) || empty($grado) || empty($motivo) || empty($fecha)) {
  echo json_encode(["ok" => false, "msg" => "Faltan campos obligatorios"]);
  exit;
}

$sql = "INSERT INTO ficha_derivacion (nombre, grado, motivo, fecha)
        VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $nombre, $grado, $motivo, $fecha);

if ($stmt->execute()) {
  echo json_encode(["ok" => true, "msg" => "✅ Ficha de Derivación guardada correctamente"]);
} else {
  echo json_encode(["ok" => false, "msg" => "❌ Error: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
