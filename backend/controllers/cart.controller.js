import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingItems = user.cartItems.find((item) => item.id === productId);
        if (existingItems) {
            existingItems.quantity++;
        }else{
            user.cartItems.push(productId);
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter((item) => String(item.id) !== String(productId));
        }
        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingItems = user.cartItems.find((item) => String(item.id) === String(productId));
        if (existingItems) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => String(item.id) !== String(productId));
                await user.save();
                return res.json(user.cartItems);
            }

        existingItems.quantity = quantity;
        await user.save();
        res.json(user.cartItems);
        }else{
            res.status(404).json({message: "Product not found in cart"});
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id:{$in:req.user.cartItems}});

        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => String(cartItem.id) === String(product.id));
            return {...product.toJSON(),quantity: item.quantity}
        })

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}