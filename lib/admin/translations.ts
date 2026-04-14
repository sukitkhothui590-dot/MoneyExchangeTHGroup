import { screenCopyEn, screenCopyTh } from "./screenCopy";

export const adminTh = {
  screens: screenCopyTh,
  common: {
    loading: "กำลังโหลด...",
    loadingData: "กำลังโหลดข้อมูล...",
    mockOnly: "",
    copyright: "© 2026 MoneyExchangeTHGroup สงวนลิขสิทธิ์",
    helpExpand: "แสดงคำอธิบาย",
    helpCollapse: "ซ่อนคำอธิบาย",
  },
  sidebar: {
    mainMenu: "เมนูหลัก",
    toggleShow: "แสดงเมนูข้าง",
    toggleHide: "ซ่อนเมนูข้าง",
    nav: {
      dashboard: "แดชบอร์ด",
      customers: "จัดการข้อมูลลูกค้า",
      bookings: "การจอง",
      transactions: "ธุรกรรม",
      reports: "รายงาน",
      rates: "อัตราแลกเปลี่ยน",
      branches: "จัดการสาขา",
      articles: "จัดการบทความ",
      adminUsers: "ผู้ดูแลระบบ",
      systemStatus: "สถานะระบบ",
    },
  },
  header: {
    profile: "โปรไฟล์",
    logout: "ออกจากระบบ",
    adminUser: "ผู้ดูแลระบบ",
  },
  login: {
    title: "ระบบจัดการหลังบ้าน",
    subtitle: "เข้าสู่ระบบเพื่อดำเนินการ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    rememberMe: "จดจำฉัน",
    forgotPassword: "ลืมรหัสผ่าน?",
    submit: "เข้าสู่ระบบ",
    submitting: "กำลังเข้าสู่ระบบ...",
    invalidCreds: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    genericError: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
    helpTitle: "หน้าเข้าสู่ระบบแอดมิน",
    helpSections: [
      {
        title: "การใช้งาน",
        items: [
          "กรอกอีเมลและรหัสผ่านที่ได้รับจากผู้ดูแลระบบ แล้วกดเข้าสู่ระบบ",
          "สลับภาษา (มุมขวาบน) — เปลี่ยนข้อความส่วนติดต่อเป็นภาษาไทยหรืออังกฤษ",
          "จดจำฉัน — ให้เบราว์เซอร์จำสถานะล็อกอิน (ใช้บนอุปกรณ์ส่วนตัวเท่านั้น)",
        ],
      },
    ],
  },
  lang: { th: "ไทย", en: "English" },
  pages: {
    dashboard: {
      title: "แดชบอร์ด",
      subtitle: "ภาพรวมการดำเนินงาน",
      helpTitle: "หน้าแดชบอร์ดใช้งานอย่างไร",
      helpSections: [
        {
          title: "แถบด้านบน",
          items: [
            "หัวข้อหน้าแสดงชื่อและคำอธิบายสั้นๆ ไม่มีปุ่มลัดในแถบนี้ — ใช้เมนูซ้ายเพื่อไปหน้าอื่น",
          ],
        },
        {
          title: "การ์ดและเนื้อหา",
          items: [
            "การ์ดสรุปจำนวนสกุลเงิน สาขา บทความ และผู้ดูแลระบบ (จากฐานข้อมูล)",
            "ตารางอัตราแลกเปลี่ยนล่าสุดและลิงก์ไปจัดการอัตราเต็ม",
            "บทความหรือข่าวล่าสุดและลิงก์ไปจัดการบทความ",
            "รายการสาขาและสถานะเปิด/ปิด พร้อมลิงก์จัดการสาขา",
            "ลิงก์ด่วน (ล่างหน้า) ไปหน้าอื่นๆ ของระบบหลังบ้าน",
          ],
        },
      ],
    },
    customers: {
      titleDisabled: "จัดการข้อมูลลูกค้า",
      subtitleDisabled: "ยังไม่ได้เชื่อมต่อฐานข้อมูล",
      title: "จัดการข้อมูลลูกค้า",
      subtitle: "ดู แก้ไข และลบข้อมูลลูกค้าจากฐานข้อมูล",
      helpTitle: "หน้าจัดการข้อมูลลูกค้า (Identity)",
      helpSections: [
        {
          title: "แถบด้านบน",
          items: [
            "เพิ่มลูกค้า — เปิดฟอร์มสร้างลูกค้าใหม่ (รายละเอียดขึ้นกับการเชื่อมต่อระบบ)",
          ],
        },
        {
          title: "รายการและการกรอง",
          items: [
            "ค้นหาชื่อ อีเมล หรือเลขบัตร — กรองตามสถานะบัญชี (ใช้งาน / ระงับ / แบน)",
            "คลิกไอคอนดูรายละเอียด / KYC เพื่อเปิดหน้าต่างตรวจสอบข้อมูลและประวัติ",
          ],
        },
      ],
    },
    bookings: {
      title: "จัดการการจอง",
      subtitle: "ตรวจสอบสลิป อนุมัติการจอง และออก Booking ID",
      helpTitle: "หน้าจัดการการจอง",
      helpSections: [
        {
          title: "แถบด้านบน",
          items: [
            "หัวข้อแสดงสรุปการจองที่รอตรวจ (ถ้ามี) — ใช้เมนูซ้ายเพื่อไปหน้าอื่น",
          ],
        },
        {
          title: "รายการและการกรอง",
          items: [
            "ค้นหาตามชื่อ รหัส หรือข้อมูลการจอง — กรองตามสถานะ (รอชำระ / รอตรวจ / อนุมัติ / เสร็จสิ้น)",
            "คลิกแถวเพื่อเปิดรายละเอียด: ตรวจสลิป อนุมัติ หรือออก Booking ID",
          ],
        },
      ],
    },
    transactions: {
      titleDisabled: "ธุรกรรม",
      subtitleDisabled: "ยังไม่มีข้อมูลธุรกรรม",
      title: "ธุรกรรมแลกเงิน",
      subtitle: "ประวัติธุรกรรมจาก POS — ผูกสมาชิกและ KYC สำหรับตรวจทาน",
      helpTitle: "หน้าธุรกรรมแลกเงิน",
      helpSections: [
        {
          title: "แถบด้านบน (ปุ่มใน Header)",
          items: [
            "รีเฟรช — โหลดรายการธุรกรรม (และสาขา) ใหม่จากเซิร์ฟเวอร์",
            "ส่งออก CSV — ดาวน์โหลดไฟล์สรุปธุรกรรมสำหรับเปิดใน Excel",
          ],
        },
        {
          title: "ตารางและสรุป",
          items: [
            "การ์ดสรุปยอดรวมบาท จำนวนรายการ และสมาชิกที่ไม่ซ้ำ",
            "ค้นหาและกรองตามสาขา — คลิกแถวเพื่อดูรายละเอียดธุรกรรมและบริบทสมาชิก/KYC",
          ],
        },
      ],
    },
    reports: {
      titleDisabled: "รายงาน",
      subtitleDisabled: "ยังไม่มีข้อมูลรายงาน",
      title: "รายงาน",
      subtitle:
        "สรุปธุรกรรมรายวัน / ตามสาขา / ตามสกุลเงิน + visit และสถานะ KYC สมาชิก",
      helpTitle: "หน้ารายงานสรุป",
      helpSections: [
        {
          title: "แถบด้านบนและเครื่องมือ",
          items: [
            "ลิงก์ไปหน้าธุรกรรม — ดูรายการดิบทั้งหมด",
            "ส่งออก CSV — ดาวน์โหลดไฟล์สรุปชุด (รายวัน สาขา สกุลเงิน KYC)",
            "รีเฟรช — โหลดข้อมูลสรุปจากเซิร์ฟเวอร์ใหม่",
          ],
        },
        {
          title: "กราฟและตาราง",
          items: [
            "มิตริกสรุปยอดธุรกรรม ยอดเงิน visit สมาชิก และค่าเฉลี่ยต่อรายการ",
            "กราฟและตารางแยกตามวัน สาขา สกุลเงิน และสถานะ KYC ของสมาชิก",
          ],
        },
      ],
    },
    rates: {
      titleLoading: "อัตราแลกเปลี่ยน",
      subtitleLoading: "กำลังโหลด...",
      title: "อัตราแลกเปลี่ยน",
      subtitle: "จัดการอัตราซื้อ-ขายและมาร์จิ้นของสกุลเงิน",
      helpTitle: "ระบบหน้านี้ทำงานอย่างไร",
      helpSections: [
        {
          title: "แถบด้านบน (ปุ่มใน Header)",
          items: [
            "ดึงเรทใหม่ — บังคับดึงอัตราอ้างอิงล่าสุดจาก Frankfurter (ฐาน THB) และซิงก์เพิ่มสกุลเงินที่ยังไม่มีในตาราง (เฉพาะแอดมิน) ใช้เมื่อต้องการเรทจากแหล่งจริงทันที แม้ในวันนั้นจะมีแคชแล้ว",
            "รีเฟรช — โหลดข้อมูลจากเซิร์ฟเวอร์และรีเฟรชตารางด้านล่าง ระบบเก็บแคชอัตรา「ตามวัน」ตามวันที่ในเขตเวลาไทย ถ้าวันนี้ดึงไปแล้ว การกดรีเฟรชจะใช้แคชวันนั้น ไม่เรียก Frankfurter ซ้ำ — ถ้าต้องการดึงชุดเรทใหม่จาก API จริง ให้ใช้ปุ่มดึงเรทใหม่",
            "ตั้งมาร์จิ้นรวม — เปิดหน้าต่างตั้งมาร์จิ้นซื้อ/ขายให้ทุกสกุลในหน้าที่เลือกพร้อมกัน (ค่ากลางหรือสาขา) ระบบคำนวณราคาให้ตามมาร์จิ้นรวม",
            "เพิ่มสกุลเงิน — แสดงเมื่อเลือกค่ากลางเท่านั้น ใช้เพิ่มสกุลใหม่ในตารางหลัก",
          ],
        },
        {
          title: "ตาราง สาขา และค่ากลาง",
          items: [
            "ค่ากลาง (ทุกสาขา): แก้ไขราคารับซื้อ/ขายและมาร์จิ้นรายสกุลได้ เป็นข้อมูลหลักที่เว็บไซต์และ POS ใช้เป็นฐานเริ่มต้น",
            "เลือกสาขา: กำหนดมาร์จิ้นเฉพาะสาขาได้ สกุลที่ยังไม่ได้กำหนดจะใช้ค่ากลาง",
          ],
        },
      ],
    },
    branches: {
      titleLoading: "จัดการสาขา",
      subtitleLoading: "กำลังโหลด...",
      title: "จัดการสาขา",
      subtitle: "เพิ่ม แก้ไข หรือลบสาขาของร้าน",
      helpTitle: "หน้าจัดการสาขา",
      helpSections: [
        {
          title: "แถบด้านบน (ปุ่มใน Header)",
          items: [
            "เพิ่มสาขา — เปิดฟอร์มสร้างสาขาใหม่ (ชื่อที่อยู่และเวลาเปิด-ปิดหลายภาษา)",
          ],
        },
        {
          title: "รายการสาขา",
          items: [
            "ค้นหาชื่อสาขา — แก้ไขหรือลบสาขาได้จากไอคอนในแต่ละแถว",
            "ข้อมูลที่อยู่และเวลาเปิด-ปิดสามารถกรอกได้หลายภาษา (ไทย/อังกฤษ/จีน) ตามฟอร์ม",
          ],
        },
      ],
    },
    articles: {
      title: "จัดการบทความ",
      subtitle: "สร้าง แก้ไข และเผยแพร่บทความสำหรับเว็บไซต์",
      newArticle: "สร้างบทความ",
      helpTitle: "หน้าจัดการบทความ",
      helpSections: [
        {
          title: "แถบด้านบน (ปุ่มใน Header)",
          items: [
            "สร้างบทความ — ไปหน้าตัวแก้ไขเพื่อเขียนเรื่องใหม่",
          ],
        },
        {
          title: "รายการ",
          items: [
            "ค้นหาจากหัวข้อหรือคำโปรย — กรองตามสถานะเผยแพร่หรือฉบับร่าง",
            "แก้ไข ลบ หรืออัปโหลดรูปจากการ์ดแต่ละเรื่อง",
          ],
        },
      ],
    },
    articleEditor: {
      helpTitle: "หน้าตัวแก้ไขบทความ",
      helpSections: [
        {
          title: "แถบด้านบน",
          items: [
            "ลูกศรกลับ — กลับไปรายการบทความ",
            "สลับภาษา (ไทย / อังกฤษ / จีน) — แก้เนื้อหาแยกตามภาษา",
            "ดูตัวอย่าง — สลับมุมมองอ่านก่อนเผยแพร่",
            "บันทึกร่าง — เก็บเป็นฉบับร่างโดยไม่แสดงบนเว็บ",
            "เผยแพร่ — บันทึกและตั้งสถานะเผยแพร่",
          ],
        },
        {
          title: "เนื้อหาและ SEO",
          items: [
            "กรอกหัวข้อ slug คำโปรย เนื้อหา และรูปปก — แก้ meta title/description และ alt รูปได้ต่อภาษา",
            "อัปโหลดรูปผ่านปุ่มแนบไฟล์ — บันทึกก่อนจึงจะส่งข้อมูลไปเซิร์ฟเวอร์",
          ],
        },
      ],
    },
    adminUsers: {
      title: "ผู้ดูแลระบบ",
      subtitle: "จัดการบัญชีผู้ดูแลระบบ เพิ่ม ลบ และรีเซ็ตรหัสผ่าน",
      helpTitle: "หน้าผู้ดูแลระบบ",
      helpSections: [
        {
          title: "หัวข้อและเครื่องมือ",
          items: [
            "ค้นหาอีเมลหรือชื่อ — ปุ่มเพิ่มผู้ดูแลระบบอยู่ด้านขวาของแถบค้นหา (สร้างแอดมินหรือสตาฟ พร้อมรหัสผ่านและบทบาท)",
            "แก้ไขสาขาที่มอบหมาย รีเซ็ตรหัสผ่าน หรือลบบัญชีจากไอคอนในแต่ละแถว (ตามสิทธิ์)",
          ],
        },
      ],
    },
    systemStatus: {
      title: "สถานะระบบ",
      subtitle: "ตรวจสอบสถานะการทำงานของระบบ",
      helpTitle: "หน้าสถานะระบบ",
      helpSections: [
        {
          title: "แถบด้านบน (ปุ่มใน Header)",
          items: [
            "ตรวจสอบใหม่ — เรียก API ทดสอบและอัปเดตสถานะแต่ละรายการ",
          ],
        },
        {
          title: "ผลการตรวจ",
          items: [
            "การ์ดสรุปจำนวนระบบปกติ / เตือน / ขัดข้อง — ตารางด้านล่างแสดงรายละเอียดการเชื่อมต่อ API และฐานข้อมูล",
          ],
        },
      ],
    },
    profile: {
      title: "โปรไฟล์",
      subtitle: "จัดการข้อมูลบัญชีผู้ดูแลระบบ",
      helpTitle: "หน้าโปรไฟล์",
      helpSections: [
        {
          title: "การใช้งาน",
          items: [
            "ดูชื่อ อีเมล บทบาท และวันที่สร้างบัญชี",
            "แก้ไข — เปิดฟอร์มแก้ชื่อ อีเมล เบอร์โทร แล้วบันทึก (ขึ้นกับการตั้งค่าเซิร์ฟเวอร์)",
          ],
        },
      ],
    },
    wallet: {
      title: "จัดการวอลเล็ต",
      subtitle: "ตรวจสอบและอนุมัติคำขอเติมเงิน",
      helpTitle: "หน้าจัดการวอลเล็ต",
      helpSections: [
        {
          title: "แถบด้านบนและรายการ",
          items: [
            "ป้ายใน Header แสดงจำนวนคำขอเติมเงินที่รออนุมัติ (ถ้ามี)",
            "กรองตามสถานะ — คลิกแถวเพื่ออนุมัติหรือปฏิเสธพร้อมบันทึกหมายเหตุ",
          ],
        },
      ],
    },
    members: {
      title: "จัดการสมาชิก",
      subtitle: "ดูข้อมูลสมาชิกทั้งหมด ค้นหา แก้ไข และระงับบัญชี",
      helpTitle: "หน้าจัดการสมาชิก",
      helpSections: [
        {
          title: "หัวข้อและเครื่องมือ",
          items: [
            "ค้นหาชื่อ อีเมล หรือรหัสสมาชิก — กรองตามสถานะบัญชีจากแท็บด้านข้าง",
            "คลิกแถวเพื่อเปิดรายละเอียด แก้ไขข้อมูล หรือระงับบัญชี",
          ],
        },
      ],
    },
  },
  dashboard: {
    statCurrencies: "สกุลเงินที่ใช้งาน",
    statBranches: "สาขาทั้งหมด",
    statArticles: "บทความทั้งหมด",
    statAdmins: "ผู้ดูแลระบบ",
    ratesLatest: "อัตราแลกเปลี่ยนล่าสุด",
    manageAll: "จัดการทั้งหมด",
    noCurrencies: "ยังไม่มีข้อมูลสกุลเงิน",
    colCurrency: "สกุลเงิน",
    colBuy: "ราคารับซื้อ",
    colSell: "ราคาขาย",
    articlesLatest: "บทความล่าสุด",
    viewAll: "ดูทั้งหมด",
    noArticles: "ยังไม่มีบทความ",
    news: "ข่าว",
    article: "บทความ",
    statusPublished: "เผยแพร่",
    statusDraft: "ฉบับร่าง",
    branchesAll: "สาขาทั้งหมด",
    manage: "จัดการ",
    noBranches: "ยังไม่มีสาขา",
    branchOpen: "เปิดให้บริการ",
    branchClosed: "ปิดให้บริการ",
    quickLinks: "ลิงก์ด่วน",
  },
} as const;

export const adminEn = {
  screens: screenCopyEn,
  common: {
    loading: "Loading...",
    loadingData: "Loading data...",
    mockOnly: "",
    copyright: "© 2026 MoneyExchangeTHGroup. All rights reserved.",
    helpExpand: "Show explanation",
    helpCollapse: "Hide explanation",
  },
  sidebar: {
    mainMenu: "Main menu",
    toggleShow: "Show sidebar",
    toggleHide: "Hide sidebar",
    nav: {
      dashboard: "Dashboard",
      customers: "Identity Management",
      bookings: "Bookings",
      transactions: "Transactions",
      reports: "Reports",
      rates: "Exchange rates",
      branches: "Branches",
      articles: "Articles",
      adminUsers: "Admin users",
      systemStatus: "System status",
    },
  },
  header: {
    profile: "Profile",
    logout: "Sign out",
    adminUser: "Administrator",
  },
  login: {
    title: "Admin panel",
    subtitle: "Sign in to continue",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in...",
    invalidCreds: "Invalid email or password",
    genericError: "Something went wrong. Please try again.",
    helpTitle: "Admin sign-in",
    helpSections: [
      {
        title: "Usage",
        items: [
          "Enter the email and password provided by an administrator, then sign in.",
          "Language switcher (top right) — switch UI strings between Thai and English.",
          "Remember me — keeps you signed in on this browser (use only on private devices).",
        ],
      },
    ],
  },
  lang: { th: "ไทย", en: "English" },
  pages: {
    dashboard: {
      title: "Dashboard",
      subtitle: "Operations overview",
      helpTitle: "How to use the dashboard",
      helpSections: [
        {
          title: "Top bar",
          items: [
            "The title shows the page name and a short description. There are no extra actions here — use the left menu to navigate.",
          ],
        },
        {
          title: "Cards and content",
          items: [
            "Summary cards for currencies, branches, articles, and admin users (from the database).",
            "Latest exchange rates with a link to full rate management.",
            "Latest news/articles with a link to article management.",
            "Branch list with open/closed status and a link to branch settings.",
            "Quick links at the bottom to other admin pages.",
          ],
        },
      ],
    },
    customers: {
      titleDisabled: "Identity Management",
      subtitleDisabled: "Database not connected",
      title: "Identity Management",
      subtitle: "View, edit, and delete customer data",
      helpTitle: "Identity / customer management",
      helpSections: [
        {
          title: "Top bar",
          items: [
            "Add customer — opens the form to create a new record (depends on backend configuration).",
          ],
        },
        {
          title: "List and filters",
          items: [
            "Search by name, email, or ID — filter by account status (active / suspended / banned).",
            "Use view / KYC actions on a row to open details and verification history.",
          ],
        },
      ],
    },
    bookings: {
      title: "Bookings",
      subtitle: "Verify slips, approve bookings, issue Booking ID",
      helpTitle: "Bookings management",
      helpSections: [
        {
          title: "Top bar",
          items: [
            "The header may highlight pending reviews — use the sidebar to go to other sections.",
          ],
        },
        {
          title: "List and filters",
          items: [
            "Search by name, code, or booking details — filter by status (payment / review / approved / completed).",
            "Open a row for details: verify slips, approve, or issue a Booking ID.",
          ],
        },
      ],
    },
    transactions: {
      titleDisabled: "Transactions",
      subtitleDisabled: "No transaction data",
      title: "Exchange transactions",
      subtitle: "POS transaction history — member + KYC context for review",
      helpTitle: "Exchange transactions page",
      helpSections: [
        {
          title: "Top bar (Header actions)",
          items: [
            "Refresh — reloads the transaction list (and branches) from the server.",
            "Export CSV — downloads a spreadsheet file for Excel or reporting.",
          ],
        },
        {
          title: "Table and summary",
          items: [
            "Summary cards for total THB, transaction count, and unique members.",
            "Search and filter by branch — open a row for transaction details and member/KYC context.",
          ],
        },
      ],
    },
    reports: {
      titleDisabled: "Reports",
      subtitleDisabled: "No report data",
      title: "Reports",
      subtitle:
        "Transactions by day, branch & currency + POS visits + member KYC breakdown",
      helpTitle: "Reports overview",
      helpSections: [
        {
          title: "Toolbar",
          items: [
            "Link to transactions — open the raw transaction list.",
            "Export CSV — download aggregated slices (daily, branch, currency, KYC).",
            "Refresh — reloads aggregates from the server.",
          ],
        },
        {
          title: "Charts and tables",
          items: [
            "Metric tiles for volume, THB totals, visits, members, and averages.",
            "Charts and tables by day, branch, currency, and member KYC status.",
          ],
        },
      ],
    },
    rates: {
      titleLoading: "Exchange rates",
      subtitleLoading: "Loading...",
      title: "Exchange rates",
      subtitle: "Manage buy/sell rates and currency margins",
      helpTitle: "How this page works",
      helpSections: [
        {
          title: "Top bar (Header actions)",
          items: [
            "Pull new rates — Forces the latest reference rates from Frankfurter (THB base) and syncs any currencies missing from the table (admin only). Use when you need a fresh fetch from the API even if today’s cache already exists.",
            "Refresh — Reloads data from the server and refreshes the table below. Rates are cached per calendar day in Thailand time; if today’s row was already fetched, Refresh reuses that daily cache and does not call Frankfurter again — use Pull new rates to hit the live API.",
            "Apply global margin — Opens the dialog to set buy/sell margins for every currency at once on the current view (global or branch); rates are recalculated from those margins.",
            "Add currency — Shown only when “Global” is selected; adds a new currency to the master list.",
          ],
        },
        {
          title: "Table, branches & global rates",
          items: [
            "Global (all branches): Edit per-currency buy/sell rates and margins — master data the website and POS use by default.",
            "Branch selection: Set branch-specific margin overrides; currencies without an override keep using global values.",
          ],
        },
      ],
    },
    branches: {
      titleLoading: "Branches",
      subtitleLoading: "Loading...",
      title: "Branches",
      subtitle: "Add, edit, or remove store branches",
      helpTitle: "Branch management",
      helpSections: [
        {
          title: "Top bar (Header)",
          items: [
            "Add branch — opens the form for a new branch (multi-language address and hours).",
          ],
        },
        {
          title: "Branch list",
          items: [
            "Search by branch name — edit or delete from row actions.",
            "Address and hours can be filled in multiple languages (TH / EN / CN) in the form.",
          ],
        },
      ],
    },
    articles: {
      title: "Articles",
      subtitle: "Create, edit, and publish website content",
      newArticle: "New article",
      helpTitle: "Articles list",
      helpSections: [
        {
          title: "Top bar (Header)",
          items: [
            "New article — opens the editor to write a new post.",
          ],
        },
        {
          title: "List",
          items: [
            "Search by title or excerpt — filter by published or draft.",
            "Edit, delete, or upload images from each card.",
          ],
        },
      ],
    },
    articleEditor: {
      helpTitle: "Article editor",
      helpSections: [
        {
          title: "Top bar",
          items: [
            "Back — return to the article list.",
            "Language tabs (TH / EN / CN) — edit content per language.",
            "Preview — toggle a read-style preview.",
            "Save draft — store without publishing to the site.",
            "Publish — save and set status to published.",
          ],
        },
        {
          title: "Content and SEO",
          items: [
            "Fill title, slug, excerpt, body, and thumbnail — meta title/description and image alt per language.",
            "Upload images via the file button — save to persist to the server.",
          ],
        },
      ],
    },
    adminUsers: {
      title: "Admin users",
      subtitle: "Manage admin accounts, add, remove, reset passwords",
      helpTitle: "Admin users",
      helpSections: [
        {
          title: "Header and toolbar",
          items: [
            "Search by email or name — the Add admin button is on the right of the search bar (creates admin or staff with password and role).",
            "Row actions: assign branches for staff, reset password, or delete accounts (as permitted).",
          ],
        },
      ],
    },
    systemStatus: {
      title: "System status",
      subtitle: "Check system health and services",
      helpTitle: "System status",
      helpSections: [
        {
          title: "Top bar (Header)",
          items: [
            "Run checks — calls test endpoints and refreshes each status row.",
          ],
        },
        {
          title: "Results",
          items: [
            "Summary cards for OK / warning / error counts — the table lists API and database checks with green/yellow/red status.",
          ],
        },
      ],
    },
    profile: {
      title: "Profile",
      subtitle: "Manage your admin account",
      helpTitle: "Your profile",
      helpSections: [
        {
          title: "Usage",
          items: [
            "View name, email, role, and account creation date.",
            "Edit — update name, email, and phone, then save (subject to server rules).",
          ],
        },
      ],
    },
    wallet: {
      title: "Wallet",
      subtitle: "Review and approve top-up requests",
      helpTitle: "Wallet / top-ups",
      helpSections: [
        {
          title: "Header and list",
          items: [
            "A badge in the header may show how many top-up requests are pending approval.",
            "Filter by status — open a row to approve or reject with a note.",
          ],
        },
      ],
    },
    members: {
      title: "Members",
      subtitle: "View, search, edit, and suspend member accounts",
      helpTitle: "Members",
      helpSections: [
        {
          title: "Header and toolbar",
          items: [
            "Search by name, email, or member ID — filter by account status with the tabs.",
            "Open a row for details, edits, or suspension.",
          ],
        },
      ],
    },
  },
  dashboard: {
    statCurrencies: "Active currencies",
    statBranches: "Branches",
    statArticles: "Articles",
    statAdmins: "Admin users",
    ratesLatest: "Latest exchange rates",
    manageAll: "Manage all",
    noCurrencies: "No currency data yet",
    colCurrency: "Currency",
    colBuy: "Buy",
    colSell: "Sell",
    articlesLatest: "Latest articles",
    viewAll: "View all",
    noArticles: "No articles yet",
    news: "News",
    article: "Article",
    statusPublished: "Published",
    statusDraft: "Draft",
    branchesAll: "All branches",
    manage: "Manage",
    noBranches: "No branches yet",
    branchOpen: "Open",
    branchClosed: "Closed",
    quickLinks: "Quick links",
  },
} as const;

export type AdminTranslations = typeof adminTh;
export type AdminLocale = "th" | "en";
