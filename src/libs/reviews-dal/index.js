
const { Floor, User, Review } = require("../../models");
const { updateFloorAverageRating } = require("../floors-dal");

module.exports = {
    createMeReview: async ({ UserId, FloorId, value, description }) => {
        let review = await Review.create({ UserId, FloorId, value, description })
        review = JSON.parse(JSON.stringify(review));
        review.User = User.findByPk(review.UserId);

        let reviews = await Review.findAll({ where: { FloorId }});
        let floor = await Floor.findOne({ where: { id: FloorId }});
        
        const ratings = reviews.map(review => review.value)
        const ratings_sum = ratings.reduce((a, b) => a + b, 0);
        const avg_rating = (ratings_sum / ratings.length) || 0;
        console.log({ratings,ratings_sum, avg_rating})
        
        floor.cached_total_reviews_len = reviews.length;
        floor.cached_avg_rating = Number(avg_rating);
        
        await floor.save()
        review.User = await review.User
        
        return review;
    }
}