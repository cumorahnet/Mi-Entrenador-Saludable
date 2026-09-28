'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 5 });

const APP_ID = 'mientrenador-v3';
const PAGE_SIZE = 50;

async function requirePlatformAdmin(request) {
    if (!request.auth || request.auth.token.platformAdmin !== true) {
        throw new HttpsError('permission-denied', 'Se requiere el rol de superusuario de plataforma.');
    }
    if ((await getFirestore().doc(`accountDeletionLocks/${request.auth.uid}`).get()).exists) {
        throw new HttpsError('permission-denied', 'La cuenta está en proceso de eliminación.');
    }
}

exports.listPlatformAccounts = onCall(async request => {
    await requirePlatformAdmin(request);

    const pageToken = typeof request.data?.pageToken === 'string' ? request.data.pageToken : undefined;
    const page = await getAuth().listUsers(PAGE_SIZE, pageToken);
    const db = getFirestore();
    const accounts = await Promise.all(page.users.map(async user => {
        const profileRef = db.doc(`artifacts/${APP_ID}/users/${user.uid}/account/profile`);
        const profileSnapshot = await profileRef.get();
        const profile = profileSnapshot.exists ? profileSnapshot.data() : {};
        const plan = profile.plan === 'plus' ? 'plus' : 'free';
        const hasAds = typeof profile.hasAds === 'boolean' ? profile.hasAds : plan === 'free';

        return {
            uid: user.uid,
            email: user.email || '',
            fullName: user.displayName || profile.fullName || '',
            plan,
            hasAds,
            disabled: user.disabled,
            createdAt: user.metadata.creationTime || ''
        };
    }));

    return { accounts, nextPageToken: page.pageToken || null };
});

exports.deletePlatformAccount = onCall({ timeoutSeconds: 540, memory: '1GiB' }, async request => {
    await requirePlatformAdmin(request);

    const uid = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
    if (!uid || uid.includes('/') || uid.length > 128) throw new HttpsError('invalid-argument', 'Identificador de cuenta inválido.');
    if (uid === request.auth.uid) throw new HttpsError('failed-precondition', 'No puedes eliminar tu propia cuenta de superusuario.');

    const accountRef = getFirestore().doc(`artifacts/${APP_ID}/users/${uid}`);
    // Fuera del árbol borrado: bloquea también tokens ya emitidos y reintentos.
    // Conservar el marcador después del borrado para impedir recrear datos.
    await getFirestore().doc(`accountDeletionLocks/${uid}`).set({ blocked: true });
    try {
        await getFirestore().recursiveDelete(accountRef);
    } catch (error) {
        console.error('No se pudieron eliminar los datos de la cuenta. Código:', error.code || 'unknown');
        throw new HttpsError('internal', 'No se pudieron eliminar todos los datos. El acceso quedó bloqueado; reintenta desde el panel.');
    }

    try {
        await getAuth().deleteUser(uid);
    } catch (error) {
        if (error.code !== 'auth/user-not-found') {
            console.error('No se pudo eliminar la cuenta de autenticación. Código:', error.code || 'unknown');
            throw new HttpsError('internal', 'Los datos fueron eliminados, pero no se pudo borrar el acceso. Reintenta desde el panel.');
        }
    }

    return { deleted: true, uid };
});
