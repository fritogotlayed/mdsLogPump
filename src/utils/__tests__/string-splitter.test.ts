import { stringSplitter } from '../string-splitter';

describe('stringSplitter test', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('With a single json object in string emits one json string', async () => {
    // Act
    const input =
      '{"level":30,"time":1664199077924,"pid":14,"hostname":"06408133e744","reqId":"req-f","req":{"method":"GET","url":"/v1/configuration","hostname":"127.0.0.1:8081","remoteAddress":"::ffff:192.168.32.8","remotePort":51320},"name":"mdsCloudIdentity","msg":"incoming request"}';
    const result = stringSplitter(input);

    // Assert
    expect(result).toEqual([input]);
  });

  it('With multiple json objects in a string emits two json strings', () => {
    const input1 =
      '{"level":30,"time":1664199077924,"pid":14,"hostname":"06408133e744","reqId":"req-f","req":{"method":"GET","url":"/v1/configuration","hostname":"127.0.0.1:8081","remoteAddress":"::ffff:192.168.32.8","remotePort":51320},"name":"mdsCloudIdentity","msg":"incoming request"}';
    const input2 =
      '{"level":20,"time":1664199077924,"pid":14,"hostname":"06408133e744","nets":{"lo":[{"address":"127.0.0.1","netmask":"255.0.0.0","family":"IPv4","mac":"00:00:00:00:00:00","internal":true,"cidr":"127.0.0.1/8"}],"eth0":[{"address":"192.168.32.6","netmask":"255.255.240.0","family":"IPv4","mac":"02:42:c0:a8:20:06","internal":false,"cidr":"192.168.32.6/20"}]},"nicId":"eth0","net":[{"address":"192.168.32.6","netmask":"255.255.240.0","family":"IPv4","mac":"02:42:c0:a8:20:06","internal":false,"cidr":"192.168.32.6/20"}],"requestIp":"192.168.32.8","name":"mdsCloudIdentity","msg":"Network Request check origin info."}';
    const input = `${input1} ${input2}`;
    const result = stringSplitter(input);

    // Assert
    expect(result.length).toBe(2);
    expect(result).toEqual([input1, input2]);
  });
});
