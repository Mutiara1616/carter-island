// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import type { TokenPayload } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'carter-island-fallback-secret'

type MeUser = {
  id: string
  email: string
  username: string | null
  firstName: string | null
  lastName: string | null
  role: string
  status: 'ACTIVE' | 'INACTIVE' | string
  department: string | null
  position: string | null
  phone: string | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

type MeResponse =
  | { success: true; user: MeUser }
  | { success: false; message: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    const cacheKey = `user:${decoded.userId}`
    let user = await cache.get<MeUser>(cacheKey)

    if (!user) {
      user = await prisma.user.findUnique({
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

      await cache.set(cacheKey, user, 900)
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Account not active' })
    }

    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.status(200).json({
      success: true,
      user
    })
  } catch (error: unknown) {
    console.error('Me endpoint error:', error)

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    return res.status(500).json({ message: 'Server error' })
  }
}