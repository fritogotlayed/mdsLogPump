import { LogPumpMessage } from './log-pump-message';

export interface Normalizer {
  normalize(message: string): LogPumpMessage[];
}
