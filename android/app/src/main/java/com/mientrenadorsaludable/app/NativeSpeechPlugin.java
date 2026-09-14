package com.mientrenadorsaludable.app;

import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "NativeSpeech")
public class NativeSpeechPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private static final String TAG = "NativeSpeech";

    private static final class PendingSpeech {
        final PluginCall call;
        final String text;
        final boolean interrupt;

        PendingSpeech(PluginCall call, String text, boolean interrupt) {
            this.call = call;
            this.text = text;
            this.interrupt = interrupt;
        }
    }

    private final Object initializationLock = new Object();
    private final ArrayDeque<PendingSpeech> initializationQueue = new ArrayDeque<>();
    private final Map<String, PluginCall> activeCalls = new ConcurrentHashMap<>();

    private TextToSpeech textToSpeech;
    private AudioManager audioManager;
    private AudioAttributes speechAudioAttributes;
    private AudioFocusRequest audioFocusRequest;
    private volatile boolean initialized = false;
    private volatile boolean ready = false;

    private final AudioManager.OnAudioFocusChangeListener audioFocusListener = focusChange ->
            Log.d(TAG, "Cambio de foco de audio: " + focusChange);

    @Override
    public void load() {
        audioManager = (AudioManager) getContext().getSystemService(android.content.Context.AUDIO_SERVICE);
        Log.i(TAG, "Inicializando motor TextToSpeech");
        textToSpeech = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        Log.i(TAG, "Callback onInit recibido. Estado=" + status);
        boolean available = status == TextToSpeech.SUCCESS && textToSpeech != null;

        if (available) {
            available = selectSupportedLanguage();
        }

        if (available) {
            textToSpeech.setSpeechRate(1.05f);
            speechAudioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            textToSpeech.setAudioAttributes(speechAudioAttributes);
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    Log.i(TAG, "Locución iniciada: " + utteranceId);
                }

                @Override
                public void onDone(String utteranceId) {
                    Log.i(TAG, "Locución terminada: " + utteranceId);
                    resolveCall(utteranceId);
                }

                @Override
                public void onStop(String utteranceId, boolean interrupted) {
                    resolveCall(utteranceId);
                }

                @Override
                public void onError(String utteranceId) {
                    Log.e(TAG, "Error de reproducción: " + utteranceId);
                    rejectCall(utteranceId, "No se pudo reproducir la voz nativa.");
                }

                @Override
                public void onError(String utteranceId, int errorCode) {
                    Log.e(TAG, "Error de reproducción " + errorCode + ": " + utteranceId);
                    rejectCall(utteranceId, "No se pudo reproducir la voz nativa (código " + errorCode + ").");
                }
            });
        }

        List<PendingSpeech> pending;
        synchronized (initializationLock) {
            initialized = true;
            ready = available;
            pending = new ArrayList<>(initializationQueue);
            initializationQueue.clear();
        }

        Log.i(TAG, "Motor TextToSpeech inicializado. Disponible=" + available);

        for (PendingSpeech request : pending) {
            if (available) {
                speakNow(request);
            } else {
                request.call.reject("El motor de voz de Android no está disponible.", "TTS_UNAVAILABLE");
            }
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        ensureForegroundVoiceSession();
        String text = call.getString("text", "");
        boolean interrupt = Boolean.TRUE.equals(call.getBoolean("interrupt", false));

        if (text == null || text.trim().isEmpty()) {
            call.resolve();
            return;
        }

        PendingSpeech request = new PendingSpeech(call, text.trim(), interrupt);
        List<PendingSpeech> flushed = new ArrayList<>();

        synchronized (initializationLock) {
            if (!initialized) {
                if (interrupt) {
                    flushed.addAll(initializationQueue);
                    initializationQueue.clear();
                }
                initializationQueue.add(request);
                for (PendingSpeech oldRequest : flushed) {
                    oldRequest.call.resolve();
                }
                return;
            }
        }

        if (!ready || textToSpeech == null) {
            call.reject("El motor de voz de Android no está disponible.", "TTS_UNAVAILABLE");
            return;
        }

        speakNow(request);
    }

    private void speakNow(PendingSpeech request) {
        if (request.interrupt && !activeCalls.isEmpty()) {
            for (PluginCall activeCall : activeCalls.values()) activeCall.resolve();
            activeCalls.clear();
        }

        requestAudioFocus();
        String utteranceId = "speech-" + UUID.randomUUID();
        activeCalls.put(utteranceId, request.call);
        int queueMode = request.interrupt ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD;
        Bundle parameters = new Bundle();
        parameters.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
        Log.i(TAG, "Reproduciendo: " + request.text);
        int result = textToSpeech.speak(request.text, queueMode, parameters, utteranceId);
        if (result == TextToSpeech.ERROR) {
            rejectCall(utteranceId, "Android rechazó la solicitud de voz.");
        }
    }

    private void requestAudioFocus() {
        if (audioManager == null || speechAudioAttributes == null) return;

        int result;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest == null) {
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                        .setAudioAttributes(speechAudioAttributes)
                        .setOnAudioFocusChangeListener(audioFocusListener)
                        .build();
            }
            result = audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            result = audioManager.requestAudioFocus(
                    audioFocusListener,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
            );
        }
        Log.i(TAG, "Solicitud de foco de audio: " + result);
    }

    private void releaseAudioFocusIfIdle() {
        if (audioManager == null || !activeCalls.isEmpty()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
        } else {
            audioManager.abandonAudioFocus(audioFocusListener);
        }
    }

    private boolean selectSupportedLanguage() {
        Locale[] preferredLanguages = {
                new Locale("es", "MX"),
                new Locale("es", "ES"),
                Locale.getDefault(),
                Locale.US
        };

        for (Locale language : preferredLanguages) {
            int support = textToSpeech.isLanguageAvailable(language);
            Log.i(TAG, "Compatibilidad de idioma " + language.toLanguageTag() + ": " + support);
            if (support == TextToSpeech.LANG_MISSING_DATA || support == TextToSpeech.LANG_NOT_SUPPORTED) {
                continue;
            }
            int result = textToSpeech.setLanguage(language);
            Log.i(TAG, "Selección de idioma " + language.toLanguageTag() + ": " + result);
            if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                return true;
            }
        }
        return false;
    }

    private void resolveCall(String utteranceId) {
        PluginCall call = activeCalls.remove(utteranceId);
        if (call != null) call.resolve();
        releaseAudioFocusIfIdle();
    }

    private void rejectCall(String utteranceId, String message) {
        PluginCall call = activeCalls.remove(utteranceId);
        if (call != null) call.reject(message, "TTS_PLAYBACK_ERROR");
        releaseAudioFocusIfIdle();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        List<PendingSpeech> pending;
        synchronized (initializationLock) {
            pending = new ArrayList<>(initializationQueue);
            initializationQueue.clear();
        }
        for (PendingSpeech request : pending) request.call.resolve();
        if (textToSpeech != null) textToSpeech.stop();
        for (PluginCall activeCall : activeCalls.values()) activeCall.resolve();
        activeCalls.clear();
        releaseAudioFocusIfIdle();
        call.resolve();
    }

    @PluginMethod
    public void warmup(PluginCall call) {
        ensureForegroundVoiceSession();
        JSObject result = new JSObject();
        result.put("initialized", initialized);
        result.put("ready", ready);
        call.resolve(result);
    }

    @PluginMethod
    public void endSession(PluginCall call) {
        try {
            getContext().stopService(new Intent(getContext(), SpeechForegroundService.class));
        } catch (Exception error) {
            Log.w(TAG, "No se pudo detener el servicio de guía de voz", error);
        }
        call.resolve();
    }

    private void ensureForegroundVoiceSession() {
        try {
            Intent intent = new Intent(getContext(), SpeechForegroundService.class);
            ContextCompat.startForegroundService(getContext(), intent);
        } catch (Exception error) {
            Log.w(TAG, "No se pudo iniciar el servicio de guía de voz", error);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        activeCalls.clear();
        releaseAudioFocusIfIdle();
        ready = false;
        super.handleOnDestroy();
    }
}
