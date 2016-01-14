import assert from 'assert';

import versionApi, {cli} from '../src/v.js';

import pkg from '../package.json';

import sinon from 'sinon';

function restore (f) {
  f.restore && f.restore();
}

describe('api: version', () => {

  it('gets the current nmo version', () => {
    return versionApi().then((res) => {
      assert.equal(pkg.version, res.nmo);
    });
  });
});

describe('cli: version', () => {
  afterEach(() => {
    restore(console.log);
  });

  it('logs the current version', () => {
    const spy = sinon.spy(console, 'log');

    return cli().then(() => {
      const msg = console.log.getCall(0).args[0];
      assert.ok(new RegExp(pkg.version, 'ig').test(msg));
    });
  });
});
