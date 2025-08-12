import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import db from './db';

export function getUserFromRequest(req) {
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return null;
  }
  
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return null;
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Include is_admin in the user object
    const user = db.prepare('SELECT id, email, created_at, is_admin FROM users WHERE id = ?').get(payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

export async function verifyToken(token) {
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return null;
  }
  
  if (!token) return null;
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
} 