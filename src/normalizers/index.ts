import { Normalizer } from '../types';
import { BunyanNormalizer } from './bunyan';
import { PinoNormalizer } from './pino';

export * from './bunyan';
export * from './pino';

export function getNormalizer(key: string): Normalizer {
  switch (key) {
    case 'pino':
      return new PinoNormalizer();
    case 'bunyan':
      return new BunyanNormalizer();
    default:
      throw new Error(`Normalizer ${key} not understood`);
  }
}
