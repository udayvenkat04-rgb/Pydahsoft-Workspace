import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing({ user }) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fcf9] text-[#09233d] font-sans">
      <div className="relative isolate">
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

          <div className="relative min-h-[420px] animate-[fade-up_900ms_150ms_ease-out_both] sm:min-h-[510px]">
            <div className="absolute right-0 top-4 h-[82%] w-[83%] rounded-[2.5rem] bg-[#d8f5e5]" />
            <div className="absolute bottom-1 left-0 h-[72%] w-[87%] rounded-[2.5rem] border border-white/80 bg-white/80 p-5 shadow-[0_25px_70px_rgba(28,104,75,0.12)] backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e3f0e9] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a929e]">Project control center</p>
                  <p className="mt-1 text-xl font-extrabold">Today at a glance</p>
                </div>
                <span className="h-9 w-9 rounded-full bg-[#b8ecd0]" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f0faf4] p-4">
                  <p className="text-xs text-[#729083]">Active projects</p>
                  <p className="mt-2 text-3xl font-black">24</p>
                  <p className="mt-1 text-xs font-bold text-[#169a61]">All teams</p>
                </div>
                <div className="rounded-2xl bg-[#09233d] p-4 text-white">
                  <p className="text-xs text-[#a8bdc5]">Tasks completed</p>
                  <p className="mt-2 text-3xl font-black">86%</p>
                  <p className="mt-1 text-xs font-bold text-[#6be2a7]">This month</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#e5f0eb] bg-white p-4">
                <div className="flex items-end gap-2" aria-hidden="true">
                  <span className="h-10 flex-1 rounded-t-md bg-[#a9e8c5]" />
                  <span className="h-16 flex-1 rounded-t-md bg-[#6dd8a1]" />
                  <span className="h-12 flex-1 rounded-t-md bg-[#b7edd0]" />
                  <span className="h-24 flex-1 rounded-t-md bg-[#20b875]" />
                  <span className="h-20 flex-1 rounded-t-md bg-[#46c98b]" />
                  <span className="h-28 flex-1 rounded-t-md bg-[#09233d]" />
                </div>
                <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#91a4ad]">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 bottom-10 rounded-2xl bg-[#20b875] px-5 py-4 text-white shadow-[0_15px_30px_rgba(32,184,117,0.25)] sm:right-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c8f8dc]">Work tracked</p>
              <p className="mt-1 text-2xl font-black">1,248 hrs</p>
            </div>
          </div>
        </section>
      </div>

      <section id="about" className="border-y border-[#dfeee6] bg-[#edf9f2]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#169a61]">About the platform</p>
            <h2 className="mt-4 max-w-md text-4xl font-black leading-tight tracking-[-0.05em]">One clear chain of accountability.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#61798a]">
            The Employee Project, Task & Performance Management System connects every stage of work: a Superior assigns the project, Team Leads shape modules and tasks, and Employees track time, submit work, and build a reliable performance history.
          </p>
        </div>
      </section>

      <section id="services" className="border-y border-[#dfeee6] bg-white/65">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#169a61]">Core services</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Work, made visible.</h2>
          </div>
          <div>
            <p className="text-sm font-bold text-[#09233d]">01 / Project & team management</p>
            <p className="mt-2 text-sm leading-6 text-[#708794]">Assign projects, form teams, and follow progress from one view.</p>
          </div>
          <div>
            <p className="text-sm font-bold text-[#09233d]">02 / Tasks, time & performance</p>
            <p className="mt-2 text-sm leading-6 text-[#708794]">Track daily work, approvals, hours, KPIs, and reports with confidence.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
