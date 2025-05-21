import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}
