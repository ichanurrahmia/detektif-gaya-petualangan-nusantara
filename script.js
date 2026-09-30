const STORAGE_KEY = 'detektifGayaProgress';

const defaultState = {
  completed: {},
  story: {},
  reflection: '',
  localGameName: '',
  quiz: {
    level1: false,
    level2: false,
    level3: false,
  },
  festivalDone: false,
  finalBossDone: false,
  selectedSurface: 'keramik',
};

const state = loadState();
const screens = document.querySelectorAll('.screen');
const zoneData = [
  { id: 'zone1', title: '🧩 Zona 1 — Gaya di Sekitarku', target: 'screen-zone1' },
  { id: 'zone2', title: '💪 Zona 2 — Gaya Otot', target: 'screen-zone2' },
  { id: 'zone3', title: '🌎 Zona 3 — Gaya Gravitasi', target: 'screen-zone3' },
  { id: 'zone4', title: '🛞 Zona 4 — Gaya Gesek', target: 'screen-zone4' },
  { id: 'zone5', title: '🧲 Zona 5 — Gaya Magnet', target: 'screen-zone5' },
  { id: 'zone6', title: '🎮 Zona 6 — Festival Nusantara', target: 'screen-zone6' },
  { id: 'zone7', title: '🏆 Zona 7 — Final Boss', target: 'screen-zone7' },
];

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculateProgress() {
  const tasks = [
    'zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6', 'zone7',
    'story', 'reflection', 'quiz.level1', 'quiz.level2', 'quiz.level3'
  ];

  let count = 0;

  for (const key of tasks) {
    if (key === 'story' && state.story && Object.keys(state.story).length > 0) count++;
    else if (key === 'reflection' && state.reflection && state.reflection.trim().length > 0) count++;
    else if (key.includes('quiz.')) {
      const [group, item] = key.split('.');
      if (group === 'quiz' && state.quiz[item]) count++;
    } else if (state.completed[key]) count++;
  }

  const total = tasks.length;
  return Math.round((count / total) * 100);
}

function updateProgressUI() {
  const percent = calculateProgress();
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressText');
  const guruProgress = document.getElementById('guruProgress');
  const guruZones = document.getElementById('guruZones');
  const guruFestival = document.getElementById('guruFestival');

  if (bar) bar.style.width = percent + '%';
  if (text) text.textContent = percent + '%';
  if (guruProgress) guruProgress.textContent = percent + '%';
  if (guruZones) guruZones.textContent = `${countCompletedZones()}/${zoneData.length}`;
  if (guruFestival) guruFestival.textContent = state.festivalDone ? 'Selesai' : 'Belum';
}

function countCompletedZones() {
  return Object.keys(state.completed).filter((key) => state.completed[key]).length;
}

function showScreen(screenId) {
  screens.forEach((screen) => {
    const active = screen.id === screenId;
    screen.classList.toggle('active', active);
  });
}

function bindNavigation() {
  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (target) showScreen(target);
    });
  });
}

function bindCompleteZone() {
  document.querySelectorAll('[data-complete]').forEach((button) => {
    button.addEventListener('click', () => {
      const zoneKey = button.dataset.complete;
      state.completed[zoneKey] = true;
      saveState();
      updateProgressUI();
      renderZoneMap();
      const nextZoneIndex = zoneData.findIndex((zone) => zone.id === zoneKey);
      if (nextZoneIndex >= 0 && nextZoneIndex < zoneData.length - 1) {
        const nextTarget = zoneData[nextZoneIndex + 1].target;
        showScreen(nextTarget);
      } else {
        showScreen('screen-map');
      }
    });
  });
}

function renderZoneMap() {
  const zoneGrid = document.getElementById('zoneGrid');
  if (!zoneGrid) return;

  zoneGrid.innerHTML = zoneData.map((zone, index) => {
    const isCompleted = !!state.completed[zone.id];
    const isUnlocked = index === 0 || isCompleted || !!state.completed[zoneData[index - 1].id];
    const status = isCompleted ? 'completed' : isUnlocked ? 'available' : 'locked';

    return `
      <div class="zone-card ${status}">
        <div class="zone-badge">${isCompleted ? 'Selesai' : isUnlocked ? 'Tersedia' : 'Terkunci'}</div>
        <h3>${zone.title}</h3>
        <p>${isCompleted ? 'Selamat! Kamu sudah menuntaskan zona ini.' : isUnlocked ? 'Ayo eksplorasi gaya dalam kehidupan sehari-hari.' : 'Selesaikan zona sebelumnya untuk membukanya.'}</p>
        <button class="primary-btn zone-btn" data-zone-target="${zone.target}" ${!isUnlocked ? 'disabled' : ''}>${isCompleted ? 'Ulangi' : isUnlocked ? 'Masuk zona' : 'Kunci'}</button>
      </div>
    `;
  }).join('');

  zoneGrid.querySelectorAll('[data-zone-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.zoneTarget;
      if (btn.disabled) return;
      showScreen(target);
    });
  });
}

function bindTipButtons() {
  document.querySelectorAll('.tip-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const box = button.nextElementSibling;
      if (box) box.classList.add('visible');
      button.textContent = 'Jawaban terbuka';
    });
  });
}

function bindSurfaceExperiment() {
  const surfaceButtons = document.querySelectorAll('.surface-btn');
  const car = document.getElementById('carThing');
  const pushBtn = document.getElementById('pushCarBtn');
  const result = document.getElementById('experimentResult');

  const surfaceDistance = {
    keramik: 92,
    kain: 68,
    karpet: 42,
    pasir: 20,
  };

  surfaceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      surfaceButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      state.selectedSurface = button.dataset.surface;
      car.style.transform = 'translateX(0)';
      if (result) result.textContent = `Jarak tempuh: 0 cm`;
    });
  });

  if (pushBtn) {
    pushBtn.addEventListener('click', () => {
      const trackWidth = 520;
      const distance = surfaceDistance[state.selectedSurface] || 50;
      if (car) {
        const target = Math.min(trackWidth - 60, distance * 4);
        car.style.transform = `translateX(${target}px)`;
      }
      if (result) result.textContent = `Jarak tempuh: ${distance} cm`;
    });
  }
}

function bindMagnet() {
  const magnetSim = document.getElementById('magnetSim');
  const trigger = document.getElementById('magnetTrigger');
  const options = document.querySelectorAll('.magnet-option');

  options.forEach((button) => {
    button.addEventListener('click', () => {
      options.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  if (trigger) {
    trigger.addEventListener('click', () => {
      if (magnetSim) magnetSim.classList.toggle('magnet-active');
      trigger.textContent = magnetSim && magnetSim.classList.contains('magnet-active') ? 'Coba lagi' : 'Coba tarik';
    });
  }
}

function bindFestival() {
  document.querySelectorAll('.festival-area').forEach((area) => {
    area.addEventListener('click', () => {
      area.style.transform = 'scale(1.02)';
      area.style.borderColor = 'rgba(126, 190, 88, 0.7)';
      area.style.background = 'linear-gradient(180deg, #f2fff2, #f7fdf5)';
    });
  });
}

function bindStorySave() {
  const saveBtn = document.getElementById('saveStoryBtn');
  const storySaved = document.getElementById('storySaved');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const game = document.getElementById('storyGame')?.value || '';
      const area = document.getElementById('storyArea')?.value || '';
      const how = document.getElementById('storyHow')?.value || '';
      state.story = { game, area, how };
      saveState();
      updateProgressUI();
      if (storySaved) {
        storySaved.textContent = `Menarik! “${game || 'Permainan favorit'}” di ${area || 'daerahku'} sudah dicatat.`;
      }
    });
  }
}

function bindReflectionSave() {
  const saveBtn = document.getElementById('saveReflectionBtn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    const text = document.getElementById('reflectionText')?.value || '';
    state.reflection = text;
    saveState();
    updateProgressUI();
    alert('Refleksi kamu sudah tersimpan. Terima kasih, Detektif!');
  });
}

function bindQuiz() {
  document.querySelectorAll('.check-answer-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.dataset.answer;
      const target = button.dataset.target;
      const selected = document.querySelector(`input[name='q${target.replace('level', '')}']:checked`);
      const feedback = document.querySelector(`.quiz-feedback[data-feedback="${target}"]`);

      if (!selected) {
        if (feedback) feedback.textContent = 'Pilih salah satu jawaban terlebih dahulu.';
        return;
      }

      const isCorrect = selected.value === answer;
      if (feedback) {
        feedback.textContent = isCorrect ? 'Benar! Jawabanmu tepat.' : `Coba lagi! Jawaban yang benar adalah ${answer}.`;
        feedback.style.color = isCorrect ? '#0a7f3d' : '#ad1f35';
      }

      if (isCorrect) {
        state.quiz[target] = true;
        saveState();
        updateProgressUI();
      }
    });
  });
}

function initDefaults() {
  const zone1Name = document.getElementById('localGameName');
  const gravityThing = document.getElementById('gravityThing');

  if (zone1Name && state.localGameName) zone1Name.value = state.localGameName;
  if (gravityThing && state.gravityThing) gravityThing.value = state.gravityThing;

  const zone1Save = document.querySelector('[data-complete="zone1"]');
  if (zone1Save) {
    zone1Save.addEventListener('click', () => {
      const nameField = document.getElementById('localGameName');
      if (nameField) state.localGameName = nameField.value;
      saveState();
    });
  }

  const gravitySave = document.querySelector('[data-complete="zone3"]');
  if (gravitySave) {
    gravitySave.addEventListener('click', () => {
      const gravityField = document.getElementById('gravityThing');
      if (gravityField) state.gravityThing = gravityField.value;
      saveState();
    });
  }
}

function initialize() {
  bindNavigation();
  bindCompleteZone();
  renderZoneMap();
  bindTipButtons();
  bindSurfaceExperiment();
  bindMagnet();
  bindFestival();
  bindStorySave();
  bindReflectionSave();
  bindQuiz();
  initDefaults();
  updateProgressUI();
  showScreen('screen-home');
}

initialize();
