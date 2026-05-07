## Opción A: Entorno Linux / WSL (Recomendado)

### 1. Crear carpeta temporal y asignar permisos

```bash
mkdir uploads
chmod 777 uploads
```

### 2. Actualizar lista de paquetes

```bash
sudo apt update
```

### 3. Instalar LibreOffice (Motor de conversión)

```bash
sudo apt install libreoffice-writer -y
```

### 4. Instalar fuentes de Microsoft (Para conservar estilos originales)

```bash
sudo apt install ttf-mscorefonts-installer -y
sudo fc-cache -f -v
```

---

## Opción B: Entorno Windows (Nativo)

### 1. Crear carpeta temporal

```bash
mkdir uploads
```

### 2. Instalar LibreOffice mediante Winget

```bash
winget install -e --id TheDocumentFoundation.LibreOffice
```