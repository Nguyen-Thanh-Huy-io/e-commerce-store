import { stripe } from "../lib/stripe";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";

export const createCheckoutSession = async (req, res) => {
    try {
        const {products,couponCode} = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Convert to cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                
            };
        })
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode , userId:req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100); // Apply discount
            }
        }
            
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items:lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon 
            ? [
            {
                coupon: await creatStripeCoupon(coupon.discountPercentage),
            },
            ] : [],
            metadata:{
                userId:req.user._id.toString(),
                couponCode:couponCode || "",
                products: JSON.stringtify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            }
        });
        if (totalAmount >= 20000){
            await createNewCoupon(req.user._id.toString());
        }
        res.status(200).json({ id: session.id , totalAmount: totalAmount/100});
    } catch (error) {
        console.log("Error creating checkout session:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function creatStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        userId: userId,
    })
    await newCoupon.save();
}

export const CheckoutSuccess = async (req, res) => {
    try{
        const {session_id} = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {code: session.metadata.couponCode, userId: session.metadata.userId}, 
                    {isActive: false},
                );
            }

            //Create a new order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                userId: session.metadata.userId,
                products: products.map(product => ({
                    productId: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount : session.amount_total / 100, //convert from cents to dollars                
                stripeSessionId: session.id,
            })

            await newOrder.save();

            res.status(200).json({ 
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }
        }
        catch (error) {
            console.log("Error in checkout success:", error);
            return res.status(500).json({ error: "Error processing successful checkout", error: error.message });
        }
}