import { LogstashHttpConfiguration } from '../pumps/logstash-http';
import { parse } from 'url';
import { request as httpsRequest } from 'https';
import { request as httpRequest } from 'http';
import { inspect } from 'util';

interface WebResponseData {
  statusCode: number;
}

export function postMessage(
  settings: LogstashHttpConfiguration,
  message: Record<string, unknown> | undefined | null,
) {
  // TODO: implement
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
}
