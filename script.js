const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("word_file");
const fileDetails = document.getElementById("fileDetails");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const fileSizeDisplay = document.getElementById("fileSizeDisplay");
const btnRemoveFile = document.getElementById("btnRemoveFile");
const btnConvertir = document.getElementById("btnConvertir");
const form = document.getElementById("uploadForm");
const alertBox = document.getElementById("alertBox");

// Función para mostrar alertas personalizadas
function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `mb-4 p-4 rounded-lg text-sm font-medium text-center transition-all block ${type === "error" ? "bg-red-900/50 text-red-400 border border-red-800" : "bg-green-900/50 text-green-400 border border-green-800"}`;
  setTimeout(() => alertBox.classList.add("hidden"), 5000);
}

// Formatear el peso del archivo
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Click en dropzone abre el explorador
dropzone.addEventListener("click", () => fileInput.click());

// Eventos de arrastrar y soltar visuales
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, () =>
    dropzone.classList.add("border-blue-500", "bg-slate-700/50"),
  );
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, () =>
    dropzone.classList.remove("border-blue-500", "bg-slate-700/50"),
  );
});

// Manejar el archivo soltado
dropzone.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length) {
    fileInput.files = files;
    handleFile();
  }
});

// Manejar archivo seleccionado por explorador
fileInput.addEventListener("change", handleFile);

// Botón para cancelar selección
btnRemoveFile.addEventListener("click", () => {
  fileInput.value = "";
  dropzone.classList.remove("hidden");
  fileDetails.classList.add("hidden");
  btnConvertir.classList.add("hidden");
  alertBox.classList.add("hidden");
});

// Validación y UI al seleccionar archivo
function handleFile() {
  if (fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  // Validar extensión
  if (!file.name.toLowerCase().endsWith(".docx")) {
    showAlert("Por favor, selecciona únicamente un archivo de Word (.docx)");
    fileInput.value = "";
    return;
  }

  // Validar peso
  if (file.size > maxSize) {
    showAlert("El archivo es demasiado grande. El límite es de 10 MB.");
    fileInput.value = "";
    return;
  }

  // Actualizar interfaz
  fileNameDisplay.textContent = file.name;
  fileSizeDisplay.textContent = formatBytes(file.size);

  dropzone.classList.add("hidden");
  fileDetails.classList.remove("hidden");
  btnConvertir.classList.remove("hidden");
  alertBox.classList.add("hidden");
}

// Lógica de envío al servidor (Backend)
form.onsubmit = async (e) => {
  e.preventDefault();

  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const formData = new FormData(form);

  // UI de carga
  progressContainer.classList.remove("hidden");
  btnConvertir.disabled = true;
  btnConvertir.classList.add("opacity-50", "cursor-not-allowed");
  btnRemoveFile.disabled = true;

  // Animación falsa de progreso (ya que Fetch no da progreso de descarga nativo fácil)
  let width = 0;
  const fakeProgress = setInterval(() => {
    if (width >= 90) clearInterval(fakeProgress);
    else {
      width += 5;
      progressBar.style.width = width + "%";
    }
  }, 300);

  try {
    const response = await fetch("procesar.php", {
      method: "POST",
      body: formData,
    });

    clearInterval(fakeProgress);
    progressBar.style.width = "100%";

    if (response.ok) {
      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInput.files[0].name.replace(".docx", ".pdf");
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      progressText.textContent = "¡Descarga completada!";
      progressText.classList.replace("text-blue-400", "text-green-400");
      showAlert("¡Tu documento se convirtió y descargó con éxito!", "success");

      // Resetear después de unos segundos
      setTimeout(() => btnRemoveFile.click(), 3000);
    } else {
      const errorText = await response.text();
      showAlert(errorText || "Error al procesar el archivo en el servidor.");
    }
  } catch (error) {
    clearInterval(fakeProgress);
    showAlert("Error de conexión con el servidor.");
  } finally {
    setTimeout(() => {
      progressContainer.classList.add("hidden");
      progressBar.style.width = "0%";
      progressText.textContent = "Subiendo y procesando...";
      progressText.classList.replace("text-green-400", "text-blue-400");
      btnConvertir.disabled = false;
      btnConvertir.classList.remove("opacity-50", "cursor-not-allowed");
      btnRemoveFile.disabled = false;
    }, 3000);
  }
};
