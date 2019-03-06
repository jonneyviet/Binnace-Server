let mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const dbURL = process.env.DB_LOCALHOST ||  process.env.DB_HOST ;
class Database {
    constructor() {
        this._connect()
    }
    _connect() {
        mongoose.connect(dbURL,{useNewUrlParser: true})
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
    }
}
module.exports = new Database()