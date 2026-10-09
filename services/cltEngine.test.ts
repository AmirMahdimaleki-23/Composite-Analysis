import { calculateQ, calculateQBar, calculateS, runCLT } from "./cltEngine";
import { MaterialProperties, Layer, AnalysisType, LoadingType } from "../types";

describe("Classical Laminate Theory (CLT) calculations", () => {
  const carbonEpoxy: MaterialProperties = {
    name: "Carbon/Epoxy",
    E1: 150e9, // 150 GPa
    E2: 10e9,  // 10 GPa
    nu12: 0.3,
    G12: 5e9,  // 5 GPa
    Xt: 1500e6,
    Xc: 1200e6,
    Yt: 50e6,
    Yc: 20e6,
    S: 80e6,
  };

  test("calculateQ computes reduced stiffness matrix correctly", () => {
    const Q = calculateQ(carbonEpoxy);
    const nu21 = (carbonEpoxy.nu12 * carbonEpoxy.E2) / carbonEpoxy.E1;
    const denom = 1 - carbonEpoxy.nu12 * nu21;

    expect(Q[0][0]).toBeCloseTo(carbonEpoxy.E1 / denom);
    expect(Q[0][1]).toBeCloseTo((carbonEpoxy.nu12 * carbonEpoxy.E2) / denom);
    expect(Q[1][1]).toBeCloseTo(carbonEpoxy.E2 / denom);
    expect(Q[2][2]).toBeCloseTo(carbonEpoxy.G12);
  });

  test("calculateQBar at 0 degrees matches Q", () => {
    const Q = calculateQ(carbonEpoxy);
    const Qbar0 = calculateQBar(Q, 0);

    expect(Qbar0[0][0]).toBeCloseTo(Q[0][0]);
    expect(Qbar0[0][1]).toBeCloseTo(Q[0][1]);
    expect(Qbar0[1][1]).toBeCloseTo(Q[1][1]);
    expect(Qbar0[2][2]).toBeCloseTo(Q[2][2]);
    expect(Qbar0[0][2]).toBeCloseTo(0);
    expect(Qbar0[1][2]).toBeCloseTo(0);
  });

  test("calculateS inverts Q correctly", () => {
    const Q = calculateQ(carbonEpoxy);
    const S = calculateS(Q);

    // Q * S should be Identity Matrix
    const identity00 = Q[0][0] * S[0][0] + Q[0][1] * S[1][0] + Q[0][2] * S[2][0];
    const identity01 = Q[0][0] * S[0][1] + Q[0][1] * S[1][1] + Q[0][2] * S[2][1];
    const identity11 = Q[1][0] * S[0][1] + Q[1][1] * S[1][1] + Q[1][2] * S[2][1];

    expect(identity00).toBeCloseTo(1);
    expect(identity01).toBeCloseTo(0);
    expect(identity11).toBeCloseTo(1);
  });

  test("runCLT single layer mechanical stress analysis", () => {
    const layers: Layer[] = [{ theta: 0, thickness: 0.001 }];
    const loads = {
      sigX: 100e6, // 100 MPa
      sigY: 0,
      tauXY: 0,
    };

    const results = runCLT(
      carbonEpoxy,
      layers,
      loads,
      "MAX_STRESS",
      AnalysisType.MECHANICAL_SINGLE,
      LoadingType.STRESS,
      0
    );

    // Max Failure Index should be sig1 / Xt = 100e6 / 1500e6 = 1/15 = ~0.0667
    expect(results.maxFailureIndex).toBeCloseTo(100e6 / 1500e6);
    expect(results.isSafe).toBe(true);
  });

  test("runCLT single layer mechanical failure max stress", () => {
    const layers: Layer[] = [{ theta: 0, thickness: 0.001 }];
    const loads = {
      sigX: 2000e6, // 2000 MPa (exceeds Xt = 1500 MPa)
      sigY: 0,
      tauXY: 0,
    };

    const results = runCLT(
      carbonEpoxy,
      layers,
      loads,
      "MAX_STRESS",
      AnalysisType.MECHANICAL_SINGLE,
      LoadingType.STRESS,
      0
    );

    expect(results.maxFailureIndex).toBeGreaterThan(1.0);
    expect(results.isSafe).toBe(false);
  });
});
