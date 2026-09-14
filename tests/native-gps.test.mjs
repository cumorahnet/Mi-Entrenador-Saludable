import { afterEach, expect, it, vi } from 'vitest';
import bridge from '../www/assets/native-gps.js';

afterEach(() => vi.useRealTimers());

it('recupera el recorrido nativo sin duplicarlo y obtiene el último dato al finalizar', async () => {
    vi.useFakeTimers();
    const first = { lat:1, lng:1 }, second = { lat:2, lng:2 };
    const base = { startTime:1000, active:true, distance:10, time:10, lastFixTime:1000 };
    const plugin = {
        start:vi.fn().mockResolvedValue({}),
        getState:vi.fn()
            .mockResolvedValueOnce({ ...base, cursor:1, offset:0, coordinates:[first] })
            .mockResolvedValueOnce({ ...base, cursor:2, offset:1, coordinates:[second], distance:20 }),
        stop:vi.fn().mockResolvedValue({ ...base, active:false, cursor:2, offset:0,
            coordinates:[first, second], distance:25, time:12 })
    };
    const update = vi.fn(), error = vi.fn();
    const events = { addEventListener:vi.fn(), removeEventListener:vi.fn() };
    const watch = await bridge.start(plugin, { startTime:1000 }, update, error, events);
    await vi.advanceTimersByTimeAsync(1000);
    expect(plugin.getState.mock.calls[1][0]).toEqual({ cursor:1 });
    expect(update.mock.calls.at(-1)[0].nativeState.coordinates).toEqual([first, second]);
    await watch.stop();
    expect(update.mock.calls.at(-1)[0].nativeState.distance).toBe(25);
    await vi.advanceTimersByTimeAsync(5000);
    expect(plugin.getState).toHaveBeenCalledTimes(2);
    expect(events.removeEventListener).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
});

it('ignora una lectura en vuelo después de detener el servicio', async () => {
    vi.useFakeTimers();
    const base = { startTime:1000, active:true, cursor:0, offset:0, coordinates:[] };
    let resolvePoll;
    const plugin = { start:vi.fn().mockResolvedValue({}),
        getState:vi.fn().mockResolvedValueOnce(base).mockImplementationOnce(() => new Promise(resolve => { resolvePoll = resolve; })),
        stop:vi.fn().mockResolvedValue({ ...base, active:false, distance:42 }) };
    const update = vi.fn();
    const watch = await bridge.start(plugin, { startTime:1000 }, update, vi.fn(), {});
    await vi.advanceTimersByTimeAsync(1000);
    await watch.stop();
    resolvePoll({ ...base, distance:12 });
    await vi.advanceTimersByTimeAsync(1);
    expect(update.mock.calls.at(-1)[0].nativeState.distance).toBe(42);
});

it('propaga denegación de permiso sin crear temporizadores', async () => {
    vi.useFakeTimers();
    const plugin = { start:vi.fn().mockRejectedValue(new Error('permission')), getState:vi.fn() };
    await expect(bridge.start(plugin, { startTime:1000 }, vi.fn(), vi.fn(), {})).rejects.toThrow('permission');
    expect(plugin.getState).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
});
