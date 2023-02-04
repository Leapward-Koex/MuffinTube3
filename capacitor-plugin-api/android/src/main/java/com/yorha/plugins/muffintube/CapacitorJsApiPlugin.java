package com.yorha.plugins.muffintube;

import static android.content.ContentValues.TAG;

import android.content.Intent;
import android.os.Debug;
import android.util.Base64;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.yausername.ffmpeg.FFmpeg;
import com.yausername.youtubedl_android.YoutubeDL;
import com.yausername.youtubedl_android.YoutubeDLException;
import com.yausername.youtubedl_android.YoutubeDLRequest;
import com.yausername.youtubedl_android.mapper.VideoInfo;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@CapacitorPlugin(name = "CapacitorJsApi")
public class CapacitorJsApiPlugin extends Plugin {

    private final CapacitorJsApi implementation = new CapacitorJsApi();

    static final int PICKFILE_RESULT_CODE = 5;

    @PluginMethod()
    public void openFolderPicker(PluginCall call) {
        Intent chooseFolderIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE); // Intent.ACTION_OPEN_DOCUMENT, Intent.ACTION_OPEN_DOCUMENT_TREE

        chooseFolderIntent.addCategory(Intent.CATEGORY_DEFAULT);
        startActivityForResult(call, Intent.createChooser(chooseFolderIntent, "Choose directory"), "pickFolderResult");
    }

    @ActivityCallback
    private void pickFolderResult(PluginCall call, ActivityResult result) {
        JSObject ret = new JSObject();
        String folderPath = "";
        if (result.getData() != null) {
            folderPath = UriConverter.CovertFromUri(getContext(), result.getData().getDataString());
        }

        ret.put("value", folderPath == null ? "" : folderPath);
        call.resolve(ret);
    }

    @PluginMethod
    public void initializeYoutubeDl(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            YoutubeDL.getInstance().init(getContext());
            FFmpeg.getInstance().init(getContext());
            ret.put("value", true);
        } catch (YoutubeDLException e) {
            Log.e(TAG, "failed to initialize youtubedl-android", e);
            ret.put("value", false);
        }

        call.resolve(ret);
    }

    @PluginMethod
    public void startYoutubeDownload(PluginCall call) {
        String callbackId = call.getString("callbackId");
        String videoUrl = call.getString("videoUrl");
        String saveLocation = call.getString("saveLocation");

        // Meta Data
        try {
            VideoInfo videoInfo = this.loadMetaData(videoUrl, callbackId);
            String fileTempOutput = Paths.get(getContext().getCacheDir().toString(), UUID.randomUUID().toString() + ".mp3").toString();
            String finalFileOutput = Paths.get(saveLocation, videoInfo.getTitle().replaceAll("[\\\\/:*?\"<>|]", "") + ".mp3").toString();

            YoutubeDLRequest request = new YoutubeDLRequest(videoUrl);
            request.addOption("-f", "bestaudio");
            request.addOption("--extract-audio");
            request.addOption("--audio-format", "mp3");
            request.addOption("--audio-quality", "0");
            request.addOption("--no-warnings");
            request.addOption("--no-check-certificate");
            request.addOption("--no-playlist");
            request.addOption("--youtube-skip-dash-manifest");
            request.addOption("-o", fileTempOutput);

            YoutubeDL.getInstance().execute(request, (progress, etaInSeconds, line) -> {
                if (progress > 0) {
                    JSObject ret = new JSObject();
                    ret.put("callbackId", callbackId);
                    ret.put("percentageComplete", progress / 100);
                    notifyListeners("downloadTaskProgress", ret);
                }
            });
            JSObject ret =  new JSObject();
            ret.put("callbackId", callbackId);
            ret.put("outputFile", finalFileOutput);
            JSObject videoMetaData = new JSObject();
            videoMetaData.put("title", videoInfo.getTitle());
            videoMetaData.put("imageUrl", videoInfo.getThumbnail());
            ret.put("metaData", videoMetaData);
            notifyListeners("downloadTaskDownloaded", ret);

            Files.move(Paths.get(fileTempOutput), Paths.get(finalFileOutput), StandardCopyOption.REPLACE_EXISTING);
            Files.delete(Paths.get(fileTempOutput));

        } catch (Exception e) {
            e.printStackTrace();
        }
        call.resolve();
    }

    private void copyFile(File src, File dst) throws IOException {
        FileInputStream var2 = new FileInputStream(src);
        FileOutputStream var3 = new FileOutputStream(dst);
        byte[] var4 = new byte[1024];

        int var5;
        while((var5 = var2.read(var4)) > 0) {
            var3.write(var4, 0, var5);
        }

        var2.close();
        var3.close();
    }

    private VideoInfo loadMetaData(String videoUrl, String callbackId) throws YoutubeDLException, InterruptedException {
        VideoInfo streamInfo = YoutubeDL.getInstance().getInfo(videoUrl);
        JSObject videoMetaData = new JSObject();
        videoMetaData.put("title", streamInfo.getTitle());
        videoMetaData.put("imageUrl", streamInfo.getThumbnail());

        JSObject ret = new JSObject();
        ret.put("callbackId", callbackId);
        ret.put("metaData", videoMetaData);

        notifyListeners("downloadTaskMetaData", ret);
        return streamInfo;
    }

    @PluginMethod
    public void readFileAsBase64(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        try {
            ret.put("value", Base64.encodeToString(Files.readAllBytes(
                    Paths.get(value)), 0));
            call.resolve(ret);
        } catch (IOException e) {
            ret.put("value", "");
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void writeFileFromBase64(PluginCall call) {
        String path = call.getString("path");
        String base64Data = call.getString("data");
        byte[] byteBuffer = Base64.decode(base64Data, 0);
        try {
            Files.write(Paths.get(path), byteBuffer, StandardOpenOption.WRITE);
        } catch (IOException e) {
            e.printStackTrace();
        }
        call.resolve();
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", implementation.echo(value));
        call.resolve(ret);
    }

    @PluginMethod
    public void executeFFMPEG(PluginCall call) {
        implementation.executeFFMPEG(call.getString("value"), call);
    }
}
