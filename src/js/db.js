//----------------------------------DATABASE----------------------------------\\

// Get the client
import mysql from 'mysql2/promise';

/**
 * Create the connection to database
 * @param {string} host the host
 * @param {string} user the user
 * @param {string} password the password
 * @param {string} database the database
 * @returns {object} the database connection
 */
async function dbConnect(host, user, password, database) {
    const con = await mysql.createPool({
        host: host,
        user: user,
        password: password,
        database: database,
    });

    return await con.getConnection();
}

/**
 * Create the connection to server
 * @param {string} host the host
 * @param {string} user the user
 * @param {string} password the password
 * @returns {object} the server connection
 */
async function dbConnectServer(host, user, password) {
    const serv = await mysql.createPool({
        host: host,
        user: user,
        password: password
    });

    return await serv.getConnection();
}

/**
 * Initialise the database with the tables if not exists
 */
async function dbInit() {
    //Create DataBase
    const serv = await dbConnectServer('localhost', 'root', 'root');

    const SimpleGameLibraryDatabase = 'CREATE DATABASE IF NOT EXISTS SimpleGameLibrary;';

    await serv.query(SimpleGameLibraryDatabase);

    await dbDisconnect(serv);
    //Create Tables
    const con = await dbConnect('localhost', 'root', 'root', 'simplegamelibrary');

    const accountsTable = 'CREATE TABLE IF NOT EXISTS accounts (id int(11) NOT NULL AUTO_INCREMENT, username varchar(50) NOT NULL UNIQUE, password varchar(255) NOT NULL, email varchar(100) NOT NULL UNIQUE, image blob, token varchar(96) UNIQUE, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const listTable = 'CREATE TABLE IF NOT EXISTS list (id int(11) NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL, favorite boolean DEFAULT false, accountId int(11) NOT NULL, PRIMARY KEY (id), FOREIGN KEY (accountID) REFERENCES accounts (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const gameTable = 'CREATE TABLE IF NOT EXISTS game(id int(11) NOT NULL AUTO_INCREMENT, source varchar(255) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const categoryTable = 'CREATE TABLE IF NOT EXISTS category(id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;'
    const listHasGameTable = 'CREATE TABLE IF NOT EXISTS listHasGames(idList int(11) NOT NULL, idGame int(11) NOT NULL, PRIMARY KEY (idList, idGame), FOREIGN KEY (idList) REFERENCES list (id), FOREIGN KEY (idGame) REFERENCES game (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const gameHasCategory = 'CREATE TABLE IF NOT EXISTS gameHasCategory(idGame int(11) NOT NULL, idCategory int(11) NOT NULL, PRIMARY KEY (idGame, idCategory), FOREIGN KEY (idGame) REFERENCES game (id), FOREIGN KEY (idCategory) REFERENCES category (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';

    await con.query(accountsTable);
    await con.query(listTable);
    await con.query(gameTable);
    await con.query(categoryTable);
    await con.query(listHasGameTable);
    await con.query(gameHasCategory);

    await dbDisconnect(con);
}

/**
 * Disconnect the Database
 * @param {object} con your database to disconnect 
 */
async function dbDisconnect(con) {
    con.release(function (err) {
        if (err) throw err;
        console.log('connection to DB successfully closed');
    });
}

//----------------------------------Boolean Method----------------------------------\\

/**
 * Return is an user exist with his username or email
 * @param {object} con your connetion
 * @param {string} id the username or email of the user
 * @returns {boolean} true if the user exist and false if the user does not exist
 */
async function existUser(con, id) {
    try {
        const sql = 'SELECT id, username, email FROM accounts WHERE username = ? OR email = ?;';
        const values = [id, id];

        const [rows] = await con.query(sql, values);

        if (rows.length === 1) {
            return true;
        }
        return false;

    } catch (err) {
        console.log(err);
    }
}

async function existEmail(con, id) {
    try {
        const sql = 'SELECT email FROM accounts WHERE email = ?;';

        const [rows] = await con.query(sql, id);

        if (rows.length === 1) {
            return true;
        }
        return false;

    } catch (err) {
        console.log(err);
    }
}

//----------------------------------SELECT----------------------------------\\

//TODO: replace old functions by the newers
/**
 * Get selected datas from all accounts
 * @param {object} con your connection 
 * @param {Array[string]} columns array of the column(s) your need to get
 */
async function getFromAllUsers(con, columns) {
    try {
        if (columns.length <= 0) {
            throw new Error("getFromAccount => Le tableau 'columns' est vide")
        }
        let sql = 'SELECT ';
        columns.forEach(element => {
            sql += `${element}, `
        });
        sql = sql.slice(0, -2);
        sql += ' FROM accounts';
        const [rows] = await con.query(sql);

        return rows;
    } catch (err) {
        console.log(err);
    }
}

//TODO: replace old functions by the newers
/**
 * Get selected datas from one account with his username or email
 * @param {object} con your connection 
 * @param {string} username the username of the user you want data(s)
 * @param {Array[string]} columns array of the column(s) your need to get
 */
async function getFromUser(con, username, columns) {
    try {
        if (columns.length <= 0) {
            throw new Error("getFromAccount => Le tableau 'columns' est vide")
        }
        let sql = 'SELECT ';
        columns.forEach(element => {
            sql += `${element}, `
        });
        sql = sql.slice(0, -2);
        sql += ' FROM accounts WHERE username = ? OR email = ?;';
        const values = [username, username];
        const [rows] = await con.query(sql, values);

        return rows[0];
    } catch (err) {
        console.log(err);
    }
}

/**
 * Get the password of an user from his username or email
 * @param {object} con your connection
 * @param {string} id the username or email of the user
 * @returns {string} the password of the user or undefined
 */
async function getUserPassword(con, id) {
    try {
        const sql = 'SELECT password FROM accounts WHERE username = ? OR email = ?;';
        const values = [id, id];

        const [rows] = await con.query(sql, values);

        return rows[0]?.password;

    } catch (err) {
        console.log(err);
    }
}

/**
 * Get the token of an user from his username or email
 * @param {object} con your connection
 * @param {string} id the username or email of the user
 * @returns {string} the token of the user or undefined
 */
async function getUserToken(con, id) {
    try {
        const sql = 'SELECT token FROM accounts WHERE username = ? OR email = ?;';
        const values = [id, id];

        const [rows] = await con.query(sql, values);

        return rows[0]?.token;

    } catch (err) {
        console.log(err);
    }
}

//----------------------------------INSERT----------------------------------\\

/**
 * Insert a new user into the database
 * @param {object} con your connection
 * @param {string} username the username of your user
 * @param {string} email the email of your user
 * @param {string} password the password of your user
 * @returns {boolean} if the user creation succeed
 */
async function createUser(con, username, email, password) {
    try {
        const sql = 'INSERT INTO accounts(username, password, email) VALUES(?, ?, ?)';
        const values = [username, password, email];

        await con.query(sql, values);
        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}


//----------------------------------UPDATE----------------------------------\\

//TODO: replace old functions by the newers
/**
 * Updates selected datas into accounts
 * @param {object} con your connection 
 * @param {string} username the username of the user you want to update
 * @param {Array[string]} columns array of the column(s) your need to update
 * @param {Array[string]} values array of the value(s) you want to set
 * @returns 
 */
async function updateAnUser(con, username, columns, values) {
    try {
        if (columns.length <= 0 && values.length !== columns.length) {
            throw new Error("getFromAccount => Le tableau 'columns' est vide ou le tableau 'values' n'as pas autant de valeurs que le tableau 'columns'")
        }
        let sql = 'UPDATE accounts SET ';

        for (let i = 0; i < columns.length; i++) {
            sql += `${columns[i]} = ?, `;
        }
        sql = sql.slice(0, -2);
        sql += " WHERE username = ?;"

        values.push(username);
        await con.query(sql, values);

        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Update the account to add a new token
 * @param {object} con your connection
 * @param {string} username the user to add a login token 
 * @param {string} token the token value
 * @returns {boolean} if the token was successfully added
 */
async function addToken(con, username, token) {
    try {
        const sql = 'UPDATE accounts SET token = ? WHERE username = ?;';
        const values = [token, username];

        await con.query(sql, values);
        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Update the image of an account
 * @param {object} con your connection
 * @param {string} username the user to update the image 
 * @param {blob} image the image value
 * @returns {boolean} if the image was successfully added
 */
async function updateUserImage(con, username, image) {
    try {
        const sql = 'UPDATE accounts SET image = ? WHERE username = ?;';
        const values = [image, username];

        await con.query(sql, values);
        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Update the password of an account
 * @param {object} con your connection
 * @param {string} username the user to update the password 
 * @param {blob} password the password value
 * @returns {boolean} if the password was successfully added
 */
async function updateUserPassword(con, username, password) {
    try {
        const sql = 'UPDATE accounts SET password = ? WHERE username = ?;';
        const values = [password, username];

        await con.query(sql, values);
        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

//----------------------------------DELETE----------------------------------\\

/**
 * Delete an account from his username
 * @param {object} con your connection
 * @param {string} username the user to delete 
 * @returns {boolean} if the account was successfully deleted
 */
async function deleteUser(con, username) {
    try {
        const sql = 'DELETE FROM accounts WHERE username = ?;';
        const values = [username];

        await con.query(sql, values);
        return true;

    } catch (err) {
        console.log(err);
        return false;
    }
}

//----------------------------------TESTS----------------------------------\\

/**
 * Create a test Database if not exists and add data to tables
 */
async function startTests() {
    //Create test Database
    const serv = await dbConnectServer('localhost', 'root', 'root');

    const SimpleGameLibraryTestDatabase = "CREATE DATABASE IF NOT EXISTS SimpleGameLibraryTest;"

    await serv.query(SimpleGameLibraryTestDatabase);

    await dbDisconnect(serv);

    //Create Tables in test Database

    const con = await dbConnect('localhost', 'root', 'root', 'simplegamelibrarytest');

    const accountsTable = 'CREATE TABLE IF NOT EXISTS accounts (id int(11) NOT NULL AUTO_INCREMENT, username varchar(50) NOT NULL UNIQUE, password varchar(255) NOT NULL, email varchar(100) NOT NULL UNIQUE, image blob NULL, token varchar(96) UNIQUE, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const listTable = 'CREATE TABLE IF NOT EXISTS list (id int(11) NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL, favorite boolean DEFAULT false, accountId int(11) NOT NULL, PRIMARY KEY (id), FOREIGN KEY (accountID) REFERENCES accounts (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const gameTable = 'CREATE TABLE IF NOT EXISTS game(id int(11) NOT NULL AUTO_INCREMENT, source varchar(255) NOT NULL, PRIMARY KEY (id));';
    const categoryTable = 'CREATE TABLE IF NOT EXISTS category(id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;'
    const listHasGameTable = 'CREATE TABLE IF NOT EXISTS listHasGames(idList int(11) NOT NULL, idGame int(11) NOT NULL, PRIMARY KEY (idList, idGame), FOREIGN KEY (idList) REFERENCES list (id), FOREIGN KEY (idGame) REFERENCES game (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';
    const gameHasCategory = 'CREATE TABLE IF NOT EXISTS gameHasCategory(idGame int(11) NOT NULL, idCategory int(11) NOT NULL, PRIMARY KEY (idGame, idCategory), FOREIGN KEY (idGame) REFERENCES game (id), FOREIGN KEY (idCategory) REFERENCES category (id)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;';

    con.query(accountsTable);
    con.query(listTable);
    con.query(gameTable);
    con.query(categoryTable);
    con.query(listHasGameTable);
    con.query(gameHasCategory);

    //Insert data in test Database
    const accountsTableData = "INSERT INTO accounts (username, password, email) VALUES('test1', 'test', 'test@email.com'), ('test2', 'ABCDE', 'LeTest@email.fr'), ('test3', 'AZERTY', 'jesuisuntest@email.com');";
    const listTableData = "INSERT INTO list (name, favorite, accountId) VALUES('testList1', 0, 1), ('testList2', 1, 1);";
    const gameTableData = "INSERT INTO game (source) VALUES('source1'), ('source2'), ('source3');";
    const categoryTableData = "INSERT INTO category (name) VALUES('testCategory1'), ('testCategory2'), ('testCategory3');";
    const listHasGameTableData = "INSERT INTO listHasGames (idList, idGame) VALUES(1, 1), (1, 2), (2, 2), (2, 3);";
    const gameHasCategoryData = "INSERT INTO gameHasCategory (idGame, idCategory) VALUES(1, 1), (1, 2), (2, 3), (3, 1), (3, 2), (3, 3);";

    con.query(accountsTableData);
    con.query(listTableData);
    con.query(gameTableData);
    con.query(categoryTableData);
    con.query(listHasGameTableData);
    con.query(gameHasCategoryData);

    return con;
}

async function endTests(con) {
    // Drop all datas
    const listHasGameTableDataDrop = "DELETE FROM listHasGames;";
    const gameHasCategoryDataDrop = "DELETE FROM gameHasCategory;";
    const listTableDataDrop = "DELETE FROM list;";
    const accountsTableDataDrop = "DELETE FROM accounts";
    const gameTableDataDrop = "DELETE FROM game;";
    const categoryTableDataDrop = "DELETE FROM category;";
    const accountTableIncrementReset = "ALTER TABLE accounts AUTO_INCREMENT = 1;";
    const listTableIncrementReset = "ALTER TABLE list AUTO_INCREMENT = 1;";
    const gameTableIncrementReset = "ALTER TABLE game AUTO_INCREMENT = 1;";
    const categoryTableIncrementReset = "ALTER TABLE category AUTO_INCREMENT = 1;";

    await con.query(listHasGameTableDataDrop);
    await con.query(gameHasCategoryDataDrop);
    await con.query(listTableDataDrop);
    await con.query(accountsTableDataDrop);
    await con.query(gameTableDataDrop);
    await con.query(categoryTableDataDrop);
    await con.query(accountTableIncrementReset);
    await con.query(listTableIncrementReset);
    await con.query(gameTableIncrementReset);
    await con.query(categoryTableIncrementReset);

    await dbDisconnect(con);
}

/**
 * Test existUser function
 */
async function testExistUser(con) {
    if (!await existUser(con, 'test2')) { throw new Error("testExistUser => can't get user with his login") }
    if (!await existUser(con, 'jesuisuntest@email.com')) { throw new Error("testExistUser => can't get user with his email") }
    if (await existUser(con, 'badNameOrEmail')) { throw new Error("testExistUser => get an user whith a bad login or email") }
    console.log("testExistuser => OK");
}

/**
 * Test existEmail function
 */
async function testExistEmail(con) {
    if (!await existEmail(con, 'LeTest@email.fr')) { throw new Error("testExistEmail => can't get user with his email") }
    if (await existEmail(con, 'BadEmail')) { throw new Error("testExistEmail => get an user whith a bad email") }
    console.log("testExistEmail => OK");
}

/**
 * Test getUserPassword function
 */
async function testGetUserPassword(con) {
    if (await getUserPassword(con, 'test2') !== 'ABCDE') { throw new Error("testGetUserPassword => can't get user password") }
    if (await getUserPassword(con, 'badNameOrEmail') !== undefined) { throw new Error("testGetUserPassword => get a password when he sould not") }
    console.log("testGetUserPassword => OK")
}

/**
 * Test createUser function
 */
async function testCreateUser(con) {
    await createUser(con, 'insertTestUser', 'insert@test.testing', 'insertTestPWD');
    if (!await existUser(con, 'insertTestUser')) { throw new Error("testCreateUser => can't create user") }
    console.log("testCreateUser => OK")
}

async function testUserToken(con) {
    if (!await addToken(con, 'test1', 'testNewToken')) { throw new Error("testUserToken => can't create an user token") }
    if (await getUserToken(con, 'test1') !== 'testNewToken') { throw new Error("testUserToken => get an user token") }
    if (await getUserToken(con, 'test2') !== null) { throw new Error("testUserToken => find a token when he sould not") }
    console.log("testUserToken => OK");
}

//TODO: testgetFromAllUsers, testgetFromUser, testUpdateAnUser
//TODO: testUpdateUserImage, testUpdateUserPassword, testDeleteUser

// Test executions
/*
(async () => {
    // Initialise test environement
    const con = await startTests();

    // Execute tests
    try {
        await testExistUser(con);
        await testExistEmail(con);
        await testGetUserPassword(con);
        await testCreateUser(con);
        await testUserToken(con);
    } catch (error) {
        console.error(error)
    }

    // Finish tests
    await endTests(con);
})();
*/

export default { dbConnectServer, dbConnect, dbInit, existUser, getUserPassword, existEmail, createUser, addToken, getUserToken };