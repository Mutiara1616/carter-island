// src/lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { CreateUserData, TokenPayload, User, Role } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'carter-island-fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<Omit<User, 'password'>> {
  const { 
    email, 
    password, 
    username, 
    firstName, 
    lastName, 
    role = Role.USER, 
    department, 
    position, 
    phone 
  } = userData
  
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      department,
      position,
      phone
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      department: true,
      position: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    }
  })

  return user as Omit<User, 'password'>
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}