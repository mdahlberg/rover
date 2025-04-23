// js/statModal.js
window.StatSelector = {
  config: { max: 2 },
  counts: {},          // track how many points per stat
  onConfirm: null,

  open(max = 2, onConfirm) {
    const modal      = document.getElementById("stat-modal");
    const grid       = document.getElementById("stat-choice-buttons");
    const status     = document.getElementById("stat-pick-status");
    const confirmBtn = document.getElementById("stat-confirm");
    const maxLabel   = document.getElementById("stat-config-max");

    // initialize
    this.config.max   = max;
    this.onConfirm    = onConfirm;
    this.counts       = { body:0, mind:0, spirit:0 };
    status.textContent = `0 selected`;
    confirmBtn.disabled = true;
    maxLabel.textContent  = max;

    // build the cards
    grid.innerHTML = "";
    Object.keys(this.counts).forEach(stat => {
      const card = document.createElement("div");
      card.className = "trait-card";
      card.dataset.stat = stat;

      card.innerHTML = `
        <div class="trait-header">
          <strong class="trait-name">
            ${stat[0].toUpperCase() + stat.slice(1)}
          </strong>
        </div>
        <div class="stat-choice">
          <button class="stat-minus" data-stat="${stat}" disabled>−</button>
          <span id="count-${stat}">0</span>
          <button class="stat-plus"  data-stat="${stat}">+</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // helper to recompute UI
    const updateUI = () => {
      const total = Object.values(this.counts).reduce((a,b)=>a+b,0);
      status.textContent = `${total} selected`;
      confirmBtn.disabled = total !== this.config.max;

      // disable/enable steppers & card styles
      grid.querySelectorAll(".stat-card, .trait-card").forEach(c => {
        const s = c.dataset.stat;
        if (!s) return;
        c.classList.toggle("selected", this.counts[s] > 0);
        c.classList.toggle("disabled", total >= this.config.max && this.counts[s] === 0);
      });
      grid.querySelectorAll(".stat-plus").forEach(btn => {
        btn.disabled = total >= this.config.max;
      });
      grid.querySelectorAll(".stat-minus").forEach(btn => {
        const s = btn.dataset.stat;
        btn.disabled = this.counts[s] === 0;
      });
    };

    // wire up plus/minus
    grid.querySelectorAll(".stat-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const s = btn.dataset.stat;
        if (Object.values(this.counts).reduce((a,b)=>a+b,0) < max) {
          this.counts[s]++;
          document.getElementById(`count-${s}`).textContent = this.counts[s];
          updateUI();
        }
      });
    });
    grid.querySelectorAll(".stat-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const s = btn.dataset.stat;
        if (this.counts[s] > 0) {
          this.counts[s]--;
          document.getElementById(`count-${s}`).textContent = this.counts[s];
          updateUI();
        }
      });
    });

    // show
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm() {
    const total = Object.values(this.counts).reduce((a,b)=>a+b,0);
    if (total !== this.config.max) {
      alert(`Please assign exactly ${this.config.max} points.`);
      return;
    }

    // Apply stats
    Object.entries(this.counts).forEach(([stat, value]) => {
      Stats.startingStats[stat] = (Stats.startingStats[stat] || 0) + value;
    });

    // hide
    const modal = document.getElementById("stat-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    // callback with the counts object
    if (typeof this.onConfirm === "function") {
      this.onConfirm({ ...this.counts });
    }
  }
};

// wire buttons
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("stat-cancel")
          .onclick = () => ConfirmationModal.cancelModal("stat-modal", true);
  document.getElementById("stat-confirm")
          .onclick = () => StatSelector.confirm();
});
