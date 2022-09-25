// https://github.com/MadDonkeySoftware/mdsCloudNotificationService/blob/master/src/bunyan-logstash-http.js
// const util = require('util');
// const url = require('url');
import { inspect } from 'util';
import { parse } from 'url';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { LogPumpMessage, LogPumpMetadata } from '../types';

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

interface WebResponseData {
  statusCode: number;
}

const postMessage = function postMessage(
  settings: LogstashHttpConfiguration,
  message: Record<string, unknown> | undefined | null,
) {
  if (!message) return Promise.resolve();

  const data = JSON.stringify(message);
  const parsedUrl = parse(settings.loggingEndpoint);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const request = parsedUrl.protocol === 'https:' ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      const resp: WebResponseData = {
        statusCode: res.statusCode,
      };
      res.socket.destroy();
      resolve(resp);
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code !== 'ECONNREFUSED') {
        const msg = inspect(err, false, null, true);
        process.stderr.write(`${msg}\n`);
      }
      reject(err);
    });
    req.write(data);
    req.end();
  }).then((resp: WebResponseData) => {
    const resolve = resp.statusCode < 400;
    return resolve ? Promise.resolve() : Promise.reject();
  });
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
  const timestamp =
    typeof metadata.time === 'number'
      ? new Date(metadata.time).toISOString()
      : metadata.time;
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
