// Giveaway Controller & 3D Cyclone Physics Engine
(function() {
  'use strict';

  // DOM Elements
  const bgLayer = document.getElementById('bgLayer');
  const stage = document.getElementById('stage');
  const cycloneContainer = document.getElementById('cycloneContainer');
  const centerCard = document.getElementById('centerCard');
  const participantsCount = document.getElementById('participantsCount');
  const handlesCountBadge = document.getElementById('handlesCountBadge');
  const btnStart = document.getElementById('btnStart');
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const winnerCard = document.getElementById('winnerCard');
  const winnerHandle = document.getElementById('winnerHandle');
  const runnerUp1 = document.getElementById('runnerUp1');
  const runnerUp2 = document.getElementById('runnerUp2');
  const btnRedraw = document.getElementById('btnRedraw');
  const btnCopy = document.getElementById('btnCopy');
  const btnSound = document.getElementById('btnSound');
  const soundIcon = document.getElementById('soundIcon');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnManage = document.getElementById('btnManage');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('drawer');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const handlesTextarea = document.getElementById('handlesTextarea');
  const drawerCount = document.getElementById('drawerCount');
  const btnSaveHandles = document.getElementById('btnSaveHandles');
  const btnResetHandles = document.getElementById('btnResetHandles');

  // State
  let allHandles = [];
  let defaultHandles = [];
  let activeHandles = [];
  let isRunning = false;
  let fireworks = null;
  let animFrameId = null;
  let cycloneParticles = [];
  let lastResults = null;

  // Initialize
  async function init() {
    const canvas = document.getElementById('fireworksCanvas');
    fireworks = new FireworksFX(canvas);

    btnStart.addEventListener('click', startGiveaway);
    btnRedraw.addEventListener('click', resetToReady);
    btnCopy.addEventListener('click', copyResults);
    btnSound.addEventListener('click', toggleSound);
    btnFullscreen.addEventListener('click', toggleFullscreen);
    btnManage.addEventListener('click', openDrawer);
    btnCloseDrawer.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);
    btnSaveHandles.addEventListener('click', saveHandlesFromDrawer);
    btnResetHandles.addEventListener('click', resetHandlesToDefault);
    handlesTextarea.addEventListener('input', updateDrawerCount);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    await loadHandles();

    // Check for test mode query parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'cyclone') {
      setTimeout(() => startGiveaway(), 300);
    } else if (urlParams.get('test') === 'finalists') {
      setTimeout(() => {
        centerCard.classList.add('hidden');
        isRunning = true;
        runAnimationLoop(performance.now());
        runFinalThree(['sample_winner', 'runner_up_1', 'runner_up_2']);
      }, 300);
    } else if (urlParams.get('test') === 'winner') {
      setTimeout(() => {
        centerCard.classList.add('hidden');
        revealGrandWinner(allHandles[0] || 'sample_winner', allHandles[1] || 'runner_up_1', allHandles[2] || 'runner_up_2');
      }, 300);
    }
  }

  // Load handles from data/handles.json or fallback
  async function loadHandles() {
    try {
      const resp = await fetch('data/handles.json');
      if (resp.ok) {
        const data = await resp.json();
        defaultHandles = (data.handles || []).map(cleanHandle).filter(Boolean);
      }
    } catch (e) {
      console.warn('Using local handles fallback...', e);
    }

    if (defaultHandles.length === 0 && window.INITIAL_HANDLES && Array.isArray(window.INITIAL_HANDLES)) {
      defaultHandles = window.INITIAL_HANDLES.map(cleanHandle).filter(Boolean);
    }

    const saved = localStorage.getItem('ig_giveaway_handles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allHandles = parsed;
        }
      } catch (e) {}
    }

    if (allHandles.length === 0) {
      allHandles = [...defaultHandles];
    }

    updateHandlesUI();
  }

  function cleanHandle(str) {
    if (!str) return '';
    return str.replace(/^@+/, '').trim().toLowerCase();
  }

  function updateHandlesUI() {
    const count = allHandles.length;
    participantsCount.textContent = count;
    handlesCountBadge.textContent = count;
    handlesTextarea.value = allHandles.map(h => `@${h}`).join('\n');
    drawerCount.textContent = count;
  }

  function toggleSound() {
    if (window.soundFX) {
      window.soundFX.init();
      const isMuted = window.soundFX.toggleMute();
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  function toggleFullscreen() {
    const doc = document;
    const docEl = document.documentElement;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement;

    if (!isFs) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  }

  function handleResize() {
    if (!stage || cycloneParticles.length === 0) return;
    const rect = stage.getBoundingClientRect();
    cycloneParticles.forEach(p => {
      if (p.phase === 'cyclone') {
        p.orbitRadiusX = Math.min(p.orbitRadiusX, rect.width * 0.44);
        p.orbitRadiusY = Math.min(p.orbitRadiusY, rect.height * 0.36);
      }
    });
  }

  function openDrawer() {
    handlesTextarea.value = allHandles.map(h => `@${h}`).join('\n');
    updateDrawerCount();
    drawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
  }

  function updateDrawerCount() {
    const lines = handlesTextarea.value.split('\n').map(cleanHandle).filter(Boolean);
    const unique = Array.from(new Set(lines));
    drawerCount.textContent = unique.length;
  }

  function saveHandlesFromDrawer() {
    const lines = handlesTextarea.value.split('\n').map(cleanHandle).filter(Boolean);
    const unique = Array.from(new Set(lines));
    if (unique.length === 0) {
      alert('Please enter at least one valid Instagram handle.');
      return;
    }
    allHandles = unique;
    localStorage.setItem('ig_giveaway_handles', JSON.stringify(allHandles));
    updateHandlesUI();
    closeDrawer();
  }

  function resetHandlesToDefault() {
    if (confirm('Reset handles to the original video extracted list?')) {
      localStorage.removeItem('ig_giveaway_handles');
      allHandles = [...defaultHandles];
      updateHandlesUI();
      closeDrawer();
    }
  }

  // START GIVEAWAY
  function startGiveaway() {
    if (isRunning || allHandles.length === 0) return;
    isRunning = true;

    if (window.soundFX) {
      window.soundFX.init();
      window.soundFX.playCycloneMusic();
    }

    document.body.classList.add('body-running');
    centerCard.classList.add('hidden');
    winnerCard.classList.remove('visible');
    fireworks.clear();

    const dockedPostBadge = document.getElementById('dockedPostBadge');
    if (dockedPostBadge) dockedPostBadge.classList.add('visible');

    // Check for Emily's shortlisted finalists
    const rawShortlist = (window.SHORTLISTED_FINALISTS && Array.isArray(window.SHORTLISTED_FINALISTS)) 
      ? window.SHORTLISTED_FINALISTS 
      : [];
    const shortlistSet = new Set(rawShortlist.map(h => h.toLowerCase().trim().replace(/^@/, '')));
    const hasShortlist = shortlistSet.size >= 3;

    // Shuffle
    activeHandles = [...allHandles].sort(() => Math.random() - 0.5);

    // Cloud of simultaneous names
    const maxVisual = Math.min(activeHandles.length, 450);
    let visualPool = [];
    if (hasShortlist) {
      // Ensure all shortlisted handles are guaranteed to be in the visual pool
      const shortlistedInActive = activeHandles.filter(h => shortlistSet.has(h.toLowerCase().trim().replace(/^@/, '')));
      const others = activeHandles.filter(h => !shortlistSet.has(h.toLowerCase().trim().replace(/^@/, '')));
      visualPool = [...shortlistedInActive, ...others.slice(0, Math.max(0, maxVisual - shortlistedInActive.length))];
    } else {
      visualPool = activeHandles.slice(0, maxVisual);
    }

    cycloneContainer.innerHTML = '';
    cycloneParticles = [];

    const rect = stage.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    visualPool.forEach((handle, i) => {
      const el = document.createElement('div');
      el.className = 'handle-badge';
      el.textContent = handle;

      // Color variation in badges
      if (i % 5 === 0) {
        el.style.borderColor = 'rgba(255, 200, 55, 0.7)';
        el.style.boxShadow = '0 0 10px rgba(255, 200, 55, 0.4)';
      } else if (i % 3 === 0) {
        el.style.borderColor = 'rgba(0, 98, 184, 0.7)';
        el.style.background = 'rgba(0, 46, 93, 0.9)';
      }

      cycloneContainer.appendChild(el);

      const angle = (Math.PI * 2 / visualPool.length) * i * 3.7;
      const spawnDist = Math.max(rect.width, rect.height) * 0.75 + Math.random() * 300;
      const startX = Math.cos(angle) * spawnDist;
      const startY = Math.sin(angle) * spawnDist;

      // Varied 3D vortex distribution (tornado funnel)
      const radiusX = 140 + Math.random() * (rect.width * 0.44);
      const radiusY = 70 + Math.random() * (rect.height * 0.36);
      const radiusZ = 200 + Math.random() * 400;

      cycloneParticles.push({
        handle,
        el,
        x: startX,
        y: startY,
        z: (Math.random() - 0.5) * 500,
        targetRadiusX: radiusX,
        targetRadiusY: radiusY,
        orbitRadiusX: radiusX,
        orbitRadiusY: radiusY,
        orbitRadiusZ: radiusZ,
        orbitAngle: angle,
        orbitSpeed: 0.02 + Math.random() * 0.035,
        verticalOffset: (Math.random() - 0.5) * 320,
        verticalPhase: Math.random() * Math.PI * 2,
        phase: 'flyin', // flyin -> cyclone -> finalist -> eliminating -> winner
        flyProgress: 0,
        opacity: 1,
        scale: 1
      });
    });

    statusPill.classList.add('active');
    statusText.textContent = `Gathering ${allHandles.length} participants into cyclone...`;

    const startTime = performance.now();
    runAnimationLoop(startTime);

    // Accelerate into full cyclone
    setTimeout(() => {
      statusText.textContent = `Vortex active: ${allHandles.length} contestants swirling!`;
      cycloneParticles.forEach(p => {
        p.phase = 'cyclone';
        p.orbitSpeed *= 1.5;
      });
      if (window.soundFX) window.soundFX.playWhoosh();
    }, 1500);

    // Elimination sequence starts at 3.5s
    setTimeout(() => {
      runEliminationSequence();
    }, 3600);
  }

  // Animation Loop
  function runAnimationLoop(startTime) {
    function frame(now) {
      if (!isRunning && cycloneParticles.length === 0) return;

      const elapsed = (now - startTime) / 1000;
      const rect = stage.getBoundingClientRect();

      for (let i = cycloneParticles.length - 1; i >= 0; i--) {
        const p = cycloneParticles[i];

        if (p.phase === 'flyin') {
          p.flyProgress += 0.03;
          if (p.flyProgress >= 1) {
            p.flyProgress = 1;
            p.phase = 'cyclone';
          }
          const curOrbitX = Math.cos(p.orbitAngle) * p.orbitRadiusX;
          const curOrbitY = Math.sin(p.orbitAngle) * p.orbitRadiusY * 0.45;
          p.x = p.x + (curOrbitX - p.x) * 0.08;
          p.y = p.y + (curOrbitY - p.y) * 0.08;
        } else if (p.phase === 'cyclone') {
          p.orbitAngle += p.orbitSpeed;
          p.x = Math.cos(p.orbitAngle) * p.orbitRadiusX;
          p.y = Math.sin(p.orbitAngle) * p.orbitRadiusY * 0.48 + Math.sin(elapsed * 2.2 + p.verticalPhase) * 24 + p.verticalOffset * 0.45;
          p.z = Math.sin(p.orbitAngle) * p.orbitRadiusZ;

          const fov = 850;
          const depthScale = fov / (fov + p.z);
          p.scale = Math.max(0.65, Math.min(1.25, depthScale));
          p.opacity = Math.max(0.3, Math.min(1.0, 0.5 + (p.z / (p.orbitRadiusZ * 2))));
        } else if (p.phase === 'finalist') {
          // Tight, illuminated center orbit for top 3 winners
          p.orbitAngle += 0.075; // fast energetic orbit
          p.orbitRadiusX += (260 - p.orbitRadiusX) * 0.08;
          p.orbitRadiusY += (120 - p.orbitRadiusY) * 0.08;
          p.orbitRadiusZ += (100 - p.orbitRadiusZ) * 0.08;

          p.x = Math.cos(p.orbitAngle) * p.orbitRadiusX;
          p.y = Math.sin(p.orbitAngle) * p.orbitRadiusY;
          p.z = Math.sin(p.orbitAngle) * p.orbitRadiusZ;
          p.scale = 1.25 + Math.sin(elapsed * 5) * 0.08;
          p.opacity = 1;
        } else if (p.phase === 'eliminating') {
          p.scale *= 0.93;
          p.opacity -= 0.06;
          p.x *= 1.05;
          p.y *= 1.05;

          if (p.opacity <= 0.01) {
            if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
            cycloneParticles.splice(i, 1);
            continue;
          }
        } else if (p.phase === 'winner') {
          p.x += (0 - p.x) * 0.12;
          p.y += (0 - p.y) * 0.12;
          p.z += (0 - p.z) * 0.12;
          p.opacity = 1;
          p.scale += (2.4 - p.scale) * 0.08;
        }

        const zIndex = Math.floor(p.z + 1000);
        p.el.style.transform = `translate(-50%, -50%) translate3d(${p.x}px, ${p.y}px, ${p.z}px) scale(${p.scale})`;
        p.el.style.opacity = p.opacity;
        p.el.style.zIndex = zIndex;
      }

      animFrameId = requestAnimationFrame(frame);
    }

    animFrameId = requestAnimationFrame(frame);
  }

  // Progressive elimination until 3 finalists remain
  function runEliminationSequence() {
    let pool = [...activeHandles];

    const rawShortlist = (window.SHORTLISTED_FINALISTS && Array.isArray(window.SHORTLISTED_FINALISTS)) 
      ? window.SHORTLISTED_FINALISTS 
      : [];
    const shortlistSet = new Set(rawShortlist.map(h => h.toLowerCase().trim().replace(/^@/, '')));
    const hasShortlist = shortlistSet.size >= 3;

    function stepElimination() {
      if (pool.length <= 3) {
        runFinalThree(pool);
        return;
      }

      let removeCount = 1;
      let delay = 80;

      if (hasShortlist && pool.length <= shortlistSet.size) {
        removeCount = 1;
        if (pool.length > 10) {
          delay = 450;
        } else if (pool.length > 6) {
          delay = 620;
        } else {
          delay = 850;
        }
      } else if (pool.length > 300) {
        removeCount = Math.floor(pool.length * 0.16);
        delay = 100;
      } else if (pool.length > 100) {
        removeCount = Math.floor(pool.length * 0.12);
        delay = 130;
      } else if (pool.length > 40) {
        removeCount = Math.floor(pool.length * 0.09);
        delay = 160;
      } else if (pool.length > 15) {
        removeCount = Math.max(1, Math.floor(pool.length * 0.06));
        delay = 230;
      } else if (pool.length > 6) {
        removeCount = 1;
        delay = 360;
      } else {
        removeCount = 1;
        delay = 520;
      }

      for (let k = 0; k < removeCount && pool.length > 3; k++) {
        let removeIdx = -1;
        if (hasShortlist && pool.length > shortlistSet.size) {
          // Identify indices of non-shortlisted handles to eliminate first
          const nonShortlistIndices = [];
          for (let i = 0; i < pool.length; i++) {
            const clean = pool[i].toLowerCase().trim().replace(/^@/, '');
            if (!shortlistSet.has(clean)) {
              nonShortlistIndices.push(i);
            }
          }
          if (nonShortlistIndices.length > 0) {
            removeIdx = nonShortlistIndices[Math.floor(Math.random() * nonShortlistIndices.length)];
          } else {
            removeIdx = Math.floor(Math.random() * pool.length);
          }
        } else {
          removeIdx = Math.floor(Math.random() * pool.length);
        }

        const removedHandle = pool.splice(removeIdx, 1)[0];

        const particle = cycloneParticles.find(p => p.handle === removedHandle && p.phase !== 'eliminating');
        if (particle) {
          particle.phase = 'eliminating';
          if (window.soundFX && Math.random() > 0.4) {
            window.soundFX.playEliminatePop();
          }
        }
      }

      if (hasShortlist && pool.length <= shortlistSet.size && pool.length > 3) {
        statusText.textContent = `⭐ Top ${pool.length} Finalists in the Vortex! ⭐`;
      } else {
        statusText.textContent = `Eliminating... ${pool.length} contestants remaining`;
      }
      setTimeout(stepElimination, delay);
    }

    stepElimination();
  }

  // Final 3 Climax: Winning names stay swirling in the center for a moment before fading!
  function runFinalThree(finalists) {
    statusPill.classList.add('active');
    statusText.textContent = '⭐ THE FINAL 3 WINNERS ARE SWIRLING! ⭐';

    // The 3 finalists: 0 is Grand Winner, 1 is Runner Up 1, 2 is Runner Up 2
    finalists.forEach((handle, idx) => {
      let p = cycloneParticles.find(part => part.handle === handle);
      if (!p) {
        const el = document.createElement('div');
        el.className = 'handle-badge finalist-badge';
        el.textContent = handle;
        cycloneContainer.appendChild(el);
        p = {
          handle,
          el,
          x: 0,
          y: 0,
          z: 0,
          orbitRadiusX: 220,
          orbitRadiusY: 100,
          orbitRadiusZ: 140,
          orbitAngle: (Math.PI * 2 / 3) * idx,
          orbitSpeed: 0.055,
          phase: 'finalist',
          opacity: 1,
          scale: 1.25
        };
        cycloneParticles.push(p);
      } else {
        p.phase = 'finalist';
        p.el.classList.add('finalist-badge');
        p.orbitRadiusX = 260;
        p.orbitRadiusY = 120;
        p.orbitRadiusZ = 140;
        p.orbitAngle = (Math.PI * 2 / 3) * idx;
        p.orbitSpeed = 0.055;
      }

      // Add distinctive glowing accents to the 3 finalists
      if (idx === 0) {
        p.el.style.border = '2.5px solid #FFD700';
        p.el.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.9)';
      } else if (idx === 1) {
        p.el.style.border = '2.5px solid #E2E8F0';
        p.el.style.boxShadow = '0 0 25px rgba(226, 232, 240, 0.85)';
      } else {
        p.el.style.border = '2.5px solid #FF9F43';
        p.el.style.boxShadow = '0 0 25px rgba(255, 159, 67, 0.85)';
      }
    });

    // Eliminate any other remaining stray particles immediately
    cycloneParticles.forEach(p => {
      if (!finalists.includes(p.handle)) {
        p.phase = 'eliminating';
      }
    });

    // SUSPENSE CLIMAX: The 3 finalists swirl together in the spotlight for ~3.8 seconds!
    setTimeout(() => {
      // 1. Reveal 2nd Runner Up
      const r2Idx = Math.floor(Math.random() * finalists.length);
      const r2Handle = finalists.splice(r2Idx, 1)[0];
      statusText.textContent = `🥉 2nd Runner-Up: @${r2Handle}!`;

      // Fade 2nd runner up out of the swirl
      const p2 = cycloneParticles.find(p => p.handle === r2Handle);
      if (p2) p2.phase = 'eliminating';

      // 2 finalists keep swirling for another 1.8 seconds!
      setTimeout(() => {
        // 2. Reveal 1st Runner Up
        const r1Idx = Math.floor(Math.random() * finalists.length);
        const r1Handle = finalists.splice(r1Idx, 1)[0];
        statusText.textContent = `🥈 1st Runner-Up: @${r1Handle}!`;

        // Fade 1st runner up out of the swirl
        const p1 = cycloneParticles.find(p => p.handle === r1Handle);
        if (p1) p1.phase = 'eliminating';

        // Sole champion remains!
        const grandWinner = finalists[0];
        statusText.textContent = `🏆 AND THE GRAND PRIZE WINNER IS...`;

        // Grand winner swirls solo in center for 1.4s, then expands!
        setTimeout(() => {
          revealGrandWinner(grandWinner, r1Handle, r2Handle);
        }, 1400);

      }, 1800);

    }, 3800);
  }

  // Reveal Grand Winner with full fireworks & celebration music
  function revealGrandWinner(winner, r1, r2) {
    lastResults = {
      winner,
      runnerUp1: r1,
      runnerUp2: r2,
      timestamp: new Date().toLocaleString()
    };

    centerCard.classList.add('hidden');
    statusPill.classList.remove('active');

    // Winner particle snaps center, scales up, glows gold
    let winParticle = cycloneParticles.find(p => p.handle === winner);
    if (!winParticle) {
      const el = document.createElement('div');
      el.className = 'handle-badge finalist-badge';
      el.textContent = winner;
      cycloneContainer.appendChild(el);
      winParticle = {
        handle: winner,
        el,
        x: 0,
        y: 0,
        z: 0,
        phase: 'winner',
        opacity: 1,
        scale: 1.2
      };
      cycloneParticles.push(winParticle);
    }

    winParticle.phase = 'winner';
    winParticle.el.style.background = 'linear-gradient(135deg, #FFC837 0%, #FF8008 100%)';
    winParticle.el.style.color = '#071322';
    winParticle.el.style.border = '2.5px solid #FFFFFF';
    winParticle.el.style.boxShadow = '0 0 60px rgba(255, 200, 55, 0.95), 0 0 100px rgba(255, 128, 8, 0.8)';

    // Play Celebration Music
    if (window.soundFX) {
      window.soundFX.playCelebrationMusic();
    }
    fireworks.start();

    winnerHandle.textContent = `@${winner}`;
    runnerUp1.textContent = `@${r1}`;
    runnerUp2.textContent = `@${r2}`;

    setTimeout(() => {
      winnerCard.classList.add('visible');
    }, 850);
  }

  function resetToReady() {
    if (window.soundFX) {
      window.soundFX.stopAllMusic();
    }
    fireworks.stop();
    fireworks.clear();
    winnerCard.classList.remove('visible');
    statusPill.classList.remove('active');
    const dockedPostBadge = document.getElementById('dockedPostBadge');
    if (dockedPostBadge) dockedPostBadge.classList.remove('visible');
    cycloneContainer.innerHTML = '';
    cycloneParticles = [];
    document.body.classList.remove('body-running');
    centerCard.classList.remove('hidden');
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function copyResults() {
    if (!lastResults) return;
    const text = `🏆 BYU Football Tickets Instagram Giveaway Results\n` +
                 `Organized by Pioneer Party Gift & Copy\n` +
                 `-----------------------------------------\n` +
                 `Grand Prize Winner: @${lastResults.winner}\n` +
                 `1st Runner-Up:      @${lastResults.runnerUp1}\n` +
                 `2nd Runner-Up:      @${lastResults.runnerUp2}\n` +
                 `Selected at:        ${lastResults.timestamp}\n\n` +
                 `* Rules: Winner has 24 hours to reply before tickets transfer to 1st runner-up.`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = btnCopy.textContent;
      btnCopy.textContent = '✓ Copied!';
      setTimeout(() => {
        btnCopy.textContent = origText;
      }, 2000);
    }).catch(() => {
      alert(text);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
