// scripts/debug-login.js
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    console.log('🔍 DEBUGGING LOGIN SYSTEM')
    console.log('=' .repeat(50))
    
    // 1. Check all users
    const users = await prisma.user.findMany({
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
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('👥 ALL USERS IN DATABASE:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Role: "${user.role}" (${typeof user.role})`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`)
      console.log(`   ID: ${user.id}`)
      console.log('-' .repeat(30))
    })
    
    // 2. Check sessions
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      },
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log('\n🔐 ACTIVE SESSIONS:')
    if (sessions.length === 0) {
      console.log('   No active sessions found.')
    } else {
      sessions.forEach((session, index) => {
        // Decode the JWT token
        let decodedToken = null
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'carter-island-fallback-secret'
          decodedToken = jwt.verify(session.token, JWT_SECRET)
        } catch (err) {
          console.log(`   Token decode error: ${err.message}`)
        }
        
        console.log(`${index + 1}. Session ID: ${session.id}`)
        console.log(`   User: ${session.user.email}`)
        console.log(`   User Role: ${session.user.role}`)
        console.log(`   Token (first 20 chars): ${session.token.substring(0, 20)}...`)
        if (decodedToken) {
          console.log(`   Token Payload:`)
          console.log(`     - userId: ${decodedToken.userId}`)
          console.log(`     - email: ${decodedToken.email}`) 
          console.log(`     - role: ${decodedToken.role}`)
        }
        console.log(`   Expires: ${session.expiresAt}`)
        console.log('-' .repeat(30))
      })
    }
    
    // 3. Test specific admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@carterisland.com' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log('\n👑 ADMIN USER CHECK:')
    if (adminUser) {
      console.log('✅ Admin user found:')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Role: "${adminUser.role}" (${typeof adminUser.role})`)
      console.log(`   Status: ${adminUser.status}`)
      console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`)
    } else {
      console.log('❌ Admin user NOT found!')
    }
    
    // 4. Test specific regular user
    const regularUser = await prisma.user.findUnique({
      where: { email: 'user@carterisland.com' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true
      }
    })
    
    console.log('\n👤 REGULAR USER CHECK:')
    if (regularUser) {
      console.log('✅ Regular user found:')
      console.log(`   ID: ${regularUser.id}`)
      console.log(`   Email: ${regularUser.email}`)
      console.log(`   Role: "${regularUser.role}" (${typeof regularUser.role})`)
      console.log(`   Status: ${regularUser.status}`)
      console.log(`   Name: ${regularUser.firstName} ${regularUser.lastName}`)
    } else {
      console.log('❌ Regular user NOT found!')
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()