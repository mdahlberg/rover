window.LoreSelector = {
  selected: null,
  onConfirm: null,

  open() {
    const modal = document.getElementById("lore-modal");
    const grid = document.getElementById("lore-list");
    const confirm = document.getElementById("lore-confirm");

    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    this.selected = null;
    grid.innerHTML = "";

    Lores.availableLores.forEach(lore => {
      const card = document.createElement("div");
      card.className = "trait-card";
      card.textContent = lore.name;
      card.title = lore.description;
      card.dataset.id = lore.id;

      // Prevent picking already purchased
      if (Lores.purchasedLores[lore.id]) {
        card.classList.add("disabled");
      }

      card.onclick = () => {
        if (card.classList.contains("disabled")) return;

        document.querySelectorAll("#lore-list .trait-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selected = lore.id;
        confirm.disabled = false;
      };

      grid.appendChild(card);
    });
  },

  confirm() {
    if (!this.selected) return;

    const modal = document.getElementById("lore-modal");

    // Apply selection
    Lores.purchaseLore(this.selected);

    // Lock as racial
    const stored = JSON.parse(localStorage.getItem("racialLores") || "[]");
    if (!stored.includes(this.selected)) {
      stored.push(this.selected);
      localStorage.setItem("racialLores", JSON.stringify(stored));
    }

    // Hide modal
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    // Fire callback
    if (typeof this.onConfirm === "function") this.onConfirm(this.selected);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("lore-confirm").onclick = () => LoreSelector.confirm();

  document.getElementById("lore-cancel").onclick = () => {
    if (!confirm("Cancel character creation?")) return;
    ConfirmationModal.cancelModal("lore-modal", true);
  };
});
