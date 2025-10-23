<?php
header("Content-Type: application/json; charset=UTF-8");
include "conexion.php";

$nombre = $_POST['nombre'] ?? '';
$edad = $_POST['edad'] ?? '';
$sexo = $_POST['sexo'] ?? '';
$grado = $_POST['grado'] ?? '';
$observaciones = $_POST['observaciones'] ?? '';

if (empty($nombre) || empty($edad) || empty($sexo)) {
  echo json_encode(["ok" => false, "msg" => "Faltan campos obligatorios"]);
  exit;
}

$sql = "INSERT INTO ficha_psicopedagogica (nombre, edad, sexo, grado, observaciones)
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sisss", $nombre, $edad, $sexo, $grado, $observaciones);

if ($stmt->execute()) {
  echo json_encode(["ok" => true, "msg" => "✅ Ficha Psicopedagógica guardada correctamente"]);
} else {
  echo json_encode(["ok" => false, "msg" => "❌ Error: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
