window.EssenceSchoolModal = {
  selectedSchool:  null,
  selectedElement: null,
  onConfirm:       null,

  /** Hide (and reset) a modal by ID **/
  _hideModal(modalId) {
    const m = document.getElementById(modalId);
    m.classList.remove("show");
    setTimeout(() => m.classList.add("hidden"), 300);
  },

  /** Public entry point: pass in a callback to receive the final selection */
  open(onConfirm) {
    this.onConfirm = onConfirm;
    this._showSchoolModal();
  },

  /** STEP 1: Choose your Path */
  _showSchoolModal() {
    const modal     = document.getElementById("essence-school-modal");
    const grid      = document.getElementById("essence-school-options");
    const nextBtn   = document.getElementById("essence-school-next");
    const cancelBtn = document.getElementById("essence-school-cancel");

    // reset state
    this.selectedSchool = null;
    grid.innerHTML      = "";
    nextBtn.disabled    = true;

    // show the modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    // populate the three schools
    const schools = [
      { id: "calamity", name: "Path of Calamity", desc: "Elemental & physical damage." },
      { id: "stars",    name: "Path of the Stars",    desc: "Buffs, debuffs, control." },
      { id: "spirit",   name: "Path of the Spirit",   desc: "Healing & protection." },
    ];
    schools.forEach(s => {
      const card = document.createElement("div");
      card.className = "trait-card";
      card.innerHTML = `<strong>${s.name}</strong><div>${s.desc}</div>`;
      card.onclick = () => {
        grid.querySelectorAll(".trait-card").forEach(c=>c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedSchool = s.id;
        nextBtn.disabled    = false;
      };
      grid.appendChild(card);
    });

    // “Next” either goes to Calamity‐element or finalizes
    nextBtn.onclick = () => {
      this._hideModal("essence-school-modal");
      if (this.selectedSchool === "calamity") {
        this._showCalamityModal();
      } else {
        this._finalize();
      }
    };

    // “Cancel” just closes this modal
    cancelBtn.onclick = () => {
      this._hideModal("essence-school-modal");
    };
  },

  /** STEP 2 (only for Calamity): Choose your Element */
  _showCalamityModal() {
    const modal    = document.getElementById("calamity-element-modal");
    const grid     = document.getElementById("calamity-element-options");
    const backBtn  = document.getElementById("calamity-element-back");
    const okBtn    = document.getElementById("calamity-element-confirm");

    // reset state
    this.selectedElement = "";
    grid.innerHTML       = "";
    okBtn.disabled       = true;

    // show the modal
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("show"), 10);

    // populate Fire/Water/Earth/Air
    ["fire","water","earth","air"].forEach(e => {
      const card = document.createElement("div");
      card.className = "trait-card";
      card.textContent = e.charAt(0).toUpperCase()+e.slice(1);
      card.onclick = () => {
        grid.querySelectorAll(".trait-card").forEach(c=>c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedElement = e;
        okBtn.disabled       = false;
      };
      grid.appendChild(card);
    });

    // “Back” returns to the school list
    backBtn.onclick = () => {
      this._hideModal("calamity-element-modal");
      this._showSchoolModal();
    };

    // “Confirm” finalizes
    okBtn.onclick = () => {
      this._hideModal("calamity-element-modal");
      this._finalize();
    };
  },

  /** Save to sessionStorage and invoke your callback */
  _finalize() {
    sessionStorage.setItem(Constants.ESSENCE_PATH, this.selectedSchool);
    sessionStorage.setItem(Constants.ESSENCE_ELEMENT, this.selectedElement || "");

    if (typeof this.onConfirm === "function") {
      this.onConfirm({
        school:  this.selectedSchool,
        element: this.selectedElement
      });
    }
  }
};

