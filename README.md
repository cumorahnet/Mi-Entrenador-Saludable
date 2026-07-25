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

## Para funciones nativas reales

La versión actual usa `@capacitor/geolocation` en Android y la API web como alternativa en navegador. Para rastreo real con la app en segundo plano, los siguientes pasos son:

- Reemplazar `speechSynthesis` por Text-to-Speech nativo.
- Incorporar un plugin especializado de ubicación en segundo plano.
- Agregar notificación persistente durante caminata/carrera.
- Configurar permisos Android de ubicación en primer y segundo plano.
- Preparar iconos, splash screen, firma y versión para Play Store.
