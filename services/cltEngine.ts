import { MaterialProperties, Layer, CLTResults, AnalysisType, LoadingType } from "../types";

/**
 * Multiplies a 2D matrix by a 1D vector.
 * @param A - The input 2D matrix of numbers.
 * @param B - The input 1D vector of numbers.
 * @returns The resulting 1D vector.
 */
const multiplyMatrix = (A: number[][], B: number[]): number[] => {
  const result = new Array(A.length).fill(0);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      result[i] += A[i][j] * B[j];
    }
  }
  return result;
};

/**
 * Calculates the reduced stiffness matrix [Q] for an orthotropic lamina in principal material coordinates.
 * Reference: Jones - Mechanics of Composite Materials, Eq. 2.24
 *
 * Q11 = E1 / (1 - nu12 * nu21)
 * Q12 = nu12 * E2 / (1 - nu12 * nu21)
 * Q22 = E2 / (1 - nu12 * nu21)
 * Q66 = G12
 *
 * @param m - The material properties of the ply.
 * @returns A 3x3 reduced stiffness matrix.
 */
export const calculateQ = (m: MaterialProperties) => {
  const nu21 = (m.nu12 * m.E2) / m.E1;
  const denominator = 1 - m.nu12 * nu21;
  if (Math.abs(denominator) < 1e-15) {
    return [
      [m.E1, m.nu12 * m.E2, 0],
      [m.nu12 * m.E2, m.E2, 0],
      [0, 0, m.G12],
    ];
  }
  return [
    [m.E1 / denominator, (m.nu12 * m.E2) / denominator, 0],
    [(m.nu12 * m.E2) / denominator, m.E2 / denominator, 0],
    [0, 0, m.G12],
  ];
};

/**
 * Calculates the transformed reduced stiffness matrix [Q̄] for an orthotropic lamina at an angle θ.
 * Reference: Jones - Mechanics of Composite Materials, Eq. 2.80
 *
 * QB11 = Q11 * cos^4θ + 2*(Q12 + 2*Q66)*sin^2θ*cos^2θ + Q22 * sin^4θ
 * QB12 = (Q11 + Q22 - 4*Q66)*sin^2θ*cos^2θ + Q12*(sin^4θ + cos^4θ)
 * QB22 = Q11 * sin^4θ + 2*(Q12 + 2*Q66)*sin^2θ*cos^2θ + Q22 * cos^4θ
 * QB16 = (Q11 - Q12 - 2*Q66)*sinθ*cos^3θ + (Q12 - Q22 + 2*Q66)*sin^3θ*cosθ
 * QB26 = (Q11 - Q12 - 2*Q66)*sin^3θ*cosθ + (Q12 - Q22 + 2*Q66)*sinθ*cos^3θ
 * QB66 = (Q11 + Q22 - 2*Q12 - 2*Q66)*sin^2θ*cos^2θ + Q66*(sin^4θ + cos^4θ)
 *
 * @param Q - The 3x3 stiffness matrix [Q] in material coordinates.
 * @param thetaDeg - The ply angle in degrees.
 * @returns A 3x3 transformed reduced stiffness matrix [Q̄].
 */
export const calculateQBar = (Q: number[][], thetaDeg: number) => {
  const theta = (thetaDeg * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const c2 = c * c;
  const s2 = s * s;
  const cs = c * s;
  const Q11 = Q[0][0] || 0;
  const Q12 = Q[0][1] || 0;
  const Q22 = Q[1][1] || 0;
  const Q66 = Q[2][2] || 0;
  const QB11 = Q11 * Math.pow(c, 4) + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * Math.pow(s, 4);
  const QB12 = (Q11 + Q22 - 4 * Q66) * s2 * c2 + Q12 * (Math.pow(c, 4) + Math.pow(s, 4));
  const QB22 = Q11 * Math.pow(s, 4) + 2 * (Q12 + 2 * Q66) * s2 * c2 + Q22 * Math.pow(c, 4);
  const QB16 = (Q11 - Q12 - 2 * Q66) * cs * c2 + (Q12 - Q22 + 2 * Q66) * cs * s2;
  const QB26 = (Q11 - Q12 - 2 * Q66) * cs * s2 + (Q12 - Q22 + 2 * Q66) * cs * c2;
  const QB66 = (Q11 + Q22 - 2 * Q12 - 2 * Q66) * s2 * c2 + Q66 * (Math.pow(c, 4) + Math.pow(s, 4));
  return [
    [QB11, QB12, QB16],
    [QB12, QB22, QB26],
    [QB16, QB26, QB66],
  ];
};

/**
 * Calculates the compliance matrix [S] by inverting the stiffness matrix [Q].
 *
 * @param Q - The 3x3 reduced stiffness matrix.
 * @returns A 3x3 compliance matrix.
 */
export const calculateS = (Q: number[][]): number[][] => {
  try {
    const det =
      Q[0][0] * (Q[1][1] * Q[2][2] - Q[1][2] * Q[2][1]) -
      Q[0][1] * (Q[1][0] * Q[2][2] - Q[1][2] * Q[2][0]) +
      Q[0][2] * (Q[1][0] * Q[2][1] - Q[1][1] * Q[2][0]);
    if (Math.abs(det) < 1e-30) {
      return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }
    const invDet = 1 / det;
    return [
      [
        (Q[1][1] * Q[2][2] - Q[1][2] * Q[2][1]) * invDet,
        (Q[0][2] * Q[2][1] - Q[0][1] * Q[2][2]) * invDet,
        (Q[0][1] * Q[1][2] - Q[0][2] * Q[1][1]) * invDet,
      ],
      [
        (Q[1][2] * Q[2][0] - Q[1][0] * Q[2][2]) * invDet,
        (Q[0][0] * Q[2][2] - Q[0][2] * Q[2][0]) * invDet,
        (Q[0][2] * Q[1][0] - Q[0][0] * Q[1][2]) * invDet,
      ],
      [
        (Q[1][0] * Q[2][1] - Q[1][1] * Q[2][0]) * invDet,
        (Q[0][1] * Q[2][0] - Q[0][0] * Q[2][1]) * invDet,
        (Q[0][0] * Q[1][1] - Q[0][1] * Q[1][0]) * invDet,
      ],
    ];
  } catch {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
};

/**
 * Calculates the transformed compliance matrix [S̄] by inverting the transformed stiffness matrix [Q̄].
 *
 * @param Qbar - The 3x3 transformed reduced stiffness matrix.
 * @returns A 3x3 transformed compliance matrix.
 */
export const calculateSbar = (Qbar: number[][]): number[][] => {
  return calculateS(Qbar);
};

/**
 * Inverts the 6x6 ABD matrix to determine the compliance characteristics of the laminate.
 *
 * @param A - The 3x3 extensional stiffness matrix.
 * @param B - The 3x3 coupling stiffness matrix.
 * @param D - The 3x3 bending stiffness matrix.
 * @returns The inverted 6x6 matrix.
 */
const invert6x6 = (A: number[][], B: number[][], D: number[][]) => {
  try {
    const matrix = Array.from({ length: 6 }, () => new Array(12).fill(0));
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        matrix[i][j] = A[i][j] || 0;
        matrix[i][j + 3] = B[i][j] || 0;
        matrix[i + 3][j] = B[i][j] || 0;
        matrix[i + 3][j + 3] = D[i][j] || 0;
        matrix[i][j + 6] = i === j ? 1 : 0;
        matrix[i + 3][j + 9] = i === j ? 1 : 0;
      }
    }
    for (let i = 0; i < 6; i++) {
      let pivot = matrix[i][i];
      if (Math.abs(pivot) < 1e-15) pivot = 1e-15;
      for (let j = 0; j < 12; j++) matrix[i][j] /= pivot;
      for (let k = 0; k < 6; k++) {
        if (k !== i) {
          const factor = matrix[k][i];
          for (let j = 0; j < 12; j++) matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }
    const inverted = Array.from({ length: 6 }, () => new Array(6).fill(0));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        inverted[i][j] = matrix[i][j + 6];
      }
    }
    return inverted;
  } catch {
    return Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 6 }, (_, j) => (i === j ? 1 : 0))
    );
  }
};

/**
 * Computes equivalent thermal loads (forces and moments) for the laminate due to temperature change ΔT.
 *
 * @param material - The material properties of the ply.
 * @param layers - The list of laminate layers (thicknesses and orientations).
 * @param zPoints - The coordinates of the ply boundaries along the laminate thickness.
 * @param dT - The temperature change.
 * @returns Object containing the thermal force vector (N) and moment vector (M).
 */
const calculateThermalLoads = (
  material: MaterialProperties,
  layers: Layer[],
  zPoints: number[],
  dT: number
): { N: number[]; M: number[] } => {
  if (Math.abs(dT) < 1e-10 || !material.alpha1 || !material.alpha2) {
    return { N: [0, 0, 0], M: [0, 0, 0] };
  }
  const Q = calculateQ(material);
  const N = [0, 0, 0];
  const M = [0, 0, 0];
  layers.forEach((l, i) => {
    const theta = (l.theta * Math.PI) / 180;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const c2 = c * c;
    const s2 = s * s;
    const cs = c * s;
    const alpha1 = material.alpha1 || 0;
    const alpha2 = material.alpha2 || 0;
    const alphaX = c2 * alpha1 + s2 * alpha2;
    const alphaY = s2 * alpha1 + c2 * alpha2;
    const alphaXY = 2 * cs * (alpha1 - alpha2);
    const QB = calculateQBar(Q, l.theta);
    const zk = zPoints[i];
    const zk1 = zPoints[i + 1];
    const Nk = [
      QB[0][0] * alphaX + QB[0][1] * alphaY + QB[0][2] * alphaXY,
      QB[1][0] * alphaX + QB[1][1] * alphaY + QB[1][2] * alphaXY,
      QB[2][0] * alphaX + QB[2][1] * alphaY + QB[2][2] * alphaXY,
    ];
    for (let j = 0; j < 3; j++) {
      N[j] += Nk[j] * (zk1 - zk) * dT;
      M[j] += 0.5 * Nk[j] * (zk1 * zk1 - zk * zk) * dT;
    }
  });
  return { N, M };
};

/**
 * Computes equivalent hygral loads (forces and moments) for the laminate due to moisture change ΔC.
 *
 * @param material - The material properties of the ply.
 * @param layers - The list of laminate layers (thicknesses and orientations).
 * @param zPoints - The coordinates of the ply boundaries along the laminate thickness.
 * @param dC - The moisture concentration change.
 * @returns Object containing the hygral force vector (N) and moment vector (M).
 */
const calculateHygralLoads = (
  material: MaterialProperties,
  layers: Layer[],
  zPoints: number[],
  dC: number
): { N: number[]; M: number[] } => {
  if (Math.abs(dC) < 1e-10 || !material.beta1 || !material.beta2) {
    return { N: [0, 0, 0], M: [0, 0, 0] };
  }
  const Q = calculateQ(material);
  const N = [0, 0, 0];
  const M = [0, 0, 0];
  layers.forEach((l, i) => {
    const theta = (l.theta * Math.PI) / 180;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const c2 = c * c;
    const s2 = s * s;
    const cs = c * s;
    const beta1 = material.beta1 || 0;
    const beta2 = material.beta2 || 0;
    const betaX = c2 * beta1 + s2 * beta2;
    const betaY = s2 * beta1 + c2 * beta2;
    const betaXY = 2 * cs * (beta1 - beta2);
    const QB = calculateQBar(Q, l.theta);
    const zk = zPoints[i];
    const zk1 = zPoints[i + 1];
    const Nk = [
      QB[0][0] * betaX + QB[0][1] * betaY + QB[0][2] * betaXY,
      QB[1][0] * betaX + QB[1][1] * betaY + QB[1][2] * betaXY,
      QB[2][0] * betaX + QB[2][1] * betaY + QB[2][2] * betaXY,
    ];
    for (let j = 0; j < 3; j++) {
      N[j] += Nk[j] * (zk1 - zk) * dC;
      M[j] += 0.5 * Nk[j] * (zk1 * zk1 - zk * zk) * dC;
    }
  });
  return { N, M };
};

/**
 * Evaluates the Tsai-Wu failure criterion for a ply based on stresses in material coordinates.
 * Reference: Jones - Mechanics of Composite Materials, Eq. 2.140
 *
 * @param sig1 - Stress along fiber direction.
 * @param sig2 - Stress transverse to fiber direction.
 * @param tau12 - In-plane shear stress.
 * @param Xt - Longitudinal tensile strength.
 * @param Xc - Longitudinal compressive strength.
 * @param Yt - Transverse tensile strength.
 * @param Yc - Transverse compressive strength.
 * @param S - Shear strength.
 * @returns The Tsai-Wu failure index (value >= 1 indicates failure).
 */
const calculateTsaiWu = (
  sig1: number,
  sig2: number,
  tau12: number,
  Xt: number,
  Xc: number,
  Yt: number,
  Yc: number,
  S: number,
): number => {
  const safeXt = Math.max(Xt, 1e-12);
  const safeXc = Math.max(Xc, 1e-12);
  const safeYt = Math.max(Yt, 1e-12);
  const safeYc = Math.max(Yc, 1e-12);
  const safeS = Math.max(S, 1e-12);
  const F1 = 1 / safeXt - 1 / safeXc;
  const F2 = 1 / safeYt - 1 / safeYc;
  const F11 = 1 / (safeXt * safeXc);
  const F22 = 1 / (safeYt * safeYc);
  const F66 = 1 / (safeS * safeS);
  const F12 = -0.5 * Math.sqrt(F11 * F22);
  const linear = F1 * sig1 + F2 * sig2;
  const quadratic =
    F11 * sig1 * sig1 +
    F22 * sig2 * sig2 +
    F66 * tau12 * tau12 +
    2 * F12 * sig1 * sig2;
  return linear + quadratic;
};

/**
 * Runs the Classical Laminate Theory (CLT) calculations to determine stiffness matrices,
 * mid-plane strains, curvatures, stresses, and failure safety evaluation for a laminate.
 *
 * @param material - The material properties of the laminate plies.
 * @param layers - The layers layup config (thickness, angle).
 * @param loads - Applied loading conditions (forces/moments or stresses/strains).
 * @param failureCriterion - The failure criterion to evaluate ("MAX_STRESS" | "TSAI_WU").
 * @param analysisType - The analysis type (Single-layer vs Laminate, Mechanical, Thermal, Hygral, Combined).
 * @param loadingType - Input loading type (STRESS, STRAIN, LOAD, etc.).
 * @param plyAngle - Orientation angle for single layer analysis (degrees).
 * @returns The CLTResults structure containing stiffness matrices, strains, stresses, and safety reports.
 */
export const runCLT = (
  material: MaterialProperties,
  layers: Layer[],
  loads: any,
  failureCriterion: "MAX_STRESS" | "TSAI_WU" = "MAX_STRESS",
  analysisType?: AnalysisType,
  loadingType?: LoadingType,
  plyAngle: number = 0,
): CLTResults => {
  if (!material || !layers || layers.length === 0) {
    return {
      A: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      B: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      D: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      midplaneStrain: [0, 0, 0],
      curvature: [0, 0, 0],
      layerStresses: [],
      isSafe: true,
      maxFailureIndex: 0,
    };
  }
  const isSingle = analysisType?.includes("SINGLE");
  const Q = calculateQ(material);
  if (isSingle) {
    let epsX_mech = 0, epsY_mech = 0, gammaXY_mech = 0;
    let sigX = 0, sigY = 0, tauXY = 0;
    
    const angle = plyAngle;
    const Qbar = calculateQBar(Q, angle);
    const Sbar = calculateS(Qbar);
    
    if (loadingType === LoadingType.STRESS) {
      sigX = loads.sigX || 0;
      sigY = loads.sigY || 0;
      tauXY = loads.tauXY || 0;
      epsX_mech = Sbar[0][0] * sigX + Sbar[0][1] * sigY + Sbar[0][2] * tauXY;
      epsY_mech = Sbar[1][0] * sigX + Sbar[1][1] * sigY + Sbar[1][2] * tauXY;
      gammaXY_mech = Sbar[2][0] * sigX + Sbar[2][1] * sigY + Sbar[2][2] * tauXY;
    } else if (loadingType === LoadingType.STRAIN) {
      const epsX_total = loads.epsX || 0;
      const epsY_total = loads.epsY || 0;
      const gammaXY_total = loads.gammaXY || 0;
      
      const dT = loads.dT || 0;
      const dC = loads.dC || 0;
      
      let alphaX = 0, alphaY = 0, alphaXY = 0;
      if (material.alpha1 && material.alpha2) {
        const theta = (plyAngle * Math.PI) / 180;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const c2 = c * c;
        const s2 = s * s;
        const cs = c * s;
        alphaX = c2 * material.alpha1 + s2 * material.alpha2;
        alphaY = s2 * material.alpha1 + c2 * material.alpha2;
        alphaXY = 2 * cs * (material.alpha1 - material.alpha2);
      }
      
      let betaX = 0, betaY = 0, betaXY = 0;
      if (material.beta1 && material.beta2) {
        const theta = (plyAngle * Math.PI) / 180;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const c2 = c * c;
        const s2 = s * s;
        const cs = c * s;
        betaX = c2 * material.beta1 + s2 * material.beta2;
        betaY = s2 * material.beta1 + c2 * material.beta2;
        betaXY = 2 * cs * (material.beta1 - material.beta2);
      }
      
      const epsX_free = alphaX * dT + betaX * dC;
      const epsY_free = alphaY * dT + betaY * dC;
      const gammaXY_free = alphaXY * dT + betaXY * dC;
      
      epsX_mech = epsX_total - epsX_free;
      epsY_mech = epsY_total - epsY_free;
      gammaXY_mech = gammaXY_total - gammaXY_free;
      
      sigX = Qbar[0][0] * epsX_mech + Qbar[0][1] * epsY_mech + Qbar[0][2] * gammaXY_mech;
      sigY = Qbar[1][0] * epsX_mech + Qbar[1][1] * epsY_mech + Qbar[1][2] * gammaXY_mech;
      tauXY = Qbar[2][0] * epsX_mech + Qbar[2][1] * epsY_mech + Qbar[2][2] * gammaXY_mech;
    }
    
    const dT = loads.dT || 0;
    const dC = loads.dC || 0;
    let alphaX = 0, alphaY = 0, alphaXY = 0;
    if (material.alpha1 && material.alpha2) {
      const theta = (plyAngle * Math.PI) / 180;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const c2 = c * c;
      const s2 = s * s;
      const cs = c * s;
      alphaX = c2 * material.alpha1 + s2 * material.alpha2;
      alphaY = s2 * material.alpha1 + c2 * material.alpha2;
      alphaXY = 2 * cs * (material.alpha1 - material.alpha2);
    }
    let betaX = 0, betaY = 0, betaXY = 0;
    if (material.beta1 && material.beta2) {
      const theta = (plyAngle * Math.PI) / 180;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const c2 = c * c;
      const s2 = s * s;
      const cs = c * s;
      betaX = c2 * material.beta1 + s2 * material.beta2;
      betaY = s2 * material.beta1 + c2 * material.beta2;
      betaXY = 2 * cs * (material.beta1 - material.beta2);
    }
    
    const epsX_free = alphaX * dT + betaX * dC;
    const epsY_free = alphaY * dT + betaY * dC;
    const gammaXY_free = alphaXY * dT + betaXY * dC;
    
    const epsX = loadingType === LoadingType.STRAIN ? (loads.epsX || 0) : (epsX_mech + epsX_free);
    const epsY = loadingType === LoadingType.STRAIN ? (loads.epsY || 0) : (epsY_mech + epsY_free);
    const gammaXY = loadingType === LoadingType.STRAIN ? (loads.gammaXY || 0) : (gammaXY_mech + gammaXY_free);
    
    const midplaneStrain = [epsX, epsY, gammaXY];
    const curvature = [0, 0, 0];
    
    const theta = (angle * Math.PI) / 180;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const c2 = c * c;
    const s2 = s * s;
    const cs = c * s;
    
    const sig1 = c2 * sigX + s2 * sigY + 2 * cs * tauXY;
    const sig2 = s2 * sigX + c2 * sigY - 2 * cs * tauXY;
    const tau12 = -cs * sigX + cs * sigY + (c2 - s2) * tauXY;
    
    const { Xt = 1e12, Xc = 1e12, Yt = 1e12, Yc = 1e12, S = 1e12 } = material;
    let maxFailureIndex = 0;
    if (failureCriterion === "MAX_STRESS") {
      const f1 = sig1 > 0 ? sig1 / Xt : -sig1 / Xc;
      const f2 = sig2 > 0 ? sig2 / Yt : -sig2 / Yc;
      const f12 = Math.abs(tau12) / S;
      maxFailureIndex = Math.max(f1, f2, f12);
    } else {
      maxFailureIndex = calculateTsaiWu(sig1, sig2, tau12, Xt, Xc, Yt, Yc, S);
    }
    const layerStresses = [[
      [sig1, sig2, tau12],
      [sigX, sigY, tauXY]
    ]];
    return {
      A: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      B: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      D: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      midplaneStrain,
      curvature,
      layerStresses,
      isSafe: maxFailureIndex < 1.0,
      maxFailureIndex,
    };
  }
  const totalH = layers.reduce((acc, l) => acc + Math.max(l.thickness, 1e-12), 0);
  let currentZ = -totalH / 2;
  const zPoints: number[] = [currentZ];
  layers.forEach((l) => {
    currentZ += Math.max(l.thickness, 1e-12);
    zPoints.push(currentZ);
  });
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const B = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const D = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const layerQBars: number[][][] = [];
  layers.forEach((l, i) => {
    const QB = calculateQBar(Q, l.theta || 0);
    layerQBars.push(QB);
    const zk = zPoints[i];
    const zk1 = zPoints[i + 1];
    const thickness = zk1 - zk;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        A[r][c] += QB[r][c] * thickness;
        B[r][c] += 0.5 * QB[r][c] * (zk1 * zk1 - zk * zk);
        D[r][c] += (1 / 3) * QB[r][c] * (Math.pow(zk1, 3) - Math.pow(zk, 3));
      }
    }
  });
  const dT = loads.dT || 0;
  const dC = loads.dC || 0;
  const thermal = calculateThermalLoads(material, layers, zPoints, dT);
  const hygral = calculateHygralLoads(material, layers, zPoints, dC);
  const loadVector = [
    (loads.Nx || 0) + thermal.N[0] + hygral.N[0],
    (loads.Ny || 0) + thermal.N[1] + hygral.N[1],
    (loads.Nxy || 0) + thermal.N[2] + hygral.N[2],
    (loads.Mx || 0) + thermal.M[0] + hygral.M[0],
    (loads.My || 0) + thermal.M[1] + hygral.M[1],
    (loads.Mxy || 0) + thermal.M[2] + hygral.M[2],
  ];
  const invConstitutive = invert6x6(A, B, D);
  const strainKappa = multiplyMatrix(invConstitutive, loadVector);
  const midplaneStrain = [strainKappa[0], strainKappa[1], strainKappa[2]];
  const curvature = [strainKappa[3], strainKappa[4], strainKappa[5]];
  let maxFailureIndex = 0;
  const layerStresses: number[][][] = layers.map((l, i) => {
    const zMid = (zPoints[i] + zPoints[i + 1]) / 2;
    const epsX = midplaneStrain[0] + zMid * curvature[0];
    const epsY = midplaneStrain[1] + zMid * curvature[1];
    const gammaXY = midplaneStrain[2] + zMid * curvature[2];
    
    const thetaVal = l.theta || 0;
    const thetaRad = (thetaVal * Math.PI) / 180;
    const c = Math.cos(thetaRad);
    const s = Math.sin(thetaRad);
    const c2 = c * c;
    const s2 = s * s;
    const cs = c * s;
    
    let alphaX = 0, alphaY = 0, alphaXY = 0;
    if (material.alpha1 && material.alpha2) {
      alphaX = c2 * material.alpha1 + s2 * material.alpha2;
      alphaY = s2 * material.alpha1 + c2 * material.alpha2;
      alphaXY = 2 * cs * (material.alpha1 - material.alpha2);
    }
    
    let betaX = 0, betaY = 0, betaXY = 0;
    if (material.beta1 && material.beta2) {
      betaX = c2 * material.beta1 + s2 * material.beta2;
      betaY = s2 * material.beta1 + c2 * material.beta2;
      betaXY = 2 * cs * (material.beta1 - material.beta2);
    }
    
    const epsX_free = alphaX * dT + betaX * dC;
    const epsY_free = alphaY * dT + betaY * dC;
    const gammaXY_free = alphaXY * dT + betaXY * dC;
    
    const epsX_mech = epsX - epsX_free;
    const epsY_mech = epsY - epsY_free;
    const gammaXY_mech = gammaXY - gammaXY_free;
    
    const QB = layerQBars[i];
    const sigX = QB[0][0] * epsX_mech + QB[0][1] * epsY_mech + QB[0][2] * gammaXY_mech;
    const sigY = QB[1][0] * epsX_mech + QB[1][1] * epsY_mech + QB[1][2] * gammaXY_mech;
    const tauXY = QB[2][0] * epsX_mech + QB[2][1] * epsY_mech + QB[2][2] * gammaXY_mech;
    
    const sig1 = c2 * sigX + s2 * sigY + 2 * cs * tauXY;
    const sig2 = s2 * sigX + c2 * sigY - 2 * cs * tauXY;
    const tau12 = -cs * sigX + cs * sigY + (c2 - s2) * tauXY;
    const { Xt = 1e12, Xc = 1e12, Yt = 1e12, Yc = 1e12, S = 1e12 } = material;
    let layerFailureIndex = 0;
    if (failureCriterion === "MAX_STRESS") {
      const f1 = sig1 > 0 ? sig1 / Xt : -sig1 / Xc;
      const f2 = sig2 > 0 ? sig2 / Yt : -sig2 / Yc;
      const f12 = Math.abs(tau12) / S;
      layerFailureIndex = Math.max(f1, f2, f12);
    } else {
      layerFailureIndex = calculateTsaiWu(sig1, sig2, tau12, Xt, Xc, Yt, Yc, S);
    }
    maxFailureIndex = Math.max(maxFailureIndex, layerFailureIndex);
    return [
      [sig1, sig2, tau12],
      [sigX, sigY, tauXY],
    ];
  });
  return {
    A,
    B,
    D,
    midplaneStrain,
    curvature,
    layerStresses,
    isSafe: maxFailureIndex < 1.0,
    maxFailureIndex,
    thermalForces: thermal.N,
    thermalMoments: thermal.M,
    hygralForces: hygral.N,
    hygralMoments: hygral.M,
  };
};