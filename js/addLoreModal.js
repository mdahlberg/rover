// js/addLoreModal.js
window.AddLoreModal = {
  init() {
    // Cache DOM nodes
    this.btnOpen   = document.getElementById("add-lore-btn");
    this.modal     = document.getElementById("add-lore-modal");
    this.inputName = document.getElementById("new-lore-name");
    this.selParent = document.getElementById("new-lore-parent");
    this.inputDesc = document.getElementById("new-lore-desc");
    this.errName   = document.getElementById("name-error");
    this.errDesc   = document.getElementById("desc-error");
    this.btnCancel = document.getElementById("add-lore-cancel");
    this.btnConfirm= document.getElementById("add-lore-confirm");

    // Wire open
    this.btnOpen.addEventListener("click", () => this.open());

    // Wire cancel
    this.btnCancel.addEventListener("click", () => this.close());

    // Validation on input changes
    [this.inputName, this.inputDesc].forEach(el =>
      el.addEventListener("input", () => this.validate())
    );

    // Confirm handler
    this.btnConfirm.addEventListener("click", () => this.confirm());
  },

  open() {
    // Reset form
    this.inputName.value = "";
    this.inputDesc.value = "";
    this.selParent.value = "general";
    this.errName.style.display = "none";
    this.errDesc.style.display = "none";
    this.btnConfirm.disabled = true;

    // Show
    this.modal.classList.remove("hidden");
    setTimeout(() => this.modal.classList.add("show"), 10);
  },

  close() {
    this.modal.classList.remove("show");
    setTimeout(() => this.modal.classList.add("hidden"), 300);
  },

  validate() {
    const name = this.inputName.value.trim();
    const desc = this.inputDesc.value.trim();
    let valid = true;

    // Name non-empty, <=25, unique
    if (!name || name.length > 25 ||
        Lores.availableLores.some(l => l.id === this.slug(name))
    ) {
      this.errName.style.display = "";
      valid = false;
    } else {
      this.errName.style.display = "none";
    }

    // Desc non-empty, <=300
    if (!desc || desc.length > 300) {
      this.errDesc.style.display = "";
      valid = false;
    } else {
      this.errDesc.style.display = "none";
    }

    this.btnConfirm.disabled = !valid;
  },

  slug(str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  },

  confirm() {
    const name     = this.inputName.value.trim();
    const desc     = this.inputDesc.value.trim();
    const parent   = this.selParent.value;
    const id       = this.slug(name);

    // Inject into Lores.availableLores
    Lores.availableLores.push({
      id,
      name,
      description: desc,
      parent,
      isParent: false,
      isCustom: true,
    });

    // Refresh UI
    UI.updateLoreUI();

    // Close modal
    this.close();
  }
};

// Initialize on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  AddLoreModal.init();
});
