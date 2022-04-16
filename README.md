# MuffinTube3

My third attempt at making a YoutubeDl GUI.

This time its a Electron app with a React renderer.

This app is created for windows and has a simple GUI for converting youtube videos to MP3.
Audio is ripped from the video at the highest availalbe quality, converted to ~240Kb/s VBR MP3 files using libmp3lame.
The thumbnail of the video is embeded as the album art and the title of the video is by default set as the MP3 track name. The trackname and track artist name can be changed from within the UI.

The supports 2 youtube-dl variants, Youtube-DL (https://github.com/ytdl-org/youtube-dl) and YT-DLP (https://github.com/yt-dlp/yt-dlp). YT-DLP is generally faster on most types of videos. The app automatically checks for updated version of the two youtube-dl variants so the app will never be broken due to outdated youtube-dl variants.

The variant of youtube-dl can be selected from the settings menu.

![image](https://user-images.githubusercontent.com/30615050/163665634-3beb0d5c-69cc-4fd4-a0f5-9dac24e51dcd.png)
