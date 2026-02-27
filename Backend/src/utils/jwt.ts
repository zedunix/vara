import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  userRole?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || '';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  };
  
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || '';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
