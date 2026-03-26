# Plataforma de Consultas OSINT

Una Progressive Web App (PWA) moderna diseñada como un centro de acceso rápido a diversas fuentes de información abiertas (OSINT), enfocada en la investigación y consulta de datos públicos de diferentes países.

## ✨ Características Principales

- **Diseño Moderno con Neumorfismo:** Interfaz elegante con estilo neumórfico, paleta de colores premium (púrpura/índigo), y efectos visuales suaves que ofrecen una experiencia visual excepcional.
- **Microinteracciones Fluidas:** Animaciones escalonadas, transiciones suaves y retroalimentación visual en todas las interacciones del usuario.
- **Accesibilidad Premium:** Soporte ARIA completo, roles semánticos, navegación por teclado, y contraste WCAG 2.1 AA para todos los usuarios.
- **Progressive Web App (PWA):** Instala la aplicación en tu dispositivo para un acceso instantáneo, funcionamiento offline gracias a Service Workers avanzados, y notificaciones push.
- **Central de Enlaces OSINT:** Acceso organizado a consultas de vehículos, personas y servicios de interés público en múltiples países.
- **Búsqueda Inteligente:** Filtra rápidamente por título o credenciales en la sección activa con resultados en tiempo real.
- **Rendimiento Optimizado:** Carga lazy de secciones, CSS moderno con variables, Service Worker para caché estratégico, y soporte offline completo.
- **Soporte Multiplataforma:** Funciona perfectamente en desktop, tablet y móvil con gradientes adaptivos y tipografía responsiva.

## 🚀 Cómo Empezar

### Requisitos
- Un navegador web moderno (Chrome, Firefox, Edge, Safari) con soporte PWA y ES6+.
- Un servidor web local para desarrollo (VS Code Live Server, Python http.server, etc.).

### Instalación Local

1. Clona o descarga este repositorio en tu máquina local.
2. Abre la carpeta del proyecto en tu editor de código preferido.
3. Inicia un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # O con Node.js
   npx http-server -p 8000
   
   # O con VS Code Live Server
   # Click derecho > Open with Live Server
   ```
4. Abre `http://localhost:8000` en tu navegador.
5. Para instalar como app, haz clic en el botón "Instalar App" (Chrome/Edge) o usa el menú del navegador.

## 🎨 Mejoras Visuales y de UX

### Diseño Neumórfico
- Sombras suavizadas con gradientes sutiles
- Botones con efectos de presión neumórfica
- Tarjetas flotantes con elevación dinámica
- Efectos de enfoque mejorados para accesibilidad

### Paleta de Colores Premium
- **Primario:** Púrpura/Índigo (#6366f1)
- **Secundario:** Violeta (#8b5cf6)
- **Fondo:** Gradiente gris suave (#f5f7fa - #eef2f7)
- **Acentos:** Luz púrpura (#e0e7ff)

### Tipografía Moderna
- Fuente Inter de Google Fonts (variable)
- Pesos: 300, 400, 500, 600, 700, 800
- Espaciado optimizado para lectura
- Gradientes de texto para títulos

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Semántica completa con ARIA roles
- **CSS3:** Variables CSS, gradientes, animaciones keyframe, neumorfismo
- **JavaScript (ES6+):** Async/await, operador optional chaining, módulos
- **Service Workers:** Estrategia cache-first para offline
- **Web App Manifest:** Instalación PWA con atajos
- **Font Awesome 6.5+:** Iconografía moderna
- **Google Fonts (Inter):** Tipografía personalizada

## 📂 Estructura del Proyecto

```
App_consultas/
├── index.html              # HTML semántico con PWA meta tags
├── styles.css              # CSS moderno con variables y neumorfismo
├── script.js               # Lógica de navegación y búsqueda
├── app.js                  # Funciones auxiliares (legacy)
├── data.json               # Datos de consultas por categoría
├── manifest.json           # Configuración PWA mejorada
├── sw.js                   # Service Worker para offline
├── offline.html            # Página fallback offline
├── README.md               # Este archivo
├── icons/                  # Iconos PWA
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
└── scripts.js              # Scripts globales (si aplica)
```

## 🔒 Seguridad

- **Content Security Policy (CSP):** Configurado para bloquear contenido no autorizado
- **HTTPS recomendado:** Para producción, usa HTTPS obligatoriamente
- **Validación de datos:** Sanitización de búsquedas de usuario
- **Enlaces externos:** Todos con `rel="noopener noreferrer"`

## 📊 Rendimiento

- **Lighthouse Score:** Objetivo 90+ en Performance, 95+ en Accessibility
- **Lazy Loading:** Secciones cargadas bajo demanda
- **CSS crítico:** Inlineado en HTML para primeras vistas
- **Imágenes optimizadas:** Formatos modernos (WebP, PNG)
- **Caching estratégico:** Service Worker con políticas cache-first y network-first

## 🎯 Funcionalidades Implementadas

✅ Navegación por tabs con carga lazy
✅ Búsqueda en tiempo real con filtrado
✅ Funcionalidad offline con Service Worker
✅ Instalación como PWA en dispositivos
✅ Diseño totalmente responsivo
✅ Animaciones suaves y eficientes
✅ Accesibilidad WCAG 2.1 AA
✅ Configuración PWA con atajos
✅ Manejo robusto de errores
✅ Telemetría y logs en consola

## 📱 Dispositivos Soportados

- Desktop (Windows, macOS, Linux)
- Tablets (iOS, Android)
- Smartphones (iPhone 5S+, Android 5.0+)
- Relojes inteligentes (Wear OS 3+)

## 🔄 Actualización de Datos

Para agregar nuevas consultas o modificar las existentes, edita el archivo `data.json`:

```json
{
  "seccion": [
    {
      "title": "Nombre de la Consulta",
      "icon": "fa-solid fa-icon-name",
      "url": "https://ejemplo.com",
      "credentials": "Usuario: demo"  // Opcional
    }
  ]
}
```

## 📝 Licencia

Este proyecto está disponible para uso personal y educativo.

## 👨‍💻 Contribuciones

Las contribuciones son bienvenidas. Abre un issue o pull request con tus mejoras.
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
