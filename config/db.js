const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB= async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected');
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports= connectDB;