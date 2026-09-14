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

    const getPhaseSelectionChange = (selectedPhases, phaseKey) => {
        const phases = Array.isArray(selectedPhases) ? selectedPhases : [];
        const wasSelected = phases.includes(phaseKey);
        return {
            selectedPhases: togglePhaseSelection(phases, phaseKey),
            shouldChooseWorkout: phaseKey === 'training' && !wasSelected,
            shouldClearWorkout: phaseKey === 'training' && wasSelected
        };
    };

    const createDefaultWorkouts = defaultParams => [
        { id: '_default_beginner', name: 'PRINCIPIANTE', cycles: 2, exerciseDifficulty: 'Fácil' },
        { id: '_default_intermediate', name: 'INTERMEDIO', cycles: 4, exerciseDifficulty: 'Intermedio' },
        { id: '_default_advanced', name: 'AVANZADO', cycles: 8, exerciseDifficulty: 'Difícil' }
    ].map(({ id, name, cycles, exerciseDifficulty }) => ({
        id,
        name,
        isDefault: true,
        exerciseDifficulty,
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

    const getCountdownAnnouncement = (remainingSeconds, enabled, includeChangeCue = false) => (
        enabled && remainingSeconds === 3
            ? `Tres. Dos. Uno.${includeChangeCue ? ' Cambio.' : ''}`
            : null
    );

    const getRestNextActivity = (steps, stepIndex) => {
        const restPhases = ['inicio', 'cambio-warmup', 'post-warmup', 'cambio-ent',
            'zone-rest', 'ciclo-rest', 'post-training', 'post-gps-rest',
            'pre-stretches', 'cambio-est'];
        if (!restPhases.includes(steps[stepIndex]?.phase)) return null;
        const nextIndex = steps.findIndex((step, index) => index > stepIndex && !restPhases.includes(step.phase));
        if (nextIndex < 0) return null;
        const next = steps[nextIndex];
        return { stepIndex:nextIndex, text:next.label };
    };

    const getGpsStartAnnouncement = activityTypeLabel => {
        const activity = String(activityTypeLabel || '').trim().toLowerCase();
        return `${activity ? `Iniciar ${activity}. ` : ''}Tres. Dos. Uno.`;
    };

    const normalizeCatalogValue = value => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

    const getWorkoutExerciseDifficulty = workout => {
        if (workout?.exerciseDifficulty) return workout.exerciseDifficulty;
        const workoutName = normalizeCatalogValue(workout?.name);
        if (workoutName.includes('PRINCIPIANTE')) return 'Fácil';
        if (workoutName.includes('AVANZADO')) return 'Difícil';
        return 'Intermedio';
    };

    const createRandomExerciseSequence = (catalog, difficulty, groups, random = Math.random) => {
        const entries = Array.isArray(catalog) ? catalog : [];
        const requestedGroups = Array.isArray(groups) ? groups : [];
        const difficultyKey = normalizeCatalogValue(difficulty);
        const stateByGroup = new Map();

        const shuffledCopy = items => {
            const shuffled = [...items];
            for (let index = shuffled.length - 1; index > 0; index--) {
                const randomValue = Number(random());
                const safeRandom = Number.isFinite(randomValue)
                    ? Math.min(Math.max(randomValue, 0), 0.999999999)
                    : 0;
                const swapIndex = Math.floor(safeRandom * (index + 1));
                [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
            }
            return shuffled;
        };

        return requestedGroups.map(group => {
            const groupKey = normalizeCatalogValue(group);
            let state = stateByGroup.get(groupKey);
            if (!state) {
                state = {
                    options: entries.filter(entry =>
                        normalizeCatalogValue(entry.group) === groupKey &&
                        normalizeCatalogValue(entry.difficulty) === difficultyKey
                    ),
                    queue: [],
                    lastName: null
                };
                stateByGroup.set(groupKey, state);
            }

            if (state.options.length === 0) return null;
            if (state.queue.length === 0) {
                state.queue = shuffledCopy(state.options);
                if (
                    state.queue.length > 1 &&
                    state.lastName &&
                    state.queue[0].name === state.lastName
                ) {
                    [state.queue[0], state.queue[1]] = [state.queue[1], state.queue[0]];
                }
            }

            const selected = state.queue.shift();
            state.lastName = selected.name;
            return selected;
        });
    };

    const repeatExerciseSequenceForCycles = (firstCycleSequence, cycles) => {
        const sequence = Array.isArray(firstCycleSequence) ? firstCycleSequence : [];
        const cycleCount = Number.isFinite(cycles) ? Math.max(0, Math.floor(cycles)) : 0;
        return Array.from({ length: cycleCount }, () => sequence).flat();
    };

    const inferSessionSection = (step, selectedPhases) => {
        if (step?.sessionSection) return step.sessionSection;
        if (['inicio', 'calentamiento', 'cambio-warmup', 'post-warmup'].includes(step?.phase)) {
            return 'preparation';
        }
        if (['entrenamiento', 'cambio-ent', 'zone-rest', 'ciclo-rest', 'post-training'].includes(step?.phase)) {
            return 'training';
        }
        if (['pre-stretches', 'estiramientos', 'cambio-est'].includes(step?.phase)) {
            return 'stretch';
        }
        if (['gps-tracking', 'post-gps-rest'].includes(step?.phase)) {
            if (step?.activityType === 'walk' || step?.activityType === 'run') return step.activityType;
            const cardioPhases = (Array.isArray(selectedPhases) ? selectedPhases : [])
                .filter(key => key === 'walk' || key === 'run');
            return cardioPhases[0] || 'walk';
        }
        return null;
    };

    const getNextSessionSectionIndex = (steps, index, selectedPhases) => {
        const section = inferSessionSection(steps[index], selectedPhases);
        let next = index + 1;
        while (next < steps.length && inferSessionSection(steps[next], selectedPhases) === section) next++;
        return next;
    };

    // Keep the accepted anchor until small walking increments exceed the noise floor.
    const evaluateGpsPosition = (anchor, point, now) => {
        if (![point.latitude, point.longitude, point.accuracy, point.timestamp].every(isFiniteNumber) ||
            Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180 ||
            point.accuracy < 0 || point.accuracy > 50 ||
            now - point.timestamp > 15000 || point.timestamp > now + 1000 ||
            (anchor && point.timestamp <= anchor.timestamp)) return { valid:false, distance:0, anchor };
        if (!anchor || point.timestamp - anchor.timestamp > 30000) {
            return { valid:true, distance:0, anchor:point };
        }
        const distance = getDistance(anchor.latitude, anchor.longitude, point.latitude, point.longitude);
        const seconds = (point.timestamp - anchor.timestamp) / 1000;
        if (distance / seconds > 12) return { valid:false, distance:0, anchor };
        const threshold = Math.max(2, Math.min(10, (point.accuracy + anchor.accuracy) * .15));
        return distance >= threshold
            ? { valid:true, distance, anchor:point }
            : { valid:true, distance:0, anchor };
    };

    const getGpsFeedback = ({ now, lastFixTime, distance, previousDistance, time, previousTime }) => {
        if (!lastFixTime || now - lastFixTime > 15000) {
            return { key:'signal', text:'La señal GPS no es suficiente. No puedo confirmar tu avance; busca un lugar con cielo despejado.' };
        }
        const progress = Math.max(0, distance - previousDistance);
        if (progress < 5) return { key:'no-progress', text:'El GPS no registra avance suficiente. Si estás caminando, revisa la señal y el permiso de ubicación precisa.' };
        return { key:'progress', text:`Has avanzado ${formatDistance(progress)} desde el último informe. Distancia total: ${formatDistance(distance)}. Velocidad del tramo: ${formatSpeed(progress, time - previousTime)}.` };
    };

    const calculateSessionBreakdown = ({
        steps,
        currentStepIndex,
        currentStepRemaining,
        gpsActivityTimes,
        selectedPhases
    } = {}) => {
        const totals = { preparation:0, training:0, walk:0, run:0, stretch:0 };
        const sessionSteps = Array.isArray(steps) ? steps : [];
        const lastReachedIndex = Number.isFinite(currentStepIndex)
            ? Math.min(Math.max(0, Math.floor(currentStepIndex)), Math.max(0, sessionSteps.length - 1))
            : -1;

        sessionSteps.forEach((step, index) => {
            if (index > lastReachedIndex) return;
            const section = inferSessionSection(step, selectedPhases);
            if (!section || !(section in totals)) return;
            const stepSeconds = Number.isFinite(step?.seconds) ? Math.max(0, step.seconds) : 0;
            const seconds = Number.isFinite(step.performedSeconds) ? step.performedSeconds : index < lastReachedIndex
                ? stepSeconds
                : Math.min(stepSeconds, Math.max(0, stepSeconds - (Number(currentStepRemaining) || 0)));
            totals[section] += seconds;
        });

        for (const activityType of ['walk', 'run']) {
            const gpsSeconds = Number(gpsActivityTimes?.[activityType]);
            if (Number.isFinite(gpsSeconds) && gpsSeconds > 0) totals[activityType] += gpsSeconds;
        }

        return totals;
    };

    return {
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
        calculateSessionBreakdown,
        getNextSessionSectionIndex,
        evaluateGpsPosition,
        getGpsFeedback
    };
}));
