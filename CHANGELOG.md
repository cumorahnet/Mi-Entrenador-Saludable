# CHANGELOG

<!-- cdc-session:session-20260924173510-bc0f95 -->
## Sesión 24/09/2026, 08:58 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 77 cambio(s): 38 creado(s), 39 modificado(s) y 0 eliminado(s).

### Cambios

- .firebase/hosting.d3d3.cache
- .firebaserc
- CHANGELOG.md
- FIREBASE_SECURITY.md
- android/.gradle/8.13/checksums/checksums.lock
- android/.gradle/8.13/executionHistory/executionHistory.bin
- android/.gradle/8.13/executionHistory/executionHistory.lock
- android/.gradle/8.13/fileChanges/last-build.bin
- android/.gradle/8.13/fileHashes/fileHashes.bin
- android/.gradle/8.13/fileHashes/fileHashes.lock
- android/.gradle/8.13/gc.properties
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/.gradle/vcs-1/gc.properties
- android/app/build.gradle
- android/app/capacitor.build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/assets/public/privacidad.html
- android/app/src/main/assets/public/terminos.html
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- docs/ENTREGA-2.40.md
- docs/SUPERUSUARIO.md
- firebase-debug.log
- firebase.json
- firestore.rules
- functions/grant-platform-admin.cjs
- functions/index.js
- functions/package-lock.json
- functions/package.json
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.39.apk
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.39.apk.json
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.40.apk
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.40.apk.json
- package-lock.json
- package.json
- scripts/check-firestore-rules.cjs
- scripts/verify-release.cjs
- tests/account-safety.test.mjs
- tests/activity-recovery.test.mjs
- tests/android-integration.test.mjs
- tests/gps-lifecycle.test.mjs
- version.json
- work/.firebase/hosting.aG9zdGluZy0yLjQw.cache
- work/android-release-2.40.log
- work/check-device-firebase.cjs
- work/deploy-2.40.log
- work/deploy-download-2.40.log
- work/firebase-hosting-2.40.json
- work/firestore-6f85ac43-9cb3-4a1f-8138-37f70110c3d9.rules
- work/firestore-f7f16ccc-2f9b-4ae5-9257-fe4f746d9f20.rules
- work/firestore-published.rules
- work/firestore-rules-test-local.json
- work/firestore-rules-test-published.json
- work/hosting-2.40/assets/app-logic.js
- work/hosting-2.40/assets/app.js
- work/hosting-2.40/assets/exercise-catalog.js
- work/hosting-2.40/assets/movement-health-logo.png
- work/hosting-2.40/assets/native-gps.js
- work/hosting-2.40/assets/styles.css
- work/hosting-2.40/downloads/mi-entrenador-saludable-2.40.apk
- work/hosting-2.40/index.html
- work/hosting-2.40/privacidad.html
- work/hosting-2.40/terminos.html
- www/assets/app.js
- www/index.html
- www/privacidad.html
- www/terminos.html

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.13/checksums/checksums.lock, android/.gradle/8.13/executionHistory/executionHistory.bin, android/.gradle/8.13/executionHistory/executionHistory.lock, android/.gradle/8.13/fileChanges/last-build.bin, android/.gradle/8.13/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- La sesión contiene 77 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

## 2.40 — 2026-09-24

- Bloqueo persistente de acceso antes de eliminar una cuenta; los reintentos conservan el bloqueo y los tokens anteriores no pueden recrear datos.
- Recuperación del registro incompleto al iniciar sesión, con verificación y reintento de la aceptación de términos y privacidad.
- Pruebas de errores de registro, autorización y eliminación; 100 pruebas automatizadas y 245 casos de reglas.

<!-- cdc-session:session-20260923183117-f3ca68 -->
## Sesión 23/09/2026, 02:43 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 43 cambio(s): 4 creado(s), 39 modificado(s) y 0 eliminado(s).

### Cambios

- .firebase/hosting.d3d3.cache
- CHANGELOG.md
- android/.gradle/8.13/checksums/checksums.lock
- android/.gradle/8.13/executionHistory/executionHistory.bin
- android/.gradle/8.13/executionHistory/executionHistory.lock
- android/.gradle/8.13/fileChanges/last-build.bin
- android/.gradle/8.13/fileHashes/fileHashes.bin
- android/.gradle/8.13/fileHashes/fileHashes.lock
- android/.gradle/8.13/fileHashes/resourceHashesCache.bin
- android/.gradle/8.13/gc.properties
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/.gradle/vcs-1/gc.properties
- android/app/build.gradle
- android/app/capacitor.build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/assets/styles.css
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/java/com/mientrenadorsaludable/app/NativeGpsService.java
- android/app/src/main/java/com/mientrenadorsaludable/app/NativeSpeechPlugin.java
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- docs/ESTADO-PUBLICACION.md
- firebase-debug.log
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.39.apk
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.39.apk.json
- package-lock.json
- package.json
- tests/android-integration.test.mjs
- tests/custom-activity.test.mjs
- tests/gps-lifecycle.test.mjs
- version.json
- www/assets/app.js
- www/assets/styles.css
- www/index.html

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.13/checksums/checksums.lock, android/.gradle/8.13/executionHistory/executionHistory.bin, android/.gradle/8.13/executionHistory/executionHistory.lock, android/.gradle/8.13/fileChanges/last-build.bin, android/.gradle/8.13/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- La sesión contiene 43 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

## 2.39 — 2026-09-23

- Cierre inmediato del servicio GPS y su notificación al detener el seguimiento, incluso durante el inicio.
- La guía de voz libera su servicio cuando termina de hablar; preparar la voz no lo activa.
- Mapa del historial con tamaño definido y trazado al terminar la inicialización.
- Conservación de todas las etapas GPS al guardar y recuperar la sesión, sin unir tramos separados.

## 2.38 — 2026-09-22

- Una tarjeta por actividad personalizada con nombre y configuración equivalentes.
- Guardado reutilizable sin crear copias al repetir la misma actividad.
- Orden visible dentro de cada tarjeta seleccionada; la lista refleja la prioridad elegida.
- Altura ajustada al espacio disponible en Android y calentamiento fijo al inicio.

## 2.37 — 2026-09-22

- Actividades personalizadas guardadas en Firebase y seleccionables desde Inicio.
- Combinación de varias actividades personalizadas y predefinidas con prioridad común.
- Calentamiento obligatorio al inicio de todas las sesiones.
- Desglose de tiempos y GPS independiente para cada actividad personalizada.
- Versión Android 2.37 (237).

## 2.36 — 2026-09-21

- Preparación configurable para actividades personalizadas.
- Guardado y edición de entrenamientos sin inicio automático.
- Selector del orden de actividades y resumen por fase.
- Versión Android 2.36 (236).

<!-- cdc-session:session-20260909160746-cb00ea -->
## Sesión 09/09/2026, 10:57 a.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 27 cambio(s): 5 creado(s), 22 modificado(s) y 0 eliminado(s).

### Cambios

- android/.gradle/8.13/checksums/checksums.lock
- android/.gradle/8.13/checksums/md5-checksums.bin
- android/.gradle/8.13/checksums/sha1-checksums.bin
- android/.gradle/8.13/executionHistory/executionHistory.bin
- android/.gradle/8.13/executionHistory/executionHistory.lock
- android/.gradle/8.13/fileChanges/last-build.bin
- android/.gradle/8.13/fileHashes/fileHashes.bin
- android/.gradle/8.13/fileHashes/fileHashes.lock
- android/.gradle/8.13/fileHashes/resourceHashesCache.bin
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/app/capacitor.build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.33.apk
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.33.apk.json
- tests/rest-announcement.test.mjs
- www/assets/app.js

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.13/checksums/checksums.lock, android/.gradle/8.13/checksums/md5-checksums.bin, android/.gradle/8.13/checksums/sha1-checksums.bin, android/.gradle/8.13/executionHistory/executionHistory.bin, android/.gradle/8.13/executionHistory/executionHistory.lock). Valida compatibilidad y despliegue.
- La sesión contiene 27 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260908221317-2ced5b -->
## Sesión 08/09/2026, 04:13 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260908202644-3cbf85 -->
## Sesión 08/09/2026, 02:28 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260902145645-fddfad -->
## Sesión 02/09/2026, 11:41 a.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 88 cambio(s): 25 creado(s), 38 modificado(s) y 25 eliminado(s).

### Cambios

- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/app/build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/public/assets/app-logic.js
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/assets/exercise-catalog.js
- android/app/src/main/assets/public/assets/lottie/exercises/sentadilla-clasica.json
- android/app/src/main/assets/public/assets/styles.css
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/res/mipmap-hdpi/ic_launcher.png
- android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-mdpi/ic_launcher.png
- android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
- android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
- android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- index.html
- outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.32.apk
- outputs/Mi-Entrenador-Saludable-2.11-debug.apk
- outputs/Mi-Entrenador-Saludable-2.12-debug.apk
- outputs/Mi-Entrenador-Saludable-2.13-debug.apk
- outputs/Mi-Entrenador-Saludable-2.14-debug.apk
- outputs/Mi-Entrenador-Saludable-2.15-debug.apk
- outputs/Mi-Entrenador-Saludable-2.16-debug.apk
- outputs/Mi-Entrenador-Saludable-2.16.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.17.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.18.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.19.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.20.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.21.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.22.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.23.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.24.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.25.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.26.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.27.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.28.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.29.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.30.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.11-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.12-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.13-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.14-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.15-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.16-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.16.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.17.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.18.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.19.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.20.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.21.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.22.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.23.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.24.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.25.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.26.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.27.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.28.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.29.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.30.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.31.0-debug.apk
- outputs/anteriores/Mi-Entrenador-Saludable-2.32.0-debug.apk
- package-lock.json
- package.json
- tests/android-integration.test.mjs
- tests/app-logic.test.mjs
- tests/lottie-assets.test.mjs
- tools/generate-exercise-lotties.mjs
- version.json
- www/assets/app-logic.js
- www/assets/app.js
- www/assets/exercise-catalog.js
- www/assets/lottie/exercises/sentadilla-clasica.json
- www/assets/styles.css
- www/index.html

### Riesgos

- Se eliminaron 25 archivo(s). Confirma que las eliminaciones sean intencionales antes de integrar los cambios.
- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin, android/.gradle/8.11.1/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- La sesión contiene 88 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260901184813-35be4c -->
## Sesión 01/09/2026, 12:49 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260831154623-7ff59e -->
## Sesión 31/08/2026, 03:27 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 59 cambio(s): 21 creado(s), 38 modificado(s) y 0 eliminado(s).

### Cambios

- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/8.11.1/fileHashes/resourceHashesCache.bin
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/app/build.gradle
- android/app/capacitor.build.gradle
- android/app/src/main/AndroidManifest.xml
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/app-logic.js
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/assets/exercise-catalog.js
- android/app/src/main/assets/public/assets/lottie/exercises/sentadilla-clasica.json
- android/app/src/main/assets/public/assets/styles.css
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/java/com/mientrenadorsaludable/app/NativeSpeechPlugin.java
- android/app/src/main/java/com/mientrenadorsaludable/app/SpeechForegroundService.java
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- index.html
- outputs/Mi-Entrenador-Saludable-2.25.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.26.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.27.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.28.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.29.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.30.0-debug.apk
- package-lock.json
- package.json
- tests/app-logic.test.mjs
- tests/lottie-assets.test.mjs
- tools/generate-exercise-lotties.mjs
- version.json
- work/mes-lottie-player.png
- work/mes-lottie-screen.png
- work/mes-lottie-step1.png
- work/mes-lottie-step2.png
- work/mes-lottie-step3.png
- work/mes-lottie-step4.png
- work/mes-lottie-step5.png
- work/mes-lottie-step6.png
- work/mes-screen.png
- work/mes-window.xml
- www/assets/app-logic.js
- www/assets/app.js
- www/assets/exercise-catalog.js
- www/assets/lottie/exercises/sentadilla-clasica.json
- www/assets/styles.css
- www/index.html

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin, android/.gradle/8.11.1/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- La sesión contiene 59 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260831003455-8c4f28 -->
## Sesión 30/08/2026, 07:15 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 35 cambio(s): 2 creado(s), 32 modificado(s) y 1 eliminado(s).

### Cambios

- README.md
- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/8.11.1/fileHashes/resourceHashesCache.bin
- android/.gradle/8.11.1/gc.properties
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/.gradle/vcs-1/gc.properties
- android/app/build.gradle
- android/app/capacitor.build.gradle
- android/app/src/main/AndroidManifest.xml
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/java/com/mientrenadorsaludable/app/MainActivity.java
- android/app/src/main/java/com/mientrenadorsaludable/app/NativeSpeechPlugin.java
- android/app/src/main/java/com/mientrenadorsaludable/app/NativeSpeechPlugin.java.disabled.off
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- outputs/Mi-Entrenador-Saludable-2.21.0-debug.apk
- package-lock.json
- package.json
- www/assets/app.js
- www/index.html

### Riesgos

- Se eliminaron 1 archivo(s). Confirma que las eliminaciones sean intencionales antes de integrar los cambios.
- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin, android/.gradle/8.11.1/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- Se modificó código fuente sin cambios detectados en archivos de prueba. Verifica la cobertura antes de cerrar el trabajo.
- La sesión contiene 35 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.
- Se eliminaron archivos; conviene validar referencias y compatibilidad.
- Cambió la definición de dependencias; valida instalación y seguridad.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260827042548-cc5ecc -->
## Sesión 26/08/2026, 10:45 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 1 cambio(s): 0 creado(s), 1 modificado(s) y 0 eliminado(s).

### Cambios

- www/assets/app.js

### Riesgos

- Se modificó código fuente sin cambios detectados en archivos de prueba. Verifica la cobertura antes de cerrar el trabajo.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260811012627-238d01 -->
## Sesión 10/08/2026, 07:54 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.
- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260810051940-aeb57d -->
## Sesión 09/08/2026, 11:20 p.m.

### Resumen

La sesión se enfocó en: veamos si funciona. Se detectaron 1 cambio(s): 0 creado(s), 1 modificado(s) y 0 eliminado(s).

### Cambios

- index.html.backup

### Riesgos

- El análisis incluye archivos que ya tenían cambios al iniciar la sesión.

### Próximo paso

- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260810022903-8a89af -->
## Sesión 09/08/2026, 08:30 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260808055141-2af05b -->
## Sesión 07/08/2026, 11:51 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260725230906-47aaea -->
## Sesión 25/07/2026, 05:26 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260725185948-e652dc -->
## Sesión 25/07/2026, 03:49 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 39 cambio(s): 9 creado(s), 27 modificado(s) y 3 eliminado(s).

### Cambios

- .github/workflows/tests.yml
- .gitignore
- FIREBASE_SECURITY.md
- README.md
- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/app/build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/public/assets/app-logic.js
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/assets/movement-health-logo.png
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- assets/app.js
- assets/movement-health-logo.png
- assets/styles.css
- firebase.json
- firestore.rules
- index.html
- outputs/Mi-Entrenador-Saludable-2.20.0-debug.apk
- package-lock.json
- package.json
- tests/app-logic.test.mjs
- version.json
- vitest.config.mjs
- www/assets/app-logic.js
- www/assets/app.js
- www/assets/movement-health-logo.png
- www/index.html

### Riesgos

- Se eliminaron 3 archivo(s). Confirma que las eliminaciones sean intencionales antes de integrar los cambios.
- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin, android/.gradle/8.11.1/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- La sesión contiene 39 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260725034231-e4e972 -->
## Sesión 24/07/2026, 11:11 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 31 cambio(s): 10 creado(s), 21 modificado(s) y 0 eliminado(s).

### Cambios

- README.md
- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/public/assets/app.js
- android/app/src/main/assets/public/assets/styles.css
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- assets/app.js
- assets/styles.css
- index.html
- outputs/Mi-Entrenador-Saludable-2.16.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.17.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.18.0-debug.apk
- outputs/Mi-Entrenador-Saludable-2.19.0-debug.apk
- package-lock.json
- package.json
- version.json
- www/assets/app.js
- www/assets/styles.css
- www/index.html

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin, android/.gradle/8.11.1/fileHashes/fileHashes.bin). Valida compatibilidad y despliegue.
- Se modificó código fuente sin cambios detectados en archivos de prueba. Verifica la cobertura antes de cerrar el trabajo.
- La sesión contiene 31 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Ejecutar las pruebas automatizadas y validar el comportamiento afectado.
- Revisar el diff y preparar un commit descriptivo.

<!-- cdc-session:session-20260724193422-664fd8 -->
## Sesión 24/07/2026, 07:44 p.m.

### Resumen

La sesión se enfocó en: verificad cdc. Se detectaron 53 cambio(s): 9 creado(s), 44 modificado(s) y 0 eliminado(s).

### Cambios

- android/.gradle/8.11.1/checksums/checksums.lock
- android/.gradle/8.11.1/checksums/sha1-checksums.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.bin
- android/.gradle/8.11.1/executionHistory/executionHistory.lock
- android/.gradle/8.11.1/fileChanges/last-build.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.bin
- android/.gradle/8.11.1/fileHashes/fileHashes.lock
- android/.gradle/8.11.1/gc.properties
- android/.gradle/buildOutputCleanup/buildOutputCleanup.lock
- android/.gradle/buildOutputCleanup/outputFiles.bin
- android/.gradle/file-system.probe
- android/.gradle/vcs-1/gc.properties
- android/app/build.gradle
- android/app/capacitor.build.gradle
- android/app/src/main/assets/capacitor.config.json
- android/app/src/main/assets/capacitor.plugins.json
- android/app/src/main/assets/public/assets/movement-health-logo.png
- android/app/src/main/assets/public/cordova.js
- android/app/src/main/assets/public/cordova_plugins.js
- android/app/src/main/assets/public/index.html
- android/app/src/main/res/mipmap-hdpi/ic_launcher.png
- android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
- android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-mdpi/ic_launcher.png
- android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
- android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
- android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
- android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
- android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
- android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
- android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
- android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
- android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
- android/app/src/main/res/values/ic_launcher_background.xml
- android/app/src/main/res/xml/config.xml
- android/capacitor-cordova-android-plugins/build.gradle
- android/capacitor-cordova-android-plugins/cordova.variables.gradle
- android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml
- android/capacitor.settings.gradle
- assets/movement-health-logo.png
- index.html
- index.html.backup
- outputs/Mi-Entrenador-Saludable-2.11-debug.apk
- outputs/Mi-Entrenador-Saludable-2.12-debug.apk
- outputs/Mi-Entrenador-Saludable-2.13-debug.apk
- outputs/Mi-Entrenador-Saludable-2.14-debug.apk
- outputs/Mi-Entrenador-Saludable-2.15-debug.apk
- outputs/Mi-Entrenador-Saludable-2.16-debug.apk
- version.json
- www/assets/movement-health-logo.png
- www/index.html

### Riesgos

- Se modificaron archivos de configuración o infraestructura (android/.gradle/8.11.1/checksums/checksums.lock, android/.gradle/8.11.1/checksums/sha1-checksums.bin, android/.gradle/8.11.1/executionHistory/executionHistory.bin, android/.gradle/8.11.1/executionHistory/executionHistory.lock, android/.gradle/8.11.1/fileChanges/last-build.bin). Valida compatibilidad y despliegue.
- Se modificó código fuente sin cambios detectados en archivos de prueba. Verifica la cobertura antes de cerrar el trabajo.
- La sesión contiene 53 cambios. Considera dividir la revisión o el commit para reducir el riesgo de integración.

### Próximo paso

- videos de ajercicio

<!-- cdc-session:session-20260724191510-e09001 -->
## Sesión 24/07/2026, 01:19 p.m.

### Resumen

La sesión se enfocó en: verificar funcionamiento. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- revisar funcionamiento de app

<!-- cdc-session:session-20260722235956-c3a975 -->
## Sesión 22/07/2026, 08:27 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260722235327-d657a5 -->
## Sesión 22/07/2026, 05:54 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 0 cambio(s): 0 creado(s), 0 modificado(s) y 0 eliminado(s).

### Cambios

- No se detectaron archivos modificados.

### Riesgos

- No se detectaron archivos modificados. Confirma que el trabajo se haya guardado dentro del proyecto y fuera de carpetas ignoradas.

### Próximo paso

- Revisar y resolver los riesgos detectados en este cierre.
- Definir el siguiente objetivo de trabajo del proyecto.

<!-- cdc-session:session-20260722184228-0bb411 -->
## Sesión 22/07/2026, 12:53 p.m.

### Resumen

Se cerró una sesión de trabajo del proyecto Mi-Entrenador-Saludable. Se detectaron 3 cambio(s): 0 creado(s), 3 modificado(s) y 0 eliminado(s).

### Cambios

- index.html
- index.html.backup
- version.json

### Riesgos

- Sin riesgos detectados.

### Próximo paso

- Revisar el diff y preparar un commit descriptivo.
