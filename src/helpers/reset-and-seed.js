require('dotenv').config()

const { exec } = require("child_process");

const models = require("../models")
let synced = models.sequelize.sync({ force: true });

let run = async () => {
    await synced;
    let seeds = [
        "users-seed"
    ]
    let seed_cmd = "npx sequelize-cli db:seed --seed"
    let cmd = seeds.map(seed_name => seed_cmd + " " + seed_name).join("&&");

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    // exec("npx sequelize-cli db:seed --seed categories-seed")
}

run();