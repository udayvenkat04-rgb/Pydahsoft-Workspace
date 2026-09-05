import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const presenterImg = '/project_leadership_presenter.png';

export default function Landing({ user }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [processedImg, setProcessedImg] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = presenterImg;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Make solid white background pixels 100% transparent
        if (r > 235 && g > 235 && b > 235) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedImg(canvas.toDataURL('image/png'));
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function fade() {
      ctx.fillStyle = 'rgba(242, 251, 246, 0.06)';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = '#f2fbf6';
    ctx.fillRect(0, 0, W, H);

    function hash(x, y) {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
      return s - Math.floor(s);
    }
    function noise2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const a = hash(xi, yi), b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }

    let mouseX = W / 2, mouseY = H / 2, mouseActive = false;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const PARTICLE_COUNT = 700;
    const particles = [];
    const colors = ['#0f9d63', '#3fb884', '#7ecda5', '#bfe6d3'];

    function resetParticle(p) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.life = 0;
      p.maxLife = 120 + Math.random() * 200;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.width = Math.random() < 0.15 ? 1.6 : 0.7;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = {};
      resetParticle(p);
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const SCALE = 0.0028;
    let t = 0;

    function animate() {
      fade();
      t += 0.0025;

      particles.forEach((p) => {
        const angle = noise2(p.x * SCALE, p.y * SCALE + t) * Math.PI * 4;
        let vx = Math.cos(angle) * 1.15;
        let vy = Math.sin(angle) * 1.15;

        if (mouseActive) {
          const dx = p.x - mouseX, dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const force = (1 - dist / 160) * 1.6;
            vx += (dx / (dist + 0.01)) * force;
            vy += (dy / (dist + 0.01)) * force;
          }
        }

        const px = p.x, py = p.y;
        p.x += vx;
        p.y += vy;
        p.life++;

        const fadeIn = Math.min(p.life / 20, 1);
        const fadeOut = Math.min((p.maxLife - p.life) / 30, 1);
        const alpha = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.55;

        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (p.life > p.maxLife || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          resetParticle(p);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className="landing-background min-h-screen overflow-hidden text-[#09233d] font-sans relative">
      <canvas ref={canvasRef} id="bg-canvas" className="fixed inset-0 w-full h-full pointer-events-none -z-10" />
      <div className="relative isolate z-10">
        <div className="pointer-events-none absolute -right-24 top-24 -z-10 h-80 w-80 rounded-full bg-[#dff7e9] opacity-80" />
        <div className="pointer-events-none absolute -left-32 top-[28rem] -z-10 h-80 w-80 rounded-full bg-[#e5f2ee]" />

        <header className="flex w-full items-center justify-between px-6 py-7 lg:px-10 xl:px-14">
          <Link to="/" className="flex items-center gap-2.5" aria-label="PydahSoft home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#27b878] text-xl font-black text-white shadow-[0_8px_20px_rgba(39,184,120,0.2)]">&lt;&gt;</span>
            <span className="leading-none">
              <strong className="block text-lg font-extrabold tracking-[-0.04em]">PydahSoft</strong>
              <small className="mt-1 block text-[8px] font-bold uppercase tracking-[0.18em] text-[#577080]">innovations that matters</small>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#43566a] lg:flex">
            <Link className="transition-colors hover:text-[#119b62]" to="/">Home</Link>
            <a className="transition-colors hover:text-[#119b62]" href="#about">About</a>
            <a className="transition-colors hover:text-[#119b62]" href="#services">Services</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-full bg-[#20b875] px-5 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#09233d] px-5 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Sign In <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </header>

        <section id="top" className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-28 lg:pt-20">
          <div className="animate-[fade-up_700ms_ease-out_both]">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#119b62]">
              <span className="h-px w-8 bg-[#27b878]" /> Project operations, connected
            </p>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.065em] text-[#09233d] sm:text-6xl lg:text-[5.5rem]">
              Make every project <span className="text-[#169a61]">count.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#61798a]">
              Manage projects, teams, daily tasks, time, and performance in one connected workspace built for complete accountability.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="rounded-full bg-[#20b875] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(32,184,117,0.2)] transition-all hover:-translate-y-1 hover:bg-[#159e63]"
              >
                Explore the system <span aria-hidden="true">→</span>
              </button>
              <a href="#about" className="px-3 py-3 text-sm font-bold text-[#09233d] transition-colors hover:text-[#159e63]">
                How it works <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>

          {/* Seamless Transparent Executive Presenter & Holographic Flowchart */}
          <div className="relative min-h-[500px] animate-[fade-up_900ms_150ms_ease-out_both] sm:min-h-[560px] flex items-center justify-center hero-card-3d-wrapper">
            {/* Ambient Holographic Glow */}
            <div className="absolute right-0 top-0 h-full w-full rounded-[2.5rem] bg-gradient-to-tr from-[#20b875]/25 via-[#3fb884]/15 to-transparent blur-3xl animate-pulse pointer-events-none" />

            {/* Completely Transparent Container (No card background, No borders) */}
            <div className="relative w-full bg-transparent p-0 hero-card-3d">
              {/* Floating Live Badge */}
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-[#09233d]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20b875] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20b875]"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                  ⚡ Live Execution Flow
                </span>
              </div>

              {/* Seamless Transparent Presenter & Flowchart Image */}
              <div className="relative overflow-visible group flex justify-center">
                <img
                  src={processedImg || presenterImg}
                  alt="Executive Presenter & Holographic Architecture Flowchart"
                  className="w-full h-auto max-h-[520px] object-contain transition-transform duration-700 group-hover:scale-[1.02] drop-shadow-[0_20px_40px_rgba(20,154,97,0.25)]"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-2 border-t border-[#dfeee6] px-6 py-8 sm:grid-cols-4 lg:px-10">
          <div className="border-r border-[#dfeee6] pr-4">
            <p className="text-2xl font-black text-[#09233d]">12</p>
            <p className="mt-1 text-xs font-semibold text-[#708794]">Connected modules</p>
          </div>
          <div className="border-r border-[#dfeee6] px-4 sm:px-6">
            <p className="text-2xl font-black text-[#09233d]">360°</p>
            <p className="mt-1 text-xs font-semibold text-[#708794]">Project visibility</p>
          </div>
          <div className="border-r border-[#dfeee6] px-4 sm:px-6">
            <p className="text-2xl font-black text-[#09233d]">1</p>
            <p className="mt-1 text-xs font-semibold text-[#708794]">Source of truth</p>
          </div>
          <div className="pl-4 sm:pl-6">
            <p className="text-2xl font-black text-[#09233d]">Live</p>
            <p className="mt-1 text-xs font-semibold text-[#708794]">Performance signals</p>
          </div>
        </div>
      </div>

      <section id="about" className="border-y border-[#dfeee6] bg-[#edf9f2]/40 backdrop-blur-xs">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#169a61]">About the platform</p>
            <h2 className="mt-4 max-w-md text-4xl font-black leading-tight tracking-[-0.05em]">One clear chain of accountability.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#61798a]">
            The Employee Project, Task & Performance Management System connects every stage of work: a Superior assigns the project, Team Leads shape modules and tasks, and Employees track time, submit work, and build a reliable performance history.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 px-6 pb-16 sm:grid-cols-3 lg:px-10 lg:pb-24">
          <div className="border-t border-[#b9dfc8] pt-4">
            <p className="text-sm font-bold text-[#09233d]">Traceable by design</p>
            <p className="mt-2 text-sm leading-6 text-[#61798a]">Follow decisions, work, time, and outcomes through one connected record.</p>
          </div>
          <div className="border-t border-[#b9dfc8] pt-4">
            <p className="text-sm font-bold text-[#09233d]">Built for every role</p>
            <p className="mt-2 text-sm leading-6 text-[#61798a]">Give leaders oversight while keeping each employee focused on the work ahead.</p>
          </div>
          <div className="border-t border-[#b9dfc8] pt-4">
            <p className="text-sm font-bold text-[#09233d]">Ready for better decisions</p>
            <p className="mt-2 text-sm leading-6 text-[#61798a]">Turn task and time data into clear progress, useful feedback, and fair performance insight.</p>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-[#dfeee6] bg-white/40 backdrop-blur-xs">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[0.7fr_1.3fr] lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#169a61]">Core services</p>
            <h2 className="mt-3 max-w-xs text-3xl font-black leading-tight tracking-[-0.04em]">Everything your projects need to move.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#708794]">A practical operating layer for planning work, managing people, and learning from delivery.</p>
          </div>
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <div className="border-t border-[#dfeee6] pt-4">
              <p className="text-sm font-bold text-[#09233d]">01 / Project & team management</p>
              <p className="mt-2 text-sm leading-6 text-[#708794]">Assign projects, form teams, choose leads, and follow progress from one view.</p>
            </div>
            <div className="border-t border-[#dfeee6] pt-4">
              <p className="text-sm font-bold text-[#09233d]">02 / Modules & daily planning</p>
              <p className="mt-2 text-sm leading-6 text-[#708794]">Break ambitious goals into manageable modules and clear daily work plans.</p>
            </div>
            <div className="border-t border-[#dfeee6] pt-4">
              <p className="text-sm font-bold text-[#09233d]">03 / Tasks & time tracking</p>
              <p className="mt-2 text-sm leading-6 text-[#708794]">Capture ownership, deadlines, remarks, evidence, and the actual time spent.</p>
            </div>
            <div className="border-t border-[#dfeee6] pt-4">
              <p className="text-sm font-bold text-[#09233d]">04 / Reviews & performance</p>
              <p className="mt-2 text-sm leading-6 text-[#708794]">Approve work, surface blockers, and turn delivery history into useful KPIs.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-wave-footer" aria-hidden="true">
        <span className="landing-wave landing-wave-light" />
        <span className="landing-wave landing-wave-dark" />
      </div>
    </main>
  );
}
