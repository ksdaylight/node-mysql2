/**
 * The types are explicity for learning purpose
 * By extending the `RowDataPacket`, you can use your Interface in `query` and `execute`
 */

import mysql, {
  ConnectionOptions,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

 interface User extends RowDataPacket {
   /** id */
   0: number;
   /** name */
   1: string;
 }

(async () => {
  const access: ConnectionOptions = {
    host: '',
    user: '',
    password: '',
    database: '',
    multipleStatements: true,
    rowsAsArray: true,
  };

  const conn = await mysql.createConnection(access);

  /** Deleting the `users` table, if it exists */
  await conn.query<ResultSetHeader>('DROP TABLE IF EXISTS `users`;');

  /** Creating a minimal user table */
  await conn.query<ResultSetHeader>(
    'CREATE TABLE `users` (`id` INT(11) AUTO_INCREMENT, `name` VARCHAR(50), PRIMARY KEY (`id`));',
  );

  /** Inserting some users */
  const [inserted] = await conn.execute<ResultSetHeader>(
    'INSERT INTO `users`(`name`) VALUES(?), (?), (?), (?);',
    ['Josh', 'John', 'Marie', 'Gween'],
  );

  console.log('Inserted:', inserted.affectedRows);

  /** Getting users */
  const [rows] = await conn.query<User[][]>(
    [
      'SELECT * FROM `users` ORDER BY `name` ASC LIMIT 2;',
      'SELECT * FROM `users` ORDER BY `name` ASC LIMIT 2 OFFSET 2;',
    ].join(' '),
  );

  rows.forEach((users) => {
    users.forEach((user) => {
      console.log('-----------');
      console.log('id:  ', user[0]);
      console.log('name:', user[1]);
    });
  });

  await conn.end();
})();

/** Output
  *
  * Inserted: 4
  * -----------
  * id:   4
  * name: Gween
  * -----------
  * id:   2
  * name: John
  * -----------
  * id:   1
  * name: Josh
  * -----------
  * id:   3
  * name: Marie
  */
