@echo off
echo 🚀 Starting Waste-to-Resource Frontend...
echo.

echo 🔍 Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🎨 Copying working package.json...
copy package-working.json package.json /Y

echo 🚀 Starting React development server...
npm start

pause
