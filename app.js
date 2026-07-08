/**
 * Celestia Space Engine v3.0
 * Upgraded to 3D via Three.js (Procedural Stars, Orbit Simulator, Custom Black Hole Shaders)
 */
document.addEventListener('DOMContentLoaded', () => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. LENIS SMOOTH SCROLL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. GSAP + SCROLL TRIGGER INTEGRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());

  const progressBar = document.getElementById('scroll-progress');
  lenis.on('scroll', ({ progress }) => {
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. WEBGBL AVAILABILITY CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. PLANET DATABASE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const db = {
    mercury: {
      name: 'Mercury', index: '01', type: 'Terrestrial',
      gravity: '3.7 m/s²', temp: '167°C', year: '88 days',
      desc: 'The smallest planet in our solar system and nearest to the Sun, Mercury is only slightly larger than Earth\'s Moon.',
      gravityVal: 3.7, tempVal: 167, yearVal: 88,
      color: 0x708090, colorStr: '#708090',
      glowColor: 'rgba(112,128,144,0.45)',
      orbitRadius: 65, orbitalSpeed: 0.04, size: 4.5,
    },
    venus: {
      name: 'Venus', index: '02', type: 'Terrestrial',
      gravity: '8.9 m/s²', temp: '462°C', year: '225 days',
      desc: 'Venus spins slowly in the opposite direction from most planets. Its thick atmosphere traps heat in a runaway greenhouse effect.',
      gravityVal: 8.9, tempVal: 462, yearVal: 225,
      color: 0xf5a623, colorStr: '#f5a623',
      glowColor: 'rgba(245,166,35,0.4)',
      orbitRadius: 100, orbitalSpeed: 0.025, size: 7.0,
    },
    earth: {
      name: 'Earth', index: '03', type: 'Terrestrial',
      gravity: '9.8 m/s²', temp: '15°C', year: '365 days',
      desc: 'Our home planet, the only known astronomical body supporting life, with liquid water oceans covering about 71% of its surface.',
      gravityVal: 9.8, tempVal: 15, yearVal: 365,
      color: 0x00c9a7, colorStr: '#00c9a7',
      glowColor: 'rgba(0,245,212,0.38)',
      orbitRadius: 145, orbitalSpeed: 0.018, size: 8.0,
    },
    mars: {
      name: 'Mars', index: '04', type: 'Terrestrial',
      gravity: '3.7 m/s²', temp: '-62°C', year: '687 days',
      desc: 'A dusty, cold, desert world with a very thin atmosphere. Strong evidence suggests Mars was once wetter and warmer, billions of years ago.',
      gravityVal: 3.7, tempVal: -62, yearVal: 687,
      color: 0xd95f43, colorStr: '#d95f43',
      glowColor: 'rgba(217,95,67,0.45)',
      orbitRadius: 190, orbitalSpeed: 0.013, size: 6.0,
    },
    jupiter: {
      name: 'Jupiter', index: '05', type: 'Gas Giant',
      gravity: '24.8 m/s²', temp: '-108°C', year: '4,333 days',
      desc: 'More than twice as massive than the other planets combined. The Great Red Spot is a storm wider than Earth that has raged for centuries.',
      gravityVal: 24.8, tempVal: -108, yearVal: 4333,
      color: 0xb08d70, colorStr: '#b08d70',
      glowColor: 'rgba(167,139,250,0.38)',
      orbitRadius: 235, orbitalSpeed: 0.007, size: 13.0,
    },
    saturn: {
      name: 'Saturn', index: '06', type: 'Gas Giant',
      gravity: '10.4 m/s²', temp: '-139°C', year: '10,759 days',
      desc: 'Adorned with a dazzling system of icy rings, Saturn is a unique gas giant mostly composed of hydrogen and helium.',
      gravityVal: 10.4, tempVal: -139, yearVal: 10759,
      color: 0xb0c4de, colorStr: '#b0c4de',
      glowColor: 'rgba(96,165,250,0.38)',
      orbitRadius: 280, orbitalSpeed: 0.004, size: 11.0,
    },
  };
  const planetIds = ['mercury','venus','earth','mars','jupiter','saturn'];

  // DOM Refs
  const overlayIndex = document.getElementById('overlay-index');
  const overlayName  = document.getElementById('overlay-name');
  const overlayType  = document.getElementById('overlay-type');
  const glowEl       = document.getElementById('planet-glow');
  const navDots      = document.querySelectorAll('.planet-nav-dot');

  const playPauseBtn   = document.getElementById('playPauseBtn');
  const resetOrbitsBtn = document.getElementById('resetOrbitsBtn');
  const speedSlider    = document.getElementById('orbitSpeed');
  const speedValEl     = document.getElementById('speedVal');
  const gravitySlider  = document.getElementById('gravityVal');
  const gravityBadgeEl = document.getElementById('gravityBadge');
  const planetPills    = document.querySelectorAll('.planet-pill');
  const planetTitleEl  = document.getElementById('planetTitle');
  const planetTypeEl   = document.getElementById('planetType');
  const planetDescEl   = document.getElementById('planetDesc');
  const gravityTextEl  = document.getElementById('gravityText');
  const tempTextEl     = document.getElementById('tempText');
  const yearTextEl     = document.getElementById('yearText');
  const gravityArcEl   = document.getElementById('gravityArc');
  const tempArcEl      = document.getElementById('tempArc');
  const yearArcEl      = document.getElementById('yearArc');
  const systemTargetEl = document.getElementById('systemTarget');
  const systemStatusEl = document.getElementById('systemStatus');
  const solToggleBtn   = document.getElementById('solBlackHoleToggle');
  const ARC = 251;

  let isRunning        = true;
  let speedMultiplier  = 1.0;
  let gravityMult      = 1.0;
  let selectedPlanet   = 'mercury';
  let isBlackHoleView  = false;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. THREE.JS 3D ENGINE (Primary Engine)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  class ThreeJSEngine {
    constructor() {
      this.stickyCanvas = document.getElementById('stickyCanvas');
      this.orbitCanvas  = document.getElementById('orbitCanvas');
      this.textures     = {};
      this.stickyPlanetMesh = null;
      this.stickyScene  = null;
      this.stickyCamera = null;
      this.stickyRenderer = null;

      this.orbitScene  = null;
      this.orbitCamera = null;
      this.orbitRenderer = null;
      this.orbitPlanets = {};
      this.orbitLines   = [];
      this.orbitMoons   = {};
      
      this.blackHoleParticles = null;
      this.sunMesh = null;
    }

    init() {
      // Create Texture Loader
      const loader = new THREE.TextureLoader();
      [...planetIds, 'sun'].forEach(name => {
        this.textures[name] = loader.load(`assets/${name}.png`);
      });

      this.initStickyScene();
      this.initOrbitScene();
      this.animate();
    }

    initStickyScene() {
      const W = this.stickyCanvas.clientWidth;
      const H = this.stickyCanvas.clientHeight;
      
      this.stickyScene = new THREE.Scene();
      this.stickyCamera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
      this.stickyCamera.position.z = 24;

      this.stickyRenderer = new THREE.WebGLRenderer({
        canvas: this.stickyCanvas,
        alpha: true,
        antialias: true
      });
      this.stickyRenderer.setSize(W, H);
      this.stickyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.15);
      this.stickyScene.add(ambient);

      const sunlight = new THREE.DirectionalLight(0xffffff, 1.3);
      sunlight.position.set(10, 5, 10);
      this.stickyScene.add(sunlight);

      // Create Sticky Planet Mesh
      const geometry = new THREE.SphereGeometry(6, 64, 64);
      const material = new THREE.MeshStandardMaterial({
        map: this.textures['mercury'],
        roughness: 0.8,
        metalness: 0.1
      });
      this.stickyPlanetMesh = new THREE.Mesh(geometry, material);
      this.stickyScene.add(this.stickyPlanetMesh);
    }

    initOrbitScene() {
      const W = this.orbitCanvas.clientWidth;
      const H = this.orbitCanvas.clientHeight;

      this.orbitScene = new THREE.Scene();
      this.orbitCamera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
      this.orbitCamera.position.set(0, 380, 480);
      this.orbitCamera.lookAt(0, 0, 0);

      this.orbitRenderer = new THREE.WebGLRenderer({
        canvas: this.orbitCanvas,
        antialias: true
      });
      this.orbitRenderer.setSize(W, H);
      this.orbitRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Starfield (Cosmos Background Particles)
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1800;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i]   = (Math.random() - 0.5) * 1600;
        starPos[i+1] = (Math.random() - 0.5) * 1600;
        starPos[i+2] = (Math.random() - 0.5) * 1600;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.85
      });
      const starfield = new THREE.Points(starGeo, starMat);
      this.orbitScene.add(starfield);

      // Sunlight source in Simulator
      const light = new THREE.PointLight(0xffffff, 2.5, 600);
      light.position.set(0, 0, 0);
      this.orbitScene.add(light);

      const ambient = new THREE.AmbientLight(0xffffff, 0.12);
      this.orbitScene.add(ambient);

      // Add central Star (Sol Sun)
      const sunGeo = new THREE.SphereGeometry(18, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ map: this.textures['sun'] });
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
      this.orbitScene.add(this.sunMesh);

      // Create Black Hole Accretion Disk (Procedural Particles)
      const bhGeo = new THREE.BufferGeometry();
      const partCount = 1200;
      const bhPos = new Float32Array(partCount * 3);
      this.bhAngles = new Float32Array(partCount);
      this.bhDists = new Float32Array(partCount);
      for (let i = 0; i < partCount; i++) {
        const dist = 22 + Math.random() * 28;
        const angle = Math.random() * Math.PI * 2;
        bhPos[i*3]   = Math.cos(angle) * dist;
        bhPos[i*3+1] = (Math.random() - 0.5) * 2;
        bhPos[i*3+2] = Math.sin(angle) * dist;
        this.bhAngles[i] = angle;
        this.bhDists[i]  = dist;
      }
      bhGeo.setAttribute('position', new THREE.BufferAttribute(bhPos, 3));
      const bhMat = new THREE.PointsMaterial({
        color: 0x00f5d4,
        size: 1.6,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      this.blackHoleParticles = new THREE.Points(bhGeo, bhMat);
      this.blackHoleParticles.visible = false;
      this.orbitScene.add(this.blackHoleParticles);

      // Build orbits and planet meshes
      planetIds.forEach(id => {
        const d = db[id];

        // Orbit Line
        const orbitLineGeo = new THREE.BufferGeometry();
        const linePoints = [];
        for (let i = 0; i <= 128; i++) {
          const angle = (i / 128) * Math.PI * 2;
          linePoints.push(new THREE.Vector3(Math.cos(angle) * d.orbitRadius, 0, Math.sin(angle) * d.orbitRadius));
        }
        orbitLineGeo.setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x00f5d4,
          transparent: true,
          opacity: id === selectedPlanet ? 0.28 : 0.05
        });
        const orbitLine = new THREE.Line(orbitLineGeo, lineMat);
        this.orbitScene.add(orbitLine);
        this.orbitLines.push({ id, mesh: orbitLine });

        // Planet Mesh
        const pGeo = new THREE.SphereGeometry(d.size * 0.7, 32, 32);
        const pMat = new THREE.MeshStandardMaterial({
          map: this.textures[id],
          roughness: 0.8,
          metalness: 0.1
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.angle = Math.random() * Math.PI * 2;
        pMesh.position.set(d.orbitRadius, 0, 0);
        this.orbitScene.add(pMesh);
        this.orbitPlanets[id] = pMesh;

        // Sub-orbit Moons
        if (id === 'earth') {
          const moonGeo = new THREE.SphereGeometry(1.6, 16, 16);
          const moonMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
          const moonMesh = new THREE.Mesh(moonGeo, moonMat);
          this.orbitScene.add(moonMesh);
          this.orbitMoons[id] = [moonMesh];
        } else if (id === 'jupiter') {
          // Io, Europa, Ganymede
          this.orbitMoons[id] = [];
          [0xcc9966, 0x99ccff, 0xbbbbbb].forEach((color, i) => {
            const mGeo = new THREE.SphereGeometry(1.4 + i*0.2, 16, 16);
            const mMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
            const mMesh = new THREE.Mesh(mGeo, mMat);
            this.orbitScene.add(mMesh);
            this.orbitMoons[id].push(mMesh);
          });
        } else if (id === 'saturn') {
          // Ring structure
          const ringGeo = new THREE.RingGeometry(d.size * 0.9, d.size * 1.5, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xa0b0c0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.3;
          pMesh.add(ringMesh);
        }
      });
    }

    setStickyPlanet(id) {
      if (this.textures[id] && this.stickyPlanetMesh) {
        gsap.to(this.stickyPlanetMesh.scale, {
          x: 0.1, y: 0.1, z: 0.1, duration: 0.18, ease: 'power2.in',
          onComplete: () => {
            this.stickyPlanetMesh.material.map = this.textures[id];
            this.stickyPlanetMesh.material.needsUpdate = true;
            gsap.to(this.stickyPlanetMesh.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
          }
        });
      }
    }

    setOrbitFocus(id) {
      this.orbitLines.forEach(l => {
        gsap.to(l.mesh.material, {
          opacity: l.id === id ? 0.35 : 0.04,
          duration: 0.4
        });
      });
    }

    toggleSingularity(enable) {
      if (enable) {
        this.sunMesh.visible = false;
        this.blackHoleParticles.visible = true;
      } else {
        this.sunMesh.visible = true;
        this.blackHoleParticles.visible = false;
      }
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      // Rotate Sticky Planet
      if (this.stickyPlanetMesh) {
        this.stickyPlanetMesh.rotation.y += 0.004;
      }

      // Update Orbit Simulator Positions
      planetIds.forEach(id => {
        const p = this.orbitPlanets[id];
        const spec = db[id];
        
        if (isRunning) {
          p.angle = (p.angle + spec.orbitalSpeed * speedMultiplier * Math.sqrt(gravityMult)) % (Math.PI * 2);
        }

        const px = Math.cos(p.angle) * spec.orbitRadius;
        const pz = Math.sin(p.angle) * spec.orbitRadius;
        p.position.set(px, 0, pz);
        p.rotation.y += 0.01;

        // Animate Sub-orbits (Moons)
        const moons = this.orbitMoons[id];
        if (moons) {
          moons.forEach((m, idx) => {
            const mDist = spec.size * 0.9 + 7 + idx * 4;
            const mSpeed = 0.06 - idx * 0.015;
            const mAngle = (Date.now() * 0.0015 * mSpeed) % (Math.PI * 2);
            m.position.set(
              px + Math.cos(mAngle) * mDist,
              Math.sin(mAngle * 0.3) * 1.5,
              pz + Math.sin(mAngle) * mDist
            );
          });
        }
      });

      // Swirl Black Hole particles if active
      if (isBlackHoleView && this.blackHoleParticles) {
        const positions = this.blackHoleParticles.geometry.attributes.position.array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          this.bhAngles[i] -= 0.035 * (30 / this.bhDists[i]);
          positions[i*3]   = Math.cos(this.bhAngles[i]) * this.bhDists[i];
          positions[i*3+2] = Math.sin(this.bhAngles[i]) * this.bhDists[i];
        }
        this.blackHoleParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Render Scene Frames
      if (this.stickyRenderer && this.stickyScene && this.stickyCamera) {
        this.stickyRenderer.render(this.stickyScene, this.stickyCamera);
      }
      if (this.orbitRenderer && this.orbitScene && this.orbitCamera) {
        this.orbitRenderer.render(this.orbitScene, this.orbitCamera);
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. HERO ENTER ANIMATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const heroTl = gsap.timeline({ delay: 0.25 });
  heroTl
    .fromTo('#hero-label', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .fromTo('#hero-title', { opacity: 0, y: 35, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out' }, '-=0.45')
    .fromTo('#hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
    .fromTo('#hero-cta', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.45')
    .fromTo('#hero-scroll', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3');

  // Magnetic CTA
  const ctaBtn = document.querySelector('.hero-btn-primary');
  if (ctaBtn) {
    const xTo = gsap.quickTo(ctaBtn, 'x', { duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(ctaBtn, 'y', { duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    ctaBtn.addEventListener('mousemove', (e) => {
      const r = ctaBtn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    ctaBtn.addEventListener('mouseleave', () => {
      xTo(0); yTo(0);
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. INITIALIZE THREE.JS OR CANVAS FALLBACK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let webglAvailable = isWebGLAvailable();
  let threeEngine = null;

  if (webglAvailable) {
    // Hide default twinkling starfield canvas
    const heroStars = document.getElementById('heroStars');
    if (heroStars) heroStars.style.display = 'none';

    threeEngine = new ThreeJSEngine();
    threeEngine.init();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. TEXT SWAP & OVERLAY HANDLERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function swapOverlay(el, newText, axis = 'y') {
    if (!el) return;
    const prop = axis === 'y' ? { y: -8 } : { x: -6 };
    gsap.to(el, { opacity: 0, ...prop, duration: 0.16, ease: 'power2.in', onComplete: () => {
      el.textContent = newText;
      gsap.fromTo(el, { opacity: 0, ...prop }, { opacity: 1, y: 0, x: 0, duration: 0.28, ease: 'power2.out' });
    }});
  }

  function setActivePlanet(id) {
    if (threeEngine) {
      threeEngine.setStickyPlanet(id);
    }

    const d = db[id];
    swapOverlay(overlayIndex, `— ${d.index}`);
    swapOverlay(overlayName,  d.name);
    swapOverlay(overlayType,  `${d.type} Planet`);

    if (glowEl) {
      glowEl.style.background = d.glowColor;
      gsap.to(glowEl, { opacity: 0.35, duration: 0.8, ease: 'power2.out' });
    }

    navDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.planet === id);
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. SCROLL TRIGGERS FOR PLANET PANELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gsap.fromTo('#planets-intro', { opacity: 0, y: 25 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#planets-intro', start: 'top 85%', once: true }
  });

  document.querySelectorAll('.planet-panel').forEach(panel => {
    const id = panel.dataset.planet;

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 55%',
      end:   'bottom 45%',
      onEnter:     () => setActivePlanet(id),
      onEnterBack: () => setActivePlanet(id),
    });

    const inner = panel.querySelector('.panel-inner');
    if (!inner) return;

    const num   = inner.querySelector('.panel-num');
    const name  = inner.querySelector('.panel-name');
    const tags  = inner.querySelectorAll('.tag-base');
    const desc  = inner.querySelector('.panel-desc');
    const stats = inner.querySelectorAll('.stat-card');

    const tl = gsap.timeline({
      scrollTrigger: { trigger: panel, start: 'top 75%', once: true }
    });
    if (num)   tl.fromTo(num,   { opacity:0, x:-14 }, { opacity:1, x:0, duration:0.45, ease:'power2.out' });
    if (name)  tl.fromTo(name,  { opacity:0, y:22  }, { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.2');
    if (tags.length) tl.fromTo(tags, { opacity:0, y:8 }, { opacity:1, y:0, duration:0.35, stagger:0.08, ease:'power2.out' }, '-=0.35');
    if (desc)  tl.fromTo(desc,  { opacity:0, y:12  }, { opacity:1, y:0, duration:0.5, ease:'power2.out' }, '-=0.25');
    if (stats.length) tl.fromTo(stats, { opacity:0, y:14, scale:0.95 }, { opacity:1, y:0, scale:1, duration:0.45, stagger:0.08, ease:'power2.out' }, '-=0.25');
  });

  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.querySelector(`.planet-panel[data-planet="${dot.dataset.planet}"]`);
      if (target) lenis.scrollTo(target, { offset: -60, duration: 1.4 });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. SIMULATOR INTERFACE EVENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gsap.fromTo('#map-header', { opacity: 0, y: 25 }, {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#system-map', start: 'top 82%', once: true }
  });

  gsap.fromTo('.map-card', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '#system-map', start: 'top 78%', once: true }
  });

  function updateStatsPanel(id) {
    const d = db[id];
    if (planetTitleEl) planetTitleEl.textContent = d.name;
    if (planetTypeEl)  planetTypeEl.textContent  = d.type;
    if (planetDescEl)  planetDescEl.textContent  = d.desc;
    if (gravityTextEl) gravityTextEl.textContent = d.gravity;
    if (tempTextEl)    tempTextEl.textContent    = d.temp;
    if (yearTextEl)    yearTextEl.textContent    = d.year;

    if (gravityArcEl) gravityArcEl.style.strokeDashoffset = ARC - ARC * Math.min(d.gravityVal / 25, 1);
    if (tempArcEl)    tempArcEl.style.strokeDashoffset    = ARC - ARC * Math.min((d.tempVal + 150) / 650, 1);
    if (yearArcEl)    yearArcEl.style.strokeDashoffset    = ARC - ARC * Math.min(d.yearVal / 10759, 1);
  }

  playPauseBtn?.addEventListener('click', () => {
    isRunning = !isRunning;
    const span = playPauseBtn.querySelector('span');
    if (span) span.textContent = isRunning ? 'Pause' : 'Play';
  });

  resetOrbitsBtn?.addEventListener('click', () => {
    if (threeEngine) {
      planetIds.forEach(id => {
        threeEngine.orbitPlanets[id].angle = Math.random() * Math.PI * 2;
      });
    }
  });

  speedSlider?.addEventListener('input', e => {
    speedMultiplier = parseFloat(e.target.value);
    if (speedValEl) speedValEl.textContent = `${speedMultiplier.toFixed(1)}x`;
  });

  gravitySlider?.addEventListener('input', e => {
    gravityMult = parseFloat(e.target.value);
    if (gravityBadgeEl) gravityBadgeEl.textContent = `${gravityMult.toFixed(1)}G`;
    if (systemStatusEl) systemStatusEl.textContent =
      gravityMult > 1.8 ? 'Status: High Gravitational Strain' : 'Status: Stable Orbit';
  });

  planetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      planetPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      selectedPlanet = pill.dataset.planet;
      if (systemTargetEl) systemTargetEl.textContent = db[selectedPlanet].name;
      updateStatsPanel(selectedPlanet);
      if (threeEngine) threeEngine.setOrbitFocus(selectedPlanet);
    });
  });

  // Black Hole Toggle
  solToggleBtn?.addEventListener('click', () => {
    isBlackHoleView = !isBlackHoleView;
    const label = solToggleBtn.querySelector('span');
    if (label) label.textContent = isBlackHoleView ? 'View: Singularity' : 'View: Sol';
    if (systemTargetEl) systemTargetEl.textContent = isBlackHoleView ? 'Singularity (Black Hole)' : db[selectedPlanet].name;
    if (threeEngine) threeEngine.toggleSingularity(isBlackHoleView);
  });

  // Boot
  updateStatsPanel('mercury');
});
