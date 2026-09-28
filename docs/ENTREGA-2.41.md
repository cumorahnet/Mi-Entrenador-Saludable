# Entrega 2.41 — 2026-09-28

- Corregida la inicialización de Functions compat en consulta y eliminación: `firebase.app().functions('us-central1')`.
- Reproducido `app-compat/invalid-app-argument` con el SDK real 10.7.1 y comprobada la inicialización corregida de ambas funciones.
- 103 pruebas aprobadas, incluidas carga, paginación, borrado simulado, cancelación y rechazo de permisos del panel.
- APK debug nuevo generado con `android:release` después de `android:verify`, con registro de procedencia junto al APK en `outputs/`.
- Instalación en el dispositivo comprobada por ADB: `versionName=2.41`, `versionCode=241`. Android Studio abierto desde la copia oficial.
- Hosting publicado desde `work/firebase-hosting-2.41.json`, conservando la descarga 2.40. Web y hash del APK 2.41 verificados con `scripts/verify-release.cjs`.
- Prueba visual en el teléfono: desaparece el error de inicialización y el servidor responde con rechazo de permisos. Diagnóstico de Auth confirma ausencia de la claim `platformAdmin` en la cuenta utilizada. La asignación de privilegios se trata por separado y requiere autorización del responsable.
- Descarga: https://mi-entrenador-saludable.web.app/downloads/mi-entrenador-saludable-2.41.apk
