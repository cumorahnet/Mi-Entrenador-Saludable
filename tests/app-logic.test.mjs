import { describe, expect, it } from 'vitest';
import appLogic from '../www/assets/app-logic.js';
import exerciseCatalog from '../www/assets/exercise-catalog.js';

const {
    formatTime,
    formatPace,
    formatDistance,
    formatSpeed,
    getDistance,
    togglePhaseSelection,
    getPhaseSelectionChange,
    createDefaultWorkouts,
    calculateWorkoutDurationSeconds,
    formatDurationEstimate,
    getCountdownAnnouncement,
    getRestNextActivity,
    getGpsStartAnnouncement,
    getWorkoutExerciseDifficulty,
    createRandomExerciseSequence,
    repeatExerciseSequenceForCycles,
    calculateSessionBreakdown
} = appLogic;

describe('formatTime', () => {
    it('formatea segundos como minutos y segundos', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(65)).toBe('1:05');
        expect(formatTime(3605)).toBe('60:05');
    });

    it('protege la interfaz frente a valores inválidos', () => {
        expect(formatTime(-1)).toBe('0:00');
        expect(formatTime(Number.NaN)).toBe('0:00');
    });
});

describe('calculateSessionBreakdown', () => {
    const steps = [
        { phase:'inicio', sessionSection:'preparation', seconds:15 },
        { phase:'calentamiento', sessionSection:'preparation', seconds:30 },
        { phase:'entrenamiento', sessionSection:'training', seconds:30 },
        { phase:'gps-tracking', sessionSection:'run', activityType:'run', seconds:4 },
        { phase:'post-gps-rest', sessionSection:'run', activityType:'run', seconds:10 },
        { phase:'pre-stretches', sessionSection:'stretch', seconds:30 }
    ];

    it('desglosa el tiempo realizado y no las fases pendientes', () => {
        expect(calculateSessionBreakdown({
            steps,
            currentStepIndex:4,
            currentStepRemaining:6,
            gpsActivityTimes:{ run:125 },
            selectedPhases:['training', 'run', 'stretch']
        })).toEqual({
            preparation:45,
            training:30,
            walk:0,
            run:133,
            stretch:0
        });
    });

    it('tolera sesiones antiguas sin sessionSection', () => {
        expect(calculateSessionBreakdown({
            steps:[
                { phase:'calentamiento', seconds:30 },
                { phase:'gps-tracking', seconds:4 }
            ],
            currentStepIndex:1,
            currentStepRemaining:0,
            gpsActivityTimes:{ walk:60 },
            selectedPhases:['walk']
        })).toEqual({
            preparation:30,
            training:0,
            walk:64,
            run:0,
            stretch:0
        });
    });
    it('clasifica fases antiguas y descarta datos inválidos', () => {
        expect(calculateSessionBreakdown({
            steps:[
                { phase:'entrenamiento', seconds:10 },
                { phase:'estiramientos', seconds:10 },
                { phase:'gps-tracking', activityType:'run', seconds:4 },
                { phase:'gps-tracking', seconds:4 },
                { phase:'desconocida', sessionSection:'otra', seconds:10 },
                { phase:'entrenamiento', seconds:Number.NaN },
                { phase:'desconocida', seconds:Number.NaN }
            ],
            currentStepIndex:99,
            currentStepRemaining:0,
            gpsActivityTimes:{ walk:Number.NaN, run:-1 },
            selectedPhases:['training', 'stretch', 'run']
        })).toEqual({ preparation:0, training:10, walk:0, run:8, stretch:10 });
    });

    it('usa valores seguros cuando recibe argumentos incompletos', () => {
        expect(calculateSessionBreakdown()).toEqual({
            preparation:0,
            training:0,
            walk:0,
            run:0,
            stretch:0
        });
        expect(calculateSessionBreakdown({
            steps:[{ phase:'gps-tracking', seconds:-5 }],
            currentStepIndex:-4,
            currentStepRemaining:99,
            selectedPhases:null
        })).toEqual({ preparation:0, training:0, walk:0, run:0, stretch:0 });
    });
});

describe('formatPace', () => {
    it('calcula el ritmo por kilómetro', () => {
        expect(formatPace(1000, 300)).toBe('5:00');
        expect(formatPace(5000, 1501)).toBe('5:00');
    });

    it('normaliza correctamente el redondeo a 60 segundos', () => {
        expect(formatPace(1000, 359.6)).toBe('6:00');
    });

    it('devuelve cero cuando faltan distancia o tiempo válidos', () => {
        expect(formatPace(0, 300)).toBe('0:00');
        expect(formatPace(1000, -1)).toBe('0:00');
        expect(formatPace(Number.NaN, 300)).toBe('0:00');
    });
});

describe('formatDistance', () => {
    it('usa metros antes de un kilómetro y kilómetros después', () => {
        expect(formatDistance(999.4)).toBe('999 m');
        expect(formatDistance(1000)).toBe('1.00 km');
        expect(formatDistance(1234)).toBe('1.23 km');
    });

    it('evita mostrar distancias negativas o inválidas', () => {
        expect(formatDistance(-20)).toBe('0 m');
        expect(formatDistance(Number.POSITIVE_INFINITY)).toBe('0 m');
    });
});

describe('formatSpeed', () => {
    it('calcula kilómetros por hora', () => {
        expect(formatSpeed(1000, 300)).toBe('12.0 km/h');
        expect(formatSpeed(5000, 1800)).toBe('10.0 km/h');
    });

    it('devuelve cero cuando no puede calcularse', () => {
        expect(formatSpeed(0, 300)).toBe('0.0 km/h');
        expect(formatSpeed(1000, 0)).toBe('0.0 km/h');
        expect(formatSpeed(1000, Number.NaN)).toBe('0.0 km/h');
    });
});

describe('getDistance', () => {
    it('devuelve cero para dos coordenadas iguales', () => {
        expect(getDistance(19.4326, -99.1332, 19.4326, -99.1332)).toBe(0);
    });

    it('calcula una distancia conocida mediante Haversine', () => {
        expect(getDistance(0, 0, 0, 1)).toBeCloseTo(111194.93, 1);
    });

    it('devuelve cero si una coordenada no es válida', () => {
        expect(getDistance(Number.NaN, 0, 0, 1)).toBe(0);
    });
});

describe('togglePhaseSelection', () => {
    it('marca una fase que todavía no está seleccionada', () => {
        expect(togglePhaseSelection(['walk'], 'training')).toEqual(['walk', 'training']);
    });

    it('desmarca cualquier fase seleccionada, incluido entrenamiento', () => {
        expect(togglePhaseSelection(['walk', 'training'], 'training')).toEqual(['walk']);
        expect(togglePhaseSelection(['walk', 'run'], 'walk')).toEqual(['run']);
    });

    it('tolera un estado inicial sin arreglo', () => {
        expect(togglePhaseSelection(null, 'run')).toEqual(['run']);
    });
});

describe('getPhaseSelectionChange', () => {
    it('acepta una selección inicial vacía', () => {
        expect(getPhaseSelectionChange(null, 'walk')).toEqual({
            selectedPhases: ['walk'],
            shouldChooseWorkout: false,
            shouldClearWorkout: false
        });
    });

    it('abre la selección de rutinas al marcar entrenamiento', () => {
        expect(getPhaseSelectionChange(['walk'], 'training')).toEqual({
            selectedPhases: ['walk', 'training'],
            shouldChooseWorkout: true,
            shouldClearWorkout: false
        });
    });

    it('descarta la rutina anterior al desmarcar entrenamiento', () => {
        expect(getPhaseSelectionChange(['training', 'run'], 'training')).toEqual({
            selectedPhases: ['run'],
            shouldChooseWorkout: false,
            shouldClearWorkout: true
        });
    });

    it('no altera la selección de rutina al cambiar otra fase', () => {
        expect(getPhaseSelectionChange(['training'], 'stretch')).toEqual({
            selectedPhases: ['training', 'stretch'],
            shouldChooseWorkout: false,
            shouldClearWorkout: false
        });
    });
});

describe('createDefaultWorkouts', () => {
    const defaultParams = {
        entrenamiento: {
            action: 30,
            change: 5,
            rounds: 3,
            cycles: 4,
            rest: 60,
            zoneRest: 30
        }
    };

    it('crea los tres niveles integrados como rutinas de solo lectura', () => {
        const workouts = createDefaultWorkouts(defaultParams);

        expect(workouts.map(({ name }) => name)).toEqual([
            'PRINCIPIANTE',
            'INTERMEDIO',
            'AVANZADO'
        ]);
        expect(workouts.every(({ isDefault }) => isDefault)).toBe(true);
        expect(new Set(workouts.map(({ id }) => id)).size).toBe(3);
        expect(workouts.map(({ exerciseDifficulty }) => exerciseDifficulty)).toEqual([
            'Fácil',
            'Intermedio',
            'Difícil'
        ]);
    });

    it('solo cambia el número de ciclos entre niveles', () => {
        const workouts = createDefaultWorkouts(defaultParams);

        expect(workouts.map(workout => workout.phases.entrenamiento.cycles)).toEqual([2, 4, 8]);
        for (const workout of workouts) {
            expect({
                ...workout.phases.entrenamiento,
                cycles: defaultParams.entrenamiento.cycles
            }).toEqual(defaultParams.entrenamiento);
        }
    });

    it('no modifica la plantilla de parámetros', () => {
        createDefaultWorkouts(defaultParams);
        expect(defaultParams.entrenamiento.rounds).toBe(3);
    });
});

describe('calculateWorkoutDurationSeconds', () => {
    const defaultParams = {
        entrenamiento: {
            action: 30,
            change: 5,
            rounds: 3,
            cycles: 4,
            rest: 60,
            zoneRest: 30
        }
    };

    it('calcula la sesión completa de cada rutina integrada', () => {
        const workouts = createDefaultWorkouts(defaultParams);
        const durations = workouts.map(workout =>
            calculateWorkoutDurationSeconds(workout, defaultParams, 10, 3)
        );

        expect(durations).toEqual([1200, 2040, 3720]);
        expect(durations.map(formatDurationEstimate)).toEqual([
            '20 min',
            '34 min',
            '1 h 2 min'
        ]);
    });

    it('usa la plantilla si una rutina no redefine parámetros', () => {
        expect(calculateWorkoutDurationSeconds(
            { phases: {} },
            defaultParams,
            10,
            3
        )).toBe(2040);
    });

    it('evita tiempos negativos cuando no hay pasos, rondas o zonas', () => {
        const emptyWorkout = {
            phases: {
                entrenamiento: {
                    rounds: 0,
                    cycles: 0
                }
            }
        };

        expect(calculateWorkoutDurationSeconds(emptyWorkout, defaultParams, 0, 0)).toBe(75);
    });
});

describe('formatDurationEstimate', () => {
    it('redondea hacia arriba para no subestimar la duración', () => {
        expect(formatDurationEstimate(61)).toBe('2 min');
        expect(formatDurationEstimate(-1)).toBe('0 min');
    });

    it('omite los minutos cuando la duración completa horas exactas', () => {
        expect(formatDurationEstimate(3600)).toBe('1 h');
    });
});

describe('getRestNextActivity', () => {
    it('anuncia el ejercicio real después de cada descanso o cambio', () => {
        for (const phase of ['inicio', 'cambio-warmup', 'post-warmup', 'cambio-ent', 'zone-rest', 'ciclo-rest', 'post-training', 'post-gps-rest', 'pre-stretches', 'cambio-est']) {
            expect(getRestNextActivity([{ phase }, { phase:'entrenamiento', label:'Sentadillas' }], 0))
                .toEqual({ stepIndex:1, text:'Sentadillas' });
        }
    });
    it('omite descansos consecutivos y encuentra la actividad o el final', () => {
        expect(getRestNextActivity([{ phase:'post-training' }, { phase:'pre-stretches' }, { phase:'estiramientos', label:'ESTIRAMIENTO 1' }], 0))
            .toEqual({ stepIndex:2, text:'ESTIRAMIENTO 1' });
        expect(getRestNextActivity([{ phase:'post-gps-rest' }, { phase:'finished', label:'FINAL DE LA RUTINA' }], 0))
            .toEqual({ stepIndex:1, text:'FINAL DE LA RUTINA' });
        expect(getRestNextActivity([{ phase:'post-training' }, { phase:'gps-tracking', label:'INICIAR CAMINATA' }], 0))
            .toEqual({ stepIndex:1, text:'INICIAR CAMINATA' });
    });
    it('mantiene el conteo de ejercicio y tolera el fin de la secuencia', () => {
        expect(getRestNextActivity([{ phase:'entrenamiento' }], 0)).toBeNull();
        expect(getRestNextActivity([{ phase:'ciclo-rest' }], 0)).toBeNull();
        expect(getRestNextActivity([], 0)).toBeNull();
    });
});

describe('getCountdownAnnouncement', () => {
    it('por defecto cuenta una sola vez sin anunciar cambio', () => {
        expect(getCountdownAnnouncement(4, true)).toBeNull();
        expect(getCountdownAnnouncement(3, true)).toBe('Tres. Dos. Uno.');
        expect(getCountdownAnnouncement(2, true)).toBeNull();
        expect(getCountdownAnnouncement(1, true)).toBeNull();
        expect(getCountdownAnnouncement(0, true)).toBeNull();
    });

    it('respeta los pasos que tienen la cuenta de voz desactivada', () => {
        expect(getCountdownAnnouncement(3, false)).toBeNull();
    });

    it('sólo añade cambio cuando termina un ejercicio', () => {
        expect(getCountdownAnnouncement(3, true, true)).toBe('Tres. Dos. Uno. Cambio.');
        expect(getCountdownAnnouncement(3, true, false)).toBe('Tres. Dos. Uno.');
    });
});

describe('getGpsStartAnnouncement', () => {
    it('une el aviso de inicio y el conteo en una sola locución', () => {
        expect(getGpsStartAnnouncement('Carrera')).toBe('Iniciar carrera. Tres. Dos. Uno.');
        expect(getGpsStartAnnouncement('Caminata')).toBe('Iniciar caminata. Tres. Dos. Uno.');
    });

    it('conserva el conteo si no recibe una actividad', () => {
        expect(getGpsStartAnnouncement(null)).toBe('Tres. Dos. Uno.');
    });
});

describe('selección de ejercicios por nivel', () => {
    const catalog = [
        { group:'PIERNAS', difficulty:'Fácil', name:'Sentadilla' },
        { group:'PIERNAS', difficulty:'Fácil', name:'Zancada' },
        { group:'PIERNAS', difficulty:'Difícil', name:'Pistol' },
        { group:'BRAZOS', difficulty:'Fácil', name:'Flexión en pared' }
    ];

    it('asocia cada rutina integrada con su dificultad', () => {
        expect(getWorkoutExerciseDifficulty({ name:'PRINCIPIANTE' })).toBe('Fácil');
        expect(getWorkoutExerciseDifficulty({ name:'INTERMEDIO' })).toBe('Intermedio');
        expect(getWorkoutExerciseDifficulty({ name:'AVANZADO' })).toBe('Difícil');
        expect(getWorkoutExerciseDifficulty({ exerciseDifficulty:'Fácil', name:'Personalizada' })).toBe('Fácil');
    });

    it('elige solo ejercicios del grupo y nivel solicitados', () => {
        const selected = createRandomExerciseSequence(
            catalog,
            'Fácil',
            ['PIERNAS', 'BRAZOS', 'PIERNAS'],
            () => 0
        );

        expect(selected.map(exercise => exercise.group)).toEqual(['PIERNAS', 'BRAZOS', 'PIERNAS']);
        expect(selected.every(exercise => exercise.difficulty === 'Fácil')).toBe(true);
        expect(selected[0].name).not.toBe(selected[2].name);
    });

    it('devuelve null cuando el catálogo no contiene esa combinación', () => {
        expect(createRandomExerciseSequence(catalog, 'Difícil', ['BRAZOS'], () => 0)).toEqual([null]);
    });

    it('protege la selección ante entradas y valores aleatorios inválidos', () => {
        expect(createRandomExerciseSequence(null, 'Fácil', null, () => Number.NaN)).toEqual([]);
        expect(createRandomExerciseSequence(catalog, 'Fácil', ['PIERNAS'], () => Number.NaN)).toHaveLength(1);
        expect(getWorkoutExerciseDifficulty({})).toBe('Intermedio');
    });

    it('evita repetir el último ejercicio al rellenar la cola', () => {
        const randomValues = [0, .99];
        let randomIndex = 0;
        const selected = createRandomExerciseSequence(
            catalog,
            'Fácil',
            ['PIERNAS', 'PIERNAS', 'PIERNAS'],
            () => randomValues[randomIndex++] ?? .99
        );
        expect(selected.map(exercise => exercise.name)).toEqual(['Zancada', 'Sentadilla', 'Zancada']);
    });

    it('repite en todos los ciclos la selección realizada para el primero', () => {
        const firstCycle = [catalog[0], catalog[3], catalog[1]];
        const repeated = repeatExerciseSequenceForCycles(firstCycle, 3);

        expect(repeated).toEqual([...firstCycle, ...firstCycle, ...firstCycle]);
        expect(repeated.slice(3, 6)).toEqual(repeated.slice(0, 3));
        expect(repeated.slice(6, 9)).toEqual(repeated.slice(0, 3));
        expect(repeatExerciseSequenceForCycles(null, Number.NaN)).toEqual([]);
    });

    it('incluye los 45 ejercicios recibidos, cinco por grupo y dificultad', () => {
        expect(exerciseCatalog).toHaveLength(45);
        for (const group of ['PIERNAS', 'BRAZOS', 'TRONCO']) {
            for (const difficulty of ['Fácil', 'Intermedio', 'Difícil']) {
                expect(exerciseCatalog.filter(exercise =>
                    exercise.group === group && exercise.difficulty === difficulty
                )).toHaveLength(5);
            }
        }
    });
});
