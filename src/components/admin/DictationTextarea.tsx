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
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [baseValue, setBaseValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const preview = `${draft}${interim ? ` ${interim}` : ""}`.trim();
  const hasPreview = listening || preview !== "";

  const displayValue = hasPreview
    ? `${baseValue.trim()}${baseValue.trim() && preview ? " " : ""}${preview}`.trim()
    : value;

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setError(null);
    // Al iniciar o reanudar, consolidamos todo lo que ya hay en el campo
    // (texto original + dictado previo) como base, y empezamos un tramo nuevo.
    // Así el dictado siempre se añade y nunca sustituye lo anterior.
    if (!hasPreview) setOriginalValue(value);
    setBaseValue(displayValue);
    setDraft("");
    setInterim("");

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
      if (finalChunk) setDraft((prev) => `${prev}${prev ? " " : ""}${finalChunk.trim()}`);
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
    onChange(displayValue);
    setOriginalValue("");
    setBaseValue("");
    setDraft("");
    setInterim("");
  };

  const discard = () => {
    stop();
    onChange(originalValue);
    setOriginalValue("");
    setBaseValue("");
    setDraft("");
    setInterim("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          // Mientras se dicta, el valor se construye automáticamente.
          if (!hasPreview) onChange(e.target.value);
        }}
        rows={rows}
        readOnly={hasPreview}
        className={cn(hasPreview && "bg-muted/40")}
      />

      <div className="flex flex-wrap items-center gap-2">
        {!hasPreview ? (
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
