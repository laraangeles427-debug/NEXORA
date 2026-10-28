# NEXORA

**Conectando conocimiento, creando oportunidades.**

NEXORA es un prototipo de plataforma web educativa que ayuda a aprender, practicar y compartir conocimientos de educación financiera, contabilidad y tributación, con una experiencia orientada a la inclusión y al aprendizaje práctico.

> **Estado:** prototipo educativo en desarrollo. La publicación en GitHub Pages no equivale a una certificación de seguridad, una validación pedagógica completa ni una autorización para prestar asesoría profesional.

## Qué incluye actualmente

- **Aula virtual:** rutas de aprendizaje en educación financiera, contabilidad y tributación, con niveles y evaluaciones.
- **Práctica y diagnóstico:** preguntas, retroalimentación, resultados por habilidades y desbloqueo progresivo según el desempeño.
- **Laboratorio práctico:** simulador sencillo de emprendimiento, clasificación de cuentas y registro guiado de operaciones contables.
- **Herramientas personales:** presupuesto, registro de movimientos y seguimiento del progreso.
- **Motivación:** perfil, niveles, experiencia, insignias y constancias educativas imprimibles.
- **Accesibilidad:** controles de tamaño de texto y contraste, lectura por voz y funciones de conversación por voz cuando el navegador las admite.
- **Cuenta y sincronización:** autenticación y almacenamiento personal mediante Supabase, sujetos a la configuración de sus políticas de seguridad.
- **Aplicación web progresiva:** manifiesto y service worker para instalación y disponibilidad limitada sin conexión.

## Arquitectura del prototipo

- `index.html`: aplicación principal, interfaz, contenido y lógica del lado del navegador.
- `aula.html` y `clase-finanzas.html`: páginas complementarias de aprendizaje.
- `voice-conversation.js`: interacción de voz continua cuando es compatible.
- `sw.js` y `manifest.webmanifest`: comportamiento PWA.
- `server.js`: API del asistente educativo NEXORA.
- `package.json`: dependencias del servidor.

## Límites conocidos y tareas antes de abrir al público

1. **Privacidad:** completar una política formal, canal de contacto, conservación de datos y proceso de acceso/eliminación de cuentas y datos.
2. **Seguridad del asistente:** añadir límites de uso del endpoint y monitorización para evitar abuso y gastos inesperados; verificar la configuración de producción.
3. **Constancias:** actualmente son constancias educativas del prototipo, basadas en el progreso disponible en el navegador. No son títulos oficiales y no tienen verificación pública de autenticidad.
4. **Supabase:** revisar las políticas RLS de cada tabla, probar registro, inicio de sesión, recuperación de sesión, sincronización y aislamiento entre cuentas. Activar la protección contra contraseñas filtradas cuando corresponda en la configuración de Auth.
5. **Accesibilidad:** realizar pruebas con teclado, lector de pantalla, ampliación, contraste, subtítulos/texto equivalente y dispositivos móviles reales.
6. **Calidad pedagógica:** revisar todas las respuestas, ejercicios y criterios de evaluación con docentes. En tributación, verificar la normativa ecuatoriana vigente en fuentes oficiales antes de publicar contenido como definitivo.
7. **Pruebas:** ejecutar una prueba completa de extremo a extremo en navegadores y teléfonos reales. El despliegue exitoso confirma publicación, no que cada función esté validada.

## Ejecutar localmente

Para revisar las páginas estáticas, con Python instalado:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000/`.

Para ejecutar el servidor del asistente, instala las dependencias con `npm install`, configura la variable de entorno `OPENAI_API_KEY` en el entorno del servidor y ejecuta `npm start`. No coloques esa clave en el código del navegador ni en el repositorio. La configuración de CORS del servidor debe coincidir con el dominio de la aplicación publicada.

## Publicación

La interfaz se publica mediante GitHub Pages desde la rama principal. El servidor del asistente se gestiona por separado y necesita su propio despliegue y comprobaciones de salud.

NEXORA debe presentarse como un **prototipo educativo en evolución**, no como una plataforma financiera profesional ni como un emisor de certificaciones oficiales.
