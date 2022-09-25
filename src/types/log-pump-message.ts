import { LogPumpMetadata } from './log-pump-metadata';

export interface LogPumpMessage extends LogPumpMetadata {
  message: string;
}
