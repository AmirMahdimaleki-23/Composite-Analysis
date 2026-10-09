import { MaterialProperties, Layer } from "../types";

/**
 * Validates a numeric input, fallback to defaultValue if invalid, and clamping to min and max boundaries.
 *
 * @param value - The input value to check.
 * @param defaultValue - The fallback value if parseFloat returns NaN. Defaults to 0.
 * @param min - The minimum allowed value boundary. Defaults to -Infinity.
 * @param max - The maximum allowed value boundary. Defaults to Infinity.
 * @returns The validated and parsed number.
 */
export const validateNumber = (
    value: any,
    defaultValue: number = 0,
    min: number = -Infinity,
    max: number = Infinity
): number => {
    if (value === undefined || value === null || value === "") return defaultValue;
    const num = parseFloat(value);
    if (isNaN(num)) return defaultValue;
    if (num < min) return min;
    if (num > max) return max;
    return num;
};

/**
 * Validates a positive numeric input, returning a value clamped to [0, max].
 *
 * @param value - The input value to check.
 * @param defaultValue - The fallback value. Defaults to 0.
 * @param max - The maximum boundary. Defaults to Infinity.
 * @returns The validated positive number.
 */
export const validatePositiveNumber = (
    value: any,
    defaultValue: number = 0,
    max: number = Infinity
): number => {
    return validateNumber(value, defaultValue, 0, max);
};

/**
 * Validates and normalizes all fields of a MaterialProperties object.
 * Clamps Young's modulus, Poisson's ratio, density, and strengths to reasonable physical limits.
 *
 * @param material - The raw MaterialProperties object.
 * @returns A validated MaterialProperties object.
 */
export const validateMaterial = (material: MaterialProperties): MaterialProperties => {
    return {
        ...material,
        E1: validatePositiveNumber(material.E1, 1e9, 1e15),
        E2: validatePositiveNumber(material.E2, 1e9, 1e15),
        nu12: validateNumber(material.nu12, 0.3, -1, 1),
        G12: validatePositiveNumber(material.G12, 1e9, 1e15),
        density: validatePositiveNumber(material.density, 100, 50000),
        Xt: validatePositiveNumber(material.Xt, 1e6, 1e12),
        Xc: validatePositiveNumber(material.Xc, 1e6, 1e12),
        Yt: validatePositiveNumber(material.Yt, 1e6, 1e12),
        Yc: validatePositiveNumber(material.Yc, 1e6, 1e12),
        S: validatePositiveNumber(material.S, 1e6, 1e12),
    };
};

/**
 * Validates a Layer object, checking theta (orientation angle) and thickness.
 * Clamps theta to [-180, 180] degrees and thickness to [0.0001, 1] meters.
 *
 * @param layer - The raw Layer object.
 * @returns A validated Layer object.
 */
export const validateLayer = (layer: Layer): Layer => {
    return {
        theta: validateNumber(layer.theta, 0, -180, 180),
        thickness: validatePositiveNumber(layer.thickness, 0.0001, 1),
    };
};

/**
 * Validates load inputs, including forces (N), moments (M), stress inputs, strain inputs, and environmental factors.
 * Clamps each input to a standard physical scale.
 *
 * @param loads - The raw loads object.
 * @returns A validated loads object.
 */
export const validateLoads = (loads: any) => {
    return {
        Nx: validateNumber(loads.Nx, 0, -1e12, 1e12),
        Ny: validateNumber(loads.Ny, 0, -1e12, 1e12),
        Nxy: validateNumber(loads.Nxy, 0, -1e12, 1e12),
        Mx: validateNumber(loads.Mx, 0, -1e9, 1e9),
        My: validateNumber(loads.My, 0, -1e9, 1e9),
        Mxy: validateNumber(loads.Mxy, 0, -1e9, 1e9),
        sigX: validateNumber(loads.sigX, 0, -1e15, 1e15),
        sigY: validateNumber(loads.sigY, 0, -1e15, 1e15),
        tauXY: validateNumber(loads.tauXY, 0, -1e15, 1e15),
        epsX: validateNumber(loads.epsX, 0, -10, 10),
        epsY: validateNumber(loads.epsY, 0, -10, 10),
        gammaXY: validateNumber(loads.gammaXY, 0, -10, 10),
        dT: validateNumber(loads.dT, 0, -10000, 10000),
        dC: validateNumber(loads.dC, 0, -1000, 1000),
    };
};

/**
 * Validates plate geometric dimensions, ensuring length and width are positive.
 *
 * @param dimensions - The raw dimensions object.
 * @returns A validated dimensions object.
 */
export const validateDimensions = (dimensions: any) => {
    return {
        length: validatePositiveNumber(dimensions.length, 0.001, 10000),
        width: validatePositiveNumber(dimensions.width, 0.001, 10000),
        wantsChanges: dimensions.wantsChanges || false,
    };
};