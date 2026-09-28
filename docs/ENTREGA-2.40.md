# Entrega 2.40 — 2026-09-24

- Versión Android 2.40, versionCode 240.
- Corregidos el borrado con sesiones abiertas y la recuperación de registros incompletos.
- Publicados Firestore Rules, `listPlatformAccounts`, `deletePlatformAccount` y Hosting en `mi-entrenador-saludable`. El cliente actual también usa ese proyecto para Auth y Firestore; sustituye la configuración descrita en el registro histórico de entrega 2.39.
- 100 pruebas aprobadas; `npm.cmd run check` correcto; 245 casos de reglas aprobados antes y después de publicar.
- APK debug nuevo generado con `android:release`, después de `android:verify`: `outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.40.apk`, con registro de procedencia JSON contiguo.
- Descarga: https://mi-entrenador-saludable.web.app/downloads/mi-entrenador-saludable-2.40.apk
- `node scripts/verify-release.cjs` comprobó los archivos web publicados, la coincidencia del SHA-256 del APK descargado y el rechazo de solicitudes sin autorización por ambas funciones.
- No había dispositivo conectado por ADB. No se instaló ni se verificó la versión en un celular.

## Verificación y actualización del 2026-09-28

- Recompilado con `android:release` tras `android:verify`; APK debug generado a las `2026-09-28T18:37:39.361Z`.
- SHA-256: `c2b01f0601dc2986e3dc8ec5250561c5b6dc1d7d6104f9f5e1f8399973ba1fce`.
- Instalado conservando datos en el dispositivo conectado, modelo `24049RN28L`. ADB confirmó `versionName=2.40`, `versionCode=240` y actualización el `2026-09-28 12:45:43`; se abrió la actividad principal.
- Android Studio abierto mediante `android:open` desde la copia oficial en `C:\Cumorahnet\Projects\Proyectos\Mi-Entrenador-Saludable\android`.
- Hosting y reglas publicados de nuevo; Firebase confirmó que ambas funciones ya coincidían con el código local.
- 100 pruebas aprobadas y cobertura del 100 % del módulo `app-logic.js`. Adaptadas las pruebas de selección a los controles de avisos GPS y a estados independientes.
- Verificados los archivos web publicados, el SHA-256 del APK descargado y el rechazo de solicitudes sin autorización en ambas funciones. Reglas: 245 casos aprobados antes y después de publicar.

## Publicación del APK

Hosting se publicó mediante `work/firebase-hosting-2.40.json`, usando una copia de `www` en `work/hosting-2.40` más el APK. El APK no está en `www`, para evitar incluirlo dentro de futuras compilaciones. Un despliegue ordinario desde `www` retirará ese enlace; para conservarlo hay que preparar de nuevo la carpeta de publicación.

## Pendiente de mantenimiento

Firebase advierte que el runtime Node.js 20 de las funciones dejará de admitir despliegues el 2026-10-30. Actualizarlo antes de esa fecha.
