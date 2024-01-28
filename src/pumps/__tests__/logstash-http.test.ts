import { write } from '../logstash-http';
import * as postMessage from '../../utils/post-message';

describe('write', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('calls postMessage when message has a time that is a number', () => {
    // Arrange
    const isoTime = '1970-01-01T00:02:03.000Z';
    const postMessageSpy = jest
      .spyOn(postMessage, 'postMessage')
      .mockImplementation(() => Promise.resolve(undefined));
    const settings = {
      loggingEndpoint: 'http://localhost:1234',
      metadata: {},
    };

    // Act
    write(settings, {
      level: 10,
      message: 'test',
      time: new Date(isoTime).getTime(),
      something: 'else',
    });

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith(settings, {
      '@timestamp': isoTime,
      time: new Date(isoTime).getTime(),
      level: 10,
      logLevel: 'TRACE',
      message: 'test',
      something: 'else',
    });
  });

  it('calls postMessage when message has a time that is a string', () => {
    // Arrange
    const isoTime = '1970-01-01T00:02:03.000Z';
    const postMessageSpy = jest
      .spyOn(postMessage, 'postMessage')
      .mockImplementation(() => Promise.resolve(undefined));
    const settings = {
      loggingEndpoint: 'http://localhost:1234',
      metadata: {},
    };

    // Act
    write(settings, {
      level: 10,
      message: 'test',
      time: isoTime,
      something: 'else',
    });

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith(settings, {
      '@timestamp': isoTime,
      time: isoTime,
      level: 10,
      logLevel: 'TRACE',
      message: 'test',
      something: 'else',
    });
  });

  it('calls postMessage when message has no time', () => {
    // Arrange
    const isoTime = new Date().toISOString();
    const postMessageSpy = jest
      .spyOn(postMessage, 'postMessage')
      .mockImplementation(() => Promise.resolve(undefined));
    const settings = {
      loggingEndpoint: 'http://localhost:1234',
      metadata: {},
    };

    // Act
    write(settings, {
      level: 10,
      message: 'test',
      something: 'else',
    });

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith(settings, {
      '@timestamp': isoTime,
      level: 10,
      logLevel: 'TRACE',
      message: 'test',
      something: 'else',
    });
  });

  it('calls postMessage when message has null time', () => {
    // Arrange
    const isoTime = new Date().toISOString();
    const postMessageSpy = jest
      .spyOn(postMessage, 'postMessage')
      .mockImplementation(() => Promise.resolve(undefined));
    const settings = {
      loggingEndpoint: 'http://localhost:1234',
      metadata: {},
    };

    // Act
    write(settings, {
      level: 10,
      message: 'test',
      something: 'else',
      time: null,
    });

    // Assert
    expect(postMessageSpy).toHaveBeenCalledWith(settings, {
      '@timestamp': isoTime,
      time: null,
      level: 10,
      logLevel: 'TRACE',
      message: 'test',
      something: 'else',
    });
  });
});
