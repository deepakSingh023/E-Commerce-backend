const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');



const  userRegister =async (req,res)=>{
    

    try{
        const {username,password}=req.body;
        
        if (!username ||  !password) {
        return res.status(400).json({ message: 'All fields are required' });
        }
      
        const existingUser= await User.findOne({$or: [{ username }]})

        if(existingUser){
            return res.status(400).json({message:'User already exist'})
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            username,
            
            password:hashedPassword,
        })

        await newUser.save();
        res.status(201).json({message:'User created successfully'})

    }catch(err){
        res.status(500).json({message:err.message})
    }
    
}

const loginUser = async (req, res) => {
  try {
    const { username, password, localCart = [] } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Merge only new localCart items into DB cart
    localCart.forEach(localItem => {
      const existingItem = user.cart.find(
        dbItem => dbItem.productId.toString() === localItem.productId
      );

      if (existingItem) {
        // Optional: increase quantity instead of skipping
        existingItem.quantity += localItem.quantity;
      } else {
        user.cart.push(localItem);
      }
    });

    await user.save();

    const token = jwt.sign({ userId:user._id,role:user.role}, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const adminLogin = async(req,res)=>{
    try{
        const {username , password} = req.body;

        if(!username || !password){
            return res.status(400).json({message:'All fields are required'})
        }

        const user = await User.findOne({username});

        if(!user){
            return res.status(404).json({message:'Admin not found'})
        }
        console.log("User role from DB:", user.role);


        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Not an admin' });
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);
        console.log("Password valid:", isPasswordValid);

        if(!isPasswordValid){
            return res.status(401).json({message:'Invalid credentials'})
        }

        const token = jwt.sign({userId:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});

        res.status(200).json({
          message: 'Login successful',
          admin: { id: user._id, username: user.username, role: user.role },
          token
        });


    }catch(err){
        res.status(500).json({message:err.message})
    }
}

module.exports={
    userRegister,
    loginUser,
    adminLogin
}