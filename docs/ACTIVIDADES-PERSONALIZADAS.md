# Actividades personalizadas — versión 2.35

En Inicio, pulsa **Actividad personalizada**, escribe el nombre y elige:

- **Tiempo:** una cuenta regresiva en segundos.
- **Ciclos:** tiempo por ciclo, cantidad de ciclos y descanso entre ciclos.
- **Seguimiento GPS:** ruta, distancia y tiempo hasta finalizar manualmente.

La configuración se guarda entre las rutinas del usuario para reutilizarla,
editarla y reutilizarla desde Inicio. Las actividades personalizadas aparecen
junto a las predefinidas y permiten seleccionar varias en una sesión.
Todas las sesiones comienzan con un único calentamiento obligatorio.

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

La actividad personalizada permite indicar preparación adicional de 0 a 3600 segundos; 0 omite solamente esa preparación adicional. Esta se realiza antes de la actividad correspondiente y nunca sustituye el calentamiento obligatorio.

**Guardar entrenamiento** espera la confirmación de Firestore y vuelve al menú sin iniciar la sesión. La configuración se conserva en la cuenta, disponible otros días y dispositivos con la misma cuenta. Desde Inicio puedes seleccionar las actividades guardadas o editarlas. Puedes combinarlas con entrenamiento principal, caminata, carrera y estiramientos.

En **Orden de las actividades**, selecciona la posición de cada actividad, incluidas todas las personalizadas seleccionadas. El calentamiento se realiza una vez al inicio y el resto sigue el orden mostrado al pulsar **Comenzar**. El orden se elige para cada sesión.
