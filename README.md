# Plataforma de Consultas OSINT

Una Progressive Web App (PWA) diseñada como un centro de acceso rápido a diversas fuentes de información abiertas (OSINT), enfocada en la investigación y consulta de datos públicos de diferentes países.

<!-- 
¡Inserta aquí una nueva captura de pantalla del diseño actualizado! 
-->

## ✨ Características Principales

- **Diseño Profesional y Adaptable:** Interfaz moderna, limpia y totalmente responsiva, optimizada para una excelente experiencia en computadoras de escritorio y dispositivos móviles.
- **Progressive Web App (PWA):** Instala la aplicación en tu dispositivo para un acceso rápido, notificaciones y funcionamiento sin conexión.
- **Central de Enlaces OSINT:** Acceso directo a consultas de vehículos, personas y otros servicios de interés público.
- **Búsqueda Integrada:** Filtra rápidamente los enlaces en la sección activa.
- **Carga Eficiente:** El contenido de cada sección se carga dinámicamente para una experiencia de usuario fluida y rápida.
- **Soporte Offline:** Gracias a un Service Worker avanzado, la aplicación es funcional incluso sin conexión a internet, mostrando el contenido cacheado y una página de respaldo personalizada.

## 🚀 Cómo Empezar

### Requisitos
- Un navegador web moderno (Chrome, Firefox, Edge, Safari).
- Un servidor web local para desarrollo (por ejemplo, `Live Server` en VS Code o `python -m http.server`).

### Instalación Local

1.  Clona o descarga este repositorio en tu máquina local.
2.  Abre la carpeta del proyecto en tu editor de código preferido.
3.  Inicia un servidor local. Si usas Python, puedes ejecutar el siguiente comando en tu terminal:
    ```bash
    python -m http.server
    ```
4.  Abre tu navegador y ve a la dirección de tu servidor local (generalmente `http://localhost:8000`).

## 🛠️ Tecnologías Utilizadas

- **HTML5**
- **CSS3:** con Variables CSS para una fácil personalización y un diseño adaptable.
- **JavaScript (ES6+):** para la lógica de la aplicación, incluyendo carga dinámica y búsqueda.
- **Service Workers:** para la funcionalidad offline y estrategias de caché avanzadas.
- **Web App Manifest:** para la instalación de la PWA y su integración con el sistema operativo.
- **Font Awesome:** para los iconos de la interfaz.

## 📂 Estructura del Proyecto

```
/
├── icons/                # Iconos de la aplicación (PWA)
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
├── data.json             # Almacena los enlaces y datos de las tarjetas
├── index.html            # Estructura principal de la aplicación
├── manifest.json         # Archivo de manifiesto de la PWA
├── offline.html          # Página de respaldo para el modo sin conexión
├── README.md             # Este archivo
├── script.js             # Lógica principal de la aplicación
├── styles.css            # Estilos de la interfaz
└── sw.js                 # Service Worker para la funcionalidad offline
```

## 🔧 Personalización

Puedes personalizar fácilmente la aplicación modificando los siguientes archivos:

-   **`data.json`**: Añade, edita o elimina enlaces de consulta. Cada entrada requiere un `title`, `icon` (de Font Awesome) y `url`.
-   **`styles.css`**: Cambia la paleta de colores, tipografías y otros aspectos visuales a través de las variables CSS definidas al inicio del archivo.
-   **`manifest.json`**: Ajusta el nombre de la aplicación, los colores del tema y otros metadatos de la PWA.
-   **`icons/`**: Reemplaza los iconos con los tuyos. Asegúrate de mantener los nombres `icon-192.png` y `icon-512.png` para una correcta integración.

---

*Creado por R4VEN - 2025*
