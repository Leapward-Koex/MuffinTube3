import { WebPlugin } from '@capacitor/core';

import type { CapacitorJsApiPlugin } from './definitions';

export class CapacitorJsApiWeb extends WebPlugin implements CapacitorJsApiPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
  async executeFFMPEG(options: { value: string }): Promise<void> {
    console.log('executeFFMPEG', options);
    return;
  }

  async startYoutubeDownload(options: { callbackId: string, videoUrl: string, saveLocation: string }): Promise<void> {
    console.log('executeFFMPEG', options);
    return;
  }

  async initializeYoutubeDl() {
	console.log('initializeYoutubeDl');
    return { value: ""};
  }

  async openFolderPicker(): Promise<{ value: string }> {
    console.log('openFolderPicker');
    return { value: ""};
  }

  async readFileAsBase64(options: { value: string }) {
	console.log('readFileAsBase64', options);
	return { value: ""};
  }

  async writeFileFromBase64(options: { path: string, data: string }) {
	console.log('writeFileFromBase64', options);
	return;
  }
}
