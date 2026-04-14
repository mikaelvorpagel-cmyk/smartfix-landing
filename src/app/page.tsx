'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate, useScroll, MotionValue } from 'motion/react';
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
  X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
//  Cybernetic Grid — WebGL shader (hero background)
// ─────────────────────────────────────────────────────────
function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = compileShader(gl.VERTEX_SHADER, `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `);

    const fs = compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform vec2  iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse          - 0.5 * iResolution.xy) / iResolution.y;

        float t         = iTime * 0.2;
        float mouseDist = length(uv - mouse);

        // warp around cursor
        float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.08;
        warp *= smoothstep(0.4, 0.0, mouseDist);
        uv += warp;

        // grid lines
        vec2  gridUv = abs(fract(uv * 10.0) - 0.5);
        float line   = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);

        // brand green base
        vec3 base      = vec3(0.016, 0.016, 0.016);
        vec3 gridColor = vec3(0.49, 0.773, 0.169);
        vec3 color     = base + gridColor * line * (0.35 + sin(t * 2.0) * 0.12);

        // energy pulses
        float energy = sin(uv.x * 20.0 + t * 5.0) * sin(uv.y * 20.0 + t * 3.0);
        energy = smoothstep(0.8, 1.0, energy);
        color += vec3(0.75, 1.0, 0.35) * energy * line * 0.7;

        // cursor glow
        float glow = smoothstep(0.15, 0.0, mouseDist);
        color += gridColor * glow * 0.5;

        // subtle noise
        color += random(uv + t * 0.1) * 0.02;

        gl_FragColor = vec4(color, 1.0);
      }
    `);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs!);
    gl.attachShader(prog, fs!);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1,  1,
      -1,  1,  1, -1,   1,  1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, 'iResolution');
    const uTime  = gl.getUniformLocation(prog, 'iTime');
    const uMouse = gl.getUniformLocation(prog, 'iMouse');

    const mouse = { x: 0, y: 0 };
    let raf: number;
    const start = performance.now();

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uRes, canvas.width, canvas.height);
      mouse.x = canvas.width  / 2;
      mouse.y = canvas.height / 2;
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      mouse.x = (e.clientX - rect.left)  * dpr;
      mouse.y = canvas.height - (e.clientY - rect.top) * dpr;
    }

    function draw() {
      gl!.uniform1f(uTime,  (performance.now() - start) / 1000);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('mousemove', onMouseMove);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
//  Reusable Glow Button
// ─────────────────────────────────────────────────────────
function LiquidButton({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colors?: any;
  className?: string;
}) {
  const isExternal = href.startsWith('http');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`relative inline-flex items-center justify-center rounded-full bg-[#7DC52B] cursor-pointer group transition-all duration-300 ${className}`}
      style={{
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 0 10px rgba(125,197,43,0.25), 0 0 28px rgba(125,197,43,0.12), inset 0 0 10px rgba(255,255,255,0.06)',
      }}
    >
      {/* hover glow amplifier */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 0 18px rgba(125,197,43,0.4), 0 0 50px rgba(125,197,43,0.20)',
        }}
      />
      {/* content + dot */}
      <span className="relative flex items-center gap-3 px-4">
        {children}
        <span
          className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0"
          style={{ boxShadow: '0 0 6px rgba(0,0,0,0.6)' }}
        />
      </span>
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

      <LiquidButton href="#contato" className="h-10">
        <span className="flex items-center justify-center gap-2 text-black text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.12em] uppercase">
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
      duration: 5,
      ease: 'easeInOut',
      repeat: Infinity,
    });
    return () => ctrl.stop();
  }, [pulse]);

  const strokeColor = useTransform(pulse, [0, 1], ['rgba(125,197,43,0.10)', 'rgba(125,197,43,0.45)']);
  const borderColor = useTransform(pulse, [0, 1], ['rgba(125,197,43,0.10)', 'rgba(125,197,43,0.35)']);
  const borderGlow  = useTransform(pulse, [0, 1], ['0 0 0px rgba(125,197,43,0)', '0 0 10px rgba(125,197,43,0.08)']);

  return (
    <section
      id="inicio"
      className="relative min-h-screen grid md:grid-cols-[1fr_1fr] items-center gap-12 px-6 md:px-14 pt-32 pb-20 overflow-hidden"
    >
      {/* cybernetic grid shader */}
      <CyberGrid />
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
          style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4.85rem)' }}
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
          <LiquidButton href="#contato" className="w-60 h-14">
            <span className="flex items-center justify-center gap-2 text-black text-base font-[family-name:var(--font-syne)] font-bold tracking-wider whitespace-nowrap">
              Chamar técnico
            </span>
          </LiquidButton>

          <motion.a
            href="#servicos"
            className="flex items-center gap-2 px-8 h-14 rounded-lg border text-base text-[#F0F0EE] font-medium hover:bg-white/[0.03] transition-colors"
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
    <span ref={ref} className="font-[family-name:var(--font-syne)] text-[22px] font-extrabold text-[#F0F0EE] tabular-nums">
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
          <span className="text-sm text-[#5a5a66] tracking-wide">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Marquee
// ─────────────────────────────────────────────────────────
const BRANDS = [
  { name: 'Apple',    slug: 'apple',    size: 20 },
  { name: 'Samsung',  slug: 'samsung',  size: 20 },
  { name: 'Motorola', slug: 'motorola', size: 20 },
  { name: 'Xiaomi',   slug: 'xiaomi',   size: 20 },
  { name: 'Google',   slug: 'google',   size: 20 },
  { name: 'OnePlus',  slug: 'oneplus',  size: 20 },
  { name: 'LG',       slug: 'lg',       size: 30 },
  { name: 'Asus',     slug: 'asus',     size: 30 },
  { name: 'Sony',     slug: 'sony',     size: 30 },
];

function Marquee() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="overflow-x-hidden border-b border-white/[0.07] py-4" style={{ background: 'rgba(10,10,12,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="marquee-track select-none">
        {doubled.map((brand, i) => (
          <span key={i} className="flex items-center gap-6 mx-6 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://cdn.simpleicons.org/${brand.slug}/5a5a66`}
              alt={brand.name}
              width={brand.size}
              height={brand.size}
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
  const [hovered, setHovered] = useState<number | null>(null);
  const total = SERVICES.length;

  // auto-advance every 3s, pauses on hover
  useEffect(() => {
    if (hovered !== null) return;
    const id = setInterval(() => setActive((p) => (p + 1) % total), 3000);
    return () => clearInterval(id);
  }, [total, hovered]);

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
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight mb-8">
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
            const isActive = i === (hovered ?? active);
            return (
              <motion.div
                key={svc.num}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
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
                  <h3 className="font-[family-name:var(--font-syne)] font-extrabold text-[18px] tracking-wider text-white mb-2">
                    {svc.name}
                  </h3>
                  <p className="text-white/50 text-[1.03rem] leading-relaxed mb-3 line-clamp-2">
                    {svc.desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[0.93rem] font-medium text-[#7DC52B] bg-[#7DC52B]/10 border border-[#7DC52B]/20 rounded-full px-3 py-1">
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
    <div className="relative py-24 border-t border-b border-white/[0.07] overflow-hidden" style={{ background: 'rgba(10,10,12,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
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
    { num: '01', name: 'AGENDAMENTO', desc: 'Você preenche um formulário informando seu endereço, e aguarda o contato no WhatsApp.' },
    { num: '02', name: 'DIAGNÓSTICO', desc: 'Caso não seja possível um orçamento online, vamos até você e avaliamos o aparelho. Apenas com o custo de deslocamento.' },
    { num: '03', name: 'ORÇAMENTO', desc: 'Orçamento claro e sem surpresa. Você aprova, ou não paga nada.' },
    { num: '04', name: 'REPARO NO LOCAL', desc: 'Consertamos ali mesmo com peças originais e equipamentos profissionais. Pronto em minutos, com garantia de 90 dias.' },
  ];

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // auto-advance every 3s, pauses on hover
  useEffect(() => {
    if (hovered !== null) return;
    const id = setInterval(() => setActive((p) => (p + 1) % steps.length), 3000);
    return () => clearInterval(id);
  }, [steps.length, hovered]);

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
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight">
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
            const isActive = i === (hovered ?? active);
            return (
              <motion.div
                key={num}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`relative p-8 cursor-pointer rounded-lg transition-colors duration-300 ${!isActive && i < 3 ? 'md:border-r border-white/[0.07]' : ''} ${!isActive && i > 0 ? 'border-t md:border-t-0 border-white/[0.07]' : ''}`}
                style={{ background: 'rgba(10,10,12,0.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
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
                  className="font-[family-name:var(--font-space-mono)] text-[42px] font-bold mb-4 select-none"
                  animate={{ color: isActive ? 'rgba(125,197,43,0.85)' : 'rgba(125,197,43,0.25)' }}
                  transition={{ duration: 0.4 }}
                >
                  {num}
                </motion.div>
                <h3 className="font-[family-name:var(--font-syne)] font-bold text-[20px] tracking-widest mb-3">
                  {name}
                </h3>
                <motion.p
                  className="text-[#5a5a66] text-[1.1rem] leading-relaxed"
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
function DiffCard({
  icon: Icon, name, body, index, inView,
}: {
  icon: React.ElementType; name: string; body: string;
  index: number; inView: boolean;
}) {
  const delays = [0, 0.4, 0.8, 1.2];

  return (
    <motion.div
      className="w-full border border-[#7DC52B]/30 rounded-xl p-7"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay: delays[index], ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(15,18,12,0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon size={16} className="text-[#7DC52B] flex-shrink-0" />
        <h3 className="font-[family-name:var(--font-syne)] font-bold text-[18px] tracking-widest">{name}</h3>
      </div>
      <p className="text-[#8a8a96] text-[18px] leading-relaxed">{body}</p>
    </motion.div>
  );
}

function Differentials() {
  const cards = [
    { icon: Shield, name: 'GARANTIA DE 90 DIAS', body: 'Todo reparo tem garantia de 90 dias por escrito. Se der qualquer problema relacionado ao serviço, a gente volta até você e resolve — sem custo adicional.' },
    { icon: CheckCircle2, name: 'SEM VOCÊ SAIR DE CASA', body: 'Agendou pelo WhatsApp, o técnico vai até o seu endereço em Cascavel e região. Trabalho, casa, onde preferir. Você não perde tempo.' },
    { icon: Award, name: 'TÉCNICOS CERTIFICADOS', body: 'Nossa equipe é treinada e certificada nas principais marcas. Cada técnico carrega os equipamentos certos para resolver no local.' },
    { icon: Zap, name: 'CONSERTO NA HORA', body: 'A maioria dos reparos é feita ali mesmo, na sua frente. Sem deixar o aparelho, sem aguardar dias. Você acompanha tudo.' },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-15%' });

  return (
    <section
      ref={sectionRef}
      id="diferenciais"
      className="relative py-24 px-6 md:px-14"
      style={{
        background: 'rgba(8,10,8,0.55)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1px solid rgba(125,197,43,0.08)',
        borderBottom: '1px solid rgba(125,197,43,0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-[1fr_1fr] gap-16 items-start">
          {/* left */}
          <div>
            <div className="text-[#7DC52B] text-[0.7rem] font-[family-name:var(--font-syne)] font-bold tracking-[0.15em] uppercase mb-5">
              Por que a SmartFix?
            </div>
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight mb-6">
              O TÉCNICO<br />QUE VAI<br />ATÉ VOCÊ
            </h2>
            <p className="text-[#5a5a66] text-[20px] leading-relaxed mb-8">
              Esqueça fila de espera e deixar o celular por dias. A SmartFix vai até você em Cascavel e região, conserta no local e ainda te dá garantia de até 90 dias.
            </p>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7DC52B] text-black text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider rounded hover:shadow-[0_8px_28px_rgba(125,197,43,.3)] hover:-translate-y-0.5 transition-all"
            >
              Chamar técnico →
            </a>
          </div>

          {/* right — stacking cards */}
          <div className="flex flex-col gap-4">
            {cards.map(({ icon, name, body }, i) => (
              <DiffCard
                key={name}
                icon={icon}
                name={name}
                body={body}
                index={i}
                inView={inView}
              />
            ))}
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
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight">
            O QUE NOSSOS<br />CLIENTES DIZEM
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ initials, name, role, color, text }, i) => (
            <motion.div
              key={name}
              className="border border-white/[0.07] rounded-xl p-7 hover:border-white/15 transition-all flex flex-col gap-5"
              style={{ background: 'rgba(15,15,18,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
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
            className="w-56 h-12"
          >
            <span className="flex items-center justify-center gap-2 text-black text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider whitespace-nowrap">
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
      <div className="flex items-center gap-2 font-[family-name:var(--font-syne)] font-bold text-base tracking-wide">
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

  const [selectedBairro, setSelectedBairro] = useState<string | null>(null);
  const [outraCidadeOpen, setOutraCidadeOpen] = useState(false);
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Alta' | 'Prioritário'>('Normal');
  const [priorityOutra, setPriorityOutra] = useState<'Normal' | 'Alta' | 'Prioritário'>('Normal');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const formOpen = !!selectedBairro || outraCidadeOpen;
  const tabKey = selectedBairro ? 'bairro-form' : outraCidadeOpen ? 'outra-form' : 'grid';

  useEffect(() => {
    if (formOpen && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [formOpen, selectedBairro, outraCidadeOpen]);

  function resetFields() { setRua(''); setNumero(''); setComplemento(''); }

  function handleBairroClick(b: string) {
    if (selectedBairro === b) {
      setSelectedBairro(null);
    } else {
      setSelectedBairro(b);
      setOutraCidadeOpen(false);
      resetFields();
    }
  }

  function handleOutraCidadeClick() {
    const next = !outraCidadeOpen;
    setOutraCidadeOpen(next);
    setSelectedBairro(null);
    setCidade('');
    resetFields();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const addr = `${rua}, ${numero}${complemento ? ', ' + complemento : ''} — ${selectedBairro}, Cascavel, PR`;
    const msg = encodeURIComponent(`Olá! Gostaria de agendar uma visita técnica no endereço: ${addr}.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  }

  function handleOutraCidadeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const addr = `${rua}, ${numero}${complemento ? ', ' + complemento : ''} — ${cidade}, PR`;
    const msg = encodeURIComponent(`Olá! Sou de ${cidade} e gostaria de verificar atendimento no endereço: ${addr}.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  }

  return (
    <section id="cobertura" className="pt-24 pb-36 px-6 md:px-14" style={{ background: 'rgba(10,10,12,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
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
            <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight">
              ATENDEMOS<br />EM TODO<br />CASCAVEL
            </h2>
          </div>
          <p className="text-[#a0a0a8] max-w-sm leading-relaxed md:text-right text-[17px]">
            Seu bairro está na lista? Então é só chamar. O técnico vai até você.
          </p>
        </motion.div>

        {/* hint */}
        <div className="flex justify-center mb-6">
          <div className="px-5 py-3 rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5">
            <span className="text-[1rem] text-[#C9A84C]/80 font-medium tracking-wide">Selecione seu endereço e informe seus dados.</span>
          </div>
        </div>

        {/* bairros grid — always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
          {bairros.map((b, i) => (
            <motion.button
              key={b}
              onClick={() => handleBairroClick(b)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all cursor-pointer border bg-white/[0.03] border-white/[0.06] hover:border-[#7DC52B]/30 hover:bg-[#7DC52B]/5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#7DC52B]/60" />
              <span className="text-[0.875rem] font-medium text-[#8a8a96]">{b}</span>
            </motion.button>
          ))}
        </div>
        <motion.div
          className="flex justify-center mt-6 mb-28"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: bairros.length * 0.03 }}
        >
          <button
            onClick={handleOutraCidadeClick}
            className="flex flex-col items-center gap-1 px-8 py-3 rounded-xl border transition-all cursor-pointer bg-white/[0.03] border-white/[0.06] hover:border-[#7DC52B]/30 hover:bg-[#7DC52B]/5"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#7DC52B]/60" />
              <span className="text-[0.925rem] font-bold text-[#7DC52B]">+ outra cidade</span>
            </div>
            <span className="text-[0.8rem] text-[#5a5a66]">é da região, clique aqui</span>
          </button>
        </motion.div>

        {/* modal overlay — fixed, blurs page behind, form centered */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[500] flex items-center justify-center px-4"
              style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(4,4,4,0.65)' }}
              onClick={(e) => { if (e.target === e.currentTarget) { setSelectedBairro(null); setOutraCidadeOpen(false); } }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md rounded-2xl border border-white/[0.1] p-7"
                style={{ background: 'rgba(12,13,11,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                {/* bairro form */}
                {selectedBairro && (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <button onClick={() => setSelectedBairro(null)} className="flex items-center gap-1.5 text-[#5a5a66] hover:text-white transition-colors text-[0.75rem] font-medium">
                        <ChevronLeft size={14} />Voltar
                      </button>
                      <button onClick={() => setSelectedBairro(null)} className="text-[#5a5a66] hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                    <div className="mb-6">
                      <p className="text-[0.65rem] text-[#7DC52B] font-[family-name:var(--font-syne)] font-bold tracking-[0.18em] uppercase mb-2">Atendimento em Cascavel</p>
                      <h3 className="font-[family-name:var(--font-syne)] font-extrabold text-[22px] text-white leading-tight">Informe o endereço</h3>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua / Avenida" required className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" required className="bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                        <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento" className="bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                      </div>
                      <div className="mt-1">
                        <p className="text-[0.65rem] text-[#5a5a66] font-[family-name:var(--font-syne)] font-bold tracking-[0.14em] uppercase mb-3">Prioridade de atendimento</p>
                        <div className="flex flex-col gap-2">
                          {(['Normal', 'Alta', 'Prioritário'] as const).map((opt) => {
                            const active = priority === opt;
                            return (
                              <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${active ? 'border-[#7DC52B]/60 bg-[#7DC52B]/8' : 'border-white/[0.07] hover:border-white/[0.14]'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${active ? 'border-[#7DC52B]' : 'border-[#3a3a46]'}`}>
                                  {active && <div className="w-2 h-2 rounded-full bg-[#7DC52B]" />}
                                </div>
                                <input type="radio" name="priority" value={opt} checked={active} onChange={() => setPriority(opt)} className="sr-only" />
                                <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-[#8a8a96]'}`}>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <button type="submit" className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-[#7DC52B] text-black text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider rounded-lg hover:bg-[#8fd030] hover:shadow-[0_8px_24px_rgba(125,197,43,.35)] transition-all">
                        <MessageCircle size={14} />Confirmar e chamar técnico →
                      </button>
                    </form>
                  </>
                )}

                {/* outra cidade form */}
                {outraCidadeOpen && (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <button onClick={() => setOutraCidadeOpen(false)} className="flex items-center gap-1.5 text-[#5a5a66] hover:text-white transition-colors text-[0.75rem] font-medium">
                        <ChevronLeft size={14} />Voltar
                      </button>
                      <button onClick={() => setOutraCidadeOpen(false)} className="text-[#5a5a66] hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                    <div className="mb-6">
                      <p className="text-[0.65rem] text-[#7DC52B] font-[family-name:var(--font-syne)] font-bold tracking-[0.18em] uppercase mb-2">Atendimento fora de Cascavel</p>
                      <h3 className="font-[family-name:var(--font-syne)] font-extrabold text-[22px] text-white leading-tight">Informe o endereço</h3>
                    </div>
                    <form onSubmit={handleOutraCidadeSubmit} className="flex flex-col gap-3">
                      <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" required className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                      <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua / Avenida" required className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" required className="bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                        <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento" className="bg-white/[0.05] border border-white/[0.09] rounded-lg px-4 py-3 text-sm text-white placeholder-[#3a3a46] focus:outline-none focus:border-[#7DC52B]/50 transition-all" />
                      </div>
                      <div className="mt-1">
                        <p className="text-[0.65rem] text-[#5a5a66] font-[family-name:var(--font-syne)] font-bold tracking-[0.14em] uppercase mb-3">Prioridade de atendimento</p>
                        <div className="flex flex-col gap-2">
                          {(['Normal', 'Alta', 'Prioritário'] as const).map((opt) => {
                            const active = priorityOutra === opt;
                            return (
                              <label key={opt} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${active ? 'border-[#7DC52B]/60 bg-[#7DC52B]/8' : 'border-white/[0.07] hover:border-white/[0.14]'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${active ? 'border-[#7DC52B]' : 'border-[#3a3a46]'}`}>
                                  {active && <div className="w-2 h-2 rounded-full bg-[#7DC52B]" />}
                                </div>
                                <input type="radio" name="priorityOutra" value={opt} checked={active} onChange={() => setPriorityOutra(opt)} className="sr-only" />
                                <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-[#8a8a96]'}`}>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <button type="submit" className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 bg-[#7DC52B] text-black text-sm font-[family-name:var(--font-syne)] font-bold tracking-wider rounded-lg hover:bg-[#8fd030] hover:shadow-[0_8px_24px_rgba(125,197,43,.35)] transition-all">
                        <MessageCircle size={14} />Confirmar e chamar técnico →
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: HomeIcon, title: 'Na sua casa', desc: 'Você escolhe o endereço. O técnico chega no horário combinado, sem atraso.' },
            { icon: Award, title: 'No seu trabalho', desc: 'Sem precisar tirar folga ou interromper o expediente. Resolvemos durante o seu horário.' },
            { icon: Clock, title: 'Tempo médio de 1h', desc: 'A maioria dos reparos é feita em até 1 hora. Você entrega e recebe o celular no mesmo lugar.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="border border-white/[0.07] rounded-xl p-6 flex gap-4"
              style={{ background: 'rgba(15,15,18,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#7DC52B]/10 border border-[#7DC52B]/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#7DC52B]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-syne)] font-bold text-[1rem] mb-1">{title}</h3>
                <p className="text-[#5a5a66] text-[0.925rem] leading-relaxed">{desc}</p>
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
          <h2 className="font-[family-name:var(--font-syne)] font-extrabold text-[38px] md:text-[50px] leading-none tracking-tight">
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
//  Rain Canvas (background, very subtle)
// ─────────────────────────────────────────────────────────
function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // SmartFix green, very desaturated for subtlety
    const R = 125, G = 197, B = 43;
    const COUNT = 45;

    let W = 0, H = 0;
    let raf: number;

    type Particle = { x: number; y: number; vy: number; vx: number; opacity: number; len: number; width: number };
    let particles: Particle[] = [];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function make(spread = false): Particle {
      return {
        x: Math.random() * W,
        y: spread ? Math.random() * H : -80,
        vy: 1.2 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.3,
        opacity: 0.18 + Math.random() * 0.22,
        len: 55 + Math.random() * 60,
        width: 0.8 + Math.random() * 1.0,
      };
    }

    function init(spread = false) {
      particles = Array.from({ length: COUNT }, () => make(spread));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y - p.len > H) Object.assign(p, make(false));

        const grad = ctx.createLinearGradient(p.x, p.y - p.len, p.x, p.y);
        grad.addColorStop(0, `rgba(${R},${G},${B},0)`);
        grad.addColorStop(0.6, `rgba(${R},${G},${B},${+(p.opacity * 0.5).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${R},${G},${B},${+p.opacity.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.len);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.width;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${B},${+(p.opacity * 0.4).toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    init(true);
    draw();

    const onResize = () => { resize(); init(true); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <RainCanvas />
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
