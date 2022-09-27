import { LogPumpMessage } from '../types/log-pump-message';
import { Normalizer } from '../types/normalizer';
import { stringSplitter } from '../utils';

// {"name":"mdsCloudFileService","hostname":"frito-desktop","pid":1196681,"level":30,"msg":"Example app listening on port 8888!","time":"2022-09-27T16:51:36.929Z","v":0}
export class BunyanNormalizer implements Normalizer {
  normalize(message: string): LogPumpMessage[] {
    const messages: LogPumpMessage[] = [];
    const strings = stringSplitter(message);

    strings.forEach((msg) => {
      try {
        const data = JSON.parse(msg);
        const outData = {
          ...data,
          message: data.msg,
          time: +new Date(data.time), // Convert ISO timestamp to EPOCH
        };
        delete outData.msg;
        messages.push(outData);
      } catch (err) {
        messages.push({
          level: 30,
          message,
          time: Math.floor(+new Date() / 1000), // EPOCH timestamp
        });
      }
    });

    return messages;
  }
}