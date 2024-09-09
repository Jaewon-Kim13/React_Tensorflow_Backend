const { Pool } = require("pg");

const pool = new Pool({
	user: "webuser",
	password: "4Nf@cqk^Yn#3j/^",
	host: "localhost",
	port: 5432, // default Postgres port
	database: "mywebsite",
});

module.exports = {
	query: (text: any, params: any) => pool.query(text, params),
};
