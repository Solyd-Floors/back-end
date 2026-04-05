'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
const { ErrorHandler } = require('../utils/error');
var basename = path.basename(__filename);

// var env = process.env.NODE_ENV || 'development';
// var config    = require(__dirname + '../config/config.js')[env];

var db = {};
let sequelize;

sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});


sequelize.authenticate()
    .then(() => console.log("Authenticated"))
    .catch(err => console.log("Authentication failed!"));

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        if (file !== "common.js") {
            const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
            model.findByPkOr404 = async (pk,options={}) => {
                let obj = await model.findByPk(pk,options)
                if (obj) return obj
                throw new ErrorHandler(404, `${model.name} with id=${pk} not found!`)
            }
            model.customUpdate = async ({pk,data}) => {
                let keys = Object.keys(data);
                let obj = await model.findByPkOr404(pk);
                for (let key of keys){
                    obj[key] = data[key]
                }
                await obj.save();
                return obj;
        
            }
            db[model.name] = model;
        }
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


console.log("CONNECTED TO ", db.sequelize.config.database)

module.exports = db;