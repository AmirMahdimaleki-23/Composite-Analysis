export enum AnalysisType {
  MECHANICAL_SINGLE = "MECHANICAL_SINGLE",
  MECHANICAL_MULTI = "MECHANICAL_MULTI",
  THERMAL_SINGLE = "THERMAL_SINGLE",
  THERMAL_MULTI = "THERMAL_MULTI",
  HYGRAL_SINGLE = "HYGRAL_SINGLE",
  HYGRAL_MULTI = "HYGRAL_MULTI",
  COMBINED_SINGLE = "COMBINED_SINGLE",
  COMBINED_MULTI = "COMBINED_MULTI",
}

export type Theme = "light" | "dark";
export type Language = "fa" | "en";

export enum LoadingType {
  STRESS = "STRESS",
  STRAIN = "STRAIN",
  LOAD = "LOAD",
  DELTA_T = "DELTA_T",
  DELTA_C = "DELTA_C",
}

export enum CombinedPair {
  MECH_THERM = "MECH_THERM",
  MECH_HYGR = "MECH_HYGR",
  THERM_HYGR = "THERM_HYGR",
}

export interface MaterialProperties {
  name: string;
  E1: number; // Pa
  E2: number; // Pa
  nu12: number;
  G12: number; // Pa
  density?: number; // kg/m3
  alpha1?: number; // 1/C
  alpha2?: number; // 1/C
  beta1?: number; // 1/m
  beta2?: number; // 1/m
  Xt?: number; // Tensile strength 1
  Xc?: number; // Compressive strength 1
  Yt?: number; // Tensile strength 2
  Yc?: number; // Compressive strength 2
  S?: number; // Shear strength
}

export interface Layer {
  theta: number; // degrees
  thickness: number; // meters
}

export interface AppState {
  step: number;
  analysisType: AnalysisType;
  hasAngle: boolean;
  angle: number;
  material: MaterialProperties;
  loadingType: LoadingType;
  layers: Layer[];
  isSymmetric: boolean;
  isMirror: boolean;
  loads: {
    // Mechanical loads (for multi-layer)
    Nx: number;
    Ny: number;
    Nxy: number;
    Mx: number;
    My: number;
    Mxy: number;
    // Stress inputs (for single-layer)
    sigX: number;
    sigY: number;
    tauXY: number;
    // Strain inputs (for single-layer)
    epsX: number;
    epsY: number;
    gammaXY: number;
    // Environmental
    dT: number;
    dC: number;
  };
  failureCriterion: "TSAI_WU" | "MAX_STRESS";
  dimensions: {
    length: number;
    width: number;
    wantsChanges: boolean;
    // Deformed dimensions
    newLength?: number;
    newWidth?: number;
    newAngle?: number;
    shearStrain?: number;
  };
  theme: Theme;
  language: Language;

  // Comparison Mode
  compareMode: boolean;
  compMaterial?: MaterialProperties;
  compLayers?: Layer[];
  compareMetric: "SAFETY" | "WEIGHT" | "STIFFNESS";

  // For combined analysis
  combinedPair?: CombinedPair;
}

export interface CLTResults {
  A: number[][];
  B: number[][];
  D: number[][];
  midplaneStrain: number[];
  curvature: number[];
  layerStresses: number[][][]; // [layer][0: material stresses (sig1,sig2,tau12), 1: global stresses (sigX,sigY,tauXY)]
  isSafe: boolean;
  maxFailureIndex: number;
  thermalForces?: number[]; // N^T
  thermalMoments?: number[]; // M^T
  hygralForces?: number[]; // N^H
  hygralMoments?: number[]; // M^H
}