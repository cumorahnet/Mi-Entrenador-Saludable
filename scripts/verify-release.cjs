const fs = require('node:fs');
const crypto = require('node:crypto');

async function main() {
    const base = 'https://mi-entrenador-saludable.web.app';
    for (const file of ['index.html', 'assets/app.js', 'terminos.html', 'privacidad.html']) {
        const response = await fetch(`${base}/${file}`, {cache:'no-store'});
        if (!response.ok) throw Error(`${file}: HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (!bytes.equals(fs.readFileSync(`www/${file}`))) throw Error(`${file}: contenido publicado distinto`);
        console.log(`${file}: publicado y verificado`);
    }
    const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
    const name = `${version.mayor}.${version.menor}`;
    const metadata = JSON.parse(fs.readFileSync(`outputs/MI-ENTRENADOR-SALUDABLE-ULTIMA-${name}.apk.json`, 'utf8'));
    const apk = await fetch(`${base}/downloads/mi-entrenador-saludable-${name}.apk`, {cache:'no-store'});
    if (!apk.ok) throw Error(`APK: HTTP ${apk.status}`);
    const hash = crypto.createHash('sha256').update(Buffer.from(await apk.arrayBuffer())).digest('hex');
    if (hash !== metadata.sha256) throw Error('El APK descargado no coincide con el registro de compilación');
    console.log(`APK ${name} (${metadata.versionCode}): SHA-256 verificado`);
    for (const name of ['listPlatformAccounts', 'deletePlatformAccount']) {
        // Sin credenciales ni cuenta objetivo: solo verifica la denegación de acceso.
        const response = await fetch(`https://us-central1-mi-entrenador-saludable.cloudfunctions.net/${name}`, {
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({data:{}})
        });
        const result = await response.json();
        if (response.status !== 403 || result.error?.status !== 'PERMISSION_DENIED') throw Error(`${name}: rechazo inesperado`);
        console.log(`${name}: rechaza solicitudes sin autorización`);
    }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
