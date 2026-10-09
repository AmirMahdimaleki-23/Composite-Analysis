import React, { useMemo, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AnalysisType,
  LoadingType,
  MaterialProperties,
  CLTResults,
  CombinedPair,
} from "./types";
import { DEFAULT_MATERIALS } from "./constants";
import {
  runCLT,
  calculateQ,
  calculateQBar,
  calculateS,
} from "./services/cltEngine";
import { translations } from "./i18n";
import { L, parseL } from "./utils/formatters";
import { useCLTStore } from "./store";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sun,
  Moon,
  Languages,
  Heart,
  Cpu,
  ShieldCheck,
  Settings,
  Wind,
  X,
  Users,
  Github,
  Linkedin,
  Mail,
  BookOpen,
  Award,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  AnalysisTypeStep,
  MaterialStep,
  LoadingStep,
  LayupStep,
  ResultsStep,
  FinalAnswerStep,
  FailureStep,
  VisualizationStep,
  DimensionsStep,
  ReportStep,
} from "./components/Steps";
import {
  materialSchema,
  loadsSchema,
  layerSchema,
  dimensionsSchema,
} from "./utils/zodSchemas";
import * as z from "zod";

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "fa" | "en";
}

const CreatorModal: React.FC<CreatorModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];
  const isRtl = language === "fa";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 p-6 md:p-8 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200`}
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            {t.modalTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.engineVersion}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
                ا
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t.creator1Name}
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t.creator1Role}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {t.creator1Desc}
                </p>
                <div className="flex gap-2 mt-3">
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20 flex-shrink-0">
                س
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t.creator2Name}
                </h3>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t.creator2Role}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {t.creator2Desc}
                </p>
                <div className="flex gap-2 mt-3">
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {t.modalInfoTitle}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {t.modalInfoDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <Award size={16} />, text: t.feature1 },
              { icon: <BarChart3 size={16} />, text: t.feature2 },
              { icon: <Settings size={16} />, text: t.feature3 },
              { icon: <Users size={16} />, text: t.feature4 },
              { icon: <FileText size={16} />, text: t.feature5 },
              { icon: <Languages size={16} />, text: t.feature6 },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
              >
                <span className="text-blue-500">{feature.icon}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {t.version} 2.0.0
            </span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.engineVersion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const isSingleLayer = (type: AnalysisType): boolean => {
  return type.includes("SINGLE");
};

const App: React.FC = () => {
  const {
    step,
    analysisType,
    hasAngle,
    angle,
    material,
    loadingType,
    layers,
    loads,
    failureCriterion,
    dimensions,
    theme,
    language,
    compareMode,
    compareMetric,
    compMaterial,
    allMaterials,
    isCustomizing,
    customMat,
    updateState,
    saveCustomMaterial,
    deleteMaterial,
    toggleTheme,
    toggleLang,
    nextStep,
    prevStep,
    setIsCustomizing,
    setCustomMat,
  } = useCLTStore();

  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const t = translations[language];
  const isRtl = language === "fa";

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.className = theme;

    document.title = t.pageTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", t.pageDescription);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", t.pageKeywords);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", t.pageTitle);
    }
  }, [language, theme, isRtl, t]);

  const results1 = useMemo(() => {
    return runCLT(
      material,
      layers,
      loads,
      failureCriterion,
      analysisType,
      loadingType,
      hasAngle ? angle : 0,
    );
  }, [
    material,
    layers,
    loads,
    failureCriterion,
    analysisType,
    loadingType,
    hasAngle,
    angle,
  ]);

  const results2 = useMemo(() => {
    if (!compMaterial) return null;
    return runCLT(
      compMaterial,
      layers,
      loads,
      failureCriterion,
      analysisType,
      loadingType,
      hasAngle ? angle : 0,
    );
  }, [
    compMaterial,
    layers,
    loads,
    failureCriterion,
    analysisType,
    loadingType,
    hasAngle,
    angle,
  ]);

  const deformedDimensions = useMemo(() => {
    if (!results1) return null;
    const length = dimensions.length;
    const width = dimensions.width;
    const epsX = results1.midplaneStrain[0];
    const epsY = results1.midplaneStrain[1];
    const gammaXY = results1.midplaneStrain[2];
    const newLength = length * (1 + epsX);
    const newWidth = width * (1 + epsY);
    let newAngle = undefined;
    if (Math.abs(gammaXY) > 1e-10) {
      newAngle = (gammaXY / 2) * (180 / Math.PI);
    }
    return {
      newLength,
      newWidth,
      newAngle,
      shearStrain: gammaXY,
    };
  }, [results1, dimensions.length, dimensions.width]);

  const winner = useMemo(() => {
    if (!compareMode || !compMaterial || !results2) return null;
    const m1 = results1,
      m2 = results2;
    if (compareMetric === "SAFETY")
      return m1.maxFailureIndex < m2.maxFailureIndex ? 1 : 2;
    if (compareMetric === "WEIGHT") {
      const w1 = layers.reduce(
        (a, l) => a + l.thickness * (material.density || 0),
        0,
      );
      const w2 = layers.reduce(
        (a, l) => a + l.thickness * (compMaterial?.density || 0),
        0,
      );
      return w1 < w2 ? 1 : 2;
    }
    return m1.A[0][0] > m2.A[0][0] ? 1 : 2;
  }, [
    compareMode,
    compareMetric,
    results1,
    results2,
    material,
    compMaterial,
    layers,
  ]);

  useEffect(() => {
    if (deformedDimensions && dimensions.wantsChanges) {
      updateState({
        dimensions: {
          ...dimensions,
          newLength: deformedDimensions.newLength,
          newWidth: deformedDimensions.newWidth,
          newAngle: deformedDimensions.newAngle,
          shearStrain: deformedDimensions.shearStrain,
        },
      });
    }
  }, [deformedDimensions, dimensions.wantsChanges]);

  const handleNextStep = () => {
    try {
      if (step === 2) {
        materialSchema.parse(material);
      } else if (step === 3) {
        loadsSchema.parse(loads);
      } else if (step === 4 && !isSingleLayer(analysisType)) {
        z.array(layerSchema).parse(layers);
      } else if (step === 9 && dimensions.wantsChanges) {
        dimensionsSchema.parse(dimensions);
      }
      nextStep();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0]?.message || "Invalid input";
        toast.error(
          `${language === "fa" ? "خطا در ورودی: " : "Input Error: "}${firstError}`,
        );
      } else {
        toast.error("Validation failed");
      }
    }
  };

  const handleSetStep = (targetStep: number) => {
    try {
      if (targetStep > 2 && step <= 2) materialSchema.parse(material);
      if (targetStep > 3 && step <= 3) loadsSchema.parse(loads);
      if (targetStep > 4 && step <= 4 && !isSingleLayer(analysisType))
        z.array(layerSchema).parse(layers);
      if (targetStep > 9 && step <= 9 && dimensions.wantsChanges)
        dimensionsSchema.parse(dimensions);
      updateState({ step: targetStep });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0]?.message || "Invalid input";
        toast.error(
          `${language === "fa" ? "خطا در ورودی: " : "Input Error: "}${firstError}`,
        );
      } else {
        toast.error("Validation failed");
      }
    }
  };

  const generatePDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const primaryColor = [37, 99, 235];
    const secondaryColor = [245, 158, 11];
    const textColor = [40, 40, 40];
    const white = [255, 255, 255];

    const formatNumber = (num: number, digits = 2): string => {
      if (num === undefined || num === null) return "0";
      return num.toFixed(digits);
    };

    const formatExponential = (num: number): string => {
      if (num === undefined || num === null) return "0";
      return num.toExponential(2);
    };

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, "F");
    doc.setTextColor(...white);
    doc.setFontSize(26);
    doc.text("COMPOSITE ANALYSIS REPORT", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 45, {
      align: "center",
    });
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.text("1. Configuration Summary", 14, 70);
    doc.setFontSize(10);
    doc.text(`Analysis Type: ${analysisType}`, 14, 82);
    doc.text(`Material: ${material.name}`, 14, 92);
    if (compareMode && compMaterial) {
      doc.text(`Comparison Material: ${compMaterial.name}`, 14, 102);
    }
    doc.text(`Layup: ${layers.length} plies`, 14, 112);
    let yPos = 122;
    layers.forEach((l: any, i: number) => {
      doc.text(
        `  Ply ${i + 1}: θ = ${formatNumber(l.theta, 1)}°, t = ${formatNumber(l.thickness * 1000, 0)} mm`,
        20,
        yPos + i * 5,
      );
    });
    yPos = 122 + layers.length * 5 + 5;
    doc.text(`Loads:`, 14, yPos);
    yPos += 6;
    if (isSingleLayer(analysisType)) {
      doc.text(
        `  σx = ${formatExponential(loads.sigX)} Pa, σy = ${formatExponential(loads.sigY)} Pa, τxy = ${formatExponential(loads.tauXY)} Pa`,
        20,
        yPos,
      );
      yPos += 6;
      doc.text(
        `  εx = ${formatExponential(loads.epsX)}, εy = ${formatExponential(loads.epsY)}, γxy = ${formatExponential(loads.gammaXY)}`,
        20,
        yPos,
      );
    } else {
      doc.text(
        `  Nx = ${formatNumber(loads.Nx)} N/m, Ny = ${formatNumber(loads.Ny)} N/m, Nxy = ${formatNumber(loads.Nxy)} N/m`,
        20,
        yPos,
      );
      yPos += 6;
      doc.text(
        `  Mx = ${formatNumber(loads.Mx)} N·m/m, My = ${formatNumber(loads.My)} N·m/m, Mxy = ${formatNumber(loads.Mxy)} N·m/m`,
        20,
        yPos,
      );
    }
    yPos += 6;
    if (loads.dT !== 0)
      doc.text(`  ΔT = ${formatNumber(loads.dT)} °C`, 20, yPos);
    if (loads.dC !== 0)
      doc.text(`  ΔC = ${formatNumber(loads.dC)} %`, 20, yPos);

    doc.addPage();
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.text("Stiffness Matrices", 105, 14, { align: "center" });
    doc.setTextColor(...textColor);
    if (isSingleLayer(analysisType)) {
      const Q = calculateQ(material);
      const Qbar = calculateQBar(Q, hasAngle ? angle : 0);
      const S = calculateS(Q);
      const Sbar = calculateS(Qbar);
      doc.setFontSize(12);
      doc.text("Stiffness Matrix [Q] (Pa)", 14, 30);
      (doc as any).autoTable({
        startY: 35,
        body: Q.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Transformed Stiffness Matrix [Q̄] (Pa)", 14, finalY);
      (doc as any).autoTable({
        startY: finalY + 5,
        body: Qbar.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Compliance Matrix [S] (1/Pa)", 14, finalY);
      (doc as any).autoTable({
        startY: finalY + 5,
        body: S.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Transformed Compliance Matrix [S̄] (1/Pa)", 14, finalY);
      (doc as any).autoTable({
        startY: finalY + 5,
        body: Sbar.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
    } else {
      doc.setFontSize(12);
      doc.text("Extensional Stiffness Matrix [A] (N/m)", 14, 30);
      (doc as any).autoTable({
        startY: 35,
        body: results1.A.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Coupling Stiffness Matrix [B] (N)", 14, finalY);
      (doc as any).autoTable({
        startY: finalY + 5,
        body: results1.B.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text("Bending Stiffness Matrix [D] (N·m)", 14, finalY);
      (doc as any).autoTable({
        startY: finalY + 5,
        body: results1.D.map((row) => row.map((v) => formatExponential(v))),
        theme: "grid",
        styles: { fontSize: 8, halign: "center" },
        margin: { left: 14, right: 14 },
      });
    }

    doc.addPage();
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.text("Strains, Curvatures & Layer Stresses", 105, 14, {
      align: "center",
    });
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.text("Mid‑plane Strains ε⁰ and Curvatures κ", 14, 30);
    const strainKappaData = [
      ["εx⁰", formatExponential(results1.midplaneStrain[0])],
      ["εy⁰", formatExponential(results1.midplaneStrain[1])],
      ["γxy⁰", formatExponential(results1.midplaneStrain[2])],
      ["κx (rad/m)", formatExponential(results1.curvature[0])],
      ["κy (rad/m)", formatExponential(results1.curvature[1])],
      ["κxy (rad/m)", formatExponential(results1.curvature[2])],
    ];
    (doc as any).autoTable({
      startY: 35,
      body: strainKappaData,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Layer Stresses (material coordinates)", 14, finalY);
    const layerStressData = results1.layerStresses.map(
      (layer: any, idx: number) => {
        const [sig1, sig2, tau12] = layer[0];
        return [
          `Ply ${idx + 1}`,
          formatExponential(sig1),
          formatExponential(sig2),
          formatExponential(tau12),
        ];
      },
    );
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [["Ply", "σ₁ (Pa)", "σ₂ (Pa)", "τ₁₂ (Pa)"]],
      body: layerStressData,
      theme: "striped",
      headStyles: { fillColor: secondaryColor },
      styles: { fontSize: 8, halign: "center" },
      margin: { left: 14, right: 14 },
    });
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("Layer Stresses (global coordinates)", 14, finalY);
    const layerGlobalData = results1.layerStresses.map(
      (layer: any, idx: number) => {
        const [sigX, sigY, tauXY] = layer[1];
        return [
          `Ply ${idx + 1}`,
          formatExponential(sigX),
          formatExponential(sigY),
          formatExponential(tauXY),
        ];
      },
    );
    (doc as any).autoTable({
      startY: finalY + 5,
      head: [["Ply", "σx (Pa)", "σy (Pa)", "τxy (Pa)"]],
      body: layerGlobalData,
      theme: "striped",
      headStyles: { fillColor: secondaryColor },
      styles: { fontSize: 8, halign: "center" },
      margin: { left: 14, right: 14 },
    });

    doc.addPage();
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.text("Failure Assessment", 105, 14, { align: "center" });
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.text(`Failure Criterion: ${failureCriterion}`, 14, 30);
    doc.text(
      `Max Failure Index: ${formatNumber(results1.maxFailureIndex, 4)}`,
      14,
      40,
    );
    doc.text(`Safety Status: ${results1.isSafe ? "SAFE" : "FAIL"}`, 14, 50);
    if (results1.isSafe) {
      doc.setTextColor(16, 185, 129);
      doc.text("The laminate is safe under the given loads.", 14, 65);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text("Failure detected in one or more plies.", 14, 65);
    }

    if (deformedDimensions) {
      doc.addPage();
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 20, "F");
      doc.setTextColor(...white);
      doc.setFontSize(16);
      doc.text("Deformed Geometry", 105, 14, { align: "center" });
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.text("Original Dimensions:", 14, 30);
      doc.setFontSize(10);
      doc.text(
        `Length: ${formatNumber(dimensions.length * 1000, 4)} mm`,
        14,
        40,
      );
      doc.text(`Width: ${formatNumber(dimensions.width * 1000, 4)} mm`, 14, 50);
      doc.setFontSize(12);
      doc.text("Deformed Dimensions:", 14, 70);
      doc.setFontSize(10);
      doc.text(
        `New Length: ${formatNumber(deformedDimensions.newLength * 1000, 4)} mm`,
        14,
        80,
      );
      doc.text(
        `New Width: ${formatNumber(deformedDimensions.newWidth * 1000, 4)} mm`,
        14,
        90,
      );
      if (deformedDimensions.newAngle !== undefined) {
        doc.text(
          `Rotation Angle: ${formatNumber(deformedDimensions.newAngle, 4)}°`,
          14,
          100,
        );
        doc.text(
          `Shear Strain: ${formatExponential(deformedDimensions.shearStrain)}`,
          14,
          110,
        );
      } else {
        doc.text("No shear deformation (zero shear strain)", 14, 100);
      }
    }

    if (compareMode && results2) {
      doc.addPage();
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 20, "F");
      doc.setTextColor(...white);
      doc.setFontSize(16);
      doc.text("Competitive Analysis", 105, 14, { align: "center" });
      doc.setTextColor(...textColor);
      const compData = [
        ["Metric", material.name, compMaterial?.name || "Material 2"],
        [
          "Failure Index",
          formatNumber(results1.maxFailureIndex, 4),
          formatNumber(results2.maxFailureIndex, 4),
        ],
        [
          "A₁₁ (N/m)",
          formatExponential(results1.A[0][0]),
          formatExponential(results2.A[0][0]),
        ],
        [
          "Mass per m² (kg)",
          formatNumber(
            layers.reduce(
              (a: any, l: any) => a + l.thickness * (material.density || 0),
              0,
            ),
            2,
          ),
          formatNumber(
            layers.reduce(
              (a: any, l: any) =>
                a + l.thickness * (compMaterial?.density || 0),
              0,
            ),
            2,
          ),
        ],
      ];
      (doc as any).autoTable({
        startY: 30,
        body: compData,
        theme: "grid",
        headStyles: { fillColor: secondaryColor },
        styles: { fontSize: 9, halign: "center" },
        margin: { left: 14, right: 14 },
      });
      const win = winner === 1 ? material.name : compMaterial?.name;
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(
        `Recommended: ${win}`,
        105,
        (doc as any).lastAutoTable.finalY + 20,
        { align: "center" },
      );
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      doc.text("Generated by CompAnalysis CLT Tool", 105, 295, {
        align: "center",
      });
    }

    doc.save(`Composite_Report_${Date.now()}.pdf`);
  };

  const renderSideBySide = (
    title: string,
    content1: React.ReactNode,
    content2: React.ReactNode,
  ) => {
    if (!compareMode || !compMaterial || !results2) {
      return (
        <div className="space-y-4 w-full">
          <h3 className="text-xs font-bold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {title}
          </h3>
          <div className="grid grid-cols-1 gap-4 items-start">
            <div className="space-y-4 bg-white/10 p-4 rounded-xl border border-white/20 shadow-sm">
              <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-blue-500 uppercase truncate">
                  {material.name}
                </span>
              </div>
              {content1}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4 w-full">
        <h3 className="text-xs font-bold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          <div className="space-y-4 bg-white/10 p-4 rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase truncate">
                {material.name}
              </span>
            </div>
            {content1}
          </div>
          <div className="space-y-4 bg-white/10 p-4 rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase truncate">
                {compMaterial.name}
              </span>
            </div>
            {content2}
          </div>
        </div>
      </div>
    );
  };

  const L_h = (v: any) => L(v, language);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <AnalysisTypeStep />;
      case 2:
        return <MaterialStep />;
      case 3:
        return <LoadingStep />;
      case 4:
        return <LayupStep />;
      case 5:
        return (
          <ResultsStep
            results1={results1}
            results2={results2}
            renderSideBySide={renderSideBySide}
          />
        );
      case 6:
        return (
          <FinalAnswerStep
            results1={results1}
            results2={results2}
            renderSideBySide={renderSideBySide}
          />
        );
      case 7:
        return (
          <FailureStep
            results1={results1}
            results2={results2}
            renderSideBySide={renderSideBySide}
          />
        );
      case 8:
        return (
          <VisualizationStep
            results1={results1}
            results2={results2}
            deformedDimensions={deformedDimensions}
            renderSideBySide={renderSideBySide}
          />
        );
      case 9:
        return <DimensionsStep deformedDimensions={deformedDimensions} />;
      case 10:
        return (
          <ReportStep
            results1={results1}
            results2={results2}
            winner={winner}
            generatePDF={generatePDF}
          />
        );
      default:
        return null;
    }
  };

  // Helper function to format step number with Persian digits
  const formatStepNumber = (num: number): string => {
    if (Number.isInteger(num)) {
      const formatted = num.toString();
      if (language === "fa") {
        return formatted.replace(/\d/g, (d) => {
          const persianDigits = [
            "۰",
            "۱",
            "۲",
            "۳",
            "۴",
            "۵",
            "۶",
            "۷",
            "۸",
            "۹",
          ];
          return persianDigits[parseInt(d)];
        });
      }
      return formatted;
    }

    const formatted = num.toFixed(1);
    if (language === "fa") {
      return formatted.replace(".", "٫").replace(/\d/g, (d) => {
        const persianDigits = [
          "۰",
          "۱",
          "۲",
          "۳",
          "۴",
          "۵",
          "۶",
          "۷",
          "۸",
          "۹",
        ];
        return persianDigits[parseInt(d)];
      });
    }
    return formatted;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === "light" ? "light" : "dark"}
      />
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>
      <header className="w-full max-w-6xl flex items-center justify-between mb-6 p-4 md:p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers size={20} />
          </div>
          <div className="hidden sm:block text-start">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
              {t.title}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="p-2 md:p-3 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-white dark:hover:bg-slate-700"
          >
            <Languages size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 md:p-3 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-white dark:hover:bg-slate-700"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="hidden lg:flex flex-col items-end px-4 py-1.5 rounded-lg border shadow-inner text-start bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
            <span className="text-[10px] uppercase font-medium text-slate-600 dark:text-slate-500 tracking-wider">
              {t.step} {formatStepNumber(step)} {t.of}{" "}
              {language === "fa" ? "۱۰" : "10"}
            </span>
            <span className="text-[10px] font-bold text-blue-500 uppercase">
              COMPOSITE CORE
            </span>
          </div>
        </div>
      </header>
      <main className="w-full max-w-6xl bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl p-5 md:p-8 lg:p-10 min-h-[600px] flex flex-col relative transition-all duration-500">
        <div className="flex justify-between items-center mb-8 gap-1 max-w-3xl mx-auto w-full px-2 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                step === i + 1
                  ? "w-8 md:w-12 bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  : i + 1 < step
                    ? "w-2 md:w-3 bg-blue-400/50"
                    : "w-2 md:w-3 bg-slate-300 dark:bg-slate-700"
              }`}
              onClick={() => handleSetStep(i + 1)}
            />
          ))}
        </div>
        <div className="flex-1 flex flex-col justify-start">{renderStep()}</div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
            >
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {t.prev}
            </button>
          ) : (
            <div />
          )}
          {step < 10 && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              {t.next}
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
        </div>
      </main>
      <footer className="mt-10 mb-8 w-full max-w-6xl">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-amber-500/10 blur-2xl opacity-50 -z-10" />
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/30 dark:border-white/10 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-b-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
                <ShieldCheck className="text-emerald-500" size={24} />
              </div>
              <div className="text-start">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {t.footerNote}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Powered by Classical Laminate Theory Engine v2.5
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="flex items-center gap-3 py-2 px-4 bg-slate-50/60 dark:bg-black/30 rounded-lg border border-slate-200 dark:border-white/5 hover:border-blue-500/50 transition-all hover:scale-105 cursor-pointer group"
            >
              <Heart className="text-red-500 fill-red-500" size={14} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                {t.creators}
              </span>
              <Users
                size={12}
                className="text-slate-400 group-hover:text-blue-500 transition-colors"
              />
            </button>
            <div className="flex gap-2">
              {[
                {
                  icon: <Cpu size={16} />,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: <Settings size={16} />,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
                {
                  icon: <Wind size={16} />,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${item.bg} ${item.color} border border-white/10 hover:scale-105 transition-transform cursor-pointer`}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-4 text-[10px] font-medium uppercase text-slate-400 tracking-widest opacity-40">
            Engineering Precision Simulation Core
          </p>
        </div>
      </footer>
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        language={language}
      />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar{display:none;}
        select{-webkit-appearance:none;appearance:none;cursor:pointer;}
        input:focus { border-color: #3b82f6 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f644; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
