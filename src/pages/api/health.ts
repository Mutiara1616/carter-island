// src/pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const startTime = Date.now()
    
    // Test database connection
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbTime = Date.now() - dbStart

    // Test cache connection
    const cacheStart = Date.now()
    await cache.set('health:check', { timestamp: Date.now() }, 10)
    const cacheResult = await cache.get('health:check')
    const cacheTime = Date.now() - cacheStart

    const totalTime = Date.now() - startTime

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbTime}ms`
      },
      cache: {
        connected: !!cacheResult,
        responseTime: `${cacheTime}ms`
      },
      totalResponseTime: `${totalTime}ms`
    })

  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })
  }
}