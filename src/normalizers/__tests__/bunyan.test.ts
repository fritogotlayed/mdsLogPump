import { BunyanNormalizer } from '../bunyan';

describe('PinoNormalizer tests', () => {
  const normalizer = new BunyanNormalizer();

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('With a single json object in string emits one json string', async () => {
    // Arrange
    const input =
      '{"name":"mdsCloudFileService","hostname":"frito-desktop","pid":1196681,"level":30,"msg":"Example app listening on port 8888!","time":"2022-09-26T13:31:17.924Z","v":0}';

    // Act
    const results = normalizer.normalize(input);

    // Assert
    expect(results).toEqual([
      {
        name: 'mdsCloudFileService',
        hostname: 'frito-desktop',
        pid: 1196681,
        level: 30,
        message: 'Example app listening on port 8888!',
        // time: '2022-09-26T13:31:17.924Z',
        time: 1664199077924,
        v: 0,
      },
    ]);
  });
});
