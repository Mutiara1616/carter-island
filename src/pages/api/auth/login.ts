// src/pages/api/auth/login.ts - Alternative Version
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyPassword, generateToken } from '@/lib/auth'
import { AuthResponse, LoginCredentials } from '@/types/auth'

// ✅ Helper function for async activity logging
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
    // Don't let logging errors break the login flow
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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                      req.socket.remoteAddress || 
                      null
    const userAgent = req.headers['user-agent'] || null

    // ✅ Critical operations in transaction (faster)
    await prisma.$transaction(async (tx: { user: { update: (arg0: { where: { id: any }; data: { lastLoginAt: Date }; select: { id: boolean } }) => any }; session: { create: (arg0: { data: { userId: any; token: string; expiresAt: Date; ipAddress: string | null; userAgent: string | null }; select: { id: boolean } }) => any } }) => {
      // Update last login
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        select: { id: true }
      })

      // Create session
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
    await cache.set(`user:${user.id}`, userResponse, 900)

    logUserActivity(
      user.id, 
      'LOGIN', 
      'User logged in successfully', 
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