
const { Installer } = require("../../models");

module.exports = {
    findAll: async () => await Installer.findAll(),
    createInstaller: async ({
        CountryId, age, hourly_rate, job_status, UserId, profile_picture_url, status
    }) => {
        return await Installer.create({
            CountryId, age, hourly_rate, job_status, status, UserId, profile_picture_url
        })
    },
    updateInstaller: async ({ 
        pk, 
        data: { CountryId, age, hourly_rate, job_status, status, UserId, profile_picture_url }
    }) => await Installer.customUpdate({
        pk,
        data: { CountryId, age, hourly_rate, job_status, status, UserId, profile_picture_url }
    }),
    deleteInstaller: async pk => (await (await Installer.findByPkOr404(pk))).destroy()
}