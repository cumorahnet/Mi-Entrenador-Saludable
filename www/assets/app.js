window.onerror = function(message, source, lineno, colno, error) {
    console.error('GLOBAL JS ERROR:', { message, source, lineno, colno, error });
    return true;
};

let pullStartY = 0;
let pullScrollContainer = null;

function findScrollableParent(element) {
    let node = element instanceof Element ? element : null;
    while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const canScroll = /(auto|scroll)/.test(style.overflowY)
            && node.scrollHeight > node.clientHeight;
        if (canScroll) return node;
        node = node.parentElement;
    }
    return null;
}

window.addEventListener('touchstart', (event) => {
    if (event.touches && event.touches.length === 1) {
        pullStartY = event.touches[0].clientY;
        pullScrollContainer = findScrollableParent(event.target);
    }
}, { passive: true });
window.addEventListener('touchmove', (event) => {
    if (!event.touches || event.touches.length !== 1) return;

    const currentY = event.touches[0].clientY;
    const pullingDown = currentY > pullStartY;
    const atTop = pullScrollContainer
        ? pullScrollContainer.scrollTop <= 0
        : window.scrollY <= 0
            && document.documentElement.scrollTop <= 0
            && document.body.scrollTop <= 0;

    if (atTop && pullingDown) {
        event.preventDefault();
    }
}, { passive: false });
try {
    const manifest = {
        name: 'Mi Entrenador Saludable',
        short_name: 'Entrenador',
        start_url: '.',
        scope: '.',
        display: 'fullscreen',
        background_color: '#020617',
        theme_color: '#020617',
        orientation: 'portrait'
    };
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = URL.createObjectURL(manifestBlob);
    document.head.appendChild(manifestLink);
} catch(e) {}

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const IconPlay = () => React.createElement('svg', { width: "40", height: "40", viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M8 5v14l11-7z" }));
const IconPause = () => React.createElement('svg', { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }));
const IconShare = () => React.createElement('svg', { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.94 12.03c-.52-.47-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" }));
const IconSave = () => React.createElement('svg', { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement('path', { d: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" }));
const IconMap = () => React.createElement('svg', { width:"24", height:"24", viewBox:"0 0 24 24", fill:"currentColor" }, React.createElement('path', { d:"M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5h16c.21 0 .39-.13.45-.33l.14-.52V3.5c0-.28-.22-.5-.5-.5zm-9.92 1.3L15 6.1l4.47-1.44.03.01L19 18.5 15 16.9l-4.47 1.44-.03-.01L5 5.5l4.47-1.44.03.01z" }));


const firebaseConfig = {
    apiKey: "AIzaSyDg0nohFAprIYta3Z3IvFGms55PehyxGIM",
    authDomain: "entrenadorpersonal-4e69d.firebaseapp.com",
    projectId: "entrenadorpersonal-4e69d",
    storageBucket: "entrenadorpersonal-4e69d.firebasestorage.app",
    messagingSenderId: "198872357236",
    appId: "1:198872357236:web:c3cd2a7f5caff197847421"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const APP_ID = "mientrenador-v3";
const APP_TITLE = "Mi Entrenador Saludable";
const APP_VERSION = "2.38";
const ACTIVE_SESSION_STORAGE_KEY = `${APP_ID}:active-session:v1`;
const GPS_ANNOUNCEMENT_INTERVAL_MS = 60 * 1000;

const readActiveSession = () => {
    try {
        const saved = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.warn('No se pudo leer la sesión activa:', error);
        return null;
    }
};
const writeActiveSession = session => {
    try {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
        console.warn('No se pudo respaldar la sesión activa:', error);
    }
};
const clearActiveSession = () => {
    try { localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY); } catch(e) {}
};

const WARMUP_STEPS = [
    { label: 'TOBILLO DERECHO', voice: 'Tobillo derecho' },
    { label: 'TOBILLO IZQUIERDO', voice: 'Tobillo izquierdo' },
    { label: 'RODILLAS DERECHA', voice: 'Rodillas a la derecha' },
    { label: 'RODILLAS IZQUIERDA', voice: 'Rodillas a la izquierda' },
    { label: 'CINTURA DERECHA', voice: 'Cintura a la derecha' },
    { label: 'CINTURA IZQUIERDA', voice: 'Cintura a la izquierda' },
    { label: 'BRAZO DERECHO', voice: 'Brazo derecho' },
    { label: 'BRAZO IZQUIERDO', voice: 'Brazo izquierdo' },
    { label: 'CUELLO ADELANTE Y ATRÁS', voice: 'Cuello adelante y atrás' },
    { label: 'CUELLO DER. E IZQ.', voice: 'Cuello derecha e izquierda' },
];

const TRAINING_ZONES = ['PIERNAS', 'BRAZOS', 'TRONCO'];
const EXERCISE_CATALOG = window.ExerciseCatalog || [];
const DEFAULT_PARAMS = {
    entrenamiento: {
        action: 30, change: 5, rounds: 3, cycles: 4, rest: 60, zoneRest: 30,
        stretchSteps: 16, stretchAction: 30, stretchChange: 10
    }
};

const {
    formatTime,
    formatPace,
    formatDistance,
    formatSpeed,
    getGpsSummarySpeech,
    getDistance,
    togglePhaseSelection,
    getPhaseSelectionChange,
    customActivityIdentity,
    uniqueCustomActivities,
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
} = window.AppLogic;
const DEFAULT_WORKOUTS = createDefaultWorkouts(DEFAULT_PARAMS);
const getWorkoutDurationText = workout => workout?.customActivity ? (workout.customActivity.mode === 'gps' ? 'Hasta finalizar' : formatTime(Number(workout.customActivity.preparation || 0) + workout.customActivity.seconds * (workout.customActivity.mode === 'cycles' ? workout.customActivity.cycles : 1) + (workout.customActivity.mode === 'cycles' ? workout.customActivity.rest * (workout.customActivity.cycles - 1) : 0))) : formatDurationEstimate(
    calculateWorkoutDurationSeconds(workout, DEFAULT_PARAMS, WARMUP_STEPS.length, TRAINING_ZONES.length)
);

const GPS_PHASE_KEY = 'gps-tracking';
const POST_GPS_REST_PHASE_KEY = 'post-gps-rest';

const whistle = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime, duration = 1.6;
        const createOsc = (freq, type = 'sine', vol = 1.0) => {
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            const mod = ctx.createOscillator(), modGain = ctx.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, now);
            mod.frequency.setValueAtTime(45, now); modGain.gain.setValueAtTime(freq*0.1, now);
            mod.connect(modGain); modGain.connect(osc.frequency);
            osc.connect(gain); gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now+0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now+duration);
            osc.start(now); mod.start(now); osc.stop(now+duration); mod.stop(now+duration);
        };
        createOsc(3500); createOsc(3515, 'triangle', 0.5);
    } catch(e) { console.warn("Whistle failed:", e); }
};

const voiceQueue = [];
let voiceBusy = false;
let voiceGeneration = 0;
let voiceTimeout = null;
const flushVoice = () => {
    if (voiceBusy || voiceQueue.length === 0 || !window.speechSynthesis) return;
    voiceBusy = true;
    const item = voiceQueue.shift();
    const text = typeof item === 'string' ? item : item.text;
    const onEndCallback = typeof item === 'object' && item.onEnd ? item.onEnd : () => {};
    const generation = typeof item === 'object' && item.generation ? item.generation : voiceGeneration;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-ES'; msg.rate = 1.05;
    const finish = () => {
        if (generation !== voiceGeneration) return;
        if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }
        voiceBusy = false;
        onEndCallback();
        flushVoice();
    };
    msg.onend = msg.onerror = finish;
    voiceTimeout = setTimeout(finish, Math.max(2500, text.length * 95));
    try {
        window.speechSynthesis.resume?.();
        window.speechSynthesis.speak(msg);
    } catch (err) {
        console.warn('No se pudo reproducir voz:', err);
        finish();
    }
};
const speakWithWebVoice = (text, interrupt = false, onEnd = null) => {
    if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
    if (interrupt) {
        voiceGeneration++;
        if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }
        window.speechSynthesis.cancel();
        voiceQueue.length = 0;
        voiceBusy = false;
    }
    if (text) voiceQueue.push({ text, onEnd, generation: voiceGeneration });
    flushVoice();
};
const speak = (text, interrupt = false, onEnd = null) => {
    const nativeSpeech = window.Capacitor?.isNativePlatform?.()
        ? window.Capacitor?.Plugins?.NativeSpeech
        : null;

    if (!nativeSpeech?.speak) {
        speakWithWebVoice(text, interrupt, onEnd);
        return;
    }

    if (interrupt) {
        voiceGeneration++;
        if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }
        try { window.speechSynthesis?.cancel?.(); } catch(e) {}
        voiceQueue.length = 0;
        voiceBusy = false;
    }

    if (!text) { if (onEnd) onEnd(); return; }
    const generation = voiceGeneration;
    nativeSpeech.speak({ text, interrupt }).then(() => {
        if (generation === voiceGeneration && onEnd) onEnd();
    }).catch((err) => {
        if (generation !== voiceGeneration) return;
        console.warn('Voz nativa no disponible; se usará la voz web:', err);
        speakWithWebVoice(text, false, onEnd);
    });
};
const resumeVoice = () => {
    const nativeSpeech = window.Capacitor?.isNativePlatform?.()
        ? window.Capacitor?.Plugins?.NativeSpeech
        : null;
    if (nativeSpeech?.warmup) {
        nativeSpeech.warmup().catch((err) => console.warn('No se pudo preparar la voz nativa:', err));
        return;
    }
    try { window.speechSynthesis?.resume?.(); } catch(e) {}
};
const endVoiceSession = () => {
    const nativeSpeech = window.Capacitor?.isNativePlatform?.()
        ? window.Capacitor?.Plugins?.NativeSpeech
        : null;
    nativeSpeech?.endSession?.().catch((error) => console.warn('No se pudo cerrar la guía de voz:', error));
};
const requestAppFullscreen = async () => {
    // En Chrome Android, forzar Fullscreen API desde una página normal puede volver
    // inestable la pestaña al apagar/encender pantalla. El modo sin barras debe venir
    // de instalar la app como PWA, usando el manifest fullscreen.
    return;
};
const getCapacitorPlugins = () => window.Capacitor?.Plugins || {};
const isNativeRuntime = () => !!window.Capacitor?.isNativePlatform?.();
const startLocationWatch = async (onPosition, onError, nativeOptions) => {
    const { Geolocation, NativeGps } = getCapacitorPlugins();
    if (isNativeRuntime()) {
        if (!NativeGps) throw new Error('El seguimiento nativo no está disponible. Actualiza la aplicación Android.');
        return window.NativeGpsBridge.start(NativeGps, nativeOptions, onPosition, onError, window);
    }
    const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 };

    if (isNativeRuntime() && Geolocation?.watchPosition) {
        try {
            const permission = await Geolocation.requestPermissions?.();
            if (permission && permission.location === 'denied') {
                throw new Error('Permiso de ubicación denegado. Actívalo en Ajustes.');
            }
            const id = await Geolocation.watchPosition(options, (position, err) => {
                if (err) { onError(err); return; }
                if (position?.coords) {
                    onPosition({
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            speed: position.coords.speed
                        },
                        timestamp: position.timestamp
                    });
                }
            });
            return { type: 'capacitor', id };
        } catch (err) {
            onError(err);
            return null;
        }
    }

    if (!('geolocation' in navigator)) {
        onError(new Error('Geolocalización no disponible.'));
        return null;
    }

    const id = navigator.geolocation.watchPosition(onPosition, onError, options);
    return { type: 'web', id };
};
const clearLocationWatch = async (watchHandle) => {
    if (!watchHandle) return;
    if (watchHandle.type === 'native') return watchHandle.stop();
    if (watchHandle.type === 'capacitor') {
        try {
            const { Geolocation } = getCapacitorPlugins();
            await Geolocation?.clearWatch?.({ id: watchHandle.id });
        } catch(e) {}
        return;
    }
    if (watchHandle.type === 'web' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchHandle.id);
    }
};

const startOfDay = (date) => { const d = new Date(date); d.setHours(0,0,0,0); return d; };
const endOfDay   = (date) => { const d = new Date(date); d.setHours(23,59,59,999); return d; };
const getWeekRange  = (date, offset=0) => { const d=startOfDay(new Date(date)); d.setDate(d.getDate()+offset*7); const day=d.getDay(); const diff=d.getDate()-day+(day===0?-6:1); const start=startOfDay(new Date(d.setDate(diff))); const end=endOfDay(new Date(d.setDate(diff+6))); return {start,end}; };
const getMonthRange = (date, offset=0) => { const d=startOfDay(new Date(date)); d.setMonth(d.getMonth()+offset); return {start:startOfDay(new Date(d.getFullYear(),d.getMonth(),1)),end:endOfDay(new Date(d.getFullYear(),d.getMonth()+1,0))}; };
const getYearRange  = (date, offset=0) => { const d=startOfDay(new Date(date)); d.setFullYear(d.getFullYear()+offset); return {start:startOfDay(new Date(d.getFullYear(),0,1)),end:endOfDay(new Date(d.getFullYear(),11,31))}; };

// ─── Generadores de segmentos ─────────────────────────────────────────────────
const generateWarmupSegment = (ent, nextPhaseIntro=null) => {
    const s = [];
    s.push({ label:'PREPÁRATE', seconds:15, color:'bg-yellow-400', phase:'inicio', voiceInitial:'Prepárate para el calentamiento', whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    WARMUP_STEPS.forEach((ws, i) => {
        s.push({ label:ws.label, seconds:30, color:'bg-yellow-400', phase:'calentamiento', voiceInitial:ws.voice||ws.label.toLowerCase(), whistleOnStart:true, voiceCountdown:true, countdownChangeCue:true });
        if (i < WARMUP_STEPS.length-1)
            s.push({ label:'CAMBIO', seconds:5, color:'bg-yellow-300', phase:'cambio-warmup', voiceInitial:null, voiceMidpoint:{time:2,text:WARMUP_STEPS[i+1].voice}, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    });
    const transitionVoice = nextPhaseIntro ? ` ${nextPhaseIntro}` : '';
    s.push({ label:'DESCANSO', seconds:20, color:'bg-rose-400', phase:'post-warmup', voiceInitial:`Descanso.${transitionVoice}`, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    return s;
};

const generateMainTrainingSegment = (ent, nextPhaseIntro=null, exerciseDifficulty='Intermedio') => {
    const s = [];
    const actionGroups = [];
    TRAINING_ZONES.forEach(zone => {
        for (let r=1; r<=ent.rounds; r++) actionGroups.push(zone);
    });
    const firstCycleExercises = createRandomExerciseSequence(
        EXERCISE_CATALOG,
        exerciseDifficulty,
        actionGroups
    );
    const selectedExercises = repeatExerciseSequenceForCycles(firstCycleExercises, ent.cycles);
    let exerciseIndex = 0;

    for (let cy=1; cy<=ent.cycles; cy++) {
        TRAINING_ZONES.forEach((zone, zi) => {
            for (let r=1; r<=ent.rounds; r++) {
                const exercise = selectedExercises[exerciseIndex++] || null;
                const exerciseName = exercise?.name || zone;
                s.push({
                    label:exerciseName,
                    description:exercise?.description || '',
                    exerciseGroup:zone,
                    exerciseDifficulty,
                    seconds:ent.action,
                    color:'bg-emerald-400',
                    phase:'entrenamiento',
                    r,
                    tr:ent.rounds,
                    cy,
                    tc:ent.cycles,
                    voiceInitial:exerciseName,
                    whistleOnStart:true,
                    voiceCountdown:true,
                    countdownChangeCue:true
                });
                if (r < ent.rounds)
                    s.push({ label:'CAMBIO', seconds:ent.change, color:'bg-yellow-300', phase:'cambio-ent', voiceInitial:null, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
            }
            if (zi < TRAINING_ZONES.length-1)
                s.push({ label:'DESCANSO', seconds:ent.zoneRest, color:'bg-sky-500', phase:'zone-rest', voiceInitial:'Descanso de zona', voiceMidpoint:{time:10,text:`Siguiente zona: ${TRAINING_ZONES[zi+1].toLowerCase()}`}, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
        });
        if (cy < ent.cycles)
            s.push({ label:'DESCANSO', seconds:ent.rest, color:'bg-rose-500', phase:'ciclo-rest', voiceInitial:`Descanso de ciclo. Queda ${ent.cycles-cy} ${ent.cycles-cy===1?'ciclo':'ciclos'}`, voiceMidpoint:{time:10,text:'Nuevo ciclo. Piernas.'}, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    }
    const transitionVoice = nextPhaseIntro ? ` ${nextPhaseIntro}` : '';
    s.push({ label:'DESCANSO', seconds:30, color:'bg-rose-400', phase:'post-training', voiceInitial:`Descanso.${transitionVoice}`, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    return s;
};

const generateGpsRunSegment = (activityTypeLabel, nextPhaseIntro=null) => {
    const s = [];
    s.push({ label:`INICIAR ${activityTypeLabel.toUpperCase()}`, seconds:4, color:'bg-gray-800', phase:GPS_PHASE_KEY, voiceInitial:getGpsStartAnnouncement(activityTypeLabel), whistleOnStart:true, voiceCountdown:false, countdownChangeCue:false });
    const transitionVoice = nextPhaseIntro ? ` ${nextPhaseIntro}` : '';
    s.push({ label:'DESCANSO (POST-GPS)', seconds:10, color:'bg-teal-400', phase:POST_GPS_REST_PHASE_KEY, voiceInitial:`Descanso.${transitionVoice}`, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    return s;
};

const generateStretchSegment = (ent, nextPhaseIntro=null) => {
    const s = [];
    s.push({ label:'DESCANSO', seconds:30, color:'bg-blue-200', phase:'pre-stretches', voiceInitial:'Descanso. Prepárate para los estiramientos', whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    for (let i=0; i<ent.stretchSteps; i++) {
        s.push({ label:`ESTIRAMIENTO ${i+1}`, seconds:ent.stretchAction, color:'bg-blue-400', phase:'estiramientos', voiceInitial:`Estiramiento ${i+1}`, whistleOnStart:true, voiceCountdown:true, countdownChangeCue:true });
        if (i < ent.stretchSteps-1)
            s.push({ label:'CAMBIO', seconds:ent.stretchChange, color:'bg-blue-200', phase:'cambio-est', voiceInitial:null, voiceMidpoint:{time:2,text:'Siguiente estiramiento'}, whistleOnStart:false, voiceCountdown:true, countdownChangeCue:false });
    }
    return s;
};

const SELECTABLE_PHASES = [
    { key: 'training', label: 'Entrenamiento principal', icon: '01', desc: 'Fuerza por zonas, rondas y ciclos' },
    { key: 'walk',     label: 'Caminata',                icon: '02', desc: 'Actividad guiada con seguimiento GPS' },
    { key: 'run',      label: 'Carrera',                 icon: '03', desc: 'Sesión de carrera con métricas GPS' },
    { key: 'stretch',  label: 'Movilidad y estiramiento',icon: '04', desc: 'Recuperación y trabajo de movilidad' },
];

const ALL_SEGMENT_GENERATORS = {
    warmup:   { key:'warmup',   generator: generateWarmupSegment },
    training: { key:'training', generator: generateMainTrainingSegment },
    walk:     { key:'walk',     generator: (ent, next) => generateGpsRunSegment('Caminata', next) },
    run:      { key:'run',      generator: (ent, next) => generateGpsRunSegment('Carrera', next) },
    stretch:  { key:'stretch',  generator: generateStretchSegment },
};

const generateWorkoutSteps = (workout, defaultParams, selectedPhasesKeys) => {
    if (!selectedPhasesKeys || selectedPhasesKeys.length === 0)
        return [{ label:'NO HAY FASES', seconds:5, color:'bg-red-500', phase:'error', voiceInitial:'No se seleccionó ninguna fase.', whistleOnStart:false, voiceCountdown:false }];
    if (!workout)
        return [{ label:'ERROR DE RUTINA', seconds:5, color:'bg-red-500', phase:'error', voiceInitial:'Error: Rutina no encontrada.', whistleOnStart:false, voiceCountdown:false }];

    const generateCustomSteps = (activity = workout, section = 'training') => {
        const config = activity.customActivity;
        const count = config.mode === 'cycles' ? config.cycles : 1;
        const customSteps = [];
        if (config.preparation > 0) customSteps.push({ label:'Preparación · ' + activity.name, seconds:Number(config.preparation), phase:'custom-preparation', sessionSection:section, color:'bg-yellow-700', voiceInitial:'Prepárate para ' + activity.name, voiceCountdown:true });
        for (let cycle = 1; cycle <= count; cycle++) {
            customSteps.push({ label:activity.name + (count > 1 ? ' · Ciclo ' + cycle + '/' + count : ''),
                seconds:config.mode === 'gps' ? 4 : config.seconds,
                ...(config.mode === 'gps' ? { activityType:section } : {}),
                color:'bg-emerald-700', phase:config.mode === 'gps' ? GPS_PHASE_KEY : 'entrenamiento',
                sessionSection:section, voiceInitial:activity.name + (count > 1 ? '. Ciclo ' + cycle : ''),
                whistleOnStart:true, voiceCountdown:config.mode !== 'gps' });
            if (cycle < count && config.rest > 0) customSteps.push({ label:'Descanso', seconds:config.rest,
                color:'bg-slate-800', phase:'custom-rest', sessionSection:section, voiceInitial:'Descanso', voiceCountdown:true });
        }
        return customSteps;
    };
    const ent = { ...defaultParams.entrenamiento, ...(workout.phases?.entrenamiento || {}) };

    const phasesToRun = ['warmup', ...selectedPhasesKeys]
        .filter((k, i, arr) => arr.indexOf(k) === i);

    let steps = [];
    const exerciseDifficulty = getWorkoutExerciseDifficulty(workout);

    for (let i = 0; i < phasesToRun.length; i++) {
        const key = phasesToRun[i];
        const custom = workout.sessionActivities?.find(activity => 'custom:' + activity.id === key);
        if (custom) { steps = steps.concat(generateCustomSteps(custom, key)); continue; }
        if (key === 'training' && workout.customActivity) {
            steps = steps.concat(generateCustomSteps());
            continue;
        }
        const segData = ALL_SEGMENT_GENERATORS[key];
        if (!segData) continue;

        const nextKey = phasesToRun[i + 1];
        let introForNext = null;
        if (nextKey) {
            const nextLabel = workout.sessionActivities?.find(a => 'custom:' + a.id === nextKey)?.name || SELECTABLE_PHASES.find(p => p.key === nextKey)?.label || nextKey;
            introForNext = `A continuación, ${nextLabel.toLowerCase()}.`;
        } else {
            introForNext = 'Rutina finalizada.';
        }

        const sessionSection = key === 'warmup' ? 'preparation' : key;
        const segmentSteps = segData.generator(ent, introForNext, exerciseDifficulty).map(step => ({
            ...step,
            sessionSection,
            ...((key === 'walk' || key === 'run') ? { activityType:key } : {})
        }));
        // El descanso final del entrenamiento ya prepara el inicio de los estiramientos.
        if (steps.at(-1)?.phase === 'post-training' && segmentSteps[0]?.phase === 'pre-stretches') {
            segmentSteps.shift();
        }
        steps = steps.concat(segmentSteps);
    }

    if (steps.length === 0)
        return [{ label:'ERROR DE GENERACIÓN', seconds:5, color:'bg-red-500', phase:'error', voiceInitial:'Error al generar la rutina.', whistleOnStart:false, voiceCountdown:false }];

    if (!workout.customActivity) steps.push({ label:'FINAL DE LA RUTINA', seconds:10, color:'bg-green-500', phase:'finished', voiceInitial:'Rutina finalizada.', whistleOnStart:false, voiceCountdown:false });
    return steps;
};

// ─── Componente para placeholder de anuncios ──────────────────────────────────
const AdBannerPlaceholder = () => React.createElement('div', {
    className: "p-4 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500",
    style: { minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
}, "Constancia · Técnica · Progreso");
// ──────────────────────────────────────────────────────────────────────────────

// ─── PhaseSelectionScreen ─────────────────────────────────────────────────────
function PhaseSelectionScreen({ onPhasesSelected, onConfigureTraining, onClearTrainingSelection, onCustomActivity, onEditActivity, initialSelectedPhases, selectedWorkout, workouts = [], onClose }) {
    const customActivities = uniqueCustomActivities(workouts, initialSelectedPhases || []);
    const availableKeys = new Set([...SELECTABLE_PHASES.map(p=>p.key), ...customActivities.map(w=>'custom:' + w.id)]);
    const [selectedPhases, setSelectedPhases] = useState([...new Set(initialSelectedPhases || [])].filter(key=>availableKeys.has(key)));

    const availablePhases = [...SELECTABLE_PHASES, ...customActivities.map(w => ({ key:'custom:' + w.id, label:w.name, icon:'★', desc:getWorkoutDurationText(w) }))];
    const togglePhase = (key) => {
        const change = getPhaseSelectionChange(selectedPhases, key);
        setSelectedPhases(change.selectedPhases);
        if (change.shouldClearWorkout) onClearTrainingSelection();
        if (change.shouldChooseWorkout) onConfigureTraining(change.selectedPhases);
    };

    const handleStart = () => {
        if (selectedPhases.length === 0) {
            speak('Por favor, elige al menos una fase.', true);
            return;
        }
        onPhasesSelected(selectedPhases);
    };

    const orderedPhases = [
        ...selectedPhases.map(key => availablePhases.find(phase => phase.key === key)).filter(Boolean),
        ...availablePhases.filter(phase => !selectedPhases.includes(phase.key))
    ];
    const movePhase = (key, position) => {
        setSelectedPhases(current => {
            const reordered = current.filter(item => item !== key);
            reordered.splice(position, 0, key);
            return reordered;
        });
    };

    return React.createElement('div', { className: "h-full min-h-0 flex flex-col bg-slate-950 overflow-hidden" },
        React.createElement('div', {
            className: "p-5 text-center shrink-0",
            style: { paddingTop: "max(3.5rem, calc(env(safe-area-inset-top) + 1rem))" }
        },
            React.createElement('div', { className: "w-full flex items-center justify-between mb-5" },
                React.createElement('button', {
                    type: "button",
                    onClick: onClose,
                    className: "min-h-11 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-[11px] font-black text-slate-200 active:scale-95"
                }, "Cerrar aplicación"),
                React.createElement('div', { className:"flex flex-col items-end gap-1" },
                    React.createElement('p', { className: "screen-kicker text-[10px] font-black uppercase tracking-widest" }, "Plan de entrenamiento"),
                    React.createElement('span', { className:"app-version" }, "VERSIÓN ", APP_VERSION)
                )
            ),
            React.createElement('h1', { className: "text-3xl font-black text-white leading-tight" }, "¿Qué haremos hoy?"),
            React.createElement('p', { className: "text-[11px] text-slate-400 mt-2 font-medium" }, "Selecciona tus actividades y cambia su posición con el control Orden de cada tarjeta. El calentamiento siempre va primero.")
        ),
        React.createElement('div', { className: "flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 py-2 space-y-3" },
            React.createElement('div', { className:'glass-card p-4 text-yellow-300 font-bold' }, 'Calentamiento obligatorio · Siempre primero'),
            React.createElement('button', { onClick:()=>onCustomActivity(selectedPhases), className:'w-full glass-card p-5 text-left font-bold text-sky-300' }, '+ Actividad personalizada · Nadar, montañismo, pesas…'),
            orderedPhases.map(phase =>
                React.createElement('div', {
                    key: phase.key,
                    onClick: () => togglePhase(phase.key),
                    className: `phase-card glass-card p-4 flex flex-wrap items-center gap-3 cursor-pointer ${selectedPhases.includes(phase.key) ? 'selected' : ''}`
                },
                    React.createElement('div', {
                        className: `w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedPhases.includes(phase.key) ? 'bg-orange-500 border-orange-500' : 'border-slate-600'}`
                    },
                        selectedPhases.includes(phase.key) && React.createElement('svg', { width:"12", height:"12", viewBox:"0 0 24 24", fill:"white" },
                            React.createElement('path', { d:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" })
                        )
                    ),
                    React.createElement('span', { className: "phase-icon" }, phase.icon),
                    React.createElement('div', { className: "flex-1 text-left" },
                        React.createElement('p', { className: "font-black uppercase italic text-sm text-white leading-tight" }, phase.label),
                        React.createElement('p', { className: "text-[10px] text-slate-500 mt-0.5" },
                            phase.key === 'training' && selectedWorkout
                                ? `Rutina elegida: ${selectedWorkout.name} · ${getWorkoutDurationText(selectedWorkout)} aprox.`
                                : phase.desc
                        )
                    ),
                    phase.key.startsWith('custom:') && React.createElement('button', { type:'button', className:'p-3 text-sky-300', onClick:event=>{ event.stopPropagation(); onEditActivity(workouts.find(w => 'custom:' + w.id === phase.key), selectedPhases); } }, 'Editar'),
                    selectedPhases.includes(phase.key) && React.createElement('label', {
                        className:'w-full flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm font-bold text-orange-300',
                        onClick:event=>event.stopPropagation()
                    }, 'Orden después del calentamiento',
                        React.createElement('select', {
                            'aria-label':'Orden de ' + phase.label,
                            value:selectedPhases.indexOf(phase.key),
                            className:'min-h-11 bg-slate-800 rounded-xl px-4 text-white',
                            onChange:event=>movePhase(phase.key, Number(event.target.value))
                        }, selectedPhases.map((_, position)=>React.createElement('option', { key:position, value:position }, (position + 1) + 'º')))
                    )
                )
            ),
            React.createElement('p', { className:'text-xs text-slate-400 py-2' }, 'Las actividades seleccionadas se realizan en el orden mostrado.')
        ),
        React.createElement('div', { className: "p-5 pb-10 shrink-0 space-y-3" },
            React.createElement(AdBannerPlaceholder, null), // Añadido el campo de anuncio aquí
            React.createElement('button', {
                onClick: handleStart,
                disabled: selectedPhases.length === 0,
                className: `w-full py-5 rounded-full font-black uppercase italic text-white transition-all active:scale-95 ${selectedPhases.length > 0 ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-slate-800 opacity-40 cursor-not-allowed'}`
            }, selectedPhases.length > 0 ? 'COMENZAR' : 'ELIGE AL MENOS UNA FASE')
        )
    );
}

// ─── MapDisplay ───────────────────────────────────────────────────────────────
const LEAFLET_ASSETS = [
    {
        css: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        js: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    },
    {
        css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
        js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
    },
    {
        css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
        js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
    }
];

const loadStylesheetOnce = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
};

const loadScriptOnce = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
        if (window.L) return resolve(window.L);
        // If script exists but L is not ready, it might be loading or failed. Remove and retry.
        document.querySelector(`script[src="${src}"]`).remove();
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = '';
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet no quedó disponible.'));
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
});

const ensureLeafletLoaded = () => {
    if (window.L) return Promise.resolve(window.L);
    if (window.__leafletLoadPromise) return window.__leafletLoadPromise; // Reuse existing promise

    // Try loading from multiple CDNs sequentially
    window.__leafletLoadPromise = LEAFLET_ASSETS.reduce((promise, asset) => {
        return promise.catch(() => {
            loadStylesheetOnce(asset.css);
            return loadScriptOnce(asset.js);
        });
    }, Promise.reject(new Error('Initial Leaflet load attempt'))).then(() => window.L);

    return window.__leafletLoadPromise;
};

function MapDisplay({ gpsCoordinates, currentLocation, isLiveTracking }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const polylineInstance = useRef(null);
    const currentMarker = useRef(null);
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const userMovingMapUntil = useRef(0);
    const renderedCoordinateCountRef = useRef(0);
    const [mapError, setMapError] = useState('');
    const [leafletReady, setLeafletReady] = useState(!!window.L);
    const mapFullyInitialized = useRef(false);

    const defaultCenter = [19.432608, -99.133209];
    const defaultZoom = 15;

    // Initialize map and setup resize observer
    useEffect(() => {
        if (!mapRef.current) return;
        let cleanupInterval;
        let initAttempted = false;

        const attemptMapInitialization = async () => {
            if (initAttempted || mapInstance.current) {
                clearInterval(cleanupInterval);
                return;
            }

            if (!window.L) {
                setMapError('Cargando mapa...');
                try {
                    await ensureLeafletLoaded();
                    setLeafletReady(true);
                    setMapError('');
                } catch (err) {
                    console.error('No se pudo cargar Leaflet:', err);
                    setMapError('No se pudo cargar el mapa. Revisa tu conexión.');
                    return; // Stop further attempts if Leaflet failed to load
                }
            } else if (!leafletReady) {
                setLeafletReady(true); // Leaflet became available externally
            }

            if (!window.L || !mapRef.current) return; // Re-check after potential load

            const container = mapRef.current;
            // Ensure container has visible dimensions
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                return; // Dimensions not ready, try again
            }

            initAttempted = true;
            clearInterval(cleanupInterval); // Clear interval once attempt is made

            try {
                const initCoords = (gpsCoordinates && gpsCoordinates.length > 0)
                    ? [gpsCoordinates[0].lat, gpsCoordinates[0].lng]
                    : (currentLocation ? [currentLocation.lat, currentLocation.lng] : defaultCenter);

                mapInstance.current = L.map(container, {
                    center: initCoords,
                    zoom: defaultZoom,
                    zoomControl: false,
                    attributionControl: false,
                    fadeAnimation: false,
                    zoomAnimation: false,
                    markerZoomAnimation: false,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap',
                    keepBuffer: 2,
                    updateWhenIdle: true,
                    updateWhenZooming: true,
                    crossOrigin: true,
                }).addTo(mapInstance.current);

                mapInstance.current.on('dragstart zoomstart', () => {
                    userMovingMapUntil.current = Date.now() + 10000;
                });

                L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);

                mapFullyInitialized.current = true;
                mapInstance.current.invalidateSize({ animate: false }); // Initial invalidation

                resizeObserverRef.current = new ResizeObserver(() => {
                    if (mapInstance.current) {
                        mapInstance.current.invalidateSize({ animate: false });
                    }
                });
                resizeObserverRef.current.observe(container);

            } catch (err) {
                console.error('Error inicializando mapa Leaflet:', err);
                setMapError('No se pudo inicializar el mapa.');
            }
        };

        // Attempt immediate initialization
        attemptMapInitialization();
        // Setup interval for retries until map is initialized
        cleanupInterval = setInterval(attemptMapInitialization, 200);

        return () => {
            clearInterval(cleanupInterval);
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                mapFullyInitialized.current = false;
                renderedCoordinateCountRef.current = 0;
            }
        };
    }, [leafletReady]);

    // Effect for updating map layers and view
    useEffect(() => {
        const map = mapInstance.current;
        if (!map || !mapFullyInitialized.current) return;

        const coords = gpsCoordinates || [];
        const firstLatLng = coords.length > 0 ? [coords[0].lat, coords[0].lng] : null;
        const lastCoordinate = coords.length > 0 ? coords[coords.length - 1] : null;

        // En vivo se agregan únicamente los puntos nuevos. Reconstruir toda la ruta
        // en cada lectura GPS hacía crecer el trabajo de forma cuadrática.
        if (coords.length > 1) {
            if (polylineInstance.current) {
                if (isLiveTracking && coords.length >= renderedCoordinateCountRef.current) {
                    coords.slice(renderedCoordinateCountRef.current).forEach(coordinate => {
                        polylineInstance.current.addLatLng([coordinate.lat, coordinate.lng]);
                    });
                } else {
                    polylineInstance.current.setLatLngs(coords.map(c => [c.lat, c.lng]));
                }
            } else {
                polylineInstance.current = L.polyline(coords.map(c => [c.lat, c.lng]), { color: '#f97316', weight: 5, opacity: 1.0 }).addTo(map);
            }
        } else if (polylineInstance.current) {
            map.removeLayer(polylineInstance.current);
            polylineInstance.current = null;
        }
        renderedCoordinateCountRef.current = coords.length;

        // Custom icon for markers
        const mkIcon = (color, size) => L.divIcon({
            className: '',
            html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.5);"></div>`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
        });

        // Update or create start marker
        if (firstLatLng) {
            if (startMarkerRef.current) {
                startMarkerRef.current.setLatLng(firstLatLng);
            } else {
                startMarkerRef.current = L.marker(firstLatLng, { icon: mkIcon('#EF4444', 16) }).addTo(map);
            }
        } else if (startMarkerRef.current) {
            map.removeLayer(startMarkerRef.current);
            startMarkerRef.current = null;
        }

        // Update or create end marker (only if not live tracking and more than 1 point)
        if (!isLiveTracking && coords.length > 1) {
            const lastLatLng = [lastCoordinate.lat, lastCoordinate.lng];
            if (endMarkerRef.current) {
                endMarkerRef.current.setLatLng(lastLatLng);
            } else {
                endMarkerRef.current = L.marker(lastLatLng, { icon: mkIcon('#4ADE80', 16) }).addTo(map);
            }
        } else if (endMarkerRef.current) {
            map.removeLayer(endMarkerRef.current);
            endMarkerRef.current = null;
        }

        // Update or create current location marker (only for live tracking)
        if (currentLocation && isLiveTracking) {
            const currentLatLng = [currentLocation.lat, currentLocation.lng];
            if (currentMarker.current) {
                currentMarker.current.setLatLng(currentLatLng);
            } else {
                currentMarker.current = L.marker(currentLatLng, { icon: mkIcon('#60A5FA', 14), zIndexOffset: 1000 }).addTo(map);
            }
            if (Date.now() > userMovingMapUntil.current) {
                map.setView(currentLatLng, map.getZoom() || defaultZoom, { animate: false });
            }
        } else if (currentMarker.current) {
            map.removeLayer(currentMarker.current);
            currentMarker.current = null;
        }

        // Fit bounds or set view based on state
        if (!isLiveTracking && coords.length > 1 && polylineInstance.current) {
            map.fitBounds(polylineInstance.current.getBounds(), { padding: [50, 50], animate: false });
        } else if (!isLiveTracking && coords.length === 0) {
            map.setView(defaultCenter, defaultZoom, { animate: false });
        }

    }, [gpsCoordinates, currentLocation, isLiveTracking, leafletReady]);

    // Re-invalidate size on app resume or visibility change
    useEffect(() => {
        const handleResume = () => {
            if (mapInstance.current) {
                mapInstance.current.invalidateSize({ animate: false });
            }
        };
        window.addEventListener('pageshow', handleResume);
        window.addEventListener('focus', handleResume);
        document.addEventListener('visibilitychange', handleResume);
        window.addEventListener('mientrenador-resume', handleResume);
        return () => {
            window.removeEventListener('pageshow', handleResume);
            window.removeEventListener('focus', handleResume);
            document.removeEventListener('visibilitychange', handleResume);
            window.removeEventListener('mientrenador-resume', handleResume);
        };
    }, []);

    return React.createElement('div', {
        className: 'leaflet-map-wrapper', // Height is now controlled by parent's CSS (e.g., flex-1)
    },
        mapError && React.createElement('div', {
            className: 'absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900 text-center text-xs font-bold text-orange-300 p-4'
        }, mapError),
        React.createElement('div', {
            ref: mapRef,
            className: 'leaflet-map-inner',
        })
    );
}

// ─── GpsActivityDisplay ───────────────────────────────────────────────────────
function GpsActivityDisplay({ gpsCoordinates, finalGpsSummary, onSave, onShare, onClose, showMap = true }) {
    const handleSave = useCallback(() => {
        alert(`Guardando resumen de actividad:\nDistancia: ${finalGpsSummary.distanceText}\nTiempo: ${finalGpsSummary.timeText}\nRitmo: ${finalGpsSummary.pace} /km\nVelocidad: ${finalGpsSummary.speed}`);
        speak('Resumen guardado.');
        if (onSave) onSave();
    }, [finalGpsSummary, onSave]);

    const handleShare = useCallback(() => {
        if (!navigator.share) { alert('Compartir no disponible en este dispositivo.'); return; }
        try {
            navigator.share({
                title: 'Mi ruta de entrenamiento',
                text: `¡Mi actividad de hoy!\nDistancia: ${finalGpsSummary.distanceText}\nTiempo: ${finalGpsSummary.timeText}\nRitmo: ${finalGpsSummary.pace} /km\nVelocidad: ${finalGpsSummary.speed}`
            });
            if (onShare) onShare();
        } catch (err) {
            if (err.name !== 'AbortError') alert('No se pudo compartir.');
        }
    }, [finalGpsSummary, onShare]);

    if (!finalGpsSummary) return null;

    return React.createElement('div', { className: "h-screen flex flex-col bg-slate-950 text-white p-6" },
        React.createElement('h2', { className: "text-3xl font-black italic text-orange-500 mb-4 text-center" }, "Tu Actividad GPS"),
        React.createElement('div', { className: "glass-card p-4 mb-4 flex-1 flex flex-col min-h-0" }, /* Added flex-1 flex flex-col min-h-0 */
            showMap && gpsCoordinates && gpsCoordinates.length > 0 &&
                React.createElement(MapDisplay, {
                    gpsCoordinates,
                    isLiveTracking: false,
                }),
            React.createElement('div', { className: "grid grid-cols-2 gap-4 text-center mt-4 shrink-0" }, /* Added shrink-0 */
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Distancia"), React.createElement('span', { className: "text-xl font-black text-sky-400" }, finalGpsSummary.distanceText)),
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Tiempo"), React.createElement('span', { className: "text-xl font-black text-emerald-400" }, finalGpsSummary.timeText)),
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Ritmo"), React.createElement('span', { className: "text-xl font-black text-purple-400" }, finalGpsSummary.pace, " /km")),
                React.createElement('div', null, React.createElement('span', { className : "text-[9px] opacity-40 block uppercase" }, "Velocidad"), React.createElement('span', { className: "text-xl font-black text-yellow-400" }, finalGpsSummary.speed))
            )
        ),
        React.createElement('div', { className: "flex gap-4 mb-4 shrink-0" }, /* Added shrink-0 */
            React.createElement('button', { onClick: handleSave, className: "flex-1 bg-white/10 text-white py-4 rounded-full font-black uppercase italic active:scale-95 text-xs flex items-center justify-center gap-2" }, React.createElement(IconSave), "GUARDAR"),
            React.createElement('button', { onClick: handleShare, className: "flex-1 bg-white/10 text-white py-4 rounded-full font-black uppercase italic active:scale-95 text-xs flex items-center justify-center gap-2" }, React.createElement(IconShare), "COMPARTIR")
        ),
        React.createElement('button', { onClick: onClose, className: "w-full bg-orange-500 py-6 rounded-full font-black uppercase text-white active:scale-95 italic mt-auto shrink-0" }, "FINALIZAR") /* Added shrink-0 */
    );
}

// ─── PlayerView ─────────────────────────────────────────────────────────────────
function PlayerView({ workout, selectedPhases, userId, restoredSession, onExit, onComplete }) {
    const [uiStatus, setUiStatus] = useState('ready');
    const [uiIdx, setUiIdx] = useState(0);
    const [uiTimeLeft, setUiTimeLeft] = useState(0);
    const [uiElapsed, setUiElapsed] = useState(0);
    const [steps, setSteps] = useState([]);
    const [isGpsActive, setIsGpsActive] = useState(false);
    const [gpsCoordinates, setGpsCoordinates] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [liveGpsMetrics, setLiveGpsMetrics] = useState({ distance:0, time:0 });
    const [hasGpsData, setHasGpsData] = useState(false);
    const [finalGpsSummary, setFinalGpsSummary] = useState(null);
    const [shouldAutoStart, setShouldAutoStart] = useState(false);
    const [showGpsResults, setShowGpsResults] = useState(false);
    // Altura del mapa GPS en vivo calculada dinámicamente
    // const [gpsMapHeight, setGpsMapHeight] = useState(0); // REMOVED
    const gpsScreenRef = useRef(null);

    const statusRef = useRef(uiStatus);
    const idxRef = useRef(uiIdx);
    const timeLeftRef = useRef(uiTimeLeft);
    const elapsedRef = useRef(uiElapsed);
    const stepsRef = useRef([]);
    const stepDurRef = useRef(0);
    const stepStartRef = useRef(null);
    const workoutStartRef = useRef(null);
    const pausedAtRef = useRef(null);
    const savedRef = useRef(false);
    const savingRef = useRef(false);
    const [savingResult, setSavingResult] = useState(false);
    const [saveError, setSaveError] = useState('');
    const resultIdRef = useRef(restoredSession?.resultId || crypto.randomUUID());
    const spokenInit = useRef({});
    const lastSpokenKey = useRef('');
    const nextActivitySpeech = useRef(null);
    const wakeLockRef = useRef(null);
    const gpsWatcherId = useRef(null);
    const lastPosition = useRef(null);
    const gpsLastFixTime = useRef(0);
    const gpsFeedbackRef = useRef({ distance:0, time:0, key:null });
    const [gpsSignalText, setGpsSignalText] = useState('Buscando señal GPS…');
    const gpsStartTime = useRef(null);
    const gpsAnnounceLastTime = useRef(0);
    const gpsTotalDistance = useRef(0);
    const gpsTotalTime = useRef(0);
    const gpsActivityTimesRef = useRef({ walk:0, run:0, training:0 });
    const gpsCoordinatesRef = useRef([]);
    const currentLocationRef = useRef(null);
    const finalGpsSummaryRef = useRef(null);
    const hasGpsDataRef = useRef(hasGpsData);
    const isGpsActiveRef = useRef(isGpsActive);
    const gpsStartingRef = useRef(false);
    const gpsStoppingRef = useRef(false);
    const stopGpsTrackingRef = useRef();
    const intervalIdRef = useRef(null);
    const gpsAnnounceIntervalRef = useRef(null);
    const pendingGpsRestoreRef = useRef(null);

    useEffect(() => { statusRef.current = uiStatus; }, [uiStatus]);
    useEffect(() => { idxRef.current = uiIdx; }, [uiIdx]);
    useEffect(() => { timeLeftRef.current = uiTimeLeft; }, [uiTimeLeft]);
    useEffect(() => { elapsedRef.current = uiElapsed; }, [uiElapsed]);
    useEffect(() => { hasGpsDataRef.current = hasGpsData; }, [hasGpsData]);
    useEffect(() => { isGpsActiveRef.current = isGpsActive; }, [isGpsActive]);

    const setTime = useCallback((t) => { setUiTimeLeft(isNaN(t) ? 0 : t); }, []);
    const setElap = useCallback((e) => { setUiElapsed(isNaN(e) ? 0 : e); }, []);
    const setStatus = useCallback((status) => { statusRef.current = status; setUiStatus(status); }, []);

    const persistSession = useCallback((statusOverride = null) => {
        const status = statusOverride || statusRef.current;
        if (savedRef.current || !userId || !workout || !stepsRef.current.length || status === 'ready') return;
        writeActiveSession({
            version: 1,
            resultId: resultIdRef.current,
            userId,
            workout,
            selectedPhases,
            steps: stepsRef.current,
            status,
            idx: idxRef.current,
            timeLeft: timeLeftRef.current,
            elapsed: elapsedRef.current,
            workoutStartAt: workoutStartRef.current,
            stepStartAt: stepStartRef.current,
            pausedAt: pausedAtRef.current,
            hasGpsData: hasGpsDataRef.current,
            finalGpsSummary: finalGpsSummaryRef.current,
            gps: {
                active: isGpsActiveRef.current,
                coordinates: gpsCoordinatesRef.current,
                currentLocation: currentLocationRef.current,
                lastPosition: lastPosition.current,
                startTime: gpsStartTime.current,
                lastAnnouncementTime: gpsAnnounceLastTime.current,
                totalDistance: gpsTotalDistance.current,
                totalTime: gpsTotalTime.current,
                activityTimes: gpsActivityTimesRef.current
            },
            savedAt: Date.now()
        });
    }, [userId, workout, selectedPhases]);

    useEffect(() => {
        const saveIfActive = () => {
            if (['running', 'paused', 'gps-running', 'finished'].includes(statusRef.current)) persistSession();
        };
        const persistInterval = setInterval(saveIfActive, 5000);
        const handleBeforeUnload = () => saveIfActive();
        const handleHidden = () => { if (document.hidden) saveIfActive(); };
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleHidden);
        return () => {
            clearInterval(persistInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleHidden);
        };
    }, [persistSession]);

    // REMOVED useEffect for gpsMapHeight

    const announceGpsStats = useCallback((distance, timeSec) => {
        speak(getGpsSummarySpeech(distance, timeSec), false);
    }, []);

    const handleSpeech = useCallback((step, stepIdx, remaining) => {
        if (statusRef.current !== 'running' && statusRef.current !== 'gps-running') return;
        const initKey = `${stepIdx}_init`;
        const nextActivity = getRestNextActivity(stepsRef.current, stepIdx);
        // Los descansos consecutivos comparten aviso; anunciar la actividad solo al final.
        const continuesStretchRest = step.phase === 'pre-stretches' && nextActivity &&
            getRestNextActivity(stepsRef.current, stepIdx - 1)?.stepIndex === nextActivity.stepIndex;
        const announcedAhead = nextActivitySpeech.current?.stepIndex === stepIdx;
        if (remaining === step.seconds && step.voiceInitial && !continuesStretchRest && !announcedAhead && !spokenInit.current[initKey] && statusRef.current === 'running') {
            speak(step.voiceInitial, false); if (step.whistleOnStart) navigator.vibrate?.(150); spokenInit.current[initKey] = true;
        }
        if (nextActivity?.stepIndex === stepIdx + 1 && remaining <= Math.min(5, step.seconds) && nextActivitySpeech.current?.sourceIndex !== stepIdx) {
            const announcement = { ...nextActivity, sourceIndex:stepIdx, pending:true };
            nextActivitySpeech.current = announcement;
            speak(nextActivity.text, true, () => { announcement.pending = false; });
        }
        const countdownAnnouncement = getCountdownAnnouncement(remaining, step.voiceCountdown && !nextActivity, step.countdownChangeCue === true);
        const isCountdown = nextActivity ? remaining <= 5 : step.voiceCountdown && remaining > 0 && remaining <= 3;
        if (step.voiceMidpoint && remaining === step.voiceMidpoint.time && !isCountdown) {
            const k = `${stepIdx}_mid_${remaining}`; if (lastSpokenKey.current !== k) { speak(step.voiceMidpoint.text, true); lastSpokenKey.current = k; }
        }
        if (countdownAnnouncement) {
            const k = `${stepIdx}_countdown`; if (lastSpokenKey.current !== k) { speak(countdownAnnouncement, true); lastSpokenKey.current = k; }
        }
        if (step.whistleOnStart && remaining === step.seconds && statusRef.current === 'running' && step.phase !== GPS_PHASE_KEY && !spokenInit.current[initKey+'_whistle']) {
            whistle(); spokenInit.current[initKey+'_whistle'] = true;
        }
    }, []);

    const endWorkout = useCallback(() => {
        if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; }
        const now = Date.now();
        const finalElapsed = workoutStartRef.current
            ? Math.max(0, Math.floor((now - workoutStartRef.current) / 1000))
            : elapsedRef.current;
        elapsedRef.current = finalElapsed;
        setElap(finalElapsed);
        setStatus('finished');
        setTimeout(() => persistSession('finished'), 0);
        speak('Entrenamiento finalizado. Revisa el resumen de tus actividades.', true);
    }, [persistSession, setElap, setStatus]);

    const advanceToStep = useCallback((nextIdx) => {
        const s = stepsRef.current;
        if (nextIdx >= s.length) { endWorkout(); return false; }
        idxRef.current = nextIdx; stepDurRef.current = s[nextIdx].seconds; timeLeftRef.current = s[nextIdx].seconds;
        stepStartRef.current = Date.now(); lastSpokenKey.current = ''; spokenInit.current = {};
        setUiIdx(nextIdx); setTime(s[nextIdx].seconds);
        return true;
    }, [endWorkout, setTime]);

    const stopGpsTracking = useCallback(async (isSkip=false, targetIndex=null) => {
        if (gpsStoppingRef.current) return;
        gpsStoppingRef.current = true;
        gpsStartingRef.current = false;
        if (gpsWatcherId.current) {
            const watcher = gpsWatcherId.current; gpsWatcherId.current = null;
            try { await clearLocationWatch(watcher); }
            catch (error) { console.error('No se pudo cerrar el seguimiento nativo', error); }
        }
        if (gpsAnnounceIntervalRef.current) { clearInterval(gpsAnnounceIntervalRef.current); gpsAnnounceIntervalRef.current = null; }
        const finalDistance = gpsTotalDistance.current, finalTime = gpsTotalTime.current;
        const finalCoordinates = gpsCoordinatesRef.current;
        const currentActivityType = stepsRef.current[idxRef.current]?.activityType;
        if ((['walk', 'run', 'training'].includes(currentActivityType) || currentActivityType?.startsWith('custom:')) && finalTime > 0) {
            gpsActivityTimesRef.current = {
                ...gpsActivityTimesRef.current,
                [currentActivityType]:(gpsActivityTimesRef.current[currentActivityType] || 0) + finalTime
            };
        }
        setLiveGpsMetrics({ distance:finalDistance, time:finalTime });
        const hasUsableGpsData = finalDistance > 0 && finalTime > 0 && finalCoordinates.length > 1;
        if (hasUsableGpsData) {
            setHasGpsData(true);
            hasGpsDataRef.current = true;
            const summary = {
                distance: finalDistance,
                time: finalTime,
                distanceText: formatDistance(finalDistance),
                timeText: formatTime(finalTime),
                pace: formatPace(finalDistance,finalTime),
                speed: formatSpeed(finalDistance,finalTime)
            };
            finalGpsSummaryRef.current = summary;
            setFinalGpsSummary(summary);
        } else {
            setHasGpsData(false);
            hasGpsDataRef.current = false;
            finalGpsSummaryRef.current = null;
            setFinalGpsSummary(null);
        }
        persistSession('gps-running');
        
        let finishedStopFlow = false;
        const finishStopFlow = () => {
            if (finishedStopFlow) return;
            finishedStopFlow = true;
            if (finalDistance > 0 && finalTime > 0) announceGpsStats(finalDistance, finalTime);
            setIsGpsActive(false);
            isGpsActiveRef.current = false;
            setCurrentLocation(null);
            currentLocationRef.current = null;

            const nextStepIndex = targetIndex ?? idxRef.current + 1;
            if (nextStepIndex >= stepsRef.current.length) {
                endWorkout();
            } else {
                setStatus('running');
                if (advanceToStep(nextStepIndex) && stepsRef.current[nextStepIndex]?.phase !== GPS_PHASE_KEY) {
                    handleSpeech(stepsRef.current[nextStepIndex], nextStepIndex, stepsRef.current[nextStepIndex].seconds);
                }
                setTimeout(() => persistSession('running'), 0);
            }
        };
        speak('Seguimiento finalizado.', true, finishStopFlow);
        setTimeout(finishStopFlow, 1200);
    }, [advanceToStep, announceGpsStats, endWorkout, handleSpeech, persistSession, setStatus]);

    useEffect(() => { stopGpsTrackingRef.current = stopGpsTracking; }, [stopGpsTracking]);

    const skipStep = useCallback(() => {
        if (statusRef.current === 'finished' || gpsStartingRef.current || (isGpsActiveRef.current && gpsStoppingRef.current) || stepsRef.current.length === 0) return;
        const currentStep = stepsRef.current[idxRef.current];
        if (currentStep.phase === GPS_PHASE_KEY && isGpsActiveRef.current) { stopGpsTrackingRef.current(true); return; }
        stepsRef.current = stepsRef.current.map((step, i) => i === idxRef.current
            ? { ...step, performedSeconds:Math.max(0, step.seconds - timeLeftRef.current) } : step);
        setSteps(stepsRef.current);
        nextActivitySpeech.current = null;
        const next = idxRef.current + 1;
        if (advanceToStep(next)) {
            speak('Saltando.', true);
            if (stepsRef.current[next]?.phase !== GPS_PHASE_KEY) handleSpeech(stepsRef.current[next], next, stepsRef.current[next].seconds);
        } else { endWorkout(); }
    }, [endWorkout, advanceToStep, handleSpeech]);

    const finishPhase = useCallback(() => {
        if (statusRef.current === 'finished' || gpsStartingRef.current || (isGpsActiveRef.current && gpsStoppingRef.current)) return;
        const index = idxRef.current;
        const next = getNextSessionSectionIndex(stepsRef.current, index, selectedPhases);
        // Count only time actually performed, including when restoring this session.
        stepsRef.current = stepsRef.current.map((step, i) => i >= index && i < next
            ? { ...step, performedSeconds:i === index ? Math.max(0, step.seconds - timeLeftRef.current) : 0 }
            : step);
        setSteps(stepsRef.current);
        nextActivitySpeech.current = null;
        if (isGpsActiveRef.current) { stopGpsTrackingRef.current(true, next); return; }
        speak('Etapa finalizada.', true);
        if (advanceToStep(next)) {
            if (stepsRef.current[next]?.phase === 'finished') endWorkout();
            else handleSpeech(stepsRef.current[next], next, stepsRef.current[next].seconds);
        }
        setTimeout(() => persistSession(), 0);
    }, [selectedPhases, advanceToStep, endWorkout, handleSpeech, persistSession]);

    const startGpsTracking = useCallback(async (restoredGps = null) => {
        if (gpsStartingRef.current || isGpsActiveRef.current) return;
        const isRestore = !!restoredGps?.active;
        gpsStartingRef.current = true;
        if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; }
        if (!isNativeRuntime() && !('geolocation' in navigator)) { gpsStartingRef.current = false; speak('Geolocalización no disponible.', true); setIsGpsActive(false); setStatus('running'); skipStep(); return; }
        if (!isNativeRuntime() && navigator.permissions && navigator.permissions.query) {
            try {
                const perm = await navigator.permissions.query({name:'geolocation'});
                if (perm.state === 'denied') { gpsStartingRef.current = false; speak('Permiso de ubicación denegado.', true); setIsGpsActive(false); setStatus('running'); skipStep(); return; }
            } catch(e) {
                console.warn('No se pudo consultar el permiso de ubicación. Se solicitará al iniciar el GPS.', e);
            }
        }
        speak(
            isRestore
                ? 'Seguimiento recuperado. Te informaré del avance y de la señal GPS.'
                : 'Iniciando seguimiento. Te informaré del avance y de la señal GPS.',
            true,
            () => {
                if (!isRestore || !gpsAnnounceLastTime.current) gpsAnnounceLastTime.current = Date.now();
            }
        );
        setIsGpsActive(true); setStatus('gps-running');
        isGpsActiveRef.current = true;
        gpsStartingRef.current = false;
        gpsStoppingRef.current = false;
        gpsStartTime.current = isRestore && restoredGps.startTime ? restoredGps.startTime : Date.now();
        lastPosition.current = isRestore ? restoredGps.lastPosition || null : null;
        gpsAnnounceLastTime.current = isRestore ? restoredGps.lastAnnouncementTime || gpsStartTime.current : Date.now();
        gpsTotalDistance.current = isRestore ? Number(restoredGps.totalDistance) || 0 : 0;
        gpsTotalTime.current = isRestore ? Number(restoredGps.totalTime) || 0 : 0;
        gpsLastFixTime.current = 0;
        gpsFeedbackRef.current = { distance:gpsTotalDistance.current, time:gpsTotalTime.current, key:null };
        setGpsSignalText('Buscando señal GPS…');
        setLiveGpsMetrics({ distance:gpsTotalDistance.current, time:gpsTotalTime.current });
        const restoredCoordinates = isRestore && Array.isArray(restoredGps.coordinates) ? restoredGps.coordinates : [];
        gpsCoordinatesRef.current = restoredCoordinates;
        setGpsCoordinates(restoredCoordinates);
        currentLocationRef.current = isRestore ? restoredGps.currentLocation || null : null;
        setCurrentLocation(currentLocationRef.current);
        setHasGpsData(false); hasGpsDataRef.current = false;
        setFinalGpsSummary(null); finalGpsSummaryRef.current = null;
        persistSession('gps-running');
        if (gpsAnnounceIntervalRef.current) { clearInterval(gpsAnnounceIntervalRef.current); gpsAnnounceIntervalRef.current = null; }
        gpsAnnounceIntervalRef.current = setInterval(() => {
            if (statusRef.current !== 'gps-running' || gpsStoppingRef.current) return;
            if (isNativeRuntime()) return;
            resumeVoice();
            const now = Date.now();
            const currentGpsTotalTime = Math.floor((now - (gpsStartTime.current || now)) / 1000);
            gpsTotalTime.current = currentGpsTotalTime;
            setLiveGpsMetrics({ distance:gpsTotalDistance.current, time:currentGpsTotalTime });
            const hasSignal = gpsLastFixTime.current && now - gpsLastFixTime.current <= 15000;
            setGpsSignalText(hasSignal ? 'GPS con señal reciente' : 'Señal GPS insuficiente; no se puede confirmar el avance');
            const previous = gpsFeedbackRef.current;
            const distance = gpsTotalDistance.current;
            const milestone = distance - previous.distance >= 100 && now - gpsAnnounceLastTime.current >= 30000;
            if (milestone || now - gpsAnnounceLastTime.current >= GPS_ANNOUNCEMENT_INTERVAL_MS) {
                const feedback = getGpsFeedback({ now, lastFixTime:gpsLastFixTime.current, distance,
                    previousDistance:previous.distance, time:currentGpsTotalTime, previousTime:previous.time });
                if (feedback.key === 'progress' || feedback.key !== previous.key) speak(feedback.text, false);
                gpsFeedbackRef.current = { distance, time:currentGpsTotalTime, key:feedback.key };
                gpsAnnounceLastTime.current = now;
            }
        }, 1000);
        try {
            const watcher = await startLocationWatch(
                (position) => {
                if (position.nativeState) {
                    const state = position.nativeState;
                    gpsTotalDistance.current = state.distance;
                    gpsTotalTime.current = state.time;
                    gpsLastFixTime.current = state.lastFixTime;
                    gpsCoordinatesRef.current = state.coordinates;
                    setGpsCoordinates(state.coordinates);
                    const location = state.coordinates.at(-1) || null;
                    currentLocationRef.current = location; setCurrentLocation(location);
                    setLiveGpsMetrics({ distance:state.distance, time:state.time });
                    setGpsSignalText(state.error || (state.lastFixTime && Date.now() - state.lastFixTime <= 15000
                        ? 'Seguimiento nativo activo · señal reciente'
                        : 'Señal GPS insuficiente; no se puede confirmar el avance'));
                    return;
                }
                if (!isGpsActiveRef.current || gpsStoppingRef.current) return;
                const {latitude, longitude, accuracy} = position.coords;
                const now = Date.now();
                const point = { latitude, longitude, accuracy, timestamp:position.timestamp || now };
                const sample = evaluateGpsPosition(lastPosition.current, point, now);
                if (!sample.valid) return;
                gpsLastFixTime.current = point.timestamp;
                const currentGpsTotalTime = Math.max(0, Math.floor((now - (gpsStartTime.current || now)) / 1000));
                gpsTotalTime.current = currentGpsTotalTime;
                gpsTotalDistance.current += sample.distance;
                lastPosition.current = sample.anchor;
                setLiveGpsMetrics({ distance:gpsTotalDistance.current, time:currentGpsTotalTime });
                const newCoord = {lat:latitude, lng:longitude, accuracy, timestamp:now};
                setGpsCoordinates(prev => {
                    const nextCoordinates = [...prev, newCoord];
                    gpsCoordinatesRef.current = nextCoordinates;
                    return nextCoordinates;
                });
                setCurrentLocation(newCoord);
                currentLocationRef.current = newCoord;


                },
                (error) => { gpsStartingRef.current = false; speak(`Error de GPS: ${error.message || error}.`, true); stopGpsTrackingRef.current(); },
                { startTime:gpsStartTime.current, distance:gpsTotalDistance.current, coordinates:gpsCoordinatesRef.current }
            );
            if (!isGpsActiveRef.current || gpsStoppingRef.current) { if (watcher) clearLocationWatch(watcher); }
            else gpsWatcherId.current = watcher;
        } catch (err) {
            gpsStartingRef.current = false;
            speak(`Error de GPS: ${err.message}.`, true);
            stopGpsTrackingRef.current();
        }
    }, [skipStep, announceGpsStats, persistSession, setElap, setStatus]);

    const togglePlay = useCallback(() => {
        if (!workout || stepsRef.current.length === 0) return;
        requestAppFullscreen();
        resumeVoice();
        const current = statusRef.current;
        if (current === 'ready') {
            const now = Date.now(); workoutStartRef.current = now; stepStartRef.current = now; setStatus('running');
            setTimeout(() => persistSession('running'), 0);
        } else if (current === 'running') {
            pausedAtRef.current = Date.now(); setStatus('paused');
            setTimeout(() => persistSession('paused'), 0);
        } else if (current === 'paused') {
            const now = Date.now();
            const pausedMs = pausedAtRef.current ? now - pausedAtRef.current : 0;
            workoutStartRef.current = (workoutStartRef.current != null && !isNaN(workoutStartRef.current)) ? workoutStartRef.current + pausedMs : now;
            stepStartRef.current = (stepStartRef.current != null && !isNaN(stepStartRef.current)) ? stepStartRef.current + pausedMs : now;
            pausedAtRef.current = null; setStatus('running');
        } else if (current === 'gps-running') {
            speak('Para detener el GPS usa el botón dedicado.', true);
        }
    }, [workout, persistSession, setStatus]);

    const releaseWake = useCallback(() => {
        if (wakeLockRef.current) { wakeLockRef.current.release().then(()=>wakeLockRef.current=null).catch(()=>{}); }
    }, []);
    const requestWake = useCallback(async () => {
        try {
            if ((statusRef.current === 'running' || statusRef.current === 'gps-running') && 'wakeLock' in navigator && !wakeLockRef.current)
                wakeLockRef.current = await navigator.wakeLock.request('screen');
            else if (statusRef.current !== 'running' && statusRef.current !== 'gps-running' && wakeLockRef.current) releaseWake();
        } catch(e) {}
    }, [releaseWake]);

    useEffect(() => { if (uiStatus === 'running' || uiStatus === 'gps-running') requestWake(); else releaseWake(); return releaseWake; }, [uiStatus, requestWake, releaseWake]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                if (statusRef.current === 'running') { pausedAtRef.current = Date.now(); setStatus('paused'); }
                if (statusRef.current !== 'gps-running') releaseWake();
            } else {
                resumeVoice();
                window.dispatchEvent(new Event('mientrenador-resume'));
                setTimeout(() => window.dispatchEvent(new Event('mientrenador-resume')), 300);
                if (statusRef.current === 'gps-running') requestWake();
                if (statusRef.current === 'paused' && pausedAtRef.current !== null) {
                    const hiddenMs = Date.now() - pausedAtRef.current;
                    workoutStartRef.current = (workoutStartRef.current!=null&&!isNaN(workoutStartRef.current)) ? workoutStartRef.current+hiddenMs : Date.now();
                    stepStartRef.current = (stepStartRef.current!=null&&!isNaN(stepStartRef.current)) ? stepStartRef.current+hiddenMs : Date.now();
                    pausedAtRef.current = null; setStatus('running');
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [releaseWake, requestWake, setStatus]);

    useEffect(() => {
        setStatus('ready'); setUiIdx(0); setElap(0); setTime(0);
        savedRef.current = false; spokenInit.current = {}; lastSpokenKey.current = '';
        nextActivitySpeech.current = null;
        workoutStartRef.current = null; stepStartRef.current = null; pausedAtRef.current = null;
        setShowGpsResults(false);
        setGpsCoordinates([]); gpsCoordinatesRef.current = [];
        setCurrentLocation(null); currentLocationRef.current = null;
        setLiveGpsMetrics({ distance:0, time:0 });
        gpsActivityTimesRef.current = { walk:0, run:0, training:0 };
        gpsStartingRef.current = false;
        gpsStoppingRef.current = false;
        setHasGpsData(false); hasGpsDataRef.current = false;
        setFinalGpsSummary(null); finalGpsSummaryRef.current = null;
        setShouldAutoStart(false); setIsGpsActive(false); isGpsActiveRef.current = false;
        pendingGpsRestoreRef.current = null;
        if (gpsWatcherId.current) { clearLocationWatch(gpsWatcherId.current); gpsWatcherId.current = null; }
        if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; }
        if (gpsAnnounceIntervalRef.current) { clearInterval(gpsAnnounceIntervalRef.current); gpsAnnounceIntervalRef.current = null; }
        if (!workout || !selectedPhases) { setSteps([]); return; }

        const canRestore = restoredSession
            && restoredSession.userId === userId
            && restoredSession.workout?.id === workout.id
            && Array.isArray(restoredSession.steps)
            && Date.now() - Number(restoredSession.savedAt || 0) < 24 * 60 * 60 * 1000;
        const generated = canRestore
            ? restoredSession.steps
            : generateWorkoutSteps(workout, DEFAULT_PARAMS, selectedPhases);
        stepsRef.current = generated; setSteps(generated);
        if (generated.length === 0 || generated[0].phase === 'error') return;

        if (canRestore) {
            const restoredIdx = Math.min(Math.max(0, Number(restoredSession.idx) || 0), generated.length - 1);
            const restoredStep = generated[restoredIdx];
            idxRef.current = restoredIdx; setUiIdx(restoredIdx);
            stepDurRef.current = restoredStep.seconds;
            timeLeftRef.current = Math.max(0, Number(restoredSession.timeLeft) || 0); setTime(timeLeftRef.current);
            elapsedRef.current = Math.max(0, Number(restoredSession.elapsed) || 0); setElap(elapsedRef.current);
            workoutStartRef.current = Number(restoredSession.workoutStartAt) || Date.now();
            stepStartRef.current = Number(restoredSession.stepStartAt) || Date.now();
            pausedAtRef.current = Number(restoredSession.savedAt) || Date.now();

            const restoredCoordinates = Array.isArray(restoredSession.gps?.coordinates) ? restoredSession.gps.coordinates : [];
            gpsCoordinatesRef.current = restoredCoordinates; setGpsCoordinates(restoredCoordinates);
            currentLocationRef.current = restoredSession.gps?.currentLocation || null; setCurrentLocation(currentLocationRef.current);
            lastPosition.current = restoredSession.gps?.lastPosition || null;
            gpsStartTime.current = Number(restoredSession.gps?.startTime) || null;
            gpsAnnounceLastTime.current = Number(restoredSession.gps?.lastAnnouncementTime) || 0;
            gpsTotalDistance.current = Number(restoredSession.gps?.totalDistance) || 0;
            gpsTotalTime.current = Number(restoredSession.gps?.totalTime) || 0;
            setLiveGpsMetrics({ distance:gpsTotalDistance.current, time:gpsTotalTime.current });
            gpsActivityTimesRef.current = {
                ...restoredSession.gps?.activityTimes,
                walk:Number(restoredSession.gps?.activityTimes?.walk) || 0,
                run:Number(restoredSession.gps?.activityTimes?.run) || 0,
                training:Number(restoredSession.gps?.activityTimes?.training) || 0
            };
            hasGpsDataRef.current = !!restoredSession.hasGpsData; setHasGpsData(hasGpsDataRef.current);
            finalGpsSummaryRef.current = restoredSession.finalGpsSummary || null; setFinalGpsSummary(finalGpsSummaryRef.current);

            if (restoredSession.status === 'gps-running' && restoredSession.gps?.active) {
                pendingGpsRestoreRef.current = restoredSession.gps;
                setShouldAutoStart(true);
            } else if (restoredSession.status === 'finished') {
                setStatus('finished');
            } else {
                setStatus('paused');
                speak('Sesión recuperada. Toca continuar cuando estés listo.', true);
            }
        } else {
        const firstStep = generated[0];
        stepDurRef.current = firstStep.seconds; setTime(firstStep.seconds); setUiIdx(0); setShouldAutoStart(true);
        }
        return () => {
            if (gpsWatcherId.current) { clearLocationWatch(gpsWatcherId.current); gpsWatcherId.current = null; }
            isGpsActiveRef.current = false;
            if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; }
            if (gpsAnnounceIntervalRef.current) { clearInterval(gpsAnnounceIntervalRef.current); gpsAnnounceIntervalRef.current = null; }
        };
    }, [workout, selectedPhases, restoredSession, userId, setElap, setStatus, setTime]);

    useEffect(() => {
        if (shouldAutoStart && uiStatus === 'ready') {
            const gpsRestore = pendingGpsRestoreRef.current;
            pendingGpsRestoreRef.current = null;
            if (gpsRestore) startGpsTracking(gpsRestore);
            else togglePlay();
            setShouldAutoStart(false);
        }
    }, [shouldAutoStart, uiStatus, startGpsTracking, togglePlay]);

    useEffect(() => {
        if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; }
        if (uiStatus !== 'running' && uiStatus !== 'gps-running') return;
        const interval = setInterval(() => {
            const now = Date.now(), s = stepsRef.current, ci = idxRef.current, step = s[ci];
            if (!step) { endWorkout(); return; }
            const totalElap = Math.floor((now - (workoutStartRef.current||now)) / 1000);
            if (!isNaN(totalElap)) { elapsedRef.current = totalElap; setElap(totalElap); }
            if (statusRef.current !== 'running' && statusRef.current !== 'gps-running') return;
            if (statusRef.current === 'gps-running') return;
            
            const passed = Math.floor((now - (stepStartRef.current||now)) / 1000);
            const remaining = Math.max(0, stepDurRef.current - passed);
            if (!isNaN(remaining)) { timeLeftRef.current = remaining; setTime(remaining); }
            handleSpeech(step, ci, remaining);
            if (remaining === 0) {
                // Finish the next activity's name before advancing and sounding its whistle.
                if (nextActivitySpeech.current?.sourceIndex === ci && nextActivitySpeech.current.pending) return;
                if (step.phase === GPS_PHASE_KEY) { startGpsTracking(); return; }
                const next = ci + 1;
                if (next < s.length) { advanceToStep(next); if (s[next].phase !== GPS_PHASE_KEY) handleSpeech(s[next], next, s[next].seconds); }
                else endWorkout();
            }
        }, 250);
        intervalIdRef.current = interval;
        return () => { clearInterval(interval); intervalIdRef.current = null; };
    }, [uiStatus, endWorkout, setElap, setTime, startGpsTracking, advanceToStep, handleSpeech]);

    const handleFinishActivity = useCallback(async () => {
        if (savingRef.current || savedRef.current || !workout) return;
        savingRef.current = true;
        setSavingResult(true);
        setSaveError('');
        try {
            const gpsData = hasGpsDataRef.current && finalGpsSummary
                ? { coordinates:gpsCoordinates, summary:finalGpsSummary } : null;
            await onComplete(workout.name, elapsedRef.current, gpsData, resultIdRef.current, workout.customActivity || null);
            savedRef.current = true;
            onExit();
        } catch (error) {
            setSaveError('No se pudo guardar. Comprueba tu conexión y vuelve a intentarlo.');
        } finally {
            savingRef.current = false;
            setSavingResult(false);
        }
    }, [workout, onComplete, onExit, gpsCoordinates, finalGpsSummary]);
    const handleDiscardActivity = () => {
        if (savingRef.current) return;
        savedRef.current = true;
        onExit();
    };

    if (!workout) return React.createElement('div', { className:"h-screen flex items-center justify-center bg-slate-950 text-white/50 text-sm italic" }, "Error: Rutina no seleccionada.");

    if (steps.length === 0) return React.createElement('div', { className:"h-screen flex flex-col items-center justify-center bg-slate-950 text-white/50 text-sm italic p-4" },
        React.createElement('p', { className:"mb-8" }, "No se pudieron generar los pasos de la rutina."),
        React.createElement('button', { onClick:onExit, className:"bg-white/10 text-white py-4 px-8 rounded-full font-black uppercase italic text-xs" }, "Volver")
    );

    const curr = steps[uiIdx] || { label:'Cargando...', color:'bg-slate-950' };
    const showOverlay = uiStatus === 'ready' || uiStatus === 'paused';

    // ─── PANTALLA GPS EN VIVO ─────────────────────────────────────────────────
    if (isGpsActive && uiStatus === 'gps-running') return React.createElement('div', {
        className: "h-screen flex flex-col bg-slate-950 text-white",
        style: { padding: '24px' },
    },
        React.createElement('h2', { className:"text-2xl font-black uppercase text-orange-500 mb-3 text-center shrink-0" }, "Seguimiento GPS en vivo"),
        React.createElement('div', {
            className: "glass-card p-3 mb-3 flex-1 flex flex-col min-h-0", // Adjusted to flex-1 flex flex-col min-h-0
        },
            React.createElement(MapDisplay, {
                gpsCoordinates,
                currentLocation,
                isLiveTracking: true,
                // heightPx prop removed
            })
        ),
        // Estadísticas GPS
        React.createElement('div', { className:"glass-card p-3 mb-3 shrink-0" },
            React.createElement('div', { className:"grid grid-cols-2 gap-3 text-center" },
                React.createElement('div', null, React.createElement('span',{className:"text-[9px] opacity-40 block uppercase"},"Distancia"), React.createElement('span',{className:"text-lg font-black text-sky-400"},formatDistance(liveGpsMetrics.distance))),
                React.createElement('div', null, React.createElement('span',{className:"text-[9px] opacity-40 block uppercase"},"Tiempo"), React.createElement('span',{className:"text-lg font-black text-emerald-400"},formatTime(liveGpsMetrics.time))),
                React.createElement('div', null, React.createElement('span',{className:"text-[9px] opacity-40 block uppercase"},"Ritmo"), React.createElement('span',{className:"text-lg font-black text-purple-400"},formatPace(liveGpsMetrics.distance,liveGpsMetrics.time)," /km")),
                React.createElement('div', null, React.createElement('span',{className:"text-[9px] opacity-40 block uppercase"},"Velocidad"), React.createElement('span',{className:"text-lg font-black text-yellow-400"},formatSpeed(liveGpsMetrics.distance,liveGpsMetrics.time)))
            )
        ),
        React.createElement('p', { role:'status', className:"text-center text-xs text-slate-300 mb-3" }, gpsSignalText),
        React.createElement('button', { onClick:finishPhase, className:"w-full shrink-0 bg-white/10 py-3 mb-2 rounded-full font-bold" }, "Saltar fase completa"),
        React.createElement('button', {
            onClick:finishPhase,
            className: "w-full shrink-0 bg-red-600/80 text-white py-5 rounded-full font-black uppercase active:scale-95 italic"
        }, "FINALIZAR ETAPA GPS")
    );
    // ─────────────────────────────────────────────────────────────────────────

    if (uiStatus === 'finished') {
        const activityLabels = [
            'Calentamiento',
            ...selectedPhases.map(key => workout.sessionActivities?.find(a => 'custom:' + a.id === key)?.name || SELECTABLE_PHASES.find(phase => phase.key === key)?.label || key)
        ];
        const sessionBreakdown = calculateSessionBreakdown({
            steps,
            currentStepIndex:uiIdx,
            currentStepRemaining:uiTimeLeft,
            gpsActivityTimes:gpsActivityTimesRef.current,
            selectedPhases
        });
        const breakdownRows = [
            { key:'preparation', label:'Preparación', color:'text-yellow-300', visible:true },
            { key:'training', label:workout.customActivity ? workout.name : 'Entrenamiento principal', color:'text-emerald-400', visible:selectedPhases.includes('training') },
            { key:'walk', label:'Caminata', color:'text-sky-400', visible:selectedPhases.includes('walk') },
            { key:'run', label:'Carrera', color:'text-orange-400', visible:selectedPhases.includes('run') },
            { key:'stretch', label:'Estiramientos', color:'text-blue-300', visible:selectedPhases.includes('stretch') }
            ,...(workout.sessionActivities || []).map(a => ({ key:'custom:' + a.id, label:a.name, color:'text-emerald-400', visible:selectedPhases.includes('custom:' + a.id) }))
        ].filter(row => row.visible).sort((a, b) => ['preparation', ...selectedPhases].indexOf(a.key) - ['preparation', ...selectedPhases].indexOf(b.key));
        return React.createElement('div', { className:"h-screen flex flex-col bg-slate-950 text-white p-6 text-center overflow-hidden" },
            React.createElement('div', { className:"shrink-0 pt-8 pb-4" },
                React.createElement('p', { className:"screen-kicker text-[10px] font-black uppercase" }, "Resumen de actividades del día"),
                React.createElement('h1', { className:"text-4xl font-black mt-2" }, "¡Sesión completada!")
            ),
            React.createElement('div', { className:"flex-1 overflow-y-auto scrollbar-hide space-y-4 min-h-0" },
                React.createElement('div', { className:"glass-card p-5 text-left" },
                    React.createElement('span', { className:"text-[9px] text-slate-400 uppercase block" }, "Rutina"),
                    React.createElement('strong', { className:"text-lg text-white block mt-1" }, workout.name || "Sesión"),
                    React.createElement('span', { className:"text-[10px] text-slate-400 block mt-2" },
                        new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
                    )
                ),
                React.createElement('div', { className:"grid grid-cols-2 gap-3" },
                    React.createElement('div', { className:"glass-card p-5" },
                        React.createElement('span', { className:"text-[9px] text-slate-400 uppercase block" }, "Tiempo total"),
                        React.createElement('strong', { className:"text-2xl text-emerald-400 block mt-1" }, formatTime(uiElapsed))
                    ),
                    React.createElement('div', { className:"glass-card p-5" },
                        React.createElement('span', { className:"text-[9px] text-slate-400 uppercase block" }, "Fases realizadas"),
                        React.createElement('strong', { className:"text-2xl text-sky-400 block mt-1" }, activityLabels.length)
                    )
                ),
                React.createElement('div', { className:"glass-card p-5 text-left" },
                    React.createElement('span', { className:"text-[9px] text-slate-400 uppercase block mb-3" }, "Tiempo por fase"),
                    React.createElement('div', { className:"space-y-3" },
                        breakdownRows.map(row => React.createElement('div', {
                            key:row.key,
                            className:"flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                        },
                            React.createElement('span', { className:"text-[11px] font-bold text-slate-200" }, row.label),
                            React.createElement('strong', { className:`text-lg tabular-nums ${row.color}` }, formatTime(sessionBreakdown[row.key]))
                        ))
                    )
                ),
                finalGpsSummary && React.createElement('div', { className:"glass-card p-5" },
                    React.createElement('span', { className:"text-[9px] text-slate-400 uppercase block mb-3" }, "Seguimiento GPS"),
                    React.createElement('div', { className:"grid grid-cols-2 gap-4" },
                        React.createElement('div', null, React.createElement('span', { className:"text-[9px] text-slate-500 block uppercase" }, "Distancia"), React.createElement('strong', { className:"text-lg text-sky-400" }, finalGpsSummary.distanceText)),
                        React.createElement('div', null, React.createElement('span', { className:"text-[9px] text-slate-500 block uppercase" }, "Tiempo GPS"), React.createElement('strong', { className:"text-lg text-emerald-400" }, finalGpsSummary.timeText)),
                        React.createElement('div', null, React.createElement('span', { className:"text-[9px] text-slate-500 block uppercase" }, "Ritmo"), React.createElement('strong', { className:"text-lg text-purple-400" }, finalGpsSummary.pace, " /km")),
                        React.createElement('div', null, React.createElement('span', { className:"text-[9px] text-slate-500 block uppercase" }, "Velocidad"), React.createElement('strong', { className:"text-lg text-yellow-400" }, finalGpsSummary.speed))
                    )
                )
            ),
            React.createElement('button', {
                type:"button",
                onClick:handleFinishActivity,
                disabled:savingResult,
                className:"w-full shrink-0 mt-5 bg-orange-500 py-5 rounded-full font-black uppercase text-white active:scale-95"
            }, savingResult ? "Guardando…" : "Guardar actividad"),
            saveError && React.createElement('p', { role:'alert', className:'text-red-300 text-sm mt-2' }, saveError),
            React.createElement('button', { onClick:handleDiscardActivity, disabled:savingResult, className:'w-full shrink-0 mt-3 py-4 rounded-full border border-red-400/40 text-red-300 font-bold' }, 'Descartar actividad')
        );
    }

    return React.createElement('div', { className:`h-screen flex flex-col transition-colors duration-700 ${curr.color||'bg-slate-950'} text-white` },
        React.createElement('div', { className:"bg-black/10 p-4 pt-10 flex justify-between items-center shrink-0 z-10" },
            React.createElement('div', { className:"leading-none text-left" },
                React.createElement('span', { className:"text-[10px] font-black text-orange-500 uppercase" }, "Tiempo Total"),
                React.createElement('p', { className:"text-xl font-black italic" }, formatTime(uiElapsed))
            ),
            React.createElement('div', { className:"text-center" },
                React.createElement('h2', { className:"text-[10px] font-black uppercase italic truncate max-w-[120px] tracking-tight" }, workout.name||'Rutina')
            ),
            React.createElement('button', { onClick:onExit, className:"opacity-40 text-xl font-black px-2" }, "✕")
        ),
        React.createElement('div', { className:"flex-1 flex flex-col items-center justify-center text-center px-4 min-h-0 relative" },
            showOverlay && React.createElement('div', { className:"absolute inset-0 z-40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center" },
                React.createElement('button', { onClick:togglePlay, className:"bg-orange-500 p-10 rounded-full shadow-2xl active:scale-90" }, React.createElement(IconPlay))
            ),
            curr.exerciseGroup && React.createElement('span', { className:"mb-3 rounded-full bg-black/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/70" }, `${curr.exerciseGroup} · ${curr.exerciseDifficulty}`),
            React.createElement('h2', { className:"max-w-3xl text-[8vw] font-black uppercase italic text-white/90 leading-none mb-3" }, curr.label||'LISTO'),
            curr.description && React.createElement('p', { className:"mb-4 max-w-xl px-4 text-sm font-semibold leading-snug text-white/75" }, curr.description),
            React.createElement('div', { className:"timer-huge tabular-nums text-white" }, uiTimeLeft)
        ),
        React.createElement('div', { className:"bg-slate-950 p-6 pb-10 flex flex-col items-center shrink-0" },
            React.createElement('div', { className:"w-full max-w-md grid grid-cols-3 items-center mb-6 text-center italic" },
                React.createElement('button', { onClick:skipStep, className:"bg-slate-800/40 py-4 rounded-xl text-[10px] font-black uppercase text-white/70 active:scale-95" }, "Saltar movimiento"),
                React.createElement('div', { className:"flex justify-center" },
                    uiStatus !== 'ready' && React.createElement('button', { onClick:togglePlay, className:"w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center active:scale-90" },
                        uiStatus === 'running' ? React.createElement(IconPause) : React.createElement(IconPlay)
                    )
                ),
                React.createElement('button', { onClick:finishPhase, className:"bg-red-500/20 py-4 rounded-xl text-[10px] font-black uppercase text-red-400 active:scale-95" }, "Finalizar etapa")
            ),
            React.createElement('button', { onClick:finishPhase, className:"w-full max-w-md mb-4 py-3 rounded-xl bg-white/10 text-xs font-bold" }, "Saltar fase completa"),
            React.createElement('div', { className:"w-full max-w-md grid grid-cols-2 items-center text-center italic" },
                React.createElement('div', { className:"flex flex-col" },
                    React.createElement('span', { className:"text-[14vw] font-black text-sky-400 leading-none" }, curr.tr ? curr.tr-(curr.r||0)+1 : '-'),
                    React.createElement('span', { className:"text-[8px] opacity-40" }, "Rondas Restantes")
                ),
                React.createElement('div', { className:"flex flex-col" },
                    React.createElement('span', { className:"text-[14vw] font-black text-yellow-400 leading-none" }, curr.tc ? curr.tc-(curr.cy||0)+1 : '-'),
                    React.createElement('span', { className:"text-[8px] opacity-40" }, "Ciclos Restantes")
                )
            )
        )
    );
}

// ─── MapPlayback ───────────────────────────────────────────────────────────────
function MapPlayback({ routeCoordinates, routeSummary, onClose }) {
    if (!routeCoordinates || routeCoordinates.length === 0) {
        return React.createElement('div', { className: "text-center p-4 text-white/50" }, "No hay datos de ruta disponibles.");
    }

    return React.createElement('div', { className: "fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col p-6" },
        React.createElement('div', { className: "flex justify-between items-center mb-4 shrink-0" },
            React.createElement('h2', { className: "text-xl font-black italic text-orange-500" }, "Ruta Histórica"),
            React.createElement('button', { onClick: onClose, className: "text-white opacity-60 text-3xl font-black" }, "✕")
        ),
        React.createElement('div', { className: "glass-card p-4 mb-4 flex-1 flex flex-col min-h-0" }, // Added flex-1 flex flex-col min-h-0
            // Mapa con altura que ocupa el espacio disponible menos las estadísticas
            React.createElement(MapDisplay, {
                gpsCoordinates: routeCoordinates,
                isLiveTracking: false,
                // heightPx prop removed
            }),
            routeSummary && React.createElement('div', { className: "grid grid-cols-2 gap-4 text-center mt-4 shrink-0" }, // Added shrink-0
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Distancia"), React.createElement('span', { className: "text-xl font-black text-sky-400" }, routeSummary.distanceText)),
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Tiempo"), React.createElement('span', { className: "text-xl font-black text-emerald-400" }, routeSummary.timeText)),
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Ritmo"), React.createElement('span', { className: "text-xl font-black text-purple-400" }, routeSummary.pace, " /km")),
                React.createElement('div', null, React.createElement('span', { className: "text-[9px] opacity-40 block uppercase" }, "Velocidad"), React.createElement('span', { className: "text-xl font-black text-yellow-400" }, routeSummary.speed))
            )
        ),
        React.createElement('button', { onClick: onClose, className: "w-full max-w-sm mx-auto bg-orange-500 py-6 rounded-full font-black uppercase text-white active:scale-95 italic shrink-0" }, "CERRAR MAPA") // Added shrink-0
    );
}

// ─── AvanceView ───────────────────────────────────────────────────────────────
function AvanceView({ history }) {
    const [periodType, setPeriodType] = useState('semana');
    const [periodOffset, setPeriodOffset] = useState(0);
    const [showHistoricalMap, setShowHistoricalMap] = useState(false);
    const [selectedHistoricalGpsData, setSelectedHistoricalGpsData] = useState(null);
    const chartRef = useRef(null);
    const chartInst = useRef(null);
    const PERIOD_TYPES = ['semana', 'mes', 'año'];
    const formatTimeHnM = useCallback((seconds) => { const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60); return `${h}h ${m}m`; }, []);
    const totalSec = useMemo(() => history.reduce((a,h)=>a+(h.totalTime||0),0),[history]);
    const currentPeriodRange = useMemo(() => {
        const today = new Date();
        if (periodType==='semana') return getWeekRange(today, periodOffset);
        if (periodType==='mes')    return getMonthRange(today, periodOffset);
        return getYearRange(today, periodOffset);
    }, [periodType, periodOffset]);
    const filteredHistory = useMemo(() => history.filter(h=>{const d=new Date(h.date);return d>=currentPeriodRange.start&&d<=currentPeriodRange.end;}),[history,currentPeriodRange]);
    const periodSec = useMemo(() => filteredHistory.reduce((a,h)=>a+(h.totalTime||0),0),[filteredHistory]);
    
    useEffect(() => {
        const ctx = chartRef.current?.getContext('2d'); if (!ctx) return;
        if (chartInst.current) chartInst.current.destroy();
        let labels=[], data=[], agg=new Map();
        if (periodType==='semana') {
            for (let d=new Date(currentPeriodRange.start); d<=currentPeriodRange.end; d.setDate(d.getDate()+1))
                labels.push(d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric'}));
            filteredHistory.forEach(h=>{const k=new Date(h.date).toLocaleDateString('es-ES',{weekday:'short',day:'numeric'});agg.set(k,(agg.get(k)||0)+(h.totalTime||0));});
            data = labels.map(l=>Math.floor((agg.get(l)||0)/60));
        } else if (periodType==='mes') {
            let cur=startOfDay(new Date(currentPeriodRange.start));
            cur.setDate(cur.getDate()-(cur.getDay()===0?6:cur.getDay()-1)); // Start on Monday
            let wn=1;
            while (cur <= currentPeriodRange.end) {
                const ws=new Date(cur);
                const we=endOfDay(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()+6));
                
                // Ensure week range is within current month range
                const weekStartBound = startOfDay(new Date(Math.max(ws.getTime(), currentPeriodRange.start.getTime())));
                const weekEndBound = endOfDay(new Date(Math.min(we.getTime(), currentPeriodRange.end.getTime())));

                if (weekStartBound <= weekEndBound) { // Only process if the week segment is valid within the month
                    labels.push(`Sem ${wn} (${weekStartBound.getDate()}/${weekStartBound.getMonth()+1})`);
                    let wt=0;
                    filteredHistory.forEach(h=>{const d=new Date(h.date);if(d>=weekStartBound&&d<=weekEndBound)wt+=(h.totalTime||0);});
                    data.push(Math.floor(wt/60));
                    wn++;
                }
                cur.setDate(cur.getDate()+7);
                // Stop if we've moved to the next month not relevant to currentPeriodRange
                if (cur.getMonth() !== currentPeriodRange.end.getMonth() && cur > currentPeriodRange.end) break;
            }
        } else {
            for (let i=0;i<12;i++) labels.push(new Date(currentPeriodRange.start.getFullYear(),i,1).toLocaleDateString('es-ES',{month:'short'}));
            filteredHistory.forEach(h=>{const k=new Date(h.date).toLocaleDateString('es-ES',{month:'short'});agg.set(k,(agg.get(k)||0)+(h.totalTime||0));});
            data=labels.map(l=>Math.floor((agg.get(l)||0)/60));
        }
        chartInst.current = new Chart(ctx, { type:'bar', data:{labels,datasets:[{label:'Minutos',data,backgroundColor:'#f97316',borderRadius:8}]}, options:{maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#64748b'}},x:{grid:{display:false},ticks:{color:'#64748b',font:{size:10}}}}} });
        return () => chartInst.current?.destroy();
    }, [filteredHistory, periodType, currentPeriodRange]);

    const periodTitle = useMemo(() => {
        const {start,end} = currentPeriodRange, sf={day:'numeric',month:'short'};
        if (periodType==='semana') { const cw=getWeekRange(new Date(),0); if(start.getTime()===cw.start.getTime()) return 'Semana Actual'; if(start.getTime()===getWeekRange(new Date(),-1).start.getTime()) return 'Semana Anterior'; return start.getMonth()===end.getMonth()?`${start.getDate()} - ${end.toLocaleDateString('es-ES',{day:'numeric'})}`:`${start.toLocaleDateString('es-ES',sf)} - ${end.toLocaleDateString('es-ES',sf)}`; }
        if (periodType==='mes') { if(start.getTime()===getMonthRange(new Date(),0).start.getTime()) return 'Mes Actual'; if(start.getTime()===getMonthRange(new Date(),-1).start.getTime()) return 'Mes Anterior'; return start.toLocaleDateString('es-ES',{month:'long',year:'numeric'}); }
        if(start.getTime()===getYearRange(new Date(),0).start.getTime()) return 'Año Actual'; if(start.getTime()===getYearRange(new Date(),-1).start.getTime()) return 'Año Anterior'; return `${start.getFullYear()}`;
    }, [currentPeriodRange, periodType]);

    const handleShowMap = useCallback((gpsData) => {
        setSelectedHistoricalGpsData(gpsData);
        setShowHistoricalMap(true);
    }, []);

    const handleCloseHistoricalMap = useCallback(() => {
        setShowHistoricalMap(false);
        setSelectedHistoricalGpsData(null);
    }, []);

    return React.createElement('div', { className:"flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 pb-28" },
        React.createElement('div', { className:"glass-card p-6 text-center" },
            React.createElement('span', { className:"text-[9px] opacity-40 block mb-1 uppercase" }, "Tiempo Total Acumulado"),
            React.createElement('span', { className:"text-3xl font-black text-orange-500" }, formatTimeHnM(totalSec))
        ),
        React.createElement('div', { className:"flex gap-2" }, PERIOD_TYPES.map(p => React.createElement('button', { key:p, onClick:()=>{setPeriodType(p);setPeriodOffset(0);}, className:`flex-1 py-3 rounded-xl font-black uppercase text-[10px] transition-all ${periodType===p?'bg-orange-500 text-white':'bg-white/5 text-slate-400'}` }, p))),
        React.createElement('div', { className: "flex items-center justify-between glass-card p-4" },
            React.createElement('button', { onClick:()=>setPeriodOffset(p=>p-1), className:"p-2 bg-white/5 text-slate-400 rounded-lg" }, React.createElement('svg',{width:"24",height:"24",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement('path',{d:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"}))),
            React.createElement('span', { className:"text-sm font-black uppercase italic text-orange-400" }, periodTitle),
            React.createElement('button', { onClick:()=>setPeriodOffset(p=>p+1), disabled:periodOffset>=0, className:`p-2 rounded-lg ${periodOffset>=0?'bg-white/10 text-slate-600 cursor-not-allowed':'bg-white/5 text-slate-400'}` }, React.createElement('svg',{width:"24",height:"24",viewBox:"0 0 24 24",fill:"currentColor"},React.createElement('path',{d:"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"})))
        ),
        React.createElement('div', { className:"glass-card p-5 flex justify-between items-center" },
            React.createElement('div', { className:"text-left" }, React.createElement('span',{className:"text-[9px] opacity-40 uppercase block"},"Tiempo en el periodo"), React.createElement('span',{className:"text-2xl font-black text-sky-400"},formatTimeHnM(periodSec))),
            React.createElement('div', { className:"text-right" }, React.createElement('span',{className:"text-[9px] opacity-40 uppercase block"},"Sesiones"), React.createElement('span',{className:"text-2xl font-black text-emerald-400"},filteredHistory.length))
        ),
        React.createElement('div', { className:"glass-card p-4" }, React.createElement('div', { style:{height:'200px'} }, React.createElement('canvas', { ref:chartRef }))),
        React.createElement('div', { className:"mt-8" },
            React.createElement('h3', { className:"font-black uppercase text-xs text-orange-500 mb-4" }, "Historial de Actividades"),
            filteredHistory.length === 0
                ? React.createElement('p', { className:"text-white/50 italic text-sm" }, "No hay actividades en este periodo.")
                : filteredHistory.map(h => React.createElement('div', { key:h.id, className:"glass-card p-4 mb-2 flex justify-between items-center" },
                    React.createElement('div', { className:"flex-1" },
                        React.createElement('p', { className:"text-sm font-bold" }, h.workoutName || "Actividad GPS"),
                        React.createElement('p', { className:"text-[10px] text-slate-400" }, `Fecha: ${new Date(h.date).toLocaleDateString()}`),
                        h.gpsData && h.gpsData.summary && React.createElement('p', { className:"text-[10px] text-slate-400" }, `Distancia: ${h.gpsData.summary.distanceText} | Tiempo: ${h.gpsData.summary.timeText}`)
                    ),
                    h.gpsData && h.gpsData.coordinates && h.gpsData.coordinates.length > 1 &&
                        React.createElement('button', {
                            onClick: () => handleShowMap(h.gpsData),
                            className: "bg-orange-500/10 text-orange-400 p-2 rounded-lg ml-4 flex items-center gap-1 text-[10px] font-black uppercase"
                        }, React.createElement(IconMap), "Mapa")
                ))
        ),
        showHistoricalMap && selectedHistoricalGpsData &&
            React.createElement(MapPlayback, {
                routeCoordinates: selectedHistoricalGpsData.coordinates,
                routeSummary: selectedHistoricalGpsData.summary,
                onClose: handleCloseHistoricalMap
            })
    );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('phases');
    const [isAppResting, setIsAppResting] = useState(false);
    const [workouts, setWorkouts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [selectedPhases, setSelectedPhases] = useState(null);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [restoredSession, setRestoredSession] = useState(null);
    const restoredForUserRef = useRef(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(u => {
            setUser(u && !u.isAnonymous ? u : null);
            setTimeout(() => setLoading(false), 500);
        });
        return unsub;
    }, []);

    useEffect(() => {
        if (!user) return;
        if (restoredForUserRef.current !== user.uid) {
            restoredForUserRef.current = user.uid;
            const activeSession = readActiveSession();
            const isRecoverable = activeSession
                && activeSession.userId === user.uid
                && activeSession.workout
                && Array.isArray(activeSession.selectedPhases)
                && Date.now() - Number(activeSession.savedAt || 0) < 24 * 60 * 60 * 1000;
            if (isRecoverable) {
                setRestoredSession(activeSession);
                setSelectedWorkout(activeSession.workout);
                setSelectedPhases(activeSession.selectedPhases);
                setView('play');
            } else if (activeSession) {
                clearActiveSession();
            }
        }
        const base = db.collection('artifacts').doc(APP_ID).collection('users').doc(user.uid);
        const unsubW = base.collection('workouts').onSnapshot(s => setWorkouts(s.docs.map(d => ({id:d.id,...d.data()}))));
        const unsubH = base.collection('history').onSnapshot(s => setHistory(s.docs.map(d => ({id:d.id,...d.data()}))));
        return () => { unsubW(); unsubH(); };
    }, [user]);

    const handlePhasesSelected = useCallback((phases) => {
        clearActiveSession();
        setRestoredSession(null);
        requestAppFullscreen();
        resumeVoice();
        if (!isNativeRuntime() && window.speechSynthesis) {
            const silent = new SpeechSynthesisUtterance(' ');
            silent.volume = 0; window.speechSynthesis.speak(silent);
        }
        const sessionActivities = workouts.filter(w => w.customActivity && phases.includes('custom:' + w.id));
        setSelectedPhases(phases);
        if (phases.includes('training')) {
            if (selectedWorkout) {
                setSelectedWorkout({ ...selectedWorkout, sessionActivities });
                setView('play');
            } else {
                setView('workouts');
            }
        } else {
            setSelectedWorkout({ id:'_no_training', name:sessionActivities.length ? sessionActivities.map(a => a.name).join(' · ') : 'Sesión', phases: DEFAULT_PARAMS, sessionActivities });
            setView('play');
        }
    }, [selectedWorkout, workouts]);

    const handleWorkoutSelected = useCallback((workout) => {
        if (workout.customActivity) {
            clearActiveSession(); setRestoredSession(null);
            const key = 'custom:' + workout.id;
            setSelectedPhases(current => current?.includes(key) ? current : [...(current || []), key]);
        } else setSelectedWorkout(workout);
        setView('phases');
    }, []);

    const handleDeleteWorkout = useCallback(async workout => {
        if (!user || !workout || workout.isDefault) return;
        if (!window.confirm(`¿Eliminar la rutina "${workout.name}"? Esta acción no se puede deshacer.`)) return;

        try {
            const collection = db.collection('artifacts').doc(APP_ID).collection('users').doc(user.uid).collection('workouts');
            const copies = workout.customActivity ? workouts.filter(w=>w.customActivity && customActivityIdentity(w) === customActivityIdentity(workout)) : [workout];
            const batch = db.batch();
            for (const copy of copies) batch.delete(collection.doc(copy.id));
            await batch.commit();
            setSelectedPhases(current => current?.filter(key => !copies.some(w=>key === 'custom:' + w.id)) || null);
            if (selectedWorkout?.id === workout.id) setSelectedWorkout(null);
            if (editingWorkout?.id === workout.id) setEditingWorkout(null);
            if (workout.customActivity) setView('phases');
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    }, [user, selectedWorkout, editingWorkout, workouts]);

    const handleExitPlayer = useCallback(() => {
        endVoiceSession();
        clearActiveSession();
        setRestoredSession(null);
        setSelectedPhases(null);
        setSelectedWorkout(null);
        setView('phases');
    }, []);

    const handleCloseApp = useCallback(async () => {
        try {
            const appPlugin = window.Capacitor?.Plugins?.App;
            if (appPlugin?.minimizeApp) {
                await appPlugin.minimizeApp();
                return;
            }
        } catch (error) {
            console.warn('No se pudo minimizar la aplicación:', error);
        }
        setIsAppResting(true);
    }, []);

    if (loading) return React.createElement('div', { className:"h-full w-full flex items-center justify-center bg-slate-950" },
        React.createElement('div', { className:"animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" })
    );
    if (!user) return React.createElement(AuthView, { APP_TITLE, APP_VERSION });
    if (isAppResting) return React.createElement('div', { className:"h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center" },
        React.createElement('img', { src:"assets/movement-health-logo.png", alt:"Mi Entrenador Saludable", className:"brand-logo" }),
        React.createElement('h2', { className:"text-2xl font-black text-white mb-2" }, "Aplicación en espera"),
        React.createElement('p', { className:"text-sm text-slate-400 mb-6" }, "Tu cuenta continúa iniciada en este dispositivo."),
        React.createElement('button', {
            type:"button",
            onClick:()=>setIsAppResting(false),
            className:"w-full max-w-sm bg-orange-500 py-4 rounded-xl font-black uppercase text-white active:scale-95"
        }, "Volver a la aplicación")
    );

    return React.createElement('div', { className:"h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden" },
        (view === 'workouts' || view === 'avance' || view === 'create') && React.createElement('header', { className:"p-5 flex justify-between items-center bg-slate-900 border-b border-white/10 shrink-0" },
            React.createElement('div', { onClick:()=>setView('phases'), className:"cursor-pointer" },
                React.createElement('h1', { className:"text-base font-black text-white" }, APP_TITLE),
                React.createElement('p', { className:"text-[10px] text-slate-300 font-semibold mt-1" }, user.email),
                React.createElement('span', { className:"app-version mt-2" }, "VERSIÓN ", APP_VERSION)
            ),
            React.createElement('button', { onClick:()=>auth.signOut(), className:"px-4 py-2 border border-white/10 bg-white/5 rounded-lg text-slate-300 font-bold text-[10px] uppercase" }, "Cerrar sesión")
        ),
        React.createElement('main', { className:"flex-1 relative flex flex-col min-h-0" },
            view === 'phases'   && React.createElement(PhaseSelectionScreen, {
                onPhasesSelected: handlePhasesSelected,
                onConfigureTraining: phases => { setSelectedPhases(phases); setView('workouts'); },
                onClearTrainingSelection: () => setSelectedWorkout(null),
                onCustomActivity: phases => { setSelectedPhases(phases); setEditingWorkout(null); setView('custom'); },
                onEditActivity: (workout, phases) => { setSelectedPhases(phases); setEditingWorkout(workout); setView('custom'); },
                workouts,
                initialSelectedPhases: selectedPhases,
                selectedWorkout,
                onClose: handleCloseApp,
            }),
            view === 'workouts' && React.createElement(WorkoutsView, {
                workouts, user,
                selectedPhases,
                selectedWorkout,
                onConfirm: handleWorkoutSelected,
                onEdit: w => { setEditingWorkout(w); setView(w.customActivity ? 'custom' : 'create'); },
                onDelete: handleDeleteWorkout,
                onCreate: () => { setEditingWorkout(null); setView('create'); }
            }),
            view === 'custom' && React.createElement(CustomActivityView, { user, workouts, workoutToEdit:editingWorkout,
                onDelete:handleDeleteWorkout,
                onCancel:()=>setView('phases'), onSaved:workout=>{ setEditingWorkout(null); handleWorkoutSelected(workout); } }),
            view === 'avance'   && React.createElement(AvanceView, { history }),
            view === 'create'   && React.createElement(CreateView, {
                user,
                workoutToEdit:editingWorkout,
                onCancel:()=>setView('workouts'),
                onSaved:workout=>{ setEditingWorkout(null); handleWorkoutSelected(workout); },
                onBackToPhases:()=>{ setEditingWorkout(null); setSelectedPhases(null); setSelectedWorkout(null); setView('phases'); }
            }),
            view === 'play'     && React.createElement(PlayerView, {
                workout: selectedWorkout,
                selectedPhases: selectedPhases,
                userId: user.uid,
                restoredSession,
                onExit: handleExitPlayer,
                onComplete: (name, time, gpsData, resultId, customActivity) => {
                    return db.collection('artifacts').doc(APP_ID).collection('users').doc(user.uid)
                      .collection('history').doc(resultId).set({ workoutName:name, totalTime:time, date:new Date().toISOString(), gpsData:gpsData || null, customActivity });
                }
            })
        ),
        (view === 'phases' || view === 'workouts' || view === 'avance') && React.createElement('nav', { className:"professional-nav bg-slate-900 border-t border-white/10 px-4 pt-3 flex justify-around items-center shrink-0" },
            React.createElement('button', { onClick:()=>setView('phases'), className:`min-w-24 py-1 flex flex-col items-center text-[10px] font-black uppercase ${(view==='phases'||view==='workouts')?'text-orange-500':'text-slate-500'}` }, React.createElement('span',{className:"nav-indicator"}), "Inicio"),
            React.createElement('button', { onClick:()=>setView('avance'), className:`min-w-24 py-1 flex flex-col items-center text-[10px] font-black uppercase ${view==='avance'?'text-orange-500':'text-slate-500'}` }, React.createElement('span',{className:"nav-indicator"}), "Progreso")
        )
    );
}

// ─── AuthView ─────────────────────────────────────────────────────────────────
function AuthView({ APP_TITLE, APP_VERSION }) {
    const [isReg, setIsReg] = useState(false);
    const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isClosed, setIsClosed] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(false); // Nuevo estado de carga

    const handleAuth = useCallback(async e => {
        e.preventDefault();
        setLoadingAuth(true); // Iniciar carga
        try {
            if (isReg) await auth.createUserWithEmailAndPassword(email.trim(), pass);
            else await auth.signInWithEmailAndPassword(email.trim(), pass);
        } catch(err) {
            alert("Error: " + err.message);
        } finally {
            setLoadingAuth(false); // Finalizar carga
        }
    }, [isReg, email, pass]);

    const handlePasswordReset = useCallback(async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            alert('Por favor, ingresa tu dirección de correo electrónico.');
            return;
        }
        setLoadingAuth(true); // Iniciar carga
        try {
            await auth.sendPasswordResetEmail(email.trim());
            alert('Se ha enviado un correo electrónico a tu dirección con las instrucciones para restablecer tu contraseña.');
            setShowPasswordRecovery(false);
            setEmail('');
        } catch (err) {
            alert("Error al enviar el correo de recuperación: " + err.message);
        } finally {
            setLoadingAuth(false); // Finalizar carga
        }
    }, [email]);

    if (isClosed) return React.createElement('div', { className:"h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center" },
        React.createElement('img', { src:"assets/movement-health-logo.png", alt:"Mi Entrenador Saludable", className:"brand-logo" }),
        React.createElement('h2', { className:"text-2xl font-black text-white mb-2" }, "Sesión cerrada"),
        React.createElement('p', { className:"text-sm text-slate-400 mb-6" }, "Tu cuenta permanece protegida."),
        React.createElement('button', { type:"button", onClick:()=>setIsClosed(false), className:"w-full max-w-sm bg-orange-500 py-4 rounded-xl font-black uppercase text-white active:scale-95" }, "Volver al acceso")
    );

    return React.createElement('div', { className:"auth-screen relative h-full flex flex-col items-center overflow-hidden bg-slate-950 px-4 text-center" },
        React.createElement('button', { type:"button", onClick:()=>setIsClosed(true), className:"auth-cancel absolute right-4 rounded-full border border-white/10 bg-slate-900/95 px-3 py-2 text-[10px] uppercase font-black text-slate-300" }, "✕ CANCELAR"),
        React.createElement('div', { className:"shrink-0" },
            React.createElement('img', { src:"assets/movement-health-logo.png", alt:"Mi Entrenador Saludable", className:"auth-logo brand-logo" }),
            React.createElement('h1', { className:"auth-title text-3xl font-black text-white" }, APP_TITLE),
            React.createElement('p', { className:"auth-version uppercase mt-2 mb-5" }, "VERSIÓN ", APP_VERSION)
        ),
        React.createElement('div', { className:"auth-actions flex-1 overflow-y-auto scrollbar-hide w-full max-w-sm px-4 py-1 min-h-0" },
            showPasswordRecovery ? (
                React.createElement('form', { onSubmit:handlePasswordReset, className:"space-y-4" },
                    React.createElement('input', { type:"email", placeholder:"EMAIL", className:"w-full p-6 bg-slate-900 border border-white/5 rounded-[1.5rem] text-center text-white outline-none", value:email, onChange:e=>setEmail(e.target.value), required:true, disabled:loadingAuth }),
                    React.createElement('button', { type:"submit", className:"w-full bg-orange-500 py-6 rounded-full font-black uppercase text-white active:scale-95 italic", disabled:loadingAuth }, loadingAuth ? 'ENVIANDO...' : "ENVIAR ENLACE DE RECUPERACIÓN"),
                    React.createElement('button', { type:"button", onClick:()=>setShowPasswordRecovery(false), className:"w-full text-orange-400 text-[10px] uppercase font-black", disabled:loadingAuth }, "VOLVER A INICIAR SESIÓN")
                )
            ) : (
                React.createElement('form', { onSubmit:handleAuth, className:"space-y-3" },
                    React.createElement('input', { type:"email", placeholder:"EMAIL", className:"w-full p-4 bg-slate-900 border border-white/5 rounded-[1.5rem] text-center text-white outline-none", value:email, onChange:e=>setEmail(e.target.value), required:true, disabled:loadingAuth }),
                    React.createElement('input', { type:"password", placeholder:"CLAVE", className:"w-full p-4 bg-slate-900 border border-white/5 rounded-[1.5rem] text-center text-white outline-none", value:pass, onChange:e=>setPass(e.target.value), required:true, disabled:loadingAuth }),
                    React.createElement('button', { type:"submit", className:"w-full bg-orange-500 py-4 rounded-full font-black uppercase text-white active:scale-95 italic", disabled:loadingAuth }, isReg ? (loadingAuth ? 'REGISTRANDO...' : 'REGISTRARSE') : (loadingAuth ? 'ENTRANDO...' : 'ENTRAR')),
                    React.createElement('button', { type:"button", onClick:()=>setIsReg(!isReg), className:"text-orange-400 text-[10px] uppercase font-black block w-full", disabled:loadingAuth }, isReg ? 'YA TENGO CUENTA' : 'CREAR CUENTA NUEVA'),
                    React.createElement('button', { type:"button", onClick:()=>setShowPasswordRecovery(true), className:"auth-recovery text-slate-300 text-[10px] uppercase font-black block w-full", disabled:loadingAuth }, "¿Olvidaste tu contraseña?")
                )
            )
        )
    );
}

// ─── WorkoutsView ─────────────────────────────────────────────────────────────
function WorkoutsView({ workouts, selectedPhases, selectedWorkout, onConfirm, onEdit, onDelete, onCreate }) {
    const availableWorkouts = [...DEFAULT_WORKOUTS, ...workouts.filter(w => !w.customActivity)];
    const [checkedWorkoutId, setCheckedWorkoutId] = useState(selectedWorkout?.id || null);
    const checkedWorkout = availableWorkouts.find(workout => workout.id === checkedWorkoutId) || null;
    const phaseLabels = selectedPhases
        ? ['Calentamiento', ...selectedPhases.map(k => k === 'training' && checkedWorkout ? checkedWorkout.name : workouts.find(w=>'custom:' + w.id===k)?.name || SELECTABLE_PHASES.find(p=>p.key===k)?.label||k)].join(' → ')
        : '';
    return React.createElement('div', { className:"flex-1 overflow-y-auto scrollbar-hide p-4 pb-32" },
        React.createElement('button', {
            type:"button",
            onClick:()=>checkedWorkout && onConfirm(checkedWorkout),
            disabled:!checkedWorkout,
            className:`sticky top-0 z-20 mb-4 min-h-16 w-full rounded-2xl border px-5 py-4 text-sm font-black uppercase transition-all active:scale-95 ${checkedWorkout ? 'border-orange-300 bg-orange-500 text-white shadow-xl shadow-orange-500/40' : 'border-white/10 bg-slate-800 text-slate-500 opacity-50'}`
        }, checkedWorkout ? "← CONTINUAR: REGRESAR AL MENÚ" : "ELIGE UNA RUTINA PARA CONTINUAR"),
        React.createElement('div', { className:"glass-card p-4 mb-4" },
            React.createElement('p', { className:"text-[9px] text-orange-400 font-black uppercase mb-1" }, "Tu sesión de hoy"),
            React.createElement('p', { className:"text-xs text-white font-bold italic" }, phaseLabels),
            React.createElement('p', { className:"text-[9px] text-slate-500 mt-1" }, "Elige la rutina con la que entrenarás:")
        ),
        React.createElement('div', { className:"space-y-4" },
            availableWorkouts.map(w => React.createElement('div', {
                    key:w.id,
                    onClick:()=>setCheckedWorkoutId(w.id),
                    className:`glass-card p-6 flex justify-between items-center shadow-lg cursor-pointer ${checkedWorkoutId === w.id ? 'ring-2 ring-sky-400 bg-sky-500/10' : ''}`
                },
                    React.createElement('div', { className:"flex items-center gap-4 flex-1" },
                        React.createElement('input', {
                            type:"radio",
                            name:"selected-workout",
                            checked:checkedWorkoutId === w.id,
                            onChange:()=>setCheckedWorkoutId(w.id),
                            onClick:event=>event.stopPropagation(),
                            className:"h-6 w-6 accent-blue-500",
                            "aria-label":`Seleccionar rutina ${w.name}`
                        }),
                        React.createElement('div', null,
                            React.createElement('div', { className:"flex flex-wrap items-center gap-2" },
                                React.createElement('h3', { className:"font-black uppercase italic text-sm" }, w.name),
                                w.isDefault && React.createElement('span', { className:"rounded-full bg-emerald-500/15 px-2 py-1 text-[8px] font-black uppercase text-emerald-300" }, "Integrada")
                            ),
                            React.createElement('p', { className:"mt-1 text-[9px] font-bold uppercase text-slate-400" },
                                w.customActivity ? ({ time:'Por tiempo', cycles:'Por ciclos', gps:'Seguimiento GPS' }[w.customActivity.mode]) : `${w.phases?.entrenamiento?.rounds ?? 3} rondas · ${w.phases?.entrenamiento?.cycles ?? 4} ciclos · ${getWorkoutExerciseDifficulty(w)}`
                            ),
                            React.createElement('p', { className:"mt-1 text-[10px] font-black uppercase text-sky-300" },
                                `Duración estimada: ${getWorkoutDurationText(w)}`
                            ),
                            React.createElement('span', { className:"text-[10px] text-orange-400 font-black uppercase italic" }, checkedWorkoutId === w.id ? "Seleccionada" : "Disponible")
                        )
                    ),
                    w.isDefault
                        ? React.createElement('span', { className:"rounded-xl border border-white/10 bg-slate-800/30 px-3 py-2 text-[8px] font-black uppercase text-slate-500" }, "Solo lectura")
                        : React.createElement('div', { className:"flex flex-col gap-2" },
                            React.createElement('button', {
                                type:"button",
                                onClick:event=>{ event.stopPropagation(); onEdit(w); },
                                className:"bg-slate-800/40 px-4 py-3 rounded-xl text-[10px] font-black uppercase italic"
                            }, "Editar"),
                            React.createElement('button', {
                                type:"button",
                                onClick:event=>{ event.stopPropagation(); onDelete(w); },
                                className:"border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-xl text-[10px] font-black uppercase text-red-300"
                            }, "Eliminar")
                        )
                ))
        ),
        React.createElement(AdBannerPlaceholder, null), // Añadido el campo de anuncio aquí
        React.createElement('button', { onClick:onCreate, className:"w-full mt-4 bg-white/5 border border-white/10 py-6 rounded-full font-black uppercase italic" }, "➕ NUEVA RUTINA")
    );
}

// ─── CreateView ───────────────────────────────────────────────────────────────
function CreateView({ user, workoutToEdit, onCancel, onSaved, onBackToPhases }) {
    const initialPhases = workoutToEdit?.phases
        ? {...DEFAULT_PARAMS, ...workoutToEdit.phases, entrenamiento:{...DEFAULT_PARAMS.entrenamiento,...(workoutToEdit.phases.entrenamiento||{})}}
        : DEFAULT_PARAMS;
    const [name, setName] = useState(workoutToEdit?.name || '');
    const [phases, setPhases] = useState(initialPhases);
    const [saving, setSaving] = useState(false);
    const update = useCallback((p,f,v) => setPhases(prev=>({...prev,[p]:{...prev[p],[f]:parseInt(v)||0}})), []);
    const save = useCallback(async () => {
        if (!name.trim() || saving) return;
        setSaving(true);
        try {
            const col = db.collection('artifacts').doc(APP_ID).collection('users').doc(user.uid).collection('workouts');
            const dataToSave = { name:name.toUpperCase(), phases:{...DEFAULT_PARAMS,...phases,entrenamiento:{...DEFAULT_PARAMS.entrenamiento,...phases.entrenamiento}}, updatedAt:new Date().toISOString() };
            let savedWorkout;
            if (workoutToEdit?.id) {
                await col.doc(workoutToEdit.id).update(dataToSave);
                savedWorkout = { ...workoutToEdit, ...dataToSave };
            } else {
                const createdData = { ...dataToSave, createdAt:new Date().toISOString() };
                const documentRef = await col.add(createdData);
                savedWorkout = { id:documentRef.id, ...createdData };
            }
            onSaved(savedWorkout);
        } catch(e) { alert("Error al guardar: " + e.message); setSaving(false); }
    }, [name, saving, phases, user, workoutToEdit, onSaved]);
    const ENT_FIELDS = [
        {f:'action',label:'Acción (s)'},{f:'change',label:'Cambio (s)'},{f:'rounds',label:'Rondas'},
        {f:'cycles',label:'Ciclos'},{f:'rest',label:'Descanso Ciclo (s)'},{f:'zoneRest',label:'Descanso Zona (s)'}
    ];
    const STRETCH_FIELDS = [
        {f:'stretchSteps',label:'Pasos Estir.'},{f:'stretchAction',label:'Duración Estir. (s)'},{f:'stretchChange',label:'Cambio Estir. (s)'}
    ];
    return React.createElement('div', { className:"flex-1 flex flex-col bg-slate-950 overflow-hidden text-center italic" },
        React.createElement('header', { className:"p-6 flex items-center border-b border-white/5 shrink-0" },
            React.createElement('button', { onClick:onCancel, className:"p-3 bg-slate-900 rounded-2xl shadow-lg text-white", "aria-label":"Regresar a rutinas" }, "⬅"),
            React.createElement('h2', { className:"text-xl font-black uppercase flex-1" }, "Configurar Rutina"),
            React.createElement('button', {
                type:"button",
                onClick:onBackToPhases,
                className:"min-h-11 rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-[9px] font-black uppercase text-sky-200"
            }, "¿Qué haremos hoy?")
        ),
        React.createElement('div', { className:"flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6 pb-28" },
            React.createElement('input', { type:"text", placeholder:"NOMBRE DE LA RUTINA", className:"w-full p-6 bg-slate-900 border border-white/10 rounded-[2rem] font-black uppercase text-center text-white outline-none", value:name, onChange:e=>setName(e.target.value) }),
            React.createElement('div', { className:"glass-card p-6 space-y-4" },
                React.createElement('span', { className:"font-black uppercase text-xs text-orange-500 border-b border-white/5 block pb-2" }, "Entrenamiento"),
                React.createElement('div', { className:"grid grid-cols-2 gap-4" }, ENT_FIELDS.map(({f,label}) => React.createElement(InputField, { key:f, label, val:(phases.entrenamiento?.[f]??DEFAULT_PARAMS.entrenamiento[f]), set:v=>update('entrenamiento',f,v) })))
            ),
            React.createElement('div', { className:"glass-card p-6 space-y-4" },
                React.createElement('span', { className:"font-black uppercase text-xs text-orange-500 border-b border-white/5 block pb-2" }, "Estiramientos"),
                React.createElement('div', { className:"grid grid-cols-2 gap-4" }, STRETCH_FIELDS.map(({f,label}) => React.createElement(InputField, { key:f, label, val:(phases.entrenamiento?.[f]??DEFAULT_PARAMS.entrenamiento[f]), set:v=>update('entrenamiento',f,v) })))
            )
        ),
        React.createElement('div', { className:"p-6 bg-slate-950 border-t border-white/5 shrink-0" },
            React.createElement('button', { onClick:save, className:"w-full bg-white text-black py-6 rounded-full font-black uppercase", disabled:saving }, saving?'GUARDANDO...':'GUARDAR Y VOLVER A ACTIVIDADES')
        )
    );
}


function CustomActivityView({ user, workouts = [], workoutToEdit, onCancel, onSaved, onDelete }) {
    const [name, setName] = useState(workoutToEdit?.name || '');
    const [config, setConfig] = useState({ mode:'time', seconds:60, cycles:3, rest:30, preparation:0, ...workoutToEdit?.customActivity });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const busy = useRef(false);
    const documentRef = useRef(null);
    const save = async event => {
        event.preventDefault();
        if (busy.current) return;
        if (!name.trim() || name.trim().length > 80 || !['time','cycles','gps'].includes(config.mode) ||
            !Number.isInteger(Number(config.seconds)) || config.seconds < 1 || config.seconds > 86400 ||
            !Number.isInteger(Number(config.cycles)) || config.cycles < 1 || config.cycles > 100 ||
            !Number.isInteger(Number(config.rest)) || config.rest < 0 || config.rest > 3600 ||
            config.preparation === '' || !Number.isInteger(Number(config.preparation)) || config.preparation < 0 || config.preparation > 3600) {
            setError('Revisa el nombre y los valores: tiempo de 1 a 86400 s, ciclos de 1 a 100 y descanso y preparación de 0 a 3600 s.'); return;
        }
        busy.current = true; setSaving(true); setError('');
        try {
            const collection = db.collection('artifacts').doc(APP_ID).collection('users').doc(user.uid).collection('workouts');
            const data = { name:name.trim(), customActivity:{ ...config, seconds:Number(config.seconds), cycles:Number(config.cycles), rest:Number(config.rest), preparation:Number(config.preparation) }, updatedAt:new Date().toISOString() };
            const identity = customActivityIdentity(data);
            const existing = workouts.find(w=>w.customActivity && customActivityIdentity(w) === identity);
            if (!documentRef.current) documentRef.current = collection.doc(workoutToEdit?.id || existing?.id || 'custom-' + encodeURIComponent(identity));
            const copies = workoutToEdit?.customActivity ? workouts.filter(w=>w.customActivity && customActivityIdentity(w) === customActivityIdentity(workoutToEdit)) : [];
            if (copies.length > 1) {
                const batch = db.batch();
                for (const copy of copies) batch.set(collection.doc(copy.id), data);
                await batch.commit();
            } else await documentRef.current.set(data);
            onSaved({ id:documentRef.current.id, ...data });
        } catch (e) { setError('No se pudo guardar la actividad. Revisa tu conexión e inténtalo otra vez.'); }
        finally { busy.current = false; setSaving(false); }
    };
    return React.createElement('form', { onSubmit:save, className:'flex-1 overflow-y-auto p-6 space-y-5' },
        React.createElement('h1', { className:'text-2xl font-black pt-8' }, 'Actividad personalizada'),
        React.createElement('label', { className:'block' }, 'Nombre de la actividad', React.createElement('input', { required:true, maxLength:80, value:name, onChange:e=>setName(e.target.value), placeholder:'Nadar, montañismo, levantar pesas…', className:'block w-full bg-slate-800 rounded-xl p-4 mt-2' })),
        React.createElement('label', { className:'block' }, 'Cómo realizarla', React.createElement('select', { value:config.mode, onChange:e=>setConfig({ ...config, mode:e.target.value }), className:'block w-full bg-slate-800 rounded-xl p-4 mt-2' },
            React.createElement('option', { value:'time' }, 'Tiempo · cuenta regresiva'),
            React.createElement('option', { value:'cycles' }, 'Ciclos · tiempo de acción y descanso'),
            React.createElement('option', { value:'gps' }, 'Seguimiento GPS · ruta, distancia y tiempo'))),
        React.createElement(InputField, { label:'Preparación adicional (segundos, 0 para omitir)', val:config.preparation, set:v=>setConfig({ ...config, preparation:v }) }),
        React.createElement('p', { className:'text-sm text-slate-300' }, 'Se guardará en tu cuenta para elegirla cualquier día junto a las demás actividades. El calentamiento siempre es obligatorio; esta preparación adicional se realiza antes de la actividad.'),
        config.mode !== 'gps' && React.createElement(InputField, { label:config.mode === 'cycles' ? 'Tiempo por ciclo (segundos)' : 'Duración (segundos)', val:config.seconds, set:v=>setConfig({ ...config, seconds:v }) }),
        config.mode === 'cycles' && React.createElement('div', { className:'grid grid-cols-2 gap-4' },
            React.createElement(InputField, { label:'Ciclos', val:config.cycles, set:v=>setConfig({ ...config, cycles:v }) }),
            React.createElement(InputField, { label:'Descanso entre ciclos (segundos)', val:config.rest, set:v=>setConfig({ ...config, rest:v }) })),
        config.mode === 'gps' && React.createElement('p', { className:'text-sm text-slate-300' }, 'El seguimiento continúa hasta que pulses Finalizar etapa GPS. Usa ubicación en exteriores; para nadar en piscina puedes elegir tiempo o ciclos.'),
        error && React.createElement('p', { role:'alert', className:'text-red-300' }, error),
        React.createElement('button', { type:'submit', disabled:saving, className:'w-full bg-orange-500 rounded-full p-4 font-bold' }, saving ? 'Guardando…' : 'Guardar entrenamiento'),
        React.createElement('button', { type:'button', disabled:saving, onClick:onCancel, className:'w-full rounded-full p-4 border border-white/20' }, 'Volver')
        ,workoutToEdit?.id && onDelete && React.createElement('button', { type:'button', disabled:saving, onClick:()=>onDelete(workoutToEdit), className:'w-full rounded-full p-4 text-red-300' }, 'Eliminar actividad')
    );
}

function InputField({ label, val, set }) {
    return React.createElement('div', { className:"flex flex-col items-center" },
        React.createElement('span', { className:"text-[8px] opacity-40 mb-2 uppercase" }, label),
        React.createElement('input', { type:"number", "aria-label":label, className:"w-full bg-slate-800/40 p-4 rounded-xl text-center font-black text-white border border-white/5 outline-none", value:val, onChange:e=>set(e.target.value) })
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
