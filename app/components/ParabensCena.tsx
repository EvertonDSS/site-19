"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const TEXTO_PARABENS = "Parabéns";

const CORES_CONFETE = [
  "#f472b6",
  "#c084fc",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#fb7185",
  "#fde047",
];

const CORES_FOGO = [
  "#fef08a",
  "#f472b6",
  "#c084fc",
  "#fb923c",
  "#38bdf8",
  "#4ade80",
  "#facc15",
  "#ffffff",
];

const MS_FLASH_E_REVELA = 780;
/** Após o flash radial (~420ms) para não cortar a animação */
const MS_FLASH_FIM = 1250;
const MS_FOGOS_FIM = 1650;
/** Após a festa aparecer, tempo até o placar mudar de 29 para 30 */
const MS_PLACAR_VIRAR_30 = 1000;
const MS_BALAO_ESTOURO = 520;
const MS_BALAO_RESPAWN = 2000;

type FaseBalao = "ok" | "estourando" | "escondido";

type BalaoCfg = {
  id: number;
  tipo: "round" | "heart";
  cor?: string;
  corTexto?: string;
  leftPct: number;
  topPct: number;
  centro: boolean;
  duracaoS: number;
  atrasoS: number;
  entradaDelayS: number;
  /** Só desktop / etc. */
  classExtra?: string;
};

const BALOES_INICIAIS: BalaoCfg[] = [
  {
    id: 1,
    tipo: "round",
    cor: "bg-rose-500",
    leftPct: 10,
    topPct: 8,
    centro: false,
    duracaoS: 3.2,
    atrasoS: 0,
    entradaDelayS: 0.05,
  },
  {
    id: 2,
    tipo: "round",
    cor: "bg-sky-500",
    leftPct: 90,
    topPct: 12,
    centro: true,
    duracaoS: 3.6,
    atrasoS: 0.4,
    entradaDelayS: 0.12,
  },
  {
    id: 3,
    tipo: "round",
    cor: "bg-amber-400",
    leftPct: 14,
    topPct: 78,
    centro: false,
    duracaoS: 3.4,
    atrasoS: 0.2,
    entradaDelayS: 0.18,
  },
  {
    id: 4,
    tipo: "round",
    cor: "bg-violet-500",
    leftPct: 88,
    topPct: 74,
    centro: true,
    duracaoS: 3.1,
    atrasoS: 0.6,
    entradaDelayS: 0.1,
  },
  {
    id: 5,
    tipo: "round",
    cor: "bg-emerald-500",
    leftPct: 50,
    topPct: 7,
    centro: true,
    duracaoS: 3.5,
    atrasoS: 0.3,
    entradaDelayS: 0.22,
  },
  {
    id: 6,
    tipo: "round",
    cor: "bg-fuchsia-500",
    leftPct: 24,
    topPct: 16,
    centro: false,
    duracaoS: 3.3,
    atrasoS: 0.15,
    entradaDelayS: 0.08,
    classExtra: "hidden sm:flex",
  },
  {
    id: 7,
    tipo: "round",
    cor: "bg-orange-400",
    leftPct: 78,
    topPct: 20,
    centro: false,
    duracaoS: 3.45,
    atrasoS: 0.5,
    entradaDelayS: 0.14,
    classExtra: "hidden sm:flex",
  },
  {
    id: 8,
    tipo: "round",
    cor: "bg-cyan-400",
    leftPct: 8,
    topPct: 44,
    centro: false,
    duracaoS: 3.25,
    atrasoS: 0.25,
    entradaDelayS: 0.06,
  },
  {
    id: 9,
    tipo: "round",
    cor: "bg-pink-400",
    leftPct: 92,
    topPct: 40,
    centro: true,
    duracaoS: 3.55,
    atrasoS: 0.35,
    entradaDelayS: 0.16,
  },
  {
    id: 10,
    tipo: "round",
    cor: "bg-lime-400",
    leftPct: 20,
    topPct: 88,
    centro: false,
    duracaoS: 3.15,
    atrasoS: 0.55,
    entradaDelayS: 0.11,
  },
  {
    id: 11,
    tipo: "round",
    cor: "bg-indigo-400",
    leftPct: 82,
    topPct: 86,
    centro: true,
    duracaoS: 3.4,
    atrasoS: 0.1,
    entradaDelayS: 0.2,
  },
  {
    id: 12,
    tipo: "round",
    cor: "bg-teal-400",
    leftPct: 42,
    topPct: 5,
    centro: false,
    duracaoS: 3.5,
    atrasoS: 0.45,
    entradaDelayS: 0.09,
    classExtra: "hidden md:flex",
  },
  {
    id: 13,
    tipo: "round",
    cor: "bg-red-400",
    leftPct: 62,
    topPct: 90,
    centro: false,
    duracaoS: 3.2,
    atrasoS: 0.2,
    entradaDelayS: 0.13,
    classExtra: "hidden lg:flex",
  },
  {
    id: 14,
    tipo: "heart",
    corTexto: "text-rose-500 dark:text-rose-400",
    leftPct: 14,
    topPct: 28,
    centro: false,
    duracaoS: 3.35,
    atrasoS: 0.3,
    entradaDelayS: 0.07,
  },
  {
    id: 15,
    tipo: "heart",
    corTexto: "text-fuchsia-600 dark:text-fuchsia-400",
    leftPct: 86,
    topPct: 26,
    centro: true,
    duracaoS: 3.5,
    atrasoS: 0.5,
    entradaDelayS: 0.15,
  },
  {
    id: 16,
    tipo: "heart",
    corTexto: "text-pink-600 dark:text-pink-400",
    leftPct: 10,
    topPct: 68,
    centro: false,
    duracaoS: 3.2,
    atrasoS: 0.15,
    entradaDelayS: 0.1,
  },
  {
    id: 17,
    tipo: "heart",
    corTexto: "text-red-500 dark:text-red-400",
    leftPct: 90,
    topPct: 66,
    centro: true,
    duracaoS: 3.45,
    atrasoS: 0.4,
    entradaDelayS: 0.17,
  },
  {
    id: 18,
    tipo: "heart",
    corTexto: "text-rose-600 dark:text-rose-300",
    leftPct: 50,
    topPct: 14,
    centro: true,
    duracaoS: 3.6,
    atrasoS: 0.25,
    entradaDelayS: 0.19,
  },
];

function posicaoBalaoAleatoria(): { leftPct: number; topPct: number; centro: boolean } {
  return {
    leftPct: 6 + Math.random() * 88,
    topPct: 8 + Math.random() * 78,
    centro: Math.random() > 0.65,
  };
}

/** Explosão visual ao estourar balão: anel + espiral de confete + onda (sem som). */
function EfeitoVisualEstouroBalao({
  x,
  y,
  token,
}: {
  x: number;
  y: number;
  token: number;
}) {
  const nAnel = 22;
  const nEspiral = 32;
  return (
    <div
      key={token}
      className="parabens-estouro-layer pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute"
        style={{
          left: x,
          top: y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="parabens-estouro-flash" />
        {Array.from({ length: nAnel }, (_, i) => {
          const ang = (360 / nAnel) * i + (token % 13) * 0.7;
          const dist = 36 + (i % 4) * 16;
          return (
            <span
              key={`a-${i}`}
              className="parabens-estouro-particula parabens-estouro-anel absolute left-0 top-0 rounded-[2px] shadow-sm"
              style={
                {
                  width: 5 + (i % 3),
                  height: 6 + (i % 3),
                  marginLeft: -3,
                  marginTop: -3,
                  backgroundColor:
                    CORES_CONFETE[(i + token) % CORES_CONFETE.length],
                  ["--estouro-ang" as string]: `${ang}deg`,
                  ["--estouro-dist" as string]: `${dist}px`,
                  ["--estouro-twist" as string]: "0deg",
                  animationDelay: `${(i % 5) * 0.01}s`,
                } as CSSProperties
              }
            />
          );
        })}
        {Array.from({ length: nEspiral }, (_, i) => {
          const ang = i * 19 + (token % 7);
          const dist = 14 + i * 5.2;
          const twist = 55 + (i % 9) * 8;
          const w = 4 + (i % 4);
          const h = 4 + ((i + 1) % 4);
          const mx = Math.floor(-w / 2);
          const my = Math.floor(-h / 2);
          return (
            <span
              key={`s-${i}`}
              className="parabens-estouro-particula parabens-estouro-espiral absolute left-0 top-0 rounded-full shadow-sm"
              style={
                {
                  width: w,
                  height: h,
                  marginLeft: mx,
                  marginTop: my,
                  backgroundColor:
                    CORES_CONFETE[(i * 2 + token) % CORES_CONFETE.length],
                  ["--estouro-ang" as string]: `${ang}deg`,
                  ["--estouro-dist" as string]: `${dist}px`,
                  ["--estouro-twist" as string]: `${twist}deg`,
                  animationDelay: `${0.02 + (i % 7) * 0.008}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function BalaoParabensClicavel({
  cfg,
  fase,
  onPop,
}: {
  cfg: BalaoCfg;
  fase: FaseBalao;
  onPop: (id: number, clientX: number, clientY: number) => void;
}) {
  const posStyle: CSSProperties = {
    left: `${cfg.leftPct}%`,
    top: `${cfg.topPct}%`,
    ...(cfg.centro ? { transform: "translate(-50%, -50%)" } : {}),
  };

  const miolo =
    cfg.tipo === "round" && cfg.cor ? (
      <>
        <div
          className={`relative h-[4.5rem] w-14 rounded-full shadow-md ${cfg.cor} after:absolute after:left-1/2 after:top-full after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1 after:rotate-45 after:rounded-sm after:bg-inherit after:content-['']`}
        />
        <div className="h-24 w-px bg-zinc-400/70 dark:bg-zinc-500/70" />
      </>
    ) : (
      <>
        <svg
          viewBox="0 0 24 24"
          className={`h-[4.25rem] w-[4.25rem] drop-shadow-md ${cfg.corTexto ?? ""}`}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <div className="h-20 w-px bg-zinc-400/70 dark:bg-zinc-500/70" />
      </>
    );

  return (
    <button
      type="button"
      className={`parabens-balao-clicavel parabens-balao-entrada absolute z-[22] flex flex-col items-center border-0 bg-transparent p-0 touch-manipulation outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 ${cfg.classExtra ?? ""} ${fase === "estourando" ? "parabens-balao-clicavel-estourando" : ""}`}
      style={{ ...posStyle, animationDelay: `${cfg.entradaDelayS}s` }}
      onClick={(e) => fase === "ok" && onPop(cfg.id, e.clientX, e.clientY)}
      aria-label="Estourar balão de festa"
    >
      <div
        className="flex flex-col items-center"
        style={{
          animation: `parabens-balao ${cfg.duracaoS}s ease-in-out infinite`,
          animationDelay: `${cfg.atrasoS}s`,
        }}
      >
        {miolo}
      </div>
    </button>
  );
}

/**
 * Chama + pavio na mesma base do exemplo (flex column, flame → wick, #ffad00, twirl + glow).
 * `ancoraY`: borda inferior do foreignObject = base do pavio (topo do traço do texto ~y 7–8; não deve invadir o dourado).
 */
function ChamaVelaExemploCss({ ancoraY }: { ancoraY: number }) {
  const foH = 142;
  const foW = 92;
  return (
    <foreignObject
      x={-foW / 2}
      y={ancoraY - foH}
      width={foW}
      height={foH}
      className="parabens-candle-fo"
    >
      <div
        {...({
          xmlns: "http://www.w3.org/1999/xhtml",
          className: "parabens-candle-fo-host",
        } as Record<string, unknown>)}
      >
        <div className="parabens-candle">
          <div className="parabens-candle-flame" aria-hidden />
          <div className="parabens-candle-wick" aria-hidden />
        </div>
      </div>
    </foreignObject>
  );
}

function VelaAlgarismo({
  algarismo,
  gid,
  ox,
}: {
  algarismo: "3" | "0";
  gid: string;
  ox: number;
}) {
  const go = `url(#${gid}-ouro)`;
  const brilho = `url(#${gid}-brilho)`;
  return (
    <g transform={`translate(${ox}, 10.25)`}>
            <rect
        x={-1.25}
        y={34}
        width={2.5}
        height={16}
        rx={0.4}
        fill="#fafafa"
        stroke="#e4e4e7"
        strokeWidth="0.35"
      />
      <text
        x={0}
        y={32}
        textAnchor="middle"
        dominantBaseline="auto"
        fontFamily="ui-sans-serif, system-ui, Segoe UI, sans-serif"
        fontWeight="900"
        fontSize={34}
        fill={go}
        stroke="#713f12"
        strokeWidth={0.55}
        paintOrder="stroke fill"
        letterSpacing="-0.04em"
      >
        {algarismo}
      </text>
      <text
        x={0}
        y={32}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, Segoe UI, sans-serif"
        fontWeight="900"
        fontSize={34}
        fill="none"
        stroke={brilho}
        strokeWidth={1.15}
        opacity={0.45}
        letterSpacing="-0.04em"
      >
        {algarismo}
      </text>
      <g
        transform={
          algarismo === "3"
            ? "translate(-0.2, 0)"
            : "translate(1, 0)"
        }
      >
        <ChamaVelaExemploCss
          ancoraY={algarismo === "3" ? 7.75 : 7.75}
        />
      </g>
    </g>
  );
}

function BoloComVela({ velaAtiva }: { velaAtiva: boolean }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 200 200"
      className="vela-svg-bolo mx-auto h-auto w-full max-w-[220px] overflow-visible drop-shadow-lg"
      role="img"
      aria-label={
        velaAtiva
          ? "Bolo com velas em forma dos algarismos três e zero acesas"
          : "Bolo de aniversário sem velas"
      }
    >
      <defs>
        <linearGradient id={`${gid}-ouro`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="22%" stopColor="#fde68a" />
          <stop offset="48%" stopColor="#f59e0b" />
          <stop offset="72%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id={`${gid}-brilho`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter
          id={`${gid}-sombra`}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
        >
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.2"
            floodOpacity="0.35"
          />
        </filter>
      </defs>
      <ellipse cx="100" cy="178" rx="72" ry="10" fill="#c4b5a0" opacity="0.9" />
      <rect
        x="40"
        y="130"
        width="120"
        height="44"
        rx="10"
        fill="#fda4af"
        stroke="#fb7185"
        strokeWidth="1.5"
      />
      <rect
        x="52"
        y="92"
        width="96"
        height="42"
        rx="9"
        fill="#fef3c7"
        stroke="#fcd34d"
        strokeWidth="1.5"
      />
      <rect
        x="62"
        y="58"
        width="76"
        height="38"
        rx="8"
        fill="#5c4033"
        stroke="#3f2e26"
        strokeWidth="1.5"
      />
      {velaAtiva && (
        <g className="parabens-vela-grupo" filter={`url(#${gid}-sombra)`}>
          <VelaAlgarismo algarismo="3" gid={gid} ox={86} />
          <VelaAlgarismo algarismo="0" gid={gid} ox={118} />
        </g>
      )}
    </svg>
  );
}

function Confete() {
  const pecas = Array.from({ length: 32 }, (_, i) => ({
    left: `${5 + (i * 17) % 90}%`,
    delay: `${(i % 8) * 0.07 + (i % 3) * 0.02}s`,
    duration: `${2.2 + (i % 6) * 0.25}s`,
    drift: `${-40 + (i % 9) * 10}px`,
    cor: CORES_CONFETE[i % CORES_CONFETE.length],
    largura: i % 3 === 0 ? 10 : 6,
    altura: i % 3 === 0 ? 6 : 10,
  }));

  return (
    <div
      className="parabens-confete-camada pointer-events-none absolute left-0 right-0 top-0 z-[2] overflow-hidden"
      style={{ height: "min(50vh, 30rem)" }}
      aria-hidden
    >
      {pecas.map((p, i) => (
        <span
          key={i}
          className="parabens-confete absolute rounded-[2px] shadow-sm"
          style={
            {
              left: p.left,
              top: "-6%",
              width: p.largura,
              height: p.altura,
              backgroundColor: p.cor,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--drift": p.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Confetes a “explodir” a partir do topo (vários pontos), em loop suave */
function ConfeteExplosoesFundo() {
  const centros = [
    { l: 10, t: 7 },
    { l: 28, t: 9 },
    { l: 50, t: 6 },
    { l: 72, t: 9 },
    { l: 90, t: 7 },
    { l: 38, t: 11 },
    { l: 62, t: 11 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      {centros.map((c, bi) => (
        <div
          key={bi}
          className="absolute"
          style={{
            left: `${c.l}%`,
            top: `${c.t}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {Array.from({ length: 26 }, (_, i) => {
            const ang = (360 / 26) * i + bi * 11;
            const dist = 52 + (i % 9) * 12 + (bi % 2) * 8;
            return (
              <span
                key={i}
                className="parabens-confete-burst-peca absolute left-0 top-0 rounded-[2px] shadow-sm"
                style={
                  {
                    width: 4 + (i % 3),
                    height: 5 + (i % 4),
                    backgroundColor: CORES_CONFETE[(i + bi * 2) % CORES_CONFETE.length],
                    ["--angulo" as string]: `${ang}deg`,
                    ["--dist" as string]: `${-dist}px`,
                    animationDelay: `${bi * 0.32 + (i % 10) * 0.035}s`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Explosao({
  leftPct,
  topPct,
  delayMs,
  raios,
}: {
  leftPct: number;
  topPct: number;
  delayMs: number;
  raios: number;
}) {
  const particulas = Array.from({ length: raios }, (_, i) => {
    const base = (360 / raios) * i;
    const jitter = (i % 5) * 1.4 - 3;
    return {
      angulo: base + jitter,
      dist: 72 + (i % 8) * 14 + (i % 3) * 6,
      cor: CORES_FOGO[i % CORES_FOGO.length],
    };
  });

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden
    >
      {particulas.map((p, i) => (
        <span
          key={i}
          className="parabens-fogo-raio absolute rounded-full"
          style={
            {
              left: "50%",
              top: "50%",
              width: 5,
              height: 5,
              marginLeft: -2.5,
              marginTop: -2.5,
              backgroundColor: p.cor,
              boxShadow: `0 0 10px 2px ${p.cor}`,
              ["--angulo" as string]: `${p.angulo}deg`,
              ["--dist" as string]: `${p.dist}px`,
              animationDelay: `${delayMs}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function PlacarIdade({ idade }: { idade: 29 | 30 }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1 z-[45] flex -translate-x-1/2 flex-col items-center gap-1.5 px-3 sm:top-2">
      {idade === 30 && (
        <div className="parabens-trintou-faixa" aria-hidden>
          <span className="block font-black uppercase tracking-[0.32em] text-white text-[0.68rem] sm:text-xs sm:tracking-[0.38em]">
            TRINTOU
          </span>
        </div>
      )}
      <div
        className="rounded-2xl border-[3px] border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-950 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 dark:border-zinc-600 dark:from-zinc-900 dark:to-black"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-center text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
          Anos
        </p>
        <p
          key={idade}
          className={`parabens-placar-numero mt-1 text-center font-mono text-5xl font-bold tabular-nums leading-none text-amber-300 sm:text-6xl ${
            idade === 30 ? "parabens-placar-vira" : "parabens-placar-entra"
          }`}
          style={{
            textShadow:
              "0 0 20px rgba(251, 191, 36, 0.65), 0 0 40px rgba(245, 158, 11, 0.35), 0 2px 0 rgba(0,0,0,0.5)",
          }}
        >
          {idade}
        </p>
      </div>
    </div>
  );
}

function CamadaFogos({ ativa }: { ativa: boolean }) {
  if (!ativa) return null;
  return (
    <div
      className="parabens-fogos-camada pointer-events-none absolute inset-0 z-[25] overflow-hidden"
      aria-hidden
    >
      <Explosao leftPct={18} topPct={28} delayMs={0} raios={42} />
      <Explosao leftPct={82} topPct={32} delayMs={160} raios={40} />
      <Explosao leftPct={50} topPct={22} delayMs={320} raios={48} />
      <Explosao leftPct={12} topPct={48} delayMs={420} raios={36} />
      <Explosao leftPct={88} topPct={52} delayMs={520} raios={38} />
      <Explosao leftPct={50} topPct={42} delayMs={620} raios={56} />
    </div>
  );
}

export function ParabensCena() {
  const [revelarFesta, setRevelarFesta] = useState(false);
  const [fogosAtivos, setFogosAtivos] = useState(true);
  const [flash, setFlash] = useState(false);
  const [idadePlacar, setIdadePlacar] = useState<29 | 30>(29);
  const [baloes, setBaloes] = useState<BalaoCfg[]>(BALOES_INICIAIS);
  const [faseBalao, setFaseBalao] = useState<Record<number, FaseBalao>>({});
  const [remountBalao, setRemountBalao] = useState<Record<number, number>>({});
  const [estouroFx, setEstouroFx] = useState<{
    x: number;
    y: number;
    token: number;
  } | null>(null);
  const estourandoIdsRef = useRef<Set<number>>(new Set());
  const timeoutsBalaoRef = useRef<number[]>([]);
  const estouroTokenRef = useRef(0);

  const handleEstourarBalao = useCallback(
    (id: number, clientX: number, clientY: number) => {
      if (estourandoIdsRef.current.has(id)) return;
      estourandoIdsRef.current.add(id);
      const reduzir =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduzir) {
        estouroTokenRef.current += 1;
        setEstouroFx({
          x: clientX,
          y: clientY,
          token: estouroTokenRef.current,
        });
        const tFx = window.setTimeout(() => setEstouroFx(null), 640);
        timeoutsBalaoRef.current.push(tFx);
      }

      setFaseBalao((s) => ({ ...s, [id]: "estourando" }));

      const t1 = window.setTimeout(() => {
        setFaseBalao((s) => ({ ...s, [id]: "escondido" }));
      }, MS_BALAO_ESTOURO);
      timeoutsBalaoRef.current.push(t1);

      const t2 = window.setTimeout(() => {
        const p = posicaoBalaoAleatoria();
        setBaloes((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  leftPct: p.leftPct,
                  topPct: p.topPct,
                  centro: p.centro,
                  classExtra: undefined,
                }
              : b,
          ),
        );
        setRemountBalao((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
        setFaseBalao((s) => {
          const n = { ...s };
          delete n[id];
          return n;
        });
        estourandoIdsRef.current.delete(id);
      }, MS_BALAO_ESTOURO + MS_BALAO_RESPAWN);
      timeoutsBalaoRef.current.push(t2);
    },
    [],
  );

  useEffect(() => {
    return () => {
      timeoutsBalaoRef.current.forEach((tid) => window.clearTimeout(tid));
      timeoutsBalaoRef.current = [];
      estourandoIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!revelarFesta) {
      setIdadePlacar(29);
      return;
    }
    setIdadePlacar(29);
    const id = window.setTimeout(() => setIdadePlacar(30), MS_PLACAR_VIRAR_30);
    return () => window.clearTimeout(id);
  }, [revelarFesta]);

  useEffect(() => {
    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzirMovimento) {
      setRevelarFesta(true);
      setFogosAtivos(false);
      return;
    }

    setFogosAtivos(true);
    const tRevela = window.setTimeout(() => {
      setFlash(true);
      setRevelarFesta(true);
    }, MS_FLASH_E_REVELA);
    const tFlash = window.setTimeout(() => setFlash(false), MS_FLASH_FIM);
    const tFogos = window.setTimeout(() => setFogosAtivos(false), MS_FOGOS_FIM);
    return () => {
      window.clearTimeout(tRevela);
      window.clearTimeout(tFlash);
      window.clearTimeout(tFogos);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes parabens-balao {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes parabens-balao-entrada {
          from { opacity: 0; transform: translateY(28px) scale(0.45); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .parabens-balao-entrada {
          animation: parabens-balao-entrada 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .vela-svg-bolo {
          overflow: visible;
        }
        /* Base do exemplo: .candle (flame → wick), cores e keyframes equivalentes ao SCSS */
        .parabens-candle-fo {
          overflow: visible;
        }
        .parabens-candle-fo-host {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          overflow: visible;
          padding: 36px 22px 0;
        }
        .parabens-candle {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0;
        }
        .parabens-candle-flame {
          display: block;
          width: 15px;
          height: 30px;
          margin: 0;
          background: #ffad00;
          border-radius: 8px 8px 8px 8px / 20px 20px 8px 8px;
          box-shadow: 0px 0px 20px 0px #ffad00;
          flex-shrink: 0;
          animation: parabens-flame-twirl 15s ease infinite,
            parabens-candle-glow 2s ease infinite;
        }
        .parabens-candle-wick {
          display: block;
          height: 10px;
          width: 3px;
          margin: 0;
          background: #ad87a9;
          flex-shrink: 0;
        }
        @keyframes parabens-flame-twirl {
          0%,
          22%,
          49%,
          62%,
          81%,
          100% {
            border-radius: 2px 14px 8px 8px / 20px 20px 8px 8px;
          }
          14%,
          32%,
          56%,
          70%,
          89% {
            border-radius: 14px 2px 8px 8px / 20px 20px 8px 8px;
          }
        }
        @keyframes parabens-candle-glow {
          0%,
          30%,
          60%,
          80%,
          100% {
            box-shadow: 0 0 20px 0 #ffad00;
          }
          20%,
          50%,
          70% {
            box-shadow: 0 0 22px 0 #ffad00;
          }
        }
        @keyframes parabens-titulo-brilo {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(244, 114, 182, 0.35)); }
          50% { filter: drop-shadow(0 0 28px rgba(251, 191, 36, 0.45)); }
        }
        .parabens-titulo-wrap {
          animation: parabens-titulo-brilo 3s ease-in-out infinite;
        }
        @keyframes parabens-bolo-entra {
          from { opacity: 0; transform: translateY(36px) scale(0.75) rotate(-4deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }
        .parabens-bolo-wrap {
          animation: parabens-bolo-entra 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }
        @keyframes parabens-palmas-entra {
          from { opacity: 0; transform: translateY(16px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .parabens-palmas-wrap {
          animation: parabens-palmas-entra 0.6s ease-out 0.72s both;
        }
        @keyframes parabens-palmas {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.05); }
          75% { transform: rotate(8deg) scale(1.05); }
        }
        .parabens-palmas span {
          display: inline-block;
          animation: parabens-palmas 0.35s ease-in-out infinite;
          animation-delay: 0.95s;
        }
        .parabens-palmas span:nth-child(2) { animation-delay: 1.03s; }
        .parabens-palmas span:nth-child(3) { animation-delay: 1.11s; }
        .parabens-palmas span:nth-child(4) { animation-delay: 1.19s; }
        .parabens-palmas span:nth-child(5) { animation-delay: 1.27s; }
        @keyframes parabens-confete-cair {
          0% { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; }
          6% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 52vh, 0) rotate(520deg); opacity: 0; }
        }
        .parabens-confete {
          animation-name: parabens-confete-cair;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes parabens-confete-burst {
          0% {
            transform: rotate(var(--angulo, 0deg)) translateY(0) scale(0.2);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angulo, 0deg)) translateY(var(--dist, -70px))
              scale(1);
            opacity: 0;
          }
        }
        .parabens-confete-burst-peca {
          transform-origin: 50% 50%;
          animation: parabens-confete-burst 2.75s ease-out infinite;
        }
        @keyframes parabens-balao-estouro {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        .parabens-balao-clicavel-estourando > div {
          animation: parabens-balao-estouro ${MS_BALAO_ESTOURO}ms ease-in forwards !important;
        }
        @keyframes parabens-trintou-aparece {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .parabens-trintou-faixa {
          animation: parabens-trintou-aparece 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
          border-radius: 9999px;
          border: 2px solid rgba(253, 230, 138, 0.95);
          background: linear-gradient(
            90deg,
            #f59e0b,
            #ea580c 45%,
            #e11d48 100%
          );
          padding: 0.4rem 1.15rem 0.45rem;
          box-shadow:
            0 4px 22px rgba(251, 146, 60, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }
        .dark .parabens-trintou-faixa {
          border-color: rgba(251, 191, 36, 0.55);
          box-shadow:
            0 4px 26px rgba(234, 88, 12, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        @keyframes parabens-estouro-explode {
          0% {
            transform: rotate(var(--estouro-ang, 0deg)) translateY(2px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--estouro-ang, 0deg) + var(--estouro-twist, 0deg)))
              translateY(calc(-1 * var(--estouro-dist, 48px)))
              scale(0.12);
            opacity: 0;
          }
        }
        @keyframes parabens-estouro-flash {
          0% {
            transform: scale(0.18);
            opacity: 0.88;
          }
          100% {
            transform: scale(3.4);
            opacity: 0;
          }
        }
        .parabens-estouro-flash {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 5rem;
          height: 5rem;
          margin-left: -2.5rem;
          margin-top: -2.5rem;
          border-radius: 9999px;
          border: 3px solid rgba(255, 255, 255, 0.85);
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(253, 224, 71, 0.25) 40%,
            transparent 70%
          );
          transform-origin: center center;
          animation: parabens-estouro-flash 0.45s ease-out forwards;
          pointer-events: none;
        }
        .parabens-estouro-particula {
          transform-origin: 50% 50%;
          animation: parabens-estouro-explode 0.52s cubic-bezier(0.12, 0.85, 0.22, 1) forwards;
        }
        .parabens-estouro-anel {
          animation-duration: 0.48s;
        }
        .parabens-estouro-espiral {
          animation-duration: 0.58s;
        }
        @keyframes parabens-fogo-raio {
          0% {
            transform: rotate(var(--angulo, 0deg)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angulo, 0deg)) translateY(var(--dist, 120px)) scale(0.12);
            opacity: 0;
          }
        }
        .parabens-fogo-raio {
          animation: parabens-fogo-raio 0.95s ease-out forwards;
        }
        @keyframes parabens-flash-explosao {
          0% { opacity: 0; }
          18% { opacity: 0.92; }
          100% { opacity: 0; }
        }
        .parabens-flash-ativo {
          animation: parabens-flash-explosao 0.42s ease-out forwards;
          background: radial-gradient(
            circle at 50% 42%,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(254, 240, 138, 0.45) 28%,
            transparent 62%
          );
        }
        @keyframes parabens-revela-da-explosao {
          0% {
            opacity: 0;
            transform: scale(0.12) rotate(-6deg);
            filter: blur(20px) brightness(2.2);
          }
          45% {
            opacity: 1;
            filter: blur(0) brightness(1.2);
            transform: scale(1.05) rotate(1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
            filter: blur(0) brightness(1);
          }
        }
        .parabens-conteudo-revela {
          animation: parabens-revela-da-explosao 1.05s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes parabens-placar-entra {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .parabens-placar-entra {
          animation: parabens-placar-entra 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes parabens-placar-vira {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          35% {
            transform: scale(1.18);
            filter: brightness(1.45);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }
        .parabens-placar-vira {
          animation: parabens-placar-vira 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes parabens-vela-cai {
          0% {
            transform: translateY(-108px);
            opacity: 1;
          }
          68% {
            transform: translateY(5px);
          }
          82% {
            transform: translateY(-3px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .parabens-vela-grupo {
          transform-origin: 100px 60px;
          animation: parabens-vela-cai 0.85s cubic-bezier(0.25, 0.85, 0.35, 1.12)
            forwards;
        }
        @media (max-height: 620px) {
          .parabens-cena-raiz {
            padding-top: 0.2rem;
            padding-bottom: 0.2rem;
          }
          .parabens-conteudo-revela {
            padding-top: 0.15rem;
            padding-bottom: 0.1rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .parabens-balao-entrada,
          .parabens-titulo-wrap,
          .parabens-bolo-wrap,
          .parabens-palmas-wrap,
          .parabens-confete,
          .parabens-confete-camada,
          .parabens-fogo-raio,
          .parabens-fogos-camada,
          .parabens-conteudo-revela,
          .parabens-flash-ativo,
          .parabens-placar-entra,
          .parabens-placar-vira,
          .parabens-vela-grupo {
            animation: none !important;
            transform: none !important;
          }
          .parabens-balao-entrada,
          .parabens-bolo-wrap,
          .parabens-palmas-wrap {
            opacity: 1;
            transform: none;
            filter: none;
          }
          .parabens-confete-camada { display: none; }
          .parabens-confete-burst-peca {
            animation: none !important;
            opacity: 0;
          }
          .parabens-trintou-faixa {
            animation: none !important;
            opacity: 1;
            transform: none;
          }
          .parabens-estouro-flash {
            animation: none !important;
            opacity: 0;
          }
          .parabens-estouro-particula {
            animation: none !important;
            opacity: 0;
          }
          .parabens-balao-clicavel > div {
            animation: none !important;
          }
          .parabens-candle-flame {
            animation: none !important;
            box-shadow: 0 0 20px 0 #ffad00;
          }
          .parabens-palmas span {
            animation: parabens-palmas 0.35s ease-in-out infinite;
            animation-delay: 0s;
          }
          .parabens-palmas span:nth-child(2) { animation-delay: 0.08s; }
          .parabens-palmas span:nth-child(3) { animation-delay: 0.16s; }
          .parabens-palmas span:nth-child(4) { animation-delay: 0.24s; }
          .parabens-palmas span:nth-child(5) { animation-delay: 0.32s; }
        }
      `}</style>
      <div className="parabens-cena-raiz relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-fuchsia-100 via-rose-50 to-amber-100 px-4 py-4 dark:from-violet-950 dark:via-rose-950 dark:to-amber-950 sm:px-6 sm:py-8">
        <div
          className={`parabens-cortina-noite pointer-events-none absolute inset-0 z-[20] bg-gradient-to-b from-slate-950 via-violet-950/95 to-slate-950 transition-opacity duration-[600ms] ease-out motion-reduce:transition-none ${
            revelarFesta ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        />

        <CamadaFogos ativa={fogosAtivos} />

        {flash && (
          <div
            className="parabens-flash-ativo pointer-events-none absolute inset-0 z-[35]"
            aria-hidden
          />
        )}

        {revelarFesta && (
          <div className="parabens-conteudo-revela relative z-[40] flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-1 overflow-hidden pt-4 pb-2 sm:gap-2 sm:pt-8 sm:pb-4">
            {estouroFx && (
              <EfeitoVisualEstouroBalao
                x={estouroFx.x}
                y={estouroFx.y}
                token={estouroFx.token}
              />
            )}
            <PlacarIdade idade={idadePlacar} />
            <ConfeteExplosoesFundo />
            <Confete />

            {baloes.map((b) => {
              const f = faseBalao[b.id] ?? "ok";
              if (f === "escondido") return null;
              return (
                <BalaoParabensClicavel
                  key={`${b.id}-${remountBalao[b.id] ?? 0}`}
                  cfg={b}
                  fase={f}
                  onPop={handleEstourarBalao}
                />
              );
            })}

            <h1 className="parabens-titulo-wrap relative z-[26] max-w-[95vw] bg-gradient-to-r from-fuchsia-600 via-rose-600 to-amber-600 bg-clip-text px-1 text-center text-3xl font-extrabold leading-tight tracking-tight text-transparent drop-shadow-sm sm:text-5xl md:text-6xl dark:from-fuchsia-300 dark:via-rose-300 dark:to-amber-300">
              {TEXTO_PARABENS}
            </h1>

            <div className="parabens-bolo-wrap relative z-10 mt-3 w-full max-w-[min(100%,18rem)] shrink-0 overflow-visible sm:mt-6">
              <BoloComVela velaAtiva={idadePlacar === 30} />
            </div>

            <div
              className="parabens-palmas parabens-palmas-wrap relative z-10 mt-3 shrink-0 select-none text-4xl sm:mt-6 sm:text-5xl"
              role="img"
              aria-label="Palmas"
            >
              <span>👏</span>
              <span>👏</span>
              <span>👏</span>
              <span>👏</span>
              <span>👏</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
