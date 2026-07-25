import { describe, expect, it } from 'vitest';
import appLogic from '../www/assets/app-logic.js';

const {
    formatTime,
    formatPace,
    formatDistance,
    formatSpeed,
    getDistance,
    togglePhaseSelection,
    createDefaultWorkouts,
    calculateWorkoutDurationSeconds,
    formatDurationEstimate
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
