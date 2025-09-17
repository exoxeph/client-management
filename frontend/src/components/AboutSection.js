import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from './ui/Button';
import {
  Users2 as Users2Icon,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckCircleIcon,
  Building2,
  Target,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const AboutSection = memo(function AboutSection({ darkMode = false }) {
  const features = useMemo(
    () => [
      { title: 'Client-centric', description: 'We design features around real client workflows.', Icon: Users2Icon, tint: darkMode ? 'text-indigo-400' : 'text-indigo-600' },
      { title: 'Secure by default', description: 'Enterprise-grade encryption and role-based access.', Icon: ShieldIcon, tint: darkMode ? 'text-sky-400' : 'text-sky-600' },
      { title: 'Time-saving', description: 'Automations that remove repetitive busywork.', Icon: ClockIcon, tint: darkMode ? 'text-amber-400' : 'text-amber-600' },
      { title: 'Reliable', description: '99.9% uptime target with proactive monitoring.', Icon: CheckCircleIcon, tint: darkMode ? 'text-emerald-400' : 'text-emerald-600' },
    ],
    [darkMode]
  );

  const stats = useMemo(
    () => [
      { Icon: Building2, label: 'Teams onboarded', value: '120+' },
      { Icon: TrendingUp, label: 'Avg. time saved / week', value: '6.5h' },
      { Icon: Target, label: 'NPS (last 90 days)', value: '67' },
      { Icon: Sparkles, label: 'Feature releases / month', value: '4–6' },
    ],
    []
  );

  const baseBg = darkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900';
  const subText = darkMode ? 'text-gray-300' : 'text-gray-600';
  const faintText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardRing = darkMode ? 'ring-white/10' : 'ring-black/5';
  const borderMuted = darkMode ? 'border-white/10' : 'border-gray-100';

  const scrollToContact = (e) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // fallback if AboutSection is used outside the home page
      window.location.assign('/#contact');
    }
  };

  return (
    <section
      id="about"
      aria-label="About ClientManager"
      className={`relative w-full py-20 px-4 sm:px-6 lg:px-8 ${baseBg}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          darkMode
            ? 'bg-[radial-gradient(60%_60%_at_80%_0%,rgba(99,102,241,0.15),rgba(0,0,0,0))]'
            : 'bg-[radial-gradient(60%_60%_at_80%_0%,rgba(99,102,241,0.08),rgba(255,255,255,0))]'
        }`}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text column */}
          <div className="order-2 lg:order-1">
            <header className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                About <span className="text-indigo-600">ClientManager</span>
              </h2>
              <p className={`text-lg ${subText}`}>
                We’re on a mission to make client operations effortless—so your team can focus on
                outcomes, not overhead.
              </p>
              <p className={`mt-4 ${faintText}`}>
                Since 2023, ClientManager has helped teams centralize client data, track projects,
                and streamline communications in one secure workspace. We iterate quickly with our
                users and ship improvements continuously.
              </p>
            </header>

            {/* Feature grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6" role="list">
              {features.map(({ title, description, Icon, tint }, i) => (
                <div key={i} role="listitem" className="flex items-start gap-3 reveal-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="mt-1">
                    <Icon size={22} className={tint} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className={faintText}>{description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`rounded-xl ring-1 ${cardRing} p-4 text-center reveal-up`}
                  style={{ animationDelay: `${200 + i * 70}ms` }}
                >
                  <Icon className="mx-auto mb-2 h-5 w-5 opacity-80" aria-hidden="true" />
                  <div className="text-lg font-semibold">{value}</div>
                  <div className={`text-xs ${faintText}`}>{label}</div>
                </div>
              ))}
            </div>

            {/* CTA (View Projects removed; Get in Touch scrolls to #contact) */}
            <div className="mt-8">
              <Button
                variant={darkMode ? 'primary-dark' : 'primary'}
                size="md"
                className="group"
                onClick={scrollToContact}
                aria-label="Scroll to Contact section"
              >
                Get in Touch
              </Button>
            </div>
          </div>

          {/* Image column */}
          <div className="order-1 lg:order-2">
            <figure className={`rounded-2xl overflow-hidden ring-1 ${cardRing} reveal-up`} style={{ animationDelay: '120ms' }}>
              {/* decorative top bar */}
              <div className={`flex items-center gap-2 px-4 py-2 border-b ${borderMuted}`} aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs opacity-60">team-collab.jpg</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
                alt="Cross-functional team collaborating around a project table"
                loading="lazy"
                className="w-full h-auto"
              />
            </figure>

            {/* Caption moved OUTSIDE the image container */}
            <div className="mt-4 max-w-lg">
              <div className={`rounded-xl ring-1 ${cardRing} ${darkMode ? 'bg-white/5' : 'bg-white'} p-4 shadow-sm`}>
                <p className="text-sm font-medium">“Switched our onboarding from 10 tools to 1.”</p>
                <p className={`text-xs mt-1 ${faintText}`}>— Ops Lead, SaaS (50+ clients)</p>
              </div>
            </div>
          </div>
        </div>

        <p className={`mt-10 text-xs ${faintText}`}>
          * Metrics shown are illustrative; real outcomes vary by team size and workflow complexity.
        </p>
      </div>

      {/* CSS-only reveal animation */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .reveal-up { opacity: 0; transform: translateY(10px); animation: about-rise 480ms ease-out forwards; }
        }
        @keyframes about-rise { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
});

AboutSection.propTypes = {
  darkMode: PropTypes.bool,
};

export default AboutSection;
