# Actividades personalizadas — versión 2.35

En Inicio, pulsa **Actividad personalizada**, escribe el nombre y elige:

- **Tiempo:** una cuenta regresiva en segundos.
- **Ciclos:** tiempo por ciclo, cantidad de ciclos y descanso entre ciclos.
- **Seguimiento GPS:** ruta, distancia y tiempo hasta finalizar manualmente.

La configuración se guarda entre las rutinas del usuario para reutilizarla,
editarla o eliminarla. Las actividades personalizadas no añaden ejercicios
predefinidos ni calentamiento automáticamente.

Al terminar cualquier sesión, **Guardar actividad** espera la confirmación de
Firestore antes de salir. Si falla, conserva el resumen para reintentar. Se usa
un identificador estable por sesión para evitar registros duplicados.
**Descartar actividad** elimina la sesión pendiente sin crear historial; la
configuración de la actividad continúa disponible.

## Publicación

Firebase Hosting: `https://mi-entrenador-saludable.web.app`

```powershell
npm.cmd exec --yes --package firebase-tools -- firebase deploy --only hosting --project mi-entrenador-saludable
```

Hosting usa el proyecto `mi-entrenador-saludable`. La configuración de Firebase
Auth y Firestore de la aplicación permanece en `entrenadorpersonal-4e69d`.
Este despliegue publica solo Hosting y no modifica las reglas de Firestore.

Android: ejecutar `android:verify`, `android:release` y `android:open` según
AGENTS.md. El APK 2.35 tiene versionCode 235 y es una compilación debug.

## Preparación y orden de la sesión

La actividad personalizada permite indicar preparación de 0 a 3600 segundos; 0 la omite. Las actividades anteriores conservan preparación cero hasta que se editen.

**Guardar entrenamiento** guarda la configuración y vuelve al menú sin iniciar la sesión. Desde **Entrenamiento principal** puedes seleccionar la rutina guardada o editarla. Puedes combinarla con caminata, carrera y estiramientos.

En **Orden de las actividades**, selecciona la posición de cada actividad. La preparación se realiza una vez al inicio y el resto sigue el orden mostrado al pulsar **Comenzar**. El orden se elige para cada sesión.
