const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("word_file");
const fileNameText = document.getElementById("file_name");
const btnConvertir = document.getElementById("btnConvertir");
const form = document.getElementById("uploadForm");

// Eventos para el diseño dinámico
dropzone.onclick = () => fileInput.click();

fileInput.onchange = () => {
  if (fileInput.files.length > 0) {
    fileNameText.innerText = fileInput.files[0].name;
    btnConvertir.classList.remove("hidden");
  }
};

// Lógica de envío mediante Fetch (AJAX)
form.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  document.getElementById("progressContainer").classList.remove("hidden");
  btnConvertir.disabled = true;

  try {
    const response = await fetch("procesar.php", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInput.files[0].name.replace(".docx", ".pdf");
      document.body.appendChild(a);
      a.click();
      alert("¡Conversión exitosa!");
    } else {
      alert("Error en el servidor");
    }
  } catch (error) {
    console.error(error);
  } finally {
    document.getElementById("progressContainer").classList.add("hidden");
    btnConvertir.disabled = false;
  }
};
