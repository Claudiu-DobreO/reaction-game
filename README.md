# ⚡ Reaction Timer (Three.js)

A modern, high-performance **reaction timer web app** built with **HTML, CSS, JavaScript, and Three.js**.

Designed as a **portfolio project** to demonstrate:

- clean architecture
- real-time interaction handling
- UX clarity
- high-precision timing
- polished UI + 3D integration

---

## 🚀 Live Experience

> Open `index.html` locally in your browser

No build tools. No dependencies. Just run.

---

## 🎯 Features

### Core Functionality
- ⏱️ High-precision reaction timing using `performance.now()`
- 🎲 Fair randomized delay (2–5 seconds)
- 🚫 False start detection
- 🔁 Instant replay loop (click or spacebar)
- 🎯 Reaction rating system:
  - Top Performer
  - Above Average
  - Average
  - Below Average

### UX Design
- 🧠 **Instant clarity** (learn in seconds)
- 🎨 Strong **visual state transitions**
- ⚡ Immediate feedback loop
- 🧩 Minimal, distraction-free interface
- 🎮 Click **anywhere** or press **Space** to interact

### 3D Experience (Three.js)
- 🌐 Real-time animated scene
- 💡 Dynamic lighting tied to state
- 🔴🔵🟢 Color-driven feedback system
- ✨ Subtle motion + pulse effects
- ⚙️ Fully synchronized with app state

### Stats Tracking
- 📉 Best reaction time
- 📌 Last attempt
- 🔢 Total attempts
- ⚠️ False starts
- 🏷️ Last rating

---

## 🧠 Engineering Highlights

### State Machine

The app uses a deterministic state model:

```text
idle → waiting → ready → result
                 ↘ false-start
```

This ensures:

- predictable behavior
- clean transitions
- easy extensibility

### Timing Accuracy

```js
const reactionTime = performance.now() - startTime;
```

- avoids `Date.now()` inaccuracies
- ensures **sub-millisecond precision**
- critical for reaction-based UX

### Event System

Supports:

- mouse interaction
- keyboard interaction (Space / Enter)
- global input handling without conflicts

### Architecture

```text
reaction-game/
│
├── index.html     # structure + layout
├── styles.css     # UI system + design tokens
├── script.js      # app logic + state management
├── scene.js       # Three.js scene + rendering
└── favicon.svg
```

Separation of concerns:

| File | Responsibility |
|-----|------|
| `script.js` | game logic + state |
| `scene.js` | 3D rendering + animation |
| `styles.css` | design system |
| `index.html` | layout + semantics |

---

## 🎨 Design System

### Color Palette

| Role | Color |
|-----|------|
| Background | `#0F172A` |
| Surface | `#1E293B` |
| Waiting | `#EF4444` |
| Ready | `#22C55E` |
| Result | `#3B82F6` |

### Typography

- **Inter** → UI + readability
- **JetBrains Mono** → numeric precision display

---

## 🧪 UX Principles Applied

- **Clarity over complexity**
- **Immediate feedback loops**
- **Low cognitive load**
- **High contrast stimulus**
- **Trust in system fairness**

---

## ⚙️ How It Works

1. User starts test (click or space)
2. System waits random delay
3. Visual signal turns **green**
4. User reacts
5. Reaction time is measured
6. Rating + stats updated
7. Immediate replay available

---

## 🧩 Key Implementation Details

### False Start Detection

```js
if (phase === "waiting") {
  handleFalseStart();
}
```

### Random Delay

```text
2000ms → 5000ms
```

Prevents:

- anticipation
- rhythm exploitation

### Scene Synchronization

```js
reactionScene.setState(phase);
```

3D visuals stay fully aligned with:

- UI state
- timing system
- user interaction

---

## 📈 Future Improvements

- 📊 Reaction time history chart
- 🧠 Adaptive difficulty (dynamic delays)
- 🔊 Audio stimulus mode
- 🌍 Online leaderboard
- 📱 Mobile haptics feedback
- 🎯 Reaction distribution analysis

---

## 🧠 Why This Project Matters

This project demonstrates:

- real-time interaction systems
- state-driven UI architecture
- performance-aware coding
- UX-first thinking
- clean separation of concerns
- modern visual design with Three.js

---

## 📌 Summary

A **simple concept executed deeply**:

> Not just a game — a **precision interaction system** with strong engineering and UX signals.

---

## 🧑‍💻 Author

Built as a **portfolio project focused on clean engineering and user experience**.
