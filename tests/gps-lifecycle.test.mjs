import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync('www/assets/app.js', 'utf8');
const ref = current => ({ current });
const callback = (name, next, context) => runInNewContext(source.slice(source.indexOf(`    const ${name} = useCallback(`), source.indexOf(`    ${next}`, source.indexOf(`    const ${name} = useCallback(`))) + `; ${name}`, context);

it('espera el inicio pendiente, cierra GPS y guarda el ultimo recorrido antes de avanzar', async () => {
    let started;
    const context = { useCallback:fn => fn, gpsStoppingRef:ref(false), gpsStartingRef:ref(false),
        gpsStartPromiseRef:ref(new Promise(resolve => { started = resolve; })), gpsWatcherId:ref(null),
        gpsAnnounceIntervalRef:ref(null), gpsTotalDistance:ref(10), gpsTotalTime:ref(5), gpsCoordinatesRef:ref([]),
        isGpsActiveRef:ref(true), stepsRef:ref([{ activityType:'walk' }]), idxRef:ref(0), gpsActivityTimesRef:ref({}),
        hasGpsDataRef:ref(false), finalGpsSummaryRef:ref(null), completedGpsRef:ref([]), currentLocationRef:ref(null),
        clearLocationWatch:vi.fn(async () => { context.gpsTotalDistance.current = 100; context.gpsTotalTime.current = 60;
            context.gpsCoordinatesRef.current = [{ lat:1, lng:2 }, { lat:2, lng:3 }]; }),
        endVoiceSession:vi.fn(), setLiveGpsMetrics:vi.fn(), setHasGpsData:vi.fn(), setFinalGpsSummary:vi.fn(),
        formatDistance:String, formatTime:String, formatPace:String, formatSpeed:String,
        persistSession:vi.fn(), announceGpsStats:vi.fn(), setIsGpsActive:vi.fn(), setCurrentLocation:vi.fn(),
        endWorkout:vi.fn(), setStatus:vi.fn(), advanceToStep:vi.fn(), handleSpeech:vi.fn(),
        speak:vi.fn(), setTimeout:vi.fn(), clearInterval:vi.fn(), console };
    const stop = callback('stopGpsTracking', 'useEffect(() => { stopGpsTrackingRef', context);
    const stopping = stop();
    expect(context.endVoiceSession).toHaveBeenCalledOnce();
    expect(context.clearLocationWatch).not.toHaveBeenCalled();
    context.gpsWatcherId.current = { type:'native' };
    started();
    await stopping;
    expect(context.clearLocationWatch).toHaveBeenCalledOnce();
    expect(context.isGpsActiveRef.current).toBe(false);
    expect(context.completedGpsRef.current[0].summary.distance).toBe(100);
    expect(context.completedGpsRef.current[0].coordinates).toHaveLength(2);
    await stop();
    expect(context.completedGpsRef.current).toHaveLength(1);
});

it('guarda todas las etapas aunque la ultima no tenga señal y separa sus trazos', async () => {
    const segment = (lat, distance) => ({ coordinates:[{ lat, lng:1 }, { lat:lat + 1, lng:2 }], summary:{ distance, time:60 } });
    const context = { useCallback:fn => fn, savingRef:ref(false), savedRef:ref(false), workout:{ name:'Sesion' },
        setSavingResult:vi.fn(), setSaveError:vi.fn(), completedGpsRef:ref([segment(1, 100), segment(10, 200)]),
        elapsedRef:ref(150), resultIdRef:ref('id'), onComplete:vi.fn().mockResolvedValue(), onExit:vi.fn(),
        formatDistance:String, formatTime:String, formatPace:String, formatSpeed:String,
        gpsCoordinates:[], finalGpsSummary:null };
    const save = callback('handleFinishActivity', 'const handleDiscardActivity', context);
    await save();
    const data = context.onComplete.mock.calls[0][2];
    expect(data.summary.distance).toBe(300);
    expect(data.summary.time).toBe(120);
    expect(data.coordinates.map(p => p.segmentStart)).toEqual([true, false, true, false]);
    expect(context.onExit).toHaveBeenCalledOnce();
});

it('dibuja la ruta historica cuando el contenedor obtiene tamaño despues del primer render', async () => {
    const slots = [], effects = [], timers = [];
    let cursor = 0;
    const line = { addTo:vi.fn(function () { return this; }), getBounds:vi.fn(), setLatLngs:vi.fn() };
    const map = { on:vi.fn(), invalidateSize:vi.fn(), fitBounds:vi.fn(), remove:vi.fn(), setView:vi.fn() };
    const L = { control:{ zoom:() => ({ addTo:vi.fn() }) }, map:vi.fn(() => map), tileLayer:() => ({ addTo:vi.fn() }), polyline:vi.fn(() => line),
        divIcon:vi.fn(), marker:() => ({ addTo() { return this; }, setLatLng:vi.fn() }) };
    const container = { offsetWidth:0, offsetHeight:0 };
    const context = {
        useRef:value => { const i = cursor++; return slots[i] ??= { current:value }; },
        useState:value => { const i = cursor++; if (!(i in slots)) slots[i] = value; return [slots[i], value => { slots[i] = value; }]; },
        useEffect:(fn, deps) => { const i = cursor++; if (!slots[i] || deps.some((v, j) => v !== slots[i][j])) effects.push(fn); slots[i] = deps; },
        React:{ createElement:(tag, props) => { if (props?.ref) props.ref.current = container; return {}; } },
        window:{ L, addEventListener:vi.fn(), removeEventListener:vi.fn() }, L,
        document:{ addEventListener:vi.fn(), removeEventListener:vi.fn() },
        ResizeObserver:class { observe() {} disconnect() {} },
        setInterval:fn => { timers.push(fn); return timers.length; }, clearInterval:vi.fn(), console
    };
    const begin = source.indexOf('function MapDisplay(');
    const end = source.indexOf('function GpsActivityDisplay(', begin);
    const display = runInNewContext(source.slice(begin, end) + '; MapDisplay', context);
    const props = { gpsCoordinates:[{ lat:1, lng:2 }, { lat:2, lng:3 }], isLiveTracking:false };
    const render = async () => { cursor = 0; display(props); for (const effect of effects.splice(0)) await effect(); };
    await render();
    expect(L.polyline).not.toHaveBeenCalled();
    container.offsetWidth = 300; container.offsetHeight = 400;
    await timers[0]();
    await render();
    expect(L.polyline).toHaveBeenCalledWith([[[1, 2], [2, 3]]], expect.any(Object));
    expect(map.fitBounds).toHaveBeenCalled();
});
