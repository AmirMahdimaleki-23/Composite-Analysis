# Classical Laminate Theory (CLT) Analysis Tool

An advanced, engineering-grade Classical Laminate Theory (CLT) simulation and assessment web application built with **React**, **TypeScript**, and **TailwindCSS**. The tool enables mechanical, aerospace, and materials engineers to design, analyze, and optimize fiber-reinforced composite laminates under complex mechanical, thermal, and hygral (moisture) loads.

## 🚀 Key Features

- **Multi-Physics CLT Analysis**: Support for mechanical stresses/strains, thermal loads ($\Delta T$), hygral moisture concentration ($\Delta C$), and combined loadings.
- **Single-Ply & Multi-Ply Stacking**: Evaluate individual plies with arbitrary fiber angles or construct multi-ply laminates (defining custom orientation angles and thicknesses for each layer).
- **ABD Stiffness Matrices**: Computes the Extensional ($A$), Coupling ($B$), and Bending ($D$) stiffness matrices.
- **Transformations**: Generates $Q$, $\bar{Q}$, $S$, and $\bar{S}$ matrices for coordinate system transformations.
- **Failure Assessment**: Evaluates ply-by-ply safety under **Maximum Stress** and **Tsai-Wu** quadratic failure criteria.
- **Geometry & Deformation**: Simulates plate length, width, and shear deformation under load, rendering the deformed shape.
- **Competitive Comparison**: Compare two materials side-by-side on metrics like safety margin (minimum failure index), mass per unit area, and extensional stiffness ($A_{11}$).
- **Automatic Report Generation**: Export a high-quality PDF engineering assessment document containing configuration, matrices, layer stresses, and failure safety indices.
- **Localization**: Full bilingual support for English (LTR) and Persian/Farsi (RTL).

---

## 📐 Mathematical Formulations

The tool uses standard formulations from composite mechanics textbooks (e.g., *Jones - Mechanics of Composite Materials*).

### 1. Ply Stiffness in Principal Coordinates ($Q$)
For an orthotropic lamina under plane stress:
$$Q_{11} = \frac{E_1}{1 - \nu_{12}\nu_{21}}, \quad Q_{12} = \frac{\nu_{12} E_2}{1 - \nu_{12}\nu_{21}}, \quad Q_{22} = \frac{E_2}{1 - \nu_{12}\nu_{21}}, \quad Q_{66} = G_{12}$$
where $\nu_{21} = \nu_{12} \frac{E_2}{E_1}$.

### 2. Transformed Stiffness Matrix ($\bar{Q}$)
Under an arbitrary fiber orientation angle $\theta$:
$$\bar{Q} = [T]^{-1} [Q] [T]^{-T}$$
where $[T]$ is the stress transformation matrix.

### 3. ABD Laminate Stiffness Matrices
Integrates ply stiffnesses across the laminate thickness $h$:
$$A_{ij} = \sum_{k=1}^N (\bar{Q}_{ij})_k (z_k - z_{k-1})$$
$$B_{ij} = \frac{1}{2} \sum_{k=1}^N (\bar{Q}_{ij})_k (z_k^2 - z_{k-1}^2)$$
$$D_{ij} = \frac{1}{3} \sum_{k=1}^N (\bar{Q}_{ij})_k (z_k^3 - z_{k-1}^3)$$

### 4. Tsai-Wu Quadratic Failure Criterion
A quadratic failure criterion representing interaction between normal and shear stresses:
$$F_1 \sigma_1 + F_2 \sigma_2 + F_{11} \sigma_1^2 + F_{22} \sigma_2^2 + F_{66} \tau_{12}^2 + 2 F_{12} \sigma_1 \sigma_2 < 1$$
where strength terms are derived from tensile, compressive, and shear limits ($X_t, X_c, Y_t, Y_c, S$).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Vite bundler)
- **State Management**: Zustand (Global store with automated sync and localStorage caching)
- **Form Handling & Validation**: React Hook Form + Zod (Robust real-time schema validation and inline error notifications)
- **Styling**: TailwindCSS (Modern, interactive theme with dark mode and RTL support)
- **Toast Notifications**: React Toastify (Informative user-friendly alert toasts for boundary violations and successes)
- **Unit Testing**: Jest + React Testing Library (Ensuring mathematical precision of equations)
- **PDF Export**: jsPDF + jspdf-autotable (Engineered template layout)

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/companalysis-classical-laminate-theory-tool.git
   cd companalysis-classical-laminate-theory-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧪 Unit Testing

To execute the mathematical test suite and Zustand store action validations, run:
```bash
npm run test
```

Tests are configured using **Jest** and **ts-jest**, covering:
- $Q$ matrix computation
- Coordinate rotation ($\bar{Q}$ matrix transformation)
- Matrix inversion and compliance checks
- Mid-plane strain / stress solver
- Max Stress & Tsai-Wu failure evaluation indices
- Zustand state transitions and validation steps

---

## 🚀 CI/CD & Deployment

A GitHub Actions workflow is included at `.github/workflows/deploy.yml` to automatically build, test, and deploy the application to **GitHub Pages** on every push to the `main` branch.

Vite base path is dynamically set in `vite.config.ts` depending on the compilation mode:
```typescript
base: mode === 'production' ? '/companalysis-classical-laminate-theory-tool/' : '/'
```
