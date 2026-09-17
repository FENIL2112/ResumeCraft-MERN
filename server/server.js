import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let isDbConnected = false;

// Schemas
const resumeSchema = new mongoose.Schema({
  title: { type: String, default: 'My Resume' },
  template: { type: String, default: 'Modern' },
  userEmail: { type: String, default: 'you@example.com' },
  userName: { type: String, default: 'Your Name' },
  personal: {
    name: String,
    role: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String
  },
  summary: String,
  education: [{ degree: String, college: String, year: String }],
  experience: [{ company: String, role: String, years: String, description: String }],
  skills: [String],
  projects: [{ name: String, description: String, technologies: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  resumesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);
const User = mongoose.model('User', userSchema);

// In-Memory Data Store (Default Admin: admin@resume.com / Admin@123)
let memUsers = [
  {
    _id: 'u_admin',
    name: 'System Administrator',
    email: 'admin@resume.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    resumesCount: 3,
    createdAt: new Date('2026-01-01')
  }
];

let memResumes = [
  {
    _id: 'r1',
    title: 'Full Stack Developer Resume',
    template: 'Modern',
    userEmail: 'admin@resume.com',
    userName: 'System Administrator',
    personal: { name: 'John Doe', role: 'Full Stack Developer', email: 'john@example.com', phone: '+91 98765 43210', location: 'Surat, Gujarat', linkedin: 'linkedin.com/in/johndoe', github: 'github.com/johndoe' },
    summary: 'Experienced developer with expertise in React.js, Node.js and MongoDB applications.',
    education: [{ degree: 'BCA', college: 'C.B. Patel College', year: '2026' }],
    experience: [{ company: 'Tech Corp', role: 'Full Stack Intern', years: '2025–2026', description: 'Built REST APIs and React frontends.' }],
    skills: ['React.js', 'Node.js', 'MongoDB', 'JavaScript', 'CSS3'],
    projects: [{ name: 'ResumeCraft', description: 'Professional resume builder using MERN stack.', technologies: 'React, Node.js, MongoDB' }],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date()
  }
];

let memTemplates = [
  { id: 't1', name: 'Modern', style: 'Two-tone layout with vibrant accent', active: true, usageCount: 142 },
  { id: 't2', name: 'Classic', style: 'Traditional elegant serif layout', active: true, usageCount: 98 },
  { id: 't3', name: 'Minimal', style: 'Ultra clean typography and spacious flow', active: true, usageCount: 115 },
  { id: 't4', name: 'Executive', style: 'Corporate high-impact timeline format', active: true, usageCount: 76 },
  { id: 't5', name: 'Creative', style: 'Vibrant sidebar and pill badges', active: true, usageCount: 89 },
  { id: 't6', name: 'Developer', style: 'Tech-stack focused with compact code accents', active: true, usageCount: 134 }
];

let memLogs = [
  { id: 1, action: 'System Initialized', user: 'System', time: 'Just now', type: 'system' }
];

function addLog(action, user, type = 'system') {
  memLogs.unshift({
    id: Date.now(),
    action,
    user,
    time: 'Just now',
    type
  });
  if (memLogs.length > 50) memLogs.pop();
}

// Health check
app.get('/api/health', (req, res) => res.json({
  ok: true,
  message: 'ResumeCraft API is running',
  database: isDbConnected ? 'MongoDB Connected' : 'In-Memory / Local Sync Active',
  uptime: Math.round(process.uptime()) + ' seconds'
}));

// ================= AUTH APIS ================= //

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if Admin credentials
    if (cleanEmail === 'admin@resume.com') {
      if (password === 'Admin@123') {
        addLog('Admin Login', 'System Administrator (admin@resume.com)', 'admin');
        return res.json({
          user: {
            _id: 'u_admin',
            name: 'System Administrator',
            email: 'admin@resume.com',
            role: 'admin',
            status: 'active'
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid password for Admin account.' });
      }
    }

    // 2. Check regular registered users
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: cleanEmail });
    }

    if (!user) {
      user = memUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found with this email. Please register first.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an Administrator.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    addLog('User Login', `${user.name} (${user.email})`, 'auth');
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        status: user.status
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@resume.com') {
      return res.status(400).json({ message: 'This email is reserved for system administration. Please login directly.' });
    }

    // Check if user already registered
    let existing = null;
    if (isDbConnected) {
      existing = await User.findOne({ email: cleanEmail });
    }
    if (!existing) {
      existing = memUsers.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    const newUser = {
      _id: 'u_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: 'user',
      status: 'active',
      resumesCount: 0,
      createdAt: new Date()
    };

    if (isDbConnected) {
      try {
        await User.create(newUser);
      } catch (err) {}
    }

    memUsers.unshift(newUser);
    addLog('New User Registered', `${newUser.name} (${newUser.email})`, 'user');

    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: 'user',
        status: 'active'
      },
      message: 'Account registered successfully!'
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ================= RESUME APIS ================= //

app.get('/api/resumes', async (req, res) => {
  try {
    if (isDbConnected) {
      const resumes = await Resume.find().sort({ updatedAt: -1 });
      return res.json(resumes.length ? resumes : memResumes);
    }
    res.json(memResumes);
  } catch (e) {
    res.json(memResumes);
  }
});

app.post('/api/resumes', async (req, res) => {
  try {
    if (isDbConnected) {
      const r = await Resume.create(req.body);
      addLog('Resume Created', `${r.personal?.name || 'User'} (${r.title})`, 'resume');
      return res.status(201).json(r);
    }
    const newResume = { _id: 'r_' + Date.now(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
    memResumes.unshift(newResume);
    addLog('Resume Created', `${newResume.personal?.name || 'User'} (${newResume.title})`, 'resume');
    res.status(201).json(newResume);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/resumes/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      const r = await Resume.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
      return res.json(r);
    }
    const idx = memResumes.findIndex(x => x._id === req.params.id);
    if (idx !== -1) {
      memResumes[idx] = { ...memResumes[idx], ...req.body, updatedAt: new Date() };
      return res.json(memResumes[idx]);
    }
    res.status(404).json({ message: 'Resume not found' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/resumes/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      await Resume.findByIdAndDelete(req.params.id);
    }
    memResumes = memResumes.filter(x => x._id !== req.params.id);
    addLog('Resume Deleted', `Resume ID: ${req.params.id}`, 'resume');
    res.json({ message: 'Resume deleted successfully' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ================= ADMIN APIS ================= //

app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = isDbConnected ? ((await User.countDocuments()) || memUsers.length) : memUsers.length;
    const totalResumes = isDbConnected ? ((await Resume.countDocuments()) || memResumes.length) : memResumes.length;
    const activeTemplates = memTemplates.filter(t => t.active).length;
    const totalTemplates = memTemplates.length;

    res.json({
      totalUsers,
      totalResumes,
      totalTemplates,
      activeTemplates,
      dbStatus: isDbConnected ? 'MongoDB Online' : 'Active (Local Sync)',
      serverUptime: Math.round(process.uptime()) + 's',
      totalDownloads: 120,
      activeAdmins: 1
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (isDbConnected) {
      const users = await User.find().sort({ createdAt: -1 });
      if (users.length) return res.json(users);
    }
    res.json(memUsers);
  } catch (e) {
    res.json(memUsers);
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, password = 'User@123', role = 'user', status = 'active' } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const newUser = {
      _id: 'u_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role,
      status,
      resumesCount: 0,
      createdAt: new Date()
    };

    if (isDbConnected) {
      try {
        const saved = await User.create(newUser);
        addLog('User Created', `${saved.name} (${saved.email}) - ${saved.role}`, 'user');
        return res.status(201).json(saved);
      } catch (err) {}
    }

    memUsers.unshift(newUser);
    addLog('User Created', `${newUser.name} (${newUser.email}) - ${newUser.role}`, 'user');
    res.status(201).json(newUser);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) {
        addLog('User Updated', `${updated.name} (Role: ${updated.role}, Status: ${updated.status})`, 'admin');
        return res.json(updated);
      }
    }

    const idx = memUsers.findIndex(u => u._id === req.params.id);
    if (idx !== -1) {
      memUsers[idx] = { ...memUsers[idx], ...req.body };
      addLog('User Updated', `${memUsers[idx].name} (Role: ${memUsers[idx].role}, Status: ${memUsers[idx].status})`, 'admin');
      return res.json(memUsers[idx]);
    }

    res.status(404).json({ message: 'User not found' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    if (isDbConnected) {
      await User.findByIdAndDelete(req.params.id);
    }
    const target = memUsers.find(u => u._id === req.params.id);
    memUsers = memUsers.filter(u => u._id !== req.params.id);
    addLog('User Deleted', target ? `${target.name} (${target.email})` : `User ID ${req.params.id}`, 'admin');
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/admin/templates', (req, res) => {
  res.json(memTemplates);
});

app.put('/api/admin/templates/:id', (req, res) => {
  const t = memTemplates.find(x => x.id === req.params.id || x.name.toLowerCase() === req.params.id.toLowerCase());
  if (t) {
    t.active = req.body.active !== undefined ? req.body.active : !t.active;
    addLog('Template Status Changed', `${t.name} is now ${t.active ? 'Active' : 'Disabled'}`, 'system');
    return res.json(t);
  }
  res.status(404).json({ message: 'Template not found' });
});

app.get('/api/admin/logs', (req, res) => {
  res.json(memLogs);
});

app.delete('/api/admin/logs', (req, res) => {
  memLogs = [];
  addLog('Logs Cleared', 'Admin cleared system audit logs', 'admin');
  res.json({ message: 'Logs cleared' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resumecraft')
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch(err => {
    isDbConnected = false;
    console.warn('MongoDB connection failed:', err.message);
    console.log('Running server in demo/in-memory mode for smooth development and presentation.');
    app.listen(PORT, () => console.log(`API running without DB on http://localhost:${PORT}`));
  });
