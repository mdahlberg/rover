window.StatSelector = {
  selectedStats: {
    body: 0,
    mind: 0,
    spirit: 0,
  },
  maxPoints: 1,
  onConfirm: null,

  open(numPoints = 1) {
    this.maxPoints = numPoints;
    this.selectedStats = { body: 0, mind: 0, spirit: 0 };

    const modal = document.getElementById("stat-modal");
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    this.updateUI();

    // Plus buttons
    document.querySelectorAll(".stat-plus").forEach(btn => {
      btn.onclick = () => {
        const stat = btn.dataset.stat;
        if (this.getTotalSelected() < this.maxPoints) {
          this.selectedStats[stat]++;
          this.updateUI();
        }
      };
    });

    // Minus buttons
    document.querySelectorAll(".stat-minus").forEach(btn => {
      btn.onclick = () => {
        const stat = btn.dataset.stat;
        if (this.selectedStats[stat] > 0) {
          this.selectedStats[stat]--;
          this.updateUI();
        }
      };
    });
  },

  getTotalSelected() {
    return Object.values(this.selectedStats).reduce((sum, val) => sum + val, 0);
  },

  updateUI() {
    ["body", "mind", "spirit"].forEach(stat => {
      document.getElementById(`stat-${stat}-count`).textContent = this.selectedStats[stat];
    });

    const total = this.getTotalSelected();
    document.getElementById("stat-pick-status").textContent = `${total} of ${this.maxPoints} selected`;

    document.getElementById("confirm-stat-selection").disabled = total !== this.maxPoints;
  },

  confirmSelection() {
    if (this.getTotalSelected() !== this.maxPoints) {
      alert("Please assign exactly 2 stat points.");
      return;
    }

    // Apply stats
    Object.entries(this.selectedStats).forEach(([stat, value]) => {
      Stats.startingStats[stat] = (Stats.startingStats[stat] || 0) + value;
    });

    // Close modal
    const modal = document.getElementById("stat-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    if (typeof this.onConfirm === "function") this.onConfirm({ ...this.selectedStats });
  }
};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("confirm-stat-selection").onclick = () => StatSelector.confirmSelection();

  document.getElementById("stat-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("stat-modal", true);
  };
});

