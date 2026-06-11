const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 8000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// ============================================
// Mock Data
// ============================================
const now = new Date().toISOString();
const day = 86400000;

const roles = [
  { id: 'r1', name: 'supervisor', label_ar: 'المشرف العام', label_en: 'General Supervisor', level: 1 },
  { id: 'r2', name: 'general_manager', label_ar: 'مدير عام', label_en: 'General Manager', level: 2 },
  { id: 'r3', name: 'department_manager', label_ar: 'مدير دائرة', label_en: 'Department Manager', level: 3 },
  { id: 'r4', name: 'employee', label_ar: 'موظف', label_en: 'Employee', level: 4 },
];

const offices = [
  { id: 'off1', name_ar: 'مكتب رام الله', name_en: 'Ramallah Office', type: 'main', location: 'رام الله - الضفة الغربية', is_active: true },
  { id: 'off2', name_ar: 'مكتب غزة', name_en: 'Gaza Office', type: 'branch', location: 'غزة - قطاع غزة', is_active: true },
];

const departments = [
  { id: 'dep1', office_id: 'off1', name_ar: 'دائرة الأخبار', name_en: 'News Department', code: 'NEWS' },
  { id: 'dep2', office_id: 'off1', name_ar: 'دائرة البرامج', name_en: 'Programs Department', code: 'PROG' },
  { id: 'dep3', office_id: 'off1', name_ar: 'دائرة الهندسة', name_en: 'Engineering Department', code: 'ENG' },
  { id: 'dep4', office_id: 'off1', name_ar: 'دائرة الشؤون الإدارية', name_en: 'Administrative Affairs', code: 'ADM' },
  { id: 'dep5', office_id: 'off1', name_ar: 'دائرة الشؤون المالية', name_en: 'Financial Affairs', code: 'FIN' },
  { id: 'dep6', office_id: 'off2', name_ar: 'دائرة الأخبار', name_en: 'News Department', code: 'NEWS' },
  { id: 'dep7', office_id: 'off2', name_ar: 'دائرة البرامج', name_en: 'Programs Department', code: 'PROG' },
  { id: 'dep8', office_id: 'off2', name_ar: 'دائرة الهندسة', name_en: 'Engineering Department', code: 'ENG' },
  { id: 'dep9', office_id: 'off2', name_ar: 'دائرة الشؤون الإدارية', name_en: 'Administrative Affairs', code: 'ADM' },
  { id: 'dep10', office_id: 'off2', name_ar: 'دائرة الشؤون المالية', name_en: 'Financial Affairs', code: 'FIN' },
];

const users = [
  { id: 'u1', employee_number: 'PTV-0001', full_name_ar: 'المشرف العام', email: 'supervisor@palestinetv.ps', phone: '+970-59X-XXX-XXX', office_id: 'off1', department_id: 'dep1', role_id: 'r1', manager_id: null, job_title_ar: 'المشرف العام على تلفزيون فلسطين', avatar: null, status: 'active', locale: 'ar', last_login_at: now, office: offices[0], department: departments[0], role: roles[0] },
  { id: 'u2', employee_number: 'PTV-0002', full_name_ar: 'مدير عام رام الله', email: 'gm.ramallah@palestinetv.ps', phone: '+970-59X-XXX-XXX', office_id: 'off1', department_id: 'dep1', role_id: 'r2', manager_id: 'u1', job_title_ar: 'المدير العام لمكتب رام الله', avatar: null, status: 'active', locale: 'ar', last_login_at: now, office: offices[0], department: departments[0], role: roles[1], manager: { id: 'u1', full_name_ar: 'المشرف العام', job_title_ar: 'المشرف العام', avatar: null } },
  { id: 'u3', employee_number: 'PTV-0003', full_name_ar: 'مدير عام غزة', email: 'gm.gaza@palestinetv.ps', phone: '+970-59X-XXX-XXX', office_id: 'off2', department_id: 'dep6', role_id: 'r2', manager_id: 'u1', job_title_ar: 'المدير العام لمكتب غزة', avatar: null, status: 'active', locale: 'ar', last_login_at: now, office: offices[1], department: departments[5], role: roles[1], manager: { id: 'u1', full_name_ar: 'المشرف العام', job_title_ar: 'المشرف العام', avatar: null } },
  // Ramallah Department Managers
  { id: 'u4', employee_number: 'PTV-R-0001', full_name_ar: 'مدير دائرة الأخبار - رام الله', email: 'news.r@palestinetv.ps', office_id: 'off1', department_id: 'dep1', role_id: 'r3', manager_id: 'u2', job_title_ar: 'مدير دائرة الأخبار', avatar: null, status: 'active', locale: 'ar', last_login_at: now, office: offices[0], department: departments[0], role: roles[2], manager: { id: 'u2', full_name_ar: 'مدير عام رام الله', job_title_ar: 'المدير العام', avatar: null } },
  { id: 'u5', employee_number: 'PTV-R-0002', full_name_ar: 'مدير دائرة البرامج - رام الله', email: 'prog.r@palestinetv.ps', office_id: 'off1', department_id: 'dep2', role_id: 'r3', manager_id: 'u2', job_title_ar: 'مدير دائرة البرامج', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[1], role: roles[2], manager: { id: 'u2', full_name_ar: 'مدير عام رام الله', job_title_ar: 'المدير العام', avatar: null } },
  { id: 'u6', employee_number: 'PTV-R-0003', full_name_ar: 'مدير دائرة الهندسة - رام الله', email: 'eng.r@palestinetv.ps', office_id: 'off1', department_id: 'dep3', role_id: 'r3', manager_id: 'u2', job_title_ar: 'مدير دائرة الهندسة', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[2], role: roles[2], manager: { id: 'u2', full_name_ar: 'مدير عام رام الله', job_title_ar: 'المدير العام', avatar: null } },
  { id: 'u7', employee_number: 'PTV-R-0004', full_name_ar: 'مدير الشؤون الإدارية - رام الله', email: 'adm.r@palestinetv.ps', office_id: 'off1', department_id: 'dep4', role_id: 'r3', manager_id: 'u2', job_title_ar: 'مدير دائرة الشؤون الإدارية', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[3], role: roles[2], manager: { id: 'u2', full_name_ar: 'مدير عام رام الله', job_title_ar: 'المدير العام', avatar: null } },
  { id: 'u8', employee_number: 'PTV-R-0005', full_name_ar: 'مدير الشؤون المالية - رام الله', email: 'fin.r@palestinetv.ps', office_id: 'off1', department_id: 'dep5', role_id: 'r3', manager_id: 'u2', job_title_ar: 'مدير دائرة الشؤون المالية', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[4], role: roles[2], manager: { id: 'u2', full_name_ar: 'مدير عام رام الله', job_title_ar: 'المدير العام', avatar: null } },
  // Gaza Department Managers
  { id: 'u9', employee_number: 'PTV-G-0001', full_name_ar: 'مدير دائرة الأخبار - غزة', email: 'news.g@palestinetv.ps', office_id: 'off2', department_id: 'dep6', role_id: 'r3', manager_id: 'u3', job_title_ar: 'مدير دائرة الأخبار', avatar: null, status: 'active', locale: 'ar', office: offices[1], department: departments[5], role: roles[2], manager: { id: 'u3', full_name_ar: 'مدير عام غزة', job_title_ar: 'المدير العام', avatar: null } },
  { id: 'u10', employee_number: 'PTV-G-0002', full_name_ar: 'مدير دائرة البرامج - غزة', email: 'prog.g@palestinetv.ps', office_id: 'off2', department_id: 'dep7', role_id: 'r3', manager_id: 'u3', job_title_ar: 'مدير دائرة البرامج', avatar: null, status: 'active', locale: 'ar', office: offices[1], department: departments[6], role: roles[2], manager: { id: 'u3', full_name_ar: 'مدير عام غزة', job_title_ar: 'المدير العام', avatar: null } },
  // Employees
  { id: 'u11', employee_number: 'PTV-R-0010', full_name_ar: 'أحمد خالد', email: 'ahmed@palestinetv.ps', office_id: 'off1', department_id: 'dep1', role_id: 'r4', manager_id: 'u4', job_title_ar: 'محرر أخبار', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[0], role: roles[3], manager: { id: 'u4', full_name_ar: 'مدير دائرة الأخبار - رام الله', job_title_ar: 'مدير دائرة', avatar: null } },
  { id: 'u12', employee_number: 'PTV-R-0011', full_name_ar: 'سارة محمود', email: 'sara@palestinetv.ps', office_id: 'off1', department_id: 'dep1', role_id: 'r4', manager_id: 'u4', job_title_ar: 'مراسلة', avatar: null, status: 'active', locale: 'ar', office: offices[0], department: departments[0], role: roles[3], manager: { id: 'u4', full_name_ar: 'مدير دائرة الأخبار - رام الله', job_title_ar: 'مدير دائرة', avatar: null } },
  { id: 'u13', employee_number: 'PTV-G-0010', full_name_ar: 'محمد عمر', email: 'mohammed@palestinetv.ps', office_id: 'off2', department_id: 'dep6', role_id: 'r4', manager_id: 'u9', job_title_ar: 'محرر أخبار', avatar: null, status: 'active', locale: 'ar', office: offices[1], department: departments[5], role: roles[3], manager: { id: 'u9', full_name_ar: 'مدير دائرة الأخبار - غزة', job_title_ar: 'مدير دائرة', avatar: null } },
];

const docStatuses = ['draft', 'sent', 'received', 'in_progress', 'completed', 'archived', 'rejected'];
const priorities = ['normal', 'important', 'urgent', 'very_urgent'];

let documents = [];
for (let i = 1; i <= 25; i++) {
  const senderIdx = (i % 12) + 1;
  const receiverIdx = senderIdx <= 6 ? senderIdx + 6 : senderIdx - 6;
  const sender = users.find(u => u.id === `u${senderIdx}`) || users[0];
  const receiver = users.find(u => u.id === `u${receiverIdx}`) || users[1];
  const status = docStatuses[i % docStatuses.length];
  const priority = priorities[i % priorities.length];
  const daysAgo = i * 2;
  documents.push({
    id: `doc${i}`,
    document_number: `PTV-2026-${String(i).padStart(4, '0')}`,
    sender_id: sender.id,
    receiver_id: receiver.id,
    office_id: sender.office_id,
    department_id: sender.department_id,
    title: `كتاب رسمي رقم ${i}: ${['تقرير أداء الربع السنوي', 'مقترح تطوير البرامج', 'طلب صيانة أجهزة', 'تقرير مالي شهري', 'خطة تغطية إعلامية', 'طلب تدريب', 'تقرير إنجاز', 'مذكرة تفاهم', 'خطة تشغيلية', 'طلب موازنة'][i % 10]}`,
    body: `نص الكتاب الرسمي رقم ${i}.\n\nالسلام عليكم ورحمة الله وبركاته،\n\nنرجو التفضل بالاطلاع على ${['تقرير أداء الربع السنوي', 'مقترح تطوير البرامج', 'طلب صيانة الأجهزة'][i % 3]} المرفق.\n\nوتفضلوا بقبول فائق الاحترام،`,
    priority,
    status,
    rejection_reason: status === 'rejected' ? 'يرجى إعادة صياغة الطلب وفق النموذج المعتمد' : null,
    sent_at: status !== 'draft' ? new Date(Date.now() - daysAgo * day).toISOString() : null,
    received_at: ['received', 'in_progress', 'completed', 'archived'].includes(status) ? new Date(Date.now() - (daysAgo - 1) * day).toISOString() : null,
    completed_at: ['completed', 'archived'].includes(status) ? new Date(Date.now() - (daysAgo - 2) * day).toISOString() : null,
    created_at: new Date(Date.now() - daysAgo * day).toISOString(),
    sender: { id: sender.id, full_name_ar: sender.full_name_ar, avatar: null },
    receiver: { id: receiver.id, full_name_ar: receiver.full_name_ar, avatar: null },
    attachments: [],
    trails: [
      { id: `trail${i}-1`, document_id: `doc${i}`, user_id: sender.id, action: 'created', notes: 'تم إنشاء الكتاب', user: { id: sender.id, full_name_ar: sender.full_name_ar, avatar: null }, created_at: new Date(Date.now() - daysAgo * day).toISOString() },
      ...(status !== 'draft' ? [{ id: `trail${i}-2`, document_id: `doc${i}`, user_id: sender.id, action: 'sent', notes: 'تم إرسال الكتاب', user: { id: sender.id, full_name_ar: sender.full_name_ar, avatar: null }, created_at: new Date(Date.now() - (daysAgo - 0.5) * day).toISOString() }] : []),
      ...(['received', 'in_progress', 'completed', 'archived'].includes(status) ? [{ id: `trail${i}-3`, document_id: `doc${i}`, user_id: receiver.id, action: 'received', notes: 'تم استلام الكتاب', user: { id: receiver.id, full_name_ar: receiver.full_name_ar, avatar: null }, created_at: new Date(Date.now() - (daysAgo - 1) * day).toISOString() }] : []),
      ...(status === 'completed' ? [{ id: `trail${i}-4`, document_id: `doc${i}`, user_id: receiver.id, action: 'approved', notes: 'تم اعتماد الكتاب', user: { id: receiver.id, full_name_ar: receiver.full_name_ar, avatar: null }, created_at: new Date(Date.now() - (daysAgo - 1.5) * day).toISOString() }] : []),
      ...(status === 'rejected' ? [{ id: `trail${i}-4`, document_id: `doc${i}`, user_id: receiver.id, action: 'rejected', notes: 'تم رفض الكتاب - يرجى إعادة صياغة الطلب', user: { id: receiver.id, full_name_ar: receiver.full_name_ar, avatar: null }, created_at: new Date(Date.now() - (daysAgo - 1.5) * day).toISOString() }] : []),
    ],
  });
}

const chatRooms = [
  { id: 'chat1', type: 'department', name_ar: 'دردشة دائرة الأخبار - رام الله', office_id: 'off1', department_id: 'dep1', is_active: true, users: [users[0], users[3], users[10], users[11]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 42 },
  { id: 'chat2', type: 'department', name_ar: 'دردشة دائرة البرامج - رام الله', office_id: 'off1', department_id: 'dep2', is_active: true, users: [users[0], users[4]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 18 },
  { id: 'chat3', type: 'department', name_ar: 'دردشة دائرة الأخبار - غزة', office_id: 'off2', department_id: 'dep6', is_active: true, users: [users[0], users[8], users[12]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 27 },
  { id: 'chat4', type: 'office', name_ar: 'دردشة مكتب رام الله', office_id: 'off1', department_id: null, is_active: true, users: [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[10], users[11]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 156 },
  { id: 'chat5', type: 'office', name_ar: 'دردشة مكتب غزة', office_id: 'off2', department_id: null, is_active: true, users: [users[0], users[2], users[8], users[9], users[12]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 89 },
  { id: 'chat6', type: 'top_management', name_ar: 'دردشة الإدارة العليا', office_id: null, department_id: null, is_active: true, users: [users[0], users[1], users[2]].map(u => ({ id: u.id, full_name_ar: u.full_name_ar, avatar: null })), messages_count: 34 },
];

const messages = [];
for (let i = 1; i <= 30; i++) {
  const room = chatRooms[i % chatRooms.length];
  const sender = room.users[i % room.users.length];
  messages.push({
    id: `msg${i}`,
    chat_room_id: room.id,
    sender_id: sender.id,
    body: `هذه رسالة تجريبية رقم ${i} في ${room.name_ar}`,
    type: 'text',
    file_path: null,
    file_name: null,
    file_type: null,
    file_size: null,
    sender,
    reads: [],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
  });
}

// ============================================
// Auth Middleware Simulation
// ============================================
let currentUser = null;

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'غير مصرح بالدخول' });
  }
  // Find user from token (simplified)
  currentUser = users[0]; // Default to supervisor for demo
  req.user = currentUser;
  next();
}

function ok(data, message = '') {
  return { success: true, message, data };
}

function paginated(data, total) {
  return {
    success: true,
    message: '',
    data,
    meta: { current_page: 1, last_page: 1, per_page: data.length, total: total || data.length, from: 1, to: data.length }
  };
}

// ============================================
// API Routes
// ============================================

// Auth
app.post('/api/v1/auth/login', (req, res) => {
  const { employee_number, email, password } = req.body;
  const user = users.find(u => u.employee_number === employee_number || u.email === email);
  if (!user || password !== 'P@ssw0rd') {
    return res.status(401).json({ success: false, message: 'رقم وظيفي أو كلمة مرور غير صحيحة' });
  }
  res.json(ok({ user, token: 'mock-jwt-token-ptv-2026', token_type: 'bearer', expires_in: 28800 }));
});

app.post('/api/v1/auth/logout', auth, (req, res) => res.json(ok(null, 'تم تسجيل الخروج')));
app.post('/api/v1/auth/refresh', auth, (req, res) => res.json(ok({ token: 'refreshed-mock-token', token_type: 'bearer', expires_in: 28800 })));

app.get('/api/v1/auth/me', auth, (req, res) => {
  res.json(ok(currentUser));
});

app.put('/api/v1/auth/profile', auth, (req, res) => {
  Object.assign(currentUser, req.body);
  res.json(ok(currentUser, 'تم تحديث الملف الشخصي'));
});

app.put('/api/v1/auth/change-password', auth, (req, res) => {
  res.json(ok(null, 'تم تغيير كلمة المرور بنجاح'));
});

// Reference Data
app.get('/api/v1/offices', auth, (req, res) => res.json(ok(offices)));
app.get('/api/v1/departments', auth, (req, res) => {
  let result = departments;
  if (req.query.office_id) result = result.filter(d => d.office_id === req.query.office_id);
  res.json(ok(result));
});
app.get('/api/v1/roles', auth, (req, res) => res.json(ok(roles)));

// Dashboard
app.get('/api/v1/dashboard', auth, (req, res) => {
  const role = currentUser.role.name;
  const base = {
    recent_documents: documents.slice(0, 10),
  };

  if (role === 'supervisor') {
    res.json(ok({
      ...base,
      total_employees: users.filter(u => u.status === 'active').length,
      total_documents: documents.length,
      pending_documents: documents.filter(d => ['sent', 'received', 'in_progress'].includes(d.status)).length,
      office_stats: offices.map(o => ({
        id: o.id, name: o.name_ar,
        employee_count: users.filter(u => u.office_id === o.id && u.status === 'active').length,
        document_count: documents.filter(d => d.office_id === o.id).length,
      })),
      department_stats: departments.map(d => ({
        id: d.id, name_ar: d.name_ar,
        employee_count: users.filter(u => u.department_id === d.id && u.status === 'active').length,
      })),
    }));
  } else if (role === 'general_manager') {
    res.json(ok({
      ...base,
      employee_count: users.filter(u => u.office_id === currentUser.office_id && u.status === 'active').length,
      incoming_documents: documents.filter(d => d.receiver_id === currentUser.id).length,
      outgoing_documents: documents.filter(d => d.sender_id === currentUser.id).length,
      pending_documents: documents.filter(d => ['sent', 'received'].includes(d.status) && (d.receiver_id === currentUser.id)).length,
      department_performance: departments.filter(d => d.office_id === currentUser.office_id).map(d => ({
        name_ar: d.name_ar,
        document_count: documents.filter(doc => doc.department_id === d.id).length,
      })),
    }));
  } else if (role === 'department_manager') {
    const myDeptUsers = users.filter(u => u.department_id === currentUser.department_id && u.status === 'active');
    res.json(ok({
      ...base,
      employee_count: myDeptUsers.length,
      my_documents: documents.filter(d => d.sender_id === currentUser.id || d.receiver_id === currentUser.id).length,
      department_documents: documents.filter(d => d.department_id === currentUser.department_id).length,
      pending_tasks: documents.filter(d => d.receiver_id === currentUser.id && ['sent', 'received'].includes(d.status)).length,
      employees: myDeptUsers.map(u => ({ id: u.id, full_name_ar: u.full_name_ar, employee_number: u.employee_number, job_title_ar: u.job_title_ar })),
    }));
  } else {
    const myDocs = documents.filter(d => d.sender_id === currentUser.id || d.receiver_id === currentUser.id);
    res.json(ok({
      ...base,
      sent_documents: myDocs.filter(d => d.sender_id === currentUser.id).length,
      received_documents: myDocs.filter(d => d.receiver_id === currentUser.id).length,
      pending_documents: myDocs.filter(d => ['sent', 'in_progress'].includes(d.status)).length,
    }));
  }
});

// Users
app.get('/api/v1/users', auth, (req, res) => {
  let result = [...users];
  const { search, per_page } = req.query;
  if (search) result = result.filter(u => u.full_name_ar.includes(search) || u.employee_number.includes(search));
  res.json(paginated(result, result.length));
});

app.get('/api/v1/users/:id', auth, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  res.json(ok({ ...user, subordinates: users.filter(u => u.manager_id === user.id).map(u => ({ id: u.id, full_name_ar: u.full_name_ar, employee_number: u.employee_number, job_title_ar: u.job_title_ar, avatar: null })) }));
});

app.post('/api/v1/users', auth, (req, res) => {
  const newUser = { id: `u${users.length + 1}`, ...req.body, created_at: now, updated_at: now };
  users.push(newUser);
  res.status(201).json(ok(newUser, 'تم إنشاء المستخدم بنجاح'));
});

app.put('/api/v1/users/:id', auth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  Object.assign(users[idx], req.body);
  res.json(ok(users[idx], 'تم تحديث المستخدم'));
});

app.delete('/api/v1/users/:id', auth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  users[idx].status = 'inactive';
  res.json(ok(null, 'تم حذف المستخدم'));
});

// Documents
app.get('/api/v1/documents', auth, (req, res) => {
  let result = [...documents];
  const { status, title, priority } = req.query;
  if (status && status !== 'all') result = result.filter(d => d.status === status);
  if (title) result = result.filter(d => d.title.includes(title));
  if (priority) result = result.filter(d => d.priority === priority);
  res.json(paginated(result));
});

app.get('/api/v1/documents/:id', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  const fullDoc = {
    ...doc,
    sender: users.find(u => u.id === doc.sender_id),
    receiver: users.find(u => u.id === doc.receiver_id),
    attachments: [],
    trails: doc.trails.map(t => ({
      ...t,
      user: t.user || users.find(u => u.id === t.user_id),
    })),
  };
  res.json(ok(fullDoc));
});

app.post('/api/v1/documents', auth, (req, res) => {
  const newDoc = {
    id: `doc${documents.length + 1}`,
    document_number: `PTV-2026-${String(documents.length + 1).padStart(4, '0')}`,
    sender_id: currentUser.id,
    office_id: currentUser.office_id,
    department_id: currentUser.department_id,
    status: 'draft',
    rejection_reason: null,
    sent_at: null,
    received_at: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
    ...req.body,
    sender: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    receiver: users.find(u => u.id === req.body.receiver_id) || users[1],
    attachments: [],
    trails: [{
      id: `trail-new-1`, document_id: `doc${documents.length + 1}`, user_id: currentUser.id,
      action: 'created', notes: 'تم إنشاء الكتاب',
      user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
      created_at: now,
    }],
  };
  documents.unshift(newDoc);
  res.status(201).json(ok(newDoc, 'تم إنشاء الكتاب بنجاح'));
});

app.post('/api/v1/documents/:id/send', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'sent';
  doc.sent_at = now;
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'sent',
    notes: 'تم إرسال الكتاب',
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم إرسال الكتاب بنجاح'));
});

app.post('/api/v1/documents/:id/receive', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'received';
  doc.received_at = now;
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'received',
    notes: 'تم استلام الكتاب',
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم استلام الكتاب بنجاح'));
});

app.post('/api/v1/documents/:id/approve', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'completed';
  doc.completed_at = now;
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'approved',
    notes: req.body.notes || 'تم اعتماد الكتاب',
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم اعتماد الكتاب بنجاح'));
});

app.post('/api/v1/documents/:id/reject', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'rejected';
  doc.rejection_reason = req.body.reason;
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'rejected',
    notes: `تم رفض الكتاب - السبب: ${req.body.reason}`,
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم رفض الكتاب'));
});

app.post('/api/v1/documents/:id/return', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'draft';
  doc.rejection_reason = req.body.notes;
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'returned',
    notes: `تم إعادة الكتاب مع ملاحظات: ${req.body.notes}`,
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم إعادة الكتاب إلى المرسل'));
});

app.post('/api/v1/documents/:id/archive', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  doc.status = 'archived';
  doc.trails.push({
    id: `trail-${Date.now()}`,
    document_id: doc.id,
    user_id: currentUser.id,
    action: 'archived',
    notes: 'تم أرشفة الكتاب',
    user: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    created_at: now,
  });
  res.json(ok(doc, 'تم أرشفة الكتاب بنجاح'));
});

app.post('/api/v1/documents/:id/attachments', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  res.json(ok(doc, 'تم رفع المرفق بنجاح'));
});

app.get('/api/v1/documents/:id/trail', auth, (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  res.json(ok(doc.trails));
});

// Chat
app.get('/api/v1/chat/rooms', auth, (req, res) => {
  res.json(ok(chatRooms));
});

app.get('/api/v1/chat/rooms/:roomId/messages', auth, (req, res) => {
  const roomMessages = messages.filter(m => m.chat_room_id === req.params.roomId);
  res.json(paginated(roomMessages));
});

app.post('/api/v1/chat/rooms/:roomId/send', auth, (req, res) => {
  const newMsg = {
    id: `msg${messages.length + 1}`,
    chat_room_id: req.params.roomId,
    sender_id: currentUser.id,
    body: req.body.body || 'رسالة جديدة',
    type: 'text',
    file_path: null,
    file_name: null,
    file_type: null,
    file_size: null,
    sender: { id: currentUser.id, full_name_ar: currentUser.full_name_ar, avatar: null },
    reads: [],
    created_at: now,
  };
  messages.unshift(newMsg);
  res.status(201).json(ok(newMsg, 'تم إرسال الرسالة'));
});

app.post('/api/v1/chat/rooms/:roomId/read', auth, (req, res) => res.json(ok(null, 'تم تحديث حالة القراءة')));
app.get('/api/v1/chat/unread-count', auth, (req, res) => res.json(ok({ count: 3 })));

// Notifications
const notifications = [];
for (let i = 1; i <= 8; i++) {
  const daysAgo = i;
  notifications.push({
    id: `notif${i}`,
    user_id: 'u1',
    created_by: i <= 3 ? 'u2' : 'u4',
    title_ar: ['كتاب رسمي جديد', 'تم اعتماد الكتاب', 'تم رفض الكتاب', 'رسالة جديدة'][i % 4],
    body_ar: `هذا إشعار تجريبي رقم ${i} يوضح تفاصيل العملية`,
    type: ['document_received', 'document_approved', 'document_rejected', 'new_message'][i % 4],
    reference_type: 'document',
    reference_id: `doc${i}`,
    data: { document_number: `PTV-2026-${String(i).padStart(4, '0')}` },
    read_at: i > 3 ? new Date(Date.now() - (daysAgo - 0.5) * day).toISOString() : null,
    creator: { id: 'u2', full_name_ar: 'مدير عام رام الله', avatar: null },
    created_at: new Date(Date.now() - daysAgo * day).toISOString(),
  });
}

app.get('/api/v1/notifications', auth, (req, res) => {
  const unreadCount = notifications.filter(n => !n.read_at).length;
  res.json(ok({ notifications, unread_count: unreadCount }));
});

app.post('/api/v1/notifications/:id/read', auth, (req, res) => {
  const n = notifications.find(n => n.id === req.params.id);
  if (n) n.read_at = now;
  res.json(ok(null, 'تم تحديث الإشعار'));
});

app.post('/api/v1/notifications/read-all', auth, (req, res) => {
  notifications.forEach(n => { n.read_at = now; });
  res.json(ok(null, 'تم تحديث جميع الإشعارات'));
});

app.get('/api/v1/notifications/unread-count', auth, (req, res) => {
  const count = notifications.filter(n => !n.read_at).length;
  res.json(ok({ count }));
});

// Search
app.get('/api/v1/search', auth, (req, res) => {
  const q = req.query.q || '';
  const type = req.query.type || 'all';
  const results = {};
  if (type === 'all' || type === 'documents') {
    results.documents = documents.filter(d => d.title.includes(q) || d.document_number.includes(q)).slice(0, 10);
  }
  if (type === 'all' || type === 'users') {
    results.users = users.filter(u => u.full_name_ar.includes(q) || u.employee_number.includes(q)).slice(0, 10);
  }
  res.json(ok(results));
});

app.post('/api/v1/search/advanced', auth, (req, res) => {
  res.json(ok({ documents: documents.slice(0, 10), users: users.slice(0, 10) }));
});

// Logs
app.get('/api/v1/logs', auth, (req, res) => {
  const logs = [];
  for (let i = 1; i <= 20; i++) {
    logs.push({
      id: `log${i}`,
      user_id: i % 2 === 0 ? 'u1' : 'u2',
      action: ['login', 'create_document', 'send_document', 'approve_document', 'create_user'][i % 5],
      description_ar: ['تسجيل دخول', 'إنشاء كتاب رسمي', 'إرسال كتاب رسمي', 'اعتماد كتاب رسمي', 'إنشاء مستخدم جديد'][i % 5],
      description_en: '',
      entity_type: i % 2 === 0 ? 'document' : 'user',
      entity_id: `doc${i}`,
      old_values: null,
      new_values: null,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0',
      method: ['POST', 'GET'][i % 2],
      route: '/api/v1/documents',
      user: { id: 'u1', full_name_ar: 'المشرف العام', employee_number: 'PTV-0001', avatar: null },
      created_at: new Date(Date.now() - i * day).toISOString(),
    });
  }
  res.json(paginated(logs));
});

app.get('/api/v1/logs/stats', auth, (req, res) => {
  res.json(ok({
    total_logs: 120,
    today_logs: 8,
    login_count: 45,
    document_actions: 52,
    user_actions: 12,
    recent_actions: [],
  }));
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`\n  🎬 تلفزيون فلسطين - Mock API Server`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  📡  Server running on http://localhost:${PORT}`);
  console.log(`  🔐  Login: PTV-0001 / P@ssw0rd`);
  console.log(`  📝  ${documents.length} documents, ${users.length} users, ${chatRooms.length} chat rooms\n`);
});
