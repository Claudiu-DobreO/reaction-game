import { createReactionScene } from "./scene.js";

const reactionZoneElement = document.getElementById("reaction-zone");
const resetButtonElement = document.getElementById("reset-button");
const statusMessageElement = document.getElementById("status-message");
const reactionValueElement = document.getElementById("reaction-value");
const bestValueElement = document.getElementById("best-value");
const lastValueElement = document.getElementById("last-value");
const attemptCountElement = document.getElementById("attempt-count");
const falseStartCountElement = document.getElementById("false-start-count");
const sceneRootElement = document.getElementById("scene-root");

const reactionScene = createReactionScene(sceneRootElement);

const appState = {
  phase: "idle",
  signalTimeoutId: null,
  signalStartTime: null,
  attempts: [],
  falseStarts: 0,
};

function getRandomDelayMilliseconds() {
  const minimumDelayMilliseconds = 2000;
  const maximumDelayMilliseconds = 5000;

  return Math.floor(
    minimumDelayMilliseconds +
      Math.random() * (maximumDelayMilliseconds - minimumDelayMilliseconds)
  );
}

function formatReactionTime(milliseconds) {
  return `${Math.round(milliseconds)} ms`;
}

function clearPendingSignalTimeout() {
  if (appState.signalTimeoutId !== null) {
    window.clearTimeout(appState.signalTimeoutId);
    appState.signalTimeoutId = null;
  }
}

function updateStats() {
  const lastAttemptMilliseconds = appState.attempts.at(-1) ?? null;
  const bestAttemptMilliseconds =
    appState.attempts.length > 0 ? Math.min(...appState.attempts) : null;

  lastValueElement.textContent =
    lastAttemptMilliseconds !== null
      ? formatReactionTime(lastAttemptMilliseconds)
      : "-- ms";

  bestValueElement.textContent =
    bestAttemptMilliseconds !== null
      ? formatReactionTime(bestAttemptMilliseconds)
      : "-- ms";

  attemptCountElement.textContent = String(appState.attempts.length);
  falseStartCountElement.textContent = String(appState.falseStarts);
}

function updateReactionZoneStateClass(phase) {
  reactionZoneElement.classList.remove(
    "is-idle",
    "is-waiting",
    "is-ready",
    "is-result",
    "is-false-start"
  );

  if (phase === "idle") {
    reactionZoneElement.classList.add("is-idle");
  }

  if (phase === "waiting") {
    reactionZoneElement.classList.add("is-waiting");
  }

  if (phase === "ready") {
    reactionZoneElement.classList.add("is-ready");
  }

  if (phase === "result") {
    reactionZoneElement.classList.add("is-result");
  }

  if (phase === "false-start") {
    reactionZoneElement.classList.add("is-false-start");
  }
}

function updateStatusMessageStyle(phase) {
  statusMessageElement.classList.remove(
    "status-idle",
    "status-waiting",
    "status-ready",
    "status-result",
    "status-false-start"
  );

  if (phase === "idle") {
    statusMessageElement.classList.add("status-idle");
  }

  if (phase === "waiting") {
    statusMessageElement.classList.add("status-waiting");
  }

  if (phase === "ready") {
    statusMessageElement.classList.add("status-ready");
  }

  if (phase === "result") {
    statusMessageElement.classList.add("status-result");
  }

  if (phase === "false-start") {
    statusMessageElement.classList.add("status-false-start");
  }
}

function setPhase(nextPhase) {
  appState.phase = nextPhase;
  updateReactionZoneStateClass(nextPhase);
  updateStatusMessageStyle(nextPhase);
  reactionScene.setState(nextPhase);
}

function renderIdleState() {
  setPhase("idle");
  statusMessageElement.textContent =
    "Click anywhere in the panel to start. Wait for green, then click again as fast as you can.";
  reactionValueElement.textContent = "-- ms";
}

function renderWaitingState() {
  setPhase("waiting");
  statusMessageElement.textContent =
    "Wait for green. Clicking early counts as a false start.";
  reactionValueElement.textContent = "-- ms";
}

function renderReadyState() {
  setPhase("ready");
  statusMessageElement.textContent = "Click now.";
  reactionValueElement.textContent = "GO";
  appState.signalStartTime = performance.now();
}

function renderResultState(reactionTimeMilliseconds) {
  setPhase("result");
  statusMessageElement.textContent =
    "Measured successfully. Click the panel to start again.";
  reactionValueElement.textContent = formatReactionTime(reactionTimeMilliseconds);
}

function renderFalseStartState() {
  setPhase("false-start");
  statusMessageElement.textContent =
    "Too soon. Click the panel to try again.";
  reactionValueElement.textContent = "Too Soon";
}

function beginTest() {
  clearPendingSignalTimeout();
  appState.signalStartTime = null;

  renderWaitingState();

  const signalDelayMilliseconds = getRandomDelayMilliseconds();

  appState.signalTimeoutId = window.setTimeout(() => {
    appState.signalTimeoutId = null;
    renderReadyState();
  }, signalDelayMilliseconds);
}

function handleSuccessfulReaction() {
  if (appState.signalStartTime === null) {
    return;
  }

  const reactionTimeMilliseconds =
    performance.now() - appState.signalStartTime;

  appState.attempts.push(reactionTimeMilliseconds);
  appState.signalStartTime = null;

  updateStats();
  renderResultState(reactionTimeMilliseconds);
}

function handleFalseStart() {
  clearPendingSignalTimeout();
  appState.signalStartTime = null;
  appState.falseStarts += 1;

  updateStats();
  renderFalseStartState();
}

function handleReactionZoneActivation() {
  if (appState.phase === "idle") {
    beginTest();
    return;
  }

  if (appState.phase === "waiting") {
    handleFalseStart();
    return;
  }

  if (appState.phase === "ready") {
    handleSuccessfulReaction();
    return;
  }

  if (appState.phase === "result" || appState.phase === "false-start") {
    beginTest();
  }
}

function resetSession() {
  clearPendingSignalTimeout();

  appState.phase = "idle";
  appState.signalStartTime = null;
  appState.attempts = [];
  appState.falseStarts = 0;

  updateStats();
  renderIdleState();
}

function handleReactionZoneKeydown(event) {
  const isActivationKey =
    event.code === "Space" || event.code === "Enter";

  if (!isActivationKey) {
    return;
  }

  event.preventDefault();
  handleReactionZoneActivation();
}

resetButtonElement.addEventListener("click", (event) => {
  event.stopPropagation();
  resetSession();
});

reactionZoneElement.addEventListener("click", handleReactionZoneActivation);
reactionZoneElement.addEventListener("keydown", handleReactionZoneKeydown);

updateStats();
renderIdleState();

window.addEventListener("beforeunload", () => {
  clearPendingSignalTimeout();
  reactionScene.destroy();
});