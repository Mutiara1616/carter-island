// src/pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyPassword, generateToken } from '@/lib/auth'
import { AuthResponse, LoginCredentials, Role } from '@/types/auth'

async function logUserActivity(
  userId: string, 
  action: string, 
  description: string, 
  ipAddress: string | null, 
  userAgent: string | null
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Activity log error:', error)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { email, password }: LoginCredentials = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password harus diisi' 
      })
    }

    // Clear any cached user data for this email first
    const potentialUsers = await prisma.user.findMany({
      where: { email },
      select: { id: true }
    })
    
    for (const potentialUser of potentialUsers) {
      await cache.del(`user:${potentialUser.id}`)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
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

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      })
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role
    }

    const token = generateToken(tokenPayload)

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      null
    const userAgent = req.headers['user-agent'] || null

    // Delete any existing sessions for this user first
    await prisma.session.deleteMany({
      where: { userId: user.id }
    })

    await prisma.$transaction(async (tx: { user: { update: (arg0: { where: { id: any }; data: { lastLoginAt: Date }; select: { id: boolean } }) => any }; session: { create: (arg0: { data: { userId: any; token: string; expiresAt: Date; ipAddress: string | null; userAgent: string | null }; select: { id: boolean } }) => any } }) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        select: { id: true }
      })

      await tx.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          ipAddress,
          userAgent
        },
        select: { id: true }
      })
    })

    const { password: _, ...userResponse } = user

    logUserActivity(
      user.id, 
      'LOGIN', 
      `User logged in successfully - Role: ${user.role}`, 
      ipAddress, 
      userAgent
    ).catch(console.error)

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userResponse
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}