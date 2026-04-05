
const { Review } = require("../../models");

module.exports = {
    findAll: async () => await Review.findAll(),
    createReview: async ({ FloorId, woo_product_id, value, description }) => await Review.create({
        woo_product_id: FloorId || woo_product_id,
        value,
        description
    }),
    updateReview: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_type = await Review.findByPkOr404(pk);
        for (let key of keys){
            if (key === "FloorId") floor_type.woo_product_id = data[key]
            else floor_type[key] = data[key]
        }
        await floor_type.save();
        return floor_type;
    },
    deleteReview: async (pk) => await (await (await Review.findByPkOr404(pk))).destroy()
}
