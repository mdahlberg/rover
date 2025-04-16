window.ProficiencySelector = {
  selected: null,

  open() {
    const modal = document.getElementById("proficiency-modal");
    const grid = document.getElementById("proficiency-list");
    const confirm = document.getElementById("proficiency-confirm");

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    this.selected = null;
    grid.innerHTML = "";

    Object.entries(Proficiencies.availableProficiencies).forEach(([id, prof]) => {
      const owned = Proficiencies.isPurchased(id);
      const card = document.createElement("div");
      card.className = "trait-card" + (owned ? " disabled" : "");
      card.innerHTML = `<strong>${prof.name}</strong>`;
      card.title = prof.description;
      card.dataset.id = id;

      card.onclick = () => {
        if (owned) return;

        // Deselect others
        document.querySelectorAll(".trait-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selected = id;
        confirm.disabled = false;
      };

      grid.appendChild(card);
    });

    // Cancel
    document.getElementById("proficiency-cancel").onclick = () => {
      if (!confirm("Cancel character creation?")) return;
      ConfirmationModal.cancelModal("proficiency-modal", true);
    };

    // Confirm
    confirm.onclick = () => {
      if (!this.selected) return;
      window.SelectedProficiency = this.selected;
      Proficiencies.purchaseProficiency(this.selected, 0); // free

      // Apply Profiency as 'Racial'
      // Load existing racial proficiencies (if any)
      const stored = JSON.parse(localStorage.getItem("racialProficiencies") || "[]");
      // Add the new one if not already present
      if (!stored.includes(this.selected)) {
        stored.push(this.selected);
        localStorage.setItem("racialProficiencies", JSON.stringify(stored));
      }

      // Doesn't exist yet and will get overwritten later
      // window.RacialLocks.proficiencies.add(this.selected);

      modal.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);
      // Maybe call next step or show planner
      confirmRace();
    };
  }
};
