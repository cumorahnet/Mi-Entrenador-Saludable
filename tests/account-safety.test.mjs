import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function backend({ failDelete = false, failLock = false } = {}) {
    const events = [];
    const locks = new Set();
    const db = {
        doc:path=>({ path, get:async()=>({ exists:locks.has(path) }), set:async()=>{
            events.push('lock');
            if (failLock) throw Error('offline');
            locks.add(path);
        } }),
        recursiveDelete:async()=>{ events.push('data'); if (failDelete) throw Error('offline'); }
    };
    const auth = { deleteUser:async()=>{ events.push('auth'); } };
    class HttpsError extends Error { constructor(code,message) { super(message); this.code=code; } }
    const exports = {};
    const modules = {
        'firebase-admin/app':{ initializeApp() {} },
        'firebase-admin/auth':{ getAuth:()=>auth },
        'firebase-admin/firestore':{ getFirestore:()=>db },
        'firebase-functions/v2':{ setGlobalOptions() {} },
        'firebase-functions/v2/https':{ HttpsError, onCall:(...args)=>args.at(-1) }
    };
    runInNewContext(readFileSync('functions/index.js','utf8'), { exports, require:name=>modules[name], console:{error() {}} });
    return { events, locks, remove:exports.deletePlatformAccount };
}
const request = { auth:{ uid:'admin', token:{ platformAdmin:true } }, data:{ uid:'target' } };
it('bloquea antes de borrar y conserva el bloqueo de tokens antiguos', async()=>{
    const app = backend();
    await app.remove(request);
    expect(app.events).toEqual(['lock','data','auth']);
    expect(app.locks.has('accountDeletionLocks/target')).toBe(true);
    await app.remove(request);
    expect(app.events).toHaveLength(6);
});
it('no borra nada si falla el bloqueo y conserva el bloqueo si falla el borrado', async()=>{
    const lockFailure = backend({failLock:true});
    await expect(lockFailure.remove(request)).rejects.toThrow();
    expect(lockFailure.events).toEqual(['lock']);
    const deleteFailure = backend({failDelete:true});
    await expect(deleteFailure.remove(request)).rejects.toThrow('bloqueado');
    expect(deleteFailure.events).toEqual(['lock','data']);
    expect(deleteFailure.locks.has('accountDeletionLocks/target')).toBe(true);
});
it('rechaza usuarios normales, administradores bloqueados, autoborrado y rutas inválidas', async()=>{
    const app = backend();
    await expect(app.remove({...request, auth:{uid:'normal',token:{}}})).rejects.toThrow();
    await expect(app.remove({...request, data:{uid:'admin'}})).rejects.toThrow();
    await expect(app.remove({...request, data:{uid:'a/b'}})).rejects.toThrow();
    app.locks.add('accountDeletionLocks/admin');
    await expect(app.remove(request)).rejects.toThrow();
    expect(app.events).toEqual([]);
});

function setupHarness(data, failRead = false) {
    let cursor = 0, effects = [];
    const slots = [];
    const onComplete = vi.fn();
    const ref = { get:vi.fn(async()=>{ if (failRead) throw Error('offline'); return {exists:!!data,data:()=>data}; }), set:vi.fn(async()=>{}) };
    const chain = { collection:()=>chain, doc:()=>chain, get:ref.get, set:ref.set };
    const user = {uid:'test',displayName:'Nombre Completo',updateProfile:vi.fn(async()=>{})};
    const source = readFileSync('www/assets/app.js','utf8');
    const Component = runInNewContext(source.slice(source.indexOf('function AccountSetup('),source.indexOf('function FullNamePrompt('))+'; AccountSetup', {
        React:{createElement:(type,props,...children)=>({type,props,children}),Fragment:'fragment'},
        useState:initial=>{ const i=cursor++; if (!(i in slots)) slots[i]=initial; return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v]; },
        useEffect:(fn,deps)=>{ const i=cursor++; if (!slots[i] || deps.some((d,j)=>d!==slots[i][j])) {slots[i]=deps;effects.push(fn);} },
        db:chain, APP_ID:'test', firebase:{firestore:{FieldValue:{serverTimestamp:()=>123}}},auth:{signOut:vi.fn()}
    });
    const render=()=>{cursor=0; return Component({user,onComplete});};
    const flush=async()=>{const pending=effects;effects=[];pending.forEach(fn=>fn());await new Promise(resolve=>setImmediate(resolve));};
    return {render,flush,onComplete,ref};
}
function nodes(tree) { return !tree || typeof tree!=='object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree,...nodes(tree.children)]; }
it('recupera la aceptación faltante al iniciar sesión y permite reintentar una escritura fallida', async()=>{
    const app=setupHarness(null);
    app.render();await app.flush();
    let tree=app.render();
    expect(app.onComplete).not.toHaveBeenCalled();
    await nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
    expect(app.ref.set).not.toHaveBeenCalled();
    nodes(tree).find(n=>n.props?.type==='checkbox').props.onChange({target:{checked:true}});
    app.ref.set.mockRejectedValueOnce(Error('offline'));
    tree=app.render();await nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
    expect(app.onComplete).not.toHaveBeenCalled();
    tree=app.render();await nodes(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});
    expect(app.onComplete).toHaveBeenCalledOnce();
    expect(app.ref.set).toHaveBeenLastCalledWith(expect.objectContaining({accepted:true,privacyNoticeAccepted:true}));
});
it('acepta registros completos y no permite entrar si no se pudo verificar', async()=>{
    const complete=setupHarness({accepted:true,privacyNoticeAccepted:true,termsVersion:'1.0',privacyNoticeVersion:'1.0'});
    complete.render();await complete.flush();expect(complete.onComplete).toHaveBeenCalledOnce();
    const offline=setupHarness(null,true);offline.render();await offline.flush();
    expect(offline.onComplete).not.toHaveBeenCalled();
    expect(nodes(offline.render()).some(n=>n.props?.role==='alert')).toBe(true);
});
it('oculta el formulario mientras carga y para cuentas completas; lo muestra si falta el registro', async()=>{
    const complete=setupHarness({accepted:true,privacyNoticeAccepted:true,termsVersion:'1.0',privacyNoticeVersion:'1.0'});
    expect(nodes(complete.render()).some(n=>n.type==='form')).toBe(false);
    await complete.flush();
    expect(nodes(complete.render()).some(n=>n.type==='form')).toBe(false);
    const fresh=setupHarness(null);
    expect(nodes(fresh.render()).some(n=>n.type==='form')).toBe(false);
    await fresh.flush();
    expect(nodes(fresh.render()).some(n=>n.type==='form')).toBe(true);
});
