import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';
import { verifyToken } from '@/lib/jwt';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  res.status(200).json({ message: 'Welcome!', user: decoded });
}
