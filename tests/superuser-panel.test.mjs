import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync('www/assets/app.js', 'utf8');
function harness({ denied = false, confirm = true } = {}) {
    const state = [], callbacks = [];
    let cursor = 0;
    const account = { uid:'other', fullName:'Cuenta de prueba', email:'test@example.com' };
    const list = vi.fn(async () => {
        if (denied) throw { code:'functions/permission-denied' };
        return { data:{ accounts:[account], nextPageToken:'next' } };
    });
    const remove = vi.fn(async () => ({ data:{ deleted:true } }));
    const functions = vi.fn(region => {
        if (region !== 'us-central1') throw Error('Región incorrecta');
        return { httpsCallable:name => ({ listPlatformAccounts:list, deletePlatformAccount:remove })[name] };
    });
    const context = {
        firebase:{ app:()=>({ functions }), functions:()=>{ throw Error('app-compat/invalid-app-argument'); } },
        React:{ createElement:(type, props, ...children)=>({ type, props, children }) },
        useState:initial=>{ const index = cursor++; if (!(index in state)) state[index] = initial;
            return [state[index], value=>{ state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
        useCallback:fn=>{ callbacks.push(fn); return fn; }, useEffect:()=>{},
        window:{ confirm:()=>confirm }
    };
    const Panel = runInNewContext(source.slice(source.indexOf('function SuperuserPanel('), source.indexOf('function AuthView(')) + '; SuperuserPanel', context);
    const render = () => { cursor = 0; return Panel({ user:{uid:'admin'}, onClose:()=>{} }); };
    render();
    return { state, list, remove, functions, account, render, load:callbacks[0], deleteAccount:callbacks[1] };
}

it('carga y pagina cuentas usando la instancia App de Firebase compat', async () => {
    const h = harness();
    await h.load(null);
    expect(h.list).toHaveBeenCalledWith({ pageToken:null });
    expect(h.state[0]).toEqual([h.account]);
    expect(h.state[4]).toBe('');
    expect(JSON.stringify(h.render())).toContain('Cuenta de prueba');
    await h.load('next', true);
    expect(h.list).toHaveBeenLastCalledWith({ pageToken:'next' });
    expect(h.state[0]).toHaveLength(2);
});

it('elimina solo tras confirmar y usa la misma instancia App', async () => {
    const h = harness();
    await h.load(null);
    await h.deleteAccount(h.account);
    expect(h.remove).toHaveBeenCalledWith({ uid:'other' });
    expect(h.state[0]).toEqual([]);
    const cancelled = harness({ confirm:false });
    await cancelled.deleteAccount(cancelled.account);
    expect(cancelled.remove).not.toHaveBeenCalled();
});

it('muestra el rechazo de permisos del servidor', async () => {
    const h = harness({ denied:true });
    await h.load(null);
    expect(h.state[4]).toContain('no tiene asignado el rol');
    expect(h.state[0]).toEqual([]);
    expect(h.state[2]).toBe(false);
});
