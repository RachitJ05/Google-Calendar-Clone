import prisma from "../prismaClient.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub,
      email,
      name,
      picture,
    } = payload;

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: sub,
          email,
          name,
          picture,
        },
      });
    }
    
    const token = generateToken(user.id);
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      error: "Google Authentication Failed",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    const existing = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existing) {
      return res.status(400).json({
        error: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user
    });
  }

  catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Registration Failed"
    });
  }
};


export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password"
      });
    }

    if (!user.password) {
      return res.status(400).json({
        error: "This account uses Google Sign In"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(400).json({
        error: "Invalid email or password"
      });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user
    });
  }

  catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Login Failed"
    });
  }
};