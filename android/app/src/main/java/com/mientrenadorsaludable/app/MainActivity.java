package com.mientrenadorsaludable.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeSpeechPlugin.class);
        registerPlugin(NativeGpsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
