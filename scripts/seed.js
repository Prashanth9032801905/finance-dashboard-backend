require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/modules/user/model');
const Record = require('../src/modules/record/model');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@finance.com',
    password: 'admin123',
    role: 'admin',
    status: 'active'
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: 'analyst123',
    role: 'analyst',
    status: 'active'
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: 'viewer123',
    role: 'viewer',
    status: 'active'
  }
];

const sampleRecords = [
  {
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2024-01-15'),
    note: 'Monthly salary'
  },
  {
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: new Date('2024-01-01'),
    note: 'Monthly rent payment'
  },
  {
    amount: 300,
    type: 'expense',
    category: 'Groceries',
    date: new Date('2024-01-05'),
    note: 'Weekly groceries'
  },
  {
    amount: 1500,
    type: 'income',
    category: 'Freelance',
    date: new Date('2024-01-20'),
    note: 'Freelance project payment'
  },
  {
    amount: 200,
    type: 'expense',
    category: 'Utilities',
    date: new Date('2024-01-10'),
    note: 'Electricity and water bill'
  },
  {
    amount: 800,
    type: 'expense',
    category: 'Entertainment',
    date: new Date('2024-01-25'),
    note: 'Movies and dining out'
  },
  {
    amount: 3000,
    type: 'income',
    category: 'Investment',
    date: new Date('2024-02-01'),
    note: 'Investment returns'
  },
  {
    amount: 450,
    type: 'expense',
    category: 'Transportation',
    date: new Date('2024-02-05'),
    note: 'Gas and maintenance'
  },
  {
    amount: 600,
    type: 'expense',
    category: 'Healthcare',
    date: new Date('2024-02-15'),
    note: 'Doctor visit and medication'
  },
  {
    amount: 2000,
    type: 'income',
    category: 'Bonus',
    date: new Date('2024-02-20'),
    note: 'Performance bonus'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Create records (assign to admin user)
    const adminUser = createdUsers.find(user => user.role === 'admin');
    for (const recordData of sampleRecords) {
      const record = new Record({
        ...recordData,
        createdBy: adminUser._id
      });
      await record.save();
      console.log(`Created record: ${record.type} - $${record.amount} (${record.category})`);
    }

    console.log('\n🌱 Database seeded successfully!');
    console.log('\n📋 Sample User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    createdUsers.forEach(user => {
      const originalPassword = sampleUsers.find(u => u.email === user.email).password;
      console.log(`👤 ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${originalPassword}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    console.log('🔗 API Endpoints:');
    console.log('   Login: POST /api/auth/login');
    console.log('   Register: POST /api/auth/register');
    console.log('   Dashboard: http://localhost:5000/api-docs');
    console.log('');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Check if this file is being run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
