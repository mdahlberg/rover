// js/morphSelector.js
window.MorphSelector = {
  selected: new Set(),
  onConfirm: null,
  config: { max: 2, filter: () => true },

  open(title, instructions, max = 2, filter = () => true, onConfirm) {
    const modal      = document.getElementById("morph-modal");
    const grid       = document.getElementById("morph-trait-grid");
    const status     = document.getElementById("morph-selected-count");
    const maxLabel   = document.getElementById("morph-config-max");
    const confirmBtn = document.getElementById("morph-confirm");

    // Save config & reset
    this.config = { title, instructions, max, filter };
    this.onConfirm = onConfirm;
    this.selected.clear();
    status.textContent = "0";
    maxLabel.textContent = max;
    confirmBtn.disabled = true;

    // Render trait cards
    grid.innerHTML = "";
    Object.entries(MorphAbilities || {})
      .filter(([id, trait]) => filter(id, trait))
      .forEach(([id, trait]) => {
        const card = document.createElement("div");
        card.className = "trait-card with-tooltip";
        card.dataset.id = id;
        card.innerHTML = `
          <div class="trait-header">
            <div class="info-wrapper">
              <span class="info-icon">i</span>
              <div class="tooltip">${trait.description}</div>
            </div>
            <strong class="trait-name">${trait.name}</strong>
          </div>
          <div class="trait-meta">
            <span clas"uses-group">
              <span class="trait-cost">Cost: ${trait.cost} BP</span>
            </span>
            <span class="uses-group">
              <span class="trait-uses">Max Purchases: ${trait.maxPurchases}</span>
            </span>
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
          // update footer status
          status.textContent = this.selected.size;
          confirmBtn.disabled = this.selected.size !== max;
          // disable extras if at limit
          document.querySelectorAll("#morph-trait-grid .trait-card")
            .forEach(c => {
              if (!c.classList.contains("selected")) {
                c.classList.toggle("disabled", this.selected.size >= max);
              }
            });
        };
        grid.appendChild(card);
      });

    // show
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  confirm() {
    const { max } = this.config;
    if (this.selected.size !== max) {
      alert(`Please select exactly ${max} traits.`);
      return;
    }
  
    // 1) Persist morph choices to localStorage
    const chosen = Array.from(this.selected);
    window.MorphLocks = new Set();
    chosen.forEach(id => {
      const abilityId = `morph_${id}`;
      const trait     =  MorphAbilities[id];
  
      // Track which morphs are locked in
      window.MorphLocks.add(abilityId);
  
      // Inject into your abilities pool as “free” abilities
      Abilities.availableAbilities[abilityId] = {
        ...trait,
        isMorph: true,
        weaponProperties: []  // or trait.weaponProperties if you have them
      };
  
      // Automatically purchase them at zero cost
      Abilities.purchaseAbility(abilityId, 0);
    });
  
    // Save to localStorage so it persists across reloads
    localStorage.setItem(
      Constants.MORPH_TRAITS,
      JSON.stringify(chosen)
    );
  
    // 2) Close modal
    const modal = document.getElementById("morph-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);
  
    // 3) Fire external callback if provided
    if (typeof this.onConfirm === "function") {
      this.onConfirm(chosen);
    }
  },

};

// wire up Confirm & Cancel
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("morph-cancel")
          .onclick = () => ConfirmationModal.cancelModal("morph-modal", true);
  document.getElementById("morph-confirm")
          .onclick = () => MorphSelector.confirm();
});
