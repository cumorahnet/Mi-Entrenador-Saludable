package com.mientrenadorsaludable.app;

import android.Manifest;
import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "NativeGps", permissions = {
    @Permission(alias = "location", strings = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION })
})
public class NativeGpsPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermissionResult");
            return;
        }
        begin(call);
    }

    @PermissionCallback
    private void locationPermissionResult(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Activa la ubicación precisa para registrar caminatas y carreras.", "LOCATION_PERMISSION_DENIED");
            return;
        }
        begin(call);
    }

    private void begin(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                long startTime = call.getLong("startTime", System.currentTimeMillis());
                if (startTime <= 0 || startTime > System.currentTimeMillis() + 1000) {
                    call.reject("Inicio de seguimiento inválido.");
                    return;
                }
                NativeGpsService.prepare(getContext(), startTime, call.getDouble("distance", 0.0), call.getArray("coordinates"));
                ContextCompat.startForegroundService(getContext(), new Intent(getContext(), NativeGpsService.class));
                call.resolve();
            } catch (Exception e) {
                NativeGpsService.finish(getContext());
                call.reject("No se pudo iniciar el GPS. Abre la app e inténtalo de nuevo.", e);
            }
        });
    }

    @PluginMethod
    public void getState(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try { call.resolve(JSObject.fromJSONObject(NativeGpsService.snapshot(getContext(), call.getInt("cursor", 0)))); }
            catch (Exception e) { call.reject("No se pudo recuperar el seguimiento.", e); }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            NativeGpsService.finish(getContext());
            getContext().stopService(new Intent(getContext(), NativeGpsService.class));
            try { call.resolve(JSObject.fromJSONObject(NativeGpsService.snapshot(getContext(), 0))); }
            catch (Exception e) { call.reject("No se pudo recuperar el resumen GPS.", e); }
        });
    }
}
