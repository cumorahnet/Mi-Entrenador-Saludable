package com.mientrenadorsaludable.app;

import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.media.AudioAttributes;
import android.os.*;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.*;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Locale;

/** Owns recording and voice feedback; neither depends on the WebView timer. */
public class NativeGpsService extends Service {
    private static final String STORE = "native_gps", CHANNEL = "native_gps_tracking";
    private static final int NOTIFICATION = 2401;
    // Accessed only on the main thread (including plugin calls).
    private static JSONObject state;
    private static JSONArray route;
    private static NativeGpsService instance;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private GpsDistanceFilter filter = new GpsDistanceFilter();
    private FusedLocationProviderClient client;
    private TextToSpeech speech;
    private boolean speechReady, requesting;
    private long lastAnnouncement, lastPersist;
    private double announcedDistance;
    private String lastFeedback = "";

    private static void load(Context context) {
        if (state != null) return;
        try {
            state = new JSONObject(context.getSharedPreferences(STORE, MODE_PRIVATE).getString("state", "{}"));
        } catch (Exception e) { state = new JSONObject(); }
        route = state.optJSONArray("coordinates");
        if (route == null) route = new JSONArray();
    }

    private static void put(String key, Object value) {
        try { state.put(key, value); } catch (Exception e) { throw new IllegalStateException(e); }
    }

    private static void persist(Context context) {
        put("coordinates", route);
        context.getSharedPreferences(STORE, MODE_PRIVATE).edit().putString("state", state.toString()).apply();
    }

    static void prepare(Context context, long startTime, double distance, JSONArray coordinates) {
        load(context);
        if (state.optLong("startTime") != startTime) {
            state = new JSONObject(); route = coordinates == null ? new JSONArray() : coordinates;
            put("startTime", startTime);
            put("distance", Double.isFinite(distance) ? Math.max(0, distance) : 0);
            if (instance != null) {
                instance.filter = new GpsDistanceFilter();
                instance.lastAnnouncement = System.currentTimeMillis();
                instance.announcedDistance = state.optDouble("distance", 0);
                instance.lastFeedback = "";
            }
        }
        put("active", true); put("error", ""); put("stoppedAt", 0);
        persist(context);
    }

    static JSONObject snapshot(Context context, int cursor) throws Exception {
        load(context);
        long now = System.currentTimeMillis();
        boolean active = state.optBoolean("active");
        long until = active ? now : state.optLong("stoppedAt", now);
        JSONArray delta = new JSONArray();
        int offset = Math.max(0, Math.min(cursor, route.length()));
        for (int i = offset; i < route.length(); i++) delta.put(route.get(i));
        return new JSONObject().put("active", active).put("startTime", state.optLong("startTime"))
            .put("distance", state.optDouble("distance", 0))
            .put("time", Math.max(0, (until - state.optLong("startTime", until)) / 1000))
            .put("lastFixTime", state.optLong("lastFixTime"))
            .put("error", state.optString("error"))
            .put("cursor", route.length()).put("offset", offset).put("coordinates", delta);
    }

    static void finish(Context context) {
        load(context);
        if (state.optBoolean("active")) put("stoppedAt", System.currentTimeMillis());
        put("active", false);
        persist(context);
    }

    @Override public void onCreate() {
        super.onCreate(); instance = this; load(this);
        client = LocationServices.getFusedLocationProviderClient(this);
        if (Build.VERSION.SDK_INT >= 26) getSystemService(NotificationManager.class).createNotificationChannel(
            new NotificationChannel(CHANNEL, "Seguimiento de caminata y carrera", NotificationManager.IMPORTANCE_LOW));
        speech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int language = speech.setLanguage(new Locale("es", "MX"));
                speechReady = language >= TextToSpeech.LANG_AVAILABLE;
                speech.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            }
        });
    }

    private Notification notification() {
        Intent intent = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent open = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(this, CHANNEL).setSmallIcon(R.drawable.ic_stat_gps)
            .setContentTitle("Seguimiento GPS activo")
            .setContentText("Registra tu recorrido con la pantalla apagada. Abre la app para finalizar.")
            .setContentIntent(open).setOngoing(true).setOnlyAlertOnce(true).build();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (!state.optBoolean("active")) { stopSelf(); return START_NOT_STICKY; }
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIFICATION, notification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(NOTIFICATION, notification());
            if (!requesting) {
                requesting = true;
                lastAnnouncement = System.currentTimeMillis();
                announcedDistance = state.optDouble("distance", 0);
                LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 2000)
                    .setMinUpdateIntervalMillis(1000).setMaxUpdateDelayMillis(0).setWaitForAccurateLocation(true).build();
                client.requestLocationUpdates(request, callback, Looper.getMainLooper())
                    .addOnFailureListener(error -> fail("No se pudo obtener ubicación: " + error.getMessage()));
                handler.post(tick);
            }
        } catch (Exception e) { fail("No se pudo activar el seguimiento: " + e.getMessage()); }
        // Do not silently restart tracking after a process kill; resume explicitly from the app.
        return START_NOT_STICKY;
    }

    private void fail(String message) {
        put("error", message); finish(this);
        Log.e("NativeGps", message); stopSelf();
    }

    private final LocationCallback callback = new LocationCallback() {
        @Override public void onLocationResult(LocationResult result) {
            if (!state.optBoolean("active")) return;
            for (Location location : result.getLocations()) {
                long now = System.currentTimeMillis();
                double distance = filter.accept(location.getLatitude(), location.getLongitude(),
                    location.hasAccuracy() ? location.getAccuracy() : 999, location.getTime(), now);
                if (distance < 0) continue;
                put("lastFixTime", location.getTime());
                put("distance", state.optDouble("distance", 0) + distance);
                try {
                    // Store accepted movement plus initial fix; avoid stationary route noise.
                    if (distance > 0 || route.length() == 0) route.put(new JSONObject()
                        .put("lat", location.getLatitude()).put("lng", location.getLongitude())
                        .put("accuracy", location.getAccuracy()).put("timestamp", location.getTime()));
                } catch (Exception e) { fail("No se pudo guardar el recorrido."); return; }
                if (now - lastPersist >= 5000) { persist(NativeGpsService.this); lastPersist = now; }
            }
        }
    };

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (!state.optBoolean("active")) return;
            long now = System.currentTimeMillis();
            double distance = state.optDouble("distance", 0), progress = Math.max(0, distance - announcedDistance);
            long interval = now - lastAnnouncement;
            if (interval >= 60000 || (progress >= 100 && interval >= 30000)) {
                String key, text;
                if (now - state.optLong("lastFixTime") > 15000) {
                    key = "signal"; text = "La señal GPS es insuficiente. No puedo confirmar tu avance; busca un lugar con cielo despejado.";
                } else if (progress < 5) {
                    key = "still"; text = "El GPS no registra avance suficiente. Si estás caminando, revisa la señal.";
                } else {
                    key = "progress";
                    text = String.format(new Locale("es", "MX"),
                        "Distancia acumulada: %.0f metros. Velocidad del tramo: %.1f kilómetros por hora.",
                        distance, progress * 3600 / interval);
                }
                if (speechReady && (key.equals("progress") || !key.equals(lastFeedback)))
                    speech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "gps-feedback");
                lastFeedback = key; announcedDistance = distance; lastAnnouncement = now;
            }
            handler.postDelayed(this, 1000);
        }
    };

    @Override public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (client != null) client.removeLocationUpdates(callback);
        if (speech != null) { speech.stop(); speech.shutdown(); }
        finish(this); instance = null; stopForeground(true);
        super.onDestroy();
    }
    @Override public void onTaskRemoved(Intent rootIntent) { finish(this); stopSelf(); }
    @Override public IBinder onBind(Intent intent) { return null; }
}
