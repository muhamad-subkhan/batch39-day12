const {Pool} = require("pg")
const dbPool = new Pool(
    {
        database: "personal_web_39",
        port: 5432,
        user: "postgres",
        password: "root"
    }
)

module.exports = dbPool