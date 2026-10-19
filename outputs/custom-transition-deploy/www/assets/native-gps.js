(function expose(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.NativeGpsBridge = api;
}(globalThis, function createBridge() {
    // Polling updates only the screen. The Android service owns recording and speech.
    async function start(plugin, options, onState, onError, events = globalThis) {
        let closed = false, busy = false, cursor = 0, coordinates = [], timer;
        const consume = state => {
            if (state.startTime !== options.startTime) throw new Error('La sesión GPS cambió.');
            coordinates = state.offset === 0 ? state.coordinates : coordinates.concat(state.coordinates);
            cursor = state.cursor;
            onState({ nativeState:{ ...state, coordinates } });
        };
        const refresh = async () => {
            if (closed || busy) return;
            busy = true;
            try {
                const state = await plugin.getState({ cursor });
                if (closed) return;
                consume(state);
                if (!state.active) {
                    onError(new Error(state.error || 'El seguimiento nativo se detuvo.'));
                }
            } catch (error) { if (!closed) onError(error); }
            finally { busy = false; }
        };
        await plugin.start(options);
        await refresh();
        if (!closed) {
            timer = setInterval(refresh, 1000);
            events.addEventListener?.('mientrenador-resume', refresh);
        }
        return {
            type:'native',
            async stop() {
                if (closed) return;
                closed = true;
                clearInterval(timer);
                events.removeEventListener?.('mientrenador-resume', refresh);
                // Ignore in-flight polls; use the final native snapshot before summarizing.
                const state = await plugin.stop();
                consume(state);
            }
        };
    }
    return { start };
}));
