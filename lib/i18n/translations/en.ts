import type { th } from "./th";

export const en: typeof th = {
  nav: {
    home: "Home",
    exchangeRate: "Exchange Rate",
    services: "Our Services",
    news: "News",
    contact: "Contact Us",
    about: "About Us",
    faq: "FAQ",
    sprExchange: "Money Exchange",
    sprTransfer: "Money Transfer",
    tripBudget: "Trip Budget Guide",
    vipRoom: "VIP Foreign Exchange Room",
    bookQueue: "Book queue",
  },
  header: {
    companyName: "MoneyExchangeTHGroup Co., Ltd.",
    currencyExchange: "Currency Exchange",
    phone: "02-6113185",
    bookCta: "Book",
    liveRates: "Rates (THB/unit)",
    register: "Register",
    login: "Log in",
  },
  auth: {
    loginTitle: "Log in",
    loginSubtitle:
      "Use your email or Thai mobile number and password — or sign in with OTP (email/SMS)",
    registerTitle: "Create account",
    registerSubtitle: "Enter your phone number and password to register",
    email: "Email",
    phone: "Phone number",
    password: "Password",
    confirmPassword: "Confirm password",
    submitLogin: "Log in",
    submitRegister: "Register",
    loggingIn: "Signing in…",
    registering: "Creating account…",
    toRegisterPrompt: "No account yet?",
    toLoginPrompt: "Already have an account?",
    linkRegister: "Register",
    linkLogin: "Log in",
    backHome: "Back to home",
    invalidCredentials: "Invalid email/phone or password",
    invalidPhone: "Enter a valid 10-digit Thai mobile number (e.g. 0812345678)",
    invalidEmail: "Invalid email format",
    genericError: "Something went wrong. Please try again.",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    checkAfterRegister:
      "Registration successful. Sign in with your phone number and password.",
    splitLoginHeroTitle: "Hello",
    splitLoginHeroSubtitle: "Sign up now and enjoy our services",
    splitRegisterHeroTitle: "Welcome",
    splitRegisterHeroSubtitle: "Sign in with phone and password",
    formHintLogin: "Sign in with email or Thai mobile and password",
    formHintRegister: "Register with phone number",
    ctaSignUp: "Sign up",
    ctaSignIn: "Sign in",
    createAccountTitle: "Create account",
    displayName: "Name",
    forgotPassword: "Forgot password?",
    placeholderName: "Name",
    placeholderEmail: "Enter email",
    placeholderPhone: "e.g. 0812345678",
    placeholderEmailOrPhone: "Email or Thai mobile number",
    placeholderPassword: "Enter password",
    placeholderConfirmPassword: "Confirm password",
    termsAccept: "I accept the",
    termsLink: "terms and privacy policy",
    mustAcceptTerms: "Please accept the terms and privacy policy",
    otpHeading: "Or sign in with OTP (email / SMS)",
    otpSend: "Send OTP",
    otpVerify: "Verify code",
    otpCodePlaceholder: "6-digit code",
    otpSent: "Code sent — check your SMS",
    otpSentEmail: "Code sent — check your email inbox",
    otpBusy: "Sending…",
  },
  portal: {
    homeTitle: "Customer services",
    homeSubtitle: "Book a visit, exchange, and view your history",
    myProfile: "My profile",
    bookNow: "Book appointment",
    signOut: "Sign out",
    profileTitle: "Profile",
    tabProfile: "Account",
    tabBookings: "Booking history",
    tabExchanges: "Exchange history",
    save: "Save",
    saved: "Saved successfully",
    displayName: "Display name",
    notifyEmail: "Notification email (optional)",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    changePassword: "Change password",
    avatarHint: "JPG/PNG, max 2MB",
    bookingsEmpty: "No bookings yet",
    exchangesEmpty: "No exchanges yet",
    bookingBranch: "Branch",
    bookingStatus: "Status",
    bookingDate: "Booked at",
    txnAmount: "Amount",
    txnRate: "Rate",
    txnBranch: "Branch",
    forgotTitle: "Forgot password",
    forgotBody:
      "Contact our branch or support to reset your password, or use SMS OTP if enabled.",
    bookTitle: "Book queue / appointment",
    bookBranch: "Branch",
    bookCurrency: "Currency",
    bookAmount: "Amount",
    bookNote: "Note",
    bookSubmit: "Submit request",
    bookSuccess: "Booking request saved — check status in profile",
    mustLogin: "Please sign in first",
    bookPageTitle: "Book a visit / choose branch",
    bookPageSubtitle:
      "Pick country and province, then choose a branch to book or view details",
    bookSearchPlaceholder: "Search branch or address…",
    bookSearchButton: "Search",
    bookCategoryCountry: "Country",
    bookCategoryProvince: "Province",
    bookCountryThailand: "Thailand",
    bookCountrySingapore: "Singapore",
    bookCountryMalaysia: "Malaysia",
    bookCountrySoon: "Soon",
    bookCountryEmpty:
      "Booking in this country is not available yet — please choose Thailand",
    bookLoadFallback:
      "Could not load branches from server — showing sample data",
    bookNoBranches: "No branches match your filters",
    bookViewDetails: "View details",
    bookReserveNow: "Book now",
    bookPrev: "Previous",
    bookNext: "Next",
    bookClose: "Close",
    bookHoursLabel: "Hours",
    bookReviewsHint: "(reviews)",
    bookDirection: "Transaction type",
    bookDirectionBuyFx: "Buy foreign currency (pay THB, receive FX)",
    bookDirectionSellFx: "Sell foreign currency (receive THB)",
    bookAmountUnit: "Enter amount in",
    bookAmountUnitFx: "Selected currency units",
    bookAmountUnitThb: "Thai Baht (THB)",
    bookRefRateTitle: "Reference rates (estimate)",
    bookRateShopBuy: "We buy (you sell FX to us)",
    bookRateShopSell: "We sell (you buy FX from us)",
    bookRateDisclaimer:
      "Rates may change. Please confirm the amount and rate at the branch when you transact.",
    bookPickupDate: "Visit date and time",
    bookPickupHint: "Choose when you plan to visit the branch",
    bookEstimateFx: "Estimated foreign amount",
    bookEstimateThb: "Estimated THB",
    bookAmlHint:
      "Large amounts may require ID verification per branch policy.",
    bookBranchIdLabel: "Branch ID",
    bookDirTagBuy: "Buy FX",
    bookDirTagSell: "Sell FX",
    bookVisitTime: "Scheduled visit",
    bookPickupInvalid: "Please choose a date and time in the future.",
    bookRefTitle: "Booking reference",
    bookRefHint:
      "Show this code to staff at the branch to confirm your online booking.",
    bookCopyRef: "Copy code",
    bookCopied: "Copied",
    bookConfirmationCode: "Reference no.",
    bookConfirmBadge: "Confirmed",
    bookConfirmTitle: "You're booked",
    bookConfirmLead:
      "Keep this pass — show the QR or reference code at the branch.",
    bookQrCaption: "Scan to show your booking code to staff",
    bookSaveImage: "Save as image",
    bookSaveImageBusy: "Creating image…",
    bookSaveImageError: "Could not save the image. Please try again.",
  },
  footer: {
    sitemap: "Sitemap",
    allBranches: "All Branches",
    exchangeRate: "Exchange Rate",
    tripBudget: "Trip Budget Guide",
    ourServices: "Our Services",
    contactUs: "Contact Us",
    aboutUs: "About MoneyExchangeTHGroup",
    faq: "FAQ",
    terms: "Terms & Conditions",
    copyright:
      "Copyright © 2025 MoneyExchangeTHGroup | All Rights Reserved | Terms and Conditions | Reg. No. 0105555073550",
    address:
      "594/23 Diamond City Hotel Building, 1st Floor, Room 1A, Soi Phayanakh, Rama 6 Road, Thanon Phetchaburi, Ratchathewi, Bangkok 10400",
  },
  widget: {
    rateTab: "Exchange Rate",
    calcTab: "Calculator",
    latestRates: "Latest Exchange Rates",
    rateRanking: "Currency exchange rate ranking",
    lastUpdated: "*Last updated:",
    viewAll: "View all currencies",
    currency: "Currency",
    buy: "Buy",
    sell: "Sell",
    calcTitle: "Exchange Rate Calculator",
    calcSubtitle: "Select a currency to calculate the exchange amount",
    toTHB: "Convert to THB",
    fromTHB: "Convert to foreign currency",
    amountLabel: "Amount of {code} to exchange",
    amountPlaceholder: "Enter amount in {code}",
    resultLabel: "Amount of {code} received",
    resultPlaceholder: "Result",
    exchangeRateLabel: "Exchange Rate",
    rateNote:
      "Note: Exchange rates may fluctuate. Please verify at the branch.",
    allBranches: "All Branches",
    allBranchesGlobal: "All Branches (Standard Rate)",
    branch: "Branch",
    calcFor: "Calculate rate for {code}",
    switchDirection: "Switch direction",
  },
  exchange: {
    heroTitle: "Foreign Currency Exchange Rates",
    tagline: "Great rates, trusted service",
    tableTitle: "Currency Rate Table",
    tableSubtitle: "Check the latest foreign currency rates",
    denomination: "Denomination",
    calculate: "Calculate",
    noteTitle: "Note",
    note1:
      "Foreign exchange rates displayed on this website are current rates at the time of viewing, which may fluctuate and change at any time. The company reserves the right to change exchange rates without prior notice.",
    note2:
      "The decision to buy/sell any foreign currency is at the sole discretion of the company.",
    note3:
      "Please contact our service branches to verify available foreign currencies and terms before making any transaction.",
  },
  about: {
    heroTitle: "About Us",
    heroDesc:
      "MoneyExchangeTHGroup Co., Ltd. is a trusted foreign currency exchange and international trade service provider for both domestic and international customers, offering competitive rates and professional service.",
    historySection: "History of MoneyExchangeTHGroup",
    historyTitle: "Founding History & Goals",
    historyText:
      "MoneyExchangeTHGroup Co., Ltd. was established on May 22, 2012, operating in foreign currency exchange and international trade. With a commitment to providing standardized, transparent, and trustworthy services throughout its operations, the company has continuously developed and grown to become one of the most trusted foreign currency exchange service providers among both domestic and international customers.",
    historyGoal:
      "The company focuses on offering exchange rates that are competitive, transparent, and secure, while continuously elevating service standards to create the best experience for all customer groups — whether tourists, business professionals, or leading organizations.",
    historyFuture:
      "For the next steps of MoneyExchangeTHGroup Co., Ltd., the company aims to develop its business model and services to align with current and future economic changes, while creating innovations and new technologies to elevate the service experience to be convenient, fast, secure, and reliable, fully meeting customer needs. With the belief that every customer is an important partner, the company is committed to continuously developing its services to become a globally standardized leader in the currency exchange business.",
    officeLabel: "Office Location",
    officeAddress:
      "594/23 Diamond City Hotel Building, 1st Floor, Room 1A, Soi Phayanakh, Rama 6 Road, Thanon Phetchaburi, Ratchathewi, Bangkok 10400",
    strengthTitle: "The Strength of",
    strengthBrand: "MoneyExchangeTHGroup",
    expYears: "Years",
    expLabel: "Over 14 Years of Experience",
    expTitle: "Established",
    expDesc:
      "With over 10+ years of hands-on experience, MoneyExchangeTHGroup continues to improve service quality so customers receive a convenient, fast, and reliable experience.",
    branchCount: "Ready to Serve",
    branchLabel: "Branch Coverage for Customers",
    branchTitle: "Coverage",
    branchDesc:
      "We provide branch coverage in key locations so customers can access our services more conveniently and quickly.",
    serviceLabel: "Heartfelt Service",
    serviceTitle: "Outstanding Service",
    serviceDesc:
      "MoneyExchangeTHGroup is ready to serve and advise with sincerity, ensuring the best experience for every customer visit.",
    staffCount: "Ready to Support Every Step",
    staffLabel: "Professional Staff Team",
    staffTitle: "Professional",
    staffDesc:
      "Our professional staff are rigorously trained to provide clear guidance and close support, helping customers complete each transaction with confidence.",
    visionTitle: "Vision",
    visionText:
      "To become the most reliable and modern foreign currency exchange service provider in the region, with international standards, maximum security, and transparent service to build the highest confidence and satisfaction for business customers.",
    missionTitle: "Mission",
    mission1:
      "Provide accurate, fast, and transparent currency exchange services according to international standards.",
    mission2:
      "Build the highest confidence and satisfaction for all customer groups.",
    mission3:
      "Continuously develop technology and services for safety and modernity.",
    mission4:
      "Operate business with integrity, responsibility, and adherence to good governance principles.",
    keyStrengthsTitle: "Key Strengths",
    strength1: "Competitive and market-beating exchange rates",
    strength2: "Fast, accurate, and secure service with modern technology",
    strength3:
      "Comprehensive branch and network coverage for convenient access",
    strength4: "Transparent service with no hidden fees",
    strength5: "Expert staff providing professional consultation",
    strength6:
      "Additional services such as advance currency booking, international transfers, and VIP service for regular customers",
    ourServicesTitle: "Our Services",
    service1:
      "Foreign Currency Exchange (Money Exchange) — supporting over 40 currencies",
    service2:
      "International Money Transfer — covering over 200 countries worldwide",
    service3: "Online Advance Booking — convenient, fast, no waiting",
    service4: "Online Exchange Rate Check — real-time cash rate checking",
    service5: "Corporate Service — special rates for businesses",
    service6:
      "Membership — exclusive benefits, better rates, and point accumulation",
    service7: "Exchange rate consultation — by expert team",
    service8: "Multi-channel customer service — LINE, WhatsApp, WeChat, Phone",
    chairmanTitle: "Chairman's Vision",
    chairmanText1:
      '"In a rapidly changing world, trust is the heart of business. MoneyExchangeTHGroup is committed to creating value for customers and society through transparent, fair, and modern services."',
    chairmanText2:
      "We believe that sustainable development, combined with technology adoption, will enable us to better meet customer needs in terms of convenience, speed, and safety, with international standards.",
    chairmanName: "Mr. Nithi — Corporate Vision Representative",
    chairmanRole: "Chairman, MoneyExchangeTHGroup Co., Ltd.",
    partnersTitle: "Clients & Partners",
    partnersSubtitle: "International business partners who trust us",
    securityTitle: "Security Measures",
    security1: "CCTV surveillance covering all operational areas 24 hours",
    security2: "Building security systems and bank-standard safes",
    security3:
      "KYC (Know Your Customer) verification process as required by law",
    security4:
      "Transaction Monitoring system for anti-money laundering prevention",
    security5:
      "Data encryption and customer data protection (Data Security & Privacy)",
    security6:
      "Regular staff training on finance, confidentiality, and fraud prevention",
    ctaRateTitle: "Exchange Rates",
    ctaRateDesc:
      "Check real-time foreign currency exchange rates, updated daily from MoneyExchangeTHGroup branches",
    ctaTransferTitle: "Money Transfer",
    ctaTransferDesc:
      "International money transfer service covering over 200 countries worldwide. Fast, secure, and competitive rates.",
    ctaDetail: "View Details",
  },
  contact: {
    title: "Contact Us",
    subtitle:
      "Send us a message or your inquiry and we'll get back to you promptly",
    branchName: "Silom Branch (Head Office)",
    branchAddress:
      "No. 491/5-491/7, Silom Road, Silom, Bang Rak, Bangkok 10500",
    hours: "Mon-Sat 08:00-17:00",
    navigate: "Navigate with app",
    contactInfo: "Contact Information",
    nameLabel: "Full Name",
    namePlaceholder: "Full Name",
    emailLabel: "Email",
    emailPlaceholder: "Email",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Phone Number",
    companyLabel: "Company",
    companyPlaceholder: "Company",
    messageLabel: "Your message or inquiry",
    messagePlaceholder:
      "Send your message or inquiry and we'll get back to you promptly",
    success:
      "Message sent successfully. We'll contact you as soon as possible.",
    error: "Unable to send message. Please try again.",
    sending: "Sending...",
    send: "Send Message",
  },
  faq: {
    heroTitle: "Frequently Asked Questions",
    heroSubtitle:
      "A collection of popular questions about currency exchange, exchange rates, required documents, ordering currency, branch information, contact channels, etc.",
    moreQuestions: "Still have questions?",
    moreQuestionsDesc:
      "If you can't find your answer, you can contact our team immediately via the contact form or other channels.",
    contactBtn: "Contact Us",
  },
  services: {
    title: "Our Services",
    wip: "This page is under development. It will be available soon.",
    backHome: "← Back to Home",
  },
  tripGuide: {
    hero: {
      eyebrow: "Travel Finance Guide",
      title: "Trip Budget Guide",
      subtitle: "Practical and easy to use",
      desc: "If you don’t want to run out of money mid-trip, the key isn’t just the total budget — it’s controlling spending in a way that fits your itinerary.",
      chips: [
        "Plan before you go",
        "Clear money buckets",
        "Right-size emergency fund",
      ],
    },
    stats: {
      items: [
        {
          label: "Recommended cash",
          value: "40-60%",
          hint: "Best for small shops and on-the-go expenses",
          badge: "Cash",
        },
        {
          label: "Exchange before travel",
          value: "70%",
          hint: "Lock most of your rate to control costs",
          badge: "Plan",
        },
        {
          label: "Emergency buffer",
          value: "10-15%",
          hint: "Keep a buffer for unexpected situations",
          badge: "Buffer",
        },
        {
          label: "Overrun/day",
          value: "300-500",
          hint: "Covers small extras or unplanned spending",
          badge: "Daily",
        },
      ],
      tipLabel: "Planning tip:",
      tipText:
        "Split your budget into 4 buckets: fixed costs, daily spending, ready cash, and emergency fund — it makes currency decisions much easier.",
    },
    step1: {
      label: "Step 1",
      title: "Build your budget from real costs",
      desc: "Use this simple formula to see the full picture and keep control before you travel.",
      formulaLabel: "Recommended formula",
      formulaText:
        "Total = (Accommodation × nights) + Food + Transport + Activities + 10–15% buffer",
      tags: ["Accommodation", "Food", "Transport", "Activities", "Buffer"],
    },
    quickSummary: {
      eyebrow: "Quick summary",
      title: "Don’t think only about the total",
      desc: "What matters is splitting money by real expense types and always leaving room for the unexpected.",
      bullets: [
        "Use real numbers",
        "Keep an emergency buffer",
        "Avoid rushing into exchange",
      ],
      mindsetLabel: "Mindset",
      mindsetText:
        "A good travel budget isn’t just enough to pay — it helps you spend smoothly throughout the trip.",
    },
    example: {
      title: "Example budget calculation",
      subtitle:
        "Breaking the budget into categories helps you understand the trip quickly and decide money matters more easily.",
      items: [
        {
          label: "Accommodation",
          value: "1,500 × 4 nights",
          total: "6,000",
          share: "40%",
          note: "A big fixed cost you should lock in early",
        },
        {
          label: "Food",
          value: "800 × 5 days",
          total: "4,000",
          share: "27%",
          note: "Daily spending — keep some flexibility",
        },
        {
          label: "Transport",
          value: "Total cost",
          total: "2,000",
          share: "13%",
          note: "Trains, buses, taxis, or rentals",
        },
        {
          label: "Activities",
          value: "Total cost",
          total: "3,000",
          share: "20%",
          note: "Tickets, workshops, tours, etc.",
        },
      ],
      totalText:
        "Total is about 15,000 THB. Add a 10–15% buffer, and your trip budget becomes about 17,000 THB.",
      totalHighlight: "17,000 THB",
    },
    framework: {
      eyebrow: "Planning Framework",
      title: "4 budget buckets are easier to manage",
      desc: "You instantly know what each chunk is for — and exchange decisions become much clearer.",
      badge: "Split before you spend to reduce overruns",
      buckets: [
        {
          title: "Fixed costs (pre-trip)",
          desc: "Handle known numbers first: accommodation, tickets, booked activities",
          tag: "Fixed",
        },
        {
          title: "Daily spending",
          desc: "Food, city transport, daily expenses — easier to control",
          tag: "Daily",
        },
        {
          title: "Ready cash",
          desc: "Carry only what you need per day for peace of mind",
          tag: "Cash",
        },
        {
          title: "Emergency fund",
          desc: "Medical, fees, or unexpected costs",
          tag: "Backup",
        },
      ],
    },
    step2: {
      label: "Step 2",
      title: "How much cash should you carry?",
      cashLabel: "Cash",
      cardLabel: "The rest",
      cardValue: "Card",
      cashHint:
        "Good for real-life spending: small shops, some transport, or places that require cash.",
      insightTitle: "Use cash where you need flexibility",
      insightDesc:
        "Daily transport, small restaurants, or any expense you decide on the spot.",
    },
    step3: {
      label: "Step 3",
      title: "Reduce risk when exchanging money",
      option1: "1. Exchange about 70% before traveling",
      option2: "2. Keep about 30% for later",
      desc: "This spreads exchange-rate risk and reduces the chance of getting a poor rate in one shot.",
      badge: "Stick to a plan — don’t exchange everything at once",
    },
    rateChecks: {
      title: "How to check rates without mistakes",
      subtitle:
        "Takes little time, but helps you feel confident and plan the trip’s costs better.",
      items: [
        {
          title: "Compare 2–3 providers",
          desc: "Don’t stop at the first one — small differences can add up.",
        },
        {
          title: "Watch the spread",
          desc: "If it’s unusually wide, check conditions or hidden fees.",
        },
        {
          title: "Avoid emergency exchanges",
          desc: "Rushing often leads to a bad deal without comparison.",
        },
        {
          title: "A few minutes can save money",
          desc: "A short plan before exchanging improves the whole trip.",
        },
      ],
      note: "If you must exchange urgently, set a target rate first — it helps you avoid decisions driven only by pressure.",
    },
    step5: {
      label: "Step 5",
      title: "Costs that often overrun",
      items: ["Unplanned transport", "Card fees", "Small daily extras"],
    },
    emergency: {
      eyebrow: "Emergency buffer",
      title: "+300 to 500 THB/day",
      desc: "Small daily expenses can inflate your budget. Planning a buffer ahead keeps the trip comfortable.",
      tags: ["Extras", "Fees", "Emergency"],
    },
    cta: {
      title: "Summary",
      chips: ["Before travel", "During trip", "Before exchanging"],
      highlights: [
        "Use real numbers",
        "Split money smartly",
        "Check rates every time",
      ],
      desc: "That’s enough to keep your trip budget under control and travel with more peace of mind.",
      rateBtn: "Check exchange rates",
      contactBtn: "Contact us",
    },
  },
  moneyExchange: {
    heroTitle: "Foreign Currency Exchange Service",
    pageTitle: "Foreign Currency Exchange Service",
    pageDesc:
      "MoneyExchangeTHGroup offers foreign currency exchange for over 40 currencies with competitive and transparent rates, through branches across Bangkok, with a professional team ready to advise and handle every transaction with care.",
    stepsTitle: "Steps for Foreign Currency Exchange Service",
    step1Title: "Prepare Documents",
    step1Desc:
      "Prepare your ID card or original passport to present to staff before the transaction.",
    step2Title: "Choose a Convenient Branch",
    step2Desc:
      "Check the nearest branch or book in advance online for faster service.",
    step3Title: "Check Exchange Rates",
    step3Desc:
      "Check the latest exchange rates on our website or at the branch before every transaction.",
    step4Title: "Submit Documents and Money at Counter",
    step4Desc:
      "Present your documents and specify the desired currency and amount to exchange.",
    step5Title: "Receive Foreign Currency",
    step5Desc:
      "Staff will process and deliver the foreign currency along with a receipt.",
    step6Title: "Count Money Before Leaving Counter",
    step6Desc:
      "Please count the money completely and verify the receipt before leaving the branch.",
    ctaTitle: "Check foreign currency exchange rates, updated daily",
    ctaBtn: "View Exchange Rates",
  },
  moneyTransfer: {
    heroTitle: "International Money Transfer Service",
    coverageTitle: "Transfer to over 200 countries worldwide",
    pageTitle: "International Money Transfer Service",
    pageDesc:
      "MoneyExchangeTHGroup provides international money transfer services covering over 200 countries worldwide with competitive rates, fast and secure, under a Bank of Thailand license, with professional staff to guide you through every step.",
    sendStepsTitle: "Steps for Money Transfer Service",
    receiveStepsTitle: "Steps for Receiving Service",
    sendStep1Title: "Prepare Documents",
    sendStep1Desc:
      "Prepare your ID card or original passport along with the recipient's information.",
    sendStep2Title: "Visit a Service Branch",
    sendStep2Desc:
      "Go to a branch offering international money transfer or call ahead for inquiries.",
    sendStep3Title: "Fill Out Transfer Form",
    sendStep3Desc:
      "Specify the amount, currency, and recipient details along with supporting documents.",
    sendStep4Title: "Pay and Receive Proof",
    sendStep4Desc:
      "Pay the transfer amount plus fees. Receive a receipt and tracking number.",
    recvStep1Title: "Receive Notification from Sender",
    recvStep1Desc:
      "The sender will provide you with a reference number for collecting money at the branch.",
    recvStep2Title: "Prepare ID Verification",
    recvStep2Desc:
      "Prepare your ID card or original passport along with the reference number received.",
    recvStep3Title: "Visit a Service Branch",
    recvStep3Desc:
      "Go to a branch offering international money receiving service and provide the reference number to staff.",
    recvStep4Title: "Receive Money and Sign",
    recvStep4Desc:
      "Staff will verify information and disburse the money. Please count before leaving the branch.",
    feeTitle: "Friendly Fees",
    feeDesc:
      "Competitive transfer fees guaranteed. No hidden charges, so you can transfer with peace of mind — transparent and verifiable at all times.",
    safeTitle: "Safe, Convenient, Reliable",
    safeDesc:
      "International standard security systems, properly licensed, operated under Bank of Thailand authorization.",
    proTitle: "Standard-Level Service",
    proDesc:
      "Professional team ready to consult and guide every step. Over 50 years of experience in foreign currency exchange business.",
  },
  vipRoom: {
    heroSubLabel: "MoneyExchangeTHGroup",
    heroTitle: "Private VIP Foreign Exchange Room",
    heroSubtitle: "Private VIP Currency Exchange Service",
    cardTitle: "Private VIP Foreign Exchange Room",
    cardSubtitle: "Private VIP Currency Exchange Room",
    cardDesc:
      "An exclusive service for customers who reserve exchange rates and amounts in advance, offering convenience, speed, and privacy for every transaction.",
    stepsTitle: "How to Use the Service",
    stepsLabel: "Service Steps",
    step1Title: "Reserve Your Rate and Amount in Advance",
    step1Desc:
      "Inform our team of the currency, amount, and preferred time so everything is prepared before your visit.",
    step2Title: "Schedule Your Appointment",
    step2Desc:
      "Choose a convenient time to visit the VIP room — no need to wait in the main queue.",
    step3Title: "Enter the Private Room",
    step3Desc:
      "Upon arrival, our staff will greet you and escort you directly to the private service room for comfort and privacy.",
    step4Title: "Count and Transact with Confidence",
    step4Desc:
      "Verify, count, and complete your transaction in a calm, secure, and private environment.",
    audienceTitle: "Who Is This For?",
    aud1Title: "High-Volume Exchange Customers",
    aud1Desc:
      "Ideal for those exchanging large amounts who want flexibility and convenience in their transactions.",
    aud2Title: "Customers Who Value Privacy",
    aud2Desc:
      "Transactions are handled privately without waiting alongside the main queue.",
    aud3Title: "Business Travelers",
    aud3Desc:
      "Perfect for those who want to make the most of their time with fast, professional service.",
    aud4Title: "Customers Who Want to Lock Rates in Advance",
    aud4Desc:
      "Plan with confidence — schedule and prepare funds in advance under agreed terms.",
    ben1Title: "Convenient and Fast",
    ben1Desc:
      "No waiting in the main queue. Customers are served immediately at their scheduled time.",
    ben2Title: "Private and Secure",
    ben2Desc:
      "The VIP room is designed with a calm, sectioned atmosphere that prioritizes customer security.",
    ben3Title: "Professional Team Service",
    ben3Desc:
      "Expert staff oversee every step closely to ensure a smooth, transparent, and confident exchange.",
    detailTitle: "Service Details",
    detailP1:
      "To elevate service standards and provide an even more comfortable experience for our customers, the company has prepared a private VIP foreign currency exchange room. This is an exclusive service for customers who reserve exchange rates and amounts in advance and require convenience, speed, and privacy in their transactions.",
    detailP2:
      "This service is ideal for customers exchanging larger amounts, business travelers, or those who want to plan their currency exchange in advance for peace of mind. Customers can lock in exchange rates at an agreed time and be assured that the required foreign currency will be prepared before the appointment.",
    ctaSubLabel: "MoneyExchangeTHGroup",
    ctaTitle: "VIP Foreign Exchange Room",
    ctaDesc:
      "Inquire about rates in advance, schedule an appointment, and receive private service immediately.",
    ctaPhone: "Call 02-6113185",
    ctaLine: "LINE Official @298ickaf",
  },
  news: {
    title: "News & Information",
    empty: "No news yet",
    emptyDesc: "News will appear here when new articles are published.",
    readMore: "Read More",
    prev: "Previous",
    next: "Next",
    backToNews: "← Back to News",
    backToAll: "← Back to All News",
    contentNotReady: "Article content is not yet available.",
  },
  hero: {
    slide1: "Exchange foreign currency easily in just one click.",
    slide1Desc: "Instantly calculate exchange rates.",
    slide2: "Today's Exchange Rates",
    slide3: "Make currency exchange simple.",
    slide3Desc:
      "With our professional team, ready to help you choose the best rates for every decision.",
    promoTitle: "Promotions & News",
    slideOf: "Slide {current} of {total}",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: "Go to slide {num}",
  },
  converter: {
    title: "Exchange Rate Calculator",
    subtitle: "Calculate the amount you want to exchange instantly",
    from: "From Currency",
    amount: "Amount",
    amountPlaceholder: "Enter amount",
    to: "To Currency",
    result: "Estimated Result",
    rateUpdate: "Exchange rates updated every hour",
    calculate: "Calculate",
    noRate: "Cannot calculate",
    noRateDesc:
      "Exchange rate not found for the selected currency. Please select another.",
  },
  booking: {
    stripText: "Check foreign currency exchange rates, updated daily",
    viewRates: "View Exchange Rates >",
    bookOnline: "Book queue / reserve currency",
  },
  branch: {
    nearbyTitle: "Branches Near You",
    contactBtn: "Contact Us >",
    selectBranch: "Select your preferred branch",
    headOfficeName: "Head Office (Ratchathewi)",
    address: "Address",
    hours: "Operating Hours",
    status: "Status",
    statusOpen: "Open",
    landmark: "Landmark",
    contactChannel: "Contact Channels",
    phoneContact: "Phone : {phone}",
    lineContact: "Contact via LINE",
    callNow: "Call {phone}",
    openMap: "Open Map",
  },
  newsPreview: {
    title: "News",
    viewMore: "View More >",
    empty: "No news yet",
    emptyDesc: "News will appear here when new articles are published.",
  },
  servicesSection: {
    subtitle: "Service Steps",
    allServices: "All Services",
    prev: "Previous service",
    next: "Next service",
    viewMore: "View More",
    viewMoreFor: "View More {title}",
    comingSoon: "Coming Soon",
    cards: [
      {
        title: "MoneyExchangeTHGroup",
        titleSub: "Currency Exchange",
        description: "Great rates, trusted service — exchange currency with us",
      },
      {
        title: "MoneyExchangeTHGroup Money Transfer",
        titleSub: "International Transfer",
        description:
          "Transfer money anywhere, fast and secure with peace of mind",
      },
      {
        title: "Private VIP Foreign Exchange Room",
        titleSub: "Private VIP Currency Exchange Service",
        description:
          "A private exchange room for customers who reserve exchange rates and amounts in advance for convenience, speed, and privacy",
      },
    ],
  },
  ratePreview: {
    title: "Latest Exchange Rates",
    subtitle: "Foreign currency exchange rates",
    selectBranch: "Select branch",
    currency: "Currency",
    sprBuy: "Buy",
    sprSell: "Sell",
    lastUpdated: "*Last updated: {time}",
    viewAll: "View All →",
    viewAllLabel: "View all exchange rates",
  },
  contactStrip: {
    title: "Interested in our services?",
    desc1: "Contact us any day for more information",
    desc2: "or to schedule a currency exchange",
    contactBtn: "Contact Us",
  },
  branchData: {
    silom: "Silom",
    silomAddr:
      "No. 491/5-491/7, Silom Plaza Building, Silom Road, Silom, Bang Rak, Bangkok 10500",
    silomNote:
      "Silom Plaza Building, 1st Floor, near Krungthai Bank, Silom Branch",
    ratchadamri: "Ratchadamri 1",
    ratchadamriAddr:
      "No. 45, Ratchadamri Soi 1, Lumpini, Pathum Wan, Bangkok 10330",
    ratchadamriNote: "Near Ratchadamri intersection, opposite CentralWorld",
    centralWorld: "CentralWorld",
    centralWorldAddr: "No. 999/9, Ratchadamri, Pathum Wan, Bangkok 10330",
    centralWorldNote: "1st Floor, Beacon Zone, near BTS Chidlom entrance",
    mapTitle: "Map of {name} branch",
  },
  aria: {
    backHome: "Back to home",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchCurrency: "Switch currency",
    accountNav: "Sign up and log in",
  },
  faqData: [
    {
      q: "Are the exchange rates on the website the latest updated rates?",
      a: "The exchange rates displayed on our website are real-time rates that are continuously updated according to market conditions. However, rates may change at any time, so we recommend customers verify rates with the branch they wish to use before making a transaction.",
    },
    {
      q: "What documents are required for currency exchange?",
      a: "For individual customers, please bring your national ID card or original passport to present to staff before every buy/sell transaction. Corporate customers may need additional documents. Please contact a branch for details.",
    },
    {
      q: "Are there any limits on currency exchange at MoneyExchangeTHGroup?",
      a: "Currency exchange has limits according to company policy and relevant laws, such as maximum amounts per transaction or per day, which may vary by currency and customer type. Please inquire about the latest terms at a branch before making a transaction.",
    },
    {
      q: "What payment methods are available for currency exchange?",
      a: "Generally, customers can pay with cash (Thai Baht) at branches. Some branches may support additional payment methods. Please check with the branch you wish to use or call 02-6113185.",
    },
    {
      q: "Does MoneyExchangeTHGroup charge fees or commissions for currency exchange?",
      a: "The displayed rates are buy/sell rates that already include service charges. There are no separate fees for general currency exchange. Special services may have different terms. Please inquire at the branch.",
    },
    {
      q: "Can I pay by credit card or debit card?",
      a: "Payment for currency exchange at branches is generally in cash (Thai Baht). Credit cards or debit cards may be accepted at some branches or for certain services. Please contact the branch you wish to use to confirm.",
    },
    {
      q: "What is the process for advance currency ordering?",
      a: "Customers can contact the branch they wish to use to inquire about rates and amounts. Staff will then inform you of the ordering process, timeline, and conditions for collecting the currency. Please contact Call Center 02-6113185 or the branch directly.",
    },
    {
      q: "What contact channels does MoneyExchangeTHGroup have?",
      a: "You can reach us at Call Center 02-6113185, LINE Official @298ickaf, website contact form, and social media channels (Facebook, Instagram, etc.), or visit a branch directly.",
    },
    {
      q: "Where are MoneyExchangeTHGroup branches and what are the opening hours?",
      a: 'We have multiple branches in Bangkok and upcountry areas, including airports. Main branches include Silom, Ratchadamri, etc. General hours are Mon-Sat approximately 08:00-17:00. Hours may vary by branch. Please see the "All Branches" page or call 02-6113185.',
    },
    {
      q: "Are exchange rates the same across all branches?",
      a: "Rates may differ slightly between branches due to market conditions and currency availability. We recommend checking the latest rates for your preferred branch via the website or by calling the branch.",
    },
    {
      q: "Is there a branch near Don Mueang Airport?",
      a: 'We have service points in and near several airports, including Don Mueang. Please see the branch list on the "All Branches" page or search for "MoneyExchangeTHGroup Don Mueang Airport" for hours and location.',
    },
    {
      q: "Does MoneyExchangeTHGroup offer international money transfer?",
      a: "Our main service is over-the-counter foreign currency exchange. For international money transfers, please contact a branch or Call Center 02-6113185 to inquire about currently available services.",
    },
    {
      q: "Which currencies can be exchanged at MoneyExchangeTHGroup?",
      a: 'We support many major currencies including USD, EUR, GBP, JPY, CNY, AUD, SGD, HKD, CHF, and more. Available currencies and rates may vary by branch. Please check the "Exchange Rate" page or ask at a branch.',
    },
    {
      q: "How do I change a currency reservation?",
      a: "Please contact the branch where you made the reservation or Call Center 02-6113185 to request changes to the pickup date, amount, or cancellation. Terms may depend on the branch's policy and remaining time.",
    },
    {
      q: "Does MoneyExchangeTHGroup offer currency delivery?",
      a: "Generally, reserved currency must be picked up at the branch where the reservation was made. For delivery or alternate pickup locations, please ask the branch or Call Center 02-6113185 as options may be available during certain periods or promotions.",
    },
    {
      q: "Do you accept foreign coins for exchange?",
      a: "We primarily buy/sell banknotes. Acceptance of foreign coins may be limited or at different rates than banknotes. Please ask at a branch about available coin exchange services and current rates.",
    },
    {
      q: "What are the operating hours for currency exchange?",
      a: "Generally, main branches are open Mon-Sat approximately 08:00-17:00. Airport and other branches may have extended hours. Hours vary by branch. Please check the latest information on the branch details page.",
    },
    {
      q: "Can I reserve an exchange rate in advance?",
      a: "Customers can contact the branch they wish to use to inquire about rates and reservation terms. Terms depend on the policy of each period and may require a deposit or confirmation as specified by the branch.",
    },
    {
      q: "How can I get more information?",
      a: "Customers can contact us through a nearby branch, Call Center 02-6113185, LINE Official @298ickaf, our website contact form, and the company's social media channels.",
    },
  ],
  common: {
    backHome: "← Back to Home",
    loading: "Loading...",
    viewDetail: "View Details",
    cookieTitle: "Cookie Settings (PDPA)",
    cookieDesc:
      "We use cookies to ensure the website works properly and to improve your experience. You can choose to enable or disable non-essential cookies at any time.",
    cookieNecessary: "Strictly necessary cookies",
    cookieNecessaryDesc:
      "Required for basic site functionality such as security and login. These cannot be turned off.",
    cookieAnalytics: "Analytics cookies",
    cookieAnalyticsDesc:
      "Help us understand how visitors use the site so we can improve content and usability.",
    cookieMarketing: "Marketing cookies",
    cookieMarketingDesc:
      "Used to show you more relevant promotions and marketing content.",
    cookieAcceptAll: "Accept all",
    cookieRejectAll: "Reject non-essential",
    cookieCustomize: "Customize",
    cookieSave: "Save preferences",
    cookieManage: "Cookie settings",
  },
};
