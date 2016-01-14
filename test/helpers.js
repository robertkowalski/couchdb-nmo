import nock from 'nock';

export function mockNodeIsOnline (url) {
  nock(url)
    .get('/')
    .reply(200);
}
