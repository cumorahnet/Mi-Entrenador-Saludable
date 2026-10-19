import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('www/assets/app.js', 'utf8').replace(/\r\n/g, '\n');
const start = source.indexOf('    const releaseWake = useCallback(');
const end = source.indexOf('\n    useEffect(() => {\n        const handleVisibility', start);

it('conserva el bloqueo al pasar de GPS a entrenamiento y lo libera al finalizar', async () => {
    const lock = { released:false, release:vi.fn().mockResolvedValue(), addEventListener:vi.fn() };
    const request = vi.fn().mockResolvedValue(lock);
    const context = { useCallback:fn=>fn, wakeLockRef:{ current:null }, statusRef:{ current:'gps-running' },
        navigator:{ wakeLock:{ request } }, uiStatus:'gps-running', useEffect:vi.fn() };
    const run = () => runInNewContext('(() => {' + source.slice(start,end) + '; return { releaseWake, requestWake }; })()', context);
    let handlers = run();
    await handlers.requestWake();
    const firstDeps = context.useEffect.mock.calls.at(-1)[1];
    context.uiStatus = 'running'; context.statusRef.current = 'running';
    handlers = run();
    const nextDeps = context.useEffect.mock.calls.at(-1)[1];
    expect(firstDeps[0]).toBe(true);
    expect(nextDeps[0]).toBe(true);
    await handlers.requestWake();
    expect(request).toHaveBeenCalledOnce();
    expect(lock.release).not.toHaveBeenCalled();
    handlers.releaseWake();
    expect(context.wakeLockRef.current).toBeNull();
    expect(lock.release).toHaveBeenCalledOnce();
});

it('descarta un bloqueo solicitado si la actividad termina antes de recibirlo', async () => {
    let resolve;
    const lock = { release:vi.fn().mockResolvedValue(), addEventListener:vi.fn() };
    const context = { useCallback:fn=>fn, wakeLockRef:{ current:null }, statusRef:{ current:'running' },
        navigator:{ wakeLock:{ request:()=>new Promise(r=>{ resolve=r; }) } }, uiStatus:'running', useEffect:vi.fn() };
    const handlers = runInNewContext(source.slice(start,end) + '; ({ requestWake })', context);
    const pending = handlers.requestWake();
    context.statusRef.current = 'finished'; resolve(lock); await pending;
    expect(lock.release).toHaveBeenCalledOnce();
    expect(context.wakeLockRef.current).toBeNull();
});
