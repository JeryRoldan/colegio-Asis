<?php
include("conexion.php");

// Recuperar datos
$apellidos_nombres = $_POST['apellidos_nombres'];
$documento_identidad = $_POST['documento_identidad'];
$grado = $_POST['grado'];
$nivel = $_POST['nivel'];
$edad = $_POST['edad'];

// Inserción SQL
$sql = "INSERT INTO ficha_psicopedagogica (apellidos_nombres, documento_identidad, grado, nivel, edad)
        VALUES ('$apellidos_nombres', '$documento_identidad', '$grado', '$nivel', '$edad')";

if ($conn->query($sql) === TRUE) {
    echo "<script>alert('✅ Ficha psicopedagógica guardada correctamente'); window.location.href='index.html';</script>";
} else {
    echo "<script>alert('❌ Error: " . $conn->error . "'); window.history.back();</script>";
}

$conn->close();
?>
