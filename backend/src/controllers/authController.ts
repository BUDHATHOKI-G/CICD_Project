import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createUser, findUserByEmail, updateUserById, IUser } from '../models/User';

const SALT_ROUNDS = 10;

// --- REGISTER ---
export const register = async (req: Request, res: Response) => {
  try {
    const { Username, Email, PasswordHash, Phone } = req.body;

    if (await findUserByEmail(Email))
      return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(PasswordHash, SALT_ROUNDS);

    const user: IUser = { Username, Email, Phone, PasswordHash: hashedPassword };

    const userId = await createUser(user);
    res.status(201).json({ message: 'User registered', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- LOGIN ---
export const login = async (req: Request, res: Response) => {
  try {
    const { Email, PasswordHash } = req.body;

    const user = await findUserByEmail(Email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(PasswordHash, user.PasswordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { UserId: user.UserId, Email: user.Email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { Email } = req.body;

    const user = await findUserByEmail(Email);
    if (!user) return res.status(400).json({ message: 'Email not found' });

    if (!user.UserId) {
      return res.status(500).json({ message: 'User ID missing' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600 * 1000; // 1 hour

    await updateUserById(user.UserId, {
      resetToken,
      resetTokenExpiry,
    });

    const resetUrl = `http://localhost:5173/resetPassword?token=${resetToken}&email=${Email}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: Email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// --- RESET PASSWORD ---
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { Email, token, newPassword } = req.body;

    const user = await findUserByEmail(Email);
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    if (!user.UserId) {
      return res.status(500).json({ message: 'User ID missing' });
    }

    if (
      user.resetToken !== token ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await updateUserById(user.UserId, {
      PasswordHash: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: 'Password successfully reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

