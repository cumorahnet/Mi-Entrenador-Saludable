# Estado de entrega — 2026-09-23

- Version: 2.39, versionCode 239.
- Android sincronizado en C:\Cumorahnet\Projects\Proyectos\Mi-Entrenador-Saludable\android y abierto mediante npm.cmd run android:open.
- APK debug generado con android:release: outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-2.39.apk. Su JSON contiene fecha, ruta y SHA-256 verificados. No se ha verificado una instalacion en dispositivo.
- Firebase Hosting publicado en https://mi-entrenador-saludable.web.app. Se verifico que assets/app.js coincide exactamente con www/assets/app.js.
- Hosting usa el proyecto mi-entrenador-saludable; la configuracion de autenticacion y datos de la app usa entrenadorpersonal-4e69d. No confundir ambos proyectos al desplegar reglas. No hubo cambios en reglas ni migraciones de datos en esta entrega.
- npm.cmd run check: 92 pruebas aprobadas; cobertura de app-logic.js al 100% en lineas, ramas, funciones y sentencias.

## Google Play: pendiente por decision del usuario

El usuario esta en el registro de Play Console, seleccionando un perfil de pagos, y tiene otro domicilio. Si sigue en Mexico y registra una cuenta personal, actualizar primero la direccion legal del perfil existente en Google Payments y volver a seleccionarlo. Si cambio de pais, crear un perfil del nuevo pais.

Pendiente: terminar registro y verificacion de cuenta; configurar firma de publicacion y AAB; actualizar y validar target API 36; preparar ficha, privacidad, eliminacion de cuenta y declaraciones de datos, salud y servicios; realizar las pruebas requeridas por su tipo de cuenta; solicitar publicacion. No se ha publicado nada en Google Play.
