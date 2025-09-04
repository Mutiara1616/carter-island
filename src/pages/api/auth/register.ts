import { NextApiRequest, NextApiResponse } from 'next'
import { createUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthResponse, CreateUserData } from '@/types/auth'

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
    const userData: CreateUserData = req.body

    if (!userData.email || !userData.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password harus diisi' 
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username || '' }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau username sudah digunakan' 
      })
    }

    const newUser = await createUser(userData)

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      user: newUser
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    })
  }
}