import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { AuthResponse, LoginCredentials } from '@/types/auth'

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
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false, 
        message: 'Akun tidak aktif' 
      })
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah' 
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null
      }
    })

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: 'User logged in successfully',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null
      }
    })

    const { password: _, ...userResponse } = user

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