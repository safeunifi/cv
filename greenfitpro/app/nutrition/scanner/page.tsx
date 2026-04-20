"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Type, Loader2, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import type { MealAnalysis } from "@/lib/meal-scanner";
import { analyzeMealFromBase64, analyzeMealFromText } from "@/lib/meal-scanner";

type Mode = "idle" | "camera" | "text";

const MacroChip = ({ label, value, unit = "g", color }: { label: string; value: number; unit?: string; color: string }) => (
  <div className="flex flex-col items-center p-3 rounded-xl flex-1" style={{ background: "var(--surface2)" }}>
    <span className="text-xl font-black" style={{ color }}>{value}</span>
    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{unit}</span>
    <span className="text-xs" style={{ color: "var(--text-dim)" }}>{label}</span>
  </div>
);

export default function ScannerPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [expanded, setExpanded] = useState<"original" | "healthier" | "recipe" | null>("healthier");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMode("camera");
    } catch {
      setError("Camera access denied. Use file upload instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode("idle");
  }, []);

  const analyzeImage = useCallback(async (dataUrl: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const [, data] = dataUrl.split(",");
      const mediaType = dataUrl.startsWith("data:image/png") ? "image/png" :
        dataUrl.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
      const analysis = await analyzeMealFromBase64(data, mediaType as "image/jpeg" | "image/png" | "image/webp");
      setResult(analysis);
    } catch (err) {
      setError((err as Error).message || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  }, [stopCamera, analyzeImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const analysis = await analyzeMealFromText(textInput);
      setResult(analysis);
    } catch (err) {
      setError((err as Error).message || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview("");
    setTextInput("");
    setError("");
    setMode("idle");
  };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Meal Scanner" subtitle="AI-powered nutrition analysis" back />

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Camera view */}
        {mode === "camera" && (
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3", background: "#000" }}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <X size={22} className="text-white" />
              </button>
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full border-4 animate-pulse-glow"
                style={{ background: "var(--primary)", borderColor: "#fff" }}
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && !loading && (
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3", background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Meal" className="w-full h-full object-cover" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <Card className="p-8 flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin" style={{ color: "var(--primary)" }} />
            <p className="font-bold" style={{ color: "var(--text)" }}>Analyzing your meal…</p>
            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Identifying ingredients, estimating macros, and creating a healthier alternative
            </p>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="p-4" style={{ borderColor: "var(--danger)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>
          </Card>
        )}

        {/* Input options — show when no result and not loading */}
        {!result && !loading && mode !== "camera" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{ background: "var(--surface)", border: "2px solid var(--border)" }}
              >
                <Camera size={28} style={{ color: "var(--primary)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{ background: "var(--surface)", border: "2px solid var(--border)" }}
              >
                <Upload size={28} style={{ color: "var(--accent)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Upload</span>
              </button>
              <button
                onClick={() => setMode("text")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                style={{ background: "var(--surface)", border: `2px solid ${mode === "text" ? "var(--primary)" : "var(--border)"}` }}
              >
                <Type size={28} style={{ color: "#f59e0b" }} />
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Describe</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {mode === "text" && (
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe your meal… e.g. 'Double cheeseburger with fries and a large soda'"
                  rows={3}
                  className="w-full p-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
                <Button variant="primary" size="lg" fullWidth onClick={analyzeText} disabled={!textInput.trim()}>
                  <Camera size={18} /> Analyze Meal
                </Button>
              </div>
            )}

            <Card variant="outline" className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>How it works</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Take a photo or describe your meal. Our AI identifies what you&apos;re eating, estimates the macros, then creates a healthier version with a full recipe so you never feel like you&apos;re missing out.
              </p>
            </Card>
          </>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 animate-fade-in">
            {/* Original meal */}
            <Card>
              <button
                className="w-full p-4 text-left flex items-center justify-between"
                onClick={() => setExpanded(expanded === "original" ? null : "original")}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Original Meal</p>
                  <p className="font-black text-lg" style={{ color: "var(--text)" }}>{result.originalMeal}</p>
                </div>
                {expanded === "original" ? <ChevronUp size={18} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-dim)" }} />}
              </button>
              {expanded === "original" && (
                <div className="px-4 pb-4 space-y-3 border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  <div className="pt-3 flex gap-2">
                    <MacroChip label="Calories" value={result.originalMacros.calories} unit="kcal" color="var(--text)" />
                    <MacroChip label="Protein" value={result.originalMacros.protein} color="#22c55e" />
                    <MacroChip label="Carbs" value={result.originalMacros.carbs} color="#f59e0b" />
                    <MacroChip label="Fat" value={result.originalMacros.fat} color="#3b82f6" />
                  </div>
                  {result.concerns.length > 0 && (
                    <div className="p-3 rounded-xl" style={{ background: "#ef444422" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--danger)" }}>Concerns</p>
                      {result.concerns.map((c, i) => (
                        <p key={i} className="text-sm" style={{ color: "var(--text-muted)" }}>• {c}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Healthier version */}
            <Card variant="outline">
              <button
                className="w-full p-4 text-left flex items-center justify-between"
                onClick={() => setExpanded(expanded === "healthier" ? null : "healthier")}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--primary)" }}>Healthier Alternative</p>
                  <p className="font-black text-lg" style={{ color: "var(--primary)" }}>{result.healthierName}</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{result.healthierReason}</p>
                </div>
                {expanded === "healthier" ? <ChevronUp size={18} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-dim)" }} />}
              </button>
              {expanded === "healthier" && (
                <div className="px-4 pb-4 space-y-3 border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  <div className="pt-3 flex gap-2">
                    <MacroChip label="Calories" value={result.healthierMacros.calories} unit="kcal" color="var(--primary)" />
                    <MacroChip label="Protein" value={result.healthierMacros.protein} color="#22c55e" />
                    <MacroChip label="Carbs" value={result.healthierMacros.carbs} color="#f59e0b" />
                    <MacroChip label="Fat" value={result.healthierMacros.fat} color="#3b82f6" />
                  </div>
                  {/* Macro comparison */}
                  <div className="p-3 rounded-xl text-center" style={{ background: "var(--primary-dim)" }}>
                    <p className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                      {result.originalMacros.calories - result.healthierMacros.calories > 0
                        ? `${result.originalMacros.calories - result.healthierMacros.calories} fewer calories`
                        : "Comparable calories, better nutrients"}
                      {result.healthierMacros.protein > result.originalMacros.protein
                        ? ` · ${result.healthierMacros.protein - result.originalMacros.protein}g more protein`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Recipe */}
            <Card>
              <button
                className="w-full p-4 text-left flex items-center justify-between"
                onClick={() => setExpanded(expanded === "recipe" ? null : "recipe")}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Full Recipe</p>
                  <p className="font-bold" style={{ color: "var(--text)" }}>{result.ingredients.length} ingredients · {result.recipe.length} steps</p>
                </div>
                {expanded === "recipe" ? <ChevronUp size={18} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-dim)" }} />}
              </button>
              {expanded === "recipe" && (
                <div className="px-4 pb-4 space-y-4 border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  <div className="pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Ingredients</p>
                    <div className="space-y-1">
                      {result.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--primary)" }} />
                          <span className="text-sm" style={{ color: "var(--text)" }}>{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Instructions</p>
                    <div className="space-y-3">
                      {result.recipe.map((step) => (
                        <div key={step.step} className="flex gap-3 items-start">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
                          >
                            {step.step}
                          </span>
                          <p className="text-sm pt-0.5" style={{ color: "var(--text)" }}>{step.instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {result.tips.length > 0 && (
                    <div className="p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>Tips</p>
                      {result.tips.map((t, i) => (
                        <p key={i} className="text-sm" style={{ color: "var(--text-muted)" }}>• {t}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Button variant="secondary" size="lg" fullWidth onClick={reset}>
              <RefreshCw size={18} /> Scan Another Meal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
