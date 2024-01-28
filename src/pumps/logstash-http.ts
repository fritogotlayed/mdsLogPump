// https://github.com/MadDonkeySoftware/mdsCloudNotificationService/blob/master/src/bunyan-logstash-http.js
import { LogPumpMessage, LogPumpMetadata } from '../types';
import { postMessage } from '../utils/post-message';

let retryHandle: NodeJS.Timer | undefined;
const retryMessages: unknown[] = [];

const nameFromLevel: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

export interface LogstashHttpConfiguration {
  loggingEndpoint: string;
  metadata?: Record<string, unknown>;
}

const computeTimestamp = (input?: number | string | null) => {
  if (input) {
    if (typeof input === 'string') {
      return input;
    }
    if (typeof input === 'number') {
      return new Date(input).toISOString();
    }
  }
  return new Date().toISOString();
};

const log = (
  settings: LogstashHttpConfiguration,
  level: string,
  message: string,
  metadata: LogPumpMetadata,
) => {
  const meta = {
    ...settings.metadata,
    ...metadata,
  };
  const timestamp = computeTimestamp(metadata.time);
  const packagedMessage = {
    '@timestamp': timestamp,
    logLevel: level,
    message,
    ...meta,
  };

  /* istanbul ignore if */
  if (retryMessages.length > 0) {
    retryMessages.push(packagedMessage);
  }
  return postMessage(settings, packagedMessage).catch((err) => {
    /* istanbul ignore if */
    if (err.code === 'ECONNREFUSED') {
      retryMessages.unshift(packagedMessage);
      if (!retryHandle) {
        retryHandle = setInterval(() => {
          const msg = retryMessages.pop() as Record<string, unknown>;
          postMessage(settings, msg)
            .then(() => {
              if (retryMessages.length === 0) {
                clearInterval(retryHandle);
                retryHandle = undefined;
              }
            })
            .catch(() => retryMessages.unshift(msg));
        }, 500);
      }
    } else {
      throw err;
    }
  });
};

export const write = (
  settings: LogstashHttpConfiguration,
  // record: string | Record<string, unknown>,
  record: LogPumpMessage,
) => {
  const levelName: string = nameFromLevel[record.level];
  const message = {
    msg: record.message,
  };

  const meta = { ...record, ...message };
  delete meta.msg;
  delete meta.message;
  return log(settings, levelName, message.msg, meta);
};

export default write;
