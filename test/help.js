import assert from 'assert';

import { createConfigFile } from './common';
import help from '../src/help.js';
import {cli} from '../src/help.js';

import nmo from '../src/nmo.js';
import sinon from 'sinon';

function restore (f) {
  f.restore && f.restore();
}

describe('help', () => {
  createConfigFile();

  beforeEach(() => {
    return nmo.load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  afterEach(() => {
    restore(console.log);
  });

  it('prints available commands', () => {
      const spy = sinon.spy(console, 'log');

      return help().then(() => {
        const msg = console.log.getCall(0).args[0];
        assert.ok(/help/.test(msg));
        assert.ok(/isonline/.test(msg));
      });
  });

  it('opens manpages', (done) => {
    cli('help')
      .then((child) => {
        child.kill();
        done();
      });
  });

});
