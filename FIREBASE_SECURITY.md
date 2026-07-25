# Seguridad de Firebase

La clave `apiKey` incluida en la aplicación identifica el proyecto de Firebase,
pero no autoriza por sí misma el acceso a sus datos. En una aplicación web o
híbrida, la configuración de Firebase termina dentro del JavaScript y del APK,
por lo que no puede tratarse como un secreto.

La protección de este proyecto se apoya en:

1. **Firebase Authentication** para identificar al usuario.
2. **Reglas de Firestore** para aislar rutinas e historial por `uid`.
3. **Restricciones de API** sobre la clave en Google Cloud.
4. **Firebase App Check** para reducir solicitudes desde clientes no legítimos.

## Desplegar las reglas

Revisar primero `firestore.rules` y después ejecutar, con Firebase CLI
autenticado en el proyecto correcto:

```bash
firebase use entrenadorpersonal-4e69d
firebase deploy --only firestore:rules
```

El despliegue debe probarse con una cuenta real antes de considerarlo terminado.
Las reglas permiten exclusivamente esta jerarquía:

```text
artifacts/mientrenador-v3/users/{uid}/...
```

El `uid` autenticado debe coincidir con el `uid` presente en la ruta.

## Restringir la clave

En Google Cloud Console:

1. Abrir **APIs y servicios → Credenciales**.
2. Seleccionar la clave usada por la aplicación.
3. En **Restricciones de API**, permitir únicamente las APIs de Firebase
   necesarias para Authentication y Cloud Firestore.
4. No reutilizar esta clave para Gemini, Maps, Places ni otros servicios.

No se debe aplicar una restricción HTTP basada únicamente en `localhost`: la
aplicación Android usa Capacitor con el origen `https://localhost` y una
restricción equivocada puede bloquear el inicio de sesión dentro del APK.

## Activar App Check

App Check requiere registrar el cliente en Firebase Console y obtener la clave
del proveedor de atestación. Debe integrarse primero en modo de monitoreo,
verificar las métricas y solo después activar la aplicación obligatoria para
Authentication y Cloud Firestore.

No debe activarse la aplicación obligatoria antes de distribuir una versión del
cliente que envíe tokens de App Check, porque eso bloquearía a los usuarios
actuales.
