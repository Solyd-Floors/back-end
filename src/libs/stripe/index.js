
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require("../../models");

module.exports = {
    updateCard: async ({ customer_id, stripe_token }) => {
        let new_source = await stripe.customers.createSource(customer_id, { source: stripe_token })
        await stripe.customers.update(customer_id,{
            "default_source": new_source.id
        })
        let allSources = await stripe.customers.listSources(customer_id)
        console.log(allSources)
        for (let x in allSources.data){
            let source = allSources.data[x];
            if (source.id !== new_source.id){
                await stripe.customers.deleteSource(customer_id,source.id)
            }
        }
        return true;
    },
    createCustomer: async ({ user_id, source_id }) => {
        let customer = await stripe.customers.create({
            description: `user-${user_id}`,
            source: source_id
        });
        return customer;
    },
    createPaymentIntent: async ({
        amount,
        customer,
        currency = "usd",
        payment_method_types = [ "card" ]
    }) => {
        let paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer,
            payment_method_types,
        })
        return paymentIntent
    },
    getCustomerInvoices: async ({ customer_id }) => {
        const invoices = await stripe.invoices.list({
            customer_id
        });
        return invoices;
    }
}