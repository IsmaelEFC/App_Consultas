# Plataforma de Consultas OSINT Chile

Una Progressive Web App (PWA) diseñada como un centro de acceso rápido a diversas fuentes de información abiertas (OSINT) en Chile, enfocada en la investigación y consulta de datos públicos.

<img width="1428" height="776" alt="Captura de pantalla de la aplicación" src="https://github.com/user-attachments/assets/ac577df2-1cab-4f6e-bf94-03009a9ea194" />

## ✨ Características Principales

- **Progressive Web App (PWA):** Instala la aplicación en tu escritorio o dispositivo móvil para un acceso rápido y capacidades sin conexión.
- **Diseño Moderno y Responsivo:** Interfaz limpia y adaptable a cualquier tamaño de pantalla.
- **Central de Enlaces OSINT:** Acceso directo a consultas de vehículos, personas y otros servicios de interés público en Chile.
- **Carga Eficiente:** El contenido de cada sección se carga bajo demanda para una experiencia de usuario más rápida.
- **Funcionamiento Offline:** La aplicación carga su interfaz principal incluso sin conexión a internet gracias al Service Worker.

## 🚀 Uso

### Acceso en línea

Simplemente accede al siguiente enlace para usar la aplicación:

[Acceder a la Plataforma de Consultas](https://ismaelefc.github.io/App_Consultas/)

### Instalación

Puedes instalar la aplicación en tu dispositivo:
- **En navegadores de escritorio (Chrome, Edge):** Busca el ícono de instalación en la barra de direcciones
- **En dispositivos móviles:** Usa la opción "Añadir a pantalla de inicio" en el menú del navegador

## 🌟 Características de la PWA

- **Instalable** en dispositivos móviles y de escritorio
- **Funcionamiento sin conexión** con contenido almacenado en caché
- **Pantalla de inicio personalizada** con iconos adaptables
- **Notificaciones push** (preparado para implementación futura)
- **Actualizaciones automáticas** cuando hay nuevo contenido disponible

## 🛠️ Tecnologías Utilizadas

- **HTML5**
- **CSS3** con Variables CSS para una fácil tematización
- **JavaScript (ES6+)**
- **Service Workers** para funcionalidad offline
- **Web App Manifest** para la instalación
- **Font Awesome** para los íconos de la interfaz

## 📂 Configuración de Desarrollo

### Requisitos previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Editor de código (VS Code, Sublime Text, etc.)
- Git (opcional, para control de versiones)

### Instalación local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/IsmaelEFC/App_Consultas.git
   cd App_Consultas
   ```

2. Abre el archivo `index.html` en tu navegador o usa un servidor local:
   ```bash
   # Usando Python (solo para desarrollo)
   python -m http.server 8000
   ```
   Luego abre `http://localhost:8000` en tu navegador.

## 🖼️ Configuración de Íconos

La aplicación requiere los siguientes archivos de ícono en la carpeta `icons/`:

| Tamaño       | Archivo           | Uso común                     |
|--------------|-------------------|-------------------------------|
| 72x72 px    | icon-72x72.png    | Para dispositivos Android      |
| 96x96 px    | icon-96x96.png    | Para dispositivos Android      |
| 128x128 px  | icon-128x128.png  | Para Chrome en Windows         |
| 144x144 px  | icon-144x144.png  | Para Internet Explorer         |
| 152x152 px  | icon-152x152.png  | Para iPad/iPhone con iOS       |
| 192x192 px  | icon-192x192.png  | Mínimo requerido para Android  |
| 384x384 px  | icon-384x384.png  | Para pantallas de alta densidad|
| 512x512 px  | icon-512x512.png  | Mínimo requerido para Android  |

### Generación de íconos

1. Prepara una imagen cuadrada de alta resolución (mínimo 512x512 píxeles)
2. Usa una de estas herramientas para generar los íconos:
   - [Favicon Generator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)
   - [App Icon Generator](https://appicon.co/)
3. Descarga el paquete de íconos y colócalos en la carpeta `icons/` del proyecto

## 🧪 Pruebas

### Verificación de la PWA

1. Abre la aplicación en Chrome
2. Presiona F12 para abrir las Herramientas de desarrollo
3. Ve a la pestaña "Aplicación"
4. Verifica que:
   - El Service Worker esté registrado y en ejecución
   - El Manifest esté cargado correctamente
   - Los recursos estén siendo almacenados en caché

### Pruebas sin conexión

1. En las Herramientas de desarrollo, ve a la pestaña "Aplicación"
2. Marca la casilla "Offline" en la sección "Service Workers"
3. Recarga la página para verificar que la aplicación funcione sin conexión

## 🔧 Personalización

Puedes personalizar la aplicación modificando estos archivos:

- `manifest.json`: Configuración de la aplicación (nombre, colores, etc.)
- `sw.js`: Comportamiento del service worker y estrategias de caché
- `offline.html`: Página mostrada cuando no hay conexión
- `css/styles.css`: Estilos de la aplicación
- `js/app.js`: Lógica principal de la aplicación

## ❓ Solución de problemas

### Problemas comunes

- **Los cambios en el service worker no se aplican:**
  1. Ve a `chrome://serviceworker-internals/`
  2. Busca tu service worker y haz clic en "Unregister"
  3. Actualiza la página para registrar una nueva versión

- **Los íconos no se muestran correctamente:**
  - Verifica que las rutas en el `manifest.json` sean correctas
  - Asegúrate de que los archivos existan en la carpeta `icons/`
  - Limpia la caché del navegador

- **La aplicación no funciona sin conexión:**
  - Verifica que el service worker esté registrado correctamente
  - Asegúrate de que los recursos estén siendo cacheados correctamente
  - Revisa la consola en busca de errores

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestras pautas de contribución antes de enviar un pull request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---
*Creado por R4VEN - 2025*
