"use client";

import { useEffect, useRef, useState } from "react";
import { ParabensCena } from "../components/ParabensCena";

/**
 * Teste: `true` = contador em `/contador` usa só `DURACAO_CONTADOR_TESTE_MS` e depois abre parabéns.
 * `false` = data real até 19/04/2026 00h; se já for dia 19 (ou depois), espera `DURACAO_APOS_DATA_ALVO_MS`.
 */
const EXIBIR_CONTEUDO_DE_TESTE_ANTES = true;

const DURACAO_CONTADOR_TESTE_MS = 1_000;

/** Quando a data-alvo já passou (contador “zerado”), tempo até abrir parabéns */
const DURACAO_APOS_DATA_ALVO_MS = 5_000;

/** Duração da saída do contador (ms) — alinhar com timeout de remoção */
const TRANSICAO_SAIDA_MS = 700;

/** Meia-noite (00h) do dia 19/04/2026 no fuso horário do navegador */
const DATA_ALVO = new Date(2026, 3, 19, 0, 0, 0, 0);

function partesDoTempoRestante(ms: number) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

function BlocoNumero({
  valor,
  rotulo,
}: {
  valor: number;
  rotulo: string;
}) {
  const texto = String(valor).padStart(2, "0");
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="font-mono text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {texto}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {rotulo}
      </span>
    </div>
  );
}

export default function ContadorPage() {
  const [msRestante, setMsRestante] = useState<number | null>(null);
  const fimContadorTesteRef = useRef<number | null>(null);
  /** Só no modo real: fim da espera de 5s após já ter chegado ao dia 19 */
  const fimAtrasoAposAlvoRef = useRef<number | null>(null);
  const [parabensAnimado, setParabensAnimado] = useState(false);
  const [removerCamadaContador, setRemoverCamadaContador] = useState(false);
  /** Modo real e já passou da meia-noite do dia 19 — contagem de 5s até parabéns */
  const [emEsperaAposAlvo, setEmEsperaAposAlvo] = useState(false);

  const carregando = msRestante === null;
  const acabou = !carregando && msRestante !== null && msRestante <= 0;
  const partes = carregando
    ? { dias: 0, horas: 0, minutos: 0, segundos: 0 }
    : partesDoTempoRestante(msRestante);

  useEffect(() => {
    const atualizar = () => {
      const agora = Date.now();
      const alvoMs = DATA_ALVO.getTime();

      if (EXIBIR_CONTEUDO_DE_TESTE_ANTES) {
        fimAtrasoAposAlvoRef.current = null;
        setEmEsperaAposAlvo(false);
        if (fimContadorTesteRef.current === null) {
          fimContadorTesteRef.current = agora + DURACAO_CONTADOR_TESTE_MS;
        }
        setMsRestante(fimContadorTesteRef.current - agora);
        return;
      }

      fimContadorTesteRef.current = null;

      if (agora >= alvoMs) {
        setEmEsperaAposAlvo(true);
        if (fimAtrasoAposAlvoRef.current === null) {
          fimAtrasoAposAlvoRef.current = agora + DURACAO_APOS_DATA_ALVO_MS;
        }
        setMsRestante(fimAtrasoAposAlvoRef.current - agora);
      } else {
        fimAtrasoAposAlvoRef.current = null;
        setEmEsperaAposAlvo(false);
        setMsRestante(alvoMs - agora);
      }
    };
    atualizar();
    const id = setInterval(atualizar, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!acabou) {
      setParabensAnimado(false);
      setRemoverCamadaContador(false);
      return;
    }
    const idAnimar = window.setTimeout(() => setParabensAnimado(true), 40);
    const idRemover = window.setTimeout(() => {
      setRemoverCamadaContador(true);
    }, TRANSICAO_SAIDA_MS + 120);
    return () => {
      window.clearTimeout(idAnimar);
      window.clearTimeout(idRemover);
    };
  }, [acabou]);

  const mostrarCamadaContador = !acabou || !removerCamadaContador;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {acabou && (
        <div
          className={`relative z-0 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            parabensAnimado
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-[0.98] opacity-0 blur-[2px]"
          }`}
        >
          <ParabensCena />
        </div>
      )}

      {mostrarCamadaContador && (
        <div
          className={`absolute inset-0 z-20 flex min-h-0 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-6 transition-[opacity,transform,filter] ease-out motion-reduce:transition-none dark:bg-black sm:px-6 sm:py-10 ${
            acabou
              ? "pointer-events-none scale-[0.94] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0 duration-300"
          }`}
          style={
            acabou
              ? { transitionDuration: `${TRANSICAO_SAIDA_MS}ms` }
              : undefined
          }
          aria-hidden={acabou}
        >
          <div className="w-full max-w-2xl space-y-6 text-center sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Contagem regressiva até
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {EXIBIR_CONTEUDO_DE_TESTE_ANTES ? (
                  <>
                    Contagem de teste
                    <span className="mt-2 block text-base font-normal text-zinc-500 dark:text-zinc-400">
                      Recarregar a página reinicia o tempo de teste
                    </span>
                  </>
                ) : emEsperaAposAlvo ? (
                  <>
                    Chegou o dia 19!
                    <span className="mt-2 block text-base font-normal text-zinc-500 dark:text-zinc-400">
                      Abrindo os parabéns em{" "}
                      {Math.round(DURACAO_APOS_DATA_ALVO_MS / 1000)} segundos…
                    </span>
                  </>
                ) : (
                  <>
                    19 de abril de 2026, 00h00
                    <span className="mt-2 block text-base font-normal text-zinc-500 dark:text-zinc-400">
                      (horário local do seu dispositivo)
                    </span>
                  </>
                )}
              </h1>
            </div>

            <div
              className="flex flex-wrap items-center justify-center gap-3"
              aria-live="polite"
            >
              {carregando ? (
                <p className="text-zinc-500 dark:text-zinc-400">Carregando…</p>
              ) : (
                <>
                  <BlocoNumero valor={partes.dias} rotulo="dias" />
                  <BlocoNumero valor={partes.horas} rotulo="horas" />
                  <BlocoNumero valor={partes.minutos} rotulo="min" />
                  <BlocoNumero valor={partes.segundos} rotulo="seg" />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
