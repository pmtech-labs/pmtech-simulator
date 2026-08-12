import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Mic, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface DictationTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * Textarea con dictado por voz (es-ES). Durante la grabación, la transcripción
 * se muestra directamente en el campo de texto. Al pulsar el tick de aceptar,
 * se confirma; al pulsar descartar, se restaura el valor que tenía el campo
 * antes de empezar a dictar.
 */
export function DictationTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: DictationTextareaProps) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [baseValue, setBaseValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseValueRef = useRef("");
  const draftRef = useRef("");
  const interimRef = useRef("");

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const joinText = (base: string, dictated: string, live: string) =>
    [base.trim(), dictated.trim(), live.trim()].filter(Boolean).join(" ");

  const displayValue = sessionActive ? joinText(baseValue, draft, interim) : value;

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setError(null);
    // Una sesión conserva siempre la misma base y acumula todos los tramos.
    // Al continuar después de una pausa no se reinicia ningún texto dictado.
    if (!sessionActive) {
      setOriginalValue(value);
      setBaseValue(value);
      setDraft("");
      baseValueRef.current = value;
      draftRef.current = "";
      setSessionActive(true);
    }
    setInterim("");
    interimRef.current = "";

    const recognition = new Ctor();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      };
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalChunk += result[0].transcript;
        else interimChunk += result[0].transcript;
      }
      if (finalChunk) {
        const nextDraft = [draftRef.current.trim(), finalChunk.trim()].filter(Boolean).join(" ");
        draftRef.current = nextDraft;
        setDraft(nextDraft);
      }
      interimRef.current = interimChunk;
      setInterim(interimChunk);
    };

    recognition.onerror = (event: unknown) => {
      const code = (event as { error?: string })?.error;
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "No hay permiso para usar el micrófono. Actívalo en el navegador."
          : "No se ha podido capturar el audio. Inténtalo de nuevo.",
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("No se ha podido iniciar el dictado.");
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const accept = () => {
    stop();
    // Los refs evitan perder texto si el último evento de voz y el clic en
    // Aceptar ocurren antes de que React haya renderizado el nuevo estado.
    onChange(joinText(baseValueRef.current, draftRef.current, interimRef.current));
    setSessionActive(false);
    setOriginalValue("");
    setBaseValue("");
    setDraft("");
    setInterim("");
    baseValueRef.current = "";
    draftRef.current = "";
    interimRef.current = "";
  };

  const discard = () => {
    stop();
    onChange(originalValue);
    setSessionActive(false);
    setOriginalValue("");
    setBaseValue("");
    setDraft("");
    setInterim("");
    baseValueRef.current = "";
    draftRef.current = "";
    interimRef.current = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          // Mientras se dicta, el valor se construye automáticamente.
          if (!sessionActive) onChange(e.target.value);
        }}
        rows={rows}
        readOnly={sessionActive}
        className={cn(sessionActive && "bg-muted/40")}
      />

      <div className="flex flex-wrap items-center gap-2">
        {!sessionActive ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={start}
            disabled={!supported}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Dictar (es-ES)
          </Button>
        ) : (
          <>
            {listening ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Grabando… habla con claridad
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={start}
                disabled={!supported}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Continuar dictado
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={accept}
              disabled={!displayValue.trim()}
              className="gap-2"
              aria-label="Aceptar y transcribir"
            >
              <Check className="h-4 w-4" />
              Aceptar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={discard}
              className="gap-2"
              aria-label="Descartar dictado"
            >
              <X className="h-4 w-4" />
              Descartar
            </Button>
          </>
        )}
      </div>

      {!supported && (
        <p className="text-xs text-muted-foreground">
          Tu navegador no admite dictado por voz. Usa Chrome o Edge, o escribe el motivo a mano.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
