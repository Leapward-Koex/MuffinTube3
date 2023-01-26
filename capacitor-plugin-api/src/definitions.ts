export interface CapacitorJsApiPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
