import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('www/assets/app.js', 'utf8');
const saved = { id:'swim', name:'Nadar', customActivity:{ mode:'time', seconds:90 } };
const snapshot = { docs:[{ id:saved.id, data:()=>saved }] };

function harness() {
    const slots = [], listeners = [];
    let cursor = 0, pending = [], authChanged;
    const chain = path => ({
        collection:key=>chain([...path,key]), doc:key=>chain([...path,key]),
        onSnapshot:(success,error)=>{
            const stop = vi.fn();
            listeners.push({ path, success, error, stop });
            return stop;
        }
    });
    const context = {
        React:{ createElement:(type,props,...children)=>({type,props,children}) },
        useState:initial=>{
            const index = cursor++;
            if (!(index in slots)) slots[index] = initial;
            return [slots[index], value=>{ slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
        },
        useRef:initial=>{ const index = cursor++; return slots[index] ||= {current:initial}; },
        useCallback:fn=>fn,
        useEffect:(fn,deps)=>{
            const index = cursor++, previous = slots[index];
            if (!previous || deps.some((dep,i)=>dep !== previous.deps[i])) {
                pending.push(()=>{ previous?.cleanup?.(); slots[index] = { deps, cleanup:fn() }; });
            }
        },
        auth:{ onAuthStateChanged:fn=>{ authChanged=fn; return vi.fn(); } },
        db:chain([]), APP_ID:'test', APP_TITLE:'Test', APP_VERSION:'test',
        registrationConsentWrite:null, readActiveSession:()=>null, console:{error:vi.fn()},
        ...Object.fromEntries(['AuthView','AccountSetup','FullNamePrompt','SuperuserPanel','PhaseSelectionScreen','WorkoutsView','CustomActivityView','AvanceView','CreateView','PlayerView'].map(name=>[name,name]))
    };
    const App = runInNewContext(source.slice(source.indexOf('function App()'),source.indexOf('function AccountSetup('))+'; App',context);
    function render() {
        cursor = 0;
        const tree = App();
        const effects = pending; pending = [];
        effects.forEach(effect=>effect());
        return tree;
    }
    render();
    return { render, listeners, login:async(uid='user')=>{ await authChanged(uid ? {uid, displayName:'Usuario'} : null); const tree = render(); if (uid) find(tree,'AccountSetup').props.onComplete(); render(); },
        latest:()=>listeners.filter(l=>l.path.at(-1)==='workouts').at(-1) };
}

function nodes(tree) {
    if (!tree || typeof tree !== 'object') return [];
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    return [tree,...nodes(tree.children)];
}
const find = (tree,type)=>nodes(tree).find(node=>node.type===type);

it('vuelve a Inicio al iniciar sesión y recupera la actividad aunque Firebase tarde', async()=>{
    const app = harness();
    await app.login();
    app.latest().success(snapshot);
    find(app.render(),'PhaseSelectionScreen').props.onConfigureTraining(['training']);
    expect(find(app.render(),'WorkoutsView')).toBeDefined();
    await app.login(null);
    expect(find(app.render(),'AuthView')).toBeDefined();
    await app.login();
    expect(find(app.render(),'PhaseSelectionScreen').props.workouts).toEqual([]);
    expect(JSON.stringify(app.render())).toContain('Recuperando');
    app.latest().success(snapshot);
    expect(find(app.render(),'PhaseSelectionScreen').props.workouts).toEqual([saved]);
    expect(JSON.stringify(app.render())).not.toContain('Recuperando');
});

it('muestra errores de recuperación y permite volver a suscribirse', async()=>{
    const app = harness();
    await app.login();
    const failed = app.latest();
    failed.error(Error('permission-denied'));
    const tree = app.render();
    expect(nodes(tree).some(n=>n.props?.role==='alert')).toBe(true);
    nodes(tree).find(n=>n.type==='button' && n.children.includes('Reintentar')).props.onClick();
    app.render();
    expect(failed.stop).toHaveBeenCalledOnce();
    app.latest().success(snapshot);
    expect(find(app.render(),'PhaseSelectionScreen').props.workouts).toEqual([saved]);
    expect(nodes(app.render()).some(n=>n.props?.role==='alert')).toBe(false);
});

it('limpia los datos al cambiar de cuenta e ignora respuestas de la cuenta anterior', async()=>{
    const app = harness();
    await app.login('first');
    const first = app.latest();
    first.success(snapshot);
    await app.login('second');
    first.success(snapshot);
    expect(first.stop).toHaveBeenCalledOnce();
    expect(app.latest().path).toContain('second');
    expect(find(app.render(),'PhaseSelectionScreen').props.workouts).toEqual([]);
});
