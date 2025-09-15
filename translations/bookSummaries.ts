import { Language } from '../contexts/LanguageContext';

export interface BookSummaryTranslation {
  summary: string;
  keyTakeaways: string[];
}

export interface BookSummaryTranslations {
  [bookId: string]: {
    [language in Language]: BookSummaryTranslation;
  };
}

export const bookSummaryTranslations: BookSummaryTranslations = {
  'atomic-habits': {
    en: {
      summary: `**Introduction**

Have you ever set an ambitious goal—to exercise every day, to read more books, to learn a new skill—only to find your motivation fizzle out within a few weeks? You're not alone. We often believe that achieving our goals requires monumental effort and heroic willpower. But what if the secret to lasting change isn't in grand, sweeping transformations, but in the tiny, almost invisible decisions we make every day?

In his groundbreaking book, "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones," author and habit expert James Clear dismantles this myth. He presents a powerful and practical framework built on a simple premise: real, long-term change comes from the compound effect of hundreds of small habits. These "atomic" habits—as tiny as an atom but just as powerful in their potential—are the building blocks of remarkable results. Clear provides not just the "what" but the "how," offering a step-by-step guide to designing your environment and routines to make good habits inevitable and bad habits impossible.

**Key Framework: The Four Laws of Behavior Change**

To build a good habit, you must make it Obvious, Attractive, Easy, and Satisfying. To break a bad habit, you must invert these laws: make it Invisible, Unattractive, Difficult, and Unsatisfying.

**The Power of 1% Improvement**

Making a choice that is just 1% better or 1% worse seems insignificant at the moment, but over a year, these small improvements compound into a massive transformation. Getting 1% better each day for a year results in being 37 times better.

**Identity-Based Habits**

The most effective way to change your habits is to change your identity. The goal isn't to read a book, but to become a reader. Every action you take is a vote for the type of person you wish to become.`,
      keyTakeaways: [
        "Small habits compound over time - getting 1% better daily leads to 37x improvement over a year",
        "Focus on identity-based habits: ask 'What would a [desired identity] person do?' rather than focusing on outcomes",
        "Use the Four Laws: Make it Obvious, Attractive, Easy, and Satisfying to build good habits",
        "Environment design is crucial - make cues for good habits visible and cues for bad habits invisible",
        "The Two-Minute Rule: start new habits with actions that take less than two minutes",
        "Habit stacking: pair new habits with established ones using 'After [current habit], I will [new habit]'",
        "Never miss twice - missing once is an accident, missing twice starts a new (bad) habit",
        "Track your habits visually to maintain motivation and see progress",
        "The Goldilocks Rule: peak motivation occurs when working on tasks at the edge of your abilities",
        "You don't rise to the level of your goals; you fall to the level of your systems"
      ]
    },
    ar: {
      summary: `**مقدمة**

هل سبق لك أن وضعت هدفاً طموحاً - أن تمارس الرياضة كل يوم، أو تقرأ المزيد من الكتب، أو تتعلم مهارة جديدة - فقط لتجد أن دافعيتك تتلاشى خلال بضعة أسابيع؟ أنت لست وحدك. غالباً ما نعتقد أن تحقيق أهدافنا يتطلب جهداً هائلاً وإرادة بطولية. لكن ماذا لو كان سر التغيير الدائم ليس في التحولات الكبيرة والشاملة، بل في القرارات الصغيرة وغير المرئية تقريباً التي نتخذها كل يوم؟

في كتابه الرائد "العادات الذرية: طريقة سهلة ومثبتة لبناء عادات جيدة وكسر العادات السيئة"، يفكك الكاتب وخبير العادات جيمس كلير هذه الأسطورة. يقدم إطار عمل قوي وعملي مبني على فرضية بسيطة: التغيير الحقيقي طويل المدى يأتي من التأثير المركب لمئات العادات الصغيرة. هذه العادات "الذرية" - صغيرة مثل الذرة لكنها قوية جداً في إمكاناتها - هي اللبنات الأساسية للنتائج الرائعة.

**الإطار الأساسي: القوانين الأربعة لتغيير السلوك**

لبناء عادة جيدة، يجب أن تجعلها واضحة وجذابة وسهلة ومُرضية. لكسر عادة سيئة، يجب أن تعكس هذه القوانين: اجعلها غير مرئية وغير جذابة وصعبة وغير مُرضية.

**قوة التحسن بنسبة 1%**

اتخاذ قرار أفضل بنسبة 1% أو أسوأ بنسبة 1% يبدو غير مهم في اللحظة، لكن على مدار عام، هذه التحسينات الصغيرة تتراكم لتصبح تحولاً هائلاً. التحسن بنسبة 1% يومياً لمدة عام ينتج عنه تحسن بـ 37 مرة.

**العادات القائمة على الهوية**

الطريقة الأكثر فعالية لتغيير عاداتك هي تغيير هويتك. الهدف ليس قراءة كتاب، بل أن تصبح قارئاً. كل عمل تقوم به هو تصويت لنوع الشخص الذي تريد أن تصبح عليه.`,
      keyTakeaways: [
        "العادات الصغيرة تتراكم مع الوقت - التحسن بنسبة 1% يومياً يؤدي إلى تحسن بـ 37 مرة خلال العام",
        "ركز على العادات القائمة على الهوية: اسأل 'ماذا سيفعل شخص بـ [الهوية المرغوبة]؟' بدلاً من التركيز على النتائج",
        "استخدم القوانين الأربعة: اجعلها واضحة وجذابة وسهلة ومُرضية لبناء عادات جيدة",
        "تصميم البيئة أمر بالغ الأهمية - اجعل إشارات العادات الجيدة مرئية وإشارات العادات السيئة غير مرئية",
        "قاعدة الدقيقتين: ابدأ العادات الجديدة بأعمال تستغرق أقل من دقيقتين",
        "تكديس العادات: اربط العادات الجديدة بالراسخة باستخدام 'بعد [العادة الحالية]، سأقوم بـ [العادة الجديدة]'",
        "لا تفوت مرتين أبداً - التفويت مرة واحدة حادث، التفويت مرتين يبدأ عادة (سيئة) جديدة",
        "تتبع عاداتك بصرياً للحفاظ على الدافعية ورؤية التقدم",
        "قاعدة جولديلوكس: الدافعية القصوى تحدث عند العمل على مهام في حافة قدراتك",
        "أنت لا ترتقي إلى مستوى أهدافك؛ بل تنخفض إلى مستوى أنظمتك"
      ]
    },
    fr: {
      summary: `**Introduction**

Avez-vous déjà fixé un objectif ambitieux - faire de l'exercice tous les jours, lire plus de livres, apprendre une nouvelle compétence - pour voir votre motivation s'essouffler en quelques semaines ? Vous n'êtes pas seul. Nous croyons souvent qu'atteindre nos objectifs nécessite un effort monumental et une volonté héroïque. Mais et si le secret du changement durable ne résidait pas dans de grandes transformations, mais dans les décisions minuscules et presque invisibles que nous prenons chaque jour ?

Dans son livre révolutionnaire "Un rien peut tout changer : Micro-habitudes, méga-résultats", l'auteur et expert en habitudes James Clear démantèle ce mythe. Il présente un cadre puissant et pratique basé sur une prémisse simple : le vrai changement à long terme vient de l'effet composé de centaines de petites habitudes. Ces habitudes "atomiques" - aussi petites qu'un atome mais tout aussi puissantes dans leur potentiel - sont les éléments constitutifs de résultats remarquables.

**Cadre clé : Les quatre lois du changement de comportement**

Pour construire une bonne habitude, vous devez la rendre Évidente, Attirante, Facile et Satisfaisante. Pour briser une mauvaise habitude, vous devez inverser ces lois : la rendre Invisible, Peu attirante, Difficile et Insatisfaisante.

**Le pouvoir de l'amélioration de 1%**

Faire un choix qui est juste 1% meilleur ou 1% pire semble insignifiant sur le moment, mais sur une année, ces petites améliorations se composent en une transformation massive. S'améliorer de 1% chaque jour pendant un an résulte en une amélioration de 37 fois.

**Habitudes basées sur l'identité**

La façon la plus efficace de changer vos habitudes est de changer votre identité. L'objectif n'est pas de lire un livre, mais de devenir un lecteur. Chaque action que vous entreprenez est un vote pour le type de personne que vous souhaitez devenir.`,
      keyTakeaways: [
        "Les petites habitudes se composent avec le temps - s'améliorer de 1% par jour mène à une amélioration de 37x sur une année",
        "Concentrez-vous sur les habitudes basées sur l'identité : demandez 'Que ferait une personne avec [l'identité désirée] ?' plutôt que de vous concentrer sur les résultats",
        "Utilisez les quatre lois : Rendez-la Évidente, Attirante, Facile et Satisfaisante pour construire de bonnes habitudes",
        "La conception de l'environnement est cruciale - rendez les signaux des bonnes habitudes visibles et ceux des mauvaises habitudes invisibles",
        "La règle des deux minutes : commencez les nouvelles habitudes avec des actions qui prennent moins de deux minutes",
        "L'empilement d'habitudes : associez les nouvelles habitudes aux établies en utilisant 'Après [habitude actuelle], je vais [nouvelle habitude]'",
        "Ne manquez jamais deux fois - manquer une fois est un accident, manquer deux fois commence une nouvelle (mauvaise) habitude",
        "Suivez vos habitudes visuellement pour maintenir la motivation et voir les progrès",
        "La règle de Boucle d'or : la motivation maximale se produit lors du travail sur des tâches à la limite de vos capacités",
        "Vous ne vous élevez pas au niveau de vos objectifs ; vous tombez au niveau de vos systèmes"
      ]
    },
    es: {
      summary: `**Introducción**

¿Alguna vez has establecido una meta ambiciosa - hacer ejercicio todos los días, leer más libros, aprender una nueva habilidad - solo para encontrar que tu motivación se desvanece en unas pocas semanas? No estás solo. A menudo creemos que lograr nuestras metas requiere un esfuerzo monumental y una fuerza de voluntad heroica. Pero ¿qué pasaría si el secreto del cambio duradero no estuviera en grandes transformaciones, sino en las decisiones pequeñas y casi invisibles que tomamos cada día?

En su libro revolucionario "Hábitos Atómicos: Cambios pequeños, resultados extraordinarios", el autor y experto en hábitos James Clear desmantela este mito. Presenta un marco poderoso y práctico basado en una premisa simple: el cambio real a largo plazo viene del efecto compuesto de cientos de pequeños hábitos. Estos hábitos "atómicos" - tan pequeños como un átomo pero igual de poderosos en su potencial - son los bloques de construcción de resultados extraordinarios.

**Marco clave: Las cuatro leyes del cambio de comportamiento**

Para construir un buen hábito, debes hacerlo Obvio, Atractivo, Fácil y Satisfactorio. Para romper un mal hábito, debes invertir estas leyes: hacerlo Invisible, Poco atractivo, Difícil e Insatisfactorio.

**El poder de la mejora del 1%**

Tomar una decisión que es solo 1% mejor o 1% peor parece insignificante en el momento, pero durante un año, estas pequeñas mejoras se componen en una transformación masiva. Mejorar 1% cada día durante un año resulta en ser 37 veces mejor.

**Hábitos basados en la identidad**

La forma más efectiva de cambiar tus hábitos es cambiar tu identidad. El objetivo no es leer un libro, sino convertirse en un lector. Cada acción que tomas es un voto por el tipo de persona que deseas llegar a ser.`,
      keyTakeaways: [
        "Los pequeños hábitos se componen con el tiempo - mejorar 1% diario lleva a una mejora de 37x durante un año",
        "Enfócate en hábitos basados en la identidad: pregunta '¿Qué haría una persona con [identidad deseada]?' en lugar de enfocarte en resultados",
        "Usa las cuatro leyes: Hazlo Obvio, Atractivo, Fácil y Satisfactorio para construir buenos hábitos",
        "El diseño del entorno es crucial - haz visibles las señales de buenos hábitos e invisibles las de malos hábitos",
        "La regla de los dos minutos: comienza nuevos hábitos con acciones que tomen menos de dos minutos",
        "Apilamiento de hábitos: empareja nuevos hábitos con establecidos usando 'Después de [hábito actual], haré [nuevo hábito]'",
        "Nunca falles dos veces - fallar una vez es un accidente, fallar dos veces inicia un nuevo (mal) hábito",
        "Rastrea tus hábitos visualmente para mantener la motivación y ver el progreso",
        "La regla de Ricitos de Oro: la motivación máxima ocurre al trabajar en tareas al borde de tus habilidades",
        "No te elevas al nivel de tus metas; caes al nivel de tus sistemas"
      ]
    }
  }
};

export const getBookSummaryTranslation = (bookId: string, language: Language): BookSummaryTranslation | null => {
  return bookSummaryTranslations[bookId]?.[language] || null;
};
