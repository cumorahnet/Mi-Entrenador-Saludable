import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import logic from '../www/assets/app-logic.js';

it('acumula una caminata con incrementos menores que el filtro GPS', () => {
    let anchor = null;
    let distance = 0;
    for (let second = 1; second <= 60; second++) {
        const point = { latitude:second / 111111, longitude:0, accuracy:10, timestamp:second * 1000 };
        const sample = logic.evaluateGpsPosition(anchor, point, point.timestamp);
        anchor = sample.anchor;
        distance += sample.distance;
    }
    expect(distance).toBeGreaterThan(54);
    expect(distance).toBeLessThan(61);
});

it('rechaza saltos, lecturas antiguas e imprecisas; no une huecos largos', () => {
    const anchor = { latitude:0, longitude:0, accuracy:10, timestamp:1000 };
    for (const point of [
        { ...anchor, latitude:1, timestamp:2000 },
        { ...anchor, accuracy:100, timestamp:2000 },
        { ...anchor, timestamp:500 }
    ]) expect(logic.evaluateGpsPosition(anchor, point, 2000).valid).toBe(false);
    expect(logic.evaluateGpsPosition(null, anchor, 30000).valid).toBe(false);
    expect(logic.evaluateGpsPosition(anchor, { ...anchor, latitude:1, timestamp:60000 }, 60000).distance).toBe(0);
    expect(logic.evaluateGpsPosition(anchor, { ...anchor, timestamp:2000 }, 2000).distance).toBe(0);
});

it('distingue avance, falta de avance registrado y falta de señal', () => {
    const state = { now:60000, lastFixTime:59000, distance:80, previousDistance:0, time:60, previousTime:0 };
    expect(logic.getGpsFeedback(state).key).toBe('progress');
    expect(logic.getGpsFeedback({ ...state, distance:0 }).key).toBe('no-progress');
    expect(logic.getGpsFeedback({ ...state, lastFixTime:1000 }).key).toBe('signal');
});

it.each(['running', 'paused', 'gps-running'])('finaliza la etapa en %s y conserva las siguientes', status => {
    const gps = status === 'gps-running';
    const section = gps ? 'walk' : 'training';
    const steps = [
        { sessionSection:section, phase:gps ? 'gps-tracking' : 'entrenamiento', seconds:30 },
        { sessionSection:section, phase:'cambio-ent', seconds:5 },
        { sessionSection:section, phase:'entrenamiento', seconds:30 },
        { sessionSection:'stretch', phase:'estiramientos', seconds:30 }
    ];
    const advanceToStep = vi.fn(() => true);
    const stopGpsTracking = vi.fn();
    const context = {
        ...logic, useCallback:fn => fn, statusRef:{ current:status }, gpsStartingRef:{ current:false },
        gpsStoppingRef:{ current:false }, isGpsActiveRef:{ current:gps }, idxRef:{ current:0 },
        stepsRef:{ current:steps }, timeLeftRef:{ current:20 }, nextActivitySpeech:{ current:{} },
        selectedPhases:[section, 'stretch'], setSteps:vi.fn(), speak:vi.fn(), advanceToStep,
        stopGpsTrackingRef:{ current:stopGpsTracking }, endWorkout:vi.fn(), handleSpeech:vi.fn(),
        persistSession:vi.fn(), setTimeout:fn => fn()
    };
    const source = readFileSync('www/assets/app.js', 'utf8');
    const start = source.indexOf('    const finishPhase = useCallback(');
    const end = source.indexOf('    const startGpsTracking =', start);
    const finish = runInNewContext(`${source.slice(start, end)}; finishPhase`, context);
    finish();
    if (gps) expect(stopGpsTracking).toHaveBeenCalledWith(true, 3);
    else expect(advanceToStep).toHaveBeenCalledWith(3);
    expect(context.endWorkout).not.toHaveBeenCalled();
    const breakdown = logic.calculateSessionBreakdown({ steps:context.stepsRef.current,
        currentStepIndex:3, currentStepRemaining:30, selectedPhases:context.selectedPhases });
    expect(breakdown[section]).toBe(10);
});

it('resuelve límites de fases antiguas y separa caminata de carrera', () => {
    const steps = [{ phase:'calentamiento' }, { phase:'post-warmup' },
        { phase:'gps-tracking', activityType:'walk' }, { phase:'post-gps-rest', activityType:'walk' },
        { phase:'gps-tracking', activityType:'run' }, { phase:'finished' }];
    expect(logic.getNextSessionSectionIndex(steps, 0, [])).toBe(2);
    expect(logic.getNextSessionSectionIndex(steps, 2, [])).toBe(4);
    expect(logic.getNextSessionSectionIndex(steps, 4, [])).toBe(5);
});
