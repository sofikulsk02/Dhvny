#!/bin/bash

# Dhvny Frontend - Quick Build and Test Script

echo "🎵 Dhvny Frontend - Building for Production"
echo "==========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output in: dist/"
    echo ""
    echo "🧪 To test locally, run:"
    echo "   npm run preview"
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Push to GitHub: git push origin master"
    echo "   2. Deploy to Vercel: vercel --prod"
    echo "   3. Or use Vercel/Netlify dashboard"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "   Check the errors above and fix them."
    echo ""
    exit 1
fi
