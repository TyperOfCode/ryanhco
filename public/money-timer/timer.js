// .................................................. State functions
function setDefaultState() {
  console.log("setting default state...");
  timerIsRunning = false;

  offsetMs = 0;
  startTimeMs = Date.now();

  moneyEarned = 0;
  timerSeconds = 0;

  ratePerHour = 50;
  ratePerSec = ratePerHour / 3600;
}

function saveTimerState() {
  localStorage.setItem("timerIsRunning", timerIsRunning ? 1 : 0);
  localStorage.setItem("startTimeMs", startTimeMs);
  localStorage.setItem("offsetMs", offsetMs);
  localStorage.setItem("moneyEarned", moneyEarned);
  localStorage.setItem("timerSeconds", timerSeconds);
  localStorage.setItem("ratePerHour", ratePerHour);
}

function loadTimerState() {
  console.log("loading timer state...");

  timerIsRunning = parseInt(localStorage.getItem("timerIsRunning"));

  startTimeMs = parseInt(localStorage.getItem("startTimeMs"));
  offsetMs = parseInt(localStorage.getItem("offsetMs"));

  moneyEarned = parseFloat(localStorage.getItem("moneyEarned"));
  timerSeconds = parseInt(localStorage.getItem("timerSeconds"));

  ratePerHour = parseInt(localStorage.getItem("ratePerHour"));
  ratePerSec = ratePerHour / 3600;

  const values = [
    timerIsRunning,
    startTimeMs,
    offsetMs,
    moneyEarned,
    timerSeconds,
    ratePerHour,
    ratePerSec,
  ];

  if (values.some((e) => Number.isNaN(e))) {
    setDefaultState();
  }

  updatePage();
}

function resetStorage() {
  setDefaultState();
  localStorage.clear();
}

// .................................................. Timer functions
function toggleTimer() {
  if (!timerIsRunning) {
    startTimer();
    updatePage();
    return;
  }

  pauseTimer();
  updatePage();
}

function startTimer() {
  console.log("Timer Started");

  if (timerIsRunning) return;

  startTimeMs = Date.now();
  timerIsRunning = true;

  saveTimerState();
}

function pauseTimer() {
  console.log("Timer Paused");

  if (!timerIsRunning) return;

  timerIsRunning = false;
  offsetMs += getElapsed();

  saveTimerState();
}

function resetTimer() {
  console.log("Timer Reset");

  timerIsRunning = false;

  timerSeconds = 0;
  moneyEarned = 0;
  offsetMs = 0;

  updatePage();
  saveTimerState();
}

function startTimerLoop() {
  setTimeout(() => {
    try {
      if (timerIsRunning) {
        const timeDelta = getElapsed();

        timerSeconds = Math.floor((timeDelta + offsetMs) / 1000);
        moneyEarned = ratePerSec * timerSeconds;

        updatePage();
      }

      startTimerLoop();
    } catch (e) {
      console.log("ERROR: " + e);
    }
  }, 200);
}

function getElapsed() {
  return Date.now() - startTimeMs;
}

// .................................................. Page functions
function updatePage() {
  updateSettings();

  updateToggleButtonText();
  updatePageMoney();

  updatePageTimer();
}

function updatePageTimer() {
  const timerTime = document.getElementById("timer-time");

  let seconds = timerSeconds;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  timerTime.innerHTML =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

function updatePageMoney() {
  const timerMoney = document.getElementById("timer-money");
  timerMoney.innerHTML = "💰 $" + moneyEarned.toFixed(2);
}

function updateToggleButtonText() {
  const timerCtrlBtn = document.getElementById("timer-control-btn");

  if (!timerIsRunning) {
    if (timerCtrlBtn.innerHTML == "Start") return;

    timerCtrlBtn.innerHTML = "Start";

    timerCtrlBtn.classList.remove("pauseBtn");
  } else {
    if (timerCtrlBtn.innerHTML == "Pause") return;

    timerCtrlBtn.innerHTML = "Pause";

    timerCtrlBtn.classList.add("pauseBtn");
  }
}

function updateSettings() {
  updateRateSlider();
}

function updateRateSlider() {
  const rateInput = document.getElementById("rate-slider");
  rateInput.value = ratePerHour;

  const rateDisplay = document.getElementById("rate-input");
  rateDisplay.value = ratePerHour;

  moneyEarned = ratePerSec * timerSeconds;
}

function main() {
  loadTimerState();
  updatePage();

  startTimerLoop();
}

window.addEventListener("load", function () {
  main();
  this.document.getElementsByTagName("html")[0].style.visibility = "visible";
});
