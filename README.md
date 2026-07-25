# Mi Entrenador Saludable Android

Proyecto base para convertir la app web actual en app Android con Capacitor.

## Estructura

- `index.html`: documento base y carga de dependencias.
- `assets/styles.css`: tema visual, contraste y diseño adaptable.
- `assets/app.js`: componentes, navegación, rutinas y seguimiento GPS.
- `www/`: copia lista para Capacitor/Android.
- `android/`: proyecto nativo generado por Capacitor.

## Requisitos

- Node.js instalado.
- Android Studio instalado.
- Android SDK configurado por Android Studio.

## Primer arranque

```powershell
npm.cmd install
npm.cmd run android:add
npm.cmd run android:sync
npm.cmd run android:open
```

Android Studio abrirá el proyecto nativo en la carpeta `android/`.

## Después de cambios en la app

Edita `index.html` y `assets/`, copia los cambios a `www/` y sincroniza:

```powershell
npm.cmd run android:sync
```

## Para funciones nativas reales

La versión actual usa `@capacitor/geolocation` en Android y la API web como alternativa en navegador. Para rastreo real con la app en segundo plano, los siguientes pasos son:

- Reemplazar `speechSynthesis` por Text-to-Speech nativo.
- Incorporar un plugin especializado de ubicación en segundo plano.
- Agregar notificación persistente durante caminata/carrera.
- Configurar permisos Android de ubicación en primer y segundo plano.
- Preparar iconos, splash screen, firma y versión para Play Store.
