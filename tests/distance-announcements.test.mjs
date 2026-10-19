import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import logic from '../www/assets/app-logic.js';

it('formats only the milestone and elapsed minutes, including hours', () => {
    expect(logic.getDistanceMilestoneSpeech(1000, 3599)).toBe('Kil\u00f3metro 1, en 59 minutos.');
    expect(logic.getDistanceMilestoneSpeech(2000, 3600)).toBe('Kil\u00f3metro 2, en 1 hora con 0 minutos.');
    expect(logic.getDistanceMilestoneSpeech(5000, 4020)).toBe('Kil\u00f3metro 5, en 1 hora con 7 minutos.');
    expect(logic.getDistanceMilestoneSpeech(500, 60)).toBe('Kil\u00f3metro 0,5, en 1 minuto.');
    expect(logic.getDistanceMilestoneSpeech(10000, 7260)).toBe('Kil\u00f3metro 10, en 2 horas con 1 minuto.');
});

it('keeps distance milestones across timed reports, overshoot and simultaneous triggers', () => {
    const source = readFileSync('www/assets/app.js', 'utf8');
    const start = source.indexOf('        gpsAnnounceIntervalRef.current = setInterval(() => {');
    const end = source.indexOf('        }, 1000);', start);
    let tick;
    const context = { ...logic, setInterval:fn => { tick = fn; },
        statusRef:{ current:'gps-running' }, gpsStoppingRef:{ current:false }, isNativeRuntime:() => false,
        resumeVoice:vi.fn(), gpsStartTime:{ current:1000 }, gpsTotalTime:{ current:0 },
        gpsTotalDistance:{ current:900 }, gpsLastFixTime:{ current:300000 },
        gpsFeedbackRef:{ current:{ distance:0, time:0, key:null } }, gpsDistanceAnnouncedRef:{ current:0 },
        gpsAnnouncementDistanceRef:{ current:1000 }, gpsAnnouncementIntervalRef:{ current:300000 },
        gpsAnnounceLastTime:{ current:1000 }, gpsAnnounceIntervalRef:{ current:null },
        setLiveGpsMetrics:vi.fn(), setGpsSignalText:vi.fn(), speak:vi.fn(), Date:{ now:() => 301000 } };
    runInNewContext(source.slice(start, end) + '        }, 1000);', context);
    tick(); // timed report before the first kilometer
    expect(context.gpsDistanceAnnouncedRef.current).toBe(0);
    context.speak.mockClear();
    context.gpsTotalDistance.current = 3100;
    context.Date.now = () => 601000;
    tick(); // three crossed milestones and a timed report due together
    expect(context.speak.mock.calls.map(call => call[0])).toEqual([1000, 2000, 3000].map(m => logic.getDistanceMilestoneSpeech(m, 600)));
    tick();
    expect(context.gpsDistanceAnnouncedRef.current).toBe(3000);
    expect(context.speak.mock.calls.filter(call => call[0].startsWith('Kil'))).toHaveLength(3);
});
