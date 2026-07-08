# Celestia 🪐

Celestia is an interactive, high-performance 3D solar system explorer and orbital mechanics simulator designed with a premium dark theme, fluid animations, and volumetric space aesthetics.

🔗 **Live Preview:** [https://workwithme2003-cmyk.github.io/Celestia](https://workwithme2003-cmyk.github.io/Celestia)

---

## ✨ Features

- **3D Planetary Catalog:** Renders detailed planetary spheres with high-resolution textures, dynamic day/night shading, and responsive orbital scales.
- **Storytelling Scroll Transitions:** Syncs planetary text information with real-time WebGL canvas swaps via **GSAP ScrollTrigger** and smooth **Lenis** inertia scrolling.
- **Interactive Orbit Simulator:** Volumetric starfield map presenting orbital rings, real-time period velocities, and astronomical stats.
- **Stellar Moon Systems:** Tracks sub-orbits for Earth's Moon and Jupiter's Galilean moons (Io, Europa, Ganymede), alongside Saturn's ring geometries.
- **Volumetric Singularity:** Toggles the simulator focus between "Sol" and a "Singularity (Black Hole)" surrounded by a swirling accretion disk made of 1,200 gravity-pulled particles.
- **Adaptive Fallback:** Checks browser WebGL capacity dynamically to slide back to a high-fidelity 2D canvas drawing layout if hardware rendering is missing.

---

## 🛠️ Stack & Libraries

- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Graphics Framework:** Three.js (WebGL rendering)
- **Transitions / Animation:** GSAP (GreenSock) & ScrollTrigger
- **Scroller Control:** Lenis Smooth Scroll
- **UI System:** Tailwind CSS
- **Local Dev Server:** `http-server`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed.

### Setup and Run
1. Clone the repository:
   ```bash
   git clone https://github.com/workwithme2003-cmyk/Celestia.git
   cd Celestia
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:8282](http://localhost:8282) in your browser.

### Deployment
To deploy the project directly to GitHub Pages:
```bash
npm run deploy
```

