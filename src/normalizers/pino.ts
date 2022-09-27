import { LogPumpMessage } from '../types/log-pump-message';
import { Normalizer } from '../types/normalizer';
import { stringSplitter } from '../utils';

export class PinoNormalizer implements Normalizer {
  normalize(message: string): LogPumpMessage[] {
    const messages: LogPumpMessage[] = [];
    const strings = stringSplitter(message);

    strings.forEach((msg) => {
      try {
        const data = JSON.parse(msg);
        const outData = {
          ...data,
          message: data.msg,
        };
        delete outData.msg;
        messages.push(outData);
      } catch (err) {
        messages.push({
          level: 30,
          message,
          time: Math.floor(+new Date() / 1000), // EPOC timestamp
        });
      }
    });

    return messages;
  }
}
