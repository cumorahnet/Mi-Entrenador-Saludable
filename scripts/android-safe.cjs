const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const canonical = 'C:\\Cumorahnet\\Projects\\Proyectos\\Mi-Entrenador-Saludable';
const root = path.resolve(__dirname, '..');
function verify() {
  if (process.platform === 'win32' && fs.realpathSync(root).toLowerCase() !== canonical.toLowerCase()) {
    throw new Error(`Copia no autorizada para Android. Usa ${canonical}`);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
  const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');
  const name = gradle.match(/versionName\s+"([^"]+)"/)?.[1];
  const code = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
  if (name !== `${version.mayor}.${version.menor}` || pkg.version !== `${name}.0` || !code) {
    throw new Error('Las versiones de package.json, version.json y Android no coinciden.');
  }
  console.log(`Proyecto Android: ${path.join(root, 'android')}\nVersion: ${name} (${code})`);
  return { name, code };
}
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} fallo (${result.status}). No se publica ningun APK.`);
}
function main() {
  const action = process.argv[2] || 'verify';
  if (!['verify', 'sync', 'copy', 'open', 'release'].includes(action)) throw new Error('Accion Android desconocida.');
  const version = verify();
  if (action === 'verify') return;
  const cap = path.join(root, 'node_modules/@capacitor/cli/bin/capacitor');
  if (action !== 'release') return run(process.execPath, [cap, action, 'android']);
  const started = Date.now();
  run(process.execPath, [cap, 'sync', 'android']);
  if (!process.env.JAVA_HOME && process.platform === 'win32') {
    const jbr = 'C:\\Program Files\\Android\\Android Studio\\jbr';
    if (fs.existsSync(path.join(jbr, 'bin/java.exe'))) process.env.JAVA_HOME = jbr;
  }
  if (process.platform === 'win32') {
    run('cmd.exe', ['/d', '/c', 'gradlew.bat --no-daemon --rerun-tasks assembleDebug'], path.join(root, 'android'));
  } else {
    run('./gradlew', ['--no-daemon', '--rerun-tasks', 'assembleDebug'], path.join(root, 'android'));
  }
  const output = path.join(root, 'android/app/build/outputs/apk/debug');
  const metadata = JSON.parse(fs.readFileSync(path.join(output, 'output-metadata.json'), 'utf8'));
  const element = metadata.elements[0];
  if (element.versionName !== version.name || element.versionCode !== version.code) throw new Error('El APK generado tiene una version incorrecta.');
  const apk = path.join(output, element.outputFile);
  if (fs.statSync(apk).mtimeMs < started) throw new Error('El APK no se genero en esta ejecucion.');
  const bytes = fs.readFileSync(apk);
  const destination = path.join(root, 'outputs', `MI-ENTRENADOR-SALUDABLE-ULTIMA-${version.name}.apk`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  fs.writeFileSync(`${destination}.json`, JSON.stringify({ project: root, version: version.name, versionCode: version.code, builtAt: new Date().toISOString(), sha256: crypto.createHash('sha256').update(bytes).digest('hex') }, null, 2) + '\n');
  console.log(`APK nuevo verificado: ${destination}`);
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
