/* ==========================================================================
   Kheian Roldan Portfolio & Resume Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAccentPalette();
  initAudioEngine();
  initParticleCanvas();
  initAvatarUploader();
  initViewSwitcher();
  initCopyButtons();
  initContactForm();
  initCertModal();
  initProjectSystem();
  initSecuritySandbox();
  initScrollSpy();
  initMobileMenu();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('folio_theme') || 'dark';

  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      playSound('click');
      const currentTheme = document.body.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.setAttribute('data-theme', nextTheme);
      localStorage.setItem('folio_theme', nextTheme);
      
      showToast(`Switched to ${nextTheme.toUpperCase()} mode`);
    });
  }
}

/* --------------------------------------------------------------------------
   2. Accent Color Palette Switcher
   -------------------------------------------------------------------------- */
function initAccentPalette() {
  const menuBtn = document.getElementById('accent-menu-btn');
  const dropdown = document.getElementById('accent-dropdown');
  const dots = document.querySelectorAll('.palette-dot');
  
  const savedAccent = localStorage.getItem('folio_accent') || 'indigo';
  document.body.setAttribute('data-accent', savedAccent);

  dots.forEach(dot => {
    if (dot.getAttribute('data-color') === savedAccent) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('pop');
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== menuBtn) {
        dropdown.classList.remove('show');
      }
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      document.body.setAttribute('data-accent', color);
      localStorage.setItem('folio_accent', color);

      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      dropdown.classList.remove('show');

      playSound('success');
      showToast(`Accent changed to ${color.toUpperCase()}`);
    });
  });
}

/* --------------------------------------------------------------------------
   3. Web Audio API Synthesizer (UI Micro-Sounds)
   -------------------------------------------------------------------------- */
let audioCtx = null;
let soundEnabled = true;

function initAudioEngine() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const iconOn = soundBtn ? soundBtn.querySelector('.icon-sound-on') : null;
  const iconOff = soundBtn ? soundBtn.querySelector('.icon-sound-off') : null;

  const savedSound = localStorage.getItem('folio_sound');
  if (savedSound === 'off') {
    soundEnabled = false;
    if (iconOn) iconOn.style.display = 'none';
    if (iconOff) iconOff.style.display = 'inline-block';
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('folio_sound', soundEnabled ? 'on' : 'off');

      if (iconOn && iconOff) {
        iconOn.style.display = soundEnabled ? 'inline-block' : 'none';
        iconOff.style.display = soundEnabled ? 'none' : 'inline-block';
      }

      if (soundEnabled) {
        playSound('success');
        showToast('Sound Effects Enabled');
      } else {
        showToast('Sound Effects Muted');
      }
    });
  }
}

function playSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'warn') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (err) {
    // AudioContext blocked by browser policy until gesture
  }
}

/* --------------------------------------------------------------------------
   4. Particle Constellation Canvas
   -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let particles = [];
  const particleCount = Math.min(Math.floor(window.innerWidth / 28), 40);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 1.8 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.16 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* --------------------------------------------------------------------------
   5. Custom Photo Uploader Engine (with localStorage Persistence)
   -------------------------------------------------------------------------- */
function initAvatarUploader() {
  const changeBtn = document.getElementById('change-photo-btn');
  const modal = document.getElementById('upload-avatar-modal');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('avatar-file-input');

  const savedAvatar = localStorage.getItem('folio_custom_avatar');
  if (savedAvatar) {
    applyAvatar(savedAvatar);
  }

  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      playSound('pop');
      if (modal) modal.classList.add('modal-open');
    });
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedImage(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        processUploadedImage(fileInput.files[0]);
      }
    });
  }
}

function processUploadedImage(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload a valid image file');
    playSound('warn');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Img = e.target.result;
    applyAvatar(base64Img);
    try {
      localStorage.setItem('folio_custom_avatar', base64Img);
    } catch (err) {
      console.warn('Image too large for localStorage, applied in session.');
    }
    playSound('success');
    showToast('Profile photo updated successfully!');
    closeAvatarModal();
  };
  reader.readAsDataURL(file);
}

function applyAvatar(src) {
  document.querySelectorAll('.user-avatar-sync').forEach(img => {
    img.src = src;
  });
}

function resetDefaultAvatar() {
  localStorage.removeItem('folio_custom_avatar');
  applyAvatar('assets/avatar.jpg');
  playSound('click');
  showToast('Reset to default photo');
  closeAvatarModal();
}

function closeAvatarModal() {
  const modal = document.getElementById('upload-avatar-modal');
  if (modal) modal.classList.remove('modal-open');
}

/* --------------------------------------------------------------------------
   6. View Switcher (Interactive Portfolio vs Classic Printable Resume View)
   -------------------------------------------------------------------------- */
function initViewSwitcher() {
  const toggleBtn = document.getElementById('toggle-resume-view-btn');
  const switchToDocBtn = document.getElementById('switch-to-doc-btn');
  const exitDocBtn = document.getElementById('exit-resume-mode-btn');
  const portfolioView = document.getElementById('portfolio-view');
  const resumeDocView = document.getElementById('resume-document-view');

  function showResumeDoc() {
    playSound('pop');
    portfolioView.style.display = 'none';
    resumeDocView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Switched to Classic Document View');
  }

  function showPortfolio() {
    playSound('pop');
    portfolioView.style.display = 'block';
    resumeDocView.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Switched to Interactive Portfolio');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (portfolioView.style.display === 'none') {
        showPortfolio();
      } else {
        showResumeDoc();
      }
    });
  }

  if (switchToDocBtn) switchToDocBtn.addEventListener('click', showResumeDoc);
  if (exitDocBtn) exitDocBtn.addEventListener('click', showPortfolio);
}

/* --------------------------------------------------------------------------
   7. Copy to Clipboard Utility
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const heroCopyEmailBtn = document.getElementById('copy-email-btn');
  if (heroCopyEmailBtn) {
    heroCopyEmailBtn.addEventListener('click', () => {
      const email = heroCopyEmailBtn.getAttribute('data-email') || 'kheianroldan1@gmail.com';
      copyText(email, 'Email address copied to clipboard!');
    });
  }
}

function copyText(text, successMsg = 'Copied to clipboard!') {
  playSound('click');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      playSound('success');
      showToast(successMsg);
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    playSound('success');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textArea);
}

/* --------------------------------------------------------------------------
   8. Certificate Details Modal
   -------------------------------------------------------------------------- */
function initCertModal() {
  const modal = document.getElementById('cert-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeCertModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCertModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertModal();
  });
}

function openCertModal(title, description, credentialId = 'CS-VERIFIED-01') {
  playSound('pop');
  const modal = document.getElementById('cert-modal');
  const titleEl = document.getElementById('modal-cert-title');
  const descEl = document.getElementById('modal-cert-desc');
  const idEl = document.getElementById('modal-cert-id');

  if (modal && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = description;
    if (idEl) idEl.textContent = `Credential ID: ${credentialId}`;
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCertModal() {
  playSound('click');
  const modal = document.getElementById('cert-modal');
  if (modal) {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

/* --------------------------------------------------------------------------
   9. Projects Filter System & Modal Showcase
   -------------------------------------------------------------------------- */
const projectsData = {
  'student-portal': {
    title: 'Student Information & Academic Portal Architecture',
    category: 'Systems Analysis & UI Design',
    desc: 'An end-to-end conceptual model for an academic portal that handles student records, enrollment schedules, course units, and faculty grade submissions.',
    highlights: [
      'Engineered complete Entity-Relationship Diagram (ERD) using DRAW.IO.',
      'Designed high-fidelity user interface wireframes in VS Code.',
      'Modeled data flow and permission levels for Students, Teachers, and Admin roles.'
    ],
    tools: ['DRAW.IO', 'Visual Studio Code', 'Systems Analysis', 'ERD Modeling']
  },
  'phishing-lab': {
    title: 'Phishing Threat Detection & Analysis Sandbox',
    category: 'Cybersecurity & Web Application',
    desc: 'An interactive web security simulator applying concepts from Cybersecurity Awareness: Phishing Attacks and Foundations certifications to identify indicators of social engineering.',
    highlights: [
      'Interactive email header and domain spoofing inspection.',
      'Real-time scoring and defensive advice for student security awareness.',
      'Demonstrates practical application of CIA triad and threat prevention.'
    ],
    tools: ['Cybersecurity Concepts', 'JavaScript', 'HTML5', 'CSS3']
  },
  'portfolio-engine': {
    title: 'Adaptive Dual-Mode Portfolio & Resume Web Engine',
    category: 'Full-Stack Web Design & Development',
    desc: 'A modern, responsive portfolio application with dual viewports, interactive particle canvas background, custom photo uploaders, and seamless print-to-PDF export.',
    highlights: [
      'Fully responsive CSS grid and flexbox layout.',
      'Dynamic accent palette customizer and Web Audio feedback engine.',
      'Print stylesheet configured for flawless physical and PDF resume exports.'
    ],
    tools: ['Visual Studio Code', 'Antigravity AI', 'CSS Grid', 'Canvas API']
  }
};

function initProjectSystem() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function openProjectModal(projectId) {
  const project = projectsData[projectId];
  if (!project) return;

  playSound('pop');
  const modal = document.getElementById('project-modal');
  const titleEl = document.getElementById('project-modal-title');
  const subtitleEl = document.getElementById('project-modal-subtitle');
  const descEl = document.getElementById('project-modal-desc');
  const detailsEl = document.getElementById('project-modal-details');

  if (modal && titleEl && subtitleEl && descEl && detailsEl) {
    titleEl.textContent = project.title;
    subtitleEl.textContent = project.category;
    descEl.textContent = project.desc;

    let detailsHTML = '<h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--text-primary);">Key Architectural Highlights:</h4><ul style="list-style: disc; padding-left: 1.2rem; margin-bottom: 1.2rem; color: var(--text-secondary); font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.4rem;">';
    project.highlights.forEach(h => {
      detailsHTML += `<li>${h}</li>`;
    });
    detailsHTML += '</ul>';

    detailsHTML += '<h4 style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--text-primary);">Technologies & Tools Utilized:</h4><div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">';
    project.tools.forEach(t => {
      detailsHTML += `<span class="tech-pill" style="color: var(--accent-primary); font-weight: 600;">${t}</span>`;
    });
    detailsHTML += '</div>';

    detailsEl.innerHTML = detailsHTML;
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeProjectModal() {
  playSound('click');
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

/* --------------------------------------------------------------------------
   10. Interactive Cybersecurity Phishing Sandbox Engine
   -------------------------------------------------------------------------- */
const sandboxEmails = [
  {
    id: 0,
    from: "Security-Alert <it-service@chmsu-portal-verify.com>",
    sub: "Action Required: Immediate Password Reset",
    recipient: "kheianroldan1@gmail.com",
    body: `<p>Dear Student,</p><p>Your university account security credentials will expire in 2 hours. If you do not verify your student password immediately, your access to enrollment and grades will be suspended permanently.</p><div class="mail-fake-link-box"><a href="#" class="fake-link" onclick="return false;">http://chmsu-portal-verify.com/login-reset?id=99281</a></div><p>Thank you,<br>IT University Support Department</p>`,
    type: "threat",
    explanation: "⚠️ <strong>Phishing Detected!</strong> Red Flags: Look at the domain 'chmsu-portal-verify.com' (spoofed non-edu domain), artificial sense of extreme urgency ('expire in 2 hours'), and generic threat of suspension."
  },
  {
    id: 1,
    from: "CHMSU Registrar <registrar@chmsu.edu.ph>",
    sub: "First Semester Class Schedule & Room Assignment",
    recipient: "kheianroldan1@gmail.com",
    body: `<p>Greetings Carlos Hilado Memorial State University Students,</p><p>Please be advised that the room assignments and finalized class schedules for the upcoming term have been posted on your official student portal.</p><p>You may view your timetable by logging into your official university portal using your standard credentials.</p><p>Warm regards,<br>Office of the University Registrar<br>Carlos Hilado Memorial State University</p>`,
    type: "safe",
    explanation: "✅ <strong>Legitimate Email!</strong> Indicators: Official '.edu.ph' institutional domain, no suspicious external URL links, no urgent threats, and official university signature."
  },
  {
    id: 2,
    from: "GCash Rewards Desk <reward-claim778@freemail-service.net>",
    sub: "Congratulations! You won ₱5,000 Student Allowance!",
    recipient: "kheianroldan1@gmail.com",
    body: `<p>Congratulations Kheian!</p><p>Your mobile number 09053493450 was randomly selected to receive a special ₱5,000 Student Grant subsidy reward! Claim within 10 minutes by entering your MPIN and OTP on our prize claim server.</p><div class="mail-fake-link-box"><a href="#" class="fake-link" onclick="return false;">http://gcash-claim-reward-prize.xyz/claim</a></div><p>GCash Promo Support</p>`,
    type: "threat",
    explanation: "⚠️ <strong>Phishing Detected!</strong> Red Flags: Public free mail sender ('freemail-service.net'), too-good-to-be-true prize offer, asking for sensitive MPIN/OTP credentials (never share OTPs!), and an unverified '.xyz' domain."
  }
];

let currentEmailIndex = 0;
let userAnswers = {};

function initSecuritySandbox() {
  const mailButtons = document.querySelectorAll('.inbox-item-btn');
  mailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      mailButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentEmailIndex = parseInt(btn.getAttribute('data-mail'), 10);
      loadEmail(currentEmailIndex);
    });
  });
}

function loadEmail(index) {
  const email = sandboxEmails[index];
  if (!email) return;

  document.getElementById('mail-view-from').textContent = email.from;
  document.getElementById('mail-view-sub').textContent = email.sub;
  document.getElementById('mail-view-body').innerHTML = email.body;

  const feedbackBox = document.getElementById('decision-feedback');
  if (userAnswers[index] !== undefined) {
    displayFeedback(userAnswers[index] === email.type, email.explanation);
  } else {
    feedbackBox.style.display = 'none';
  }
}

function makeDecision(decision) {
  const email = sandboxEmails[currentEmailIndex];
  const isCorrect = (decision === email.type);
  userAnswers[currentEmailIndex] = decision;

  if (isCorrect) {
    playSound('success');
  } else {
    playSound('warn');
  }

  displayFeedback(isCorrect, email.explanation);
  updateSecurityScore();
}

function displayFeedback(isCorrect, explanation) {
  const feedbackBox = document.getElementById('decision-feedback');
  const iconEl = document.getElementById('feedback-icon');
  const textEl = document.getElementById('feedback-text');

  feedbackBox.style.display = 'flex';
  feedbackBox.className = `decision-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
  iconEl.innerHTML = isCorrect ? '<i class="fa-solid fa-circle-check" style="font-size: 1.4rem;"></i>' : '<i class="fa-solid fa-circle-xmark" style="font-size: 1.4rem;"></i>';
  textEl.innerHTML = `${isCorrect ? '<strong>Accurate Assessment!</strong> ' : '<strong>Incorrect Analysis!</strong> '}${explanation}`;
}

function updateSecurityScore() {
  let correctCount = 0;
  for (let idx in userAnswers) {
    if (userAnswers[idx] === sandboxEmails[idx].type) {
      correctCount++;
    }
  }

  const scoreEl = document.getElementById('security-score');
  if (scoreEl) {
    scoreEl.textContent = `${correctCount} / ${sandboxEmails.length} Verified`;
    if (correctCount === sandboxEmails.length) {
      showToast('🎉 Outstanding! You successfully identified all threats!');
    }
  }
}

/* --------------------------------------------------------------------------
   11. Interactive Contact Form Handler
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('success');
      
      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const subject = document.getElementById('sender-subject').value.trim();
      const message = document.getElementById('sender-message').value.trim();

      const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject} - from ${name}`);
      const mailtoBody = encodeURIComponent(`Hello Kheian,\n\n${message}\n\nFrom:\n${name}\nEmail: ${email}`);

      window.location.href = `mailto:kheianroldan1@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      showToast('Opening your default email client...');
      contactForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   12. Toast Notifications
   -------------------------------------------------------------------------- */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('toast-show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-show');
    }, 3000);
  }
}

/* --------------------------------------------------------------------------
   13. Scroll Spy & Active Nav Item
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links .nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   14. Mobile Drawer Menu Handler
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (mobileBtn && drawer) {
    mobileBtn.addEventListener('click', () => {
      playSound('pop');
      mobileBtn.classList.toggle('open');
      drawer.classList.toggle('open');
    });

    drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileBtn.classList.remove('open');
        drawer.classList.remove('open');
      });
    });
  }
}
