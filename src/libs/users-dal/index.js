
const { User, Installer } = require("../../models")
const uuid = require("uuid");
const { createCustomer } = require("../stripe");
const { createWooCustomer } = require("../woocommerce");
const { ErrorHandler } = require("../../utils/error");

const linkWooCommerceAndStripe = async ({ user }) => {
    try {
        let { id: customer_id } = await createCustomer({ user_id: user.id });
        user.customer_id = customer_id;
    } catch (err){
        console.log(err)
        await user.destroy();
        throw new Error(500, "StripeError", [ "We could not create a stripe customer to attach to user." ])    
    }
    try {
        let { id: woo_customer_id } = await createWooCustomer({ user });
        user.woo_customer_id = woo_customer_id
    } catch(err){
        console.log(err)
        await user.destroy()
        throw new ErrorHandler(500,"WooCommerceError", [ 
            "We could not create a link to WooCommerce"
        ])
    }
    await user.save();
    return user;
}

module.exports = {
    findUserByPk: async pk => await User.findByPk(pk),
    doesUserHaveInstaller: async pk => Boolean(await Installer.findOne({ where: { UserId: pk }})),
    createGuestUser: async () => {
        let id = uuid.v1();
        let user = await User.create({
            email: `guest_${id}@sfguest.com`.replace(/-/g,"_"),
            password: `guest-${id}`,
            first_name: `guest-${id}`,
            last_name: `guest-${id}`,
            isGuest: true
        })
        user = await linkWooCommerceAndStripe({ user })
        return user;
    },linkWooCommerceAndStripe
}