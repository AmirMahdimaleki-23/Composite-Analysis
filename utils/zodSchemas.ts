import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  E1: z.coerce.number().positive("E1 must be positive"),
  E2: z.coerce.number().positive("E2 must be positive"),
  nu12: z.coerce
    .number()
    .min(-1, "nu12 must be >= -1")
    .max(1, "nu12 must be <= 1"),
  G12: z.coerce.number().positive("G12 must be positive"),
  density: z.coerce.number().positive("Density must be positive").optional(),
  Xt: z.coerce.number().positive("Xt must be positive").optional(),
  Xc: z.coerce.number().positive("Xc must be positive").optional(),
  Yt: z.coerce.number().positive("Yt must be positive").optional(),
  Yc: z.coerce.number().positive("Yc must be positive").optional(),
  S: z.coerce.number().positive("S must be positive").optional(),
});

export const layerSchema = z.object({
  theta: z.coerce.number().min(-180).max(180),
  thickness: z.coerce.number().positive("Thickness must be positive"),
});

export const loadsSchema = z.object({
  Nx: z.coerce.number().min(-1e12).max(1e12),
  Ny: z.coerce.number().min(-1e12).max(1e12),
  Nxy: z.coerce.number().min(-1e12).max(1e12),
  Mx: z.coerce.number().min(-1e9).max(1e9),
  My: z.coerce.number().min(-1e9).max(1e9),
  Mxy: z.coerce.number().min(-1e9).max(1e9),
  sigX: z.coerce.number().min(-1e15).max(1e15),
  sigY: z.coerce.number().min(-1e15).max(1e15),
  tauXY: z.coerce.number().min(-1e15).max(1e15),
  epsX: z.coerce.number().min(-10).max(10),
  epsY: z.coerce.number().min(-10).max(10),
  gammaXY: z.coerce.number().min(-10).max(10),
  dT: z.coerce.number().min(-10000).max(10000),
  dC: z.coerce.number().min(-1000).max(1000),
});

export const dimensionsSchema = z.object({
  length: z.coerce.number().positive("Length must be positive"),
  width: z.coerce.number().positive("Width must be positive"),
  wantsChanges: z.boolean(),
});
