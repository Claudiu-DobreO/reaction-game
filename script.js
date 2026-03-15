import { createReactionScene } from "./scene.js";

const reactionZoneElement = document.getElementById("reaction-zone");
const startButtonElement = document.getElementById("start-button");
const resetButtonElement = document.getElementById("reset-button");
const statusMessageElement = document.getElementById("status-message");
const statusPanelElement = document.getElementById("status-panel");
const reactionValueElement = document.getElementById("reaction-value");
const reactionHintElement = document.getElementById("reaction-hint");
const bestValueElement = document.getElementById("best-value");
const lastValueElement = document.getElementById("last-value");
const attemptCountElement = document.getElementById("attempt-count");
const falseStartCountElement = document.getElementById("false-start-count");
const sceneRootElement = document.getElementById("scene-root");

const appScene = createReactionScene(sceneRootElement);

const appState = {
  phase: "idle",
  timeoutId: null,
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

function clearPendingSignalTimeout() {
  if (appState.timeoutId !== null) {
    window.clearTimeout(appState.timeoutId);
    appState.timeoutId = null;
  }
}

function formatReactionTime(milliseconds) {
  return `${Math.round(milliseconds)} ms`;
}

function updateStats() {
  const lastAttempt = appState.attempts.at(-1) ?? null;
  const bestAttempt =
    appState.attempts.length > 0
      ? Math.min(...appState.attempts)
      : null;

  lastValueElement.textContent = lastAttempt
    ? formatReactionTime(lastAttempt)
    : "-- ms";

  bestValueElement.textContent = bestAttempt
    ? formatReactionTime(bestAttempt)
    : "-- ms";

  attemptCountElement.textContent = String(appState.attempts.length);
  falseStartCountElement.textContent = String(appState.falseStarts);
}

function updateReactionZoneStateClass(phase) {
  reactionZoneElement.classList.remove(
    "is-waiting",
    "is-ready",
    "is-result"
  );

  if (phase === "waiting") {
    reactionZoneElement.classList.add("is-waiting");
  }

  if (phase === "ready") {
    reactionZoneElement.classList.add("is-ready");
  }

  if (phase === "result" || phase === "false-start") {
    reactionZoneElement.classList.add("is-result");
  }
}

function updateStatusStyle(phase) {
  statusMessageElement.classList.remove(
    "status-waiting",
    "status-ready",
    "status-result",
    "status-false-start"
  );

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
  updateStatusStyle(nextPhase);
  appScene.setState(nextPhase);
}

function renderIdleState() {
  setPhase("idle");
  statusMessageElement.textContent =
    "Press start, wait for green, then click anywhere in the test area.";
  reactionValueElement.textContent = "-- ms";
  reactionHintElement.textContent = "Click “Start Test” to begin";
  startButtonElement.textContent = "Start Test";
}

function renderWaitingState() {
  setPhase("waiting");
  statusMessageElement.textContent =
    "Wait for the green signal. Clicking early counts as a false start.";
  reactionValueElement.textContent = "-- ms";
  reactionHintElement.textContent = "Wait for green";
  startButtonElement.textContent = "Running...";
}

function renderReadyState() {
  setPhase("ready");
  statusMessageElement.textContent =
    "Click now.";
  reactionHintElement.textContent = "Click anywhere now";
  reactionValueElement.textContent = "GO";
  appState.signalStartTime = performance.now();
}

function renderResultState(reactionTimeMilliseconds) {
  setPhase("result");
  statusMessageElement.textContent =
    "Measured successfully. Start again for another attempt.";
  reactionValueElement.textContent = formatReactionTime(reactionTimeMilliseconds);
  reactionHintElement.textContent = "Press start to test again";
  startButtonElement.textContent = "Start Again";
}

function renderFalseStartState() {
  setPhase("false-start");
  statusMessageElement.textContent =
    "False start. You clicked before the signal appeared.";
  reactionValueElement.textContent = "Too Soon";
  reactionHintElement.textContent = "Press start to retry";
  startButtonElement.textContent = "Try Again";
}

function beginTest() {
  clearPendingSignalTimeout();
  appState.signalStartTime = null;

  renderWaitingState();

  const signalDelayMilliseconds = getRandomDelayMilliseconds();

  appState.timeoutId = window.setTimeout(() => {
    appState.timeoutId = null;
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
  if (appState.phase === "waiting") {
    handleFalseStart();
    return;
  }

  if (appState.phase === "ready") {
    handleSuccessfulReaction();
  }
}

function handleStartButtonClick() {
  beginTest();
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

startButtonElement.addEventListener("click", handleStartButtonClick);
resetButtonElement.addEventListener("click", resetSession);
reactionZoneElement.addEventListener("click", handleReactionZoneActivation);
reactionZoneElement.addEventListener("keydown", handleReactionZoneKeydown);

updateStats();
renderIdleState();

window.addEventListener("beforeunload", () => {
  clearPendingSignalTimeout();
  appScene.destroy();
});