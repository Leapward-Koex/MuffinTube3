import { registerPlugin } from '@capacitor/core';

import type { CapacitorJsApiPlugin } from './definitions';

const CapacitorJsApi = registerPlugin<CapacitorJsApiPlugin>('CapacitorJsApi', {
  web: () => import('./web').then(m => new m.CapacitorJsApiWeb()),
});

export * from './definitions';
export { CapacitorJsApi };
