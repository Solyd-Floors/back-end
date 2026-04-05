
const { Floor, Review, FloorBox } = require("../../models");

module.exports = {
    findOne: async pk => await Floor.findByPkOr404(pk, { include: [  ]}),
    getFloorPrice: async ({ id: FloorId }) => {
        let floor_box = await FloorBox.findOne({
            where: { FloorId, mil_type: 12 }
        })
        if (!floor_box) return "N/A"
        return floor_box.price_per_square_foot
    },
    updateFloorAverageRating: async FloorId => {
        console.log({Floor,Review})
        let reviews = await Review.findAll({ where: { FloorId }});
        let floor = await Floor.findOne({ where: { FloorId }});
        
        const ratings_sum = reviews.reduce((a, b) => a.value + b.value, 0);
        const avg_rating = (ratings_sum / ratings_sum.length) || 0;
        
        floor.cached_total_reviews_len = reviews.length;
        floor.cached_avg_rating = avg_rating;

        return reviews;
    }
}