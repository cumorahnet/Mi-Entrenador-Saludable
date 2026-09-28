# Panel de superusuario

El doble clic en el número de versión abre el acceso/panel de superusuario. La pantalla lista cuentas de Firebase Auth por páginas y muestra nombre completo, correo, plan y estado de comerciales. El nombre procede de `Firebase Auth displayName`; el plan procede de `artifacts/mientrenador-v3/users/{uid}/account/profile`:

```json
{
  "plan": "free",
  "hasAds": true
}
```

Los valores permitidos de `plan` son `free` y `plus`. `hasAds` es booleano. Si todavía no existe el documento, el panel muestra Free con comerciales. El formulario de alta solicita nombre completo y lo guarda en `displayName`; una cuenta existente sin nombre debe completarlo al volver a entrar. La lista usa ese dato y muestra “Nombre no registrado” si Auth y el perfil tampoco lo contienen.

La lista y la eliminación se implementan como funciones callable en `functions/`. Requieren la custom claim `platformAdmin: true`; nunca se concede desde el cliente. La función de eliminación bloquea el borrado de la propia cuenta y elimina Authentication y la subcolección de datos del usuario. Las reglas de Firestore impiden a una cuenta editar su propio plan.

## Preparación del proyecto Firebase

### Eliminación segura (2.40)

Antes de borrar datos se crea `accountDeletionLocks/{uid}`, fuera del árbol del usuario. Las reglas deniegan acceso a las cuentas marcadas y ningún cliente puede modificar esos marcadores. Las funciones administrativas también rechazan operadores bloqueados. El marcador permanece tras el borrado para bloquear tokens antiguos; no debe eliminarse al reintentar. Si falla una etapa, el panel permite reintentar la misma operación. Se deben desplegar las reglas antes de las funciones.

El inicio de sesión verifica `legal/terms-v1` en el servidor. Si falta el perfil o la aceptación, muestra el formulario para completar el registro antes de abrir la aplicación; un fallo de lectura o escritura no da por terminada la verificación.

El cliente, `.firebaserc` y los registros recientes de Hosting apuntan a `mi-entrenador-saludable`. Despliega estas funciones y reglas en ese mismo proyecto, que es el que usa el cliente para Authentication y Firestore.

Para dar el rol a una cuenta existente, usa su UID exacto y las credenciales ADC de un operador autorizado. Primero ejecuta la comprobación de solo lectura:

```powershell
$env:FIREBASE_PROJECT_ID = 'mi-entrenador-saludable'
node functions/grant-platform-admin.cjs UID_DE_LA_CUENTA --check
```

Tras confirmar UID, correo y proyecto, el comando sin `--check` asigna la custom claim:

```powershell
node functions/grant-platform-admin.cjs UID_DE_LA_CUENTA
```

El superusuario debe cerrar sesión y volver a entrar para recibir un token actualizado. No crees una cuenta ni asignes el rol hasta que el responsable confirme la cuenta y el proyecto correctos.
