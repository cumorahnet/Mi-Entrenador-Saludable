# Mi Entrenador Saludable Android

Proyecto base para convertir la app web actual en app Android con Capacitor.

## Estructura

- `www/index.html`: documento base y carga de dependencias.
- `www/assets/styles.css`: tema visual, contraste y diseño adaptable.
- `www/assets/app.js`: componentes, navegación, rutinas y seguimiento GPS.
- `www/assets/app-logic.js`: cálculos puros reutilizables y probados.
- `tests/`: pruebas automatizadas de la lógica de la aplicación.
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

Edita directamente `www/index.html` o `www/assets/` y sincroniza:

```powershell
npm.cmd run android:sync
```

## Pruebas automatizadas

Antes de registrar un cambio de código, ejecuta:

```powershell
npm.cmd run check
```

Este comando ejecuta las pruebas y exige 100 % de cobertura por archivo para la
lógica incluida en `www/assets/app-logic.js`. Los cambios que agreguen nueva
lógica pura deben acompañarse de sus pruebas. GitHub Actions ejecuta la misma
verificación en cada `push` y solicitud de cambios.

## Vista web en GitHub Pages

Cada cambio enviado a la rama `main` ejecuta las pruebas y, si pasan, publica
directamente la carpeta `www/` mediante GitHub Actions:

```text
https://cumorahnet.github.io/Mi-Entrenador-Saludable/
```

En la configuración del repositorio, **Settings → Pages → Build and
deployment → Source** debe estar seleccionado como **GitHub Actions**. No es
necesario copiar `index.html` ni `assets/` a la raíz del repositorio.

El `index.html` de la raíz es únicamente una redirección de compatibilidad hacia
`www/`; no contiene una segunda copia de la aplicación.

## Para funciones nativas reales

La versión actual usa `@capacitor/geolocation` y Text-to-Speech nativo en Android, con las API web como alternativa en navegador. Para rastreo real con la app en segundo plano, los siguientes pasos son:

- Incorporar un plugin especializado de ubicación en segundo plano.
- Agregar notificación persistente durante caminata/carrera.
- Configurar permisos Android de ubicación en primer y segundo plano.
- Preparar iconos, splash screen, firma y versión para Play Store.

## Actualizaciones Android verificadas

La carpeta oficial en este equipo es `C:\Cumorahnet\Projects\Proyectos\Mi-Entrenador-Saludable\android`.
La copia `OneDrive\Desktop\MisProyectos\Mi-Entrenador-Saludable-v2` es antigua.

```powershell
npm.cmd run android:verify
npm.cmd run android:release
npm.cmd run android:open
```

`android:release` sincroniza los recursos web, recompila un APK debug y comprueba
su version y fecha. Guarda el APK en `outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-<version>.apk`
y un JSON adjunto con ruta de origen, version, fecha y SHA-256. Si falla, no usar
un APK de una ejecucion anterior. Antes de pulsar Run, comprobar la ruta completa
del proyecto abierto. Confirmar la version instalada en el dispositivo antes de
dar la actualizacion por terminada.
