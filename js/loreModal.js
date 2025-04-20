window.LoreSelector = {
  selected: null,
  onConfirm: null,

  open: function () {
    const modal = document.getElementById("lore-modal");
    const grid = document.getElementById("lore-selection-grid");
    const confirmBtn = document.getElementById("lore-confirm");

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    this.selected = null;
    grid.innerHTML = "";

    const grouped = {};

    Lores.availableLores.forEach((lore) => {
      if (lore.parent) return; // skip child for now
      grouped[lore.id] = { parent: lore, children: Lores.getChildLores(lore.id) };
    });

    Object.values(grouped).forEach(group => {
      const parent = group.parent;
      const parentCard = this._createCard(parent, true);
      grid.appendChild(parentCard);

      group.children.forEach(child => {
        const childCard = this._createCard(child, false, true);
        grid.appendChild(childCard);
      });
    });

    confirmBtn.disabled = true;
    confirmBtn.onclick = () => {
      if (!this.selected) return;
      localStorage.setItem("racialLores", JSON.stringify([this.selected]));
      if (typeof this.onConfirm === "function") this.onConfirm(this.selected);
      modal.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);
    };

    document.getElementById("lore-cancel").onclick = () => {
      if (!confirm("Cancel character creation?")) return;
      ConfirmationModal.cancelModal("lore-modal", true);
    };
  },

  _createCard: function (lore) {
    const card = document.createElement("div");
    card.className = "lore-card";
  
    const isParent = lore.isParent === true;
    const isChild = !!lore.parent;
  
    if (isChild) card.classList.add("child-lore");
    if (isParent) card.classList.add("non-selectable");
  
    card.innerHTML = `
      <div class="lore-header">
        <span class="info-wrapper left-hint">
          <span class="info-icon">i</span>
          <span class="lore-tooltip">${lore.description}</span>
        </span>
        <span class="lore-name">${lore.name}</span>
      </div>
    `;
  
    card.dataset.id = lore.id;
  
    if (!isParent) {
      card.onclick = () => {
        document.querySelectorAll(".lore-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selected = lore.id;
        document.getElementById("lore-confirm").disabled = false;
      };
    }
  
    return card;
  }
};
