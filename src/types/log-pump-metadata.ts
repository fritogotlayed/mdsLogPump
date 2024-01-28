export interface LogPumpMetadata {
  level: number;
  time?: number | string | null;
  [key: string]: unknown;
}
