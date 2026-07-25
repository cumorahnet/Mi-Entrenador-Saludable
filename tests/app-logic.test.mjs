import { describe, expect, it } from 'vitest';
import appLogic from '../www/assets/app-logic.js';

const {
    formatTime,
    formatPace,
    formatDistance,
    formatSpeed,
    getDistance
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
