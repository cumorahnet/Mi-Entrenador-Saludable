(function exposeAppLogic(root, factory) {
    const appLogic = factory();

    /* v8 ignore next -- Adaptador CommonJS; la lógica se prueba a través de esta rama. */
    if (typeof module === 'object' && module.exports) {
        module.exports = appLogic;
    }

    /* v8 ignore next -- Adaptador para el script clásico cargado por el navegador. */
    if (root) {
        root.AppLogic = appLogic;
    }
}(globalThis, function createAppLogic() {
    const isFiniteNumber = value => typeof value === 'number' && Number.isFinite(value);

    const formatTime = seconds => {
        if (!isFiniteNumber(seconds) || seconds <= 0) return '0:00';
        const wholeSeconds = Math.floor(seconds);
        return `${Math.floor(wholeSeconds / 60)}:${(wholeSeconds % 60).toString().padStart(2, '0')}`;
    };

    const formatPace = (totalDistanceMeters, totalTimeSeconds) => {
        if (
            !isFiniteNumber(totalDistanceMeters) ||
            !isFiniteNumber(totalTimeSeconds) ||
            totalDistanceMeters <= 0 ||
            totalTimeSeconds <= 0
        ) return '0:00';

        const roundedPaceSeconds = Math.round(totalTimeSeconds / (totalDistanceMeters / 1000));
        const minutes = Math.floor(roundedPaceSeconds / 60);
        const seconds = roundedPaceSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatDistance = meters => {
        if (!isFiniteNumber(meters) || meters <= 0) return '0 m';
        return meters < 1000
            ? `${Math.round(meters)} m`
            : `${(meters / 1000).toFixed(2)} km`;
    };

    const formatSpeed = (meters, seconds) => {
        if (
            !isFiniteNumber(meters) ||
            !isFiniteNumber(seconds) ||
            meters <= 0 ||
            seconds <= 0
        ) return '0.0 km/h';

        return `${((meters / 1000) / (seconds / 3600)).toFixed(1)} km/h`;
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (![lat1, lon1, lat2, lon2].every(isFiniteNumber)) return 0;

        const earthRadiusMeters = 6371e3;
        const latitude1 = lat1 * Math.PI / 180;
        const latitude2 = lat2 * Math.PI / 180;
        const latitudeDelta = (lat2 - lat1) * Math.PI / 180;
        const longitudeDelta = (lon2 - lon1) * Math.PI / 180;
        const haversine =
            Math.sin(latitudeDelta / 2) ** 2 +
            Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;

        return earthRadiusMeters * 2 * Math.atan2(
            Math.sqrt(haversine),
            Math.sqrt(1 - haversine)
        );
    };

    const togglePhaseSelection = (selectedPhases, phaseKey) => {
        const phases = Array.isArray(selectedPhases) ? selectedPhases : [];
        return phases.includes(phaseKey)
            ? phases.filter(key => key !== phaseKey)
            : [...phases, phaseKey];
    };

    const createDefaultWorkouts = defaultParams => [
        { id: '_default_beginner', name: 'PRINCIPIANTE', cycles: 2 },
        { id: '_default_intermediate', name: 'INTERMEDIO', cycles: 4 },
        { id: '_default_advanced', name: 'AVANZADO', cycles: 8 }
    ].map(({ id, name, cycles }) => ({
        id,
        name,
        isDefault: true,
        phases: {
            ...defaultParams,
            entrenamiento: {
                ...defaultParams.entrenamiento,
                cycles
            }
        }
    }));

    const calculateWorkoutDurationSeconds = (
        workout,
        defaultParams,
        warmupStepsCount,
        trainingZonesCount
    ) => {
        const workoutParams = workout?.phases?.entrenamiento || {};
        const ent = { ...defaultParams.entrenamiento, ...workoutParams };

        const warmupSeconds =
            15 +
            warmupStepsCount * 30 +
            Math.max(0, warmupStepsCount - 1) * 5 +
            20;
        const zoneSeconds =
            ent.rounds * ent.action +
            Math.max(0, ent.rounds - 1) * ent.change;
        const cycleSeconds =
            trainingZonesCount * zoneSeconds +
            Math.max(0, trainingZonesCount - 1) * ent.zoneRest;
        const mainTrainingSeconds =
            ent.cycles * cycleSeconds +
            Math.max(0, ent.cycles - 1) * ent.rest +
            30;

        return warmupSeconds + mainTrainingSeconds + 10;
    };

    const formatDurationEstimate = totalSeconds => {
        const totalMinutes = Math.ceil(Math.max(0, totalSeconds) / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes} min`;
        if (minutes === 0) return `${hours} h`;
        return `${hours} h ${minutes} min`;
    };

    return {
        formatTime,
        formatPace,
        formatDistance,
        formatSpeed,
        getDistance,
        togglePhaseSelection,
        createDefaultWorkouts,
        calculateWorkoutDurationSeconds,
        formatDurationEstimate
    };
}));
