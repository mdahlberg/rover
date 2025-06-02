window.AbilitySelectModal = {
  selected: new Set(),
  onConfirm: null,
  config: {
    title: "Select Abilities",
    instructions: "Pick up to 1 ability.",
    max: 1,
    filter: () => true,
  },

  open(title, instructions, max = 1, filter = () => true) {
    const modal = document.getElementById("ability-select-modal");
    const grid = document.getElementById("ability-list");
    const confirmBtn = document.getElementById("ability-select-confirm");

    // Reset config
    this.selected.clear();
    this.config = { title, instructions, max, filter };

    // Render abilities
    grid.innerHTML = "";
    Object.entries(Abilities.availableAbilities)
      .filter(([id, ability]) => !ability.derived && filter(id, ability))
      .forEach(([id, ability]) => {
        const card = document.createElement("div");
        card.className = "trait-card with-tooltip";
        card.dataset.id = id;

        card.innerHTML = `
          <div class="trait-header">
            <div class="info-wrapper">
              <span class="info-icon">i</span>
              <div class="tooltip">${ability.description}</div>
            </div>
            <strong class="trait-name">${ability.name}</strong>
          </div>
          <div class="trait-meta">
            <span class="trait-cost">
              Cost:
              <span class="original-cost">${ability.cost} BP</span>
              <span class="discounted-cost">${Math.floor(ability.cost / 2)} BP</span>
            </span>
          </div>
        `;

        card.onclick = () => {
          if (card.classList.contains("selected")) {
            card.classList.remove("selected");
            this.selected.delete(id);
          } else if (this.selected.size < max) {
            document.querySelectorAll("#ability-list .trait-card").forEach(c => {
              c.classList.remove("selected");
            });
            card.classList.add("selected");
            this.selected.clear();
            this.selected.add(id);
          }

          confirmBtn.disabled = this.selected.size !== max;

          // Disable others if max selected
          document.querySelectorAll("#ability-list .trait-card").forEach(c => {
            if (!c.classList.contains("selected")) {
              c.classList.toggle("disabled", this.selected.size >= max);
            }
          });
        };

        grid.appendChild(card);
      });

    // Show modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm() {
    const modal = document.getElementById("ability-select-modal");

    if (this.selected.size !== 1) {
      alert("Please select exactly one ability for your discount.");
      return;
    }

    const selectedId = [...this.selected][0];
    const discounts = [{ name: selectedId, uses: 1, factor: 0.5 }];
    sessionStorage.setItem(Constants.RACIAL_DISCOUNTS, JSON.stringify({ abilities: discounts }));

    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    if (typeof this.onConfirm === "function") {
      this.onConfirm(selectedId);
    }
  }
};

// Confirm & Cancel
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ability-select-confirm").onclick = () => AbilitySelectModal.confirm();

  document.getElementById("ability-select-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("ability-select-modal", true);
  };
});
