#!/usr/bin/env node

// import minimist from 'minimist';
import { parse } from 'secure-json-parse';
import JoyCon from 'joycon';
import { dirname } from 'path';
import { write } from './pumps/logstash-http';
import { PinoNormalizer } from './normalizers';

// https://www.npmjs.com/package/joycon
const VALID_CONFIG_FILES = [
  'mds-log-pump.config.json',
  '.mds-log-pumprc',
  '.mds-log-pumprc.json',
];

// Have a wrapper for now so we can implement removing JSON comments
// in a future iteration.
const secureParseJSON = (input: string) => parse(input);

const loadConfigs = new JoyCon({
  parseJSON: secureParseJSON,
  files: VALID_CONFIG_FILES,
  stopDir: dirname(process.cwd()),
});

// TODO: Allow config via CLI flags
// const flags = minimist(process.argv.slice(2), {
//   alias: {
//     source: 's',
//     pump: 'd',
//     mode: 'm',
//     host: 'h',
//     port: 'p',
//   },
// });

// const allowedFlags = [
//   'source',
//   'pump',
//   'mode',
//   'host',
//   'port',
// ];

const configMeta = loadConfigs.loadSync();
const configData = configMeta.data;

const normalizer = new PinoNormalizer();
process.stdin.on('data', (data) => {
  const payload = normalizer.normalize(data.toString());
  payload.forEach((message) => {
    if (configData.echo) {
      console.log(JSON.stringify(message));
    }
    write(
      {
        loggingEndpoint: `${configData.mode}://${configData.host}:${configData.port}`,
      },
      message,
    );
  });
});

// --pump logstashHttp --mode http --host localhost --port 6002
