const mysql = require("mysql");

const conexao = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "db_patrimonios"
});

module.exports = conexao;