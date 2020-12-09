
const { Contact } = require("../../models");

module.exports = {
    findAll: async () => await Contact.findAll(),
    createContact: async ({ full_name, email, reason }) => await Contact.create({ 
        full_name, email, reason
    }),
    deleteContact: async (pk) => await (await Contact.findByPkOr404(pk)).destroy()
}