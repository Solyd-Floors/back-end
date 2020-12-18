
const { Installer, User, Sequelize } = require("../../models");
const { Op } = Sequelize

module.exports = {
    findAll: async (options = {}) => {
        let where = {}
        let relations = ["CountryId"]
        relations.map(field_name => options[field_name] ? where[field_name] = Number(options[field_name]) : null)
        // if (options.query) where = { ...where, [Op.or]: [ { "$User.full_name$": { [Op.like]: '%' + options.query + '%' } } ] }
        if (options.job_status) where.job_status = options.job_status
        if (options.min_hourly_rate !== undefined && options.max_hourly_rate !== undefined) {
            where.hourly_rate = { [Op.between]: [ options.min_hourly_rate, options.max_hourly_rate ] }
        }
        if (options.min_age !== undefined && options.max_age !== undefined) {
            where.age = { [Op.between]: [ options.min_age, options.max_age ] }
        }
        console.log({options, where})
        let installers = await Installer.findAll({ where })
        installers = JSON.parse(JSON.stringify(installers))
        for (installer of installers) installer.User = await User.findByPk(installer.UserId)
        return installers;
    },
    createInstaller: async ({
        CountryId, age, hourly_rate, job_status, UserId, profile_picture_url, status
    }) => {
        return await Installer.create({
            CountryId, age, hourly_rate, job_status, status: status || "PENDING", UserId, profile_picture_url
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