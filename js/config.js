// ==========================================
// PORTAL CONSTANTS, SAMPLE DATA & STATE
// ==========================================
const USERS_KEY = 'sms_portal_users_v1';
const SESSION_KEY = 'sms_portal_active_user';
const LEGACY_STORAGE_KEY = 'sms_portal_data_v2';
const THEME_KEY = 'sms_portal_dark_mode';

const IDB_NAME = 'RazaTutorsEnterpriseDB';
const IDB_VERSION = 1;
const IDB_STORE = 'portalState';

const NAYAPAY_DETAILS = {
  nayapayId: 'muhammad.zohaib.748@nayapay',
  accountNumber: '03704161579',
  iban: 'PK87NAYA1234503704161579'
};

// Runtime UI State
let currentLoggedInUser = null;
let isFinancialUnlocked = false;
let activeProofModalContext = null;
let studentsCurrentPage = 1;
let studentsPageSize = 10;
let chartFinInstance = null;
let chartCourseInstance = null;
let currentReceiptPhone = '';
let currentReceiptText = '';

const defaultSampleData = {
  students: [
    {
      id: 'stu_1794119921897',
      rollNo: 'ST-101',
      name: 'Muhammad Awais',
      fatherName: '',
      phone: '+971529019247',
      className: 'Beginner / Starter',
      subjects: 'Quran with Tajweed',
      classTime: '08:00 PM PKT',
      meetingLink: '',
      currency: 'AED',
      monthlyFee: 5000,
      joinDate: '2026-10-26',
      status: 'Active',
      notes: 'Dubai'
    },
    {
      id: 'stu_1794120117424',
      rollNo: 'ST-102',
      name: 'Hafsa Zubair',
      fatherName: 'Muhammad Zubair',
      phone: '+33669788400',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '09:00 PM PKT',
      meetingLink: '',
      currency: 'EUR',
      monthlyFee: 6000,
      joinDate: '2026-10-25',
      status: 'Active',
      notes: 'France'
    },
    {
      id: 'stu_1794120311852',
      rollNo: 'ST-103',
      name: 'Uzair',
      fatherName: 'Muhammad Zubair',
      phone: '+33669788400',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '09:30 PM PKT',
      meetingLink: '',
      currency: 'EUR',
      monthlyFee: 6000,
      joinDate: '2026-10-25',
      status: 'Active',
      notes: 'France'
    },
    {
      id: 'stu_1794120504309',
      rollNo: 'ST-104',
      name: 'Hafsa Fatima',
      fatherName: 'Gulam Rasool',
      phone: '03239348517',
      className: 'Intermediate',
      subjects: 'Quran with Tajweed',
      classTime: '05:00 PM PKT',
      meetingLink: '',
      currency: 'PKR',
      monthlyFee: 2500,
      joinDate: '2026-11-02',
      status: 'Active',
      notes: 'Lahore Pakistan'
    },
    {
      id: 'stu_1794120788229',
      rollNo: 'ST-105',
      name: 'Aisha Khalid',
      fatherName: 'Khalid Ghumman',
      phone: '03311276782',
      className: 'Beginner / Starter',
      subjects: 'Madni Qaida',
      classTime: '06:00 PM PKT',
      meetingLink: '',
      currency: 'PKR',
      monthlyFee: 2500,
      joinDate: '2026-10-31',
      status: 'Active',
      notes: 'Hyderabad Pakistan'
    }
  ],
  fees: {
    '2026-11': {
      stu_1794119921897: { status: 'Paid', date: '2026-11-07' },
      stu_1794120117424: { status: 'Pending', date: '' }
    }
  },
  attendance: {
    '2026-11-07': {
      stu_1794119921897: 'Leave',
      stu_1794120117424: 'Leave'
    }
  },
  marks: [],
  sabaqLogs: [],
  demos: [],
  salaries: [],
  expenses: [],
  snapshots: {},
  settings: {
    academyName: 'Raza Tutors — Online Quran Academy',
    phone: '+92 370 4161579',
    email: 'muhammad.zohaib.748@nayapay',
    logoDataUrl: '',
    financialPin: '1234'
  }
};

let state = JSON.parse(JSON.stringify(defaultSampleData));
