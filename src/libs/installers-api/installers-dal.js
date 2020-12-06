
const { Installer } = require("../../models");

module.exports = {
    findAll: async (options = {}) => {
        let where = {}
        let relations = ["CountryId"]
        relations.map(field_name => options[field_name] ? where[field_name] = Number(options[field_name]) : null)
        if (options.query) where = { ...where, [Op.or]: [ { "name": { [Op.like]: '%' + options.query + '%' } } ] }
        console.log(where,options)
        return await Floor.findAll({ where, include: [ { model: Comment } ] })
    },
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