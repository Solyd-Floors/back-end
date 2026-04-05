
const { GalleryImage } = require("../../models");
const { ErrorHandler } = require("../../utils/error");

module.exports = {
    getGallery: async () => {
        let gallery_images = await GalleryImage.findAll({
            order: [
                [ "index", "ASC" ]
            ]
        });
        return gallery_images
    },
    createGalleryImage: async ({ FloorId, image_url }) => {
        let some_gallery_image = await GalleryImage.findOne({ order: [ ["index", "DESC"]]});
        let index = some_gallery_image ? some_gallery_image.index + 1 : 1;
        console.log({index})
        let gallery_image = await GalleryImage.create({ FloorId, image_url, index })
        return gallery_image;
    },
    deleteGalleryImage: async pk => await (await GalleryImage.findByPkOr404(pk)).destroy(),
    switchGalleryImages: async ({ index_x, index_y }) => {
        let image_x = await GalleryImage.findOne({ where: { index: index_x }})
        let image_y = await GalleryImage.findOne({ where: { index: index_y }})
        if (!image_x || !image_y) {
            throw new ErrorHandler(403, "ValidationError", [
                "requestBody.index_x or requestBody.index_y not valid"
            ])
        }
        // Copy image_x so we can destroy it but still have the data to recreate it
        let image_x_copy = JSON.parse(JSON.stringify(image_x));
        await image_x.destroy()

        image_y.index = index_x
        await image_y.save();
        
        let { image_url, FloorId } = image_x_copy
        await GalleryImage.create({
            image_url, FloorId,
            index: index_y
        })
        return true;
    }
}