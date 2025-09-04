// src/pages/api/auth/me.ts
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { TokenPayload } from '@/types/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Account not active' })
    }

    res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Me endpoint error:', error)
    res.status(500).json({ message: 'Invalid token or server error' })
  }
}