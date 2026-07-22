# Mi Entrenador Saludable Android

Proyecto base para convertir la app web actual en app Android con Capacitor.

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

Edita `www/index.html` y sincroniza:

```powershell
npm.cmd run android:sync
```

## Para funciones nativas reales

La versión actual conserva la app web funcionando dentro de Capacitor. Para comportamiento tipo app deportiva real, los siguientes pasos son:

- Reemplazar `navigator.geolocation` por `@capacitor/geolocation` y luego un plugin de background geolocation.
- Reemplazar `speechSynthesis` por Text-to-Speech nativo.
- Agregar notificación persistente durante caminata/carrera.
- Configurar permisos Android de ubicación en primer y segundo plano.
- Preparar iconos, splash screen, firma y versión para Play Store.
