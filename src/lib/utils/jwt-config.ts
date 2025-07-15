import jwt, { JwtPayload } from 'jsonwebtoken';

// JWT configurations
const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = '30d';

// Define the user data type for the JWT payload
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

// Sign JWT token
export const signToken = (userData: UserData): string => {
  return jwt.sign(userData, jwtSecret, { expiresIn: jwtExpiresIn });
};

// Verify JWT token
export const verifyToken = (token: string): CustomJwtPayload | null => {
  try {
    return jwt.verify(token, jwtSecret) as CustomJwtPayload;
  } catch (error) {
    // eslint-disable-line
    return null;
  }
};

export const config = {
  secret: jwtSecret,
  expiresIn: jwtExpiresIn
};
