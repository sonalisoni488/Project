// Simple start script for Waste-to-Resource Marketplace

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

const startBackend = () => {
  console.log('🚀 Starting Backend Server...');
  
  const backendProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: isWindows ? 'cmd' : 'bash',
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`Backend exited with code: ${code}`);
    }
  });
};

const startFrontend = () => {
  console.log('🎨 Starting Frontend Application...');
  
  const frontendProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: isWindows ? 'cmd' : 'bash',
    cwd: path.join(__dirname, 'frontend'),
    env: { ...process.env }
  });

  frontendProcess.stdout.on('data', (data) => {
    console.log(`Frontend: ${data}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    console.error(`Frontend Error: ${data}`);
  });

  frontendProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`Frontend exited with code: ${code}`);
    }
  });
};

const checkDependencies = () => {
  console.log('🔍 Checking Dependencies...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check backend dependencies
  const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
  if (fs.existsSync(backendPackagePath)) {
    console.log('✅ Backend package.json exists');
  } else {
    console.error('❌ Backend package.json not found!');
    }
  
  // Check frontend dependencies
  const frontendPackagePath = path.join(__dirname, 'frontend', 'package-simple.json');
  if (fs.existsSync(frontendPackagePath)) {
    console.log('✅ Frontend package.json exists');
  } else {
    console.error('❌ Frontend package.json not found!');
  }
};

const showInstructions = () => {
  console.log(`
📋 Waste-to-Resource Marketplace - Quick Start Guide

🚀 Quick Start Commands:

1. Start Backend:
   cd backend
   npm run dev

2. Start Frontend:
   cd frontend
   npm start

3. Seed Database (Optional):
   cd backend
   npm run seed

📱 Access the Application:
   Frontend: http://localhost:3000
   Backend API: http://localhost:5000/api

🔑 Default Login Credentials:
   Admin: admin@waste2resource.com / admin123
   Seller: john.seller@example.com / password123
   Buyer: jane.buyer@example.com / password123

📁 Project Structure:
   backend/
     ├── models/
     ├── routes/
     ├── middleware/
     ├── scripts/
     └── server.js
   frontend/
     ├── src/
     │   ├── context/
     │   ├── pages/
     │   ├── services/
     │   └── SimpleApp.js
     └── simple.css
     └── package-simple.json

🛠 Troubleshooting:
   - Make sure Node.js and npm are installed
   - Check that MongoDB is running
   - Verify environment variables are set correctly
   - Check that all dependencies are installed
   - Run 'npm install' if you encounter dependency issues

🎯 Happy Coding!
  `);
};

// Main function
const main = async () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      checkDependencies();
      startBackend();
      setTimeout(startFrontend, 2000);
      break;
      
    case 'backend':
      startBackend();
      break;
      
    case 'frontend':
      startFrontend();
      break;
      
    case 'seed':
      const { spawn } = require('child_process');
      const seedProcess = spawn('node', ['scripts/simpleSeed.js'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, 'backend'),
        env: { ...process.env }
      });
      
      seedProcess.stdout.on('data', (data) => {
        console.log(`Seed: ${data}`);
      });
      
      seedProcess.stderr.on('data', (data) => {
        console.error(`Seed Error: ${data}`);
      });
      
      seedProcess.on('close', (code) => {
        if (code !== 0) {
          console.log('✅ Database seeded successfully!');
        } else {
          console.error('❌ Database seeding failed!');
        }
      });
      break;
      
    case 'check':
      checkDependencies();
      break;
      
    default:
      showInstructions();
      break;
  }
};

if (require.main === module) {
  main();
} else {
  showInstructions();
  }
};
