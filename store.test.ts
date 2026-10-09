import { useCLTStore } from "./store";
import { AnalysisType, LoadingType } from "./types";

describe("CLT Zustand Store", () => {
  beforeEach(() => {
    // Reset store state
    useCLTStore.setState({
      step: 1,
      analysisType: AnalysisType.MECHANICAL_SINGLE,
      hasAngle: false,
      angle: 0,
      loadingType: LoadingType.STRESS,
      layers: [{ theta: 0, thickness: 0.001 }],
      isCustomizing: false,
    });
  });

  test("initial state matches expectations", () => {
    const state = useCLTStore.getState();
    expect(state.step).toBe(1);
    expect(state.analysisType).toBe(AnalysisType.MECHANICAL_SINGLE);
    expect(state.loadingType).toBe(LoadingType.STRESS);
  });

  test("setStep updates step", () => {
    useCLTStore.getState().setStep(4);
    expect(useCLTStore.getState().step).toBe(4);
  });

  test("updateState merges updates", () => {
    useCLTStore.getState().updateState({
      hasAngle: true,
      angle: 45,
    });
    const state = useCLTStore.getState();
    expect(state.hasAngle).toBe(true);
    expect(state.angle).toBe(45);
  });

  test("nextStep increments step and skips load parameters if single layer", () => {
    // step is 1
    useCLTStore.getState().nextStep(); // step 2
    expect(useCLTStore.getState().step).toBe(2);

    useCLTStore.getState().nextStep(); // step 3 (Loading Step)
    expect(useCLTStore.getState().step).toBe(3);

    useCLTStore.getState().nextStep(); // step 5 (Skipping layup step 4 for single layer)
    expect(useCLTStore.getState().step).toBe(5);
  });

  test("prevStep decrements step and skips layup step 4 if single layer", () => {
    useCLTStore.setState({ step: 5, analysisType: AnalysisType.MECHANICAL_SINGLE });
    useCLTStore.getState().prevStep(); // step 3
    expect(useCLTStore.getState().step).toBe(3);
  });
});
