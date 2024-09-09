const mysql = require("mysql");

/**
 * Function to execute a SQL query
 * @param {object} con the database connection
 * @param {string} SQLquery the SQL query to execute
 * @param {string} output the output message
 */
function query(con, SQLquery, output) {
    con.query(SQLquery, function (err) {
        if (err) throw err;
        console.log(output);
    });
}

/**
 * Function to connect to the database
 * @param {string} host database host
 * @param {string} user database user
 * @param {string} password database password
 * @param {string} database database to use (needed if you dont use init(func) after creating the connection)
 * @returns {object} the database connection
 */
function connect(host, user, password, database = null) {
    const con = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database
    });

    con.connect(function (err) {
        if (err) throw err;
        console.log('succesfully connected to DB');
    });

    return con;
}

/**
 * Function to end the connection to the database
 * @param {object} con database connection
 */
function disconnect(con) {
    con.end(function (err) {
        if (err) throw err;
        console.log('connection to DB successfully closed');
    });
}

/**
 * Function to initialize the database
 * (creation, tables)
 * @param {object} con database connection 
 */
// TODO: Ensure when adding data there can be both or more same entry
function init(con) {
    const createDB = 'CREATE DATABASE IF NOT EXISTS SimpleGameLibrary';
    const loginTable = 'CREATE TABLE IF NOT EXISTS accounts (id int(11) NOT NULL AUTO_INCREMENT, username varchar(50) NOT NULL, password varchar(255) NOT NULL, email varchar(100) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;';
    // const gameTable = 'CREATE TABLE IF NOT EXISTS game (id int(11) NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL, )';

    query(con, createDB, 'DB created');
    query(con, 'USE simplegamelibrary', 'using simplegamelibrary DB');
    query(con, loginTable, 'created account table');

    // con.query('ALTER TABLE accounts AUTO_INCREMENT = 0;'); // with this it start at 1 and not 2, i dont know why it start at 2 when not (innoDB ?)
}

// TESTS
// const con = connect('localhost', 'root', 'root');
// init(con);
// con.query('INSERT INTO accounts (username, password, email) VALUES(?, ?, ?);', ['test', 'test', 'test@email.com']);
// disconnect(con);

module.exports = { connect, disconnect, init };