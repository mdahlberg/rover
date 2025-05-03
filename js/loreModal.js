// js/loreModal.js
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

    // Build a map of parentId -> children array
    const childrenMap = {};
    Lores.availableLores.forEach(lore => {
      if (lore.parent) {
        childrenMap[lore.parent] = childrenMap[lore.parent] || [];
        childrenMap[lore.parent].push(lore);
      }
    });
    // Sort each siblings list: non-parents first, then parents, alphabetical
    Object.values(childrenMap).forEach(arr =>
      arr.sort((a, b) => {
        const pa = a.isParent ? 1 : 0;
        const pb = b.isParent ? 1 : 0;
        if (pa !== pb) return pa - pb;
        return a.name.localeCompare(b.name);
      })
    );

    // Recursive render function
    const renderNode = (lore, depth = 0) => {
      const card = this._createCard(lore, depth);
      grid.appendChild(card);
      (childrenMap[lore.id] || []).forEach(child => renderNode(child, depth + 1));
    };

    // Kick off with top-level lores (sorted alphabetically)
    Lores.availableLores
      .filter(lore => !lore.parent)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(rootLore => renderNode(rootLore, 0));

    // Disable confirm until selection
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

  _createCard: function (lore, depth) {
    const card = document.createElement("div");
    card.className = "lore-card";
    card.style.marginLeft = `${depth * 16}px`;

    const isParent = lore.isParent === true;
    if (isParent) card.classList.add("non-selectable");

    // Render header + tooltip icon
    card.innerHTML = `
      <div class="lore-header">
        <span class="info-wrapper left-hint">
          <span class="info-icon">i</span>
          <span class="lore-tooltip">${lore.description}</span>
        </span>
        <span class="lore-name">${lore.name}</span>
      </div>
    `;

    // Ensure header tooltips still respond even when non-selectable
    const infoWrapper = card.querySelector('.info-wrapper');
    if (infoWrapper) {
      infoWrapper.style.pointerEvents = 'auto';
      const tooltip = infoWrapper.querySelector('.lore-tooltip');
      if (tooltip) {
        tooltip.style.zIndex = '9999';
        tooltip.style.backgroundColor = '#2c2c2c';
      }
    }

    // If it's a leaf lore, make it selectable
    if (!isParent) {
      card.onclick = () => {
        document.querySelectorAll("#lore-selection-grid .lore-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selected = lore.id;
        document.getElementById("lore-confirm").disabled = false;
      };
    }

    return card;
  }
};

// No init needed; LoreSelector.open() invoked externally
