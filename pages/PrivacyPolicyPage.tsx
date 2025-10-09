import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12">
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>

          {/* Privacy Policy Content */}
          <div className="prose prose-lg max-w-none" dir="rtl" style={{ textAlign: 'right' }}>
            <h1 style={{ color: '#2F4F4F', fontSize: '2.5rem', marginBottom: '1rem' }}>
              سياسة الخصوصية لموقع تحليل (Ta7leel)
            </h1>
            <p><strong>آخر تحديث: 9 أكتوبر 2025</strong></p>
            <p>
                أهلاً بك في موقع تحليل ("ta7leel.site"). نحن في تحليل نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي نحصل عليها منك عند استخدامك لموقعنا وخدماتنا، والتي تشمل ملخصات الكتب، والمدونات، والأدوات المالية مثل حاسبة حجم الصفقات.
            </p>
            <p>
                باستخدامك للموقع، فإنك توافق على جمع واستخدام المعلومات وفقًا لهذه السياسة.
            </p>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              1. المعلومات التي نجمعها
            </h2>
            <p>
                نقوم بجمع أنواع مختلفة من المعلومات لعدة أغراض لتحسين وتوفير خدمتنا لك.
            </p>
            <h4 style={{ color: '#2F4F4F', fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              أ. المعلومات التي تقدمها لنا مباشرة:
            </h4>
            <ul style={{ paddingRight: '1.5rem', marginBottom: '1.5rem' }}>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>معلومات إنشاء الحساب:</strong> عند إنشاء حساب، قد نطلب منك تزويدنا بمعلومات شخصية مثل اسمك الكامل وعنوان بريدك الإلكتروني وكلمة المرور.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>التسجيل عبر جوجل (Google Sign-In):</strong> إذا اخترت التسجيل أو تسجيل الدخول عبر حساب جوجل الخاص بك، فإننا نتلقى من جوجل معلومات ملفك الشخصي الأساسية (مثل اسمك، بريدك الإلكتروني، وصورة ملفك الشخصي) وفقًا لإعدادات الخصوصية الخاصة بك في جوجل.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>التواصل معنا:</strong> إذا قمت بالاتصال بنا مباشرة، قد نتلقى معلومات إضافية عنك مثل محتوى الرسائل أو المرفقات التي قد ترسلها.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>النشرة الإخبارية:</strong> عند اشتراكك في نشرتنا الإخبارية، نقوم بجمع عنوان بريدك الإلكتروني.
                </li>
            </ul>

            <h4 style={{ color: '#2F4F4F', fontSize: '1.3rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              ب. المعلومات التي نجمعها تلقائيًا:
            </h4>
            <ul style={{ paddingRight: '1.5rem', marginBottom: '1.5rem' }}>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>بيانات السجل وملفات تعريف الارتباط (Cookies):</strong> مثل معظم المواقع، نجمع المعلومات التي يرسلها متصفحك عند زيارة موقعنا. قد تشمل هذه المعلومات عنوان بروتوكول الإنترنت (IP) الخاص بك، ونوع المتصفح، وإصداره، والصفحات التي تزورها، ووقت وتاريخ زيارتك، والوقت الذي تقضيه على تلك الصفحات. نستخدم ملفات تعريف الارتباط لتحسين تجربتك.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>بيانات الاستخدام:</strong> قد نجمع معلومات حول كيفية الوصول إلى الخدمة واستخدامها لتحسين جودة خدماتنا.
                </li>
            </ul>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              2. كيف نستخدم معلوماتكم
            </h2>
            <p>
                نستخدم المعلومات التي نجمعها للأغراض التالية:
            </p>
            <ul style={{ paddingRight: '1.5rem', marginBottom: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>لتقديم وتشغيل وصيانة خدماتنا، بما في ذلك ملخصات الكتب والأدوات المالية.</li>
                <li style={{ marginBottom: '0.5rem' }}>لإدارة حسابك وتوفير وصولك إلى الميزات التفاعلية (مثل حفظ الملخصات المفضلة).</li>
                <li style={{ marginBottom: '0.5rem' }}>لتخصيص تجربتك وعرض محتوى قد يثير اهتمامك.</li>
                <li style={{ marginBottom: '0.5rem' }}>للتواصل معك، بما في ذلك إرسال النشرة الإخبارية والتحديثات والرد على استفساراتك.</li>
                <li style={{ marginBottom: '0.5rem' }}>لعرض الإعلانات ذات الصلة من خلال شبكات إعلانية مثل Google AdSense، وهو ما يساعد في الحفاظ على تشغيل الموقع مجانًا.</li>
                <li style={{ marginBottom: '0.5rem' }}>لتحليل استخدام الموقع بهدف تحسين خدماتنا وتطوير ميزات جديدة.</li>
                <li style={{ marginBottom: '0.5rem' }}>لمنع الاحتيال وضمان أمان موقعنا.</li>
            </ul>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              3. مشاركة المعلومات مع الأطراف الثالثة
            </h2>
            <p>
                نحن لا نبيع بياناتك الشخصية. قد نشارك معلوماتك مع أطراف ثالثة فقط في الحالات التالية:
            </p>
            <ul style={{ paddingRight: '1.5rem', marginBottom: '1.5rem' }}>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>مقدمو الخدمات:</strong> نحن نستعين بشركات خارجية وأفراد لتسهيل خدمتنا ("مقدمو الخدمات")، مثل:
                    <ul style={{ paddingRight: '1.5rem', marginTop: '0.5rem' }}>
                        <li style={{ marginBottom: '0.3rem' }}><strong>Firebase (من Google):</strong> لإدارة مصادقة المستخدمين وتخزين بيانات الحساب (مثل قائمة الملخصات المفضلة).</li>
                        <li style={{ marginBottom: '0.3rem' }}><strong>Netlify:</strong> لاستضافة موقعنا.</li>
                        <li style={{ marginBottom: '0.3rem' }}><strong>Google Analytics:</strong> لتحليل حركة مرور الموقع.</li>
                        <li style={{ marginBottom: '0.3rem' }}><strong>Google AdSense:</strong> لعرض الإعلانات.</li>
                        <li style={{ marginBottom: '0.3rem' }}><strong>MailerLite:</strong> لإدارة وإرسال حملات البريد الإلكتروني.</li>
                    </ul>
                    هذه الأطراف الثالثة لديها إمكانية الوصول إلى بياناتك الشخصية فقط لأداء هذه المهام نيابة عنا وهي ملزمة بعدم الكشف عنها أو استخدامها لأي غرض آخر.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>لأسباب قانونية:</strong> قد نكشف عن معلوماتك إذا كنا نعتقد بحسن نية أن هذا الإجراء ضروري للامتثال لالتزام قانوني، أو لحماية حقوقنا والدفاع عنها، أو لمنع أي مخالفات محتملة تتعلق بالخدمة.
                </li>
            </ul>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              4. أمان البيانات
            </h2>
            <p>
                أمان بياناتك يهمنا، ولكن تذكر أنه لا توجد وسيلة نقل عبر الإنترنت أو طريقة تخزين إلكتروني آمنة 100%. بينما نسعى جاهدين لاستخدام وسائل مقبولة تجاريًا لحماية بياناتك الشخصية، لا يمكننا ضمان أمانها المطلق.
            </p>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              5. حقوقكم
            </h2>
            <p>
                لديك الحق في الوصول إلى بياناتك الشخصية التي نحتفظ بها، وتصحيحها، أو طلب حذفها. إذا كان لديك حساب على موقعنا، يمكنك مراجعة وتحديث معلومات حسابك. لحذف حسابك أو بياناتك بالكامل، يرجى التواصل معنا عبر البريد الإلكتروني أدناه.
            </p>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              6. خصوصية الأطفال
            </h2>
            <p>
                خدماتنا ليست موجهة للأطفال دون سن 13 عامًا. نحن لا نجمع عن قصد معلومات تعريف شخصية من أي شخص دون سن 13 عامًا. إذا كنت والدًا أو وصيًا وعلمت أن طفلك قد زودنا ببيانات شخصية، فيرجى الاتصال بنا.
            </p>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              7. تحديثات سياسة الخصوصية
            </h2>
            <p>
                قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة. ننصحك بمراجعة هذه السياسة بشكل دوري للاطلاع على أي تغييرات.
            </p>

            <h2 style={{ color: '#2F4F4F', fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>
              8. اتصل بنا
            </h2>
            <p>
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني:
                <br />
                <strong style={{ color: '#FF7F50' }}>info@ta7leel.site</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;