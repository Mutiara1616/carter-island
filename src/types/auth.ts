// src/types/auth.ts
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface User {
  id: string
  email: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  role: Role
  status: UserStatus
  department?: string | null
  position?: string | null
  phone?: string | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date | null
}

export interface CreateUserData {
  email: string
  password: string
  username?: string
  firstName?: string
  lastName?: string
  role?: Role
  department?: string
  position?: string
  phone?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: Omit<User, 'password'>
}

export interface TokenPayload {
  userId: string
  email: string
  role: Role
}