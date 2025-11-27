import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * Hash a password using bcrypt with 12 salt rounds
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a cryptographically secure random password
 * @param length - Length of password (default: 16)
 * @returns Random password
 */
export function generatePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const charsetLength = charset.length
  let password = ''

  // Generate cryptographically secure random bytes
  const randomBytes = crypto.randomBytes(length)

  for (let i = 0; i < length; i++) {
    // Use modulo to map random byte to charset index
    const randomIndex = randomBytes[i] % charsetLength
    password += charset.charAt(randomIndex)
  }

  return password
}
