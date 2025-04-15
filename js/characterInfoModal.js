window.CharacterInfoModal = {
  open: function () {
    const modal = document.getElementById("name-modal");
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);
  },

  onConfirm: null,

  confirm: function () {
    const name = document.getElementById("character-name").value.trim();
    const description = document.getElementById("character-description").value.trim();

    if (!name) {
      alert("Please enter a character name.");
      return;
    }

    localStorage.setItem("characterName", name);
    localStorage.setItem("characterDescription", description);

    const modal = document.getElementById("name-modal");
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 300);

    if (typeof this.onConfirm === "function") this.onConfirm({ name, description });
  }
};

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("confirm-name").onclick = () => CharacterInfoModal.confirm();
});

document.getElementById("character-info-cancel").onclick = () => {
  if (!confirm("Cancel character creation?")) return;
  ConfirmationModal.cancelModal("name-modal", true);
};

