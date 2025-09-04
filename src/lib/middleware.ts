// src/lib/middleware.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { cache } from './cache'
import type { TokenPayload } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'carter-island-fallback-secret'

export type AuthUser = {
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
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthUser
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | unknown>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).json({ message: 'No token provided' })
      }

      let decoded: TokenPayload
      try {
        decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
      }
      
      const cacheKey = `user:${decoded.userId}`
      let user = await cache.get<AuthUser>(cacheKey)

      if (!user) {
        const { prisma } = await import('./prisma')
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
            phone: true
          }
        })

        if (user) {
          await cache.set(cacheKey, user, 900)
        }
      }

      if (!user || user.status !== 'ACTIVE') {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      ;(req as AuthenticatedRequest).user = user
      return handler(req as AuthenticatedRequest, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(401).json({ message: 'Invalid token' })
    }
  }
}