import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('www/assets/app.js', 'utf8');
const generate = runInNewContext(source.slice(source.indexOf('const generateWorkoutSteps ='), source.indexOf('// ─── Componente para placeholder')) + '; generateWorkoutSteps', { GPS_PHASE_KEY:'gps-tracking' });

it('genera una actividad cronometrada con su nombre y sin ejercicios ajenos', () => {
    const steps = generate({ name:'Nadar', customActivity:{ mode:'time', seconds:120, cycles:3, rest:20 } }, {}, ['training']);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ label:'Nadar', seconds:120, sessionSection:'training' });
});

it('alterna ciclos y descansos sin agregar descanso al final', () => {
    const steps = generate({ name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:3, rest:20 } }, {}, ['training']);
    expect(steps.map(s=>s.seconds)).toEqual([45,20,45,20,45]);
    expect(steps.at(-1).label).toBe('Pesas · Ciclo 3/3');
});

it('permite ciclos sin descanso y activa el seguimiento GPS existente', () => {
    expect(generate({ name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:2, rest:0 } }, {}, ['training'])).toHaveLength(2);
    expect(generate({ name:'Montañismo', customActivity:{ mode:'gps' } }, {}, ['training'])[0]).toMatchObject({ label:'Montañismo', phase:'gps-tracking', seconds:4 });
});

function resultHandlers(onComplete) {
    const context = { useCallback:f=>f, savingRef:{ current:false }, savedRef:{ current:false }, workout:{ name:'Nadar' },
        setSavingResult:vi.fn(), setSaveError:vi.fn(), hasGpsDataRef:{ current:false }, finalGpsSummary:null,
        gpsCoordinates:[], elapsedRef:{ current:90 }, resultIdRef:{ current:'stable-session-id' }, onComplete, onExit:vi.fn() };
    const start = source.indexOf('    const handleFinishActivity = useCallback(');
    const end = source.indexOf('\n    if (!workout) return React.createElement', start);
    const handlers = runInNewContext(source.slice(start,end)+'; ({ save:handleFinishActivity, discard:handleDiscardActivity })', context);
    return { ...handlers, context };
}

it('no sale hasta confirmar el guardado y bloquea doble clic y descarte durante el envío', async () => {
    let resolve;
    const pending = new Promise(r=>{resolve=r;});
    const callback = vi.fn(()=>pending);
    const {save, discard, context} = resultHandlers(callback);
    const first = save();
    await save(); discard();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(context.onExit).not.toHaveBeenCalled();
    resolve(); await first;
    expect(context.onExit).toHaveBeenCalledTimes(1);
    expect(context.savedRef.current).toBe(true);
});

it('conserva el resumen cuando falla Firebase y reintenta con el mismo identificador', async () => {
    const callback = vi.fn().mockRejectedValueOnce(Error('offline')).mockResolvedValueOnce();
    const {save, context} = resultHandlers(callback);
    await save();
    expect(context.onExit).not.toHaveBeenCalled();
    expect(context.savedRef.current).toBe(false);
    expect(context.setSaveError).toHaveBeenLastCalledWith(expect.stringContaining('No se pudo guardar'));
    await save();
    expect(callback.mock.calls.map(call=>call[3])).toEqual(['stable-session-id','stable-session-id']);
    expect(context.onExit).toHaveBeenCalledTimes(1);
});

it('descarta sin escribir en el historial', () => {
    const callback=vi.fn();
    const {discard, context}=resultHandlers(callback);
    discard();
    expect(callback).not.toHaveBeenCalled();
    expect(context.savedRef.current).toBe(true);
    expect(context.onExit).toHaveBeenCalledTimes(1);
});
