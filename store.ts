import { create } from "zustand";
import { AppState, MaterialProperties, Layer, AnalysisType, LoadingType, CombinedPair } from "./types";
import { DEFAULT_MATERIALS } from "./constants";
import { validateMaterial, validateLayer, validateLoads, validateDimensions } from "./utils/validation";

interface CLTStore extends AppState {
  userMaterials: MaterialProperties[];
  allMaterials: MaterialProperties[];
  isCustomizing: boolean;
  customMat: MaterialProperties;
  setStep: (step: number) => void;
  updateState: (updates: Partial<AppState>) => void;
  setIsCustomizing: (val: boolean) => void;
  setCustomMat: (mat: MaterialProperties) => void;
  saveCustomMaterial: () => void;
  deleteMaterial: (name: string) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const isSingleLayer = (type: AnalysisType): boolean => {
  return type.includes("SINGLE");
};

const getBasePhysics = (type: AnalysisType): string => type.split("_")[0];

const initialUserMaterials: MaterialProperties[] = (() => {
  try {
    return JSON.parse(localStorage.getItem("user_materials") || "[]");
  } catch {
    return [];
  }
})();

const initialAllMaterials = [
  ...DEFAULT_MATERIALS,
  ...initialUserMaterials.map((m) => ({ ...m, isUserDefined: true })),
];

export const useCLTStore = create<CLTStore>((set, get) => ({
  // State
  step: 1,
  analysisType: AnalysisType.MECHANICAL_SINGLE,
  hasAngle: false,
  angle: 0,
  material: initialAllMaterials[0],
  loadingType: LoadingType.STRESS,
  layers: [{ theta: 0, thickness: 0.001 }],
  isSymmetric: false,
  isMirror: false,
  loads: {
    Nx: 1000,
    Ny: 0,
    Nxy: 0,
    Mx: 0,
    My: 0,
    Mxy: 0,
    sigX: 1e6,
    sigY: 0,
    tauXY: 0,
    epsX: 0.001,
    epsY: 0,
    gammaXY: 0,
    dT: 0,
    dC: 0,
  },
  failureCriterion: "MAX_STRESS",
  dimensions: { length: 0.1, width: 0.1, wantsChanges: false },
  theme: "dark",
  language: "fa",
  compareMode: false,
  compareMetric: "SAFETY",
  compMaterial: undefined,
  compLayers: undefined,
  combinedPair: undefined,

  userMaterials: initialUserMaterials,
  allMaterials: initialAllMaterials,
  isCustomizing: false,
  customMat: {
    name: "New Material",
    E1: 150e9,
    E2: 10e9,
    nu12: 0.28,
    G12: 5e9,
    density: 1600,
    Xt: 1500e6,
    Xc: 1200e6,
    Yt: 50e6,
    Yc: 20e6,
    S: 80e6,
  },

  // Actions
  setStep: (step) => set({ step }),
  setIsCustomizing: (val) => set({ isCustomizing: val }),
  setCustomMat: (mat) => set({ customMat: mat }),

  updateState: (updates) => {
    set((state) => {
      const newState = { ...state, ...updates };

      if (updates.material) {
        newState.material = validateMaterial(updates.material);
      }
      if (updates.layers) {
        newState.layers = updates.layers.map(validateLayer);
      }
      if (updates.loads) {
        newState.loads = validateLoads(updates.loads);
      }
      if (updates.dimensions) {
        newState.dimensions = validateDimensions({
          ...state.dimensions,
          ...updates.dimensions,
        });
      }
      if (updates.analysisType) {
        if (isSingleLayer(updates.analysisType)) {
          const base = getBasePhysics(updates.analysisType);
          if (
            base === "MECHANICAL" ||
            (base === "COMBINED" &&
              (newState.combinedPair === CombinedPair.MECH_THERM ||
                newState.combinedPair === CombinedPair.MECH_HYGR))
          ) {
            newState.loadingType = LoadingType.STRESS;
          } else {
            newState.loadingType = LoadingType.DELTA_T;
          }
        } else {
          newState.loadingType = LoadingType.LOAD;
        }
      }

      return newState;
    });
  },

  saveCustomMaterial: () => {
    const { customMat, userMaterials } = get();
    const validatedMat = validateMaterial(customMat);
    const updated = [...userMaterials, validatedMat];
    localStorage.setItem("user_materials", JSON.stringify(updated));

    const newAllMaterials = [
      ...DEFAULT_MATERIALS,
      ...updated.map((m) => ({ ...m, isUserDefined: true })),
    ];

    set({
      userMaterials: updated,
      allMaterials: newAllMaterials,
      material: validatedMat,
      isCustomizing: false,
    });
  },

  deleteMaterial: (name) => {
    const { userMaterials, material } = get();
    const updated = userMaterials.filter((m) => m.name !== name);
    localStorage.setItem("user_materials", JSON.stringify(updated));

    const newAllMaterials = [
      ...DEFAULT_MATERIALS,
      ...updated.map((m) => ({ ...m, isUserDefined: true })),
    ];

    const nextMaterial = material.name === name ? newAllMaterials[0] : material;

    set({
      userMaterials: updated,
      allMaterials: newAllMaterials,
      material: nextMaterial,
    });
  },

  toggleTheme: () => {
    set((state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      return { theme };
    });
  },

  toggleLang: () => {
    set((state) => {
      const language = state.language === "fa" ? "en" : "fa";
      return { language };
    });
  },

  nextStep: () => {
    const { step, analysisType } = get();
    let next = step + 1;
    if (step === 3 && isSingleLayer(analysisType)) {
      next = 5;
    }
    set({ step: Math.min(next, 10) });
  },

  prevStep: () => {
    const { step, analysisType } = get();
    let prev = step - 1;
    if (step === 5 && isSingleLayer(analysisType)) {
      prev = 3;
    }
    set({ step: Math.max(prev, 1) });
  },
}));
