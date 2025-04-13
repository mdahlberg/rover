window.MorphSelector = {
  selected: new Set(),

  open() {
    const modal = document.getElementById("morph-modal");
    const grid = document.getElementById("morph-trait-grid");
    const countDisplay = document.getElementById("morph-selected-count");
    const confirm = document.getElementById("morph-confirm");

    modal.classList.remove("hidden");
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

        // Update display + button state
        countDisplay.textContent = this.selected.size;
        confirm.disabled = this.selected.size !== 2;

        // Optional: disable unselected cards if already 2 chosen
        document.querySelectorAll(".trait-card").forEach(c => {
          if (!c.classList.contains("selected")) {
            c.classList.toggle("disabled", this.selected.size >= 2);
          }
        });
      };

      grid.appendChild(card);
    });

    // Cancel handler
    document.getElementById("morph-cancel").onclick = () => {
      modal.classList.add("hidden");
    };

    // Confirm handler
    confirm.onclick = () => {
      this.applySelectedTraits();
      modal.classList.add("hidden");
    };
  },

  applySelectedTraits() {
    window.MorphLocks = new Set();

    this.selected.forEach(id => {
      const abilityId = `morph_${id}`;
      const trait = MorphAbilities[id];
      window.MorphLocks.add(abilityId);

      // Inject into availableAbilities if not already there
      Abilities.availableAbilities[abilityId] = {
        ...trait,
        isMorph: true,
        weaponProperties: [],
      };

      Abilities.purchaseAbility(abilityId, 0); // Free
    });

    this.selected.forEach(id => {
      const morphId = `morph_${id}`;
    });

    confirmRace();
  }
};
