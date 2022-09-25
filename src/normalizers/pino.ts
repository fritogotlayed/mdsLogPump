import { LogPumpMessage } from '../types/log-pump-message';
import { Normalizer } from '../types/normalizer';

export class PinoNormalizer implements Normalizer {
  normalize(message: string): LogPumpMessage {
    try {
      const data = JSON.parse(message);
      const outData = {
        ...data,
        message: data.msg,
      };
      delete outData.msg;
      return outData;
    } catch (err) {
      return {
        level: 30,
        message,
        time: Math.floor(+new Date() / 1000), // EPOC timestamp
      };
    }
  }
}
