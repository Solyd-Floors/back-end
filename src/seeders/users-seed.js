'use strict';

// const request = require("request");

const users = require("./data/users");

module.exports = {
    up: (queryInterface, Sequelize) => {
        
    //Add altering commands here.
    // Return a promise to correctly handle asynchronicity.
    // let hashedPassword = await bcrypt.hash("mockpassword", SALT_ROUNDS);
    // console.log(users)
    return queryInterface.bulkInsert('users', 
          users.map(user => ({ ...user, createdAt: new Date(), updatedAt: new Date() }))
      , {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      */
     return queryInterface.bulkDelete('users', null, {});
  }
};
