# Arthora Neo-Brutalism Design System Specification

## Visual Direction: Financial Cyber Neo-Brutalism

Arthora pairs raw Neo-Brutalist structural geometry (high-contrast black borders, hard tactile shadows, monospaced data tables) with futuristic cyber aesthetics (luminous fluid particle streams, electric gold and cyan neon accents, obsidian dark canvas).

---

## 1. Core Color Palette

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| **`neo-black`** | `#0D0E15` | Main application canvas background |
| **`neo-surface`** | `#161620` | Primary container cards, dialogs, drawers |
| **`neo-yellow`** | `#FFDE59` | Primary action buttons, investor badges, active states |
| **`neo-cyan`** | `#00F0FF` | Category leaders, positive performance, cyber accents |
| **`neo-lime`** | `#BFFF04` | CAGR gains, bullish trends, verified signals |
| **`neo-pink`** | `#FF4D6D` | Downside risk alerts, benchmark losses, critical warnings |
| **`neo-purple`** | `#8B5CF6` | AI simulations, Monte Carlo iterations, neural insights |

---

## 2. Elevation & Hard Shadow Tokens

In accordance with strict Neo-Brutalism principles, all surfaces use crisp, unblurred drop shadows:

```css
/* Hard tactile shadows */
--shadow-neo-sm: 2px 2px 0px 0px #000000;
--shadow-neo:    4px 4px 0px 0px #000000;
--shadow-neo-lg: 6px 6px 0px 0px #000000;
--shadow-neo-xl: 8px 8px 0px 0px #000000;
```

---

## 3. Typography Hierarchy

- **Headings & Display**: `Font Sans` (Extra Bold / Black 900 weight), uppercase tracking for institutional impact.
- **Financial Metrics & Numbers**: `Font Mono` (JetBrains Mono / Roboto Mono), tabular figures for precise alignment of INR currency values and percentage yields.
- **Body & Explanations**: `Inter` / `System UI` with relaxed leading for financial readability.
