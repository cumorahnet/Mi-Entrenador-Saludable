# Actualizaciones Android

- La copia de trabajo Android en este equipo es `C:\Cumorahnet\Projects\Proyectos\Mi-Entrenador-Saludable\android`.
- No compilar ni instalar desde `OneDrive\Desktop\MisProyectos\Mi-Entrenador-Saludable-v2`: es una copia antigua.
- Antes de actualizar, ejecutar `npm.cmd run android:verify`. Generar el APK con `npm.cmd run android:release`, que sincroniza Capacitor, recompila y verifica version y fecha del APK. El comando produce un APK debug.
- Abrir el proyecto con `npm.cmd run android:open`. Antes de usar Run en Android Studio, comprobar la ruta completa del proyecto abierto; el titulo de la ventana no basta.
- No reutilizar un APK existente como si acabara de compilarse. Usar el APK y su registro JSON de procedencia generados por android:release.
- No afirmar que una version quedo instalada hasta comprobar en el dispositivo el versionName y versionCode del paquete `com.mientrenadorsaludable.app`.
