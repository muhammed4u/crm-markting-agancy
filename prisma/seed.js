const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database tables...');
  await prisma.auditTrail.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding user accounts...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Staff & Admin Users
  const admin = await prisma.user.create({
    data: {
      name: 'Sherif Omar (Admin)',
      email: 'admin@marketingacademy.com',
      password: passwordHash,
      phone: '+201001234567',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  const salesAgent = await prisma.user.create({
    data: {
      name: 'Youssef Ahmed (Sales)',
      email: 'sales@marketingacademy.com',
      password: passwordHash,
      phone: '+201111234567',
      role: 'SALES',
      status: 'APPROVED',
    },
  });

  const instructor = await prisma.user.create({
    data: {
      name: 'Dr. Tarek Kamel (Instructor)',
      email: 'instructor@marketingacademy.com',
      password: passwordHash,
      phone: '+201221234567',
      role: 'INSTRUCTOR',
      status: 'APPROVED',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      name: 'Nour El-Din (Accountant)',
      email: 'accountant@marketingacademy.com',
      password: passwordHash,
      phone: '+201551234567',
      role: 'ACCOUNTANT',
      status: 'APPROVED',
    },
  });

  // 2. Create Student Users
  const studentUser1 = await prisma.user.create({
    data: {
      name: 'Muhammed Mostafa',
      email: 'student1@gmail.com',
      password: passwordHash,
      phone: '+201021234567',
      role: 'STUDENT',
      status: 'APPROVED',
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      name: 'Mariam Ali',
      email: 'student2@gmail.com',
      password: passwordHash,
      phone: '+201031234567',
      role: 'STUDENT',
      status: 'APPROVED',
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      name: 'Hazem Omar',
      email: 'student3@gmail.com',
      password: passwordHash,
      phone: '+201041234567',
      role: 'STUDENT',
      status: 'APPROVED',
    },
  });

  console.log('Seeding student profiles...');
  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      bio: 'Enthusiastic about digital growth and Facebook advertising.',
      level: 'Beginner',
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      bio: 'Wants to switch career to Content Creation and Branding.',
      level: 'Intermediate',
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      bio: 'Experienced in sales, looking to learn PPC strategies.',
      level: 'Advanced',
    },
  });

  console.log('Seeding leads database...');
  await prisma.lead.createMany({
    data: [
      {
        name: 'Amr Khaled',
        phone: '+201089876543',
        email: 'amr.khaled@example.com',
        source: 'Facebook Ads',
        status: 'NEW',
        notes: 'Inquired about the Social Media Marketing course price.',
        assignedTo: salesAgent.id,
      },
      {
        name: 'Sara Refaat',
        phone: '+201076543210',
        email: 'sara.refaat@example.com',
        source: 'Google Search',
        status: 'CONTACTED',
        notes: 'Called. Said she is busy, call back next Thursday.',
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        assignedTo: salesAgent.id,
      },
      {
        name: 'Karim Hassan',
        phone: '+201198765432',
        email: 'karim.hassan@example.com',
        source: 'Referral',
        status: 'INTERESTED',
        notes: 'Extremely interested in SEO module. Requests installment plan details.',
        assignedTo: salesAgent.id,
      },
      {
        name: 'Noha Gamal',
        phone: '+201298765432',
        email: 'noha.gamal@example.com',
        source: 'Instagram',
        status: 'CLOSED',
        notes: 'Said the price is too high. Declined to enroll.',
        assignedTo: salesAgent.id,
      },
      {
        name: 'Muhammed Mostafa',
        phone: '+201021234567',
        email: 'student1@gmail.com',
        source: 'Facebook Ads',
        status: 'PAID',
        notes: 'Paid first installment, student profile created.',
        assignedTo: salesAgent.id,
      },
      {
        name: 'Mariam Ali',
        phone: '+201031234567',
        email: 'student2@gmail.com',
        source: 'Website Form',
        status: 'PAID',
        notes: 'Full payment completed.',
        assignedTo: salesAgent.id,
      },
    ],
  });

  console.log('Seeding academy courses and lectures...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Digital Marketing Mastery',
      description: 'Master SEO, SEM, Facebook Ads, Google Analytics and Copywriting from scratch.',
      price: 2500,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
      instructorId: instructor.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Social Media Strategy & Branding',
      description: 'Learn how to build viral organic content and drive brand value on TikTok, Instagram and LinkedIn.',
      price: 1800,
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
      instructorId: instructor.id,
    },
  });

  const lecture1 = await prisma.lecture.create({
    data: {
      courseId: course1.id,
      title: 'Introduction to SEO and Keywords',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      fileUrl: '/materials/seo-guide.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    },
  });

  const lecture2 = await prisma.lecture.create({
    data: {
      courseId: course1.id,
      title: 'Running High-Converting Facebook Ads campaigns',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      fileUrl: '/materials/fb-ads-playbook.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
  });

  const lecture3 = await prisma.lecture.create({
    data: {
      courseId: course1.id,
      title: 'Google Tag Manager and Analytics Setup',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      fileUrl: '/materials/gtm-analytics.pdf',
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    },
  });

  const lecture4 = await prisma.lecture.create({
    data: {
      courseId: course2.id,
      title: 'Finding Your Brand Identity & Content Pillar Design',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      fileUrl: '/materials/branding-guidelines.pdf',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    },
  });

  console.log('Seeding enrollments...');
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.id, courseId: course1.id, status: 'ACTIVE' },
      { studentId: student2.id, courseId: course1.id, status: 'ACTIVE' },
      { studentId: student2.id, courseId: course2.id, status: 'ACTIVE' },
      { studentId: student3.id, courseId: course2.id, status: 'ACTIVE' },
    ],
  });

  console.log('Seeding student attendance logs...');
  await prisma.attendance.createMany({
    data: [
      { studentId: student1.id, lectureId: lecture1.id, status: 'PRESENT', date: lecture1.date },
      { studentId: student2.id, lectureId: lecture1.id, status: 'LATE', date: lecture1.date },
      { studentId: student1.id, lectureId: lecture2.id, status: 'PRESENT', date: lecture2.date },
      { studentId: student2.id, lectureId: lecture2.id, status: 'ABSENT', date: lecture2.date },
      { studentId: student2.id, lectureId: lecture4.id, status: 'PRESENT', date: lecture4.date },
      { studentId: student3.id, lectureId: lecture4.id, status: 'PRESENT', date: lecture4.date },
    ],
  });

  console.log('Seeding payment logs...');
  await prisma.payment.createMany({
    data: [
      { studentId: student1.id, amount: 1250, method: 'Vodafone Cash', status: 'PAID', paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
      { studentId: student1.id, amount: 1250, method: 'Instapay', status: 'PENDING', paidAt: null },
      { studentId: student2.id, amount: 2500, method: 'Credit Card', status: 'PAID', paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
      { studentId: student2.id, amount: 1800, method: 'Instapay', status: 'PAID', paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
      { studentId: student3.id, amount: 1800, method: 'Cash', status: 'OVERDUE', paidAt: null },
    ],
  });

  console.log('Seeding operational tasks...');
  await prisma.task.createMany({
    data: [
      { title: 'Call Sara Refaat (Lead)', description: 'Follow-up regarding Social Media Academy prices.', assignedTo: salesAgent.id, status: 'TODO', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1) },
      { title: 'Upload Course Materials for SEO Lecture', description: 'Attach checklist PDFs to lecture 1 page.', assignedTo: instructor.id, status: 'COMPLETED', deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
      { title: 'Reconcile cash accounts', description: 'Double check Vodafone Cash and Instapay balances with payments list.', assignedTo: accountant.id, status: 'IN_PROGRESS', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) },
      { title: 'Review campaign stats', description: 'Evaluate Facebook ads lead conversion cost.', assignedTo: admin.id, status: 'TODO', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4) },
    ],
  });

  console.log('Seeding activity logs...');
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'AUTH_LOGIN', details: 'Administrator logged in.' },
      { userId: salesAgent.id, action: 'CREATE_LEAD', details: 'Lead Amr Khaled logged in system.' },
      { userId: accountant.id, action: 'CREATE_PAYMENT', details: 'Logged $1250 Instapay receipt for Muhammed Mostafa.' },
      { userId: instructor.id, action: 'CREATE_LECTURE', details: 'Added "Introduction to SEO" lecture.' },
    ],
  });

  console.log('Seeding default user permissions...');
  const DEFAULT_PERMISSIONS = {
    ADMIN: [
      'leads:read', 'leads:write',
      'students:read', 'students:write',
      'courses:read', 'courses:write',
      'payments:read', 'payments:write',
      'attendance:read', 'attendance:write',
      'tasks:read', 'tasks:write',
      'reports:read', 'reports:write',
      'users:read', 'users:write',
      'settings:read', 'settings:write'
    ],
    SALES: [
      'leads:read', 'leads:write',
      'students:read',
      'courses:read',
      'tasks:read', 'tasks:write'
    ],
    INSTRUCTOR: [
      'students:read',
      'courses:read', 'courses:write',
      'attendance:read', 'attendance:write',
      'tasks:read', 'tasks:write'
    ],
    ACCOUNTANT: [
      'payments:read', 'payments:write',
      'reports:read',
      'tasks:read', 'tasks:write'
    ],
    STUDENT: [
      'courses:read',
      'payments:read',
      'attendance:read'
    ]
  };

  const dbUsers = await prisma.user.findMany();
  for (const u of dbUsers) {
    const perms = DEFAULT_PERMISSIONS[u.role] || [];
    if (perms.length > 0) {
      await prisma.userPermission.createMany({
        data: perms.map(p => ({
          userId: u.id,
          permission: p
        }))
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
