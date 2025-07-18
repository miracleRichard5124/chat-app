import cloudinary from "../lib/cloudinary.js";
import { genToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from 'bcryptjs';

// USER SIGNUP

export const signUp = async(req, res) => {
  const {fullName, email, password, bio} = req.body;
  
  try {
    if(!fullName || !password || !email || !bio){
      return res.json({success: false, message: "Missing Details"})
    }
    const user = await User.findOne({email})
    if(user){
      return res.json({success: false, message: "User already exists!"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({fullName, email, password:hashedPassword, bio});

    const token = genToken(newUser._id)

    res.json({success: true, userData: newUser, token, message: "Account created successfully"})
  } catch (error) {
    res.json({success: false, message: error.message})
    console.log(error.message)
  }
}

export const login = async(req, res) => {
  try {
    const {email, password} = req.body;
    const userData = await User.findOne({email})

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect){
      return res.json({success: false, message: "Invalid credentials"});
    }
    const token = genToken(userData._id)

    res.json({success: true, userData, token, message: "Login successful"})
  } catch (error) {
    return res.json({success: false, message: false})
  }
}

//controller to check if User is Authenticated 
export const checkAuth = (req, res) => {
  res.json({success: true, user: req.user});
}

//Controller to Update User Profile
export const updateProfile = async(req, res) => {
  try {
    const {fullName, profilePic, bio} = req.body;

    const userId = req.user._id;
    let updatedUser;
    if(!profilePic){
      updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true})
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
    }
    res.json({success: true, user: updatedUser})
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message})
  }
}