# Seguimiento nativo Android (2.34)

Android utiliza `NativeGpsPlugin` y `NativeGpsService`, con Fused Location Provider
21.3.0. El servicio de tipo `location` solicita lecturas de alta precisión cada
dos segundos (el sistema decide la frecuencia efectiva). Se inicia desde la app
visible, después de obtener ubicación precisa, y muestra una notificación
persistente. No solicita acceso permanente a ubicación en segundo plano.

El servicio acumula distancia, conserva el recorrido en almacenamiento privado y
emite voz sin depender de temporizadores de JavaScript. La pantalla consulta los
datos incrementales y recupera los puntos pendientes al volver al primer plano.
Al finalizar una etapa se detiene el servicio y se recoge su último resumen.
Cerrar la tarea detiene el servicio; tras una terminación del proceso se requiere
recuperar explícitamente la sesión desde la app. No se inventa distancia durante
intervalos sin señal.

Se rechazan lecturas antiguas, errores mayores de 50 m y saltos incompatibles con
caminata/carrera. Los incrementos pequeños se acumulan contra el último punto
aceptado. Se informa del avance cada minuto o tras 100 m (con al menos 30 segundos
entre avisos), y se evitan avisos idénticos consecutivos de falta de señal/avance.
En navegador se conserva la geolocalización web.

## Verificación

- `npm.cmd test`: lógica de fases, GPS web y puente nativo, incluyendo lectura
  final, recuperación incremental y carreras entre consulta y parada.
- `android/gradlew.bat :app:testDebugUnitTest`: filtro GPS Java.
- `npm.cmd run android:verify` y `npm.cmd run android:release`: APK debug nuevo
  con versión y archivo JSON de procedencia verificados.
- En teléfono: empezar caminata al aire libre, bloquear pantalla varios minutos,
  comprobar notificación/voz, desbloquear y verificar recorrido/distancia.
  Finalizar etapa y comprobar que desaparece el servicio y siguen las etapas
  seleccionadas. Probar también pérdida de señal y denegación de permiso.

La compilación y las pruebas automatizadas no sustituyen la caminata física.

Referencias: [servicios de ubicación](https://developer.android.com/develop/background-work/services/fgs/service-types#location),
[Fused Location Provider](https://developers.google.com/android/reference/com/google/android/gms/location/FusedLocationProviderClient).
