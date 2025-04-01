
// main.js - Initializes Layers and UI on Page Load
console.log("main.js loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded. Waiting for planner to load...");

  // Delay initialization until the planner is visible
  const plannerContainer = document.getElementById("planner-container");

  if (plannerContainer && !plannerContainer.classList.contains("hidden")) {
    console.log("Planner is already visible. Initializing...");
    UI.refreshAll();
  } else {
    console.log("Planner is not visible yet. Waiting for confirmation...");
    document.getElementById("start-btn").addEventListener("click", function () {
      console.log("Race confirmed! Initializing planner now...");
      UI.refreshAll();
    });
  }
});

/**
 * Handles leveling up to create a new layer.
 */
function levelUp() {
  console.log("Leveling up...");
  Layers.resetLayer(); // Lock in the previous layer and start a new one.
  UI.refreshAll();
  alert("Level Up! New Layer Started.");
}
