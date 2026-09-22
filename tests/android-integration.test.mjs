import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectPath = (...parts) => resolve(process.cwd(), ...parts);
const readText = (...parts) => readFileSync(projectPath(...parts), 'utf8');

const readPngDimensions = (...parts) => {
    const png = readFileSync(projectPath(...parts));
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    return { width:png.readUInt32BE(16), height:png.readUInt32BE(20) };
};

describe('integración Android', () => {
    it('registra la voz nativa antes de crear la actividad', () => {
        const activity = readText(
            'android', 'app', 'src', 'main', 'java', 'com',
            'mientrenadorsaludable', 'app', 'MainActivity.java'
        );
        const registration = activity.indexOf('registerPlugin(NativeSpeechPlugin.class)');
        const onCreate = activity.indexOf('super.onCreate(savedInstanceState)');

        expect(registration).toBeGreaterThan(-1);
        expect(onCreate).toBeGreaterThan(registration);
    });

    it('declara el motor TTS y el servicio de guía de voz', () => {
        const manifest = readText('android', 'app', 'src', 'main', 'AndroidManifest.xml');

        expect(manifest).toContain('android.intent.action.TTS_SERVICE');
        expect(manifest).toContain('android:name=".SpeechForegroundService"');
        expect(manifest).toContain('android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK');
    });

    it('incluye iconos normal y redondo en todas las densidades', () => {
        const densities = [
            ['mipmap-mdpi', 48],
            ['mipmap-hdpi', 72],
            ['mipmap-xhdpi', 96],
            ['mipmap-xxhdpi', 144],
            ['mipmap-xxxhdpi', 192]
        ];

        for (const [density, size] of densities) {
            for (const icon of ['ic_launcher.png', 'ic_launcher_round.png']) {
                expect(readPngDimensions('android', 'app', 'src', 'main', 'res', density, icon))
                    .toEqual({ width:size, height:size });
            }
        }
    });

    it('mantiene coherente la versión 2.38 en web, npm y Android', () => {
        const packageJson = JSON.parse(readText('package.json'));
        const androidBuild = readText('android', 'app', 'build.gradle');
        const app = readText('www', 'assets', 'app.js');
        const web = readText('www', 'index.html');

        expect(packageJson.version).toBe('2.38.0');
        expect(androidBuild).toContain('versionCode 238');
        expect(androidBuild).toContain('versionName "2.38"');
        expect(app).toContain('const APP_VERSION = "2.38"');
        expect(web).toContain('Versión 2.38');
    });
});
