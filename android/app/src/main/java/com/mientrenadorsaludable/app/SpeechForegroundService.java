package com.mientrenadorsaludable.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * Mantiene la sesión de guía como trabajo visible para que Android no silencie
 * las instrucciones TTS cuando se apaga la pantalla o la actividad queda atrás.
 */
public class SpeechForegroundService extends Service {
    private static final String CHANNEL_ID = "mientrenador_voice_guidance";
    private static final int NOTIFICATION_ID = 4201;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openApp, pendingFlags);

        startForeground(
                NOTIFICATION_ID,
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(getApplicationInfo().icon)
                        .setContentTitle("Guía de entrenamiento activa")
                        .setContentText("Las indicaciones de voz continuarán durante tu sesión.")
                        .setContentIntent(contentIntent)
                        .setOngoing(true)
                        .setOnlyAlertOnce(true)
                        .setPriority(NotificationCompat.PRIORITY_LOW)
                        .setCategory(NotificationCompat.CATEGORY_SERVICE)
                        .build()
        );
        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopForeground(true);
        super.onDestroy();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Indicaciones de voz",
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Mantiene activas las indicaciones durante el entrenamiento.");
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }
}
