import jwt from 'jsonwebtoken';
import 'dotenv/config'

const SECRET = 'change-me';

export function generateJWT(email: string): string {
  return jwt.sign({ email }, SECRET, { expiresIn: '4w' })
}

export async function decodeJWT(token: string): Promise<{ email: string } | null> {
  return new Promise((resolve) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        resolve(null);
      }
      resolve(decoded as { email: string });
    });
  });
}
