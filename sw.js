// Versión del caché - Incrementar este número cuando se actualicen los recursos
const CACHE_VERSION = 'v6';
const CACHE_NAME = `plataforma-consultas-cache-${CACHE_VERSION}`;
const SYNC_EVENT = 'sync-cache';
const REFRESH_CACHE_EVENT = 'refresh-cache';
const NOTIFICATION_TITLE = 'Plataforma de Consultas';
const NOTIFICATION_OPTIONS = {
  body: '¡Hay una nueva versión disponible!',
  icon: '/App_Consultas-main/icons/icon-192x192.png',
  badge: '/App_Consultas-main/icons/icon-72x72.png',
  tag: 'update-available',
  renotify: true,
  vibrate: [200, 100, 200, 100, 200, 100, 200]
};
const CACHE_ASSETS = [
  '/App_Consultas-main/index.html',
  '/App_Consultas-main/offline.html',
  '/App_Consultas-main/styles.css',
  '/App_Consultas-main/script.js',
  '/App_Consultas-main/manifest.json',
  '/App_Consultas-main/data.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Archivos a almacenar en caché
const urlsToCache = [
  ...CACHE_ASSETS,
  '/' // Página raíz
];

// Agregar íconos a la caché si existen
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
iconSizes.forEach(size => {
  const iconPath = `/App_Consultas-main/icons/icon-${size}x${size}.png`;
  if (!urlsToCache.includes(iconPath)) {
    urlsToCache.push(iconPath);
  }
});

// Función para instalar recursos en caché
const installResources = async () => {
  try {
    console.log('[Service Worker] Iniciando instalación de recursos');
    const cache = await caches.open(CACHE_NAME);
    
    // Intentar agregar todos los recursos a la caché
    await cache.addAll(urlsToCache);
    
    console.log('[Service Worker] Recursos almacenados en caché exitosamente');
    return true;
  } catch (error) {
    console.error('[Service Worker] Error al instalar recursos:', error);
    
    // Si hay un error, intentar agregar los recursos uno por uno
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('[Service Worker] Error de red, intentando cargar recursos individualmente');
      try {
        const cache = await caches.open(CACHE_NAME);
        const promises = urlsToCache.map(url => 
          cache.add(url).catch(err => 
            console.warn(`[Service Worker] No se pudo almacenar ${url}:`, err)
          )
        );
        await Promise.all(promises);
        return true;
      } catch (nestedError) {
        console.error('[Service Worker] Error al cargar recursos individualmente:', nestedError);
        return false;
      }
    }
    
    return false;
  }
};

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Iniciando instalación...');
  
  // Realiza la instalación
  event.waitUntil(
    installResources()
      .then(success => {
        if (success) {
          console.log('[Service Worker] Instalación completada con éxito');
          // Forzar la activación del nuevo service worker
          return self.skipWaiting();
        } else {
          console.warn('[Service Worker] La instalación tuvo algunos problemas');
          // Aunque haya habido problemas, continuamos con la activación
          return self.skipWaiting();
        }
      })
      .catch(error => {
        console.error('[Service Worker] Error crítico durante la instalación:', error);
        // Aunque falle, intentamos continuar
        return self.skipWaiting();
      })
  );
});

// Función para limpiar cachés antiguas
const cleanOldCaches = async () => {
  try {
    const cacheNames = await caches.keys();
    const currentCacheName = CACHE_NAME;
    
    await Promise.all(
      cacheNames
        .filter(cacheName => {
          // Mantener solo las cachés de esta aplicación que no sean la actual
          return cacheName.startsWith('plataforma-consultas-cache-') && 
                 cacheName !== currentCacheName;
        })
        .map(cacheName => {
          console.log('[Service Worker] Eliminando caché antigua:', cacheName);
          return caches.delete(cacheName);
        })
    );
    
    console.log('[Service Worker] Limpieza de cachés antiguas completada');
    return true;
  } catch (error) {
    console.error('[Service Worker] Error al limpiar cachés antiguas:', error);
    return false;
  }
};

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  
  // No esperar a que termine la limpieza para tomar control
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      cleanOldCaches(),
      // Tomar control de los clientes inmediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('[Service Worker] Activación completada');
    })
  );
});

// Función para manejar solicitudes de navegación
const handleNavigationRequest = async (request) => {
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa, actualizar la caché
    if (networkResponse && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Actualizando caché de navegación para:', request.url);
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Modo offline, sirviendo desde caché');
    
    // Intentar servir desde la caché
    const cachedResponse = await caches.match('/App_Consultas-main/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay nada en caché, mostrar la página offline
    const offlineResponse = await caches.match('/App_Consultas-main/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Como último recurso, devolver una respuesta de error personalizada
    return new Response(
      '<h1>Estás sin conexión</h1><p>No se pudo cargar la página solicitada.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
};

// Función para manejar solicitudes de recursos de imagen
const handleImageRequest = async (request) => {
  // Para imágenes, usamos una estrategia de caché primero con actualización en segundo plano
  // y soporte para imágenes de marcador de posición en caso de error
  try {
    // Primero intentar obtener de la caché
    const cachedResponse = await caches.match(request, { ignoreVary: true });
    
    // En paralelo, intentar actualizar desde la red
    const networkPromise = fetch(request, { cache: 'reload' }).then(networkResponse => {
      // Si la respuesta es exitosa, actualizar la caché
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache)
            .then(() => console.log(`[Service Worker] Imagen actualizada en caché: ${request.url}`))
            .catch(console.warn);
        });
      }
      return networkResponse;
    }).catch(console.warn);
    
    // Si tenemos una respuesta en caché, devolverla inmediatamente
    // mientras se actualiza en segundo plano
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo imagen desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay en caché, esperar por la respuesta de red
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Si todo falla, devolver una imagen de marcador de posición
    return new Response(
      '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#999">Imagen no disponible</text></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  } catch (error) {
    console.error(`[Service Worker] Error al manejar imagen ${request.url}:`, error);
    
    // Devolver una imagen de marcador de posición en caso de error
    return new Response(
      '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#999">Error al cargar</text></svg>',
      { 
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
};

// Función para manejar solicitudes de fuentes web
const handleFontRequest = async (request) => {
  // Para fuentes, usamos una estrategia de caché primero con actualización en segundo plano
  try {
    // Primero intentar obtener de la caché
    const cachedResponse = await caches.match(request, { ignoreVary: true });
    
    // En paralelo, intentar actualizar desde la red
    const networkPromise = fetch(request, { cache: 'reload' }).then(networkResponse => {
      // Si la respuesta es exitosa, actualizar la caché
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache)
            .then(() => console.log(`[Service Worker] Fuente actualizada en caché: ${request.url}`))
            .catch(console.warn);
        });
      }
      return networkResponse;
    }).catch(console.warn);
    
    // Si tenemos una respuesta en caché, devolverla inmediatamente
    // mientras se actualiza en segundo plano
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo fuente desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay en caché, esperar por la respuesta de red
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Si todo falla, devolver una respuesta vacía
    return new Response(null, { status: 404, statusText: 'Not Found' });
  } catch (error) {
    console.error(`[Service Worker] Error al manejar fuente ${request.url}:`, error);
    return new Response(null, { status: 404, statusText: 'Not Found' });
  }
};

// Función para manejar solicitudes de archivos JavaScript
const handleJsRequest = async (request) => {
  // Para JS, usamos una estrategia de caché primero con actualización en segundo plano
  try {
    // Primero intentar obtener de la caché
    const cachedResponse = await caches.match(request, { ignoreVary: true });
    
    // En paralelo, intentar actualizar desde la red
    const networkPromise = fetch(request).then(networkResponse => {
      // Si la respuesta es exitosa, actualizar la caché
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache)
            .then(() => console.log(`[Service Worker] JavaScript actualizado en caché: ${request.url}`))
            .catch(console.warn);
        });
      }
      return networkResponse;
    }).catch(console.warn);
    
    // Si tenemos una respuesta en caché, devolverla inmediatamente
    // mientras se actualiza en segundo plano
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo JavaScript desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay en caché, esperar por la respuesta de red
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Si todo falla, devolver un script vacío
    return new Response(
      'console.error("[Service Worker] No se pudo cargar el script: ' + request.url + '");',
      { 
        headers: { 'Content-Type': 'application/javascript' }
      }
    );
  } catch (error) {
    console.error(`[Service Worker] Error al manejar JavaScript ${request.url}:`, error);
    
    // Devolver un script de error en caso de fallo
    return new Response(
      'console.error("[Service Worker] Error al cargar el script: ' + request.url + '");',
      { 
        headers: { 'Content-Type': 'application/javascript' }
      }
    );
  }
};

// Función para manejar solicitudes de hojas de estilo CSS
const handleCssRequest = async (request) => {
  // Para CSS, usamos una estrategia de caché primero con actualización en segundo plano
  try {
    // Primero intentar obtener de la caché
    const cachedResponse = await caches.match(request, { ignoreVary: true });
    
    // En paralelo, intentar actualizar desde la red
    const networkPromise = fetch(request).then(networkResponse => {
      // Si la respuesta es exitosa, actualizar la caché
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache)
            .then(() => console.log(`[Service Worker] CSS actualizado en caché: ${request.url}`))
            .catch(console.warn);
        });
      }
      return networkResponse;
    }).catch(console.warn);
    
    // Si tenemos una respuesta en caché, devolverla inmediatamente
    // mientras se actualiza en segundo plano
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo CSS desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay en caché, esperar por la respuesta de red
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Si todo falla, devolver estilos mínimos
    return new Response(
      '/* Estilos mínimos */ body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }',
      { 
        headers: { 'Content-Type': 'text/css' }
      }
    );
  } catch (error) {
    console.error(`[Service Worker] Error al manejar CSS ${request.url}:`, error);
    
    // Devolver estilos mínimos en caso de error
    return new Response(
      '/* Error al cargar estilos */ body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }',
      { 
        headers: { 'Content-Type': 'text/css' }
      }
    );
  }
};

// Función para manejar solicitudes de documentos HTML
const handleHtmlRequest = async (request) => {
  // Para HTML, priorizamos la red con fallback a caché
  try {
    // Obtener de la red primero
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa y es HTML, actualizar la caché
    if (networkResponse && 
        networkResponse.status === 200 && 
        networkResponse.headers.get('content-type').includes('text/html')) {
      
      // Clonar la respuesta para poder usarla y almacenarla
      const responseToCache = networkResponse.clone();
      
      // Almacenar en caché en segundo plano
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache)
          .then(() => console.log(`[Service Worker] HTML almacenado en caché: ${request.url}`))
          .catch(console.warn);
      });
      
      return networkResponse;
    }
    
    // Si la respuesta no es HTML o tiene un error, lanzar excepción
    throw new Error('Respuesta no válida o no es HTML');
  } catch (error) {
    console.log(`[Service Worker] Error al cargar HTML, intentando desde caché: ${request.url}`);
    
    // Intentar obtener de la caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo HTML desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay nada en caché, devolver la página de error
    return caches.match('/App_Consultas-main/offline.html')
      .then(offlineResponse => {
        if (offlineResponse) {
          return offlineResponse;
        }
        
        // Si no hay página offline, devolver un mensaje genérico
        return new Response(
          '<!DOCTYPE html><html><head><title>Error de conexión</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Error de conexión</h1><p>No se pudo cargar la página solicitada y no hay una versión en caché disponible.</p></body></html>',
          { 
            status: 503, 
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/html' }
          }
        );
      });
  }
};

// Función para manejar solicitudes de audio
const handleAudioRequest = async (request) => {
  // Para audio, usamos una estrategia de caché con prioridad en la red
  try {
    // Primero intentar obtener de la red
    const networkResponse = await fetch(request, { cache: 'reload' });
    
    // Si la respuesta es exitosa, actualizar la caché en segundo plano
    if (networkResponse && networkResponse.status === 200) {
      // No esperamos a que se complete el almacenamiento en caché
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, networkResponse.clone())
          .then(() => console.log(`[Service Worker] Audio almacenado en caché: ${request.url}`))
          .catch(console.warn);
      });
      
      return networkResponse;
    }
    
    // Si hay un error de red, intentar obtener de la caché
    throw new Error('Error de red');
  } catch (error) {
    console.log(`[Service Worker] Error al cargar audio, intentando desde caché: ${request.url}`);
    
    // Intentar obtener de la caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo audio desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay nada en caché, devolver una respuesta de error
    return new Response(
      JSON.stringify({ error: 'No se pudo cargar el audio y no está disponible en caché' }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Función para manejar solicitudes de video
const handleVideoRequest = async (request) => {
  // Para videos, usamos una estrategia de caché con prioridad en la red
  try {
    // Primero intentar obtener de la red
    const networkResponse = await fetch(request, { cache: 'reload' });
    
    // Si la respuesta es exitosa, actualizar la caché en segundo plano
    if (networkResponse && networkResponse.status === 200) {
      // No esperamos a que se complete el almacenamiento en caché
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, networkResponse.clone())
          .then(() => console.log(`[Service Worker] Video almacenado en caché: ${request.url}`))
          .catch(console.warn);
      });
      
      return networkResponse;
    }
    
    // Si hay un error de red, intentar obtener de la caché
    throw new Error('Error de red');
  } catch (error) {
    console.log(`[Service Worker] Error al cargar video, intentando desde caché: ${request.url}`);
    
    // Intentar obtener de la caché
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo video desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay nada en caché, devolver una respuesta de error
    return new Response(
      JSON.stringify({ error: 'No se pudo cargar el video y no está disponible en caché' }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Función para manejar solicitudes de archivos JSON
const handleJsonRequest = async (request) => {
  const cacheKey = new Request(request.url, request);
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Primero intentar obtener de la red
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa, actualizar la caché
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      await cache.put(cacheKey, responseToCache);
      console.log(`[Service Worker] Archivo JSON almacenado en caché: ${request.url}`);
      
      // Programar limpieza de caché para este archivo
      setTimeout(() => {
        cache.delete(cacheKey).catch(console.warn);
      }, 1000 * 60 * 60 * 12); // Limpiar después de 12 horas
      
      return networkResponse;
    }
    
    // Si hay un error de red, intentar obtener de la caché
    throw new Error('Error de red');
  } catch (error) {
    console.log(`[Service Worker] Error al cargar JSON, intentando desde caché: ${request.url}`);
    
    // Intentar obtener de la caché
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo JSON desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Si no hay nada en caché, devolver un error
    console.error(`[Service Worker] No se pudo cargar el archivo JSON: ${request.url}`);
    return new Response(
      JSON.stringify({ error: 'No se pudo cargar el archivo JSON y no hay datos en caché' }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Función para manejar solicitudes de API
const handleApiRequest = async (request) => {
  const cacheKey = new Request(request.url, request);
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Primero intentar obtener de la red
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa, actualizar la caché
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      
      // Extraer información de control de caché de los encabezados
      const cacheControl = networkResponse.headers.get('cache-control') || '';
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 5 * 60 * 1000; // 5 minutos por defecto
      
      // Almacenar en caché con metadatos adicionales
      const cacheEntry = {
        response: await serializeResponse(networkResponse),
        timestamp: Date.now(),
        maxAge: maxAge
      };
      
      await cache.put(cacheKey, new Response(JSON.stringify(cacheEntry)));
      console.log(`[Service Worker] Respuesta de API almacenada en caché: ${request.url} (expira en ${maxAge/1000}s)`);
      
      return networkResponse;
    }
    
    // Si hay un error de red, intentar obtener de la caché
    throw new Error('Error de red');
  } catch (error) {
    console.log(`[Service Worker] Error en solicitud API, intentando desde caché: ${request.url}`);
    
    // Intentar obtener de la caché
    const cachedEntry = await cache.match(cacheKey);
    
    if (cachedEntry) {
      try {
        const { response, timestamp, maxAge } = await cachedEntry.json();
        const age = Date.now() - timestamp;
        
        // Verificar si la entrada en caché ha expirado
        if (age < maxAge) {
          console.log(`[Service Worker] Sirviendo respuesta de API desde caché: ${request.url} (${Math.floor(age/1000)}s de antigüedad)`);
          return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
          });
        } else {
          console.log(`[Service Worker] La entrada en caché ha expirado: ${request.url}`);
        }
      } catch (e) {
        console.error('[Service Worker] Error al procesar caché de API:', e);
      }
    }
    
    // Si no hay nada en caché o ha expirado, devolver un error
    console.error(`[Service Worker] No se pudo obtener la respuesta de la API: ${request.url}`);
    return new Response(
      JSON.stringify({ 
        error: 'No se pudo conectar con el servidor',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'Retry-After': '60' // Sugerir reintentar en 60 segundos
        }
      }
    );
  }
};

// Función auxiliar para serializar una respuesta
async function serializeResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    return await response.json();
  } else if (contentType.includes('text/')) {
    return await response.text();
  } else {
    return await response.blob();
  }
}

// Función para manejar solicitudes de recursos estáticos
const handleStaticRequest = async (request) => {
  // Manejar fuentes con una estrategia diferente
  if (request.url.match(/\.(woff|woff2|ttf|eot|otf)$/i)) {
    return handleFontRequest(request);
  }
  
  // Manejar imágenes con una estrategia diferente
  if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return handleImageRequest(request);
  }
  
  // Manejar solicitudes de API con una estrategia diferente
  if (request.url.includes('/api/')) {
    return handleApiRequest(request);
  }
  
  // Manejar archivos JSON con una estrategia específica
  if (request.url.endsWith('.json') && !request.url.includes('manifest.json')) {
    return handleJsonRequest(request);
  }
  
  // Manejar recursos de video con una estrategia específica
  if (request.url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return handleVideoRequest(request);
  }
  
  // Manejar recursos de audio con una estrategia específica
  if (request.url.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) {
    return handleAudioRequest(request);
  }
  
  // Manejar documentos HTML con una estrategia específica
  if (request.headers.get('accept').includes('text/html')) {
    return handleHtmlRequest(request);
  }
  
  // Manejar hojas de estilo CSS con una estrategia específica
  if (request.url.match(/\.css(\?.*)?$/i)) {
    return handleCssRequest(request);
  }
  
  // Manejar archivos JavaScript con una estrategia específica
  if (request.url.match(/\.js(\?.*)?$/i)) {
    return handleJsRequest(request);
  }
  
  // Manejar fuentes web con una estrategia específica
  if (request.url.match(/\.(woff|woff2|ttf|eot|otf)(\?.*)?$/i)) {
    return handleFontRequest(request);
  }
  try {
    // Primero intentar obtener de la red
    const networkResponse = await fetch(request);
    
    // Si la respuesta es válida, actualizar la caché
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      console.log(`[Service Worker] Actualizando caché para: ${request.url}`);
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log(`[Service Worker] Error de red para ${request.url}, intentando desde caché`);
    
    // Intentar obtener de la caché
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`[Service Worker] Sirviendo desde caché: ${request.url}`);
      return cachedResponse;
    }
    
    // Manejar errores para recursos críticos
    if (request.url.endsWith('.css') || 
        request.url.endsWith('.js') ||
        request.url.includes('critical-assets')) {
      console.error(`[Service Worker] No se pudo cargar el recurso crítico: ${request.url}`);
      
      // Para CSS, devolver estilos mínimos para mantener la legibilidad
      if (request.url.endsWith('.css')) {
        return new Response(
          'body { font-family: Arial, sans-serif; padding: 20px; color: #333; }',
          { headers: { 'Content-Type': 'text/css' } }
        );
      }
      
      // Para JS crítico, podríamos devolver un mensaje o función vacía
      if (request.url.endsWith('.js')) {
        return new Response('console.log("Script no disponible en modo offline");', 
          { headers: { 'Content-Type': 'application/javascript' } });
      }
    }
    
    // Si no hay respuesta en caché, devolver un error 404
    return new Response('Recurso no disponible sin conexión', { 
      status: 404, 
      statusText: 'Not Found',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Función para actualizar la caché en segundo plano
const updateCacheInBackground = async () => {
  try {
    console.log('[Service Worker] Iniciando actualización de caché en segundo plano');
    
    // Abrir la caché
    const cache = await caches.open(CACHE_NAME);
    
    // Actualizar cada recurso en la caché
    const updatePromises = CACHE_ASSETS.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response && response.status === 200) {
          await cache.put(url, response.clone());
          console.log(`[Service Worker] Actualizado en segundo plano: ${url}`);
        }
      } catch (error) {
        console.warn(`[Service Worker] No se pudo actualizar ${url}:`, error);
      }
    });
    
    await Promise.all(updatePromises);
    console.log('[Service Worker] Actualización de caché en segundo plano completada');
    return true;
  } catch (error) {
    console.error('[Service Worker] Error en la actualización en segundo plano:', error);
    return false;
  }
};

// Manejar eventos de sincronización
self.addEventListener('sync', event => {
  if (event.tag === SYNC_EVENT) {
    console.log('[Service Worker] Sincronización detectada, actualizando caché...');
    event.waitUntil(updateCacheInBackground());
  }
});

// Función para notificar al usuario sobre actualizaciones
const notifyUpdateAvailable = async () => {
  try {
    // Verificar si el navegador soporta notificaciones
    if (!self.Notification || !self.Notification.permission === 'granted') {
      console.log('[Service Worker] Notificaciones no soportadas o no permitidas');
      return false;
    }
    
    // Mostrar notificación
    await self.registration.showNotification(
      NOTIFICATION_TITLE, 
      NOTIFICATION_OPTIONS
    );
    
    console.log('[Service Worker] Notificación de actualización mostrada');
    return true;
  } catch (error) {
    console.error('[Service Worker] Error al mostrar notificación:', error);
    return false;
  }
};

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notificación clickeada', event.notification.tag);
  event.notification.close();
  
  // Enfocar la ventana existente o abrir una nueva
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => {
        const urlToOpen = new URL('/', self.location.origin).href;
        
        // Buscar una ventana existente
        const matchingClient = clients.find(client => 
          client.url === urlToOpen && 'focus' in client
        );
        
        if (matchingClient) {
          return matchingClient.focus();
        } else if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Manejar mensajes del cliente (página web)
self.addEventListener('message', event => {
  if (event.data && event.data.type === REFRESH_CACHE_EVENT) {
    console.log('[Service Worker] Recibida solicitud de actualización de caché');
    event.waitUntil(
      updateCacheInBackground()
        .then(success => {
          // Notificar al cliente sobre el resultado
          event.ports[0].postMessage({
            success: success,
            message: success 
              ? 'Caché actualizada correctamente' 
              : 'Error al actualizar la caché'
          });
        })
    );
  }
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  console.log(`[Service Worker] Fetching: ${url.pathname}`);
  
  // Ignorar solicitudes que no sean GET o que sean de extensiones
  if (request.method !== 'GET' || 
      request.mode === 'navigate' && request.method !== 'GET' ||
      url.protocol === 'chrome-extension:' ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.eot')) {
    return;
  }
  
  // Para solicitudes de navegación
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Para recursos estáticos (CSS, JS, imágenes, etc.)
  if (url.origin === self.location.origin || 
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Para cualquier otra solicitud, intentar obtener de la red primero
  event.respondWith(
    fetch(request)
      .then(response => {
        // Si la respuesta es válida, guardar en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});