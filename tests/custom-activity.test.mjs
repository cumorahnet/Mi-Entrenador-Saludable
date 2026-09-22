import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('www/assets/app.js', 'utf8');
const generate = runInNewContext(source.slice(source.indexOf('const generateWorkoutSteps ='), source.indexOf('// ─── Componente para placeholder')) + '; generateWorkoutSteps', { GPS_PHASE_KEY:'gps-tracking', getWorkoutExerciseDifficulty:()=> 'Fácil', SELECTABLE_PHASES:[],
    ALL_SEGMENT_GENERATORS:Object.fromEntries(['warmup','walk','run','stretch'].map(key=>[key, { generator:()=>[{ label:key, seconds:10, phase:key }] }])) });

it('genera una actividad cronometrada con su nombre y sin ejercicios ajenos', () => {
    const steps = generate({ name:'Nadar', customActivity:{ mode:'time', seconds:120, cycles:3, rest:20 } }, {}, ['training']);
    expect(steps).toHaveLength(2);
    expect(steps[0].sessionSection).toBe('preparation');
    expect(steps[1]).toMatchObject({ label:'Nadar', seconds:120, sessionSection:'training' });
});

it('alterna ciclos y descansos sin agregar descanso al final', () => {
    const steps = generate({ name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:3, rest:20 } }, {}, ['training']);
    expect(steps.map(s=>s.seconds)).toEqual([10,45,20,45,20,45]);
    expect(steps.at(-1).label).toBe('Pesas · Ciclo 3/3');
});

it('permite ciclos sin descanso y activa el seguimiento GPS existente', () => {
    expect(generate({ name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:2, rest:0 } }, {}, ['training'])).toHaveLength(3);
    expect(generate({ name:'Montañismo', customActivity:{ mode:'gps' } }, {}, ['training'])[1]).toMatchObject({ label:'Montañismo', phase:'gps-tracking', seconds:4 });
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

it('añade preparación una sola vez y respeta el orden elegido con una actividad personalizada', () => {
    const steps = generate({ name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:2, rest:20, preparation:30 } }, {}, ['run','training','stretch']);
    expect(steps.map(s=>s.sessionSection)).toEqual(['preparation','run','training','training','training','training','stretch']);
    expect(steps[2].seconds).toBe(30);
});

it('respeta el orden también en rutinas estándar y mantiene la preparación primero', () => {
    const steps = generate({ name:'Rutina' }, {}, ['stretch','run','walk']);
    expect(steps.slice(0,-1).map(s=>s.sessionSection)).toEqual(['preparation','stretch','run','walk']);
});

it('separa el tiempo de preparación del seguimiento GPS personalizado', async () => {
    const { default:logic } = await import('../www/assets/app-logic.js');
    const steps = generate({ name:'Senderismo', customActivity:{ mode:'gps', preparation:20 } }, {}, ['training']);
    expect(steps[2].activityType).toBe('training');
    expect(logic.calculateSessionBreakdown({ steps, currentStepIndex:2, currentStepRemaining:0,
        gpsActivityTimes:{ training:120 }, selectedPhases:['training'] })).toMatchObject({ preparation:10, training:144 });
});

function customForm(workoutToEdit, overrides = {}) {
    const write = vi.fn().mockResolvedValue();
    const doc = vi.fn(id=>({ id:id || 'new-workout', set:write }));
    const collection = { doc };
    const chain = { collection:()=>chain, doc:()=>chain };
    let calls = 0;
    chain.collection = key=>key === 'workouts' ? collection : chain;
    const onSaved = vi.fn();
    const context = { React:{ createElement:(type, props, ...children)=>({ type, props, children }) },
        useState:value=>[calls++ === 1 ? { ...value, ...overrides } : value, vi.fn()],
        useRef:value=>({ current:value }), db:chain, APP_ID:'test', InputField:()=>null };
    const start = source.indexOf('function CustomActivityView(');
    const end = source.indexOf('function InputField(', start);
    const render = runInNewContext(source.slice(start,end)+'; CustomActivityView', context);
    const form = render({ user:{ uid:'user' }, workoutToEdit, onSaved, onCancel:vi.fn() });
    return { submit:()=>form.props.onSubmit({ preventDefault(){} }), write, doc, onSaved };
}

it('guarda preparación y actualiza la misma rutina al editarla', async () => {
    const form = customForm({ id:'saved-workout', name:'Pesas', customActivity:{ mode:'cycles', seconds:45, cycles:2, rest:10 } }, { preparation:'25' });
    await form.submit();
    expect(form.doc).toHaveBeenCalledWith('saved-workout');
    expect(form.write).toHaveBeenCalledWith(expect.objectContaining({ name:'Pesas', customActivity:expect.objectContaining({ preparation:25 }) }));
    expect(form.onSaved).toHaveBeenCalledWith(expect.objectContaining({ id:'saved-workout' }));
});

it('las actividades antiguas se pueden guardar con preparación cero', async () => {
    const form = customForm({ name:'Nadar', customActivity:{ mode:'time', seconds:60, cycles:1, rest:0 } });
    await form.submit();
    expect(form.onSaved).toHaveBeenCalledWith(expect.objectContaining({ id:'new-workout', customActivity:expect.objectContaining({ preparation:0 }) }));
});

it.each(['', -1, 3601, 1.5])('rechaza preparación inválida %s sin guardar', async preparation => {
    const form = customForm({ name:'Nadar' }, { preparation });
    await form.submit();
    expect(form.write).not.toHaveBeenCalled();
});

it('combina varias actividades guardadas con las predefinidas y calienta una sola vez', async () => {
    const sessionActivities = [
        { id:'swim', name:'Nadar', customActivity:{ mode:'time', seconds:90 } },
        { id:'hike', name:'Senderismo', customActivity:{ mode:'gps', preparation:15 } }
    ];
    const selectedPhases = ['custom:hike', 'walk', 'custom:swim', 'stretch', 'warmup'];
    const steps = generate({ name:'Sesión', sessionActivities }, {}, selectedPhases);
    expect(steps.map(s=>s.label)).toEqual(['warmup', 'Preparación · Senderismo', 'Senderismo', 'walk', 'Nadar', 'stretch', 'FINAL DE LA RUTINA']);
    expect(steps[2].activityType).toBe('custom:hike');
    const { default:logic } = await import('../www/assets/app-logic.js');
    expect(logic.calculateSessionBreakdown({ steps, currentStepIndex:steps.length-1, currentStepRemaining:0,
        selectedPhases, gpsActivityTimes:{ 'custom:hike':120, walk:60 } })).toMatchObject({ preparation:10, 'custom:hike':139, 'custom:swim':90, walk:70 });
});

it('muestra las actividades recuperadas de Firebase en la misma selección y prioridad', () => {
    const saved = { id:'swim', name:'Nadar', customActivity:{ mode:'time', seconds:90 } };
    const onPhasesSelected = vi.fn();
    const context = { React:{ createElement:(type, props, ...children)=>({ type, props, children }) },
        useState:value=>[value, vi.fn()], SELECTABLE_PHASES:[{ key:'walk', label:'Caminata' }],
        APP_VERSION:'test', getWorkoutDurationText:()=> '90 s', AdBannerPlaceholder:()=>null };
    const start = source.indexOf('function PhaseSelectionScreen(');
    const end = source.indexOf('// ─── MapDisplay', start);
    const render = runInNewContext(source.slice(start,end)+'; PhaseSelectionScreen', context);
    const tree = render({ workouts:[saved], initialSelectedPhases:['custom:swim','walk'], onPhasesSelected });
    const nodes = [];
    function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; nodes.push(node); visit(node.children); }
    visit(tree);
    expect(nodes.filter(n=>n.type === 'select').map(n=>n.props.value)).toEqual([0,1]);
    nodes.find(n=>n.type === 'button' && n.children.includes('COMENZAR')).props.onClick();
    expect(onPhasesSelected).toHaveBeenCalledWith(['custom:swim','walk']);
    expect(JSON.stringify(tree)).toContain('Calentamiento obligatorio');
    expect(JSON.stringify(tree)).toContain('Nadar');
});
