import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, IUser } from '../models/User';

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  try {
    const { Username, Email, PasswordHash, Phone } = req.body;

    // Check if email or username exists
    if (await findUserByEmail(Email)) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(PasswordHash, SALT_ROUNDS);

    const user: IUser = {
      Username,
      Email,
      Phone,
      PasswordHash: hashedPassword
    };

    const userId = await createUser(user);
    res.status(201).json({ message: 'User registered', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { Email, PasswordHash } = req.body;

    const user = await findUserByEmail(Email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(PasswordHash, user.PasswordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ UserId: user.UserId, Email: user.Email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
