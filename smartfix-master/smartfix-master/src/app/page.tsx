'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, MotionValue } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Shield,
  CheckCircle2,
  Award,
  Zap,
  MapPin,
  Clock,
  ChevronDown,
  Home as HomeIcon,
} from 'lucide-react';
import { Liquid, Colors } from '@/components/ui/button-1';

// ─────────────────────────────────────────────────────────
//  Liquid button color palette (SmartFix green)
// ─────────────────────────────────────────────────────────
const TEAL_COLORS: Colors = {
  color1: '#7DC52B', color2: '#2a4a00', color3: '#a8e04a',
  color4: '#f4ffe8', color5: '#eeffdd', color6: '#5a9e1a',
  color7: '#3a7200', color8: '#6ab820', color9: '#8fd030',
  color10: '#b2e055', color11: '#1c3600', color12: '#90cc44',
  color13: '#4a8800', color14: '#aad860', color15: '#78b82a',
  color16: '#162800', color17: '#5aaa18',
};

// ─────────────────────────────────────────────────────────
//  Reusable Liquid Button
// ─────────────────────────────────────────────────────────
function LiquidButton({
  href,
  children,
  colors,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  colors: Colors;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isExternal = href.startsWith('http');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`relative inline-block group bg-black border-2 border-[#00ffe4]/20 rounded-lg ${className}`}
    >
      {/* glow halo */}
      <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 blur-[19px] opacity-70 pointer-events-none">
        <span className="absolute inset-0 rounded-lg bg-[#d9d9d9] blur-[6.5px]" />
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <Liquid isHovered={isHovered} colors={colors} />
        </div>
      </div>
      {/* dark depth shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92.23%] h-[112.85%] rounded-lg bg-[#010128] blur-[7.3px] pointer-events-none" />
      {/* main surface */}
      <div className="relative w-full h-full overflow-hidden rounded-lg pointer-events-none">
        <span className="absolute inset-0 rounded-lg bg-[#d9d9d9]" />
        <span className="absolute inset-0 rounded-lg bg-black" />
        <Liquid isHovered={isHovered} colors={colors} />
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`absolute inset-0 rounded-lg border-solid border-[3px] border-white/10 mix-blend-overlay filter ${
              i <= 2 ? 'blur-[3px]' : i === 3 ? 'blur-[5px]' : 'blur-[4px]'
            }`}
          />
        ))}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg blur-[15px] bg-[#006]" />
      </div>
      {/* clickable overlay with content */}
      <button
        type="button"
        className="absolute inset-0 rounded-lg bg-transparent cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    </a>
  );
}

// ─────────────────────────────────────────────────────────
//  Custom Cursor
// ─────────────────────────────────────────────────────────
function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, gx = 0, gy = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', onMove);

    let raf: number;
    const tick = () => {
      if (dotRef.current) { dotRef.current.style.left = mx + 'px'; dotRef.current.style.top = my + 'px'; }
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px'; }
      gx += (mx - gx) * 0.06; gy += (my - gy) * 0.06;
      if (glowRef.current) { glowRef.current.style.left = gx + 'px'; glowRef.current.style.top = gy + 'px'; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hover = (v: boolean) => () => document.body.classList.toggle('cursor-hovering', v);
    const els = document.querySelectorAll('a, button');
    els.forEach((el) => { el.addEventListener('mouseenter', hover(true)); el.addEventListener('mouseleave', hover(false)); });

    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={glowRef} className="cursor-glow" />
    </>
  );
}

// ─────────────────────────────────────────────────────────
//  Nav
// ─────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500 ${
        scrolled ? 'bg-[#040404]/90 backdrop-blur-xl border-b border-white/[0.07]' : ''
      }`}
    >
      <a href="#inicio" className="flex items-center">
        <Image src="/Logo.png" alt="SmartFix" width={48} height={48} className="object-cover rounded-full" />
      </a>

      <ul className="hidden md:flex gap-10">
        {[
          ['Serviços', '#servicos'],
          ['Processo', '#processo'],
          ['Cobertura', '#cobertura'],
          ['Avaliações', '#avaliacoes'],
          ['FAQ', '#faq'],
        ].map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="text-[0.72rem] font-medium tracking-[0.06em] text-[#5a5a66] uppercase hover:text-[#F0F0EE] transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <LiquidButton href="#contato" colors={TEAL_COLORS} className="w-36 h-[2.5em]">
        <span className="flex items-center justify-center gap-2 text-white text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.12em] uppercase">
          Diagnóstico
        </span>
      </LiquidButton>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────
//  Hero
// ─────────────────────────────────────────────────────────
function Hero() {
  // shared pulse clock — drives CELULAR stroke + button border in perfect sync
  const pulse = useMotionValue(0);
  useEffect(() => {
    const ctrl = animate(pulse, [0, 1, 0], {
      duration: 2.2,
      ease: 'easeInOut',
      repeat: Infinity,
    });
    return () => ctrl.stop();
  }, [pulse]);

  const strokeColor = useTransform(pulse, [0, 1], ['rgba(125,197,43,0.15)', 'rgba(125,197,43,0.9)']);
  const borderColor = useTransform(pulse, [0, 1], ['rgba(125,197,43,0.15)', 'rgba(125,197,43,0.7)']);
  const borderGlow  = useTransform(pulse, [0, 1], ['0 0 0px rgba(125,197,43,0)', '0 0 14px rgba(125,197,43,0.18)']);

  return (
    <section
      id="inicio"
      className="relative min-h-screen grid md:grid-cols-[1fr_400px] items-center gap-12 px-6 md:px-14 pt-32 pb-20 overflow-hidden"
    >
      {/* grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
        }}
      />
      {/* teal radial glow */}
      <div className="absolute w-[900px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(125,197,43,0.06) 0%, transparent 65%)' }}
      />

      {/* ── content ── */}
      <div className="relative z-10">
        {/* live badge */}
        <div className="inline-flex items-center gap-2 border border-[#7DC52B]/22 bg-[#7DC52B]/5 rounded-full px-4 py-1.5 text-[0.72rem] font-medium tracking-[0.1em] uppercase text-[#7DC52B] mb-9">
          <span className="relative flex-shrink-0 w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#7DC52B]" />
            <span
              className="absolute inset-[-4px] rounded-full bg-[#7DC52B] opacity-40"
              style={{ animation: 'ping-dot 1.8s ease-out infinite' }}
            />
          </span>
          A gente vai até você — grátis
        </div>

        {/* title */}
        <h1
          className="font-[family-name:var(--font-syne)] font-extrabold leading-[0.9] tracking-tight mb-8"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5.5rem)' }}
        >
          <span className="line-clip block">
            <motion.span
              className="block"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              SEU
            </motion.span>
          </span>
          <span className="line-clip block">
            <motion.span
              className="block"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              style={{
                WebkitTextStroke: '1.5px',
                WebkitTextStrokeColor: strokeColor,
                color: 'transparent',
              }}
            >
              CELULAR
            </motion.span>
          </span>
          <span className="line-clip block">
            <motion.span
              className="block"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
            >
              CONSERTADO
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="text-[#8a8a96] text-[1.15rem] leading-[1.75] max-w-[440px] mb-10 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Seu celular quebrou? Nosso técnico vai até o seu endereço em Cascavel. Diagnóstico gratuito, peça original e garantia real — sem você sair de casa.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          {/* ── Liquid Button CTA ── */}
          <LiquidButton href="#contato" colors={TEAL_COLORS} className="w-52 h-12">
            <span className="flex items-center justify-center gap-2 text-white text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider whitespace-nowrap">
              ⚡ Chamar técnico
            </span>
          </LiquidButton>

          <motion.a
            href="#servicos"
            className="flex items-center gap-2 px-6 h-12 rounded-lg border text-sm text-[#F0F0EE] font-medium hover:bg-white/[0.03] transition-colors"
            style={{ borderColor, boxShadow: borderGlow }}
          >
            Ver serviços →
          </motion.a>
        </motion.div>
      </div>

      {/* ── iPhone 17 Mockup ── */}
      <motion.div
        className="relative hidden md:flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        {/* ambient teal glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(125,197,43,0.09) 0%, transparent 68%)',
          }}
        />

        {/* ── iPhone 17 shell ── */}
        <div className="relative" style={{ width: 272, height: 572 }}>

          {/* Titanium frame */}
          <div
            className="absolute inset-0 rounded-[46px]"
            style={{
              background: 'linear-gradient(160deg, #56565a 0%, #2c2c2e 25%, #1c1c1e 55%, #3a3a3c 80%, #4a4a4e 100%)',
              boxShadow:
                'inset 0 0 0 0.5px rgba(255,255,255,0.12), ' +
                '0 0 0 0.5px rgba(0,0,0,0.6), ' +
                '0 50px 100px rgba(0,0,0,0.95), ' +
                '0 0 70px rgba(125,197,43,0.06)',
            }}
          />

          {/* Volume buttons — left side */}
          {[96, 136, 168].map((top, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: -3, top,
                width: 3,
                height: i === 0 ? 28 : 42,
                background: 'linear-gradient(to right, #3a3a3c, #4e4e52)',
                borderRadius: '2px 0 0 2px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            />
          ))}

          {/* Power button — right side */}
          <div
            className="absolute"
            style={{
              right: -3, top: 130,
              width: 3, height: 68,
              background: 'linear-gradient(to left, #3a3a3c, #4e4e52)',
              borderRadius: '0 2px 2px 0',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          />

          {/* Screen glass */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: 3,
              borderRadius: 43,
              background: '#02020a',
            }}
          >
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-7 pt-2 z-20 pointer-events-none">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.6rem] text-white/50 font-bold">9:41</span>
              <span className="font-[family-name:var(--font-space-mono)] text-[0.6rem] text-white/40">▲▲▲ 🔋</span>
            </div>

            {/* Dynamic Island */}
            <div
              className="absolute top-[10px] left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2"
              style={{
                width: 118, height: 34,
                background: '#000',
                borderRadius: 22,
                boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06)',
              }}
            >
              {/* Face ID sensor dot */}
              <div
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'radial-gradient(circle, #1e1e28 40%, #0a0a12)',
                  border: '0.5px solid #2a2a38',
                }}
              />
              {/* Camera lens */}
              <div
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #1a2050 0%, #080816 60%, #000 100%)',
                  border: '0.5px solid #1a1a2a',
                  boxShadow: 'inset 0 0 4px rgba(0,0,255,0.2)',
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(60,80,180,0.4)', margin: '4px auto 0' }} />
              </div>
            </div>

            {/* Diagnostic app UI */}
            <div className="absolute inset-0 pt-14 px-4 pb-6 flex flex-col gap-2">
              {/* App header */}
              <div className="flex items-center justify-between mt-1 mb-1">
                <div className="flex items-center gap-2">
                  <Image src="/Logo.png" alt="SmartFix" width={18} height={18} className="object-cover rounded-full" />
                  <p className="font-[family-name:var(--font-space-mono)] text-[0.68rem] text-white/70 tracking-wider font-bold">
                    SmartFix
                  </p>
                </div>
                <span className="font-[family-name:var(--font-space-mono)] text-[0.52rem] text-[#3a3a4a] bg-[#0f0f18] px-2 py-0.5 rounded-full border border-white/[0.04]">
                  v2.1
                </span>
              </div>

              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(125,197,43,0.08), rgba(125,197,43,0.03))' , border: '1px solid rgba(125,197,43,0.12)' }}
              >
                <span className="text-base">🔧</span>
                <span className="font-[family-name:var(--font-syne)] text-[0.78rem] font-extrabold text-white tracking-widest">
                  DIAGNÓSTICO
                </span>
              </div>

              {/* Diagnostic rows */}
              <div className="flex flex-col gap-1.5 flex-1">
              {[
                { label: 'TELA',    val: 'OK',  ok: true  },
                { label: 'BATERIA', val: '61%', ok: false },
                { label: 'CÂMERA', val: 'OK',  ok: true  },
                { label: 'USB-C',   val: 'OK',  ok: true  },
                { label: 'FACE ID', val: 'OK',  ok: true  },
                { label: 'WI-FI',   val: 'OK',  ok: true  },
              ].map(({ label, val, ok }) => (
                <div
                  key={label}
                  className="flex justify-between items-center px-3 py-2 rounded-xl"
                  style={{
                    background: ok
                      ? 'rgba(125,197,43,0.04)'
                      : 'rgba(255,68,0,0.06)',
                    border: `1px solid ${ok ? 'rgba(125,197,43,0.08)' : 'rgba(255,68,0,0.12)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: ok ? '#7DC52B' : '#FF4400', boxShadow: `0 0 5px ${ok ? 'rgba(125,197,43,0.6)' : 'rgba(255,68,0,0.6)'}` }}
                    />
                    <span className="font-[family-name:var(--font-space-mono)] text-[0.64rem] text-white/60 tracking-widest">
                      {label}
                    </span>
                  </div>
                  <span
                    className="font-[family-name:var(--font-space-mono)] text-[0.7rem] font-bold tracking-wider"
                    style={{ color: ok ? '#7DC52B' : '#FF4400' }}
                  >
                    {ok ? `✓ ${val}` : `⚠ ${val}`}
                  </span>
                </div>
              ))}
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center mb-0.5">
                  <p
                    className="font-[family-name:var(--font-space-mono)] text-[0.58rem] text-[#5a5a66]"
                    style={{ animation: 'blink 1.2s step-end infinite' }}
                  >
                    analisando componentes...
                  </p>
                  <span className="font-[family-name:var(--font-space-mono)] text-[0.58rem] text-[#7DC52B]/50">72%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #7DC52B, #00B4A0)',
                      animation: 'scan-bar 3s ease-out infinite alternate',
                    }}
                  />
                </div>
                <p
                  className="font-[family-name:var(--font-space-mono)] text-[0.58rem] text-[#5a5a66] hidden"
                  style={{ animation: 'blink 1.2s step-end infinite' }}
                >
                  analisando componentes...
                </p>
              </div>
            </div>

            {/* Screen glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 45%)',
                borderRadius: 43,
              }}
            />
          </div>

          {/* USB-C port */}
          <div
            className="absolute bottom-[7px] left-1/2 -translate-x-1/2"
            style={{
              width: 40, height: 5,
              background: '#111114',
              borderRadius: 3,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.9), 0 0.5px 0 rgba(255,255,255,0.04)',
            }}
          />

          {/* Speaker grilles */}
          {[-18, 18].map((offset) => (
            <div
              key={offset}
              className="absolute bottom-[9px]"
              style={{
                left: `calc(50% + ${offset}px)`,
                width: 12, height: 3,
                background: '#0a0a0c',
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────────────────
function Counter({ to, suffix, prefix = '' }: { to: number; suffix: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 2000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, to]);

  return (
    <span ref={ref} className="font-[family-name:var(--font-syne)] text-5xl font-extrabold text-[#F0F0EE] tabular-nums">
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

function Stats() {
  const stats = [
    { to: 300, prefix: '+', suffix: '', label: 'Dispositivos consertados' },
    { to: 98, suffix: '%', label: 'Índice de satisfação' },
    { to: 90, suffix: ' dias', label: 'Garantia em todo serviço' },
    { to: 1, suffix: 'h', label: 'Tempo médio de reparo' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-white/[0.07]">
      {stats.map(({ to, suffix, label, ...rest }, i) => (
        <motion.div
          key={label}
          className={`flex flex-col gap-1.5 px-8 py-10 ${i < 3 ? 'md:border-r border-white/[0.07]' : ''} ${i === 0 ? 'border-r border-white/[0.07]' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
        >
          <Counter to={to} suffix={suffix} prefix={(rest as { prefix?: string }).prefix} />
          <span className="text-xs text-[#5a5a66] tracking-wide">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Marquee
// ─────────────────────────────────────────────────────────
const BRANDS = [
  { name: 'Apple',    slug: 'apple'    },
  { name: 'Samsung',  slug: 'samsung'  },
  { name: 'Motorola', slug: 'motorola' },
  { name: 'Xiaomi',   slug: 'xiaomi'   },
  { name: 'Google',   slug: 'google'   },
  { name: 'OnePlus',  slug: 'oneplus'  },
  { name: 'LG',       slug: 'lg'       },
  { name: 'Asus',     slug: 'asus'     },
  { name: 'Sony',     slug: 'sony'     },
];

function Marquee() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="overflow-hidden border-b border-white/[0.07] py-5 bg-[#0a0a0c]">
      <div className="marquee-track select-none">
        {doubled.map((brand, i) => (
          <span key={i} className="flex items-center gap-6 mx-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://cdn.simpleicons.org/${brand.slug}/5a5a66`}
              alt={brand.name}
              width={32}
              height={32}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(0.65)' }}
            />
            <span className="w-1 h-1 rounded-full bg-[#7DC52B]/20 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Services
// ─────────────────────────────────────────────────────────
const SERVICES = [
  { num: '01', icon: '📱', name: 'TROCA DE TELA',  desc: 'Tela trincada, manchada ou sem toque. Substituímos por display original com garantia de fábrica, para todos os modelos.', time: 'A partir de 30 min', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=80', imgScale: 1 },
  { num: '02', icon: '🔋', name: 'BATERIA',         desc: 'Celular morrendo rápido ou desligando do nada? Trocamos a bateria por uma original e você volta a usar o dia todo.',  time: 'A partir de 20 min', img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700&q=80', imgScale: 1 },
  { num: '03', icon: '📷', name: 'CÂMERA',          desc: 'Fotos borradas, câmera preta ou com falha. Diagnóstico completo e troca de módulo com componentes de alta qualidade.',  time: 'A partir de 45 min', img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&q=80', imgScale: 1.2 },
  { num: '04', icon: '⚡', name: 'CONECTOR USB',    desc: 'Não carrega ou só carrega em posição específica. Soldagem e troca de conector com precisão técnica.',                   time: 'A partir de 40 min', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', imgScale: 1 },
  { num: '05', icon: '💧', name: 'DANO POR ÁGUA',  desc: 'Agimos rápido. Limpeza ultrassônica da placa, secagem profissional e recuperação de componentes afetados pela umidade.', time: 'Em até 24h',         img: '/Celular molhado.avif', imgScale: 1.1 },
  { num: '06', icon: '🔩', name: 'PLACA-MÃE',      desc: 'Microssoldagem de componentes, reballing de chips e reparo de circuitos. Técnicos com estação de retrabalho.',           time: 'Consulte o prazo',   img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80', imgScale: 1 },
];

function Services() {
  const [active, setActive] = useState(0);
  const total = SERVICES.length;

  // auto-advance every 3s
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % total), 3000);
    return () => clearInterval(id);
  }, [total]);

  return (
    <section id="servicos" className="py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-4">
            Do que você mais usa ao que você mais precisa
          </div>
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight mb-8">
            O QUE<br />CONSERTAMOS
          </h2>
          {/* nav row */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.07] relative overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-[#7DC52B]"
                animate={{ width: `${((active + 1) / total) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
            <span className="font-[family-name:var(--font-space-mono)] text-xs text-[#5a5a66]">
              0{active + 1} / 0{total}
            </span>
            <button
              onClick={() => setActive((p) => (p - 1 + total) % total)}
              className="w-9 h-9 border border-[#7DC52B]/50 bg-[#7DC52B]/10 rounded flex items-center justify-center text-[#7DC52B] hover:bg-[#7DC52B]/20 hover:border-[#7DC52B] transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % total)}
              className="w-9 h-9 border border-[#7DC52B]/50 bg-[#7DC52B]/10 rounded flex items-center justify-center text-[#7DC52B] hover:bg-[#7DC52B]/20 hover:border-[#7DC52B] transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* cards grid — all 6 visible, active highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((svc, i) => {
            const isActive = i === active;
            return (
              <motion.div
                key={svc.num}
                onClick={() => setActive(i)}
                className="group relative h-[340px] rounded-2xl overflow-hidden cursor-pointer"
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  filter: isActive ? 'blur(0px)' : 'blur(2px)',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {/* active top bar */}
                <motion.div
                  className="absolute top-0 left-0 h-[3px] bg-[#7DC52B] z-20 rounded-full"
                  animate={{ width: isActive ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />

                {/* background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={svc.img}
                  alt={svc.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ transform: `scale(${svc.imgScale})` }}
                />

                {/* dark vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* number badge top-right */}
                <div className="absolute top-4 right-4 font-[family-name:var(--font-space-mono)] text-[0.6rem] text-white/20 z-10">
                  {svc.num}
                </div>

                {/* glassmorphism content panel */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-5 m-3 rounded-xl transition-all duration-300 z-10"
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <h3 className="font-[family-name:var(--font-syne)] font-extrabold text-sm tracking-wider text-white mb-2">
                    {svc.name}
                  </h3>
                  <p className="text-white/50 text-[0.78rem] leading-relaxed mb-3 line-clamp-2">
                    {svc.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-[#7DC52B] bg-[#7DC52B]/10 border border-[#7DC52B]/20 rounded-full px-3 py-1">
                    <Zap size={9} />
                    {svc.time}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {SERVICES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className="transition-all duration-300">
              <motion.div
                className="rounded-full bg-[#7DC52B]"
                animate={{ width: i === active ? 24 : 6, height: 6, opacity: i === active ? 1 : 0.25 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Parallax Banner
// ─────────────────────────────────────────────────────────
function ParallaxBanner() {
  return (
    <div className="relative py-24 bg-[#0a0a0c] border-t border-b border-white/[0.07] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(125,197,43,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(125,197,43,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          className="font-[family-name:var(--font-syne)] font-bold text-3xl md:text-4xl leading-snug"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Mais de <span className="text-[#7DC52B]">300 dispositivos</span> consertados — no endereço do cliente.
        </motion.p>
        <motion.p
          className="font-[family-name:var(--font-syne)] font-bold text-3xl md:text-4xl leading-snug mt-3 text-[#5a5a66]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Cada reparo feito com{' '}
          <span className="text-shimmer">precisão e cuidado</span> — na sua casa, no seu trabalho, no seu tempo.
        </motion.p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  How It Works
// ─────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '01', name: 'AGENDAMENTO', desc: 'Você escolhe o horário e o endereço. A gente confirma em minutos pelo WhatsApp. Zero deslocamento.' },
    { num: '02', name: 'DIAGNÓSTICO', desc: 'O técnico chega até você e avalia o aparelho na hora. Gratuito, preciso e sem achismo.' },
    { num: '03', name: 'ORÇAMENTO', desc: 'Orçamento claro e sem surpresa. Você aprova — ou não paga nada. Sem pressão.' },
    { num: '04', name: 'REPARO NO LOCAL', desc: 'Consertamos ali mesmo com peças originais e equipamentos profissionais. Pronto na hora, com garantia de 90 dias.' },
  ];

  const [active, setActive] = useState(0);

  // auto-advance every 3s
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % steps.length), 3000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <section id="processo" className="py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-4">
            Transparente do início ao fim
          </div>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight">
              DO AGENDAMENTO<br />AO CONSERTO
            </h2>
            <div className="flex items-center gap-3 pb-1 flex-shrink-0">
              <button
                onClick={() => setActive((p) => (p - 1 + steps.length) % steps.length)}
                className="w-9 h-9 border border-[#7DC52B]/50 bg-[#7DC52B]/10 rounded flex items-center justify-center text-[#7DC52B] hover:bg-[#7DC52B]/20 hover:border-[#7DC52B] transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setActive((p) => (p + 1) % steps.length)}
                className="w-9 h-9 border border-[#7DC52B]/50 bg-[#7DC52B]/10 rounded flex items-center justify-center text-[#7DC52B] hover:bg-[#7DC52B]/20 hover:border-[#7DC52B] transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {steps.map(({ num, name, desc }, i) => {
            const isActive = i === active;
            return (
              <motion.div
                key={num}
                onClick={() => setActive(i)}
                className={`relative p-8 cursor-pointer rounded-lg transition-colors duration-300 ${!isActive && i < 3 ? 'md:border-r border-white/[0.07]' : ''} ${!isActive && i > 0 ? 'border-t md:border-t-0 border-white/[0.07]' : ''}`}
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  borderColor: isActive ? 'rgba(125,197,43,0.45)' : 'rgba(255,255,255,0)',
                  boxShadow: isActive ? '0 0 0 1px rgba(125,197,43,0.45), inset 0 0 20px rgba(125,197,43,0.04)' : '0 0 0 0px rgba(125,197,43,0)',
                }}
                style={{ border: '1px solid transparent' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* active top bar */}
                <motion.div
                  className="absolute top-0 left-0 h-[2px] bg-[#7DC52B] rounded-full"
                  animate={{ width: isActive ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />

                <motion.div
                  className="font-[family-name:var(--font-space-mono)] text-[38px] font-bold mb-4 select-none"
                  animate={{ color: isActive ? 'rgba(125,197,43,0.85)' : 'rgba(125,197,43,0.25)' }}
                  transition={{ duration: 0.4 }}
                >
                  {num}
                </motion.div>
                <h3 className="font-[family-name:var(--font-syne)] font-bold text-[16px] tracking-widest mb-3">
                  {name}
                </h3>
                <motion.p
                  className="text-[#5a5a66] text-[0.85rem] leading-relaxed"
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.4 }}
                >
                  {desc}
                </motion.p>
              </motion.div>
            );
          })}
        </div>

        {/* dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-300"
            >
              <motion.div
                className="rounded-full bg-[#7DC52B]"
                animate={{ width: i === active ? 24 : 6, height: 6, opacity: i === active ? 1 : 0.25 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Differentials — stacking card sub-component
// ─────────────────────────────────────────────────────────
const DIFF_CONTAINER_H = 460;
const DIFF_CARD_H = 148;
const DIFF_TOTAL = 4;
const DIFF_OFFSET = (DIFF_CONTAINER_H - DIFF_CARD_H) / (DIFF_TOTAL - 1); // ~104px

function DiffCard({
  icon: Icon, name, body, index, scrollYProgress,
}: {
  icon: React.ElementType; name: string; body: string;
  index: number; scrollYProgress: MotionValue<number>;
}) {
  const step = 1 / DIFF_TOTAL;
  const start = index * step * 0.85;
  const end = start + step * 0.75;
  const y = useTransform(scrollYProgress, [start, end], [60, 0]);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

  return (
    <motion.div
      className="absolute w-full bg-[#0f0f12] border border-[#7DC52B]/30 rounded-xl p-7"
      style={{
        y,
        opacity,
        top: index * DIFF_OFFSET,
        height: DIFF_CARD_H,
        zIndex: index + 1,
        boxShadow: '0 -6px 40px rgba(0,0,0,0.9)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon size={16} className="text-[#7DC52B] flex-shrink-0" />
        <h3 className="font-[family-name:var(--font-syne)] font-bold text-[14px] tracking-widest">{name}</h3>
      </div>
      <p className="text-[#5a5a66] text-[0.875rem] leading-relaxed line-clamp-3">{body}</p>
    </motion.div>
  );
}

function Differentials() {
  const cards = [
    { icon: Shield, name: 'GARANTIA DE 90 DIAS', body: 'Todo reparo tem garantia de 90 dias por escrito. Se der qualquer problema relacionado ao serviço, a gente volta até você e resolve — sem custo adicional.' },
    { icon: CheckCircle2, name: 'SEM VOCÊ SAIR DE CASA', body: 'Agendou pelo WhatsApp, o técnico vai até o seu endereço em Cascavel. Trabalho, casa, onde preferir. Você não perde tempo.' },
    { icon: Award, name: 'TÉCNICOS CERTIFICADOS', body: 'Nossa equipe é treinada e certificada nas principais marcas. Cada técnico carrega os equipamentos certos para resolver no local.' },
    { icon: Zap, name: 'CONSERTO NA HORA', body: 'A maioria dos reparos é feita ali mesmo, na sua frente. Sem deixar o aparelho, sem aguardar dias. Você acompanha tudo.' },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });

  const cardContainerH = DIFF_CONTAINER_H;

  return (
    <section
      ref={sectionRef}
      id="diferenciais"
      className="relative bg-[#0a0a0c]"
      style={{ minHeight: '200vh' }}
    >
      <div className="sticky top-0 flex items-center px-6 md:px-14" style={{ height: '100vh' }}>
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-[1fr_1fr] gap-16 items-center">
          {/* left */}
          <div>
            <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-5">
              Por que a SmartFix?
            </div>
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight mb-6">
              O TÉCNICO<br />QUE VAI<br />ATÉ VOCÊ
            </h2>
            <p className="text-[#5a5a66] leading-relaxed mb-8">
              Esqueça fila de espera e deixar o celular por dias. A SmartFix vai até você em Cascavel, conserta no local com peças originais e ainda deixa garantia por escrito. Simples assim.
            </p>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7DC52B] text-black text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider rounded hover:shadow-[0_8px_28px_rgba(125,197,43,.3)] hover:-translate-y-0.5 transition-all"
            >
              Chamar técnico →
            </a>
          </div>

          {/* right — stacking cards */}
          <div className="relative" style={{ height: cardContainerH }}>
            {cards.map(({ icon, name, body }, i) => (
              <DiffCard
                key={name}
                icon={icon}
                name={name}
                body={body}
                index={i}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Testimonials
// ─────────────────────────────────────────────────────────
function Testimonials() {
  const cards = [
    { initials: 'FR', name: 'Fernanda R.', role: 'Cliente recorrente · Cascavel, PR', color: '#7DC52B', text: '"Quebrei a tela na sexta à tarde e precisava do celular pra trabalhar na segunda. O técnico chegou na minha casa no mesmo dia, resolveu em menos de 1 hora. Não precisei sair de casa, não fiquei sem aparelho. Recomendo demais."' },
    { initials: 'CE', name: 'Carlos Eduardo M.', role: 'Cliente novo · Cascavel, PR', color: '#FF4400', text: '"Já tive péssima experiência deixando celular em loja — ficou 5 dias e voltou com problema. Na SmartFix o técnico veio até meu trabalho, diagnosticou, orçou e consertou ali mesmo. Peça original e garantia por escrito. Outro nível."' },
    { initials: 'JT', name: 'Juliana T.', role: 'Cliente frequente · Cascavel, PR', color: '#FFD700', text: '"Fui a primeira vez sem expectativa, achei que seria complicado. Mandei mensagem às 10h, o técnico estava na minha casa às 13h. Bateria trocada em 40 minutos. Agora indico pra todo mundo que reclama de fila em assistência técnica."' },
  ];

  return (
    <section id="avaliacoes" className="py-24 px-6 md:px-14">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-4">
            Avaliações reais
          </div>
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight">
            O QUE NOSSOS<br />CLIENTES DIZEM
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ initials, name, role, color, text }, i) => (
            <motion.div
              key={name}
              className="bg-[#0f0f12] border border-white/[0.07] rounded-xl p-7 hover:border-white/15 transition-all flex flex-col gap-5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <div className="text-[#7DC52B] text-sm tracking-wider">★★★★★</div>
              <p className="text-[#5a5a66] text-[0.85rem] leading-relaxed flex-1">{text}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-[family-name:var(--font-syne)] font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}22, ${color}0a)`, color }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{name}</div>
                  <div className="text-[0.72rem] text-[#5a5a66]">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Map Background (canvas)
// ─────────────────────────────────────────────────────────
function MapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ZOOM = 14;
    const TILE = 256;

    const lon2x = (lon: number, z: number) => (lon + 180) / 360 * Math.pow(2, z);
    const lat2y = (lat: number, z: number) => {
      const s = Math.sin(lat * Math.PI / 180);
      return (1 - Math.log((1 + s) / (1 - s)) / (2 * Math.PI)) / 2 * Math.pow(2, z);
    };

    // Waypoints through Cascavel, Paraná
    const WAYPOINTS = [
      [-24.9555, -53.4552], // Centro
      [-24.9620, -53.4680], // Região Sul
      [-24.9700, -53.4600], // Bairro Floresta
      [-24.9680, -53.4450], // Cascavel Leste
      [-24.9580, -53.4380], // Bairro Brasília
      [-24.9490, -53.4480], // Norte do Centro
      [-24.9555, -53.4552], // volta ao centro
    ] as [number, number][];

    let W = 0, H = 0;
    let pulse = 0;
    let t = 0; // global time
    let raf: number;
    let tileCache: Record<string, HTMLImageElement> = {};

    // City light dots — in normalized [0,1] screen space, offset slightly with map movement
    interface Light { nx: number; ny: number; r: number; op: number; color: string; }
    const LIGHTS: Light[] = [];
    const rng = (s: number) => { s = (s * 16807 + 1) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < 180; i++) {
      const nx = rng(i * 3 + 1);
      const ny = rng(i * 3 + 2);
      const sc = rng(i * 3 + 3);
      LIGHTS.push({
        nx, ny,
        r: 12 + sc * 32,
        op: 0.25 + sc * 0.35,
        color: sc < 0.5 ? `255,210,100` : sc < 0.8 ? `255,160,40` : `180,220,255`,
      });
    }

    const getTile = (tx: number, ty: number, z: number): HTMLImageElement => {
      const key = `${z}/${tx}/${ty}`;
      if (tileCache[key]) return tileCache[key];
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://a.basemaps.cartocdn.com/dark_all/${z}/${tx}/${ty}.png`;
      img.onload = () => { tileCache[key] = img; };
      tileCache[key] = img;
      return img;
    };

    const draw = () => {
      W = canvas.width; H = canvas.height;
      const cx = W / 2, cy = H / 2;

      // Fill background dark
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      // Smooth drive through waypoints
      t += 0.0006;
      const total = WAYPOINTS.length - 1;
      const tMod = t % total;
      const seg = Math.floor(tMod);
      const frac = tMod - seg;
      // ease in-out cubic
      const ease = frac < 0.5 ? 4 * frac * frac * frac : 1 - Math.pow(-2 * frac + 2, 3) / 2;
      const [lat1, lon1] = WAYPOINTS[seg];
      const [lat2, lon2] = WAYPOINTS[seg + 1];
      const curLat = lat1 + (lat2 - lat1) * ease;
      const curLon = lon1 + (lon2 - lon1) * ease;

      // Map center in fractional tile coords
      const fx = lon2x(curLon, ZOOM);
      const fy = lat2y(curLat, ZOOM);

      // pixel offset of the center tile
      const tileX = Math.floor(fx);
      const tileY = Math.floor(fy);
      const offX = (fx - tileX) * TILE;
      const offY = (fy - tileY) * TILE;

      // how many tiles needed each side
      const tilesX = Math.ceil(W / TILE / 2) + 2;
      const tilesY = Math.ceil(H / TILE / 2) + 2;

      for (let dy = -tilesY; dy <= tilesY; dy++) {
        for (let dx = -tilesX; dx <= tilesX; dx++) {
          const tx = tileX + dx;
          const ty = tileY + dy;
          const px = cx - offX + dx * TILE;
          const py = cy - offY + dy * TILE;
          const img = getTile(tx, ty, ZOOM);
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, px, py, TILE, TILE);
          }
        }
      }

      // Dark overlay to deepen map contrast
      ctx.fillStyle = 'rgba(4,4,10,0.48)';
      ctx.fillRect(0, 0, W, H);

      // Vignette
      const vg = ctx.createRadialGradient(cx, cy, H * 0.1, cx, cy, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(4,4,10,0)');
      vg.addColorStop(1, 'rgba(4,4,10,0.92)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // City lights — screen space + subtle parallax with map offset
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      LIGHTS.forEach(l => {
        // slight parallax: lights shift a little as map moves
        const px = (l.nx * W + offX * 0.3) % W;
        const py = (l.ny * H + offY * 0.3) % H;
        const g = ctx.createRadialGradient(px, py, 0, px, py, l.r);
        g.addColorStop(0,   `rgba(${l.color},${l.op})`);
        g.addColorStop(0.5, `rgba(${l.color},${l.op * 0.4})`);
        g.addColorStop(1,   `rgba(${l.color},0)`);
        ctx.beginPath(); ctx.arc(px, py, l.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        // bright core
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${l.color},1)`; ctx.fill();
      });
      ctx.restore();

      // Animated green glow + pulse ring
      pulse += 0.022;
      const p = (Math.sin(pulse) + 1) / 2;

      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 130);
      cg.addColorStop(0, `rgba(125,197,43,${0.22 + p * 0.14})`);
      cg.addColorStop(0.5, `rgba(125,197,43,${0.05 + p * 0.05})`);
      cg.addColorStop(1, 'rgba(125,197,43,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();

      // Expanding pulse ring
      const rr = 16 + p * 28;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125,197,43,${0.7 * (1 - p)})`;
      ctx.lineWidth = 1.5; ctx.stroke();

      // Pin dot
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#7DC52B'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#d4f580'; ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); tileCache = {}; };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─────────────────────────────────────────────────────────
//  CTA Final  ← Liquid button here
// ─────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section
      id="contato"
      className="relative py-32 px-6 text-center overflow-hidden border-t border-white/[0.07]"
      style={{ background: '#02050f' }}
    >
      <MapBackground />
      {/* top fade to blend with section above */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #040404, transparent)' }} />
      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #040404, transparent)' }} />
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
        <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase">
          Fale com a gente
        </div>

        <h2 className="font-[family-name:var(--font-syne)] font-extrabold leading-none tracking-tight text-center"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          SEU CELULAR<br />
          <span className="text-shimmer">QUEBROU.</span><br />
          A GENTE RESOLVE.
        </h2>

        <p className="text-[#5a5a66] text-base max-w-md">
          O técnico vai até você em Cascavel. Diagnóstico gratuito, orçamento na hora e reparo com garantia — sem você sair do lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* ── Liquid WhatsApp CTA ── */}
          <LiquidButton
            href="https://wa.me/5511999999999"
            colors={TEAL_COLORS}
            className="w-56 h-12"
          >
            <span className="flex items-center justify-center gap-2 text-white text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider whitespace-nowrap">
              <MessageCircle size={15} />
              Falar no WhatsApp
            </span>
          </LiquidButton>

          <div className="flex items-center gap-2 text-[#5a5a66] text-sm">
            <Phone size={14} />
            (11) 9 9999-9999
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────────────────
//  Urgency Banner
// ─────────────────────────────────────────────────────────
function UrgencyBanner() {
  const [mins, setMins] = useState(47);
  const [secs, setSecs] = useState(22);

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => {
        if (s === 0) { setMins(m => (m === 0 ? 59 : m - 1)); return 59; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#7DC52B] text-black py-4 px-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
      <div className="flex items-center gap-2 font-[family-name:var(--font-syne)] font-bold text-sm tracking-wide">
        <Clock size={15} />
        Próximo técnico disponível em Cascavel em
        <span className="bg-black text-[#7DC52B] font-[family-name:var(--font-space-mono)] px-2 py-0.5 rounded text-sm">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="font-[family-name:var(--font-syne)] font-bold text-xs tracking-widest uppercase underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        Agendar agora →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Coverage
// ─────────────────────────────────────────────────────────
function Coverage() {
  const bairros = [
    'Centro', 'Cascavel Velho', 'Brasmadeira', 'Santa Cruz', 'Parque São Paulo',
    'Jardim Coopagro', 'Floresta', 'Cancelli', 'Neva', 'Interlagos',
    'Maria Luíza', 'São Cristóvão', 'Alto Alegre', 'Universitário', 'Santo Onofre',
    'Periolo', 'Ciro Nardi', 'Parque Verde', 'Parque Lagos', 'Brasília',
  ];

  return (
    <section id="cobertura" className="py-24 px-6 md:px-14 bg-[#0a0a0c]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-2 text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-4">
              <MapPin size={12} />
              Área de atendimento
            </div>
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight">
              ATENDEMOS<br />EM TODO<br />CASCAVEL
            </h2>
          </div>
          <p className="text-[#5a5a66] max-w-sm leading-relaxed md:text-right">
            Seu bairro está na lista? Então é só chamar. O técnico vai até você — sem taxa de deslocamento.
          </p>
        </motion.div>

        {/* bairros grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-12">
          {bairros.map((b, i) => (
            <motion.div
              key={b}
              className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 hover:border-[#7DC52B]/30 hover:bg-[#7DC52B]/5 transition-all"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#7DC52B]/60 flex-shrink-0" />
              <span className="text-[0.75rem] font-medium text-[#8a8a96]">{b}</span>
            </motion.div>
          ))}
          {/* +outros */}
          <motion.div
            className="flex items-center gap-2 bg-[#7DC52B]/10 border border-[#7DC52B]/30 rounded-lg px-3 py-2.5"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: bairros.length * 0.03 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#7DC52B] flex-shrink-0" />
            <span className="text-[0.75rem] font-bold text-[#7DC52B]">+ outros bairros</span>
          </motion.div>
        </div>

        {/* highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: HomeIcon, title: 'Na sua casa', desc: 'Você escolhe o endereço. O técnico chega no horário combinado, sem atraso.' },
            { icon: Award, title: 'No seu trabalho', desc: 'Sem precisar tirar folga ou interromper o expediente. Resolvemos durante o seu horário.' },
            { icon: Clock, title: 'Tempo médio de 1h', desc: 'A maioria dos reparos é feita em até 1 hora. Você entrega e recebe o celular no mesmo lugar.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#7DC52B]/10 border border-[#7DC52B]/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#7DC52B]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-syne)] font-bold text-sm mb-1">{title}</h3>
                <p className="text-[#5a5a66] text-[0.8rem] leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
//  FAQ
// ─────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    {
      q: 'O técnico realmente vem até minha casa?',
      a: 'Sim. Esse é o serviço principal da SmartFix. Você agenda pelo WhatsApp, informa seu endereço em Cascavel e o técnico vai até você no horário combinado — sem taxa de deslocamento.',
    },
    {
      q: 'Quanto tempo leva o reparo?',
      a: 'A maioria dos reparos (troca de tela, bateria, conector) é concluída em até 1 hora no local. Casos mais complexos como placa-mãe podem levar até 24h, mas você é avisado com antecedência.',
    },
    {
      q: 'E se eu não aprovar o orçamento?',
      a: 'Não paga nada. O diagnóstico é 100% gratuito e sem compromisso. Se você não quiser prosseguir com o reparo, o técnico vai embora sem nenhum custo.',
    },
    {
      q: 'As peças são originais?',
      a: 'Trabalhamos exclusivamente com peças originais ou OEM de alta qualidade certificadas para cada modelo. Nenhum componente paralelo que comprometa o desempenho do seu aparelho.',
    },
    {
      q: 'Tem garantia?',
      a: 'Todo reparo tem garantia de 90 dias por escrito. Se qualquer problema relacionado ao serviço aparecer dentro do prazo, voltamos até você e resolvemos sem custo adicional.',
    },
    {
      q: 'Quais marcas vocês atendem?',
      a: 'iPhone, Samsung, Motorola, Xiaomi, Google Pixel, OnePlus, LG, Asus, Sony e outros modelos. Na dúvida, mande mensagem — provavelmente atendemos.',
    },
    {
      q: 'Como funciona o agendamento?',
      a: 'Só pelo WhatsApp. Manda mensagem, a gente confirma disponibilidade, você informa o endereço e o horário preferido. Simples assim.',
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 md:px-14">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-4">
            Dúvidas frequentes
          </div>
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-5xl md:text-6xl leading-none tracking-tight">
            PERGUNTAS<br />FREQUENTES
          </h2>
        </motion.div>

        <div className="flex flex-col divide-y divide-white/[0.07]">
          {items.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-[family-name:var(--font-syne)] font-semibold text-[0.95rem] group-hover:text-[#7DC52B] transition-colors">
                  {q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0 text-[#7DC52B]"
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="text-[#5a5a66] text-[0.88rem] leading-relaxed pb-5">
                  {a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#040404] px-6 md:px-14 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <a href="#inicio" className="flex items-center">
        <Image src="/Logo.png" alt="SmartFix" width={44} height={44} className="object-cover rounded-full" />
      </a>
      <ul className="flex flex-wrap gap-8 justify-center">
        {[['Serviços', '#servicos'], ['Cobertura', '#cobertura'], ['Avaliações', '#avaliacoes'], ['FAQ', '#faq'], ['Contato', '#contato']].map(([label, href]) => (
          <li key={href}>
            <a href={href} className="text-xs tracking-widest text-[#5a5a66] uppercase hover:text-[#F0F0EE] transition-colors">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <span className="text-xs text-[#2a2a32] tracking-wide">© 2026 SmartFix</span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <UrgencyBanner />
        <Stats />
        <Marquee />
        <Services />
        <ParallaxBanner />
        <HowItWorks />
        <Differentials />
        <Coverage />
        <Testimonials />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
