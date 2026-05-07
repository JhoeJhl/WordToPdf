<?php

// 1. Validar que la petición sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die("Método no permitido.");
}

// 2. Validar que el archivo realmente llegó al servidor
if (!isset($_FILES['word_file']) || $_FILES['word_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    // Errores comunes de subida en PHP
    $errorDetails = isset($_FILES['word_file']) ? $_FILES['word_file']['error'] : 'No se recibió nada';
    die("Error al subir el archivo al servidor. Código de error interno: " . $errorDetails . ". Revisa upload_max_filesize en tu php.ini.");
}

// 3. Preparar el entorno y la carpeta
$uploadDir = __DIR__ . '/uploads/';

// Crear la carpeta automáticamente si no existe y darle permisos
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        http_response_code(500);
        die("No se pudo crear la carpeta 'uploads/'. Revisa los permisos de tu entorno.");
    }
}

// 4. Limpiar nombres de archivos
$fileName = basename($_FILES['word_file']['name']);
// Evitar espacios y caracteres raros en comandos de terminal
$fileNameSafe = preg_replace("/[^a-zA-Z0-9.-]/", "_", $fileName);

$tempDocx = $uploadDir . $fileNameSafe;
$pdfName = pathinfo($fileNameSafe, PATHINFO_FILENAME) . '.pdf';
$outputPdf = $uploadDir . $pdfName;

// 5. Mover el archivo a la carpeta final
if (!move_uploaded_file($_FILES['word_file']['tmp_name'], $tempDocx)) {
    http_response_code(500);
    die("El archivo se recibió, pero no se pudo guardar en la carpeta 'uploads/'. Verifica los permisos.");
}

// 6. Ejecutar el comando de LibreOffice
// El "2>&1" al final captura cualquier error que arroje la terminal para poder leerlo
$comando = "soffice --headless --convert-to pdf --outdir " . escapeshellarg($uploadDir) . " " . escapeshellarg($tempDocx) . " 2>&1";
exec($comando, $output, $returnVar);

// 7. Validar el resultado
if ($returnVar === 0 && file_exists($outputPdf)) {

    // Forzar la descarga en el navegador
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $pdfName . '"');
    header('Content-Length: ' . filesize($outputPdf));
    readfile($outputPdf);

    // Limpiar basura del servidor
    @unlink($tempDocx);
    @unlink($outputPdf);
    exit;
} else {
    // Si LibreOffice falla, mandamos el error exacto de la terminal al frontend
    http_response_code(500);
    $terminalError = implode("\n", $output);
    @unlink($tempDocx); // Borrar el docx temporal para no llenar el disco
    die("Fallo en la conversión. Código de salida: {$returnVar}. Mensaje de la terminal: {$terminalError}");
}
