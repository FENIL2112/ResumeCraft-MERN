import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  FileText,
  Palette,
  Settings,
  Plus,
  Download,
  Check,
  Menu,
  X,
  ShieldCheck,
  Users,
  Trash2,
  Search,
  Activity,
  Layers,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Server,
  Database,
  Shield,
  Clock,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles,
  Lock,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import './styles.css';

const API_BASE = 'http://localhost:5000/api';

// Completely Blank / Empty Resume
const emptyResume = {
  title: '',
  template: 'Modern',
  userEmail: '',
  userName: '',
  personal: {
    name: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: ''
  },
  summary: '',
  education: [],
  experience: [],
  skills: [],
  projects: []
};

// Registered Users in-memory list
const initialUsers = [
  {
    _id: 'u_admin',
    name: 'System Administrator',
    email: 'admin@resume.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    resumesCount: 3,
    createdAt: '2026-01-01'
  }
];

const initialTemplates = [
  { id: 't1', name: 'Modern', style: 'Two-tone layout with vibrant accent', active: true, usageCount: 142 },
  { id: 't2', name: 'Classic', style: 'Traditional elegant serif layout', active: true, usageCount: 98 },
  { id: 't3', name: 'Minimal', style: 'Ultra clean typography and spacious flow', active: true, usageCount: 115 },
  { id: 't4', name: 'Executive', style: 'Corporate high-impact timeline format', active: true, usageCount: 76 },
  { id: 't5', name: 'Creative', style: 'Vibrant sidebar and pill badges', active: true, usageCount: 89 },
  { id: 't6', name: 'Developer', style: 'Tech-stack focused with compact code accents', active: true, usageCount: 134 }
];

const initialLogs = [
  { id: 1, action: 'System Initialized', user: 'System', time: 'Just now', type: 'system' }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('Landing');
  const [resume, setResume] = useState(emptyResume);
  const [mobile, setMobile] = useState(false);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [pendingAction, setPendingAction] = useState(null);

  // Admin Data State
  const [adminUsers, setAdminUsers] = useState(initialUsers);
  const [adminResumes, setAdminResumes] = useState([
    { _id: 'r1', title: 'Full Stack Developer Resume', template: 'Modern', userName: 'John Doe', userEmail: 'admin@resume.com', createdAt: '2026-02-15' }
  ]);
  const [adminTemplates, setAdminTemplates] = useState(initialTemplates);
  const [adminLogs, setAdminLogs] = useState(initialLogs);

  // Fetch initial data from server if running
  useEffect(() => {
    fetch(`${API_BASE}/admin/users`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setAdminUsers(data); })
      .catch(() => {});

    fetch(`${API_BASE}/resumes`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setAdminResumes(data); })
      .catch(() => {});

    fetch(`${API_BASE}/admin/templates`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setAdminTemplates(data); })
      .catch(() => {});

    fetch(`${API_BASE}/admin/logs`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setAdminLogs(data); })
      .catch(() => {});
  }, []);

  // Handler for protected actions
  const requireAuth = (targetPage = 'My Resumes', extraAction = null) => {
    if (!currentUser) {
      setPendingAction(() => () => {
        setPage(targetPage);
        if (extraAction) extraAction();
      });
      setIsAuthOpen(true);
      return false;
    }
    setPage(targetPage);
    if (extraAction) extraAction();
    return true;
  };

  // Login Handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);

    // Sync admin users state if new user was registered
    if (!adminUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      setAdminUsers(prev => [user, ...prev]);
    }

    if (user.role === 'admin') {
      setPage('Admin Panel');
    } else {
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      } else {
        setPage('Dashboard');
      }
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    setPage('Landing');
    setResume(emptyResume);
  };

  const download = () => window.print();

  // Navigation Items (Admin Panel ONLY for admin, completely hidden from users)
  const getNavItems = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return [
        ['Admin Panel', ShieldCheck],
        ['My Resumes', FileText],
        ['Templates', Palette],
        ['Settings', Settings]
      ];
    }

    return [
      ['Dashboard', LayoutDashboard],
      ['My Resumes', FileText],
      ['Templates', Palette],
      ['Settings', Settings]
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="app">
      {/* Top Header Bar */}
      <header className="top">
        {currentUser && (
          <button className="icon mobile" onClick={() => setMobile(!mobile)}>
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <div className="brand" onClick={() => setPage(currentUser ? (currentUser.role === 'admin' ? 'Admin Panel' : 'Dashboard') : 'Landing')}>
          <span>R</span> ResumeCraft
        </div>

        <div className="toplinks">
          {currentUser ? (
            <>
              <div className={`user-badge-header ${currentUser.role === 'admin' ? 'admin-header-badge' : ''}`}>
                <div className={`avatar ${currentUser.role === 'admin' ? 'admin-avatar' : ''}`}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{currentUser.name}</div>
                  <div style={{ fontSize: '11px', color: currentUser.role === 'admin' ? '#a5b4fc' : '#667085', textTransform: 'capitalize' }}>
                    {currentUser.role === 'admin' ? 'Administrator' : 'User Account'}
                  </div>
                </div>
              </div>

              <button className="logout-btn" onClick={handleLogout} title="Sign out from session">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="outline"
                style={{ fontSize: '13px' }}
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                className="signin-btn"
                onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Sidebar Navigation */}
      {currentUser && (
        <aside className={mobile ? 'side open' : 'side'}>
          <div className="nav-section-title">
            {currentUser.role === 'admin' ? 'Admin Portal' : 'User Workspace'}
          </div>

          {navItems.map(([n, Icon]) => {
            const isActive = page === n;
            const isAdminItem = n === 'Admin Panel';
            return (
              <button
                className={`nav ${isActive ? 'active' : ''} ${isAdminItem ? 'admin-nav' : ''}`}
                onClick={() => {
                  setPage(n);
                  setMobile(false);
                }}
                key={n}
              >
                <Icon size={18} />
                {n}
              </button>
            );
          })}

          <div className="sidebar-user-footer">
            <div className="sidebar-user-info">
              <div className={`avatar ${currentUser.role === 'admin' ? 'admin-avatar' : ''}`}>
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <strong>{currentUser.name}</strong>
                <small>{currentUser.email}</small>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`main ${!currentUser ? 'full-width' : ''}`}>
        {/* VIEW 1: GUEST LANDING PAGE */}
        {!currentUser && page === 'Landing' && (
          <GuestLandingView
            templates={adminTemplates}
            onStart={() => {
              setResume(emptyResume);
              requireAuth('My Resumes');
            }}
            onSelectTemplate={(templateName) => {
              requireAuth('My Resumes', () => setResume({ ...emptyResume, template: templateName }));
            }}
            onLoginClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
          />
        )}

        {/* VIEW 2: LOGGED-IN USER DASHBOARD */}
        {currentUser && page === 'Dashboard' && (
          <DashboardView
            user={currentUser}
            resume={resume}
            setPage={setPage}
            setResume={setResume}
            totalResumes={adminResumes.filter(r => r.userEmail === currentUser.email).length || (resume.personal.name ? 1 : 0)}
            activeTemplates={adminTemplates.filter(t => t.active).length}
          />
        )}

        {/* VIEW 3: RESUME EDITOR (Blank Fields) */}
        {currentUser && page === 'My Resumes' && (
          <Editor resume={resume} setResume={setResume} download={download} />
        )}

        {/* VIEW 4: TEMPLATES GALLERY */}
        {currentUser && page === 'Templates' && (
          <TemplatesView
            templates={adminTemplates}
            setResume={setResume}
            setPage={setPage}
          />
        )}

        {/* VIEW 5: ADMIN PANEL (Strictly accessible ONLY by Admin role) */}
        {currentUser && currentUser.role === 'admin' && page === 'Admin Panel' && (
          <AdminPanel
            users={adminUsers}
            setUsers={setAdminUsers}
            resumes={adminResumes}
            setResumes={setAdminResumes}
            templates={adminTemplates}
            setTemplates={setAdminTemplates}
            logs={adminLogs}
            setLogs={setAdminLogs}
          />
        )}

        {/* VIEW 6: SETTINGS */}
        {currentUser && page === 'Settings' && (
          <SettingsView user={currentUser} />
        )}
      </main>

      {/* AUTHENTICATION MODAL */}
      {isAuthOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          users={adminUsers}
          setUsers={setAdminUsers}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

/* ======================================================== */
/* =============== GUEST LANDING VIEW ===================== */
/* ======================================================== */

function GuestLandingView({ templates, onStart, onSelectTemplate, onLoginClick }) {
  const activeTemplates = templates.filter(t => t.active);

  return (
    <div className="guest-landing">
      <section className="guest-hero">
        <div>
          <p className="eyebrow">PROFESSIONAL MERN RESUME BUILDER</p>
          <h1>Create a winning resume in minutes.</h1>
          <p>
            Build, format, and download job-ready resumes with live preview and modern design templates. 100% free and easy to customize.
          </p>
          <div className="guest-cta-group">
            <button className="primary btn-large" onClick={onStart}>
              <Plus size={18} /> Create Your Resume Now
            </button>
            <button className="outline btn-large" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={onLoginClick}>
              <LogIn size={18} /> Sign In
            </button>
          </div>
        </div>

        <div className="guest-hero-preview">
          <div className="paper small" style={{ width: '100%', minHeight: '260px' }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 4px', color: '#111' }}>Candidate Name</h2>
            <b style={{ color: '#635bff', fontSize: '13px' }}>Professional Title</b>
            <hr />
            <p style={{ fontSize: '11px', color: '#555' }}>
              Your profile summary, education, experience, and key skills will appear here.
            </p>
            <div style={{ marginTop: '12px' }}>
              <span className="pill">Live Preview</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-head">
          <p className="eyebrow">WHY RESUMECRAFT</p>
          <h2>Everything you need for your dream job</h2>
          <p>Designed for students, BCA graduates, and seasoned software developers.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Sparkles size={24} /></div>
            <h3>Real-time Live Preview</h3>
            <p>See changes instantaneously as you type your personal details, education, and work experience.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Layers size={24} /></div>
            <h3>ATS-Friendly Templates</h3>
            <p>Curated layouts specifically formatted to pass recruiter screening and applicant tracking systems.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Download size={24} /></div>
            <h3>One-Click PDF Export</h3>
            <p>Export pixel-perfect PDF documents ready for job applications, LinkedIn, and email attachments.</p>
          </div>
        </div>
      </section>

      <section className="guest-templates-preview">
        <div className="section-head">
          <p className="eyebrow">DESIGN LIBRARY</p>
          <h2>Choose from our featured templates</h2>
          <p>Select any template to launch the builder immediately.</p>
        </div>

        <div className="templates">
          {activeTemplates.slice(0, 3).map(t => (
            <div className="template card" key={t.id || t.name}>
              <div className="paper">
                <h2>Candidate Name</h2>
                <b>{t.name} Layout</b>
                <hr />
                <p>{t.style}</p>
                <p>Profile · Work History · Skills</p>
              </div>
              <div className="template-foot">
                <b>{t.name}</b>
                <button className="primary btn-sm" onClick={() => onSelectTemplate(t.name)}>
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ======================================================== */
/* ============= AUTHENTICATION MODAL ===================== */
/* ======================================================== */

function AuthModal({ mode, setMode, users, setUsers, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const endpoint = mode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = mode === 'login' ? { email: cleanEmail, password } : { name: name.trim(), email: cleanEmail, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onSuccess(data.user);
    } catch (err) {
      // Local fallback in case backend is offline
      if (mode === 'login') {
        if (cleanEmail === 'admin@resume.com') {
          if (password === 'Admin@123') {
            onSuccess({
              _id: 'u_admin',
              name: 'System Administrator',
              email: 'admin@resume.com',
              role: 'admin',
              status: 'active'
            });
            return;
          } else {
            setError('Invalid password for Admin account (Expected: Admin@123)');
            setLoading(false);
            return;
          }
        }

        const found = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!found) {
          setError(err.message || 'Account not found with this email. Please register first.');
          setLoading(false);
          return;
        }

        if (found.password && found.password !== password) {
          setError('Invalid password. Please try again.');
          setLoading(false);
          return;
        }

        onSuccess(found);
      } else {
        // Register Mode fallback
        if (cleanEmail === 'admin@resume.com') {
          setError('This email is reserved for system administration.');
          setLoading(false);
          return;
        }

        const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          setError('An account with this email already exists. Please log in.');
          setLoading(false);
          return;
        }

        const newUser = {
          _id: 'u_' + Date.now(),
          name: name.trim(),
          email: cleanEmail,
          password: password,
          role: 'user',
          status: 'active',
          resumesCount: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };

        if (setUsers) setUsers(prev => [newUser, ...prev]);
        onSuccess(newUser);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={e => e.stopPropagation()}>
        <div className="auth-head">
          <div className="brand" style={{ fontSize: '18px' }}>
            <span>R</span> ResumeCraft
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Full Name
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              placeholder="e.g. you@example.com or admin@resume.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Register Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ======================================================== */
/* ================ USER DASHBOARD VIEW =================== */
/* ======================================================== */

function DashboardView({ user, resume, setPage, setResume, totalResumes, activeTemplates }) {
  const hasContent = Boolean(resume.personal?.name || resume.title || resume.summary);

  return (
    <>
      <div className="hero">
        <div>
          <p className="eyebrow">WELCOME BACK, {user.name.toUpperCase()}</p>
          <h1>Build a resume that gets noticed.</h1>
          <p>Create, customize, and export professional resumes in minutes with MERN stack speed.</p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setResume(emptyResume);
            setPage('My Resumes');
          }}
        >
          <Plus size={18} /> Create New Blank Resume
        </button>
      </div>

      <section className="stats">
        <div className="stat-box">
          <div>
            <span>My Resumes</span>
            <strong>{totalResumes}</strong>
          </div>
          <div className="stat-icon purple"><FileText size={22} /></div>
        </div>

        <div className="stat-box">
          <div>
            <span>Available Templates</span>
            <strong>{activeTemplates}</strong>
          </div>
          <div className="stat-icon blue"><Palette size={22} /></div>
        </div>

        <div className="stat-box">
          <div>
            <span>Account Type</span>
            <strong style={{ fontSize: '20px', textTransform: 'capitalize' }}>{user.role}</strong>
          </div>
          <div className="stat-icon green"><UserCheck size={22} /></div>
        </div>

        <div className="stat-box">
          <div>
            <span>System Status</span>
            <strong style={{ fontSize: '20px', color: '#12b76a' }}>Online</strong>
          </div>
          <div className="stat-icon orange"><Activity size={22} /></div>
        </div>
      </section>

      <section className="card">
        <div className="cardhead">
          <div>
            <h2>Current Resume Project</h2>
            <p>{hasContent ? 'Your actively edited draft' : 'Start building your resume from scratch'}</p>
          </div>
          <button
            className="outline"
            onClick={() => setPage('My Resumes')}
          >
            Open Editor <ArrowRight size={15} />
          </button>
        </div>

        <div className="resume-row">
          <div className="paper small">
            <h3>{resume.personal.name || 'Candidate Name'}</h3>
            <b>{resume.personal.role || 'Job Title'}</b>
            <hr />
            <small>
              {resume.summary ? (resume.summary.length > 80 ? resume.summary.substring(0, 80) + '...' : resume.summary) : 'No summary added yet. Click Open Editor to start typing.'}
            </small>
          </div>
          <div>
            <h3>{resume.title || 'Untitled Resume'}</h3>
            <p>Template: <strong>{resume.template || 'Modern'}</strong> · Ready to edit and customize</p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button className="primary btn-sm" onClick={() => setPage('My Resumes')}>
                <Plus size={14} /> {hasContent ? 'Continue Editing' : 'Start Editing Blank Resume'}
              </button>
              <button className="outline btn-sm" onClick={() => setPage('Templates')}>
                Choose Template
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ======================================================== */
/* ================ RESUME EDITOR VIEW ==================== */
/* ======================================================== */

function Editor({ resume, setResume, download }) {
  const p = resume.personal || {};

  const handlePersonalChange = (k, v) => {
    setResume({ ...resume, personal: { ...p, [k]: v } });
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [...(resume.experience || []), { company: '', role: '', years: '', description: '' }]
    });
  };

  const updateExperience = (idx, field, val) => {
    const updated = [...(resume.experience || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setResume({ ...resume, experience: updated });
  };

  const removeExperience = (idx) => {
    setResume({
      ...resume,
      experience: (resume.experience || []).filter((_, i) => i !== idx)
    });
  };

  const addEducation = () => {
    setResume({
      ...resume,
      education: [...(resume.education || []), { degree: '', college: '', year: '' }]
    });
  };

  const updateEducation = (idx, field, val) => {
    const updated = [...(resume.education || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setResume({ ...resume, education: updated });
  };

  const removeEducation = (idx) => {
    setResume({
      ...resume,
      education: (resume.education || []).filter((_, i) => i !== idx)
    });
  };

  const addProject = () => {
    setResume({
      ...resume,
      projects: [...(resume.projects || []), { name: '', description: '', technologies: '' }]
    });
  };

  const updateProject = (idx, field, val) => {
    const updated = [...(resume.projects || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setResume({ ...resume, projects: updated });
  };

  const removeProject = (idx) => {
    setResume({
      ...resume,
      projects: (resume.projects || []).filter((_, i) => i !== idx)
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setResume({
        ...emptyResume,
        template: resume.template || 'Modern'
      });
    }
  };

  return (
    <div>
      <div className="editorbar">
        <div>
          <p className="eyebrow">RESUME EDITOR</p>
          <h1>{resume.title || 'Create Your Resume'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="outline" onClick={handleClearAll} title="Reset all fields to blank">
            <RotateCcw size={15} /> Clear All
          </button>
          <button className="primary" onClick={download}>
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="editor">
        <section className="form card">
          <label style={{ marginBottom: '14px', display: 'block' }}>
            Resume Document Title
            <input
              value={resume.title || ''}
              onChange={e => setResume({ ...resume, title: e.target.value })}
              placeholder="e.g. My Software Engineer Resume"
            />
          </label>

          <h2>Personal Information</h2>
          <div className="formgrid">
            <label>
              Full Name
              <input
                value={p.name || ''}
                onChange={e => handlePersonalChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Professional Title / Role
              <input
                value={p.role || ''}
                onChange={e => handlePersonalChange('role', e.target.value)}
                placeholder="e.g. Full Stack Developer, BCA Student"
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={p.email || ''}
                onChange={e => handlePersonalChange('email', e.target.value)}
                placeholder="e.g. yourname@example.com"
              />
            </label>

            <label>
              Phone Number
              <input
                value={p.phone || ''}
                onChange={e => handlePersonalChange('phone', e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </label>

            <label>
              Location / City
              <input
                value={p.location || ''}
                onChange={e => handlePersonalChange('location', e.target.value)}
                placeholder="e.g. Surat, Gujarat"
              />
            </label>

            <label>
              LinkedIn Profile
              <input
                value={p.linkedin || ''}
                onChange={e => handlePersonalChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </label>

            <label style={{ gridColumn: 'span 2' }}>
              GitHub / Portfolio URL
              <input
                value={p.github || ''}
                onChange={e => handlePersonalChange('github', e.target.value)}
                placeholder="github.com/username"
              />
            </label>
          </div>

          <h2>Professional Summary</h2>
          <textarea
            value={resume.summary || ''}
            onChange={e => setResume({ ...resume, summary: e.target.value })}
            placeholder="Write a brief overview of your background, experience, career goals..."
          />

          <h2>Skills (comma-separated)</h2>
          <input
            value={(resume.skills || []).join(', ')}
            onChange={e =>
              setResume({
                ...resume,
                skills: e.target.value.split(',').map(x => x.trim()).filter(Boolean)
              })
            }
            placeholder="e.g. React.js, Node.js, MongoDB, JavaScript, Python"
          />

          {/* Dynamic Experience Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
            <h2 style={{ margin: 0 }}>Work Experience</h2>
            <button type="button" className="outline btn-sm" onClick={addExperience}>
              <Plus size={14} /> Add Experience
            </button>
          </div>
          {(resume.experience || []).length === 0 ? (
            <p style={{ color: '#98a2b3', fontSize: '13px', margin: '8px 0 0' }}>
              No experience added yet. Click "+ Add Experience" to insert your job history.
            </p>
          ) : (
            (resume.experience || []).map((exp, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Experience #{idx + 1}</strong>
                  <button type="button" className="btn-danger" onClick={() => removeExperience(idx)}>
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
                <div className="formgrid">
                  <label>
                    Job Role / Title
                    <input
                      value={exp.role || ''}
                      onChange={e => updateExperience(idx, 'role', e.target.value)}
                      placeholder="e.g. Software Engineer Intern"
                    />
                  </label>
                  <label>
                    Company Name
                    <input
                      value={exp.company || ''}
                      onChange={e => updateExperience(idx, 'company', e.target.value)}
                      placeholder="e.g. Tech Corp"
                    />
                  </label>
                </div>
                <label style={{ marginTop: '8px', display: 'block' }}>
                  Duration / Years
                  <input
                    value={exp.years || ''}
                    onChange={e => updateExperience(idx, 'years', e.target.value)}
                    placeholder="e.g. Jan 2025 – Present"
                  />
                </label>
                <label style={{ marginTop: '8px', display: 'block' }}>
                  Key Responsibilities / Description
                  <textarea
                    style={{ minHeight: '60px' }}
                    value={exp.description || ''}
                    onChange={e => updateExperience(idx, 'description', e.target.value)}
                    placeholder="Describe your achievements and daily tasks..."
                  />
                </label>
              </div>
            ))
          )}

          {/* Dynamic Education Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
            <h2 style={{ margin: 0 }}>Education & Qualifications</h2>
            <button type="button" className="outline btn-sm" onClick={addEducation}>
              <Plus size={14} /> Add Education
            </button>
          </div>
          {(resume.education || []).length === 0 ? (
            <p style={{ color: '#98a2b3', fontSize: '13px', margin: '8px 0 0' }}>
              No education records added yet. Click "+ Add Education" to add degree/college.
            </p>
          ) : (
            (resume.education || []).map((edu, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Education #{idx + 1}</strong>
                  <button type="button" className="btn-danger" onClick={() => removeEducation(idx)}>
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
                <div className="formgrid">
                  <label>
                    Degree / Course
                    <input
                      value={edu.degree || ''}
                      onChange={e => updateEducation(idx, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Computer Applications (BCA)"
                    />
                  </label>
                  <label>
                    College / University
                    <input
                      value={edu.college || ''}
                      onChange={e => updateEducation(idx, 'college', e.target.value)}
                      placeholder="e.g. University Name"
                    />
                  </label>
                </div>
                <label style={{ marginTop: '8px', display: 'block' }}>
                  Year / Period
                  <input
                    value={edu.year || ''}
                    onChange={e => updateEducation(idx, 'year', e.target.value)}
                    placeholder="e.g. 2023–2026"
                  />
                </label>
              </div>
            ))
          )}

          {/* Dynamic Projects Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
            <h2 style={{ margin: 0 }}>Projects</h2>
            <button type="button" className="outline btn-sm" onClick={addProject}>
              <Plus size={14} /> Add Project
            </button>
          </div>
          {(resume.projects || []).length === 0 ? (
            <p style={{ color: '#98a2b3', fontSize: '13px', margin: '8px 0 0' }}>
              No projects added yet. Click "+ Add Project" to showcase your work.
            </p>
          ) : (
            (resume.projects || []).map((proj, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Project #{idx + 1}</strong>
                  <button type="button" className="btn-danger" onClick={() => removeProject(idx)}>
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
                <div className="formgrid">
                  <label>
                    Project Name
                    <input
                      value={proj.name || ''}
                      onChange={e => updateProject(idx, 'name', e.target.value)}
                      placeholder="e.g. E-Commerce Website"
                    />
                  </label>
                  <label>
                    Technologies Used
                    <input
                      value={proj.technologies || ''}
                      onChange={e => updateProject(idx, 'technologies', e.target.value)}
                      placeholder="e.g. React, Node.js, MongoDB"
                    />
                  </label>
                </div>
                <label style={{ marginTop: '8px', display: 'block' }}>
                  Project Description
                  <textarea
                    style={{ minHeight: '60px' }}
                    value={proj.description || ''}
                    onChange={e => updateProject(idx, 'description', e.target.value)}
                    placeholder="Brief overview of project features and impact..."
                  />
                </label>
              </div>
            ))
          )}
        </section>

        {/* Live Preview Paper */}
        <section className="preview-wrap">
          <div className="preview-tools">
            <span>Live Preview ({resume.template || 'Modern'} Template)</span>
            <span className="pill">Ready to Export</span>
          </div>

          <article className="paper">
            <h1>{p.name || 'Your Full Name'}</h1>
            <h2>{p.role || 'Your Professional Title'}</h2>
            {(p.email || p.phone || p.location) && (
              <p>
                {p.email} {p.phone && `· ${p.phone}`} {p.location && `· ${p.location}`}
              </p>
            )}
            {(p.linkedin || p.github) && (
              <p style={{ fontSize: '11px', color: '#635bff' }}>
                {p.linkedin} {p.github && `· ${p.github}`}
              </p>
            )}
            <hr />

            {/* Profile Summary */}
            {resume.summary && (
              <>
                <h3>PROFILE SUMMARY</h3>
                <p>{resume.summary}</p>
              </>
            )}

            {/* Experience */}
            {(resume.experience || []).length > 0 && (
              <>
                <h3>EXPERIENCE</h3>
                {resume.experience.map((x, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <b>{x.role || 'Role'} {x.company && `— ${x.company}`}</b>
                    {x.years && <div><small>{x.years}</small></div>}
                    {x.description && <p>{x.description}</p>}
                  </div>
                ))}
              </>
            )}

            {/* Education */}
            {(resume.education || []).length > 0 && (
              <>
                <h3>EDUCATION</h3>
                {resume.education.map((x, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <b>{x.degree || 'Degree'}</b>
                    {(x.college || x.year) && <p>{x.college} {x.year && `· ${x.year}`}</p>}
                  </div>
                ))}
              </>
            )}

            {/* Skills */}
            {(resume.skills || []).length > 0 && (
              <>
                <h3>SKILLS</h3>
                <p>{resume.skills.join(' · ')}</p>
              </>
            )}

            {/* Projects */}
            {(resume.projects || []).length > 0 && (
              <>
                <h3>PROJECTS</h3>
                {resume.projects.map((x, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <b>{x.name || 'Project Name'}</b>
                    {x.description && <p>{x.description}</p>}
                    {x.technologies && <small style={{ color: '#635bff' }}>Technologies: {x.technologies}</small>}
                  </div>
                ))}
              </>
            )}

            {!p.name && !resume.summary && (resume.experience || []).length === 0 && (resume.education || []).length === 0 && (resume.skills || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#98a2b3' }}>
                <p style={{ fontSize: '14px', margin: '0' }}>Fields are currently blank.</p>
                <p style={{ fontSize: '12px', margin: '4px 0 0' }}>Type in the editor on the left to see your live resume take shape.</p>
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}

/* ======================================================== */
/* ================ TEMPLATES VIEW ======================== */
/* ======================================================== */

function TemplatesView({ templates, setResume, setPage }) {
  const activeTemplates = templates.filter(t => t.active);

  return (
    <section>
      <div className="editorbar">
        <div>
          <p className="eyebrow">DESIGN LIBRARY</p>
          <h1>Choose a Template</h1>
          <p style={{ color: '#667085', margin: '4px 0 0', fontSize: '14px' }}>
            All templates are 100% free and customizable.
          </p>
        </div>
      </div>

      <div className="templates">
        {activeTemplates.map(t => (
          <div className="template card" key={t.id || t.name}>
            <div className="paper">
              <h2>Candidate Name</h2>
              <b>{t.name} Layout</b>
              <hr />
              <p>{t.style}</p>
              <p>Education · Experience · Technical Skills</p>
            </div>
            <div className="template-foot">
              <b>{t.name}</b>
              <button
                className="outline"
                onClick={() => {
                  setResume(r => ({ ...r, template: t.name }));
                  setPage('My Resumes');
                }}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================================================== */
/* ================ SETTINGS VIEW ========================= */
/* ======================================================== */

function SettingsView({ user }) {
  return (
    <section className="card">
      <h2>Account Settings</h2>
      <p style={{ marginBottom: '20px' }}>Manage your ResumeCraft profile and application preferences.</p>
      <div className="formgrid">
        <label>
          Display Name
          <input value={user.name} readOnly />
        </label>
        <label>
          Email Address
          <input value={user.email} readOnly />
        </label>
        <label>
          Role / Permission
          <input value={user.role === 'admin' ? 'System Administrator' : 'Standard User'} readOnly />
        </label>
        <label>
          Architecture
          <input value="MERN Stack (MongoDB, Express, React, Node)" readOnly />
        </label>
      </div>
    </section>
  );
}

/* ======================================================== */
/* =================== ADMIN PANEL ======================== */
/* ======================================================== */

function AdminPanel({ users, setUsers, resumes, setResumes, templates, setTemplates, logs, setLogs }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchResume, setSearchResume] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [previewResumeData, setPreviewResumeData] = useState(null);

  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });

  // Add User Handler
  const handleAddUser = e => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return alert('Please enter name and email');

    const created = {
      _id: 'u_' + Date.now(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password || 'User@123',
      role: newUser.role,
      status: newUser.status,
      resumesCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([created, ...users]);
    setLogs([
      { id: Date.now(), action: 'User Created', user: `${created.name} (${created.role})`, time: 'Just now', type: 'user' },
      ...logs
    ]);

    fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(() => {});

    setNewUser({ name: '', email: '', password: '', role: 'user', status: 'active' });
    setShowAddUserModal(false);
  };

  // Toggle User Status
  const handleToggleStatus = id => {
    setUsers(users.map(u => {
      if (u._id === id) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        fetch(`${API_BASE}/admin/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        }).catch(() => {});
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Toggle User Role
  const handleToggleRole = id => {
    setUsers(users.map(u => {
      if (u._id === id) {
        const nextRole = u.role === 'admin' ? 'user' : 'admin';
        fetch(`${API_BASE}/admin/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole })
        }).catch(() => {});
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  // Delete User
  const handleDeleteUser = id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const target = users.find(u => u._id === id);
    setUsers(users.filter(u => u._id !== id));
    setLogs([
      { id: Date.now(), action: 'User Deleted', user: target ? target.name : id, time: 'Just now', type: 'admin' },
      ...logs
    ]);

    fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Delete Resume
  const handleDeleteResume = id => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setResumes(resumes.filter(r => r._id !== id));
    setLogs([
      { id: Date.now(), action: 'Resume Deleted', user: `Resume ID: ${id}`, time: 'Just now', type: 'resume' },
      ...logs
    ]);
    fetch(`${API_BASE}/resumes/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Toggle Template Active Status
  const handleToggleTemplate = id => {
    setTemplates(templates.map(t => {
      if (t.id === id || t.name === id) {
        const updated = { ...t, active: !t.active };
        fetch(`${API_BASE}/admin/templates/${t.id || t.name}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: updated.active })
        }).catch(() => {});
        return updated;
      }
      return t;
    }));
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Resumes
  const filteredResumes = resumes.filter(r => {
    const titleMatch = (r.title || '').toLowerCase().includes(searchResume.toLowerCase());
    const authorMatch = (r.userName || r.userEmail || '').toLowerCase().includes(searchResume.toLowerCase());
    const templateMatch = (r.template || '').toLowerCase().includes(searchResume.toLowerCase());
    return titleMatch || authorMatch || templateMatch;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <span className="admin-badge">Admin Workspace</span>
          <h1><ShieldCheck size={28} /> Control Center & Management</h1>
          <p>Full control over registered users, generated resumes, templates, and system telemetry.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary" onClick={() => setShowAddUserModal(true)}>
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} /> Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Users <span className="tab-count">{users.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'resumes' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumes')}
        >
          <FileText size={16} /> All Resumes <span className="tab-count">{resumes.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Layers size={16} /> Templates <span className="tab-count">{templates.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Clock size={16} /> Audit Logs <span className="tab-count">{logs.length}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="stats">
            <div className="stat-box">
              <div>
                <span>Registered Users</span>
                <strong>{users.length}</strong>
              </div>
              <div className="stat-icon purple"><Users size={22} /></div>
            </div>

            <div className="stat-box">
              <div>
                <span>Total Resumes</span>
                <strong>{resumes.length}</strong>
              </div>
              <div className="stat-icon green"><FileText size={22} /></div>
            </div>

            <div className="stat-box">
              <div>
                <span>Active Templates</span>
                <strong>{templates.filter(t => t.active).length} / {templates.length}</strong>
              </div>
              <div className="stat-icon blue"><Layers size={22} /></div>
            </div>

            <div className="stat-box">
              <div>
                <span>Server & Database</span>
                <strong style={{ fontSize: '18px', color: '#12b76a' }}>MERN Connected</strong>
              </div>
              <div className="stat-icon orange"><Server size={22} /></div>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="card">
              <h2>System Architecture & Status</h2>
              <p>MERN backend endpoints and configuration</p>
              <div className="sys-info-grid">
                <div className="sys-info-item">
                  <span>API Server</span>
                  <strong>Node.js + Express (Port 5000)</strong>
                </div>
                <div className="sys-info-item">
                  <span>Database Layer</span>
                  <strong>MongoDB / Local Sync</strong>
                </div>
                <div className="sys-info-item">
                  <span>Frontend Client</span>
                  <strong>React + Vite + Vanilla CSS</strong>
                </div>
                <div className="sys-info-item">
                  <span>Security & Auth</span>
                  <strong>Role-Based Access Control (Admin / User)</strong>
                </div>
              </div>

              <div style={{ marginTop: '22px' }}>
                <h3>Quick Admin Tasks</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button className="outline btn-sm" onClick={() => setActiveTab('users')}>
                    <Users size={14} /> Manage Users
                  </button>
                  <button className="outline btn-sm" onClick={() => setActiveTab('resumes')}>
                    <FileText size={14} /> View All Resumes
                  </button>
                  <button className="outline btn-sm" onClick={() => setActiveTab('templates')}>
                    <Layers size={14} /> Configure Templates
                  </button>
                  <button className="outline btn-sm" onClick={() => setShowAddUserModal(true)}>
                    <Plus size={14} /> Add User
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="cardhead">
                <div>
                  <h2>Recent Activity Stream</h2>
                  <p>Real-time system events</p>
                </div>
                <button className="outline btn-sm" onClick={() => setActiveTab('logs')}>View All</button>
              </div>

              <div className="audit-list">
                {logs.slice(0, 5).map(log => (
                  <div className="audit-item" key={log.id}>
                    <div className="audit-left">
                      <div className="audit-icon"><Activity size={15} /></div>
                      <div>
                        <div className="audit-action">{log.action}</div>
                        <div className="audit-user">{log.user}</div>
                      </div>
                    </div>
                    <div className="audit-time">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="cardhead">
            <div>
              <h2>User Management</h2>
              <p>Manage all registered accounts, modify roles, and control access permissions.</p>
            </div>
            <button className="primary" onClick={() => setShowAddUserModal(true)}>
              <Plus size={16} /> Add User
            </button>
          </div>

          <div className="admin-toolbar">
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                placeholder="Search user by name or email..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
              />
            </div>

            <div className="toolbar-actions">
              <select
                className="custom-select"
                style={{ width: 'auto', margin: 0 }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Resumes</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                        <div style={{ color: '#667085', fontSize: '12px' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                          {u.role === 'admin' ? <Shield size={12} /> : null}
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-suspended'}`}>
                          <span className="badge-dot"></span>
                          {u.status}
                        </span>
                      </td>
                      <td><strong>{u.resumesCount ?? 1}</strong></td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="outline btn-sm"
                            title="Toggle Admin/User Role"
                            onClick={() => handleToggleRole(u._id)}
                          >
                            {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>
                          <button
                            className="outline btn-sm"
                            title="Toggle Status"
                            onClick={() => handleToggleStatus(u._id)}
                          >
                            {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button
                            className="btn-danger"
                            title="Delete User"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESUME MANAGEMENT */}
      {activeTab === 'resumes' && (
        <div className="card">
          <div className="cardhead">
            <div>
              <h2>All Resumes Management</h2>
              <p>Explore all resumes generated by students and developers on the platform.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                placeholder="Search by resume title, creator or template..."
                value={searchResume}
                onChange={e => setSearchResume(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resume Title</th>
                  <th>Creator / Email</th>
                  <th>Template</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResumes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                      No resumes found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredResumes.map(r => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.title || 'Untitled Resume'}</strong>
                      </td>
                      <td>
                        <div>{r.userName || r.personal?.name || 'User'}</div>
                        <small style={{ color: '#667085' }}>{r.userEmail || r.personal?.email || 'N/A'}</small>
                      </td>
                      <td>
                        <span className="badge badge-admin">{r.template || 'Modern'}</span>
                      </td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="outline btn-sm"
                            onClick={() => setPreviewResumeData(r)}
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteResume(r._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TEMPLATES MANAGEMENT */}
      {activeTab === 'templates' && (
        <div className="card">
          <div className="cardhead">
            <div>
              <h2>Template Manager</h2>
              <p>Enable or disable templates and observe usage telemetry.</p>
            </div>
          </div>

          <div className="admin-grid-3">
            {templates.map(t => (
              <div
                className={`admin-template-card ${!t.active ? 'inactive' : ''}`}
                key={t.id || t.name}
              >
                <div>
                  <div className="template-meta">
                    <h3>{t.name} Template</h3>
                    <span className={`badge ${t.active ? 'badge-active' : 'badge-suspended'}`}>
                      {t.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#667085' }}>{t.style}</p>
                  <div style={{ fontSize: '12px', color: '#475467', marginTop: '10px' }}>
                    Total Creations: <strong>{t.usageCount ?? 45}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf0f7', paddingTop: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Available to Users</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={t.active}
                      onChange={() => handleToggleTemplate(t.id || t.name)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card">
          <div className="cardhead">
            <div>
              <h2>System & Audit Logs</h2>
              <p>Real-time audit log stream of all user actions, resume creations, and administrative updates.</p>
            </div>
            <button
              className="outline btn-sm"
              onClick={() => {
                setLogs([]);
                fetch(`${API_BASE}/admin/logs`, { method: 'DELETE' }).catch(() => {});
              }}
            >
              Clear Logs
            </button>
          </div>

          <div className="audit-list">
            {logs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#667085' }}>
                No recent activity logs.
              </p>
            ) : (
              logs.map(log => (
                <div className="audit-item" key={log.id}>
                  <div className="audit-left">
                    <div className="audit-icon">
                      <Activity size={16} />
                    </div>
                    <div>
                      <div className="audit-action">{log.action}</div>
                      <div className="audit-user">{log.user}</div>
                    </div>
                  </div>
                  <div className="audit-time">{log.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Create New User</h3>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label>
                  Full Name
                  <input
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    placeholder="Password for user"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Account Role
                  <select
                    className="custom-select"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </label>
                <label>
                  Account Status
                  <select
                    className="custom-select"
                    value={newUser.status}
                    onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESUME PREVIEW */}
      {previewResumeData && (
        <div className="modal-overlay" onClick={() => setPreviewResumeData(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Preview: {previewResumeData.title || 'Resume'}</h3>
              <button className="close-btn" onClick={() => setPreviewResumeData(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="paper" style={{ boxShadow: 'none', border: '1px solid #eaedf5', padding: '24px' }}>
              <h2>{previewResumeData.personal?.name || previewResumeData.userName || 'Candidate Name'}</h2>
              <b>{previewResumeData.personal?.role || 'Professional'}</b>
              <p>{previewResumeData.personal?.email || previewResumeData.userEmail}</p>
              <hr />
              <p><strong>Template:</strong> {previewResumeData.template || 'Modern'}</p>
              <p><strong>Summary:</strong> {previewResumeData.summary || 'Candidate profile created via ResumeCraft MERN app.'}</p>
            </div>

            <div className="modal-footer">
              <button className="outline" onClick={() => setPreviewResumeData(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
