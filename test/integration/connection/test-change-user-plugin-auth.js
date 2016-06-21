var assert = require('assert');
var common = require('../../common');
var connection = common.createConnection({
  debug: true,
  authSwitchHandler: function () {
    throw new Error('should not be called - we expect mysql_native_password '
      + 'plugin to be handled by internal handler');
  }
});

// create test user first
connection.query('GRANT ALL ON *.* TO \'changeuser1\'@\'localhost\' IDENTIFIED BY \'changeuser1pass\'');
connection.query('GRANT ALL ON *.* TO \'changeuser2\'@\'localhost\' IDENTIFIED BY \'changeuser2pass\'');
connection.query('FLUSH PRIVILEGES');

connection.changeUser({
  user: 'changeuser1',
  password: 'changeuser1pass'
});
connection.query('select user()', function (err, rows) {
  if (err) {
    throw err;
  }
  assert.deepEqual(rows, [{'user()': 'changeuser1@localhost'}]);
});

connection.changeUser({
  user: 'changeuser2',
  password: 'changeuser2pass'
});

connection.query('select user()', function (err, rows) {
  if (err) {
    throw err;
  }
  assert.deepEqual(rows, [{'user()': 'changeuser2@localhost'}]);
});

connection.changeUser({
  user: 'changeuser1',
  passwordSha1: new Buffer('f961d39c82138dcec42b8d0dcb3e40a14fb7e8cd', 'hex') // sha1(changeuser1pass)
});
connection.query('select user()', function (err, rows) {
  if (err) {
    throw err;
  }
  assert.deepEqual(rows, [{'user()': 'changeuser1@localhost'}]);
});

connection.end();


var beforeChange = 1;
connection.changeUser({database: 'does-not-exist'}, function (err) {
  assert.ok(err, 'got error');
  assert.equal(err.code, 'ER_BAD_DB_ERROR');
  assert.equal(err.fatal, true);
});

connection.on('error', function (err) {
  assert.ok(err, 'got disconnect');
  assert.equal(err.code, 'PROTOCOL_CONNECTION_LOST');
  assert.equal(beforeChange, 1);
});
