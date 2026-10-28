import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import imagekit from "../services/storage.service.js";
const jwt_secrete = process.env.JWT_SECRET;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const finduser = await User.findOne({ email });

    if (!finduser) {
      return res.status(401).json({ message: "User not found" });
    }

    const checkpass = await bcrypt.compare(password, finduser.password);

    if (!checkpass) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { email: finduser.email, role: finduser.role, id: finduser._id },
      jwt_secrete,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      user: {
        id: finduser._id,
        email: finduser.email,
        username: finduser.username,
        role: finduser.role,
        ProfileImage: finduser.ProfileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const register = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }

    const isuser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isuser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    // Profile image is optional
    let profileImage = null;

    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/profile-images",
      });

      profileImage = result.url;
    }

    const newuser = await User.create({
      email,
      username,
      password: hash,
      ProfileImage: profileImage,
      role,
    });

    const token = jwt.sign(
      {
        email: newuser.email,
        role: newuser.role,
        id: newuser._id,
      },
      jwt_secrete,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(201).json({
      message: "User Created successfully",
      user: {
        id: newuser._id,
        email: newuser.email,
        username: newuser.username,
        ProfileImage: newuser.ProfileImage,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};
export const authMe = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({
    success: true,
    user: req.user,
  });
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};