function toggleSettings() {
  const settingsModal = document.getElementById("settingsModal");

  if (settingsModal.style.visibility === "hidden") {
    settingsModal.style.visibility = "visible";
  } else {
    settingsModal.style.visibility = "hidden";
  }
}

function updateRate() {
  ratePerHour = parseFloat(document.getElementById("rate-slider").value);
  ratePerSec = ratePerHour / 3600;

  saveTimerState();
  updatePage();
}

function updateSlider() {
  console.log("Update Slider");

  const rateSlider = document.getElementById("rate-slider");
  const rateInput = document.getElementById("rate-input");

  rateSlider.value = rateInput.value;

  updateRate();
}

document.addEventListener("click", function (event) {
  const modal = document.getElementById("settingsModal");
  const settingsButton = document.getElementById("settings-button");

  if (modal.style.visibility === "visible") {
    if (
      !modal.contains(event.target) &&
      !settingsButton.contains(event.target)
    ) {
      modal.style.visibility = "hidden";
    }
  }
});
