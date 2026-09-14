import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';
import appLogic from '../www/assets/app-logic.js';

it('deja un solo descanso de 30 segundos entre entrenamiento y estiramientos', () => {
    const source = readFileSync('www/assets/app.js', 'utf8');
    const start = source.indexOf('const generateWarmupSegment =');
    const end = source.indexOf('\n//', source.indexOf('const generateWorkoutSteps =', start));
    const generate = runInNewContext(`${source.slice(start, end)}; generateWorkoutSteps;`, {
        ...appLogic, WARMUP_STEPS:[{ label:'Calentamiento' }], TRAINING_ZONES:['Piernas'],
        EXERCISE_CATALOG:[], GPS_PHASE_KEY:'gps-tracking', POST_GPS_REST_PHASE_KEY:'post-gps-rest'
    });
    const params = { entrenamiento:{ cycles:1, rounds:1, action:30, stretchSteps:2, stretchAction:30, stretchChange:10 } };
    const steps = generate({}, params, ['training', 'stretch']);
    const trainingEnd = steps.findLastIndex(step => step.phase === 'entrenamiento');
    const stretchStart = steps.findIndex(step => step.phase === 'estiramientos');
    expect(steps.slice(trainingEnd + 1, stretchStart).map(step => [step.phase, step.seconds]))
        .toEqual([['post-training', 30]]);
    expect(steps.some(step => step.phase === 'pre-stretches')).toBe(false);
    expect(steps.filter(step => step.phase === 'estiramientos')).toHaveLength(2);
    expect(steps.filter(step => step.phase === 'cambio-est')).toHaveLength(1);
    expect(appLogic.getRestNextActivity(steps, trainingEnd + 1))
        .toEqual({ stepIndex:stretchStart, text:'ESTIRAMIENTO 1' });

    // La preparación se conserva cuando no viene directamente del entrenamiento.
    for (const phases of [['stretch'], ['training', 'walk', 'stretch']]) {
        expect(generate({}, params, phases).filter(step => step.phase === 'pre-stretches'))
            .toHaveLength(1);
    }
});

it('anuncia una vez antes del pitazo, sin conteo ni repetición al iniciar', () => {
    const source = readFileSync('www/assets/app.js', 'utf8');
    const start = source.indexOf('const handleSpeech = useCallback(');
    const end = source.indexOf('\n    const endWorkout', start);
    const rest = { phase:'cambio-ent', seconds:5, voiceCountdown:true };
    const exercise = { phase:'entrenamiento', label:'Sentadillas', voiceInitial:'Sentadillas', seconds:30, whistleOnStart:true, voiceCountdown:true, countdownChangeCue:true };
    const speak = vi.fn();
    const whistle = vi.fn();
    const context = {
        ...appLogic, useCallback:fn => fn, statusRef:{ current:'running' },
        stepsRef:{ current:[rest, exercise] }, spokenInit:{ current:{} },
        lastSpokenKey:{ current:'' }, nextActivitySpeech:{ current:null },
        GPS_PHASE_KEY:'gps-tracking', navigator:{}, speak, whistle
    };
    const handleSpeech = runInNewContext(`${source.slice(start, end)}; handleSpeech;`, context);
    for (const remaining of [5, 5, 4, 3, 2, 1, 0]) handleSpeech(rest, 0, remaining);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toBe('Sentadillas');
    expect(whistle).not.toHaveBeenCalled();
    expect(context.nextActivitySpeech.current.pending).toBe(true);
    speak.mock.calls[0][2]();
    expect(context.nextActivitySpeech.current.pending).toBe(false);
    context.spokenInit.current = {};
    handleSpeech(exercise, 1, 30);
    handleSpeech(exercise, 1, 30);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(whistle).toHaveBeenCalledTimes(1);
    handleSpeech(exercise, 1, 3);
    expect(speak.mock.calls[1][0]).toBe('Tres. Dos. Uno. Cambio.');
});

it.each(['post-training', 'post-warmup', 'post-gps-rest'])(
    'no repite las instrucciones entre %s y los estiramientos', phase => {
        const source = readFileSync('www/assets/app.js', 'utf8');
        const start = source.indexOf('const handleSpeech = useCallback(');
        const end = source.indexOf('\n    const endWorkout', start);
        const rest = { phase, seconds:30, voiceInitial:'Descanso. A continuación, movilidad y estiramiento.', voiceCountdown:true };
        const preparation = { phase:'pre-stretches', seconds:30, voiceInitial:'Descanso. Prepárate para los estiramientos', voiceCountdown:true };
        const stretch = { phase:'estiramientos', label:'ESTIRAMIENTO 1', voiceInitial:'Estiramiento 1', seconds:30, whistleOnStart:true, voiceCountdown:true, countdownChangeCue:true };
        const speak = vi.fn();
        const whistle = vi.fn();
        const context = {
            ...appLogic, useCallback:fn => fn, statusRef:{ current:'running' },
            stepsRef:{ current:[rest, preparation, stretch] }, spokenInit:{ current:{} },
            lastSpokenKey:{ current:'' }, nextActivitySpeech:{ current:null },
            GPS_PHASE_KEY:'gps-tracking', navigator:{}, speak, whistle
        };
        const handleSpeech = runInNewContext(`${source.slice(start, end)}; handleSpeech;`, context);
        for (const [index, step] of [rest, preparation, stretch].entries()) {
            context.spokenInit.current = {};
            context.lastSpokenKey.current = '';
            const ticks = index === 2 ? [30] : Array.from({ length:31 }, (_, i) => 30 - i);
            for (const remaining of ticks) {
                handleSpeech(step, index, remaining);
                handleSpeech(step, index, remaining);
            }
            if (index === 0) expect(speak.mock.calls.map(call => call[0])).toEqual([rest.voiceInitial]);
            if (index === 1) speak.mock.calls.at(-1)[2]();
        }
        expect(speak.mock.calls.map(call => call[0])).toEqual([rest.voiceInitial, stretch.label]);
        expect(whistle).toHaveBeenCalledTimes(1);

        // Si la preparación es el primer paso (por ejemplo, al recuperar una sesión), sí se anuncia.
        context.stepsRef.current = [preparation, stretch];
        context.spokenInit.current = {};
        context.nextActivitySpeech.current = null;
        speak.mockClear();
        handleSpeech(preparation, 0, 30);
        expect(speak).toHaveBeenCalledWith(preparation.voiceInitial, false);
    }
);
