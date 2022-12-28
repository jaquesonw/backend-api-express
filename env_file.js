const db = require('./env_file.js')

module.exports = {
    authSecret: '',
    db : {
        host:'127.0.0.1',
        port:5432,
        database:'knowledge_inicial',
        user:'postgres',
        password:'123456'
    }
}