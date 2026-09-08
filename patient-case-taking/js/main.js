/**
 * CuraCase AI - Patient Case Taking Platform
 * Interactive JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initTheme();
  initMobileMenu();
  initCaseSimulator();
  initRoiCalculator();
  initSpecialtyTabs();
  initPricingToggle();
  initFaqAccordion();
  initDemoModal();
  initSmoothScroll();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
  
  // Check local storage or system preference
  const isDark = localStorage.getItem('curacase_theme') === 'dark' ||
    (!('curacase_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  function toggleTheme() {
    const currentIsDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('curacase_theme', currentIsDark ? 'dark' : 'light');
    if (window.lucide) window.lucide.createIcons();
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);
}

/* ==========================================================================
   2. Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  function openMenu() {
    drawer.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('opacity-0');
      drawer.querySelector('.drawer-panel').classList.remove('translate-x-full');
    }, 10);
  }

  function closeMenu() {
    drawer.classList.add('opacity-0');
    drawer.querySelector('.drawer-panel').classList.add('translate-x-full');
    setTimeout(() => {
      drawer.classList.add('hidden');
    }, 300);
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   3. Interactive Case Taking Simulator
   ========================================================================== */
const CASE_PRESETS = {
  general: {
    specialty: 'Internal Medicine / Cardiology',
    patient: 'John Miller, 54 Male (MRN: #CM-8921)',
    audioTranscript: `"Doctor, for the past 3 days I've been feeling a heavy tightness right in the center of my chest whenever I climb the stairs. It comes with a throbbing headache and slight shortness of breath. No radiation to the jaw, but I have a history of Type 2 Diabetes for 6 years and I often skip my Metformin. My father had a bypass at age 58."`,
    vitals: { bp: '148/92 mmHg', hr: '84 bpm', spo2: '98% on RA', temp: '98.4°F', bmi: '28.2 kg/m²' },
    chiefComplaint: 'Retrosternal chest tightness and exertional dyspnea × 3 days.',
    hpi: 'Patient reports progressive retrosternal pressure provoked by exertion (climbing stairs), lasting 5-10 minutes, relieved by rest. Associated with occipital headache. Denies diaphoresis, nausea, or radiation to arm/jaw.',
    pastHistory: 'Type 2 Diabetes Mellitus (6 yrs, suboptimal compliance), Essential Hypertension.',
    familyHistory: 'Father: Premature Coronary Artery Disease (CABG at 58 yrs).',
    icd10: [
      { code: 'I20.9', desc: 'Angina pectoris, unspecified' },
      { code: 'I10', desc: 'Essential (primary) hypertension' },
      { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' }
    ],
    differential: [
      { name: 'Stable Angina Pectoris / Coronary Ischemia', prob: 'High (82%)' },
      { name: 'Hypertensive Urgency / Exertional Strain', prob: 'Moderate (45%)' },
      { name: 'Gastroesophageal Reflux (Atypical)', prob: 'Low (15%)' }
    ],
    recommendedPlan: '12-lead ECG stat, high-sensitivity Troponin I, Fasting Lipid Profile & HbA1c. Sublingual Nitroglycerin PRN. Cardiology referral.'
  },
  pediatrics: {
    specialty: 'Pediatric Care',
    patient: 'Emma Watson, 4 Female (MRN: #PED-4029)',
    audioTranscript: `"Hi doctor, Emma developed a high fever yesterday spiking up to 102.4°F. She has clear nasal discharge, dry hacking cough at night, and refused breakfast today. She is drinking water and voiding normally. No rashes, no vomiting, and her immunizations are complete till 4 years."`,
    vitals: { bp: '96/60 mmHg', hr: '112 bpm', spo2: '99% on RA', temp: '102.1°F', weight: '16.2 kg' },
    chiefComplaint: 'Acute onset fever (102.4°F), rhinorrhea, and nocturnal dry cough × 48 hours.',
    hpi: '4-year-old female presents with acute upper respiratory symptoms. Fever responds partially to OTC acetaminophen. Activity level mildly decreased but alert and interactive. Oral hydration maintained.',
    pastHistory: 'Born full term, normal developmental milestones. No prior hospitalizations or asthma.',
    familyHistory: 'Older sibling (7 yrs) with viral coryza 4 days ago.',
    icd10: [
      { code: 'J06.9', desc: 'Acute upper respiratory infection, unspecified' },
      { code: 'R50.9', desc: 'Fever, unspecified' }
    ],
    differential: [
      { name: 'Acute Viral Upper Respiratory Infection (URI)', prob: 'High (92%)' },
      { name: 'Early Acute Otitis Media', prob: 'Low-Mod (25%)' },
      { name: 'Streptococcal Pharyngitis', prob: 'Low (10%)' }
    ],
    recommendedPlan: 'Weight-based Paracetamol (240mg q6h PRN fever >101°F), normal saline nasal drops, honey for nocturnal cough, red flag signs explained.'
  },
  homeopathy: {
    specialty: 'Homeopathy & Integrative Medicine',
    patient: 'Priya Sharma, 32 Female (MRN: #HOM-1108)',
    audioTranscript: `"Doctor, I have suffered from chronic right-sided throbbing migraines for 2 years. The pain triggers violently after sun exposure or prolonged mental stress. It starts around 10 AM, peaks at noon, and eases after sunset. Cold compresses and sitting quietly in a pitch-dark room give me relief. I crave salt and pickles intensely, don't feel thirsty, and get irritable if consoled."`,
    vitals: { bp: '118/76 mmHg', hr: '72 bpm', spo2: '99%', temp: '98.2°F', constitution: 'Warm-blooded, Thin build' },
    chiefComplaint: 'Right hemicranial throbbing headache aggravated by sun heat and stress × 2 years.',
    hpi: 'Periodicity: Aggravation 10 AM to 3 PM with sun intensity. Modalities: < Sun, mental exertion, noise, consolation. > Cold application, complete darkness, sleep. Associated with photophobia and nausea.',
    generals: 'Physical Generals: Intense craving for salt & spicy condiments. Thirstless. Thermals: Warm patient (intolerant to heat). Mind: Reserved, grief suppressed, aversion to consolation.',
    repertoryRubrics: [
      'HEAD - PAIN - Sun; from exposure to the',
      'HEAD - PAIN - Periodical - 10 a.m. to 3 p.m.',
      'GENERALS - FOOD and DRINKS - salt - desire',
      'MIND - CONSOLATION - agg.'
    ],
    icd10: [
      { code: 'G43.009', desc: 'Migraine without aura, not intractable' }
    ],
    differential: [
      { name: 'Natrum Muriaticum (Matches 4/4 keynotes)', prob: '96% Simillimum' },
      { name: 'Belladonna (Right-sided, throbbing, sun agg)', prob: '78% Match' },
      { name: 'Sanguinaria Canadensis (Sun periodicity)', prob: '65% Match' }
    ],
    recommendedPlan: 'Natrum Muriaticum 200C single dose in water, follow up after 21 days. Lifestyle: Blue-light blocking glasses, hydration.'
  },
  psychiatry: {
    specialty: 'Psychiatry & Behavioral Health',
    patient: 'David Chen, 29 Male (MRN: #PSY-7734)',
    audioTranscript: `"Over the last 6 weeks, I've had terrible sleep. I lie awake for 3 hours with racing thoughts about my software deadlines. I feel a constant knot in my stomach, chronic brain fog, and lost interest in my weekend cycling. I scored 14 on that GAD anxiety screener online."`,
    vitals: { bp: '130/84 mmHg', hr: '88 bpm', spo2: '99%', phq9: '12 (Moderate)', gad7: '14 (Moderate Anxiety)' },
    chiefComplaint: 'Initial insomnia, pervasive work-related anxiety, and anhedonia × 6 weeks.',
    hpi: 'Patient reports progressive occupational burnout triggering autonomic symptoms (epigastric tension, palpitations, muscle clenching). Sleep latency >180 mins. Denies suicidal ideation, psychosis, or substance abuse.',
    pastHistory: 'No prior psychiatric admissions. No thyroid disease.',
    familyHistory: 'Maternal aunt with generalized anxiety disorder.',
    icd10: [
      { code: 'F41.1', desc: 'Generalized anxiety disorder' },
      { code: 'G47.00', desc: 'Insomnia, unspecified' },
      { code: 'F32.A', desc: 'Depression, unspecified' }
    ],
    differential: [
      { name: 'Generalized Anxiety Disorder with Secondary Insomnia', prob: 'High (88%)' },
      { name: 'Adjustment Disorder with Anxious Mood', prob: 'Moderate (55%)' },
      { name: 'Major Depressive Episode (Single, Moderate)', prob: 'Low-Mod (35%)' }
    ],
    recommendedPlan: 'Cognitive Behavioral Therapy for Insomnia (CBT-I) referral. Sleep hygiene protocol. Escitalopram 5mg initial trial discussed. Review in 14 days.'
  }
};

let currentPresetKey = 'general';
let isSimulating = false;

function initCaseSimulator() {
  const presetBtns = document.querySelectorAll('.preset-btn');
  const recordBtn = document.getElementById('simulate-record-btn');
  const copyBtn = document.getElementById('copy-note-btn');
  const exportBtn = document.getElementById('export-note-btn');

  // Preset button click
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isSimulating) return;
      const key = btn.dataset.preset;
      currentPresetKey = key;

      // Update active button state
      presetBtns.forEach(b => {
        b.classList.remove('bg-teal-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-teal-600', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      renderPreset(key, false);
    });
  });

  // Simulate Voice Intake Button
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      if (isSimulating) return;
      runVoiceIntakeSimulation();
    });
  }

  // Copy Note Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const outputContainer = document.getElementById('simulator-structured-output');
      if (!outputContainer) return;
      
      const textToCopy = generateCleanNoteText(CASE_PRESETS[currentPresetKey]);
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Clinical case note copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Note ready for export.', 'info');
      });
    });
  }

  // Export Note Button
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast(`Exported Case File for ${CASE_PRESETS[currentPresetKey].patient} as PDF/FHIR Bundle`, 'success');
    });
  }

  // Initial render
  renderPreset('general', false);
}

function renderPreset(key, animated = false) {
  const data = CASE_PRESETS[key];
  if (!data) return;

  const patientBadge = document.getElementById('sim-patient-info');
  const transcriptEl = document.getElementById('sim-transcript-text');
  const specialtyBadge = document.getElementById('sim-specialty-badge');
  const chiefComplaintEl = document.getElementById('sim-chief-complaint');
  const hpiEl = document.getElementById('sim-hpi');
  const pastHistoryEl = document.getElementById('sim-past-history');
  const vitalsEl = document.getElementById('sim-vitals-container');
  const icdEl = document.getElementById('sim-icd-container');
  const ddxEl = document.getElementById('sim-ddx-container');
  const planEl = document.getElementById('sim-plan');
  const homeopathySection = document.getElementById('sim-homeopathy-specifics');

  if (patientBadge) patientBadge.textContent = data.patient;
  if (specialtyBadge) specialtyBadge.textContent = data.specialty;
  if (transcriptEl) transcriptEl.textContent = data.audioTranscript;
  if (chiefComplaintEl) chiefComplaintEl.textContent = data.chiefComplaint;
  if (hpiEl) hpiEl.textContent = data.hpi;
  if (pastHistoryEl) pastHistoryEl.textContent = data.pastHistory || data.generals || 'None reported';
  if (planEl) planEl.textContent = data.recommendedPlan;

  // Render Vitals
  if (vitalsEl) {
    vitalsEl.innerHTML = '';
    Object.entries(data.vitals).forEach(([k, v]) => {
      const pill = document.createElement('div');
      pill.className = 'px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 text-xs font-medium text-teal-800 dark:text-teal-300';
      pill.innerHTML = `<span class="uppercase text-[10px] text-teal-500 font-bold tracking-wider">${k}:</span> ${v}`;
      vitalsEl.appendChild(pill);
    });
  }

  // Render ICD-10 Codes
  if (icdEl) {
    icdEl.innerHTML = '';
    data.icd10.forEach(item => {
      const tag = document.createElement('div');
      tag.className = 'flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
      tag.innerHTML = `<span class="font-mono font-bold text-teal-600 dark:text-teal-400">${item.code}</span> <span class="text-slate-600 dark:text-slate-300 truncate ml-2">${item.desc}</span>`;
      icdEl.appendChild(tag);
    });
  }

  // Render Differentials / Repertory
  if (ddxEl) {
    ddxEl.innerHTML = '';
    data.differential.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800';
      row.innerHTML = `
        <span class="font-medium text-slate-800 dark:text-slate-200">${index + 1}. ${item.name}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${index === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">${item.prob}</span>
      `;
      ddxEl.appendChild(row);
    });
  }

  // Show/Hide Homeopathy Rubrics if relevant
  if (homeopathySection) {
    if (data.repertoryRubrics) {
      homeopathySection.classList.remove('hidden');
      const rubricsContainer = document.getElementById('sim-rubrics-container');
      if (rubricsContainer) {
        rubricsContainer.innerHTML = data.repertoryRubrics.map(r => `
          <div class="text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-1.5 rounded border border-purple-200 dark:border-purple-800/50">
            ✦ ${r}
          </div>
        `).join('');
      }
    } else {
      homeopathySection.classList.add('hidden');
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function runVoiceIntakeSimulation() {
  isSimulating = true;
  const data = CASE_PRESETS[currentPresetKey];
  const recordBtn = document.getElementById('simulate-record-btn');
  const recordStatus = document.getElementById('record-status-text');
  const waveform = document.getElementById('audio-waveform-container');
  const transcriptEl = document.getElementById('sim-transcript-text');
  const outputContainer = document.getElementById('simulator-structured-output');

  if (recordBtn) {
    recordBtn.disabled = true;
    recordBtn.classList.add('opacity-75');
  }

  if (waveform) waveform.classList.remove('audio-recording-inactive');
  if (recordStatus) recordStatus.textContent = 'Listening to ambient conversation & extracting clinical entities...';
  
  if (transcriptEl) transcriptEl.textContent = '';
  if (outputContainer) outputContainer.classList.add('opacity-50', 'pointer-events-none');

  let fullText = data.audioTranscript;
  let currentIndex = 0;

  const typingInterval = setInterval(() => {
    if (currentIndex < fullText.length) {
      currentIndex += 6;
      if (transcriptEl) transcriptEl.textContent = fullText.slice(0, currentIndex) + ' ▌';
    } else {
      clearInterval(typingInterval);
      if (transcriptEl) transcriptEl.textContent = fullText;
      if (waveform) waveform.classList.add('audio-recording-inactive');
      if (recordStatus) recordStatus.textContent = 'Intake complete • Structured SOAP notes compiled with 99.8% precision';
      
      setTimeout(() => {
        if (outputContainer) {
          outputContainer.classList.remove('opacity-50', 'pointer-events-none');
          outputContainer.classList.add('ring-2', 'ring-teal-500', 'transition-all');
          setTimeout(() => outputContainer.classList.remove('ring-2', 'ring-teal-500'), 1200);
        }
        renderPreset(currentPresetKey);
        if (recordBtn) {
          recordBtn.disabled = false;
          recordBtn.classList.remove('opacity-75');
        }
        isSimulating = false;
        showToast('Case analyzed & structured note generated successfully!', 'success');
      }, 500);
    }
  }, 35);
}

function generateCleanNoteText(data) {
  return `
=========================================
CURACASE AI - CLINICAL CASE RECORD
=========================================
PATIENT: ${data.patient}
SPECIALTY: ${data.specialty}
DATE: ${new Date().toLocaleDateString()}

[CHIEF COMPLAINT]
${data.chiefComplaint}

[HISTORY OF PRESENT ILLNESS (HPI)]
${data.hpi}

[VITALS]
${Object.entries(data.vitals).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ')}

[PAST MEDICAL & FAMILY HISTORY]
Past: ${data.pastHistory || 'None reported'}
Family: ${data.familyHistory || 'None reported'}
${data.generals ? `Generals: ${data.generals}` : ''}

[ICD-10 CODING]
${data.icd10.map(i => `${i.code} - ${i.desc}`).join('\n')}

[DIFFERENTIAL DIAGNOSES]
${data.differential.map(d => `${d.name} (${d.prob})`).join('\n')}

[RECOMMENDED CLINICAL PLAN]
${data.recommendedPlan}
=========================================
  `.trim();
}

/* ==========================================================================
   4. Interactive ROI & Practice Efficiency Calculator
   ========================================================================== */
function initRoiCalculator() {
  const doctorsSlider = document.getElementById('calc-doctors');
  const patientsSlider = document.getElementById('calc-patients');
  const timeSpentSlider = document.getElementById('calc-time');

  const doctorsVal = document.getElementById('calc-doctors-val');
  const patientsVal = document.getElementById('calc-patients-val');
  const timeVal = document.getElementById('calc-time-val');

  const outHoursMonth = document.getElementById('calc-out-hours');
  const outCapacity = document.getElementById('calc-out-capacity');
  const outRevenue = document.getElementById('calc-out-revenue');

  function calculate() {
    const doctors = parseInt(doctorsSlider.value, 10);
    const patientsPerDay = parseInt(patientsSlider.value, 10);
    const minsPerCase = parseInt(timeSpentSlider.value, 10);

    if (doctorsVal) doctorsVal.textContent = doctors === 1 ? '1 Clinician' : `${doctors} Clinicians`;
    if (patientsVal) patientsVal.textContent = `${patientsPerDay} Patients / day`;
    if (timeVal) timeVal.textContent = `${minsPerCase} Minutes / intake`;

    // Working days per month ~ 22
    // CuraCase reduces intake documentation time by ~ 70%
    const minsSavedPerCase = minsPerCase * 0.70;
    const totalMinutesSavedPerMonth = doctors * patientsPerDay * 22 * minsSavedPerCase;
    const totalHoursSavedPerMonth = Math.round(totalMinutesSavedPerMonth / 60);

    // Extra patient slots that can be seen with saved hours (assuming 20 min slot)
    const extraPatientsPerMonth = Math.round((totalHoursSavedPerMonth * 60) / 20);

    // Estimated revenue unlocked ($85 average net value per clinical hour freed)
    const annualRevenueUnlocked = Math.round(totalHoursSavedPerMonth * 12 * 85);

    if (outHoursMonth) outHoursMonth.textContent = `${totalHoursSavedPerMonth.toLocaleString()} hrs`;
    if (outCapacity) outCapacity.textContent = `+${extraPatientsPerMonth.toLocaleString()} patients`;
    if (outRevenue) outRevenue.textContent = `$${annualRevenueUnlocked.toLocaleString()}`;
  }

  if (doctorsSlider && patientsSlider && timeSpentSlider) {
    doctorsSlider.addEventListener('input', calculate);
    patientsSlider.addEventListener('input', calculate);
    timeSpentSlider.addEventListener('input', calculate);
    calculate();
  }
}

/* ==========================================================================
   5. Specialty Switcher & Template Explorer
   ========================================================================== */
function initSpecialtyTabs() {
  const tabButtons = document.querySelectorAll('.spec-tab-btn');
  const tabContents = document.querySelectorAll('.spec-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      tabButtons.forEach(b => {
        b.classList.remove('border-teal-600', 'text-teal-600', 'dark:text-teal-400', 'bg-teal-50/50', 'dark:bg-teal-950/30');
        b.classList.add('border-transparent', 'text-slate-600', 'dark:text-slate-400');
      });

      btn.classList.add('border-teal-600', 'text-teal-600', 'dark:text-teal-400', 'bg-teal-50/50', 'dark:bg-teal-950/30');
      btn.classList.remove('border-transparent', 'text-slate-600', 'dark:text-slate-400');

      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   6. Pricing Toggle (Monthly vs Annual)
   ========================================================================== */
function initPricingToggle() {
  const billingToggle = document.getElementById('billing-toggle');
  const priceStarter = document.getElementById('price-starter');
  const pricePro = document.getElementById('price-pro');
  const pricePeriodEls = document.querySelectorAll('.price-period');

  if (!billingToggle) return;

  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;

    if (isAnnual) {
      if (priceStarter) priceStarter.textContent = '$29';
      if (pricePro) pricePro.textContent = '$79';
      pricePeriodEls.forEach(el => el.textContent = '/ month (billed annually)');
    } else {
      if (priceStarter) priceStarter.textContent = '$39';
      if (pricePro) pricePro.textContent = '$99';
      pricePeriodEls.forEach(el => el.textContent = '/ month (billed monthly)');
    }
  });
}

/* ==========================================================================
   7. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answerEl = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!questionBtn || !answerEl) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = !answerEl.classList.contains('hidden');

      // Close all others
      faqItems.forEach(otherItem => {
        const otherAnswer = otherItem.querySelector('.faq-answer');
        const otherIcon = otherItem.querySelector('.faq-icon');
        if (otherAnswer && otherAnswer !== answerEl) {
          otherAnswer.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current
      if (isOpen) {
        answerEl.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        answerEl.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ==========================================================================
   8. Lead Capture & Demo Booking Modal
   ========================================================================== */
function initDemoModal() {
  const modal = document.getElementById('demo-modal');
  const openBtns = document.querySelectorAll('.open-demo-modal');
  const closeBtn = document.getElementById('close-demo-modal');
  const form = document.getElementById('demo-booking-form');
  const successState = document.getElementById('demo-success-state');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    // Reset form state after delay
    setTimeout(() => {
      if (form) {
        form.reset();
        form.classList.remove('hidden');
      }
      if (successState) successState.classList.add('hidden');
    }, 300);
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> Reserving Your Slot...';
      }

      setTimeout(() => {
        if (form) form.classList.add('hidden');
        if (successState) successState.classList.remove('hidden');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Request Custom Demo & 14-Day Pass';
        }
        showToast('VIP Demo scheduled! Check your inbox for access credentials.', 'success');
      }, 1000);
    });
  }
}

/* ==========================================================================
   9. Smooth Scroll & Utilities
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-teal-500',
    info: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-blue-500',
    error: 'bg-red-600 text-white border-red-700'
  };

  toast.className = `p-4 rounded-xl shadow-2xl border-l-4 ${bgColors[type] || bgColors.info} flex items-center gap-3 toast-animate text-sm font-medium`;
  toast.innerHTML = `
    <span class="text-base">${type === 'success' ? '✓' : 'ℹ'}</span>
    <div class="flex-1">${message}</div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

