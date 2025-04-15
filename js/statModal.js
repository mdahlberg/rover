// === statModal.js ===

window.StatSelector = {
  selected: null,
  onConfirm: null, // callback

  open: function (options = { stats: ["body", "mind", "spirit"], title: "Choose a Stat Bonus" }) {
    const modal = document.getElementById("stat-selection-modal");
    const list = document.getElementById("stat-selection-list");
    const confirm = document.getElementById("confirm-stat-selection");

    // Reset
    this.selected = null;
    list.innerHTML = "";
    confirm.disabled = true;

    // Title
    document.getElementById("stat-selection-title").textContent = options.title;

    options.stats.forEach(stat => {
      const button = document.createElement("button");
      button.className = "stat-choice-button";
      button.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
      button.onclick = () => {
        this.selected = stat;
        document.querySelectorAll(".stat-choice-button").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
        confirm.disabled = false;
      };
      list.appendChild(button);
    });

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirmSelection: function () {
    if (!this.selected) return;

    // Apply the stat to racial starting stats
    Stats.startingStats[this.selected] = (Stats.startingStats[this.selected] || 0) + 1;

    // Lock it in
    localStorage.setItem("racialStatChoice", this.selected);
    window.RacialLocks = window.RacialLocks || {};
    window.RacialLocks.stats = new Set([this.selected]);

    // Hide modal
    const modal = document.getElementById("stat-selection-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    if (typeof this.onConfirm === "function") this.onConfirm(this.selected);
  },
};

// Hook up confirm button
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("confirm-stat-selection").onclick = () => StatSelector.confirmSelection();
  document.getElementById("stat-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("stat-selection-modal", true);
  };
});

