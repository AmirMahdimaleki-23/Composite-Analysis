import React, { useState, useEffect } from "react";
import {
  Zap,
  FlaskConical,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Ruler,
  Scale,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  ArrowRightLeft,
  Award,
  Download,
  ArrowUpRight,
  Box,
  Thermometer,
  Wind,
  Settings,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  AnalysisType,
  CLTResults,
  MaterialProperties,
  CombinedPair,
  LoadingType,
  Layer,
} from "../types";
import {
  calculateQ,
  calculateQBar,
  calculateS,
  calculateSbar,
} from "../services/cltEngine";
import {
  convertStress,
  convertStrain,
  convertLength,
  getStressUnits,
  getStrainUnits,
  getLengthUnits,
  L,
  parseL,
  formatExponential,
} from "../utils/formatters";
import { useCLTStore } from "../store";
import { translations } from "../i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  materialSchema,
  loadsSchema,
  layerSchema,
  dimensionsSchema,
} from "../utils/zodSchemas";
import * as z from "zod";

const isSingleLayer = (type: AnalysisType): boolean => type.includes("SINGLE");
const getBasePhysics = (type: AnalysisType): string => type.split("_")[0];

const NumericInput = ({ value, onChange, placeholder, className }: any) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    rawValue = rawValue.replace(/[^\d\-.]/g, "");

    if (rawValue === "-" || rawValue === "") {
      setLocalValue(rawValue);
      if (onChange) onChange(e);
      return;
    }

    setLocalValue(rawValue);
    if (onChange) onChange(e);
  };

  return (
    <input
      type="text"
      value={isFocused ? localValue : value}
      onChange={handleChange}
      onFocus={() => {
        setIsFocused(true);
        setLocalValue(value);
      }}
      onBlur={() => {
        setIsFocused(false);
        setLocalValue(value);
      }}
      placeholder={placeholder}
      className={className}
      dir="ltr"
    />
  );
};

const InfoTooltip = ({
  text,
  language,
}: {
  text: string;
  language: "fa" | "en";
}) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block ml-1 mx-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info
        size={12}
        className="text-slate-400 hover:text-blue-500 cursor-help transition-colors"
      />

      {show && (
        <div
          className={`absolute z-[9999] w-44 p-2 text-xs font-medium rounded-lg shadow-md
            ${language === "fa" ? "right-0" : "left-0"} 
            bottom-full mb-2
            bg-slate-800 text-white border border-slate-600`}
        >
          {text}
          <div
            className={`absolute top-full ${language === "fa" ? "right-2" : "left-2"} 
            border-4 border-transparent border-t-slate-800`}
          />
        </div>
      )}
    </span>
  );
};

export const AnalysisTypeStep = () => {
  const { analysisType, combinedPair, hasAngle, angle, language, updateState } =
    useCLTStore();
  const t = translations[language];

  const physics = [
    { base: "MECHANICAL", label: t.mech },
    { base: "THERMAL", label: t.thermal },
    { base: "HYGRAL", label: t.hygral },
    { base: "COMBINED", label: t.combined },
  ];

  const setType = (base: string, variant: "SINGLE" | "MULTI") => {
    updateState({
      analysisType: `${base}_${variant}` as AnalysisType,
      combinedPair: base === "COMBINED" ? combinedPair : undefined,
    });
  };

  const isSingle = isSingleLayer(analysisType);

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-5 duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-amber-500/20 pb-3 flex items-center gap-3">
        <Zap className="text-amber-500" size={20} /> {t.analysisType}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {physics.flatMap((phys) => [
          <button
            key={`${phys.base}_SINGLE`}
            onClick={() => setType(phys.base, "SINGLE")}
            className={`flex items-center justify-between p-4 md:p-5 border rounded-xl transition-all group backdrop-blur-md ${
              analysisType === `${phys.base}_SINGLE`
                ? "border-blue-500 bg-blue-500/10 shadow-md scale-[1.01]"
                : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-300"
            }`}
          >
            <span className="font-bold text-sm md:text-base text-slate-700 dark:text-white">
              {phys.base === "MECHANICAL"
                ? t.mechSingle
                : phys.base === "THERMAL"
                  ? t.thermalSingle
                  : phys.base === "HYGRAL"
                    ? t.hygralSingle
                    : t.combinedSingle}
            </span>
            <div
              className={
                analysisType === `${phys.base}_SINGLE`
                  ? "text-blue-500"
                  : "text-slate-400"
              }
            >
              {phys.base === "MECHANICAL" ? (
                <Layers size={20} />
              ) : phys.base === "THERMAL" ? (
                <Thermometer size={20} />
              ) : phys.base === "HYGRAL" ? (
                <Wind size={20} />
              ) : (
                <Settings size={20} />
              )}
            </div>
          </button>,
          <button
            key={`${phys.base}_MULTI`}
            onClick={() => setType(phys.base, "MULTI")}
            className={`flex items-center justify-between p-4 md:p-5 border rounded-xl transition-all group backdrop-blur-md ${
              analysisType === `${phys.base}_MULTI`
                ? "border-blue-500 bg-blue-500/10 shadow-md scale-[1.01]"
                : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-300"
            }`}
          >
            <span className="font-bold text-sm md:text-base text-slate-700 dark:text-white">
              {phys.base === "MECHANICAL"
                ? t.mechMulti
                : phys.base === "THERMAL"
                  ? t.thermalMulti
                  : phys.base === "HYGRAL"
                    ? t.hygralMulti
                    : t.combinedMulti}
            </span>
            <div
              className={
                analysisType === `${phys.base}_MULTI`
                  ? "text-blue-500"
                  : "text-slate-400"
              }
            >
              <Box size={20} />
            </div>
          </button>,
        ])}
      </div>

      {analysisType && analysisType.startsWith("COMBINED") && (
        <div className="p-4 bg-amber-500/5 border border-white/10 rounded-xl backdrop-blur-xl">
          <label className="block font-bold mb-3 text-slate-700 dark:text-white flex items-center gap-2 text-sm">
            {t.combinedSelect}
            <InfoTooltip
              text={
                language === "fa"
                  ? "ترکیب دو پدیده فیزیکی که همزمان اعمال می‌شوند را انتخاب کنید"
                  : "Select the two physical phenomena to be applied simultaneously"
              }
              language={language}
            />
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: CombinedPair.MECH_THERM, label: t.mechTherm },
              { value: CombinedPair.MECH_HYGR, label: t.mechHyg },
              { value: CombinedPair.THERM_HYGR, label: t.thermHyg },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="combinedPair"
                  value={value}
                  checked={combinedPair === value}
                  onChange={() => updateState({ combinedPair: value })}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {analysisType && isSingleLayer(analysisType) && (
        <div className="p-4 bg-amber-500/5 border border-white/10 rounded-xl backdrop-blur-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAngle}
              onChange={(e) => updateState({ hasAngle: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 bg-slate-100 dark:bg-slate-800 border-none focus:ring-amber-500"
            />
            <span className="text-base md:text-lg font-bold text-slate-700 dark:text-white flex items-center gap-2">
              {t.hasAngle}
              <InfoTooltip
                text={
                  language === "fa"
                    ? "در صورتی که الیاف لایه نسبت به محور افقی زاویه‌دار هستند، این گزینه را فعال کنید"
                    : "Enable if the ply is oriented at an angle to the x-axis"
                }
                language={language}
              />
            </span>
          </label>
          {hasAngle && (
            <div className="mt-4 relative max-w-xs mx-auto">
              <NumericInput
                value={angle === 0 ? "" : L(angle, language)}
                placeholder={L(0, language)}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val === "") {
                    updateState({ angle: 0 });
                  } else {
                    const num = parseL(val, language);
                    if (!isNaN(num)) {
                      updateState({ angle: num });
                    }
                  }
                }}
                className="w-full p-3 bg-transparent border-b border-amber-500 font-bold text-3xl text-slate-800 dark:text-white outline-none text-center focus:border-amber-600 transition-colors dark:bg-slate-900"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const MaterialStep = () => {
  const {
    language,
    isCustomizing,
    setIsCustomizing,
    customMat,
    setCustomMat,
    saveCustomMaterial,
    allMaterials,
    deleteMaterial,
    material,
    updateState,
  } = useCLTStore();

  const t = translations[language];

  const stressConversionFactors: Record<string, number> = {
    Pa: 1,
    kPa: 1e3,
    MPa: 1e6,
    GPa: 1e9,
  };

  const [e1Unit, setE1Unit] = useState("Pa");
  const [e2Unit, setE2Unit] = useState("Pa");
  const [g12Unit, setG12Unit] = useState("Pa");
  const [xtUnit, setXtUnit] = useState("Pa");
  const [xcUnit, setXcUnit] = useState("Pa");
  const [ytUnit, setYtUnit] = useState("Pa");
  const [ycUnit, setYcUnit] = useState("Pa");
  const [sUnit, setSUnit] = useState("Pa");

  const toDisplay = (val: number, unit: string) =>
    val / (stressConversionFactors[unit] || 1);
  const toStorage = (val: number, unit: string) =>
    val * (stressConversionFactors[unit] || 1);

  const unitStateMap: Record<
    string,
    [string, React.Dispatch<React.SetStateAction<string>>]
  > = {
    E1: [e1Unit, setE1Unit],
    E2: [e2Unit, setE2Unit],
    G12: [g12Unit, setG12Unit],
    Xt: [xtUnit, setXtUnit],
    Xc: [xcUnit, setXcUnit],
    Yt: [ytUnit, setYtUnit],
    Yc: [ycUnit, setYcUnit],
    S: [sUnit, setSUnit],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: customMat.name,
      E1: customMat.E1,
      E2: customMat.E2,
      nu12: customMat.nu12,
      G12: customMat.G12,
      density: customMat.density || 1600,
      Xt: customMat.Xt || 1500e6,
      Xc: customMat.Xc || 1200e6,
      Yt: customMat.Yt || 50e6,
      Yc: customMat.Yc || 20e6,
      S: customMat.S || 80e6,
    },
  });

  const onSubmit = (data: any) => {
    setCustomMat(data);
    saveCustomMaterial();
    toast.success(
      language === "fa"
        ? "ماده با موفقیت ذخیره شد"
        : "Material saved successfully",
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-emerald-500/20 pb-3 flex items-center gap-3">
        <FlaskConical className="text-emerald-500" size={20} /> {t.material}
      </h2>

      {isCustomizing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl border border-emerald-500 shadow-lg space-y-6 backdrop-blur-2xl"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {t.customMaterial}
            </h3>
            <button type="button" onClick={() => setIsCustomizing(false)}>
              <X className="text-red-500" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-slate-400 flex items-center gap-2">
                  Name
                  <InfoTooltip
                    text="Desired name for the new material"
                    language={language}
                  />
                </label>
                <input
                  {...register("name")}
                  className={`w-full p-3 bg-slate-50 dark:bg-black/30 border rounded-lg dark:text-white font-medium text-sm outline-none focus:border-emerald-500 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    field: "E1",
                    tooltip: "Longitudinal Young's modulus (fiber direction)",
                    isStress: true,
                  },
                  {
                    field: "E2",
                    tooltip: "Transverse Young's modulus",
                    isStress: true,
                  },
                  {
                    field: "nu12",
                    tooltip: "Major Poisson's ratio",
                    isStress: false,
                  },
                  {
                    field: "G12",
                    tooltip: "In-plane shear modulus",
                    isStress: true,
                  },
                ].map(({ field, tooltip, isStress }) => {
                  const [currentUnit, setUnit] = unitStateMap[field] || [
                    "Pa",
                    () => {},
                  ];
                  return (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-medium uppercase text-slate-400 flex items-center gap-2">
                        {field} {isStress ? `(${currentUnit})` : ""}
                        <InfoTooltip text={tooltip} language={language} />
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          value={
                            isStress
                              ? toDisplay(
                                  Number(
                                    customMat[field as keyof typeof customMat],
                                  ) || 0,
                                  currentUnit,
                                )
                              : customMat[field as keyof typeof customMat]
                          }
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setCustomMat({
                                ...customMat,
                                [field]: isStress
                                  ? toStorage(val, currentUnit)
                                  : val,
                              });
                            }
                          }}
                          className={`w-full p-3 bg-slate-50 dark:bg-black/30 border rounded-lg dark:text-white font-medium text-sm outline-none focus:border-emerald-500 ${
                            errors[field as keyof typeof errors]
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {isStress && (
                          <select
                            value={currentUnit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="px-2 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-white cursor-pointer text-sm text-center"
                          >
                            {getStressUnits().map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {errors[field as keyof typeof errors] && (
                        <span className="text-red-500 text-xs block">
                          {errors[field as keyof typeof errors]?.message}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-slate-400 flex items-center gap-2">
                  Density (kg/m³)
                  <InfoTooltip text="Material density" language={language} />
                </label>
                <input
                  type="number"
                  step="any"
                  {...register("density")}
                  className={`w-full p-3 bg-slate-50 dark:bg-black/30 border rounded-lg dark:text-white font-medium text-sm outline-none focus:border-emerald-500 ${
                    errors.density ? "border-red-500" : ""
                  }`}
                />
                {errors.density && (
                  <span className="text-red-500 text-xs">
                    {errors.density.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 h-fit">
              {[
                { field: "Xt", tooltip: "Longitudinal tensile strength" },
                { field: "Xc", tooltip: "Longitudinal compressive strength" },
                { field: "Yt", tooltip: "Transverse tensile strength" },
                { field: "Yc", tooltip: "Transverse compressive strength" },
                { field: "S", tooltip: "In-plane shear strength" },
              ].map(({ field, tooltip }) => {
                const [currentUnit, setUnit] = unitStateMap[field] || [
                  "Pa",
                  () => {},
                ];
                return (
                  <div key={field} className="space-y-1">
                    <label className="text-xs font-medium uppercase text-slate-400 flex items-center gap-2">
                      {field} ({currentUnit})
                      <InfoTooltip text={tooltip} language={language} />
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        value={toDisplay(
                          Number(customMat[field as keyof typeof customMat]) ||
                            0,
                          currentUnit,
                        )}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setCustomMat({
                              ...customMat,
                              [field]: toStorage(val, currentUnit),
                            });
                          }
                        }}
                        className={`w-full p-3 bg-slate-50 dark:bg-black/30 border rounded-lg dark:text-white font-medium text-sm outline-none focus:border-emerald-500 ${
                          errors[field as keyof typeof errors]
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      <select
                        value={currentUnit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="px-2 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-white cursor-pointer text-sm text-center"
                      >
                        {getStressUnits().map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors[field as keyof typeof errors] && (
                      <span className="text-red-500 text-xs block">
                        {errors[field as keyof typeof errors]?.message}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsCustomizing(false)}
              className="px-5 py-2.5 border rounded-lg dark:text-white font-medium text-sm border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 rounded-lg text-white font-medium text-sm shadow-sm shadow-emerald-500/20 active:scale-95 hover:bg-emerald-700 transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allMaterials.map((mat: any) => (
            <div
              key={mat.name}
              onClick={() => updateState({ material: mat })}
              className={`p-4 border rounded-xl cursor-pointer transition-all relative group backdrop-blur-md ${
                material.name === mat.name
                  ? "border-emerald-500 bg-emerald-500/5 shadow-sm scale-[1.01]"
                  : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50"
              }`}
            >
              <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2 truncate text-start">
                {mat.name}
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase text-slate-500 dark:text-slate-400 justify-start">
                <span>E1: {L(mat.E1 / 1e9, language)} GPa</span>
                <span>Xt: {L(mat.Xt / 1e6, language)} MPa</span>
                <span>Xc: {L(mat.Xc / 1e6, language)} MPa</span>
              </div>
              {mat.isUserDefined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMaterial(mat.name);
                    toast.success(
                      language === "fa" ? "ماده حذف شد" : "Material deleted",
                    );
                  }}
                  className={`absolute top-4 ${
                    language === "fa" ? "left-4" : "right-4"
                  } p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setIsCustomizing(true)}
            className="p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400 flex flex-col items-center gap-3 hover:text-emerald-500 transition-all dark:bg-slate-900/10"
          >
            <Plus size={24} />
            <span className="font-medium text-sm uppercase">
              {t.customMaterial}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export const LoadingStep = () => {
  const {
    analysisType,
    combinedPair,
    loadingType,
    loads,
    language,
    updateState,
  } = useCLTStore();
  const t = translations[language];
  const [sigXUnit, setSigXUnit] = useState("Pa");
  const [sigYUnit, setSigYUnit] = useState("Pa");
  const [tauXYUnit, setTauXYUnit] = useState("Pa");
  const [epsXUnit, setEpsXUnit] = useState("strain");
  const [epsYUnit, setEpsYUnit] = useState("strain");
  const [gammaXYUnit, setGammaXYUnit] = useState("strain");

  const stressConversionFactors: Record<string, number> = {
    Pa: 1,
    kPa: 1e3,
    MPa: 1e6,
    GPa: 1e9,
  };

  const stressUnitMap: Record<
    string,
    [string, React.Dispatch<React.SetStateAction<string>>]
  > = {
    sigX: [sigXUnit, setSigXUnit],
    sigY: [sigYUnit, setSigYUnit],
    tauXY: [tauXYUnit, setTauXYUnit],
  };

  const strainConversionFactors: Record<string, number> = {
    strain: 1,
    microstrain: 1e-6,
    percent: 0.01,
  };

  const strainUnitMap: Record<
    string,
    [string, React.Dispatch<React.SetStateAction<string>>]
  > = {
    epsX: [epsXUnit, setEpsXUnit],
    epsY: [epsYUnit, setEpsYUnit],
    gammaXY: [gammaXYUnit, setGammaXYUnit],
  };

  const toDisplay = (val: number, unit: string) =>
    val / (stressConversionFactors[unit] || 1);
  const toStorage = (val: number, unit: string) =>
    val * (stressConversionFactors[unit] || 1);
  const strainToDisplay = (val: number, unit: string) =>
    val / (strainConversionFactors[unit] || 1);
  const strainToStorage = (val: number, unit: string) =>
    val * (strainConversionFactors[unit] || 1);

  const base = getBasePhysics(analysisType);
  const isSingle = isSingleLayer(analysisType);

  const showMechanical =
    base === "MECHANICAL" ||
    (base === "COMBINED" &&
      (combinedPair === CombinedPair.MECH_THERM ||
        combinedPair === CombinedPair.MECH_HYGR));

  const showThermal =
    base === "THERMAL" ||
    (base === "COMBINED" &&
      (combinedPair === CombinedPair.MECH_THERM ||
        combinedPair === CombinedPair.THERM_HYGR));

  const showHygral =
    base === "HYGRAL" ||
    (base === "COMBINED" &&
      (combinedPair === CombinedPair.MECH_HYGR ||
        combinedPair === CombinedPair.THERM_HYGR));

  const handleLoadChange = (field: string, value: string) => {
    if (value === "") {
      updateState({ loads: { ...loads, [field]: 0 } });
      return;
    }
    if (value === "-" || value === "−") {
      return;
    }
    const num = parseL(value, language);
    if (!isNaN(num)) {
      updateState({ loads: { ...loads, [field]: num } });
    }
  };

  const showStressInput =
    isSingle && showMechanical && loadingType === "STRESS";
  const showStrainInput =
    isSingle && showMechanical && loadingType === "STRAIN";
  const showLoadInput = !isSingle && showMechanical;

  // Real-time Zod check to show input validation warning
  const validationResult = loadsSchema.safeParse(loads);
  const getFieldError = (field: string) => {
    if (validationResult.success) return null;
    const format = validationResult.error.format() as any;
    return format[field]?._errors?.[0];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-indigo-500/20 pb-3 flex items-center gap-3">
        <Activity className="text-indigo-500" size={20} /> {t.loading}
      </h2>

      {isSingle && showMechanical && (
        <div className="flex justify-center w-full mb-4">
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg border border-white/10 w-auto min-w-[280px] shadow-sm">
            <button
              onClick={() => updateState({ loadingType: LoadingType.STRESS })}
              className={`flex-1 py-2.5 px-5 rounded-md font-medium text-xs transition-all text-center ${
                loadingType === LoadingType.STRESS
                  ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t.stressInput || "Stress"}
            </button>
            <button
              onClick={() => updateState({ loadingType: LoadingType.STRAIN })}
              className={`flex-1 py-2.5 px-5 rounded-md font-medium text-xs transition-all text-center ${
                loadingType === LoadingType.STRAIN
                  ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t.strainInput || "Strain"}
            </button>
          </div>
        </div>
      )}

      {showLoadInput && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
            {t.loadParams}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-slate-700">
            {["Nx", "Ny", "Nxy", "Mx", "My", "Mxy"].map((p) => {
              const err = getFieldError(p);
              return (
                <div key={p} className="space-y-1 text-start">
                  <label className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {p} {p.startsWith("N") ? "(N/m)" : "(N·m/m)"}
                  </label>
                  <NumericInput
                    value={L((loads as any)[p], language)}
                    onChange={(e: any) => handleLoadChange(p, e.target.value)}
                    className={`w-full p-3 text-sm font-medium bg-white dark:bg-black/40 border rounded-lg focus:border-indigo-500 outline-none transition-all dark:text-white ${
                      err
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="0"
                  />
                  {err && (
                    <span className="text-red-500 text-[10px] block">
                      {err}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showStressInput && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
            {t.stressInput}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { field: "sigX", label: "σx" },
              { field: "sigY", label: "σy" },
              { field: "tauXY", label: "τxy" },
            ].map(({ field, label }) => {
              const err = getFieldError(field);
              const [currentUnit, setUnit] = stressUnitMap[field] || [
                "Pa",
                () => {},
              ];
              return (
                <div key={field} className="space-y-1 text-start">
                  <label className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {label} ({currentUnit})
                  </label>
                  <div className="flex gap-2">
                    <NumericInput
                      value={L(
                        toDisplay((loads as any)[field] || 0, currentUnit),
                        language,
                      )}
                      onChange={(e: any) => {
                        const val = parseL(e.target.value, language);
                        if (!isNaN(val)) {
                          updateState({
                            loads: {
                              ...loads,
                              [field]: toStorage(val, currentUnit),
                            },
                          });
                        }
                      }}
                      className={`flex-1 p-3 text-sm font-medium bg-white dark:bg-black/40 border rounded-lg focus:border-indigo-500 outline-none transition-all dark:text-white ${
                        err
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      placeholder="0"
                    />
                    <select
                      value={currentUnit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="px-2 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-white cursor-pointer text-sm text-center"
                    >
                      {getStressUnits().map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {err && (
                    <span className="text-red-500 text-[10px] block">
                      {err}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showStrainInput && (
        <div className="space-y-4">
          <h3 className="text-s font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-start">
            {t.strainInput}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { field: "epsX", label: "εx" },
              { field: "epsY", label: "εy" },
              { field: "gammaXY", label: "γxy" },
            ].map(({ field, label }) => {
              const err = getFieldError(field);
              const [currentUnit, setUnit] = strainUnitMap[field] || [
                "strain",
                () => {},
              ];
              return (
                <div key={field} className="space-y-1 text-start">
                  <label className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {label} ({currentUnit})
                  </label>
                  <div className="flex gap-2">
                    <NumericInput
                      value={L(
                        strainToDisplay(
                          (loads as any)[field] || 0,
                          currentUnit,
                        ),
                        language,
                      )}
                      onChange={(e: any) => {
                        const val = parseL(e.target.value, language);
                        if (!isNaN(val)) {
                          updateState({
                            loads: {
                              ...loads,
                              [field]: strainToStorage(val, currentUnit),
                            },
                          });
                        }
                      }}
                      className={`w-40 px-2 py-2 text-sm font-medium bg-white dark:bg-black/40 border rounded-lg focus:border-indigo-500 outline-none transition-all dark:text-white text-center ${
                        err
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      placeholder="0"
                    />
                    <select
                      value={currentUnit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="px-2 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-white cursor-pointer text-xs text-center"
                    >
                      {getStrainUnits().map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {err && (
                    <span className="text-red-500 text-[10px] block">
                      {err}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(showThermal || showHygral) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {showThermal && (
            <div className="space-y-1 text-start">
              <label className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                ΔT (°C)
                <InfoTooltip
                  text="Temperature change (positive for increase)"
                  language={language}
                />
              </label>
              <NumericInput
                value={L(loads.dT, language)}
                onChange={(e: any) => handleLoadChange("dT", e.target.value)}
                className={`w-full p-3 text-sm font-medium bg-white dark:bg-black/40 border rounded-lg focus:border-indigo-500 outline-none transition-all dark:text-white ${
                  getFieldError("dT")
                    ? "border-red-500"
                    : "border-slate-200 dark:border-slate-700"
                }`}
                placeholder="0"
              />
              {getFieldError("dT") && (
                <span className="text-red-500 text-[10px] block">
                  {getFieldError("dT")}
                </span>
              )}
            </div>
          )}
          {showHygral && (
            <div className="space-y-1 text-start">
              <label className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                ΔC (%)
                <InfoTooltip
                  text="Moisture concentration change (%)"
                  language={language}
                />
              </label>
              <NumericInput
                value={L(loads.dC, language)}
                onChange={(e: any) => handleLoadChange("dC", e.target.value)}
                className={`w-full p-3 text-sm font-medium bg-white dark:bg-black/40 border rounded-lg focus:border-indigo-500 outline-none transition-all dark:text-white ${
                  getFieldError("dC")
                    ? "border-red-500"
                    : "border-slate-200 dark:border-slate-700"
                }`}
                placeholder="0"
              />
              {getFieldError("dC") && (
                <span className="text-red-500 text-[10px] block">
                  {getFieldError("dC")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LayupStep = () => {
  const { layers, language, updateState } = useCLTStore();
  const t = translations[language];

  const handleThetaChange = (index: number, value: string) => {
    const n = [...layers];

    if (value === "") {
      n[index].theta = 0;
      updateState({ layers: n });
      return;
    }

    if (value === "-" || value === "−") {
      return;
    }

    const num = parseL(value, language);
    if (!isNaN(num)) {
      n[index].theta = num;
      updateState({ layers: n });
    }
  };

  const handleThicknessChange = (index: number, value: string) => {
    const n = [...layers];

    if (value === "") {
      n[index].thickness = 0.001;
      updateState({ layers: n });
      return;
    }

    if (value === "-" || value === "−") {
      return;
    }

    const num = parseL(value, language);
    if (!isNaN(num)) {
      n[index].thickness = num;
      updateState({ layers: n });
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-blue-500/20 pb-3 flex items-center gap-3">
        <Layers className="text-blue-500" size={20} /> {t.layup}
        <InfoTooltip
          text="Define plies from bottom to top. Angle in degrees (positive counter-clockwise, negative clockwise), thickness in meters."
          language={language}
        />
      </h2>

      <div className="flex justify-between items-center bg-slate-50 dark:bg-black/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="font-medium text-sm text-slate-600 dark:text-slate-300">
          {t.layerCount} {L(layers.length, language)}
        </span>
        <button
          onClick={() =>
            updateState({
              layers: [...layers, { theta: 0, thickness: 0.001 }],
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
        >
          <Plus size={16} /> {t.addLayer}
        </button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar pt-8">
        {layers.map((l: any, i: number) => {
          // Real-time zod checks for this layer
          const layerErr = layerSchema.safeParse(l);
          const hasError = !layerErr.success;

          return (
            <div
              key={i}
              className={`grid grid-cols-4 gap-3 p-3 bg-white dark:bg-white/5 border rounded-lg items-center ${
                hasError
                  ? "border-red-400"
                  : "border-slate-100 dark:border-slate-800"
              }`}
            >
              <span className="text-xs font-medium text-slate-400 text-center">
                #{L(i + 1, language)}
              </span>

              <div className="relative">
                <NumericInput
                  value={L(l.theta, language)}
                  onChange={(e: any) => handleThetaChange(i, e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-black/30 border rounded-lg text-center dark:text-white font-medium text-sm w-40 focus:border-blue-500 outline-none"
                  placeholder="-45"
                />
                <InfoTooltip
                  text="Fiber angle relative to x-axis (degrees, negative allowed)"
                  language={language}
                />
              </div>

              <div className="relative">
                <NumericInput
                  value={L(l.thickness, language)}
                  onChange={(e: any) =>
                    handleThicknessChange(i, e.target.value)
                  }
                  className="p-2 bg-slate-50 dark:bg-black/30 border rounded-lg text-center dark:text-white font-medium text-sm w-40 focus:border-blue-500 outline-none"
                  placeholder="0.001"
                />
                <InfoTooltip text="Ply thickness (m)" language={language} />
              </div>

              <button
                onClick={() => {
                  const n = layers.filter((_: any, idx: number) => idx !== i);
                  updateState({
                    layers: n.length ? n : [{ theta: 0, thickness: 0.001 }],
                  });
                }}
                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg flex justify-center transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MatrixDisplay = ({
  title,
  matrix,
  tooltip,
  language = "en",
  unit = "",
  formula,
}: {
  title: string;
  matrix: number[][];
  tooltip?: string;
  language?: "fa" | "en";
  unit?: string;
  formula?: string;
}) => {
  const safeMatrix =
    matrix?.length === 3 && matrix.every((row) => row.length === 3)
      ? matrix
      : [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ];

  return (
    <div className="p-4 bg-slate-50/70 dark:bg-black/40 border border-slate-200/70 dark:border-slate-700/50 rounded-lg shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={12} className="text-blue-500 dark:text-blue-400" />
        <h3 className="font-medium text-blue-500 dark:text-blue-400 text-xs uppercase tracking-wider flex items-center gap-2">
          [{title}]
          {unit && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              ({unit})
            </span>
          )}
          {formula && (
            <span className="relative inline-block ml-1">
              <span className="text-[10px] text-slate-400 cursor-help border-b border-dashed border-slate-400 hover:text-blue-500 transition-colors">
                [?]
              </span>
              <span className="absolute z-[9999] w-64 p-2 text-xs font-mono rounded-lg shadow-md bottom-full mb-2 bg-slate-800 text-white border border-slate-600 hidden group-hover:block">
                {formula}
              </span>
            </span>
          )}
        </h3>
        {tooltip && <InfoTooltip text={tooltip} language={language} />}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {safeMatrix.flat().map((v: number, i: number) => (
          <div
            key={i}
            className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-emerald-600 dark:text-emerald-400 font-medium text-xs"
          >
            <span dir="ltr">{formatExponential(v, 2, language)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResultsStep = ({
  results1,
  results2,
  renderSideBySide,
}: {
  results1: CLTResults;
  results2: CLTResults | null;
  renderSideBySide: any;
}) => {
  const { analysisType, material, compMaterial, hasAngle, angle, language } =
    useCLTStore();
  const t = translations[language];
  const isSingle = analysisType && isSingleLayer(analysisType);

  const contentSingle = (mat: MaterialProperties, plyAngle: number) => {
    if (!mat) {
      return (
        <div className="text-center text-slate-500 text-sm py-6">
          No material selected
        </div>
      );
    }
    const Q = calculateQ(mat);
    const Qbar = calculateQBar(Q, plyAngle);
    const S = calculateS(Q);
    const Sbar = calculateS(Qbar);
    return (
      <div className="space-y-4">
        <MatrixDisplay
          title="Q"
          matrix={Q}
          tooltip="Stiffness matrix in material coordinates"
          language={language}
        />
        <MatrixDisplay
          title="Q-bar"
          matrix={Qbar}
          tooltip="Transformed stiffness matrix (global coordinates)"
          language={language}
        />
        <MatrixDisplay
          title="S"
          matrix={S}
          tooltip="Compliance matrix in material coordinates"
          language={language}
        />
        <MatrixDisplay
          title="S-bar"
          matrix={Sbar}
          tooltip="Transformed compliance matrix (global coordinates)"
          language={language}
        />
      </div>
    );
  };

  const contentMulti = (res: CLTResults | null) => {
    if (!res) {
      return (
        <div className="text-center text-slate-500 text-sm py-6">
          No comparison data available
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <MatrixDisplay
          title="A"
          matrix={res.A}
          tooltip="Extensional stiffness matrix (N/m)"
          language={language}
        />
        <MatrixDisplay
          title="B"
          matrix={res.B}
          tooltip="Coupling stiffness matrix (N)"
          language={language}
        />
        <MatrixDisplay
          title="D"
          matrix={res.D}
          tooltip="Bending stiffness matrix (N·m)"
          language={language}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-5xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-blue-500/20 pb-3 flex items-center gap-3">
        <Cpu className="text-blue-500" size={20} /> {t.results}
      </h2>
      {renderSideBySide(
        isSingle ? "Ply Matrices" : "Laminate Matrices",
        isSingle
          ? contentSingle(material, hasAngle ? angle : 0)
          : contentMulti(results1),
        isSingle
          ? contentSingle(compMaterial || material, hasAngle ? angle : 0)
          : contentMulti(results2),
      )}
    </div>
  );
};

export const FinalAnswerStep = ({
  results1,
  results2,
  renderSideBySide,
}: {
  results1: CLTResults;
  results2: CLTResults | null;
  renderSideBySide: any;
}) => {
  const { language } = useCLTStore();
  const t = translations[language];

  const content = (res: CLTResults | null) => {
    if (!res) {
      return (
        <div className="p-8 text-center text-slate-500 text-sm">
          No comparison data available
        </div>
      );
    }
    const safeMidplaneStrain = res.midplaneStrain || [0, 0, 0];
    const safeCurvature = res.curvature || [0, 0, 0];
    const safeLayerStresses = res.layerStresses || [];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-medium text-indigo-500 dark:text-indigo-400 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-start">
            Mid-plane Strains (ε⁰, γ⁰)
            <InfoTooltip
              text="Mid-plane extensional and shear strains (εx⁰, εy⁰, γxy⁰)"
              language={language}
            />
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {safeMidplaneStrain.map((val, i) => (
              <div
                key={i}
                className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm"
              >
                <span dir="ltr">{formatExponential(val, 3, language)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-medium text-indigo-500 dark:text-indigo-400 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-start">
            Curvatures (κ)
            <InfoTooltip
              text="Plate curvatures (κx, κy, κxy) [rad/m]"
              language={language}
            />
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {safeCurvature.map((val, i) => (
              <div
                key={i}
                className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm"
              >
                <span dir="ltr">{formatExponential(val, 3, language)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-medium text-indigo-500 dark:text-indigo-400 text-sm mb-3 flex items-center gap-2 uppercase tracking-wider text-start">
            Layer Stresses (σ₁, σ₂, τ₁₂) [Pa]
            <InfoTooltip
              text="Stresses in material coordinates (fiber direction, transverse, in-plane shear)"
              language={language}
            />
          </h3>
          {safeLayerStresses.length > 0 ? (
            safeLayerStresses.map((stressPair, i) => {
              const materialStress = stressPair[0] || [0, 0, 0];
              const [sig1, sig2, tau12] = materialStress;
              return (
                <div key={i} className="grid grid-cols-3 gap-2 mt-2">
                  <div className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <span dir="ltr">
                      {formatExponential(sig1, 2, language)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <span dir="ltr">
                      {formatExponential(sig2, 2, language)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-md text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <span dir="ltr">
                      {formatExponential(tau12, 2, language)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-500 py-4 text-sm">
              No layer stress data available
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-indigo-500/20 pb-3 flex items-center gap-3">
        <Activity className="text-indigo-500" size={20} /> {t.finalAnswer}
      </h2>
      {renderSideBySide("Final Results", content(results1), content(results2))}
    </div>
  );
};

export const FailureStep = ({
  results1,
  results2,
  renderSideBySide,
}: {
  results1: CLTResults;
  results2: CLTResults | null;
  renderSideBySide: any;
}) => {
  const { failureCriterion, language, updateState } = useCLTStore();
  const t = translations[language];

  const failureContent = (res: CLTResults | null) => {
    if (!res) {
      return (
        <div className="p-8 text-center text-slate-500 text-sm">
          No comparison data available
        </div>
      );
    }
    const isSafe = res.isSafe === undefined ? true : res.isSafe;
    const maxFailureIndex =
      res.maxFailureIndex !== undefined && !isNaN(res.maxFailureIndex)
        ? res.maxFailureIndex
        : 0;

    return (
      <div
        className={`p-8 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-3xl min-h-[240px] ${
          isSafe
            ? "bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
            : "bg-red-500/5 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]"
        }`}
      >
        {isSafe ? (
          <CheckCircle2 size={48} className="text-emerald-500 drop-shadow-md" />
        ) : (
          <AlertCircle size={48} className="text-red-500 drop-shadow-md" />
        )}
        <div className="text-center">
          <h3
            className={`text-2xl font-bold ${isSafe ? "text-emerald-500" : "text-red-500"}`}
          >
            {isSafe ? t.safe : t.fail}
          </h3>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2 mt-2">
            Index: {L(maxFailureIndex.toFixed(4), language)}
            <InfoTooltip
              text="Stress/strength ratio; failure if >1"
              language={language}
            />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold dark:text-white border-b border-red-500/20 pb-3 flex items-center gap-3">
        <ShieldCheck className="text-red-500" size={20} /> {t.failure}
      </h2>

      <div className="flex justify-center w-full mb-6">
        <div className="flex p-1 bg-black/40 rounded-lg border border-white/10 w-auto min-w-[240px] shadow-sm">
          {["MAX_STRESS", "TSAI_WU"].map((c) => (
            <button
              key={c}
              onClick={() => updateState({ failureCriterion: c as any })}
              className={`flex-1 py-2.5 px-5 rounded-md font-medium text-xs transition-all text-center whitespace-nowrap ${
                failureCriterion === c
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {c === "MAX_STRESS"
                ? language === "fa"
                  ? "تنش"
                  : "Stress"
                : language === "fa"
                  ? "تسای-وو"
                  : "Tsai-Wu"}
            </button>
          ))}
        </div>
      </div>

      {renderSideBySide(
        "Safety Assessment",
        failureContent(results1),
        failureContent(results2),
      )}
    </div>
  );
};

export const VisualizationStep = ({
  results1,
  results2,
  deformedDimensions,
  renderSideBySide,
}: {
  results1: CLTResults;
  results2: CLTResults | null;
  deformedDimensions: any;
  renderSideBySide: any;
}) => {
  const { material, compMaterial, layers, language } = useCLTStore();
  const t = translations[language];

  const viz = (mat: MaterialProperties, res: CLTResults | null) => {
    if (!res) {
      return (
        <div className="p-8 text-center text-slate-500 text-sm">
          No comparison data available
        </div>
      );
    }
    const safeLayerStresses = res.layerStresses || [];
    const maxStress =
      safeLayerStresses.length > 0
        ? Math.max(
            ...safeLayerStresses.map((s) => Math.abs(s[0]?.[0] || 0)),
            1e-6,
          )
        : 1e-6;

    return (
      <div className="space-y-4">
        <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-900/10 dark:bg-black/60 relative flex flex-col-reverse p-2 overflow-hidden shadow-inner">
          {layers.map((l: any, i: number) => (
            <div
              key={i}
              className="w-full h-full border-t border-white/5 flex items-center justify-center relative group overflow-hidden"
              style={{
                backgroundColor: `hsla(${210 + (l.theta || 0)}, 60%, 45%, 0.4)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(${(l.theta || 0) + 90}deg, transparent, transparent 8px, #ffffff 8px, #ffffff 9px)`,
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="z-10 text-white font-medium flex items-center gap-2 text-xs drop-shadow-md">
                <span>#{L(i + 1, language)}</span>
                <span>|</span>
                <span>{L(l.theta || 0, language)}°</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 text-start">
            <TrendingUp size={12} /> Stress Ratio (% of strength)
            <InfoTooltip
              text="Applied stress to material strength ratio (%)"
              language={language}
            />
          </h4>

          {safeLayerStresses.length > 0 ? (
            safeLayerStresses.map((s, i) => {
              const sig1 = s[0]?.[0] || 0;
              const strength = sig1 > 0 ? mat.Xt || 1e12 : mat.Xc || 1e12;
              let ratio = Math.abs(sig1) / Math.max(strength, 1e-12);
              const displayRatio = Math.min(ratio * 100, 100);
              const barColor =
                ratio > 0.9
                  ? "bg-red-500"
                  : ratio > 0.7
                    ? "bg-amber-500"
                    : "bg-blue-500";

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-300">
                      #{L(i + 1, language)} σ₁
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {L(sig1.toExponential(2), language)} Pa /{" "}
                      {L((strength / 1e6).toFixed(0), language)} MPa
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-300`}
                        style={{ width: `${displayRatio}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-12 text-right">
                      {L(displayRatio.toFixed(1), language)}%
                    </span>
                  </div>
                  {ratio > 0.8 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                      <AlertCircle size={12} />
                      <span>{ratio > 1 ? "FAILED" : "WARNING"}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-500 py-4 text-sm">
              No stress data available
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-start">
            <div>Max σ₁: {L(maxStress.toExponential(2), language)} Pa</div>
            <div>Xt: {L((mat.Xt || 0).toExponential(2), language)} Pa</div>
          </div>
        </div>

        {deformedDimensions && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-lg text-start">
            <h4 className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Ruler size={12} /> {t.deformedDimensions}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  {t.length}
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                  {L(
                    (deformedDimensions.newLength * 1000).toFixed(2),
                    language,
                  )}{" "}
                  mm
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  {t.width}
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                  {L((deformedDimensions.newWidth * 1000).toFixed(2), language)}{" "}
                  mm
                </span>
              </div>
              {deformedDimensions.newAngle !== undefined && (
                <div className="col-span-2 mt-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    {t.newAngle}
                  </span>
                  <span className="text-base font-bold text-amber-500">
                    {L(deformedDimensions.newAngle.toFixed(2), language)}°
                    <span className="text-xs text-slate-400 ml-2">
                      ({t.shearStrain}:{" "}
                      {L(
                        deformedDimensions.shearStrain.toExponential(2),
                        language,
                      )}
                      )
                    </span>
                  </span>
                </div>
              )}
              {deformedDimensions.newAngle === undefined && (
                <div className="col-span-2 mt-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t.noShear}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-emerald-500/20 pb-3 flex items-center gap-3">
        <TrendingUp className="text-emerald-500" size={20} /> {t.viz}
      </h2>
      {renderSideBySide(
        "Stress Analysis",
        viz(material, results1),
        viz(compMaterial || material, results2),
      )}
    </div>
  );
};

export const DimensionsStep = ({
  deformedDimensions,
}: {
  deformedDimensions: any;
}) => {
  const { dimensions, language, updateState } = useCLTStore();
  const t = translations[language];
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [widthUnit, setWidthUnit] = useState("mm");

  const handleDimensionChange = (dim: string, value: string, unit: string) => {
    if (value === "") {
      updateState({ dimensions: { ...dimensions, [dim]: 0.001 } });
      return;
    }
    if (value === "-" || value === "−") {
      return;
    }
    const num = parseL(value, language);
    if (!isNaN(num)) {
      const conversionFactors: Record<string, number> = {
        m: 1,
        mm: 0.001,
        cm: 0.01,
        in: 0.0254,
      };
      const valueInM = num * (conversionFactors[unit] || 0.001);
      updateState({ dimensions: { ...dimensions, [dim]: valueInM } });
    }
  };

  const getDisplayValue = (dim: string) => {
    const valueInM = (dimensions as any)[dim] || 1;
    const conversionFactors: Record<string, number> = {
      m: 1,
      mm: 0.001,
      cm: 0.01,
      in: 0.0254,
    };
    const factor =
      conversionFactors[dim === "length" ? lengthUnit : widthUnit] || 0.001;
    return valueInM / factor;
  };

  // Real-time Zod check to show input validation warning
  const valResult = dimensionsSchema.safeParse(dimensions);
  const getFieldError = (field: string) => {
    if (valResult.success) return null;
    const format = valResult.error.format() as any;
    return format[field]?._errors?.[0];
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-top-10 duration-500 max-w-4xl mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white border-b border-amber-500/20 pb-3 flex items-center gap-3">
        <Ruler className="text-amber-500" size={20} /> {t.dims}
      </h2>

      <div className="p-6 md:p-8 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl backdrop-blur-3xl shadow-md">
        <div
          onClick={() =>
            updateState({
              dimensions: {
                ...dimensions,
                wantsChanges: !dimensions.wantsChanges,
              },
            })
          }
          className={`flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all border ${
            dimensions.wantsChanges
              ? "bg-amber-500/10 border-amber-500 shadow-[inset_0_1px_10px_rgba(245,158,11,0.1)]"
              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700 hover:border-amber-400"
          }`}
        >
          <div
            className={`p-3 rounded-lg ${
              dimensions.wantsChanges
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {dimensions.wantsChanges ? (
              <Maximize2 size={20} />
            ) : (
              <Minimize2 size={20} />
            )}
          </div>
          <div className="text-start">
            <span
              className={`text-base md:text-lg font-bold block leading-tight ${
                dimensions.wantsChanges
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {t.dimensionsAsk}
            </span>
          </div>
        </div>

        {dimensions.wantsChanges && (
          <div className="mt-6 flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-500">
            <div className="flex-1 space-y-4 text-start">
              {["length", "width"].map((d) => {
                const err = getFieldError(d);
                return (
                  <div key={d} className="space-y-2">
                    <label className="text-xs font-medium uppercase text-slate-400 flex items-center gap-2">
                      {d === "length" ? t.length : t.width}
                      <InfoTooltip
                        text={
                          { length: "Plate length", width: "Plate width" }[d] ||
                          ""
                        }
                        language={language}
                      />
                    </label>
                    <div className="flex gap-2">
                      <div className="relative group flex-1">
                        <NumericInput
                          value={L(getDisplayValue(d), language)}
                          onChange={(e: any) =>
                            handleDimensionChange(
                              d,
                              e.target.value,
                              d === "length" ? lengthUnit : widthUnit,
                            )
                          }
                          className={`w-full p-3 pl-12 border rounded-lg bg-slate-50 dark:bg-black/40 text-xl font-bold text-slate-800 dark:text-white focus:border-amber-500 outline-none transition-all shadow-sm ${
                            err
                              ? "border-red-500"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400 text-sm">
                          {d === "length" ? lengthUnit : widthUnit}
                        </span>
                      </div>
                      <select
                        value={d === "length" ? lengthUnit : widthUnit}
                        onChange={(e) =>
                          d === "length"
                            ? setLengthUnit(e.target.value)
                            : setWidthUnit(e.target.value)
                        }
                        className="px-2 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-white cursor-pointer text-sm text-center"
                      >
                        {getLengthUnits().map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    {err && (
                      <span className="text-red-500 text-[10px] block">
                        {err}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center min-h-[240px] relative">
              <div
                className="absolute border border-amber-500/30 rounded-lg bg-amber-500/5 flex items-center justify-center opacity-50"
                style={{
                  width: `${Math.min(
                    100,
                    ((dimensions.length || 1) /
                      Math.max(dimensions.length || 1, dimensions.width || 1)) *
                      100,
                  )}%`,
                  aspectRatio: `${dimensions.length || 1} / ${dimensions.width || 1}`,
                  maxHeight: "160px",
                }}
              />
              {deformedDimensions && (
                <div
                  className="relative border border-blue-500/80 rounded-lg shadow-md transition-all duration-700 bg-blue-500/10 flex items-center justify-center group"
                  style={{
                    width: `${Math.min(
                      100,
                      ((deformedDimensions.newLength || 1) /
                        Math.max(
                          deformedDimensions.newLength || 1,
                          deformedDimensions.newWidth || 1,
                        )) *
                        100,
                    )}%`,
                    aspectRatio: `${deformedDimensions.newLength || 1} / ${deformedDimensions.newWidth || 1}`,
                    maxHeight: "160px",
                    transform: deformedDimensions.newAngle
                      ? `rotate(${deformedDimensions.newAngle}deg)`
                      : undefined,
                  }}
                >
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px opacity-50 dark:opacity-30 pointer-events-none p-px">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-blue-600/30 dark:border-blue-500/30 rounded-[1px]"
                      />
                    ))}
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-blue-700 dark:text-blue-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-full uppercase shadow-sm border border-blue-500/20 whitespace-nowrap z-20">
                    L':{" "}
                    {L(
                      (deformedDimensions.newLength * 1000).toFixed(2),
                      language,
                    )}{" "}
                    mm
                  </div>
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-blue-700 dark:text-blue-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-full uppercase whitespace-nowrap shadow-sm border border-blue-500/20 z-20">
                    W':{" "}
                    {L(
                      (deformedDimensions.newWidth * 1000).toFixed(2),
                      language,
                    )}{" "}
                    mm
                  </div>
                  {deformedDimensions.newAngle !== undefined && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-amber-600 bg-white dark:bg-slate-900 px-2 py-1 rounded-full shadow-sm border border-amber-500/20 z-20">
                      θ': {L(deformedDimensions.newAngle.toFixed(2), language)}°
                    </div>
                  )}
                  <ArrowUpRight
                    className="absolute -top-2 -right-2 text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform drop-shadow-sm"
                    size={20}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ReportStep = ({
  results1,
  results2,
  winner,
  generatePDF,
}: {
  results1: CLTResults;
  results2: CLTResults | null;
  winner: number | null;
  generatePDF: () => void;
}) => {
  const {
    language,
    compareMode,
    compareMetric,
    compMaterial,
    allMaterials,
    material,
    layers,
    updateState,
  } = useCLTStore();
  const t = translations[language];

  const isRtl = language === "fa";
  const defaultCompMaterial = allMaterials[1] || allMaterials[0];
  const currentCompMaterial = compMaterial || defaultCompMaterial;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto w-full">
      <div className="p-8 md:p-10 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl backdrop-blur-3xl shadow-lg text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-center gap-4">
          <Scale className="text-blue-500" size={24} /> {t.report}
        </h2>

        <button
          onClick={() => {
            if (!compMaterial) {
              updateState({
                compareMode: !compareMode,
                compMaterial: allMaterials[1] || allMaterials[0],
              });
            } else {
              updateState({ compareMode: !compareMode });
            }
          }}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-3 mx-auto mb-8 active:scale-95 ${
            compareMode
              ? "bg-amber-500 text-white shadow-amber-500/20"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          <ArrowRightLeft size={16} /> {t.compare}
        </button>

        {compareMode && (
          <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6 animate-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-start">
              <div className="relative">
                <label className="text-xs font-medium uppercase text-slate-400 ml-1 mb-1 block flex items-center gap-2">
                  {t.metric}
                  <InfoTooltip
                    text="Criterion for choosing the better material"
                    language={language}
                  />
                </label>
                <div className="relative group">
                  <select
                    value={compareMetric}
                    onChange={(e) =>
                      updateState({ compareMetric: e.target.value as any })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-white appearance-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 outline-none transition-all cursor-pointer shadow-sm hover:border-amber-400"
                  >
                    <option value="SAFETY">{t.safety}</option>
                    <option value="WEIGHT">{t.weight}</option>
                    <option value="STIFFNESS">{t.stiffness}</option>
                  </select>
                  <ChevronDown
                    className={`absolute top-1/2 ${isRtl ? "left-4" : "right-4"} -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors`}
                    size={16}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-medium uppercase text-slate-400 ml-1 mb-1 block flex items-center gap-2">
                  {t.compMode}
                  <InfoTooltip
                    text="Second material for comparison"
                    language={language}
                  />
                </label>
                <div className="relative group">
                  <select
                    value={currentCompMaterial.name}
                    onChange={(e) => {
                      const m = allMaterials.find(
                        (x: any) => x.name === e.target.value,
                      );
                      if (m) updateState({ compMaterial: m });
                    }}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-white appearance-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer shadow-sm hover:border-emerald-400"
                  >
                    {allMaterials.map((m: any) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={`absolute top-1/2 ${isRtl ? "left-4" : "right-4"} -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors`}
                    size={16}
                  />
                </div>
              </div>
            </div>

            {results2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((num) => (
                  <div
                    key={num}
                    className={`p-6 rounded-xl border-2 transition-all relative ${
                      winner === num
                        ? "border-amber-500 bg-amber-500/5 shadow-md scale-[1.02] z-10"
                        : "border-slate-200 dark:border-slate-700 opacity-60 grayscale scale-[0.99]"
                    }`}
                  >
                    {winner === num && (
                      <div
                        className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 bg-amber-500 rounded-lg text-white shadow-sm shadow-amber-500/30 animate-pulse`}
                      >
                        <Award size={16} />
                      </div>
                    )}
                    <h4
                      className={`text-lg font-bold text-slate-800 dark:text-white mb-4 text-start truncate ${
                        winner === num ? (isRtl ? "pl-12" : "pr-12") : ""
                      }`}
                    >
                      {num === 1 ? material.name : currentCompMaterial.name}
                    </h4>
                    <div className="space-y-3 text-start">
                      <div className="flex justify-between p-3 bg-white/50 dark:bg-slate-800/60 rounded-lg items-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          Fail Index:
                          <InfoTooltip
                            text="Maximum failure index (should be <1)"
                            language={language}
                          />
                        </span>
                        <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                          {L(
                            num === 1
                              ? (results1.maxFailureIndex || 0).toFixed(4)
                              : (results2.maxFailureIndex || 0).toFixed(4),
                            language,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/50 dark:bg-slate-800/60 rounded-lg items-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          Mass (kg/m²):
                          <InfoTooltip
                            text="Areal density (density × total thickness)"
                            language={language}
                          />
                        </span>
                        <span className="font-mono text-base font-bold text-slate-800 dark:text-white">
                          {L(
                            layers
                              .reduce(
                                (a: any, l: any) =>
                                  a +
                                  (l.thickness || 0) *
                                    (num === 1
                                      ? material.density || 0
                                      : currentCompMaterial.density || 0),
                                0,
                              )
                              .toFixed(2),
                            language,
                          )}
                        </span>
                      </div>
                    </div>
                    {winner === num && (
                      <div className="mt-4 px-3 py-1 bg-amber-500/20 rounded-full text-amber-500 font-medium text-xs uppercase tracking-wider inline-block border border-amber-500/30">
                        {t.winner}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm">
                Loading comparison data...
              </div>
            )}
          </div>
        )}

        <div className="mt-10 space-y-4 max-w-sm mx-auto">
          <button
            onClick={() => generatePDF()}
            className="w-full py-4 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-lg shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Download
              size={20}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            {t.downloadPdf}
          </button>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider opacity-70 text-center">
            Verified Engineering Assessment Document
          </p>
        </div>
      </div>
    </div>
  );
};
