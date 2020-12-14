
const { TeamMember } = require("../../models");

module.exports = {
    findAll: async () => await TeamMember.findAll(),
    createTeamMember: async ({ full_name, profile_picture_url, position, description }) => 
        await TeamMember.create({ full_name, profile_picture_url, position, description }),
    updateTeamMember: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_type = await TeamMember.findByPkOr404(pk);
        for (let key of keys){
            floor_type[key] = data[key]
        }
        await floor_type.save();
        return floor_type;
    },
    deleteTeamMember: async (pk) => await (await (await TeamMember.findByPkOr404(pk))).destroy()
}