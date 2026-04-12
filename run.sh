#!/bin/bash

echo ""
echo "════════════════════════════════════════════════════"
echo "         🚀 JobFinder - دليل التشغيل السريع"
echo "════════════════════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت!"
    echo ""
    echo "📥 ثبّت Node.js أولاً باستخدام إحدى الطرق التالية:"
    echo ""
    echo "   الطريقة 1 - باستخدام apt:"
    echo "   ─────────────────────────────"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo ""
    echo "   الطريقة 2 - باستخدام nvm (موصى به):"
    echo "   ─────────────────────────────"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   source ~/.bashrc"
    echo "   nvm install 20"
    echo ""
    echo "   بعد التثبيت، شغّل هذا السكريبت مرة أخرى!"
    echo ""
    echo "════════════════════════════════════════════════════"
    exit 1
fi

echo "✅ Node.js مثبت: $(node --version)"
echo "✅ npm مثبت: $(npm --version)"
echo ""

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "📁 مجلد المشروع: $PROJECT_ROOT"
echo ""

# Check directories
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ خطأ: مجلدات frontend أو backend غير موجودة!"
    exit 1
fi

echo "════════════════════════════════════════════════════"
echo "         1️⃣  تشغيل Backend (Spring Boot)"
echo "════════════════════════════════════════════════════"
echo ""

cd backend

# Check if backend is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Backend يعمل بالفعل على http://localhost:8080"
else
    echo "🔄 تشغيل Backend..."
    echo "   (سيستغرق بضع ثوانٍ...)"
    
    ./mvnw spring-boot:run > /tmp/jobfinder-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Process ID: $BACKEND_PID"
    
    # Wait for backend to start
    echo -n "   انتظار بدء التشغيل"
    for i in {1..30}; do
        if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo ""
            echo "   ✅ Backend بدأ التشغيل بنجاح!"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ❌ Backend لم يبدأ! راجع الـ logs:"
        echo "      tail -f /tmp/jobfinder-backend.log"
        exit 1
    fi
fi

echo "   📍 Backend URL: http://localhost:8080"
echo "   📄 Logs: /tmp/jobfinder-backend.log"

cd ..
echo ""

echo "════════════════════════════════════════════════════"
echo "         2️⃣  تشغيل Frontend (Next.js)"
echo "════════════════════════════════════════════════════"
echo ""

cd frontend

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo "📝 إنشاء ملف .env.local..."
    echo "NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth" > .env.local
    echo "   ✅ تم إنشاء .env.local"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت Dependencies (قد يستغرق بضع دقائق في المرة الأولى)..."
    npm install
    echo "   ✅ تم تثبيت Dependencies"
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Frontend يعمل بالفعل على http://localhost:3000"
else
    echo "🔄 تشغيل Frontend..."
    
    npm run dev > /tmp/jobfinder-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   Process ID: $FRONTEND_PID"
    
    # Wait for frontend to start
    echo -n "   انتظار بدء التشغيل"
    for i in {1..20}; do
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo ""
            echo "   ✅ Frontend بدأ التشغيل بنجاح!"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ❌ Frontend لم يبدأ! راجع الـ logs:"
        echo "      tail -f /tmp/jobfinder-frontend.log"
        exit 1
    fi
fi

echo "   📍 Frontend URL: http://localhost:3000"
echo "   📄 Logs: /tmp/jobfinder-frontend.log"

cd ..
echo ""

echo "════════════════════════════════════════════════════"
echo "         🎉 المشروع شغال بنجاح!"
echo "════════════════════════════════════════════════════"
echo ""
echo "🌐 افتح المتصفح واذهب إلى:"
echo ""
echo "   👉 http://localhost:3000"
echo ""
echo "════════════════════════════════════════════════════"
echo "         📱 الصفحات المتاحة"
echo "════════════════════════════════════════════════════"
echo ""
echo "   🏠 http://localhost:3000                  - الصفحة الرئيسية"
echo "   🔐 http://localhost:3000/login            - تسجيل الدخول"
echo "   ✍️  http://localhost:3000/register         - إنشاء حساب"
echo "   🔑 http://localhost:3000/forgot-password  - نسيت كلمة المرور"
echo "   🔄 http://localhost:3000/reset-password   - إعادة تعيين"
echo "   ✉️  http://localhost:3000/verify-email     - تفعيل البريد"
echo ""
echo "════════════════════════════════════════════════════"
echo "         💡 معلومات مفيدة"
echo "════════════════════════════════════════════════════"
echo ""
echo "   • Backend Logs:  tail -f /tmp/jobfinder-backend.log"
echo "   • Frontend Logs: tail -f /tmp/jobfinder-frontend.log"
echo ""
echo "   • لإيقاف Backend:  lsof -ti:8080 | xargs kill -9"
echo "   • لإيقاف Frontend: lsof -ti:3000 | xargs kill -9"
echo ""
echo "   • OTP codes تظهر في Backend logs"
echo "   • الـ Token يُحفظ في localStorage"
echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo "✨ تمت العملية بنجاح! استمتع باستخدام JobFinder"
echo ""
echo "════════════════════════════════════════════════════"
