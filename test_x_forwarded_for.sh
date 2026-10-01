#!/bin/bash

# الرابط الخاص بتسجيل الدخول أو الـ API المراد اختباره (قم بتعديله ليناسب الباك إند الخاص بك)
URL="http://localhost:8080/api/login"
METHOD="POST"

echo "🚀 بدء اختبار تخطي الـ Rate Limit باستخدام X-Forwarded-For"
echo "الرابط المستهدف: $URL"
echo "الحد المسموح به: 20 طلب في الدقيقة"
echo "------------------------------------------------------"

# إرسال 25 طلب، كل طلب بـ IP مختلف في الـ Header
for i in {1..25}
do
  FAKE_IP="192.168.1.$i"
  
  # استخدام curl لإرسال الطلب وإظهار كود الحالة (HTTP Status Code)
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $METHOD $URL \
    -H "X-Forwarded-For: $FAKE_IP" \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"password"}')

  if [ "$STATUS_CODE" -eq 429 ]; then
    echo "الطلب #$i (IP: $FAKE_IP) -> 🔴 تم الحظر (Status 429)"
  elif [ "$STATUS_CODE" -eq 200 ] || [ "$STATUS_CODE" -eq 201 ]; then
    echo "الطلب #$i (IP: $FAKE_IP) -> 🟢 نجاح (Status $STATUS_CODE)"
  else
    echo "الطلب #$i (IP: $FAKE_IP) -> 🟡 استجابة أخرى (Status $STATUS_CODE)"
  fi
done

echo "------------------------------------------------------"
echo "✅ اكتمل الاختبار."
echo "إذا ظهرت الحالة 429 بعد الطلب رقم 20، فهذا يعني أن الثغرة تم حلها بنجاح والباك إند لم يعد يثق بـ X-Forwarded-For بشكل أعمى."
echo "أما إذا نجحت كل الطلبات (200/201)، فالمشكلة لا تزال موجودة."
