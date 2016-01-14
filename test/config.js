import assert from 'assert';

import * as config from '../src/config.js';

import ini from 'ini';
import fs from 'fs';
import sinon from 'sinon';

const data = `[clusterone]
node0=http://127.0.0.1
node1=http://192.168.0.1

[gang]
rocko=artischocko
z=zmeister
j=janjuleschlie
mussman=dermussmaen
`;

const jsonData = {
  'gang': {
    'rocko': 'artischocko',
    'z': 'zmeister',
    'j': 'janjuleschlie',
    'mussman': 'dermussmaen'
  },
  'clusterone': {
    'node0': 'http://127.0.0.1',
    'node1': 'http://192.168.0.1'
  }
};

const gangConf = `rocko=artischocko
z=zmeister
j=janjuleschlie
mussman=dermussmaen
`;

function restore (f) {
  f.restore && f.restore();
}

describe('config', () => {

  describe('load', () => {

    beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    it('loads a defined config', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          assert.equal(res.get('gang').rocko, 'artischocko');
        });
    });
  });

  describe('set', () => {

    beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    it('saves a value', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.set('cluster1337', 'node1337', '192.168.133.7')
        })
        .then((e) => {
          const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
          assert.equal(c.clusterone.node1, 'http://192.168.0.1');
          assert.equal(c.gang.rocko, 'artischocko');
          assert.equal(c.cluster1337.node1337, '192.168.133.7');
        });
    });

    it('errors if not all values provided', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set().catch((err) => {
            assert.ok(err instanceof Error);
          });
        });
    });

    it('errors if not all values provided', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('foo').catch((err) => {
            assert.ok(err instanceof Error);
          });
        });
    });

    it('errors if not all values provided', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('foo', 'bar').catch((err) => {
            assert.ok(err instanceof Error);
          });
        });
    });

    it('saves can overwrite old values', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.set('clusterone', 'node1', '192.168.133.7')
        })
        .then((e) => {
          const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
          assert.equal(c.clusterone.node1, '192.168.133.7');
        });
    });
  });

  describe('get', () => {

    beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    it('returns the whole config as JSON', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          const result = config.get();
          assert.deepEqual(jsonData, result);
        });
    });

    it('will get sections as JSON', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(res => {
          const result = config.get('gang');
          assert.deepEqual(jsonData.gang, result);
        });
    });

    it('will get keys', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          const result = config.get('gang', 'rocko');
          assert.equal(jsonData.gang.rocko, result);
        });
    });
  });

  describe('cli', () => {

    beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    afterEach(() => {
      restore(console.log);
    });

   it('it can get the whole config', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli().then((result) => {
            assert.deepEqual(jsonData, result);
          });
        });
    });

    it('will print the whole config as ini', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli('get')
        })
        .then(() => {
          const msg = console.log.getCall(0).args[0];
          assert.equal(data, msg);
        });
    });

    it('will print the whole config as JSON, if json = true', () => {
      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          return config.cli('get');
        })
        .then((res) => {
          const msg = console.log.getCall(0).args[0];
          assert.deepEqual(jsonData, msg);
          assert.deepEqual(jsonData, res);
        });
    });

    it('it can handle sections in the config', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli('get', 'gang');
        })
        .then((res) => {
          const msg = console.log.getCall(0).args[0];
          assert.deepEqual('rocko=artischocko\nz=zmeister\nj=janjuleschlie\nmussman=dermussmaen\n', msg);
          assert.deepEqual(jsonData.gang, res);
        });
    });

    it('will print the gang config as ini', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli('get', 'gang');
        }).then(() => {
          const msg = console.log.getCall(0).args[0];
          assert.equal(gangConf, msg);
        });
    });

    it('it can handle sections with keys in the config', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          return config.cli('get', 'gang', 'rocko');
        })
        .then((result) => {
          const msg = console.log.getCall(0).args[0];
          assert.deepEqual({rocko: 'artischocko'}, msg);
          assert.deepEqual({rocko: 'artischocko'}, result);
        });
    });

    it('will print the gang member', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli('get', 'gang', 'rocko');
        })
        .then(res => {
          const msg = console.log.getCall(0).args[0];
          assert.equal('artischocko', msg);
          assert.equal('artischocko', res);
        });
    });

    it('will print the gang member as JSON, if json = true', () => {

      const spy = sinon.spy(console, 'log');

      return config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          return config.cli('get', 'gang', 'rocko');
        })
        .then(res => {
          const msg = console.log.getCall(0).args[0];
          assert.deepEqual({rocko: 'artischocko'}, msg);
          assert.deepEqual({rocko: 'artischocko'}, res);
        });
    });

    it('saves a value', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          return config.cli('set', 'cluster1337', 'node1337', '192.168.133.7');
        })
        .then((e) => {
          const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
          assert.equal(c.clusterone.node1, 'http://192.168.0.1');
          assert.equal(c.gang.rocko, 'artischocko');
          assert.equal(c.cluster1337.node1337, '192.168.133.7');
        });
    });

    it('returns error on wrong usage', () => {
      return config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(() => {
          return config
            .cli('lalala');
        }).catch((err) => {
          assert.ok(err instanceof Error);
        });
    });
  });
});
