
const { Installer } = require("../../models");

module.exports = {
    findAll: async () => await Installer.findAll(),
    createInstaller: async ({
        CountryId, age, hourly_rate, job_status, UserId, profile_picture_url
    }) => {
        return await Installer.create({
            CountryId, age, hourly_rate, job_status, status: "PENDING", UserId, profile_picture_url
        })
    }
}