
const { Review } = require("../../models");

module.exports = {
    createMeReview: async ({ UserId, FloorId, value, description }) => await Review.create({ UserId, FloorId, value, description })
}