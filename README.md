# MR. ZINGER — Crepe & Pizza

موقع مطعم مستر زنجر لعرض قائمة الطعام والفروع، مع إرسال الطلبات عبر واتساب.

## التشغيل محليًا

يتطلب Node.js.

```bash
npm install
npm run dev
```

يفتح موقع الزبائن افتراضيًا على `http://localhost:3000`، ولوحة الإدارة على `http://localhost:3000/admin`.

## ربط Firebase للوحة الإدارة والطلبات

1. أنشئ Web App في Firebase وانسخ قيم إعداداته إلى `.env.local` باستخدام أسماء المتغيرات الموجودة في `.env.example`.
2. فعّل **Email/Password** في Firebase Authentication، وأنشئ حساب المدير من تبويب Users.
3. أنشئ قاعدة Firestore وانشر قواعد `firestore.rules` بعد استبدال `ADMIN_EMAIL_HERE` ببريد المدير نفسه.
4. أعد تشغيل `npm run dev` بعد إضافة `.env.local`.

يسجل الموقع الطلب في Firestore قبل فتح واتساب، وتظهر الطلبات في اللوحة مع حالات مثل «جديد» و«قيد التجهيز» و«مكتمل». إعداد Web App مخصص للعميل ولا يتضمن كلمة مرور المدير؛ لا تضع كلمات المرور أو مفاتيح Admin SDK في ملفات الواجهة.
