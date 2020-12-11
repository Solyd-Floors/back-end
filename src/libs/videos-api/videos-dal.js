
const { Video } = require("../../models");

module.exports = {
    findAll: async () => await Video.findAll(),
    createVideo: async ({ youtube_url, title, description  }) => 
        await Video.create({ youtube_url, title, description  }),
    updateVideo: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_type = await Video.findByPkOr404(pk);
        for (let key of keys){
            floor_type[key] = data[key]
        }
        await floor_type.save();
        return floor_type;
    },
    deleteVideo: async (pk) => await (await (await Video.findByPkOr404(pk))).destroy()
}