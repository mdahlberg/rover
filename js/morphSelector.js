window.MorphSelector = {
  selected: new Set(),
  onConfirm: null,

  open: function () {
    const modal = document.getElementById("morph-modal");
    const grid = document.getElementById("morph-trait-grid");
    const countDisplay = document.getElementById("morph-selected-count");
    const confirmBtn = document.getElementById("morph-confirm");

    // Reset selections and UI
    this.selected.clear();
    grid.innerHTML = "";

    Object.entries(MorphAbilities).forEach(([id, trait]) => {
      const card = document.createElement("div");
      card.className = "trait-card";
      card.title = trait.description;
      card.innerHTML = `
        <div class="trait-header">
          <strong>${trait.name}</strong>
        </div>
        <div class="trait-meta">
          <span class="trait-cost">Cost: ${trait.cost} BP</span>
          <span class="trait-uses">Max Uses: ${trait.maxPurchases}</span>
        </div>
      `;
      card.dataset.id = id;

      card.onclick = () => {
        if (card.classList.contains("selected")) {
          card.classList.remove("selected");
          this.selected.delete(id);
        } else if (this.selected.size < 2) {
          card.classList.add("selected");
          this.selected.add(id);
        }

        countDisplay.textContent = this.selected.size;
        confirmBtn.disabled = this.selected.size !== 2;

        // Visually disable unselected cards if maxed
        document.querySelectorAll(".trait-card").forEach(c => {
          if (!c.classList.contains("selected")) {
            c.classList.toggle("disabled", this.selected.size >= 2);
          }
        });
      };

      grid.appendChild(card);
    });

    // Show modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm: function () {
    const modal = document.getElementById("morph-modal");

    // TODO update to MAX
    if (this.selected.size !== 2) {
      alert("Please select exactly two traits.");
      return;
    }

    window.MorphLocks = new Set();

    this.selected.forEach(id => {
      const abilityId = `morph_${id}`;
      const trait = MorphAbilities[id];

      window.MorphLocks.add(abilityId);

      Abilities.availableAbilities[abilityId] = {
        ...trait,
        isMorph: true,
        weaponProperties: [],
      };

      Abilities.purchaseAbility(abilityId, 0); // free
    });

    localStorage.setItem(Constants.MORPH_TRAITS, JSON.stringify([...this.selected]));

    // Hide modal
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    // Notify continuation
    if (typeof this.onConfirm === "function") this.onConfirm([...this.selected]);
  }
};

// Confirm & cancel wiring (do this once on load)
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("morph-confirm").onclick = () => MorphSelector.confirm();

  document.getElementById("morph-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("morph-modal", true); // Or just hide it if preferred
  };
});
