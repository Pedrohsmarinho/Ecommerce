import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Hash a refresh token for secure storage
 */
export const hashRefreshToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, SALT_ROUNDS);
};

/**
 * Compare a refresh token with its hashed version
 */
export const compareRefreshToken = async (token: string, hashedToken: string): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};
