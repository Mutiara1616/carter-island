// scripts/create-test-user.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('testpassword', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'user@carterisland.com',
        username: 'testuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER', // Ini yang penting - role USER
        status: 'ACTIVE',
        department: 'Marine Biology',
        position: 'Field Researcher'
      }
    })

    console.log('Test user created successfully:', {
      email: user.email,
      role: user.role,
      status: user.status
    })
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()