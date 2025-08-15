import db from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, name, mobile, address } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    const valid = await bcrypt.compare(password, existingUser.password_hash);
    if (!valid) return res.status(409).json({ error: 'Account already exists with a different password' });
    
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    
    if (ADMIN_EMAIL && ADMIN_PASSWORD && 
        email === ADMIN_EMAIL && 
        password === ADMIN_PASSWORD && 
        !existingUser.is_admin) {
      await db.updateUserAdminStatus(existingUser.id, true);
      return res.status(200).json({ message: 'Admin privileges granted' });
    }
    return res.status(409).json({ error: 'Email already registered' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  
  let userId;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && 
      email === ADMIN_EMAIL && 
      password === ADMIN_PASSWORD) {
    const result = db.createUser(email, password_hash, 1);
    userId = result.lastInsertRowid;
  } else {
    const result = db.createUser(email, password_hash);
    userId = result.lastInsertRowid;
  }

  // Update user profile with additional details if provided
  if (name || mobile || address) {
    db.updateUserProfile(userId, { name, mobile, address });
  }

  // Add 10 free credits to new users
  db.addUserCredits(userId, 10);

  res.status(201).json({ success: true });
}