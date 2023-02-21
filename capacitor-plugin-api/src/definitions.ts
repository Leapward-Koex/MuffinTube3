export interface CapacitorJsApiPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  executeFFMPEG(options: { value: string }): Promise<void>;
  startYoutubeDownload(options: { callbackId: string, videoUrl: string, saveLocation: string }): Promise<void>;
  initializeYoutubeDl(): Promise<{ value: string }>;
  openFolderPicker(): Promise<{ value: string }>
  readFileAsBase64(options: { value: string }): Promise<{ value: string }>;
  writeFileFromBase64(options: { path: string, data: string }): Promise<void>;
}
