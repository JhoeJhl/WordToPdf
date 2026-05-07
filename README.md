## Opción A: Entorno Linux / WSL (Recomendado)
### 1. Crear carpeta temporal y asignar permisos
mkdir uploads
chmod 777 uploads

### 2. Actualizar lista de paquetes
sudo apt update

### 3. Instalar LibreOffice (Motor de conversión)
sudo apt install libreoffice-writer -y

### 4. Instalar fuentes de Microsoft (Para conservar estilos originales)
sudo apt install ttf-mscorefonts-installer -y
sudo fc-cache -f -v# 1. Crear carpeta temporal y asignar permisos
mkdir uploads
chmod 777 uploads

## Opción B: Entorno Windows (Nativo)

### 1. Crear carpeta temporal
mkdir uploads

### 2. Instalar LibreOffice mediante Winget
winget install -e --id TheDocumentFoundation.LibreOffice