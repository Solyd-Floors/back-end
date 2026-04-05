
const { FloorReviewCache, User, Review } = require("../../models");

module.exports = {
    createMeReview: async ({ UserId, FloorId, value, description }) => {
        let review = await Review.create({ UserId, woo_product_id: FloorId, value, description })
        review = JSON.parse(JSON.stringify(review));
        review.User = User.findByPk(review.UserId);

        let reviews = await Review.findAll({ where: { woo_product_id: FloorId }});
        let floor_review_cache = await FloorReviewCache.findOne({ where: { woo_product_id: FloorId }});
        if (!floor_review_cache) {
            floor_review_cache = await FloorReviewCache.create({
                total_reviews_num: 0,
                average_rating: 0,
                woo_product_id: FloorId
            })
        }
        const ratings = reviews.map(review => review.value)
        const ratings_sum = ratings.reduce((a, b) => a + b, 0);
        const avg_rating = (ratings_sum / ratings.length) || 0;
        console.log({ratings,ratings_sum, avg_rating})
        
        floor_review_cache.total_reviews_num = reviews.length;
        floor_review_cache.average_rating = Number(avg_rating);
        
        await floor_review_cache.save()
        review.User = await review.User
        
        return review;
    }
}
