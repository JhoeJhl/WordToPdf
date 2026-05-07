<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['word_file'])) {
    $uploadDir = __DIR__ . '/uploads/';
    $fileName = basename($_FILES['word_file']['name']);
    $tempDocx = $uploadDir . $fileName;
    $pdfName = pathinfo($fileName, PATHINFO_FILENAME) . '.pdf';
    $outputPdf = $uploadDir . $pdfName;

    // 1. Mover el archivo subido a la carpeta de uploads
    if (move_uploaded_file($_FILES['word_file']['tmp_name'], $tempDocx)) {
        
        /**
         * 2. Comando de conversión (Requiere LibreOffice instalado)
         * En Linux/WSL2: sudo apt install libreoffice
         */
        $comando = "soffice --headless --convert-to pdf --outdir " . escapeshellarg($uploadDir) . " " . escapeshellarg($tempDocx);
        
        exec($comando, $output, $returnVar);

        if ($returnVar === 0 && file_exists($outputPdf)) {
            // 3. Enviar el PDF al navegador
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $pdfName . '"');
            readfile($outputPdf);

            // 4. Limpieza (opcional: borrar archivos temporales)
            unlink($tempDocx);
            unlink($outputPdf);
            exit;
        } else {
            http_response_code(500);
            echo "Error en la ejecución del comando.";
        }
    } else {
        http_response_code(400);
        echo "Error al subir el archivo.";
    }
}