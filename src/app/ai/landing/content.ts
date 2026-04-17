/* ─────────────────────────────────────────────────────────────
   AI Landing Pages — Industry-Specific Content
   ───────────────────────────────────────────────────────────── */

export interface ChatMessage {
  role: "customer" | "ai";
  text: string;
}

export interface PainPoint {
  icon: string;
  title: string;
  description: string;
  solution: string;
}

export interface HowItWorksStep {
  num: string;
  title: string;
  description: string;
}

export interface OfferItem {
  item: string;
  description: string;
  value: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  company: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface IndustryContent {
  /* Theme */
  accent: string;
  accentHover: string;

  /* Hero Image */
  heroImage: string;

  /* Hero */
  eyebrow: string;
  headlineParts: { text: string; accent?: boolean }[];
  subheadline: string;
  stats: { number: string; label: string }[];

  /* Hero Form */
  formTitle: string;
  formSubtitle: string;
  formPlaceholders: { name: string; business: string; phone: string; email: string };
  formButton: string;
  formNote: string;
  formHiddenIndustry: string;

  /* Success State */
  successEmoji: string;
  successTitle: string;
  successMessage: string;

  /* Chat Mockup */
  chatHeader: { icon: string; name: string; status: string };
  chatMessages: ChatMessage[];
  chatFooter: string;
  chatCaption: string;

  /* Offer Banner */
  offerBanner: string;
  offerTag: string;

  /* Pain Points */
  painHeadline: string;
  painSubhead: string;
  painPoints: PainPoint[];

  /* How It Works */
  howItWorksHeadline: string;
  steps: HowItWorksStep[];

  /* Offer Box */
  offerBoxTitle: string;
  offerItems: OfferItem[];
  offerPrice: string;

  /* Testimonials */
  testimonialsHeadline: string;
  testimonials: Testimonial[];

  /* FAQ */
  faqs: FAQ[];

  /* Pricing */
  pricingEyebrow: string;
  pricingHeadline: string;
  pricingSubhead: string;
  pricingPrice: string;
  pricingPeriod: string;
  pricingIncludes: { item: string; highlight?: boolean }[];
  pricingWebsiteValue: string;
  pricingCta: string;
  pricingGuarantee: string;

  /* Final CTA */
  ctaLabel: string;
  ctaHeadline: string;
  ctaAccentWord: string;
  ctaBody: string;
  ctaNote: string;
  ctaFormTitle: string;
  ctaFormSubtitle: string;

  /* Live Demo */
  agentId?: string;
}

/* ═════════════════════════════════════════════════════════════
   ROOFING
   ═════════════════════════════════════════════════════════════ */

export const roofingContent: IndustryContent = {
  accent: "#F15F2A",
  accentHover: "#C4520A",
  heroImage: "/landing-roofing-hero.png",

  eyebrow: "FOR ROOFING CONTRACTORS",
  headlineParts: [
    { text: "ROOFING LEADS " },
    { text: "DON'T WAIT ", accent: true },
    { text: "AROUND" },
  ],
  subheadline:
    "While you're on a roof, your AI answers every call, chats with every lead, and books appointments — 24 hours a day, 7 days a week. Never lose a job to voicemail again.",
  stats: [
    { number: "24/7", label: "Lead Coverage" },
    { number: "<60s", label: "Response Time" },
    { number: "$0", label: "New Website" },
  ],

  formTitle: "CLAIM YOUR FREE WEBSITE",
  formSubtitle: "+ AI Chat & Voice setup — No contract. Month to month.",
  formPlaceholders: {
    name: "Mike Johnson",
    business: "Johnson Roofing Co.",
    phone: "(555) 000-0000",
    email: "mike@johnsonroofing.com",
  },
  formButton: "🚀 Get My Free Website + AI Setup",
  formNote: "We'll reach out within 1 business day. No spam, ever.",
  formHiddenIndustry: "Roofing",

  successEmoji: "🤠",
  successTitle: "You're in, partner!",
  successMessage:
    "We'll reach out within 1 business day to get your AI set up and your free website started.",

  chatHeader: {
    icon: "🏠",
    name: "Johnson Roofing AI",
    status: "Online now · responds instantly",
  },
  chatMessages: [
    {
      role: "customer",
      text: "Hi — storm just took some shingles off my roof. Can someone come look?",
    },
    {
      role: "ai",
      text: "Absolutely! We do free storm damage inspections. Are you available tomorrow morning, or does afternoon work better?",
    },
    { role: "customer", text: "Morning is great. What time?" },
    {
      role: "ai",
      text: "Let's say 10am. I'll get that booked and send you a confirmation. What's the best number to reach you?",
    },
  ],
  chatFooter: "Today, 11:47 PM · AI responded in 4 seconds",
  chatCaption: "YOUR AI — WORKING WHILE YOU SLEEP",

  offerBanner:
    "🏠 Free Custom Website ($3,499 Value) — Included with Every AI Signup",
  offerTag: "Only 5 Spots Left This Month",

  painHeadline: "EVERY MISSED CALL IS A MISSED JOB",
  painSubhead:
    "Roofing leads have options. When they call and get voicemail, they call the next guy. Here's what you're losing every month.",
  painPoints: [
    {
      icon: "📵",
      title: "VOICEMAIL KILLS DEALS",
      description:
        "79% of callers won't leave a voicemail. If you can't answer because you're on a job, that lead is already gone.",
      solution: "AI answers every call instantly",
    },
    {
      icon: "🌩️",
      title: "STORM LEADS DON'T WAIT",
      description:
        "Hail hits at 9pm. Homeowners Google immediately. Your office opens at 8am. By then, your competitors have booked the job.",
      solution: "AI works 24/7, including nights & weekends",
    },
    {
      icon: "💸",
      title: "THE MATH IS BRUTAL",
      description:
        "Average roofing job is $8,000–$15,000. Missing 2 jobs a month from missed calls? That's $20k–$30k walking out the door.",
      solution: "Never miss a qualified lead again",
    },
  ],

  howItWorksHeadline: "SET UP ONCE. WORKS FOREVER.",
  steps: [
    {
      num: "01",
      title: "WE TRAIN YOUR AI",
      description:
        "We program your AI with your services, pricing, service area, and FAQs. It speaks your language — not robot-speak.",
    },
    {
      num: "02",
      title: "WE BUILD YOUR WEBSITE",
      description:
        "Custom, mobile-ready roofing site built to rank on Google and convert visitors into calls — $3,499 value, free.",
    },
    {
      num: "03",
      title: "AI GOES LIVE EVERYWHERE",
      description:
        "Chat widget on your site captures leads 24/7. Voice AI answers overflow calls and after-hours emergencies.",
    },
    {
      num: "04",
      title: "YOU CLOSE THE JOBS",
      description:
        "Every lead drops to your phone as a text alert. You show up, you close the job. That's literally it.",
    },
  ],

  offerBoxTitle: "THE COMPLETE PACKAGE",
  offerItems: [
    {
      item: "Custom Website — Roofing-Optimized",
      description:
        "Built to rank on Google and convert visitors into calls.",
      value: "$3,499 value — FREE",
    },
    {
      item: "AI Chat Widget (24/7)",
      description:
        "Captures leads day and night — answers questions, books jobs, handles emergency triage automatically.",
      value: "Included",
    },
    {
      item: "AI Voice Receptionist",
      description:
        "Handles overflow calls, after-hours emergencies. Gets address, job type, urgency.",
      value: "Included",
    },
    {
      item: "Setup, Training & Support",
      description:
        "We handle everything. Live within a week. No technical knowledge needed.",
      value: "Fully done-for-you",
    },
  ],
  offerPrice: "$497/mo",

  pricingEyebrow: "SIMPLE, TRANSPARENT PRICING",
  pricingHeadline: "ONE PLAN. EVERYTHING INCLUDED.",
  pricingSubhead:
    "No tiers to compare. No hidden fees. Every roofing contractor gets the full package — AI, CRM, website, and local SEO — for one flat monthly rate.",
  pricingPrice: "$497",
  pricingPeriod: "/mo",
  pricingIncludes: [
    { item: "AI Chat Widget — captures leads 24/7 on your website" },
    { item: "AI Voice Receptionist — answers overflow & after-hours calls" },
    { item: "Built-in CRM — manage every lead in one dashboard" },
    { item: "Custom Roofing Website — mobile-ready, built to convert", highlight: true },
    { item: "Local SEO — rank on Google in your service area" },
    { item: "Lead text alerts — every new lead hits your phone instantly" },
    { item: "Setup, training & ongoing support — fully done-for-you" },
  ],
  pricingWebsiteValue: "$3,499",
  pricingCta: "🚀 Get Started — Claim Your Free Website",
  pricingGuarantee: "No contracts. No setup fees. Cancel anytime.",

  testimonialsHeadline: "WHAT ROOFING CONTRACTORS ARE SAYING",
  testimonials: [
    {
      quote:
        "Before the AI, I missed calls constantly while on jobs. Now every lead gets answered instantly. Booked 4 new roofs in the first week it went live.",
      name: "Mike T.",
      company: "Owner, Tri-State Roofing · Atlanta, GA",
    },
    {
      quote:
        "AI caught a storm damage lead at 11pm — turned into a $12,000 job. It paid for itself the first night. My only regret is not getting it sooner.",
      name: "Jason R.",
      company: "Owner, Ridge Line Roofing · Marietta, GA",
    },
    {
      quote:
        "I used to spend 2 hours a day returning missed calls. Now I spend that time on jobs. Revenue is up 30% since we went live.",
      name: "Chris B.",
      company: "Owner, Benchmark Roofing · Douglasville, GA",
    },
  ],

  faqs: [
    {
      question: "How long does setup take?",
      answer:
        "Most contractors are live within 5–7 business days. We handle all setup — just answer a few questions about your business and we take it from there.",
    },
    {
      question: "Does the AI sound robotic?",
      answer:
        "No. We train it on your company's tone, services, and language. Most customers don't realize they're talking to AI — it responds naturally and professionally.",
    },
    {
      question: "What if I already have a website?",
      answer:
        "We can add the AI chat to your existing site, or build you a new one — your call. Either way you get the full AI Chat + Voice package.",
    },
    {
      question: "Is there a contract?",
      answer:
        "No contracts, ever. Month to month. Cancel anytime, no questions asked. We keep clients because it works, not because we lock them in.",
    },
    {
      question: 'What does "free website" mean exactly?',
      answer:
        "We design and build a fully custom, professional roofing website — a $3,499+ value — included at no upfront cost when you sign up for AI services. Small monthly hosting fee applies.",
    },
  ],

  ctaLabel: "READY TO START?",
  ctaHeadline: "DON'T LET ANOTHER ROOFING JOB WALK AWAY",
  ctaAccentWord: "ROOFING JOB",
  ctaBody:
    "Every day without AI is a day your leads are going to the roofer who picks up first. Fill out the form — we'll reach out within 1 business day.",
  ctaNote: "📍 Serving roofing contractors nationwide.",
  ctaFormTitle: "CLAIM YOUR SPOT",
  ctaFormSubtitle: "Free website + AI setup — Only 5 spots left this month",

  agentId: "agent_7301kpdvynhxf17ta4j1271y2a20",
};

/* ═════════════════════════════════════════════════════════════
   PLUMBING
   ═════════════════════════════════════════════════════════════ */

export const plumbingContent: IndustryContent = {
  accent: "#F15F2A",
  accentHover: "#C4520A",
  heroImage: "/landing-plumbing-hero.png",

  eyebrow: "FOR PLUMBING CONTRACTORS",
  headlineParts: [
    { text: "FIRST TO RESPOND " },
    { text: "GETS THE ", accent: true },
    { text: "JOB" },
  ],
  subheadline:
    "Plumbing emergencies don't wait for business hours. Your AI answers every call at midnight, texts leads back in seconds, and books the job — while you sleep.",
  stats: [
    { number: "24/7", label: "Emergency Coverage" },
    { number: "<60s", label: "Response Time" },
    { number: "$0", label: "New Website" },
  ],

  formTitle: "CLAIM YOUR FREE WEBSITE",
  formSubtitle: "+ AI Chat & Voice setup — No contract. Month to month.",
  formPlaceholders: {
    name: "Dave Williams",
    business: "Williams Plumbing Co.",
    phone: "(555) 000-0000",
    email: "dave@williamsplumbing.com",
  },
  formButton: "🚀 Get My Free Website + AI Setup",
  formNote: "We'll reach out within 1 business day. No spam, ever.",
  formHiddenIndustry: "Plumbing",

  successEmoji: "🤠",
  successTitle: "You're in, partner!",
  successMessage:
    "We'll reach out within 1 business day to get your AI set up and your free website started.",

  chatHeader: {
    icon: "🔧",
    name: "Williams Plumbing AI",
    status: "Online now · responds instantly",
  },
  chatMessages: [
    {
      role: "customer",
      text: "HELP — pipe just burst under my kitchen sink, water everywhere!!",
    },
    {
      role: "ai",
      text: "We're on it! We can have a plumber to you within the hour. What's your address?",
    },
    {
      role: "customer",
      text: "412 Oak St, Carrollton. Please hurry",
    },
    {
      role: "ai",
      text: "Got it — dispatching now. You'll get a text when they're 15 minutes away. Is the water shut off at the main?",
    },
  ],
  chatFooter: "Today, 11:52 PM · AI responded in 6 seconds",
  chatCaption: "YOUR AI — ON THE JOB AT MIDNIGHT",

  offerBanner:
    "🔧 Free Custom Website ($3,499 Value) — Included with Every AI Signup",
  offerTag: "Only 5 Spots Left This Month",

  painHeadline: "EVERY UNANSWERED EMERGENCY IS A LOST JOB",
  painSubhead:
    "Plumbing emergencies happen at all hours. The first plumber to respond gets the call — and the job. Here's what's costing you.",
  painPoints: [
    {
      icon: "🌙",
      title: "EMERGENCIES DON'T SLEEP",
      description:
        "Burst pipe at midnight? They're not waiting until morning. First company that responds in the next 60 seconds gets the job.",
      solution: "AI answers emergency calls instantly, 24/7",
    },
    {
      icon: "📞",
      title: "YOU CAN'T ANSWER ON A JOB",
      description:
        "You're under a sink, on a crawlspace call. Phone rings. You can't answer. That lead is already gone to the next plumber on Google.",
      solution: "AI covers every call you can't take",
    },
    {
      icon: "💰",
      title: "EMERGENCY JOBS PAY PREMIUM",
      description:
        "Midnight emergency calls command 1.5–2x normal rates. Missing even 3–4 per month is thousands in lost high-margin revenue.",
      solution: "Never miss a premium-rate job again",
    },
  ],

  howItWorksHeadline: "SET UP ONCE. WORKS FOREVER.",
  steps: [
    {
      num: "01",
      title: "WE TRAIN YOUR AI",
      description:
        "We program your AI with your services, service area, emergency rates, and how you want leads qualified. It sounds like your team.",
    },
    {
      num: "02",
      title: "WE BUILD YOUR WEBSITE",
      description:
        "Custom, mobile-ready plumbing site built to rank on Google and convert visitors into booked jobs — $3,499 value, free.",
    },
    {
      num: "03",
      title: "AI ANSWERS EVERYTHING",
      description:
        "Chat on your site captures leads 24/7. Voice AI answers overflow calls and after-hours emergencies — dispatches jobs, takes details.",
    },
    {
      num: "04",
      title: "YOU GET THE TEXT ALERT",
      description:
        "Every lead hits your phone instantly. You decide who to dispatch. The AI already has their address, problem, and urgency level.",
    },
  ],

  offerBoxTitle: "THE COMPLETE PACKAGE",
  offerItems: [
    {
      item: "Custom Website — Plumbing-Optimized",
      description:
        "Built to rank on Google and convert visitors into calls.",
      value: "$3,499 value — FREE",
    },
    {
      item: "AI Chat Widget (24/7)",
      description:
        "Captures leads day and night — answers questions, books jobs, handles emergency triage automatically.",
      value: "Included",
    },
    {
      item: "AI Voice Receptionist",
      description:
        "Handles overflow calls, after-hours emergencies. Gets address, job type, urgency.",
      value: "Included",
    },
    {
      item: "Setup, Training & Support",
      description:
        "We handle everything. Live within a week. No technical knowledge needed.",
      value: "Fully done-for-you",
    },
  ],
  offerPrice: "$497/mo",

  pricingEyebrow: "SIMPLE, TRANSPARENT PRICING",
  pricingHeadline: "ONE PLAN. EVERYTHING INCLUDED.",
  pricingSubhead:
    "No tiers to compare. No hidden fees. Every plumber gets the full package — AI, CRM, website, and local SEO — for one flat monthly rate.",
  pricingPrice: "$497",
  pricingPeriod: "/mo",
  pricingIncludes: [
    { item: "AI Chat Widget — captures leads & triages emergencies 24/7" },
    { item: "AI Voice Receptionist — handles after-hours & overflow calls" },
    { item: "Built-in CRM — manage every lead in one dashboard" },
    { item: "Custom Plumbing Website — mobile-ready, built to convert", highlight: true },
    { item: "Local SEO — rank on Google in your service area" },
    { item: "Lead text alerts — every new lead hits your phone instantly" },
    { item: "Setup, training & ongoing support — fully done-for-you" },
  ],
  pricingWebsiteValue: "$3,499",
  pricingCta: "🚀 Get Started — Claim Your Free Website",
  pricingGuarantee: "No contracts. No setup fees. Cancel anytime.",

  testimonialsHeadline: "WHAT PLUMBERS ARE SAYING",
  testimonials: [
    {
      quote:
        "I used to lose at least 3–4 calls a week while on jobs. The AI catches every single one now. Paid for itself in the first two emergency calls.",
      name: "Dave W.",
      company: "Owner, Williams Plumbing · Carrollton, GA",
    },
    {
      quote:
        "Midnight emergency call — burst pipe. AI answered, got their address, told them to shut off the main. By the time I called back, the job was basically mine. $850 for 2 hours.",
      name: "Rick K.",
      company: "Owner, K&L Plumbing · Villa Rica, GA",
    },
    {
      quote:
        "I was skeptical about AI. But the leads it captures while I sleep are real jobs — not junk. It's like having a dispatcher who never takes a day off.",
      name: "Tom M.",
      company: "Owner, Metro Plumbing · Douglasville, GA",
    },
  ],

  faqs: [
    {
      question: "Can the AI really handle emergency calls?",
      answer:
        "Yes. We train it to triage emergencies — get address, describe the problem, ask about shutting off water — and alert you immediately with all the details via text.",
    },
    {
      question: "How long does setup take?",
      answer:
        "Most plumbers are live within 5–7 business days. We handle everything — you just answer a few questions about your business.",
    },
    {
      question: "Does the AI sound robotic on calls?",
      answer:
        "No — we train it on your tone and language. Most customers don't realize they're talking to AI. It responds naturally and professionally under pressure.",
    },
    {
      question: "Is there a contract?",
      answer:
        "No contracts, ever. Month to month. Cancel anytime. We keep clients because the AI works — not because they're locked in.",
    },
    {
      question: 'What does the "free website" include?',
      answer:
        "A fully custom, professionally built plumbing website — optimized for Google, mobile-ready, with your branding and services. $3,499+ value included when you sign up. Small monthly hosting fee applies.",
    },
  ],

  ctaLabel: "READY TO START?",
  ctaHeadline: "THE NEXT EMERGENCY CALL IS COMING TONIGHT",
  ctaAccentWord: "COMING TONIGHT",
  ctaBody:
    "Will your AI answer it, or will the plumber down the street? Fill out the form — we'll reach out within 1 business day.",
  ctaNote: "📍 Serving plumbing contractors nationwide.",
  ctaFormTitle: "CLAIM YOUR SPOT",
  ctaFormSubtitle: "Free website + AI setup — Only 5 spots left this month",

  agentId: "agent_3101kpdxbcm3ejzvwgh7y7ha405f",
};

/* ═════════════════════════════════════════════════════════════
   LAW FIRM
   ═════════════════════════════════════════════════════════════ */

export const lawContent: IndustryContent = {
  accent: "#C9A84C",
  accentHover: "#B09340",
  heroImage: "/landing-law-hero.png",

  eyebrow: "FOR LAW FIRMS & ATTORNEYS",
  headlineParts: [
    { text: "YOUR NEXT CLIENT " },
    { text: "WON'T WAIT ", accent: true },
    { text: "UNTIL MONDAY" },
  ],
  subheadline:
    "Potential clients reach out at 9pm and move to the next firm if nobody responds. Your AI engages them instantly — answers questions, captures details, and books consultations around the clock.",
  stats: [
    { number: "24/7", label: "Client Coverage" },
    { number: "0", label: "Missed Inquiries" },
    { number: "Free", label: "New Website" },
  ],

  formTitle: "SCHEDULE A FREE DEMO",
  formSubtitle: "AI Chat & Voice + new website — included. No contract.",
  formPlaceholders: {
    name: "Sarah Mitchell, Esq.",
    business: "Mitchell Law Group",
    phone: "(555) 000-0000",
    email: "sarah@mitchelllawgroup.com",
  },
  formButton: "⚖️ Get My Demo + Free Website",
  formNote: "Confidential. We'll reach out within 1 business day.",
  formHiddenIndustry: "Law Firm",

  successEmoji: "⚖️",
  successTitle: "Request received.",
  successMessage:
    "We'll reach out within 1 business day to schedule your demo and discuss your new website.",

  chatHeader: {
    icon: "⚖️",
    name: "Mitchell Law Group",
    status: "Available now · responds immediately",
  },
  chatMessages: [
    {
      role: "customer",
      text: "I need to speak with an attorney about a potential personal injury case. Is anyone available?",
    },
    {
      role: "ai",
      text: "Absolutely — I can help connect you with our team. Can you briefly describe what happened and when the incident occurred?",
    },
    {
      role: "customer",
      text: "Car accident last Tuesday. Other driver ran a red light. I have injuries and my car is totaled.",
    },
    {
      role: "ai",
      text: "I'm sorry to hear that. This sounds like a strong case. I can schedule a free consultation for you — does tomorrow at 10am or 2pm work?",
    },
  ],
  chatFooter: "Today, 9:14 PM · AI responded in 5 seconds",
  chatCaption: "YOUR AI — CAPTURING CLIENTS AFTER HOURS",

  offerBanner:
    "⚖️ New Professional Website — Included with Every AI Signup",
  offerTag: "Limited Availability",

  painHeadline: "YOUR COMPETITORS ANSWER WHEN YOU DON'T",
  painSubhead:
    "Most potential legal clients reach out to 2–3 firms. The first to respond with genuine engagement gets the consultation — and the case.",
  painPoints: [
    {
      icon: "🕘",
      title: "AFTER-HOURS INQUIRIES",
      description:
        "67% of legal inquiries happen outside business hours. Without AI, those leads go unanswered until morning — and move on.",
      solution: "AI engages every inquiry within seconds",
    },
    {
      icon: "📋",
      title: "UNQUALIFIED INTAKE WASTE",
      description:
        "Your staff spends hours screening calls that aren't the right fit. AI pre-qualifies leads before they ever reach your desk.",
      solution: "AI screens and qualifies before you're involved",
    },
    {
      icon: "🏛️",
      title: "OUTDATED WEB PRESENCE",
      description:
        "Clients judge your firm by your website in 0.05 seconds. An outdated site sends high-value clients to firms that look more established.",
      solution: "New professional website included, free",
    },
  ],

  howItWorksHeadline: "INTELLIGENT. DISCREET. ALWAYS ON.",
  steps: [
    {
      num: "01",
      title: "WE TRAIN YOUR AI",
      description:
        "We program your AI on your practice areas, intake process, and consultation policies. It communicates with appropriate professional tone.",
    },
    {
      num: "02",
      title: "WE BUILD YOUR WEBSITE",
      description:
        "Professional, authoritative site that reflects your firm's credibility — built to rank and convert. Included with your AI service.",
    },
    {
      num: "03",
      title: "AI CAPTURES EVERY INQUIRY",
      description:
        "Chat engages website visitors 24/7. Answers FAQs, pre-qualifies cases, and books free consultations directly on your calendar.",
    },
    {
      num: "04",
      title: "QUALIFIED LEADS REACH YOU",
      description:
        "You receive a summary of each interaction — case type, contact info, urgency. You decide what to take, with full context already in hand.",
    },
  ],

  offerBoxTitle: "THE FULL PACKAGE",
  offerItems: [
    {
      item: "Custom Website — Law Firm-Optimized",
      description:
        "Built to rank on Google and convert visitors into consultations.",
      value: "$3,499+ value — included",
    },
    {
      item: "AI Chat Widget (24/7)",
      description:
        "Captures leads day and night — answers questions, books consultations, handles intake automatically.",
      value: "Included",
    },
    {
      item: "AI Voice Receptionist",
      description:
        "Handles after-hours calls, overflow. Gets case details, books consults.",
      value: "Included",
    },
    {
      item: "Setup, Training & Support",
      description:
        "We handle everything. Live within a week. No technical knowledge needed.",
      value: "Fully done-for-you",
    },
  ],
  offerPrice: "$497/mo",

  pricingEyebrow: "SIMPLE, TRANSPARENT PRICING",
  pricingHeadline: "ONE PLAN. EVERYTHING INCLUDED.",
  pricingSubhead:
    "No tiers to compare. No hidden fees. Every firm gets the full package — AI intake, CRM, professional website, and local SEO — for one flat monthly rate.",
  pricingPrice: "$497",
  pricingPeriod: "/mo",
  pricingIncludes: [
    { item: "AI Chat Widget — engages visitors & pre-qualifies cases 24/7" },
    { item: "AI Voice Receptionist — handles after-hours & overflow calls" },
    { item: "Built-in CRM — manage every inquiry in one dashboard" },
    { item: "Professional Law Firm Website — authoritative, built to convert", highlight: true },
    { item: "Local SEO — rank on Google for your practice areas" },
    { item: "Lead alerts — every new inquiry hits your phone instantly" },
    { item: "Setup, training & ongoing support — fully done-for-you" },
  ],
  pricingWebsiteValue: "$3,499",
  pricingCta: "⚖️ Get Started — Claim Your Free Website",
  pricingGuarantee: "No contracts. No setup fees. Cancel anytime.",

  testimonialsHeadline: "WHAT ATTORNEYS ARE SAYING",
  testimonials: [
    {
      quote:
        "We were losing consultation requests every weekend. Since the AI went live, we haven't missed a single inquiry. Three of our last five cases came in after hours.",
      name: "Sarah M., Esq.",
      company: "Managing Partner, Mitchell Law Group",
    },
    {
      quote:
        "The intake quality improved dramatically. The AI pre-screens cases so thoroughly that by the time I get on a consultation call, I already know it's worth taking.",
      name: "James P., Esq.",
      company: "Founder, Peterson & Associates",
    },
    {
      quote:
        "I was skeptical AI could handle legal intake appropriately. It does — professionally and discreetly. Our new website alone was worth the signup.",
      name: "Linda H., Esq.",
      company: "Partner, Harrison Family Law",
    },
  ],

  faqs: [
    {
      question: "Is this appropriate for legal communication?",
      answer:
        "Yes. The AI is trained to communicate professionally and never provides legal advice — it captures initial information and books consultations. All interactions are clearly framed as intake, not attorney-client communication.",
    },
    {
      question: "How long does setup take?",
      answer:
        "Most firms are live within 5–7 business days. We handle all training and deployment — you review and approve before anything goes live.",
    },
    {
      question: "Can the AI handle multiple practice areas?",
      answer:
        "Yes. We train it on all of your practice areas with appropriate intake flows for each — personal injury, family law, criminal, estate, etc.",
    },
    {
      question: "Is there a contract?",
      answer:
        "No long-term contracts. Month to month. If it's not generating qualified consultations within 60 days, we'll work with you until it does.",
    },
    {
      question: "What does the website include?",
      answer:
        "A fully custom, professionally designed law firm website — practice area pages, attorney bios, contact forms, and local SEO optimization. A $3,499+ value, included with your AI service. Small monthly hosting fee applies.",
    },
  ],

  ctaLabel: "READY TO START?",
  ctaHeadline: "THE CONSULTATION THAT GOT AWAY ENDS TODAY",
  ctaAccentWord: "ENDS TODAY",
  ctaBody:
    "Every inquiry that goes unanswered is a case that goes to a competing firm. Fill out the form and we'll reach out within 1 business day.",
  ctaNote: "📍 Serving law firms and solo practitioners nationwide.",
  ctaFormTitle: "SCHEDULE YOUR DEMO",
  ctaFormSubtitle: "New website + AI setup — included. No obligation.",

  agentId: "agent_0201kpdys5dreehavd57kgb0pqmg",
};
