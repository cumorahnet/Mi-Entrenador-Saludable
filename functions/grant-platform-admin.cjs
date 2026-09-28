'use strict';

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const expectedProjectId = 'mi-entrenador-saludable';
const projectId = process.env.FIREBASE_PROJECT_ID;
const uid = process.argv[2];
const checkOnly = process.argv.includes('--check');

if (projectId !== expectedProjectId) {
    console.error(`FIREBASE_PROJECT_ID debe ser exactamente ${expectedProjectId}. No se realizó ningún cambio.`);
    process.exit(2);
}

if (!uid) {
    console.error('Uso: node grant-platform-admin.cjs <UID> [--check]');
    process.exit(2);
}

async function main() {
    initializeApp({ credential: applicationDefault(), projectId });
    const auth = getAuth();
    const user = await auth.getUser(uid);
    const currentlyAdmin = user.customClaims?.platformAdmin === true;

    if (checkOnly) {
        console.log(JSON.stringify({ projectId, uid: user.uid, email: user.email || null, platformAdmin: currentlyAdmin }, null, 2));
        return;
    }

    if (currentlyAdmin) {
        console.log(`La cuenta ${uid} ya tiene el rol platformAdmin. No se cambió nada.`);
        return;
    }

    await auth.setCustomUserClaims(uid, { ...user.customClaims, platformAdmin: true });
    console.log(`Se asignó platformAdmin a ${uid} en ${projectId}. Cierra sesión y vuelve a entrar para renovar el token.`);
}

main().catch(error => {
    console.error(`No se pudo verificar/asignar el rol. Código: ${error.code || 'unknown'}`);
    process.exitCode = 1;
});
