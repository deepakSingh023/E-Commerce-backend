const User = require('../models/user');
const Product = require('../models/product');

const createProduct = async(req,res)=>{
    try{
        const {name,description,price,image} = req.body;
        if(!name || !description || !price || !image){
            return res.status(400).json({message:'All fields are required'});
        }
        if(req.user.role !== 'admin'){
            return res.status(403).json({message:'Access denied: Not an admin'});
        }
       const alreadyExist = await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
       if (alreadyExist) {
            return res.status(400).json({ message: 'Product with this name already exists. Please choose a different name.' });
        }
        const product = new Product({
            name,
            description,
            price,
            image
        })
        await product.save();
        res.status(201).json({message:'Product created successfully'});
    }catch(err){}
}



module.exports = {
    createProduct,
}