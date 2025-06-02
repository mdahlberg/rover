window.ProficiencySelector = {
  selected: null,
  onConfirm: null,

  open() {
    const modal = document.getElementById("proficiency-modal");
    const grid = document.getElementById("proficiency-list");
    const confirmBtn = document.getElementById("proficiency-confirm");

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    this.selected = null;
    grid.innerHTML = "";

    Object.entries(Proficiencies.availableProficiencies).forEach(([id, prof]) => {
      // ❌ Skip default proficiency everyone gets
      if (id === "small_weapons") return;

      const owned = Proficiencies.isPurchased(id);
      const card = document.createElement("div");
      card.className = "trait-card" + (owned ? " disabled" : "");
      card.dataset.id = id;
      
      const wrapper = document.createElement("div");
      wrapper.className = "lore-header"; // reuse shared header style
      
      const name = document.createElement("div");
      name.className = "lore-name";
      name.innerText = prof.name;
      
      const infoWrapper = document.createElement("div");
      infoWrapper.className = "info-wrapper left-hint";
      infoWrapper.innerHTML = `
        <span class="info-icon">i</span>
        <div class="lore-tooltip">${prof.description}</div>
      `;
      
      wrapper.appendChild(name);
      wrapper.appendChild(infoWrapper);
      card.appendChild(wrapper);
      
      card.onclick = () => {
        if (owned) return;
        document.querySelectorAll(".trait-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selected = id;
        confirmBtn.disabled = false;
      };

      grid.appendChild(card);
    });

    // Cancel
    document.getElementById("proficiency-cancel").onclick = () => {
      if (!confirm("Cancel character creation?")) return;
      ConfirmationModal.cancelModal("proficiency-modal", true);
    };

    // Confirm
    confirmBtn.onclick = () => {
      if (!this.selected) return;
      window.SelectedProficiency = this.selected;
      Proficiencies.purchaseProficiency(this.selected, 0); // free

      // Apply Profiency as 'Racial'
      // Load existing racial proficiencies (if any)
      const stored = JSON.parse(sessionStorage.getItem(Constants.RACIAL_PROFS) || "[]");
      // Add the new one if not already present
      if (!stored.includes(this.selected)) {
        stored.push(this.selected);
        sessionStorage.setItem(Constants.RACIAL_PROFS, JSON.stringify(stored));
      }

      // Doesn't exist yet and will get overwritten later
      // window.RacialLocks.proficiencies.add(this.selected);

      modal.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);

      if (typeof this.onConfirm === "function") {
        this.onConfirm(this.selected);
      }
    };
  }
};
