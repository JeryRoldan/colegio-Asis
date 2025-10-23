<?php
include("conexion.php");

$apellidos_nombres = $_POST['apellidos_nombres'];
$motivo = $_POST['motivo'];

$sql = "INSERT INTO ficha_derivacion (apellidos_nombres, motivo)
        VALUES ('$apellidos_nombres', '$motivo')";

if ($conn->query($sql) === TRUE) {
    echo "<script>alert('✅ Ficha de derivación guardada correctamente'); window.location.href='index.html';</script>";
} else {
    echo "<script>alert('❌ Error: " . $conn->error . "'); window.history.back();</script>";
}

$conn->close();
?>
