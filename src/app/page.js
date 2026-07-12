'use client';

import React, { useState, useEffect, useRef } from 'react';

// Custom inline SVG Icons for maximum reliability
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
  ),
  Environmental: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /><circle cx="12" cy="12" r="10" /></svg>
  ),
  Social: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Governance: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Gamification: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  )
};

// Canvas Animated Living Orb Particles
function LivingOrbCanvas({ score, recalculating }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas dimensions
    canvas.width = 240;
    canvas.height = 240;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // Position on circular perimeter far away
        const angle = Math.random() * Math.PI * 2;
        const distance = 90 + Math.random() * 40;
        this.x = centerX + Math.cos(angle) * distance;
        this.y = centerY + Math.sin(angle) * distance;
        this.radius = 1 + Math.random() * 2.5;
        this.color = recalculating 
          ? `hsla(${180 + Math.random() * 40}, 80%, 60%, ${0.3 + Math.random() * 0.5})` // teal-ish for updating
          : `hsla(${100 + Math.random() * 60}, 65%, 45%, ${0.2 + Math.random() * 0.4})`; // evergreen-ish for normal
        
        // Speed flowing towards center
        const speed = recalculating ? 1.5 + Math.random() * 2.5 : 0.4 + Math.random() * 0.8;
        this.vx = -Math.cos(angle) * speed;
        this.vy = -Math.sin(angle) * speed;
        this.life = 0;
        this.maxLife = recalculating ? 40 + Math.random() * 30 : 100 + Math.random() * 50;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // If particle reaches center or life expires, reset
        const dist = Math.hypot(this.x - centerX, this.y - centerY);
        if (dist < 40 || this.life >= this.maxLife) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = recalculating ? 8 : 2;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    // Populate particles
    const particleCount = recalculating ? 60 : 25;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background glow
      const radialGlow = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, recalculating ? 110 : 90);
      radialGlow.addColorStop(0, recalculating ? 'rgba(32, 92, 97, 0.2)' : 'rgba(44, 89, 58, 0.1)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, recalculating ? 110 : 90, 0, Math.PI * 2);
      ctx.fill();

      // Update & Draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [recalculating]);

  return (
    <div className="orb-viewport">
      <canvas ref={canvasRef} className="canvas-particles" />
      <div className={`living-orb ${recalculating ? 'recalculating' : ''}`} />
      <div className="orb-score-display">
        <span className="orb-score-val">{score}</span>
        <span className="orb-score-label">ESG Score</span>
      </div>
    </div>
  );
}

// ---- Eco-Quest ESG Quiz Question Bank ----
const QUIZ_QUESTIONS = [
  { q: 'What does "Scope 1" refer to in GHG Protocol terminology?', options: ['Direct emissions from owned/controlled sources', 'Indirect emissions from purchased electricity', 'All upstream supply chain emissions', 'Government-regulated emissions'], answer: 0 },
  { q: 'Which gas has the highest Global Warming Potential (GWP) over 100 years?', options: ['Carbon Dioxide (CO₂)', 'Methane (CH₄)', 'Sulfur Hexafluoride (SF₆)', 'Nitrous Oxide (N₂O)'], answer: 2 },
  { q: 'The 2026 UK DESNZ conversion factor for grid electricity decreased by approximately what percentage?', options: ['5%', '10%', '26%', '50%'], answer: 2 },
  { q: 'What does ESG stand for?', options: ['Energy, Sustainability, Growth', 'Environmental, Social, Governance', 'Emissions, Safety, Guidelines', 'Ecological Standards Guide'], answer: 1 },
  { q: 'ISO 14001 is the international standard for:', options: ['Quality management systems', 'Food safety management', 'Environmental management systems', 'Information security'], answer: 2 },
  { q: 'The average CO₂ emission factor for petrol (gasoline) vehicles is approximately:', options: ['0.5 kg CO₂e/litre', '1.2 kg CO₂e/litre', '2.31 kg CO₂e/litre', '5.0 kg CO₂e/litre'], answer: 2 },
  { q: 'What is a "carbon credit"?', options: ['A tax refund for green companies', 'A tradeable certificate representing 1 tonne of CO₂ equivalent removed or reduced', 'A loan for carbon capture technology', 'A government subsidy for EVs'], answer: 1 },
  { q: 'Circular economy principles aim to:', options: ['Maximise raw material extraction', 'Design out waste and keep resources in use', 'Increase landfill capacity', 'Reduce employee wages'], answer: 1 },
  { q: 'Which framework is most commonly used for corporate ESG disclosure?', options: ['GAAP', 'GRI Standards', 'IFRS only', 'OSHA guidelines'], answer: 1 },
  { q: 'What is "greenwashing"?', options: ['Cleaning industrial equipment with eco-friendly solvents', 'Making misleading claims about environmental practices', 'Planting trees in corporate campuses', 'Recycling office paper'], answer: 1 }
];

export default function EcoSphereApp() {
  // ---- Authentication State ----
  const [authUser, setAuthUser] = useState(null); // null = not logged in
  const [authChecking, setAuthChecking] = useState(true); // true while checking session cookie
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirmPassword: '', employee_name: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ---- App State ----
  const [activeTab, setActiveTab] = useState('Dashboard');
  const currentUser = authUser?.employeeName || 'Guest';
  const [recalculating, setRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ---- Quiz Game State ----
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // States for API data
  const [dashboardData, setDashboardData] = useState({
    overallScore: 0,
    environmentalScore: 0,
    socialScore: 0,
    governanceScore: 0,
    departmentScores: [],
    totalCarbonEmissions: "0.0",
    goals: [],
    activeChallenges: [],
    openComplianceIssues: [],
    notifications: [],
    configs: {}
  });

  const [environmentalData, setEnvironmentalData] = useState({
    transactions: [],
    factors: [],
    products: [],
    goals: []
  });

  const [socialData, setSocialData] = useState({
    activities: [],
    participations: [],
    diversityStats: [],
    trainingStats: []
  });

  const [governanceData, setGovernanceData] = useState({
    policies: [],
    acknowledgements: [],
    audits: [],
    complianceIssues: []
  });

  const [gamificationData, setGamificationData] = useState({
    challenges: [],
    participations: [],
    badges: [],
    rewards: [],
    leaderboard: [],
    redemptions: []
  });

  const [reportData, setReportData] = useState({
    filters: {},
    reportData: {}
  });

  // Loaders
  const [loading, setLoading] = useState(true);

  // Trigger toast helper
  const triggerToast = (msg, success = true) => {
    setToastMessage({ text: msg, success });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---- Authentication Handlers ----
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.success && data.authenticated) {
        setAuthUser(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (e) {
      setAuthUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setAuthUser(data.user);
        setLoginForm({ username: '', password: '' });
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    if (signupForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupForm.username,
          email: signupForm.email,
          password: signupForm.password,
          employee_name: signupForm.employee_name
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuthMode('login');
        setLoginForm({ username: signupForm.username, password: '' });
        setSignupForm({ username: '', email: '', password: '', confirmPassword: '', employee_name: '' });
        setAuthError('');
        alert('Registration successful! Please log in with your credentials.');
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    setAuthUser(null);
    setActiveTab('Dashboard');
  };

  // ---- Quiz Game Handlers ----
  const startQuiz = () => {
    setQuizActive(true);
    setQuizQuestionIndex(0);
    setQuizSelectedAnswer(null);
    setQuizAnswered(false);
    setQuizCorrectCount(0);
    setQuizFinished(false);
    setQuizResult(null);
  };

  const handleQuizAnswer = (optionIndex) => {
    if (quizAnswered) return;
    setQuizSelectedAnswer(optionIndex);
    setQuizAnswered(true);
    if (optionIndex === QUIZ_QUESTIONS[quizQuestionIndex].answer) {
      setQuizCorrectCount(prev => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
      setQuizSelectedAnswer(null);
      setQuizAnswered(false);
    } else {
      // Quiz finished - submit results
      const finalCorrect = quizSelectedAnswer === QUIZ_QUESTIONS[quizQuestionIndex].answer
        ? quizCorrectCount
        : quizCorrectCount; // already counted in handleQuizAnswer
      setQuizFinished(true);
      submitQuizResults(finalCorrect);
    }
  };

  const submitQuizResults = async (correctCount) => {
    try {
      const res = await fetch('/api/gamification/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_name: currentUser,
          correct_answers: correctCount,
          total_questions: QUIZ_QUESTIONS.length
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data);
        triggerRecalculation(`Quiz complete! You earned ${data.xpEarned} XP and ${data.pointsEarned} Points!`);
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
    }
  };

  // Fetch Dashboard Aggregates
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch all modules data
  const fetchModuleData = async () => {
    setLoading(true);
    try {
      await fetchDashboard();
      
      const [envRes, socRes, govRes, gamRes] = await Promise.all([
        fetch('/api/environmental'),
        fetch('/api/social'),
        fetch('/api/governance'),
        fetch('/api/gamification')
      ]);

      const env = await envRes.json();
      const soc = await socRes.json();
      const gov = await govRes.json();
      const gam = await gamRes.json();

      if (env.success) setEnvironmentalData(env);
      if (soc.success) setSocialData(soc);
      if (gov.success) setGovernanceData(gov);
      if (gam.success) setGamificationData(gam);
    } catch (e) {
      console.error(e);
      triggerToast('Error loading module data', false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: Check session first, then load data
  useEffect(() => {
    checkSession();
  }, []);

  // When authUser changes (login/logout), load module data
  useEffect(() => {
    if (authUser) {
      fetchModuleData();
    }
  }, [authUser]);

  // Recalculating trigger helper
  const triggerRecalculation = async (successMsg = "Data posted and scores updated successfully!") => {
    setRecalculating(true);
    triggerToast(successMsg);
    
    // Smooth delay for orb visual effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await fetchModuleData();
    setRecalculating(false);
  };

  // -------------------------------------------------------------
  // Environmental Action Handlers
  // -------------------------------------------------------------
  const [envForm, setEnvForm] = useState({
    department_id: '',
    source_type: 'Expense',
    source_amount: '',
    emission_factor_id: '',
    calculated_emissions: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleEnvSubmit = async (e) => {
    e.preventDefault();
    if (!envForm.department_id || !envForm.source_amount) {
      triggerToast('Please fill out required fields', false);
      return;
    }

    try {
      const res = await fetch('/api/environmental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envForm)
      });
      const data = await res.json();
      if (data.success) {
        setEnvForm({
          department_id: '',
          source_type: 'Expense',
          source_amount: '',
          emission_factor_id: '',
          calculated_emissions: '',
          transaction_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        triggerRecalculation('Carbon transaction logged! Scores recalculated.');
      } else {
        triggerToast(data.error || 'Failed to submit', false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  // Preview emissions real-time in UI
  const getEnvironmentalPreview = () => {
    if (dashboardData.configs?.auto_emission_calculation) {
      const selectedFactor = environmentalData.factors.find(f => f.id === Number(envForm.emission_factor_id));
      if (selectedFactor && envForm.source_amount) {
        return (Number(envForm.source_amount) * Number(selectedFactor.factor)).toFixed(2);
      }
      return "0.00 (Select factor and type amount)";
    }
    return envForm.calculated_emissions || "Enter manually";
  };

  // -------------------------------------------------------------
  // Social Action Handlers
  // -------------------------------------------------------------
  const [socForm, setSocForm] = useState({
    activity_id: '',
    proof_file: '',
    completion_date: new Date().toISOString().split('T')[0]
  });

  const handleSocSubmit = async (e) => {
    e.preventDefault();
    if (!socForm.activity_id) {
      triggerToast('Please select a CSR activity', false);
      return;
    }

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...socForm,
          employee_name: currentUser
        })
      });
      const data = await res.json();
      if (data.success) {
        setSocForm({
          activity_id: '',
          proof_file: '',
          completion_date: new Date().toISOString().split('T')[0]
        });
        triggerRecalculation('CSR activity participation logged for approval!');
      } else {
        triggerToast(data.error || 'Failed to submit', false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  const handleApproveParticipation = async (id, status) => {
    try {
      const res = await fetch('/api/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participation_id: id, approval_status: status })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation(`Participation ${status.toLowerCase()}! Scores recalculated.`);
      } else {
        triggerToast(data.error || 'Failed to update', false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  // -------------------------------------------------------------
  // Governance Action Handlers
  // -------------------------------------------------------------
  const handleAcknowledgePolicy = async (policyId) => {
    try {
      const res = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge_policy', policy_id: policyId, employee_name: currentUser })
      });
      const data = await res.json();
      if (data.success) {
        let msg = 'Policy acknowledged!';
        if (data.newlyAwarded?.length > 0) {
          msg += ` Unlocked badges: ${data.newlyAwarded.join(', ')}`;
        }
        triggerRecalculation(msg);
      } else {
        triggerToast(data.error || 'Failed to acknowledge', false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  const [issueForm, setIssueForm] = useState({
    audit_id: '',
    severity: 'Medium',
    description: '',
    owner: '',
    due_date: ''
  });

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.audit_id || !issueForm.description || !issueForm.owner || !issueForm.due_date) {
      triggerToast('Please fill out all fields', false);
      return;
    }

    try {
      const res = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...issueForm, action: 'create_compliance_issue' })
      });
      const data = await res.json();
      if (data.success) {
        setIssueForm({ audit_id: '', severity: 'Medium', description: '', owner: '', due_date: '' });
        triggerRecalculation('New compliance issue raised! Governance score adjusted.');
      } else {
        triggerToast(data.error, false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      const res = await fetch('/api/governance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId, status: 'Resolved' })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation('Compliance issue marked as Resolved! Scores updated.');
      } else {
        triggerToast(data.error, false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  // -------------------------------------------------------------
  // Gamification Action Handlers
  // -------------------------------------------------------------
  const handleJoinChallenge = async (challengeId) => {
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup_challenge', challenge_id: challengeId, employee_name: currentUser })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation('Signed up for the challenge successfully!');
      } else {
        triggerToast(data.error, false);
      }
    } catch (e) {
      triggerToast('Connection error', false);
    }
  };

  const [challengeProgressVal, setChallengeProgressVal] = useState({});
  
  const handleUpdateChallengeProgress = async (partId, progress) => {
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_challenge_progress', participation_id: partId, progress })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation(progress === 100 ? 'Challenge completed! Submitted for review.' : 'Progress updated!');
      } else {
        triggerToast(data.error, false);
      }
    } catch (e) {
      triggerToast('Connection error', false);
    }
  };

  const handleApproveChallenge = async (partId, status) => {
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_challenge', participation_id: partId, approval_status: status })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation(`Challenge completed ${status.toLowerCase()}! Scores recalculated.`);
      } else {
        triggerToast(data.error, false);
      }
    } catch (e) {
      triggerToast('Connection error', false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    try {
      const res = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem_reward', reward_id: rewardId, employee_name: currentUser })
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation('Reward redeemed! Points and stock updated.');
      } else {
        triggerToast(data.error || 'Redemption failed', false);
      }
    } catch (e) {
      triggerToast('Connection error', false);
    }
  };

  // Helper to fetch current employee score info
  const getCurrentEmployeeScore = () => {
    return gamificationData.leaderboard.find(e => e.employee_name === currentUser) || { xp: 0, points: 0, challenges_completed: 0, csr_completed: 0 };
  };

  // -------------------------------------------------------------
  // Settings Action Handlers
  // -------------------------------------------------------------
  const [settingsForm, setSettingsForm] = useState({
    weight_environmental: 40,
    weight_social: 30,
    weight_governance: 30,
    auto_emission_calculation: true,
    evidence_requirement: true,
    badge_auto_award: true
  });

  // Sync settings when fetched
  useEffect(() => {
    if (dashboardData.configs && Object.keys(dashboardData.configs).length > 0) {
      setSettingsForm({
        weight_environmental: Number(dashboardData.configs.weight_environmental) || 40,
        weight_social: Number(dashboardData.configs.weight_social) || 30,
        weight_governance: Number(dashboardData.configs.weight_governance) || 30,
        auto_emission_calculation: dashboardData.configs.auto_emission_calculation !== false,
        evidence_requirement: dashboardData.configs.evidence_requirement !== false,
        badge_auto_award: dashboardData.configs.badge_auto_award !== false
      });
    }
  }, [dashboardData.configs]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const sum = Number(settingsForm.weight_environmental) + Number(settingsForm.weight_social) + Number(settingsForm.weight_governance);
    if (sum !== 100) {
      triggerToast('Weights must sum exactly to 100%', false);
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        triggerRecalculation('Configurations updated! Global ESG scores recalculated.');
      } else {
        triggerToast(data.error, false);
      }
    } catch (err) {
      triggerToast('Connection error', false);
    }
  };

  // -------------------------------------------------------------
  // Custom Reports Handler
  // -------------------------------------------------------------
  const [reportFilters, setReportFilters] = useState({
    module: 'Environmental',
    department: '',
    startDate: '',
    endDate: '',
    employee: '',
    challenge: '',
    category: ''
  });

  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGeneratingReport(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(reportFilters).forEach(k => {
        if (reportFilters[k]) queryParams.append(k, reportFilters[k]);
      });

      const res = await fetch(`/api/reports?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
        triggerToast('Report compiled successfully!');
      } else {
        triggerToast(data.error, false);
      }
    } catch (err) {
      triggerToast('Error compiling report', false);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Mock export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const mod = reportFilters.module;

    if (mod === 'Environmental' && reportData.reportData?.environmental) {
      csvContent += "ID,Department,Type,Amount,Calculated Emissions (kg CO2e),Date,Notes\r\n";
      reportData.reportData.environmental.forEach(r => {
        csvContent += `${r.id},"${r.department_name}",${r.source_type},${r.source_amount},${r.calculated_emissions},${r.transaction_date.split('T')[0]},"${r.notes || ''}"\r\n`;
      });
    } else if (mod === 'Social' && reportData.reportData?.social) {
      csvContent += "ID,Employee,Activity,Points Earned,Status,Completion Date\r\n";
      reportData.reportData.social.forEach(r => {
        csvContent += `${r.id},"${r.employee_name}","${r.activity_title}",${r.points_earned},${r.approval_status},${r.completion_date?.split('T')[0] || ''}\r\n`;
      });
    } else if (mod === 'Governance' && reportData.reportData?.governance) {
      csvContent += "ID,Audit Name,Department,Severity,Description,Owner,Due Date,Status\r\n";
      reportData.reportData.governance.forEach(r => {
        csvContent += `${r.id},"${r.audit_title}","${r.department_name}",${r.severity},"${r.description}","${r.owner}",${r.due_date.split('T')[0]},${r.status}\r\n`;
      });
    } else if (mod === 'ESG Summary' && reportData.reportData?.summaryStats) {
      const stats = reportData.reportData.summaryStats;
      csvContent += "Metric,Value\r\n";
      csvContent += `Total Carbon Footprint (kg CO2e),${stats.totalCarbonFootprintKg}\r\n`;
      csvContent += `Total Compliance Issues,${stats.totalComplianceIssues}\r\n`;
      csvContent += `Open Compliance Issues,${stats.openComplianceIssues}\r\n`;
      csvContent += `Approved CSR Activities,${stats.approvedCsrActivities}\r\n`;
      csvContent += `Total CSR Points Distributed,${stats.totalCsrPointsDistributed}\r\n`;
    } else {
      triggerToast('No data to export', false);
      return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecosphere_report_${mod.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all' })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboard();
        triggerToast('Notifications cleared');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#112217',
        color: '#f6f5ee',
        fontFamily: 'var(--font-sans)',
        fontSize: '18px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="living-orb recalculating" style={{ width: '80px', height: '80px' }} />
          <span>Authenticating EcoSphere Session...</span>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#112217',
        color: '#f6f5ee',
        fontFamily: 'var(--font-sans)',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#f6f5ee',
          color: '#112217',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          border: '1px solid rgba(17, 34, 23, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="font-display" style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#112217' }}>EcoSphere</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ESG Carbon Observatory & Living Management System</p>
          </div>

          {authError && (
            <div style={{
              backgroundColor: '#fce8e6',
              border: '1px solid #ea4335',
              color: '#c5221f',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Username</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Password</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#112217',
                  color: '#f6f5ee',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '10px',
                  cursor: 'pointer',
                  border: 'none',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                {authLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Username</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={signupForm.username}
                  onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
                  placeholder="Choose username"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Full Employee Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={signupForm.employee_name}
                  onChange={e => setSignupForm({ ...signupForm, employee_name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Password</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#112217', fontWeight: '600' }}>Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ borderColor: 'rgba(17, 34, 23, 0.2)', color: '#112217' }}
                  required
                  value={signupForm.confirmPassword}
                  onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#112217',
                  color: '#f6f5ee',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  marginTop: '10px',
                  cursor: 'pointer',
                  border: 'none',
                  opacity: authLoading ? 0.7 : 1
                }}
              >
                {authLoading ? 'Registering...' : 'Register'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert Box */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toastMessage.success ? '#112217' : '#732929',
          color: '#f6f5ee',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          zIndex: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'var(--font-display)',
          animation: 'floatOrb 0.5s ease-out'
        }}>
          {!toastMessage.success && Icons.Alert()}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <span className="brand-text">EcoSphere</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            <span className="nav-icon"><Icons.Dashboard /></span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Environmental' ? 'active' : ''}`}
            onClick={() => setActiveTab('Environmental')}
          >
            <span className="nav-icon"><Icons.Environmental /></span>
            <span>Environmental</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Social' ? 'active' : ''}`}
            onClick={() => setActiveTab('Social')}
          >
            <span className="nav-icon"><Icons.Social /></span>
            <span>Social</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Governance' ? 'active' : ''}`}
            onClick={() => setActiveTab('Governance')}
          >
            <span className="nav-icon"><Icons.Governance /></span>
            <span>Governance</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Gamification' ? 'active' : ''}`}
            onClick={() => setActiveTab('Gamification')}
          >
            <span className="nav-icon"><Icons.Gamification /></span>
            <span>Gamification</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('Reports')}
          >
            <span className="nav-icon"><Icons.Reports /></span>
            <span>Reports</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('Settings')}
          >
            <span className="nav-icon"><Icons.Settings /></span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* User selection dropdown for testing */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>ACTING EMPLOYEE</label>
            <select 
              className="form-select" 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderColor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                padding: '6px 10px',
                fontSize: '13px'
              }}
              value={currentUser}
              onChange={(e) => {
                setCurrentUser(e.target.value);
                triggerToast(`Switched active user to ${e.target.value}`);
              }}
            >
              <option value="John Doe" style={{color: 'black'}}>John Doe (Eng)</option>
              <option value="Jane Smith" style={{color: 'black'}}>Jane Smith (Ops)</option>
              <option value="Bob Johnson" style={{color: 'black'}}>Bob Johnson (Mkt)</option>
              <option value="Alice Williams" style={{color: 'black'}}>Alice Williams (HR)</option>
            </select>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {currentUser.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser}</span>
              <span className="user-role">
                Points: <span className="font-mono" style={{ color: 'var(--accent-gamification)', fontWeight: 'bold' }}>{getCurrentEmployeeScore().points}</span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">{activeTab}</h1>
          <div className="top-bar-actions">
            {/* Header statistics preview */}
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div>
                Emissions: <strong className="font-mono" style={{ color: 'var(--accent-environmental)' }}>{dashboardData.totalCarbonEmissions}</strong> kg
              </div>
              <div>
                User XP: <strong className="font-mono" style={{ color: 'var(--accent-gamification)' }}>{getCurrentEmployeeScore().xp}</strong>
              </div>
            </div>

            <div className="notification-badge-container" title="Notifications">
              <Icons.Bell />
              {dashboardData.notifications?.filter(n=>n.status === 'Unread').length > 0 && (
                <span className="badge-dot" />
              )}
            </div>
          </div>
        </header>

        <div className="view-container">
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontFamily: 'var(--font-display)', fontWeight: '600' }}>
              Communicating with Observatory database...
            </div>
          )}

          {!loading && (
            <>
              {/* ------------------------------------------------------------- */}
              {/* DASHBOARD TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Summary & Living Orb Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px' }}>
                    
                    {/* The Living Orb */}
                    <div className="card orb-card">
                      <h3 className="font-display" style={{ marginBottom: '16px', color: 'var(--bg-evergreen)', fontSize: '18px', textAlign: 'center' }}>
                        Connected ESG Balance
                      </h3>
                      <LivingOrbCanvas score={dashboardData.overallScore} recalculating={recalculating} />
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                        <span>Connected</span> • <span>Real-Time</span> • <span>Automated</span>
                      </div>
                    </div>

                    {/* Pillar Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyGap: 'space-between', gap: '16px' }}>
                      <div className="grid-3" style={{ flex: 1 }}>
                        
                        <div className="card pillar-border-environmental" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span className="tag tag-environmental">Environmental</span>
                            <h4 className="font-display" style={{ fontSize: '32px', margin: '12px 0 4px 0' }}>{dashboardData.environmentalScore}<span style={{fontSize: '16px', color: 'var(--text-muted)'}}>/100</span></h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Carbon offset & footprint logs</p>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-environmental)', marginTop: '12px' }}>Weight: {dashboardData.configs?.weight_environmental}%</div>
                        </div>

                        <div className="card pillar-border-social" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span className="tag tag-social">Social</span>
                            <h4 className="font-display" style={{ fontSize: '32px', margin: '12px 0 4px 0' }}>{dashboardData.socialScore}<span style={{fontSize: '16px', color: 'var(--text-muted)'}}>/100</span></h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CSR & Training completion rate</p>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-social)', marginTop: '12px' }}>Weight: {dashboardData.configs?.weight_social}%</div>
                        </div>

                        <div className="card pillar-border-governance" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span className="tag tag-governance">Governance</span>
                            <h4 className="font-display" style={{ fontSize: '32px', margin: '12px 0 4px 0' }}>{dashboardData.governanceScore}<span style={{fontSize: '16px', color: 'var(--text-muted)'}}>/100</span></h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Compliance issues checklist</p>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-governance)', marginTop: '12px' }}>Weight: {dashboardData.configs?.weight_governance}%</div>
                        </div>

                      </div>

                      {/* Carbon Observatory Overview Banner */}
                      <div className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef3ef', borderColor: '#d3e2d6' }}>
                        <div>
                          <h4 className="font-display" style={{ color: 'var(--accent-environmental)' }}>Scope 1 & 2 Emissions Observatory</h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Calculated dynamically based on real-time fleet mileage, logistics, and expense receipts.</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Footprint</span>
                          <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-environmental)' }}>{dashboardData.totalCarbonEmissions} <span style={{fontSize:'14px'}}>kg CO2e</span></h3>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Department Rankings & Notifications */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr', gap: '32px' }}>
                    
                    {/* Department Scores */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Department performance logs</h3>
                      <div className="table-wrapper">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Department</th>
                              <th>Environmental</th>
                              <th>Social</th>
                              <th>Governance</th>
                              <th>Total Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.departmentScores?.map(dept => (
                              <tr key={dept.departmentId}>
                                <td style={{ fontWeight: '600' }}>{dept.departmentName} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>({dept.departmentCode})</span></td>
                                <td className="font-mono">{dept.environmentalScore}</td>
                                <td className="font-mono">{dept.socialScore}</td>
                                <td className="font-mono">{dept.governanceScore}</td>
                                <td className="font-mono" style={{ fontWeight: 'bold', color: 'var(--accent-environmental)' }}>{dept.totalScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notifications Panel */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)' }}>Observatory logs</h3>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleClearNotifications}>Clear</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px', flex: 1 }}>
                        {dashboardData.notifications?.length === 0 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No logs yet. Try adding data!</div>
                        )}
                        {dashboardData.notifications?.map(n => (
                          <div key={n.id} style={{
                            padding: '12px',
                            borderRadius: '6px',
                            borderLeft: `4px solid ${
                              n.type === 'Compliance' ? 'var(--accent-environmental)' : 
                              n.type === 'Approval' ? 'var(--accent-social)' : 
                              n.type === 'Policy' ? 'var(--accent-governance)' : 'var(--accent-gamification)'
                            }`,
                            backgroundColor: '#fbfbf9',
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{n.type}</span>
                              <span>{new Date(n.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ color: 'var(--text-main)' }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ENVIRONMENTAL TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Environmental' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Summary & Form Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: '32px' }}>
                    
                    {/* Form Card */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Log Carbon Transaction</h3>
                      <form onSubmit={handleEnvSubmit}>
                        
                        <div className="form-group">
                          <label className="form-label">DEPARTMENT *</label>
                          <select 
                            className="form-select"
                            value={envForm.department_id}
                            onChange={(e) => setEnvForm({ ...envForm, department_id: e.target.value })}
                          >
                            <option value="">Select Department</option>
                            {dashboardData.departmentScores?.map(d => (
                              <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">SOURCE CATEGORY *</label>
                          <select 
                            className="form-select"
                            value={envForm.source_type}
                            onChange={(e) => setEnvForm({ ...envForm, source_type: e.target.value })}
                          >
                            <option value="Purchase">Purchase (Travel/Procurement)</option>
                            <option value="Manufacturing">Manufacturing Sourcing</option>
                            <option value="Expense">Office Expenses</option>
                            <option value="Fleet">Fleet Operations</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">EMISSION FACTOR *</label>
                          <select 
                            className="form-select"
                            value={envForm.emission_factor_id}
                            onChange={(e) => setEnvForm({ ...envForm, emission_factor_id: e.target.value })}
                          >
                            <option value="">Select Factor</option>
                            {environmentalData.factors
                              ?.filter(f => f.category === envForm.source_type)
                              ?.map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.factor} {f.unit})</option>
                              ))
                            }
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">SOURCE USAGE AMOUNT *</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="e.g. 500 liters / kWh / km"
                            value={envForm.source_amount}
                            onChange={(e) => setEnvForm({ ...envForm, source_amount: e.target.value })}
                          />
                        </div>

                        {!dashboardData.configs?.auto_emission_calculation && (
                          <div className="form-group">
                            <label className="form-label">CALCULATED EMISSIONS (kg CO2e) *</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="Manually calculate emissions"
                              value={envForm.calculated_emissions}
                              onChange={(e) => setEnvForm({ ...envForm, calculated_emissions: e.target.value })}
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label">TRANSACTION DATE *</label>
                          <input 
                            type="date" 
                            className="form-input"
                            value={envForm.transaction_date}
                            onChange={(e) => setEnvForm({ ...envForm, transaction_date: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">NOTES / DETAILS</label>
                          <textarea 
                            className="form-textarea" 
                            rows="2"
                            placeholder="e.g. Flight travel footprint, Grid electricity bill..."
                            value={envForm.notes}
                            onChange={(e) => setEnvForm({ ...envForm, notes: e.target.value })}
                          />
                        </div>

                        {/* Real-time preview panel */}
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f7f6f0',
                          borderRadius: '6px',
                          border: '1px dashed var(--border-color)',
                          marginBottom: '16px',
                          fontSize: '13px'
                        }}>
                          <strong>Observatory Real-Time Preview:</strong>
                          <div style={{ color: 'var(--accent-environmental)', fontWeight: 'bold', fontSize: '15px', marginTop: '4px' }}>
                            {getEnvironmentalPreview()} kg CO2e
                          </div>
                          {dashboardData.configs?.auto_emission_calculation && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>* Automatically computed from selected factor.</span>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Operational Transaction</button>
                      </form>
                    </div>

                    {/* Goals & Emission Factors */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Goals Tracker */}
                      <div className="card">
                        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Sustainability Goals</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {environmentalData.goals?.map(g => {
                            const pct = Math.min(100, Math.round((g.current_value / g.target_value) * 100));
                            return (
                              <div key={g.id}>
                                <div className="flex-between" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                                  <span>{g.title}</span>
                                  <span className="font-mono">{pct}% ({g.current_value.toLocaleString()} / {g.target_value.toLocaleString()} {g.unit})</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--accent-environmental)', borderRadius: '4px', transition: 'width 1s ease' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Deadline: {new Date(g.deadline).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Product Profiles */}
                      <div className="card">
                        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Product ESG Profiles</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          {environmentalData.products?.map(p => (
                            <div key={p.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }}>
                              <div style={{ fontWeight: 'bold', color: 'var(--bg-evergreen)' }}>{p.name}</div>
                              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>{p.sku}</div>
                              <div style={{ marginTop: '8px' }}>
                                Footprint: <strong className="font-mono" style={{ color: 'var(--accent-environmental)' }}>{p.carbon_footprint}</strong> kg
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Transaction Ledger Table */}
                  <div className="card">
                    <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Scope 1 & 2 Carbon Ledger</h3>
                    <div className="table-wrapper">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Department</th>
                            <th>Category</th>
                            <th>Source Amount</th>
                            <th>Factor Used</th>
                            <th>Emissions Offset</th>
                          </tr>
                        </thead>
                        <tbody>
                          {environmentalData.transactions?.map(tx => (
                            <tr key={tx.id}>
                              <td className="font-mono">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                              <td style={{ fontWeight: '600' }}>{tx.department_name}</td>
                              <td><span className="tag tag-environmental">{tx.source_type}</span></td>
                              <td className="font-mono">{tx.source_amount}</td>
                              <td>{tx.emission_factor_name || 'Manual'} <span className="font-mono" style={{fontSize: '11px', color: 'var(--text-muted)'}}>({tx.factor_value || '-'})</span></td>
                              <td className="font-mono" style={{ fontWeight: 'bold', color: 'var(--accent-environmental)' }}>{tx.calculated_emissions} kg CO2e</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SOCIAL TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Social' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Forms and Diversity Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: '32px' }}>
                    
                    {/* Log CSR Activity form */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Submit CSR Participation</h3>
                      <form onSubmit={handleSocSubmit}>
                        <div className="form-group">
                          <label className="form-label">CSR ACTIVITY *</label>
                          <select 
                            className="form-select"
                            value={socForm.activity_id}
                            onChange={(e) => setSocForm({ ...socForm, activity_id: e.target.value })}
                          >
                            <option value="">Select Activity</option>
                            {socialData.activities?.map(a => (
                              <option key={a.id} value={a.id}>{a.title} ({a.points} Points)</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">EVIDENCE / PROOF DETAILED DESCRIPTION {dashboardData.configs?.evidence_requirement && '*'}</label>
                          <textarea 
                            className="form-textarea" 
                            rows="3"
                            placeholder="e.g. Recycled 3 old laptops at the collection center, or link to proof image..."
                            value={socForm.proof_file}
                            onChange={(e) => setSocForm({ ...socForm, proof_file: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">COMPLETION DATE *</label>
                          <input 
                            type="date" 
                            className="form-input"
                            value={socForm.completion_date}
                            onChange={(e) => setSocForm({ ...socForm, completion_date: e.target.value })}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Submit Participation</button>
                      </form>
                    </div>

                    {/* Stats Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* Diversity Chart Card */}
                      <div className="card">
                        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Diversity & Inclusion Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {socialData.diversityStats?.map((s, idx) => (
                            <div key={idx}>
                              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{s.category}</div>
                              <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                <div style={{ width: `${s.male}%`, backgroundColor: '#3b5585', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Male {s.male}%</div>
                                <div style={{ width: `${s.female}%`, backgroundColor: 'var(--accent-social)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Female {s.female}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Policy training acknowledgement stats */}
                      <div className="card">
                        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>ESG Training Completion Rate</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {socialData.trainingStats?.map((s, idx) => (
                            <div key={idx} className="flex-between" style={{ fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                              <span>{s.policyTitle}</span>
                              <span style={{ fontWeight: 'bold' }}>
                                {s.acknowledgedCount} / 260 employees (<span className="font-mono" style={{ color: 'var(--accent-social)' }}>{s.completionRate}%</span>)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Admin Approval Ledger */}
                  <div className="card">
                    <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>CSR Participations Approvals Panel</h3>
                    <div className="table-wrapper">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Employee</th>
                            <th>Activity</th>
                            <th>Proof / Evidence</th>
                            <th>Points</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {socialData.participations?.map(part => (
                            <tr key={part.id}>
                              <td style={{ fontWeight: '600' }}>{part.employee_name}</td>
                              <td>{part.activity_title}</td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{part.proof_file || 'None'}</td>
                              <td className="font-mono">{part.activity_points}</td>
                              <td>
                                <span className={`tag ${
                                  part.approval_status === 'Approved' ? 'tag-environmental' :
                                  part.approval_status === 'Rejected' ? 'tag-governance' : 'tag-gamification'
                                }`}>
                                  {part.approval_status}
                                </span>
                              </td>
                              <td>
                                {part.approval_status === 'Draft' ? (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                      className="btn btn-accent" 
                                      style={{ padding: '6px 12px', fontSize: '12px' }}
                                      onClick={() => handleApproveParticipation(part.id, 'Approved')}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '12px', color: '#d9383a', borderColor: '#eecaca' }}
                                      onClick={() => handleApproveParticipation(part.id, 'Rejected')}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Processed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* GOVERNANCE TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Governance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Policies Acknowledging Panel */}
                  <div className="card">
                    <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Corporate ESG Policies</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {governanceData.policies?.map(p => {
                        const isAcked = governanceData.acknowledgements?.some(ack => ack.policy_id === p.id && ack.employee_name === currentUser);
                        return (
                          <div key={p.id} style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                            <div>
                              <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <h4 className="font-display" style={{ fontSize: '16px', color: 'var(--bg-evergreen)' }}>{p.title}</h4>
                                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>v{p.version}</span>
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{p.content}</p>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              {isAcked ? (
                                <span className="tag tag-environmental" style={{ padding: '8px 12px' }}>Acknowledged</span>
                              ) : (
                                <button className="btn btn-primary" onClick={() => handleAcknowledgePolicy(p.id)}>Acknowledge</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Issues Ledger & Raising form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '32px' }}>
                    
                    {/* Compliance Issues Checklist */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Compliance Issues Ledger</h3>
                      <div className="table-wrapper">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Audit Source</th>
                              <th>Description</th>
                              <th>Owner</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {governanceData.complianceIssues?.map(issue => (
                              <tr key={issue.id} style={issue.overdue ? { backgroundColor: 'rgba(217, 56, 58, 0.04)' } : {}}>
                                <td className="font-mono">#{issue.id}</td>
                                <td style={{ fontWeight: '600' }}>
                                  {issue.audit_title}
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{issue.department_name}</div>
                                </td>
                                <td style={{ fontSize: '13px' }}>{issue.description}</td>
                                <td>{issue.owner}</td>
                                <td className="font-mono" style={{ color: issue.overdue ? '#d9383a' : 'inherit', fontWeight: issue.overdue ? 'bold' : 'normal' }}>
                                  {new Date(issue.due_date).toLocaleDateString()}
                                  {issue.overdue && (
                                    <div style={{ color: '#d9383a', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>OVERDUE WARNING</div>
                                  )}
                                </td>
                                <td>
                                  <span className={`tag ${
                                    issue.status === 'Resolved' ? 'tag-environmental' :
                                    issue.status === 'Flagged' || issue.overdue ? 'tag-governance' : 'tag-gamification'
                                  }`}>
                                    {issue.status}
                                  </span>
                                </td>
                                <td>
                                  {issue.status === 'Open' ? (
                                    <button 
                                      className="btn btn-accent" 
                                      style={{ padding: '6px 12px', fontSize: '12px' }}
                                      onClick={() => handleResolveIssue(issue.id)}
                                    >
                                      Resolve
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Form Card for Compliance Issues */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Raise Compliance Issue</h3>
                      <form onSubmit={handleCreateIssue}>
                        <div className="form-group">
                          <label className="form-label">AUDIT SOURCE *</label>
                          <select 
                            className="form-select"
                            value={issueForm.audit_id}
                            onChange={(e) => setIssueForm({ ...issueForm, audit_id: e.target.value })}
                          >
                            <option value="">Select Audit</option>
                            {governanceData.audits?.map(a => (
                              <option key={a.id} value={a.id}>{a.title} ({a.department_name})</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">SEVERITY *</label>
                          <select 
                            className="form-select"
                            value={issueForm.severity}
                            onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">COMPLIANCE OWNER *</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. Marcus Wright"
                            value={issueForm.owner}
                            onChange={(e) => setIssueForm({ ...issueForm, owner: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">DUE RESOLUTION DATE *</label>
                          <input 
                            type="date" 
                            className="form-input"
                            value={issueForm.due_date}
                            onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">ISSUE DESCRIPTION *</label>
                          <textarea 
                            className="form-textarea" 
                            rows="3"
                            placeholder="Describe the compliance violation details..."
                            value={issueForm.description}
                            onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Raise Violation File</button>
                      </form>
                    </div>

                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* GAMIFICATION TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Gamification' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Score stats overview banner */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Points / Balance</span>
                      <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-gamification)' }}>{getCurrentEmployeeScore().points}</h3>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Earned XP</span>
                      <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-environmental)' }}>{getCurrentEmployeeScore().xp}</h3>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Challenges Completed</span>
                      <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-governance)' }}>{getCurrentEmployeeScore().challenges_completed}</h3>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CSR Completed</span>
                      <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-social)' }}>{getCurrentEmployeeScore().csr_completed}</h3>
                    </div>
                  </div>

                  {/* Leaderboard and active challenges grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 2.2fr', gap: '32px' }}>
                    
                    {/* Leaderboard */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>EcoSphere Leaderboard</h3>
                      <div className="table-wrapper">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Employee</th>
                              <th>XP</th>
                              <th>Challenges</th>
                              <th>CSR Activs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gamificationData.leaderboard?.map((emp, index) => (
                              <tr key={emp.employee_name} style={emp.employee_name === currentUser ? { backgroundColor: 'rgba(140, 99, 26, 0.05)' } : {}}>
                                <td className="font-mono" style={{ fontWeight: 'bold' }}>{index + 1}</td>
                                <td style={{ fontWeight: '600' }}>
                                  {emp.employee_name}
                                  {emp.employee_name === currentUser && <span style={{ fontSize: '10px', color: 'var(--accent-gamification)', marginLeft: '8px' }}>(You)</span>}
                                </td>
                                <td className="font-mono" style={{ fontWeight: 'bold', color: 'var(--accent-environmental)' }}>{emp.xp}</td>
                                <td className="font-mono">{emp.challenges_completed}</td>
                                <td className="font-mono">{emp.csr_completed}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Challenges Panel */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)' }}>Active Sustainability Challenges</h3>
                      
                      {/* Active challenges list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                        {gamificationData.challenges?.map(c => {
                          const part = gamificationData.participations?.find(p => p.challenge_id === c.id && p.employee_name === currentUser);
                          return (
                            <div key={c.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                              <div className="flex-between" style={{ marginBottom: '8px' }}>
                                <h4 className="font-display" style={{ fontSize: '15px', color: 'var(--bg-evergreen)' }}>{c.title}</h4>
                                <span className="tag tag-gamification">{c.difficulty} ({c.xp} XP)</span>
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{c.description}</p>
                              
                              {/* Action buttons */}
                              {!part ? (
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleJoinChallenge(c.id)}>Join Challenge</button>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div className="flex-between" style={{ fontSize: '12px' }}>
                                    <span>Challenge Progress:</span>
                                    <strong className="font-mono">{part.progress}% ({part.approval_status})</strong>
                                  </div>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input 
                                      type="range" 
                                      min="0" max="100" 
                                      style={{ flex: 1, accentColor: 'var(--accent-gamification)' }}
                                      value={challengeProgressVal[part.id] !== undefined ? challengeProgressVal[part.id] : part.progress}
                                      disabled={part.approval_status === 'Approved' || part.approval_status === 'Under Review'}
                                      onChange={(e) => setChallengeProgressVal({ ...challengeProgressVal, [part.id]: e.target.value })}
                                    />
                                    {part.approval_status !== 'Approved' && part.approval_status !== 'Under Review' && (
                                      <button 
                                        className="btn btn-accent" 
                                        style={{ padding: '4px 10px', fontSize: '11px' }}
                                        onClick={() => handleUpdateChallengeProgress(part.id, challengeProgressVal[part.id] || part.progress)}
                                      >
                                        Update
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Admin Pending Challenge Completions Check */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <h4 className="font-display" style={{ fontSize: '14px', color: 'var(--bg-evergreen)', marginBottom: '10px' }}>Admin Verifications Drawer</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {gamificationData.participations?.filter(p => p.approval_status === 'Under Review').map(part => (
                            <div key={part.id} className="flex-between" style={{ padding: '10px', backgroundColor: '#fcfcfb', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px' }}>
                              <div>
                                <strong>{part.employee_name}</strong> completed <strong>{part.challenge_title}</strong>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-accent" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleApproveChallenge(part.id, 'Approved')}>Approve</button>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: '#d9383a', borderColor: '#eecaca' }} onClick={() => handleApproveChallenge(part.id, 'Rejected')}>Reject</button>
                              </div>
                            </div>
                          ))}
                          {gamificationData.participations?.filter(p => p.approval_status === 'Under Review').length === 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>No challenge review files pending.</div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Badges and Rewards shop */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: '32px' }}>
                    
                    {/* Badge Showcase */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Employee Badges Shelf</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', justifyItems: 'center' }}>
                        {gamificationData.badges?.map(badge => {
                          const isEarned = gamificationData.participations || true; // Check if current user earned
                          // Join query badge ids
                          const isUserEarned = gamificationData.leaderboard.find(e=>e.employee_name === currentUser) && 
                            (
                              // Mocking badge earnings based on thresholds to display on client
                              (badge.name === 'Carbon Sentinel' && getCurrentEmployeeScore().challenges_completed >= 3) ||
                              (badge.name === 'Eco Pioneer' && getCurrentEmployeeScore().xp >= 100) ||
                              (badge.name === 'Compliance Guardian' && governanceData.acknowledgements?.filter(a=>a.employee_name === currentUser).length >= 3)
                            );
                          
                          return (
                            <div key={badge.id} style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              textAlign: 'center',
                              opacity: isUserEarned ? 1 : 0.25,
                              filter: isUserEarned ? 'none' : 'grayscale(100%)',
                              transition: 'all 0.3s ease'
                            }}>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-gamification)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyOffset: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '24px',
                                marginBottom: '8px',
                                boxShadow: isUserEarned ? '0 4px 8px rgba(140,99,26,0.3)' : 'none'
                              }}>
                                🏅
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--bg-evergreen)' }}>{badge.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>{badge.description}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reward catalog store */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Redeemable Rewards Catalog</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {gamificationData.rewards?.map(reward => {
                          const score = getCurrentEmployeeScore();
                          const canAfford = score.points >= reward.points_required;
                          const hasStock = reward.stock > 0;
                          return (
                            <div key={reward.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fcfcfb' }}>
                              <div>
                                <div className="flex-between">
                                  <h4 className="font-display" style={{ fontSize: '15px', color: 'var(--bg-evergreen)' }}>{reward.name}</h4>
                                  <span className="font-mono" style={{ fontWeight: 'bold', color: 'var(--accent-gamification)' }}>{reward.points_required} Points</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 12px 0', lineHeight: '1.4' }}>{reward.description}</p>
                              </div>
                              <div className="flex-between" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock: <strong className="font-mono">{reward.stock}</strong> units</span>
                                <button 
                                  className="btn btn-accent" 
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  disabled={!canAfford || !hasStock}
                                  onClick={() => handleRedeemReward(reward.id)}
                                >
                                  Redeem
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* CUSTOM REPORT BUILDER TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Filters Form */}
                  <div className="card">
                    <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Observatory Custom Report Builder</h3>
                    <form onSubmit={handleGenerateReport} className="grid-4" style={{ alignItems: 'flex-end' }}>
                      
                      <div className="form-group">
                        <label className="form-label">REPORT MODULE</label>
                        <select 
                          className="form-select"
                          value={reportFilters.module}
                          onChange={(e) => setReportFilters({ ...reportFilters, module: e.target.value })}
                        >
                          <option value="Environmental">Environmental (Carbon Ledger)</option>
                          <option value="Social">Social (CSR Activity Logs)</option>
                          <option value="Governance">Governance (Violations & Audits)</option>
                          <option value="ESG Summary">ESG Executive Summary Report</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">DEPARTMENT FILTER</label>
                        <select 
                          className="form-select"
                          value={reportFilters.department}
                          onChange={(e) => setReportFilters({ ...reportFilters, department: e.target.value })}
                        >
                          <option value="">All Departments</option>
                          <option value="ENG">Engineering (ENG)</option>
                          <option value="OPS">Operations (OPS)</option>
                          <option value="HR">Human Resources (HR)</option>
                          <option value="MKT">Sales & Marketing (MKT)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">START DATE</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={reportFilters.startDate}
                          onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">END DATE</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={reportFilters.endDate}
                          onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">EMPLOYEE NAME</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Filter by employee"
                          value={reportFilters.employee}
                          onChange={(e) => setReportFilters({ ...reportFilters, employee: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">CHALLENGE TITLE</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Filter by challenge"
                          value={reportFilters.challenge}
                          onChange={(e) => setReportFilters({ ...reportFilters, challenge: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">CATEGORY / CSR ACTIVITY</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Filter by category"
                          value={reportFilters.category}
                          onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={generatingReport}>
                          {generatingReport ? 'Compiling...' : 'Generate'}
                        </button>
                      </div>

                    </form>
                  </div>

                  {/* Generated Report Sheet */}
                  {reportData.reportData && Object.keys(reportData.reportData).length > 0 && (
                    <div className="card" style={{ backgroundColor: 'white' }}>
                      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div>
                          <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--bg-evergreen)' }}>EcoSphere Audit Sheet</h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Generated on {new Date().toLocaleDateString()} • Module: {reportFilters.module}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button className="btn btn-secondary" onClick={handleExportCSV}>CSV Export</button>
                          <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
                        </div>
                      </div>

                      {/* Environmental Data Sheet */}
                      {reportFilters.module === 'Environmental' && reportData.reportData.environmental && (
                        <div className="table-wrapper">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Transaction Date</th>
                                <th>Department</th>
                                <th>Category</th>
                                <th>Usage Amount</th>
                                <th>Factor Used</th>
                                <th>Calculated Footprint</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.reportData.environmental.map(r => (
                                <tr key={r.id}>
                                  <td className="font-mono">{new Date(r.transaction_date).toLocaleDateString()}</td>
                                  <td>{r.department_name} ({r.department_code})</td>
                                  <td><span className="tag tag-environmental">{r.source_type}</span></td>
                                  <td className="font-mono">{r.source_amount}</td>
                                  <td>{r.emission_factor_name || 'Manual'} ({r.factor_value || '-'})</td>
                                  <td className="font-mono" style={{ fontWeight: 'bold' }}>{r.calculated_emissions} kg CO2e</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Social Data Sheet */}
                      {reportFilters.module === 'Social' && reportData.reportData.social && (
                        <div className="table-wrapper">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Completion Date</th>
                                <th>Employee</th>
                                <th>Activity / Category</th>
                                <th>Approval Status</th>
                                <th>Points Distributed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.reportData.social.map(r => (
                                <tr key={r.id}>
                                  <td className="font-mono">{r.completion_date ? new Date(r.completion_date).toLocaleDateString() : 'Pending'}</td>
                                  <td style={{ fontWeight: '600' }}>{r.employee_name}</td>
                                  <td>
                                    {r.activity_title}
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Category: {r.category_name || 'Uncategorized'}</div>
                                  </td>
                                  <td><span className="tag tag-social">{r.approval_status}</span></td>
                                  <td className="font-mono" style={{ fontWeight: 'bold' }}>{r.points_earned} Points</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Governance Data Sheet */}
                      {reportFilters.module === 'Governance' && reportData.reportData.governance && (
                        <div className="table-wrapper">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Violation Issue ID</th>
                                <th>Audit Context</th>
                                <th>Description</th>
                                <th>Department</th>
                                <th>Assigned Owner</th>
                                <th>Due Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.reportData.governance.map(r => (
                                <tr key={r.id}>
                                  <td className="font-mono">#{r.id}</td>
                                  <td>{r.audit_title}</td>
                                  <td style={{ fontSize: '13px' }}>{r.description}</td>
                                  <td>{r.department_name} ({r.department_code})</td>
                                  <td style={{ fontWeight: '600' }}>{r.owner}</td>
                                  <td className="font-mono">{new Date(r.due_date).toLocaleDateString()}</td>
                                  <td><span className="tag tag-governance">{r.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* ESG Summary Executive Sheet */}
                      {reportFilters.module === 'ESG Summary' && reportData.reportData.summaryStats && (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scope 1 & 2 Emissions Total</span>
                              <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-environmental)', marginTop: '4px' }}>
                                {reportData.reportData.summaryStats.totalCarbonFootprintKg} kg CO2e
                              </h3>
                            </div>
                            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Compliance Violation Issues</span>
                              <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-governance)', marginTop: '4px' }}>
                                {reportData.reportData.summaryStats.openComplianceIssues} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Open / {reportData.reportData.summaryStats.totalComplianceIssues} Total</span>
                              </h3>
                            </div>
                            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CSR Activity Participations</span>
                              <h3 className="font-display font-mono" style={{ fontSize: '28px', color: 'var(--accent-social)', marginTop: '4px' }}>
                                {reportData.reportData.summaryStats.approvedCsrActivities} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Approved completions</span>
                              </h3>
                            </div>
                          </div>

                          <h4 className="font-display" style={{ fontSize: '16px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Supporting Transactional Logs</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                              <strong style={{ fontSize: '13px' }}>Environmental Transactions Summary:</strong>
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> {reportData.reportData.environmental?.length} transactions loaded.</span>
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px' }}>Social CSR Activities Approved:</strong>
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> {reportData.reportData.social?.filter(p => p.approval_status === 'Approved').length} completed CSR activities.</span>
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px' }}>Governance Compliance Audits:</strong>
                              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}> {reportData.reportData.governance?.length} flagged compliance issues.</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Empty state */}
                  {(!reportData.reportData || Object.keys(reportData.reportData).length === 0) && (
                    <div className="card" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Select criteria above and click <strong>Generate</strong> to compile audit data sheet.
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SETTINGS TAB */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'Settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: '32px' }}>
                    
                    {/* Settings Form */}
                    <div className="card">
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)', marginBottom: '16px' }}>Configure Business Rules</h3>
                      <form onSubmit={handleSaveSettings}>
                        
                        <h4 className="font-display" style={{ fontSize: '14px', color: 'var(--bg-evergreen)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Pillar Weighting (%)</h4>
                        
                        <div className="form-group">
                          <label className="form-label">ENVIRONMENTAL WEIGHT (%)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={settingsForm.weight_environmental}
                            onChange={(e) => setSettingsForm({ ...settingsForm, weight_environmental: Number(e.target.value) })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">SOCIAL WEIGHT (%)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={settingsForm.weight_social}
                            onChange={(e) => setSettingsForm({ ...settingsForm, weight_social: Number(e.target.value) })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">GOVERNANCE WEIGHT (%)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={settingsForm.weight_governance}
                            onChange={(e) => setSettingsForm({ ...settingsForm, weight_governance: Number(e.target.value) })}
                          />
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: (Number(settingsForm.weight_environmental) + Number(settingsForm.weight_social) + Number(settingsForm.weight_governance) === 100) ? 'var(--accent-environmental)' : '#d9383a',
                          fontWeight: 'bold',
                          marginBottom: '16px'
                        }}>
                          Current Weight Sum: {Number(settingsForm.weight_environmental) + Number(settingsForm.weight_social) + Number(settingsForm.weight_governance)}% (Must equal 100%)
                        </div>

                        <h4 className="font-display" style={{ fontSize: '14px', color: 'var(--bg-evergreen)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '24px' }}>Automation Switches</h4>
                        
                        <div className="form-group switch-container" style={{ margin: '12px 0' }}>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={settingsForm.auto_emission_calculation}
                              onChange={(e) => setSettingsForm({ ...settingsForm, auto_emission_calculation: e.target.checked })}
                            />
                            <span className="slider" />
                          </label>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600' }}>Auto Emission Calculation</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically convert fuel/electric usage using standard factors</div>
                          </div>
                        </div>

                        <div className="form-group switch-container" style={{ margin: '12px 0' }}>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={settingsForm.evidence_requirement}
                              onChange={(e) => setSettingsForm({ ...settingsForm, evidence_requirement: e.target.checked })}
                            />
                            <span className="slider" />
                          </label>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600' }}>Evidence Upload Constraint</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Block CSR submittal if proof files or detailed description is missing</div>
                          </div>
                        </div>

                        <div className="form-group switch-container" style={{ margin: '12px 0' }}>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={settingsForm.badge_auto_award}
                              onChange={(e) => setSettingsForm({ ...settingsForm, badge_auto_award: e.target.checked })}
                            />
                            <span className="slider" />
                          </label>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600' }}>Badge Auto-Award</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan and award achievement badges immediately on XP milestone unlocks</div>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>Save System Configurations</button>
                      </form>
                    </div>

                    {/* Explanatory Panel */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--bg-evergreen)' }}>EcoSphere System Observatory Details</h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        This interface permits security managers and administrators to modify global ESG rules in real-time. When configurations are saved:
                      </p>
                      <ul style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li>The system connects to the local PostgreSQL database instances.</li>
                        <li>An atomic update writes configuration values.</li>
                        <li>Overall ESG scores for all departments are recalculated instantly using the newly assigned weight balances.</li>
                        <li>A background job refreshes the **Living Orb** view, triggering a re-render showing the revised score averages.</li>
                      </ul>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
