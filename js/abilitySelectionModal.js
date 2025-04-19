window.AbilitySelectModal = {
  selected: new Set(),
  onConfirm: null,
  config: {
    title: "Select Abilities",
    instructions: "Pick up to 1 ability.",
    max: 1,
    filter: () => true, // Show all by default
  },

  open: function(title, instructions, max = 1, filter = () => true) {
    const modal = document.getElementById("ability-select-modal");
    const grid = document.getElementById("ability-select-grid");
    const countDisplay = document.getElementById("ability-select-count");
    const confirm = document.getElementById("ability-select-confirm");

    // Setup config
    this.selected.clear();
    this.config = { title, instructions, max, filter };

    // Update text
    document.getElementById("ability-select-title").textContent = title;
    document.getElementById("ability-select-instructions").textContent = instructions;
    countDisplay.textContent = `0 selected`;
    confirm.disabled = true;

    // Render abilities
    grid.innerHTML = "";
    Object.entries(Abilities.availableAbilities)
      .filter(([id, ability]) => !ability.derived && filter(id, ability))
      .forEach(([id, ability]) => {
        const card = document.createElement("div");
        card.className = "trait-card";
        card.title = ability.description;
        card.dataset.id = id;

        card.innerHTML = `
          <div class="trait-header">
            <strong>${ability.name}</strong>
          </div>
          <div class="trait-meta">
            <span class="trait-cost">Cost: ${ability.cost} BP</span>
            <span class="trait-uses">Max Uses: ${ability.maxPurchases || 1}</span>
          </div>
        `;

        card.onclick = () => {
          if (card.classList.contains("selected")) {
            card.classList.remove("selected");
            this.selected.delete(id);
          } else if (this.selected.size < max) {
            card.classList.add("selected");
            this.selected.add(id);
          }

          countDisplay.textContent = `${this.selected.size} selected`;
          confirm.disabled = this.selected.size !== max;

          // Optional: disable unselected when max reached
          document.querySelectorAll("#ability-select-grid .trait-card").forEach(c => {
            if (!c.classList.contains("selected")) {
              c.classList.toggle("disabled", this.selected.size >= max);
            }
          });
        };

        grid.appendChild(card);
      });

    // Wire cancel/confirm buttons
    document.getElementById("ability-select-cancel").onclick = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);
    };

    // Show modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm: function () {
    const modal = document.getElementById("ability-select-modal");

    // TODO update to MAX
    if (this.selected.size !== 1) {
      alert("Please select exactly one ability for your discount.");
      return;
    }

    const selectedId = [...this.selected][0];

    // Store the discount (1 use at 50% cost)
    const discounts = [{ name: selectedId, uses: 1, factor: 0.5 }];
    localStorage.setItem(Constants.RACIAL_DISCOUNTS, JSON.stringify({ abilities: discounts }));

    // Hide the modal
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    // Notify continuation
    if (typeof this.onConfirm === "function") this.onConfirm(selectedId);
  }
};

// Confirm & cancel wiring (do this once on load)
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ability-select-confirm").onclick = () => AbilitySelectModal.confirm();

  document.getElementById("ability-select-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("ability-select-modal", true); // Or just hide it if preferred
  };
});
