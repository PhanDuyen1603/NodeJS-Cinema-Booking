const Sequelize = require('sequelize');
// const url = process.env.DATABASE_URL || 'postgres://postgres:tu@localhost:5432/cinema2'
const url = 'PostgreSQL://Tu:12345678@postgresql-36342-0.cloudclusters.net:36352/cinema?statusColor=&environment=local&name=cinema&tLSmode=0&usePrivateKey=false&safeModelLevel=0&advancedSafeModeLevel=0'

const db = new Sequelize(url);

module.exports = db;