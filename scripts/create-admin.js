const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('kikipoiu', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@carterisland.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Carter',
        lastName: 'Admin',
        role: 'ADMIN',
        department: 'Operations',
        position: 'System Administrator'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Password: kikipoiu')
    console.log('Role:', admin.role)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin user already exists!')
    } else {
      console.error('❌ Error creating admin:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()