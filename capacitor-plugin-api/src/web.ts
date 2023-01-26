import { WebPlugin } from '@capacitor/core';

import type { CapacitorJsApiPlugin } from './definitions';

export class CapacitorJsApiWeb extends WebPlugin implements CapacitorJsApiPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
