package com.yorha.plugins.muffintube;

import static android.content.ContentValues.TAG;

import android.util.Log;
import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.ReturnCode;
import com.arthenica.ffmpegkit.SessionState;
import com.getcapacitor.PluginCall;

public class CapacitorJsApi {

    public String echo(String value) {
        Log.i("Echo", value);
        return value;
    }

    public void executeFFMPEG(String command, PluginCall call) {
        FFmpegKit.executeAsync(command, session -> {
            SessionState state = session.getState();
            ReturnCode returnCode = session.getReturnCode();

            // CALLED WHEN SESSION IS EXECUTED

            Log.d(TAG, String.format("FFmpeg process exited with state %s and rc %s.%s", state, returnCode, session.getFailStackTrace()));
            if (returnCode.isValueSuccess()) {
                call.resolve();
            } else {
                call.resolve();
            }
        }, log -> {

            // CALLED WHEN SESSION PRINTS LOGS

        }, statistics -> {

        });
    }
}
