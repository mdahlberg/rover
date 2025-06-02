
// ui.js - Updates the DOM based on Layer and Point Changes

window.UI = {
  refreshAll: function (animate = false) {
    // Not on the character planner page yet
    if (!document.getElementById("planner-wrapper") || document.getElementById("planner-wrapper").classList.contains("hidden")) {
      console.warn("UI.refreshAll() skipped — planner not visible yet.");
      return;
    }

    UI.updateStatsUI();
    UI.updateDerivedStats();
    UI.updateAbilityUI(false);
    UI.updateProficiencyUI();
    UI.updateLoreUI();
    UI.updateLayerPreview();
    UI.updateLayerHistory();
    UI.updateEssenceSlotUI();
    UI.updateGlobalBuildPoints();
  },

  // Special handling for Gather Essence

  updateDerivedAbilities: function () {
    const count = Abilities.getDerivedUses("gather_essence");
    Abilities.derivedAbilities = { gather_essence: count };

    const derivedId = "gather_essence";

    // Remove old derived (in case we lost a spirit point)
    Abilities.derivedAbilities = Abilities.derivedAbilities || {};
    Abilities.derivedAbilities[derivedId] = count;

    UI.updateAbilityUI(); // re-render entire list with new values
  },

  flashWarning: function(message, duration = 3000) {
    console.warn("call flash warning")
    const warningEl = document.getElementById('global-warning');
    if (!warningEl) return;
  
    warningEl.textContent = message;
    warningEl.classList.remove('hidden');
  
    // Optional: Add a fade-in effect
    warningEl.style.opacity = '1';
  
    setTimeout(() => {
      warningEl.style.opacity = '0';
      setTimeout(() => {
        warningEl.classList.add('hidden');
        warningEl.textContent = '';
      }, 300); // wait for fade-out to finish
    }, duration);
  },

  updateLayerPreview: function () {
    const list = document.getElementById("current-layer-display");
    if (!list) return;

    list.innerHTML = "";

    const layer = Layers.currentLayer;
    const points = layer.points || {};

    // Defer to each system's own renderer
    const fragments = [];

    // Stats preview
    if (points.stats && Object.keys(points.stats).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Stats</strong>`;
      fragments.push(header);

      for (const stat in points.stats) {
        const li = document.createElement("li");

        const totalBP = points.stats[stat]; // This is the total cost already stored
        const purchaseCount = Stats.currentLayerStats?.[stat] || 0; // How many times it was bought this layer

        li.textContent = `• ${stat} x${purchaseCount} (${totalBP} BP)`;
        fragments.push(li);
      }
    }

    // Abilities preview
    if (points.abilities && Object.keys(points.abilities).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Abilities</strong>`;
      fragments.push(header);
      for (const id in points.abilities) {
        let count = Abilities.currentLayerPurchasedAbilities?.[id] || 0;
        const ability = Abilities.getAbilityById?.(id);
        const name = ability?.name || id;
        const totalCost = Layers.currentLayer.points.abilities[id];

        const isRacial = window.RacialLocks?.abilities?.has(id);

        const tag = isRacial ? " - Race Bonus" : "";

        const li = document.createElement("li");
        li.textContent = `• ${name} x${count} (${totalCost} BP)${tag}`;
        fragments.push(li);
      }
    }

    // Proficiencies preview
    if (points.proficiencies && Object.keys(points.proficiencies).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Proficiencies</strong>`;
      fragments.push(header);
      for (const id in points.proficiencies) {
        const prof = Proficiencies.getProficiencyById?.(id);
        const name = prof?.name || id;
        const cost = points.proficiencies[id];
        isRacial = window.RacialLocks?.proficiencies?.has(id);
        const badge = isRacial ? ' - Race Bonus' : "";

        const li = document.createElement("li");
        li.textContent = `• ${name} (${cost} BP)${badge}`;
        fragments.push(li);
      }
    }

    // Lores preview
    const curLores = Lores.currentLayerPurchasedLores;
    if (curLores && Object.keys(curLores).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>Lores</strong>`;
      fragments.push(header);
      for (const id in curLores) {
        const count = curLores[id];
        const lore = Lores.availableLores.find(l => l.id === id);
        const name = lore?.name || id;
        const li = document.createElement("li");
        li.textContent = `• ${name} x${count}`;
        fragments.push(li);
      }
    }

    // Essence slots preview
    if (points.essenceSlots && Object.keys(points.essenceSlots).length > 0) {
      const header = document.createElement("li");
      header.innerHTML = `<strong>EssenceSlots</strong>`;
      fragments.push(header);
      for (const id in points.essenceSlots) {
        const count = EssenceSlots.getSlotCount?.(id) || 0;
        const cost = EssenceSlots.getCost(id) || 0;
        const li = document.createElement("li");
        li.textContent = `• Essence Slot Lvl ${id} x${count} (${count * cost} BP)`;
        fragments.push(li);
      }
    }

    // Append all items to the DOM
    fragments.forEach(el => list.appendChild(el));
  },

  // ui.js - UI rendering and interaction logic

  updateEssenceSlotUI: function () {
    const container = document.getElementById("essence-slot-list");
    const pathDiv     = document.getElementById("essence-path-display");

    if (!container || !pathDiv) return;

    // ——— Display current Path + icon ———
    const school = sessionStorage.getItem(Constants.ESSENCE_PATH) || "";
    const element = sessionStorage.getItem(Constants.ESSENCE_ELEMENT) || "";

    const names = {
      spirit: "Path of the Spirit",
      stars:  "Path of the Stars",
      calamity: "Path of Calamity"
    };
    const emojis = {
      spirit:        "🛡️",
      stars:         "✨",
      "fire":  "🔥",
      "water": "💧",
      "earth": "⛰️",
      "air":   "💨"
    };

    let displayName = names[school] || "Unknown Path";
    if (school === "calamity" && element) {
      displayName += ` — ${element.charAt(0).toUpperCase()+element.slice(1)}`;
    }
    const icon = emojis[school] || emojis[element] || "";

    pathDiv.innerHTML = icon
      ? `<span class="icon">${icon}</span>${displayName}`
      : displayName;

    container.innerHTML = "";

    // For each slot, 1-9, master
    EssenceSlots.levels.forEach((level) => {
      const li = document.createElement("li");
      li.classList.add("slot-entry");

      const label = document.createElement("span");
      label.textContent = EssenceSlots.getDisplayLabel(level);

      const count = document.createElement("span");

      count.textContent = `x${EssenceSlots.purchasedEssences[level]}`;
      count.classList.add("slot-count");

      const cost = EssenceSlots.getCost(level);
      const canBuy = EssenceSlots.canPurchase(level);
      const isRefundable = EssenceSlots.isRefundable(level);

      const addBtn = document.createElement("button");
      addBtn.textContent = cost !== null ? `+ (${cost} BP)` : "+";
      addBtn.disabled = !canBuy;
      addBtn.onclick = () => EssenceSlots.purchaseSlot(level);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "-";
      removeBtn.disabled = !isRefundable;
      removeBtn.onclick = () => EssenceSlots.refundSlot(level);

      li.appendChild(label);
      li.appendChild(count);
      li.appendChild(addBtn);
      li.appendChild(removeBtn);
      container.appendChild(li);
    });
  },

  updateLayerHistory: function () {
    console.log("Updating layer history");
    const historyList = document.getElementById("layer-history");
    if (!historyList) return;

    historyList.innerHTML = "";

    Layers.layers.forEach((layer, index) => {
      const points = layer.points || {};
      const item = document.createElement("li");
      item.className = "layer-history-item";

      const stats = Object.entries(layer.stats || {})
        .map(([k, v]) => `${k}: +${v}`)
        .join(", ") || "None";

      const abilities = Object.keys(layer.abilities || {})
        .map((k) => {
          const name = Abilities.availableAbilities[k]?.name || k;
          const count = layer.abilities[k];
          return `${name} x${count}`;
        })
        .join(", ") || "None";

      const proficiencies = Object.keys(layer.proficiencies || {})
        .map((k) => Proficiencies.availableProficiencies[k]?.name || k)
        .join(", ") || "None";

      const lores = Object.entries(layer.lores || {})
        .map(([k, v]) => {
          const name = Lores.availableLores.find(l => l.id === k)?.name || k;
          return `${name} x${v}`;
        })
        .join(", ") || "None";

      const essenceEntries = Object.entries(layer.essenceSlots || {});
      const nonZeroEssences = essenceEntries.filter(([_, count]) => count > 0);

      const essence = nonZeroEssences.length > 0
        ? nonZeroEssences.map(([level, count]) => `Lvl ${level} x${count}`).join(", ")
        : "None";

      item.innerHTML = `
        <strong>Level ${index + 1}</strong><br>
        <em>Stats:</em> ${stats}<br>
        <em>Abilities:</em> ${abilities}<br>
        <em>Proficiencies:</em> ${proficiencies}<br>
        <em>Lores:</em> ${lores}<br>
        <em>Essence Slots:</em> ${essence}
      `;

      // Add a revert button
      if (index < Layers.layers.length) {
        const revertBtn = document.createElement("button");
        revertBtn.textContent = "Revert to this Level";
        revertBtn.className = "revert-button";
        revertBtn.onclick = () => {
          Layers.revertToLevel(index);
        };
        item.appendChild(revertBtn);
      }

      historyList.appendChild(item);
    });
  },

  showCharacterPlanner: function () {
    document.getElementById("splash-container").classList.add("hidden");
    document.getElementById("planner-wrapper").classList.remove("hidden");

    this.setupEarnedBPButton();
    UI.setupHeader();

    // Initialize buttons and update UI
    UI.refreshAll();
    UI.setupStatButtons();
  },

  showTooltip: function(msg, duration = 2000) {
    const tip = document.getElementById('bp-tooltip');
    tip.textContent = msg;
    tip.classList.add('show');
    clearTimeout(tip._hideTimer);
    tip._hideTimer = setTimeout(() => {
      tip.classList.remove('show');
    }, duration);
  },
  

  /**
   * Set up listener for earned BP button
   */
    /**
   * Initialize Earned BP form: expand/collapse, submission, and validation.
   */
  setupEarnedBPButton() {
    const container = document.querySelector('.add-bp-container');
    const form      = document.getElementById('add-earned-bp-form');
    const input     = document.getElementById('earned-bp-input');
    const addBtn    = document.getElementById('add-earned-bp');

    if (!container || !form || !input || !addBtn) return;

    // Expand/collapse handlers
    container.addEventListener('click', UI._handleContainerClick);

    // Submit via Enter key or button click
    form.addEventListener('submit', UI._handleFormSubmit);

    // Input validation listeners
    input.addEventListener('keydown', UI._preventSpinnerOverflow);
    input.addEventListener('input', UI._clampInputValue);
  },

  /** Expand or collapse the BP form */
  _handleContainerClick(event) {
    const container = event.currentTarget;
    if (event.target.matches('[data-action="expand-add-bp"]')) {
      UI._expandBPForm(container);
    }
    if (event.target.matches('[data-action="cancel-add-bp"]')) {
      UI._collapseBPForm(container);
    }
  },

  /** Prevent spinner arrow from exceeding max BP */
  _preventSpinnerOverflow(event) {
    if (event.key !== 'ArrowUp') return;
    const input = event.currentTarget;
    const max = BPLeveling.getMaxSafeEarnedBP();
    const val = parseInt(input.value, 10) || 0;
    if (val >= max) event.preventDefault();
  },

  /** Clamp input value to max and show warning */
  _clampInputValue(event) {
    const input = event.currentTarget;
    const max = BPLeveling.getMaxSafeEarnedBP();
    input.max = max;
    let val = parseInt(input.value, 10) || 0;
    if (val > max) {
      input.value = max;
      UI._showTip(`⚠️ Max is ${max} BP to avoid skipping a level`, 'error', 2500);
    }
  },

  /** Handle form submission (Enter key) */
  _handleFormSubmit(event) {
    event.preventDefault();
    // Delegate to add click logic
    UI._handleAddClick();
  },

  /** Validate and apply earned BP on Add button click */
  _handleAddClick() {
    const input  = document.getElementById('earned-bp-input');
    const amt    = parseInt(input.value, 10);
    const max    = BPLeveling.getMaxSafeEarnedBP();
    const container = document.querySelector('.add-bp-container');

    if (isNaN(amt) || amt <= 0) {
      UI._showTip('Enter a number greater than zero.');
      return;
    }

    if (amt > max) {
      UI._showTip(`⚠️ Only up to ${max} BP here—otherwise you’ll skip a level.`, 'error', 2500);
      return;
    }

    if (BPLeveling.addEarnedBP(amt)) {
      UI._showTip(`+${amt} BP added!`, 'success', 1500);
      input.value = '';
      UI._collapseBPForm(container);
    }
  },

  /** Show or update a tooltip message */
  _showTip(msg, type = 'error', duration = 2000) {
    const wrapper = document.querySelector('.add-bp-container');
  
    // 1) create a new tip element each time
    const tip = document.createElement('div');
    tip.className = `bp-tooltip ${type} stack`;
    tip.textContent = msg;
    wrapper.appendChild(tip);

    // 2) schedule its removal
    setTimeout(() => {
      tip.classList.remove('show');
      // after fade‑out (if you have a transition), remove from DOM
      setTimeout(() => wrapper.removeChild(tip), 300);
    }, duration);

    // 3) trigger the “show” animation class
    requestAnimationFrame(() => tip.classList.add('show'));
  },

  /** Expand the BP input form */
  _expandBPForm(container) {
    container.classList.add('is-expanded');
    document.getElementById('earned-bp-input').focus();
  },

  /** Collapse the BP input form */
  _collapseBPForm(container) {
    container.classList.remove('is-expanded');
  },

  /**
   * Attaches event listeners to the stat increase/decrease buttons.
   */
  setupStatButtons: function () {
    console.log("Setting up stats button")
    document.querySelectorAll(".stat-increase").forEach((button) => {
      button.addEventListener("click", function () {
        const statName = this.dataset.stat;
        Stats.increaseStat(statName);
        UI.refreshAll()
      });
    });

    document.querySelectorAll(".stat-decrease").forEach((button) => {
      button.addEventListener("click", function () {
        const statName = this.dataset.stat;
        if (Stats.canDecrease(statName)) {
          Stats.decreaseStat(statName);
          UI.refreshAll();
        }
      });
    });
  },

  /**
   * Updates the UI for core stat buttons to show correct point costs.
   */
  updateStatsUI: function () {
    ["body", "mind", "spirit"].forEach((statName) => {
      const increaseButton = document.querySelector(`.stat-increase[data-stat="${statName}"]`);
      const decreaseButton = document.querySelector(`.stat-decrease[data-stat="${statName}"]`);

      if (increaseButton) {
        // Get the cost of the next level up
        const statCost = Stats.getStatCost(statName);
        increaseButton.innerHTML = `Increase (+${statCost} pts)`;

        const status = Stats.canIncrease(statName);
        if (!status.allowed) {
          increaseButton.disabled = true;
          increaseButton.title = status.reason;
        } else {
          increaseButton.disabled = false;
          increaseButton.title = "";
        }
      }

      if (decreaseButton) {
        // Refund the cost of the next level down
        const statCost = Stats.getStatCost(statName, -1);
        decreaseButton.innerHTML = `Decrease (-${statCost} pts)`;

        const status = Stats.canDecrease(statName);
        if (!status.allowed) {
          decreaseButton.disabled = true;
          decreaseButton.title = status.reason;
        } else {
          decreaseButton.disabled = false;
          decreaseButton.title = "";
        }
      }

      const currentStatValue = Stats.getTotal(statName)
      document.getElementById(`${statName}-value`).innerText = Stats.getTotal(statName);

    });

    console.log("Core stat buttons updated.");
  },

  /**
   * Update the UI for core stats and derived stats.
   */
  updateDerivedStats: function () {
    document.getElementById("strength-value").innerText = Stats.getStrength();
    document.getElementById("health-value").innerText = Stats.getTotal("body") + 5;
    document.getElementById("armor-value").innerText = Stats.getTotal("body") + 10;
    document.getElementById("unspent-lores").innerText = Lores.getUnspentLores();
    this.updateGlobalBuildPoints();
  },

  /**
   * Updates the current level purchases card with a summary.
   */
  updateLayerSummary: function () {
    const summaryContainer = document.getElementById("current-layer-summary");
    summaryContainer.innerHTML = "";

    const currentLayer = Layers.currentLayer;
    if (!currentLayer) {
      console.warn("No current layer found.");
      return;
    }

    let content = "<h3>Current Level Purchases</h3>";

    // Stats
    Object.keys(currentLayer.stats).forEach((stat) => {
      if (currentLayer.stats[stat] > 0) {
        content += `<p>${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${currentLayer.stats[stat]}</p>`;
      }
    });

    // Abilities
    Object.keys(currentLayer.abilities).forEach((ability) => {
      if (currentLayer.abilities[ability] > 0) {
        content += `<p>Ability: ${ability} (${currentLayer.abilities[ability]}x)</p>`;
      }
    });

    // Proficiencies
    Object.keys(currentLayer.proficiencies).forEach((proficiency) => {
      if (currentLayer.proficiencies[proficiency] > 0) {
        content += `<p>Proficiency: ${proficiency}</p>`;
      }
    });

    // Lores
    Object.keys(currentLayer.lores).forEach((lore) => {
      if (currentLayer.lores[lore] > 0) {
        content += `<p>Lore: ${lore} (${currentLayer.lores[lore]}x)</p>`;
      }
    });

    // Add the content or show a placeholder if nothing was purchased
    summaryContainer.innerHTML = content || "<p>No purchases this level.</p>";
  },

  updateAbilityUI: function (animateCreation = false) {
    const container = document.getElementById("ability-select-list");

    // if we don’t want animations, ensure the class is set
    container.classList.toggle("no-anim", !animateCreation);

    container.innerHTML = "";
  
    const allAbilities = Abilities.availableAbilities;
    const derivedAbilities = Abilities.derivedAbilities || {};

    // Helper to create ability DOM
    function createAbilityCard(abilityId, ability, count, isDerived = false) {
      const isMorph = ability?.isMorph || false;

      const item = document.createElement("div");

      item.className = "ability-item" + (isDerived ? " derived" : "");
  
      const header = document.createElement("div");
      header.className = "ability-header";
  
      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = ability.name;
      name.title = ability.description;

      if (isMorph) {
        item.classList.add("morph-ability");
        const morphTag = document.createElement("span");
        morphTag.className = "racial-tag";
        morphTag.textContent = "(Morph)";
        name.appendChild(morphTag);
      }
  
      const badge = document.createElement("span");
      badge.className = "ability-badge";
      badge.textContent = `x${count}`;
      if (count === 0) badge.classList.add("muted");
  
      header.appendChild(badge);
      header.appendChild(name);
  
      if (!isDerived) {
        const costWrapper = document.createElement("span");
        costWrapper.className = "ability-cost";
      
        const base = ability.cost;
        const actual = Abilities.getCost(ability);
        const isDiscounted = actual < base;
      
        if (isDiscounted) {
          const original = document.createElement("span");
          original.className = "original-cost";
          original.textContent = `${base} BP`;
      
          const discounted = document.createElement("span");
          discounted.className = "discounted-cost";
          discounted.textContent = `${actual} BP`;
      
          const tag = document.createElement("span");
          tag.className = "discount-tag";
          tag.title = "Racial bonus applies to first purchase";
          tag.textContent = " (discount)";
      
          costWrapper.appendChild(original);
          costWrapper.appendChild(discounted);
          costWrapper.appendChild(tag);
        } else {
          costWrapper.textContent = `(${base} BP)`;
        }
      
        header.appendChild(costWrapper);
      }
  
      const description = document.createElement("div");
      description.className = "ability-description";
      description.textContent = ability.description;
  
      item.appendChild(header);
      item.appendChild(description);
  
      // Weapon property badges
      if (!isDerived && ability.weaponProperties?.length) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "property-badges";
  
        ability.weaponProperties.forEach((propId) => {
          const prop = WeaponProperties.availableProperties[propId];
          const hasIt = WeaponProperties.getPlayerProperties().has(propId);
  
          const badge = document.createElement("span");
          badge.className = "property-badge " + (hasIt ? "owned" : "missing");
          badge.textContent = prop?.name || propId;
          badge.title = prop?.description || "";
          badgeContainer.appendChild(badge);
        });
  
        item.appendChild(badgeContainer);
      }
  
      // Action buttons
      if (!isDerived) {
        const actions = document.createElement("div");
        actions.className = "ability-actions";
  
        const cost = Abilities.getCost(ability);
        const canPurchase = Abilities.canPurchase(abilityId);
  
        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.disabled = Layers.getRemainingPoints() < cost || !canPurchase;
        plus.onclick = () => {
          Abilities.purchaseAbility(abilityId, cost);
          UI.refreshAll(false);
        };
  
        const minus = document.createElement("button");
        minus.textContent = "-";
        minus.disabled = count === 0 || !Abilities.canRefund(abilityId);
        minus.onclick = () => {
          Abilities.removeAbility(abilityId);
          UI.refreshAll();
        };
  
        actions.appendChild(minus);
        actions.appendChild(plus);
        item.appendChild(actions);
      }
  
      return item;
    }

    // Ability shop filters
    const affBox = document.getElementById("filter-affordable");
    const preBox = document.getElementById("filter-prereqs");
    const refundableBox = document.getElementById("filter-refundable");

    const filterAfford = affBox.checked;
    const filterPrereq = preBox.checked;
    const filterRefundable = refundableBox.checked;

    let total = 0
    let displaying = 0;

    // Render Derived First
    Object.entries(derivedAbilities).forEach(([id, count]) => {
      displaying++;
      const ability = allAbilities[id];
      if (ability) container.appendChild(createAbilityCard(id, ability, count, true));
    });
  
    // Then Normal Abilities
    Object.entries(allAbilities).forEach(([id, ability]) => {
      total++;

      if (ability.derived) return; // skip

      if (Abilities.meetFilters(filterAfford, filterPrereq, filterRefundable, id, ability)) {
        displaying++;
        const count = Abilities.getPurchaseCount(id);
        const ab = createAbilityCard(id, ability, count);
        if (animateCreation) {
          ab.style.setProperty('--i', displaying)
        }

        container.appendChild(ab);
      }
    });

    const howManyEl = document.querySelector(`.ability-how-many`);
    howManyEl.textContent = "Displaying " + displaying + "/" + total;
    // re‑trigger the flash animation:
    howManyEl.classList.remove('flash');
    // voiding offsetWidth forces the browser to “reset” the animation
    void howManyEl.offsetWidth;
    howManyEl.classList.add('flash');

  
    this.updateGlobalBuildPoints();
  },

  /**
   * Update the proficiency shop UI.
   */
  updateProficiencyUI: function () {
    const container = document.getElementById("proficiency-shop");

    container.innerHTML = "";

    Object.entries(Proficiencies.availableProficiencies).forEach(([id, prof]) => {
      const isRacial = window.RacialLocks?.proficiencies?.has(id);

      // Add property badges
      const grantedProps = [];
      for (const [propId, prop] of Object.entries(WeaponProperties.availableProperties)) {
        if (prop.grantedBy?.includes(id)) {
          grantedProps.push({ id: propId, name: prop.name });
        }
      }

      const item = document.createElement("div");
      const label = document.createElement("strong");

      label.title = prof.description;

      item.className = "ability-item-no-anim";

      if (isRacial) {
        item.classList.add("racial-proficiency");
        label.innerHTML += ' <span class="racial-tag">(Racial)</span>';
        item.appendChild(label);
      }

      const header = document.createElement("div");
      header.className = "ability-header";

      const name = document.createElement("strong");
      name.className = "ability-name";
      name.textContent = prof.name;
      name.title = prof.description;

      const cost = document.createElement("span");
      cost.className = "ability-cost";
      cost.textContent = `(${prof.cost} BP)`;

      header.appendChild(name);
      header.appendChild(cost);

      const desc = document.createElement("div");
      desc.className = "ability-description";
      desc.textContent = prof.description;

      const actions = document.createElement("div");
      actions.className = "ability-actions";

      const button = document.createElement("button");

      let owned = false;
      if (Proficiencies.isPurchased(id)) {
        owned = true;
        button.textContent = "Remove";
        button.disabled = !Proficiencies.canRefund(id);
        button.onclick = () => {
          Proficiencies.removeProficiency(id);
          UI.refreshAll();
        };
      } else {
        button.textContent = `Purchase (${prof.cost} BP)`;
        button.disabled = Layers.getRemainingPoints() < prof.cost;
        button.onclick = () => {
          Proficiencies.purchaseProficiency(id);
          UI.refreshAll();
        };
      }

      if (grantedProps.length > 0) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "property-badges";

        grantedProps.forEach((prop) => {
          const badge = document.createElement("span");
          badge.className = "property-badge " + (owned ? "owned" : "missing")
          badge.textContent = prop.name;
          badge.title = WeaponProperties.availableProperties[prop.id]?.description || prop.id;
          badgeContainer.appendChild(badge);
        });

        item.appendChild(badgeContainer);
      }


      actions.appendChild(button);
      item.appendChild(header);
      item.appendChild(desc);
      item.appendChild(actions);
      container.appendChild(item);
    });
  },

  /**
   * Refresh the Lore shop
   */
  updateLoreUI: function() {
    const container = document.getElementById("lore-content");
    container.innerHTML = "";
  
    // Update Unspent badge
    const unspent = Lores.getUnspentLores();
    document.getElementById("unspent-lores").textContent = `${unspent} Unspent`;

    // —— New: decorate the sidebar icon when unspent > 0 ——
    const navItem = document.querySelector('#sidebar li[data-target="lores"]');
    // remove any old indicator
    const old = navItem.querySelector('.unspent-indicator');
    if (old) old.remove();

    if (unspent > 0) {
      const badge = document.createElement('span');
      badge.className = 'unspent-indicator';
      badge.textContent = unspent;              // or '' for dot
      // badge.classList.add('dot');            // if you prefer a dot
      navItem.appendChild(badge);
    }
  
    function renderBranch(parentId, depth = 0) {
      const branch = Lores.availableLores
        .filter(l => l.parent === parentId)
        .sort((a, b) => {
          // non-parents first (a.isParent=false → 0; true→1)
          const pa = a.isParent ? 1 : 0;
          const pb = b.isParent ? 1 : 0;
          if (pa !== pb) return pa - pb;
          // then sort alphabetically by name
          return a.name.localeCompare(b.name);
        });

      for (const lore of branch) {
        const lvl = Lores.getLoreLevel(lore.id);
  
        // Entry wrapper
        const entry = document.createElement("div");
        entry.className = "lore-entry" + (depth > 0 ? " child" : "");
        entry.style.marginLeft = `${depth * 1.5}rem`;
  
        // Name + tooltip
        const nameDiv = document.createElement("div");
        nameDiv.className = "lore-name";
        nameDiv.innerHTML = `
          <div class="info-wrapper">
            <span class="info-icon">i</span>
            <div class="lore-tooltip">${lore.description}</div>
          </div>
          <span>${lore.name}</span>
        `;

        // If this is a custom lore, inject the delete‐“×” right after the info icon
        if (lore.isCustom) {
          const btnDelete = document.createElement("button");
          btnDelete.className = "lore-delete";
          btnDelete.textContent = "×";
          btnDelete.title = "Delete custom lore";
          // Only allow deletion if unpurchased
          btnDelete.disabled = (Lores.getLoreLevel(lore.id) !== 0);
          btnDelete.onclick = () => {
            Lores.availableLores = Lores.availableLores.filter(l => l.id !== lore.id);
            UI.updateLoreUI();
          };
          nameDiv.appendChild(btnDelete);
        }

        entry.appendChild(nameDiv);
        container.appendChild(entry);
  
        // Recurse categories
        if (lore.isParent) {
          renderBranch(lore.id, depth + 1);
          continue;
        }
  
        // Controls: − / count / + / [× delete if custom]
        const controls = document.createElement("div");
        controls.className = "lore-controls";
  
        // Minus
        const btnMinus = document.createElement("button");
        btnMinus.textContent = "−";
        btnMinus.disabled = !Lores.canDecreaseLore(lore.id);
        btnMinus.onclick = () => Lores.removeLore(lore.id);
  
        // Count
        const countSpan = document.createElement("span");
        countSpan.className = "lore-count";
        countSpan.textContent = lvl;
  
        // Plus
        const btnPlus = document.createElement("button");
        btnPlus.textContent = "+";
        btnPlus.disabled = !Lores.canIncreaseLore(lore.id);
        btnPlus.onclick = () => Lores.purchaseLore(lore.id);
  
        controls.append(btnMinus, countSpan, btnPlus);
  
        entry.appendChild(controls);
      }
    }
  
    // Start at the root (no parent)
    renderBranch(undefined, 0);
  },

  /**
   * Creates an individual lore item to display in the UI.
   * @param {object} lore - The lore object.
   * @param {string} parentId - Optional parent ID for nested lores.
   * @returns {HTMLElement} The list item for the lore.
   */
  createLoreItem: function (lore, parentId = null) {
    const listItem = document.createElement("div");
    listItem.className = `lore-item ${parentId ? "sub-lore" : ""}`;
  
    const loreId = lore.id;
    const level = Lores.purchasedLores[loreId] || 0;
    const current = Lores.currentLayerPurchasedLores[loreId] || 0;
  
    // Controls container (left-aligned buttons)
    const controls = document.createElement("span");
    controls.className = "lore-controls";
  
    const minus = document.createElement("button");
    minus.textContent = "-";
    minus.disabled = current <= 0;
    minus.onclick = () => {
      if (Lores.removeLore(loreId)) UI.refreshAll();
    };
  
    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.disabled = !Lores.canIncreaseLore(loreId);
    plus.onclick = () => {
      if (Lores.purchaseLore(loreId)) UI.refreshAll();
    };
  
    controls.appendChild(minus);
    controls.appendChild(plus);
  
    // Label container (text and level)
    const label = document.createElement("span");
    label.textContent = `${lore.name}${level > 0 ? ` (Level ${level})` : ""}`;
    label.title = lore.description;
  
    listItem.appendChild(controls);
    listItem.appendChild(label);
    return listItem;
  },

  updateGlobalBuildPoints: function () {
    // 1) Level
    const levelEl = document.getElementById("level-display");
    if (levelEl) {
      levelEl.innerText = Layers.getCurrentLevel();
    }
  
    // 2) Compute totals
    const total     = BPLeveling.earnedBP;
    const spent     = Layers.getTotalPointsSpent();
    const remaining = total - spent;
    const toLevel   = BPLeveling.getBPToLevel();
  
    // 3) Compute percent into this level
    const nextLevel     = BPLeveling.getNextLevelThreshold();
    const prevLevel     = BPLeveling.getNextLevelThreshold(-1);
    const levelPoints   = nextLevel - prevLevel;
    const levelCompleted = levelPoints - toLevel;
    const percent = levelPoints > 0
      ? Math.round((levelCompleted / levelPoints) * 100)
      : 0;
  
    // 4) Update the gauge
    const gaugeEl = document.querySelector('.level-gauge');
    const fillEl  = gaugeEl?.querySelector('.gauge-fill');
    if (fillEl) {
      fillEl.style.width = percent + '%';
    }

    if (gaugeEl) {
      gaugeEl.setAttribute('aria-valuenow', percent);
      gaugeEl.setAttribute('data-percent', percent);
    }
  
    // 5) Update remaining‑BP text
    const remEl = document.getElementById("remaining-bp");
    if (remEl) {
      remEl.textContent = remaining;
    }
  },
  /** Show total‑earned / total‑spent when the info icon is clicked */
  setupBPInfoButton: function() {
    const btn = document.querySelector('.bp-info');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // grab your values however you store them
      const earned = BPLeveling.earnedBP;
      const spent  = Layers.getTotalPointsSpent();
      // use your existing tooltip method
      UI._showTip(`Earned: ${earned} BP\nSpent: ${spent} BP`, 'success', 3000);
    });
  },

  setupHeader: function() {
    // 1) Level
    const levelEl = document.getElementById('level-display');
    if (levelEl && typeof Layers !== 'undefined') {
      const lvl = Layers.getCurrentLevel();
      levelEl.textContent = lvl;
    }

    // 2) Name
    const nameEl = document.querySelector('.char-name');
    if (nameEl) {
      const fullName = sessionStorage.getItem(Constants.CHAR_NAME) || "Unnamed";
      nameEl.textContent = fullName;
      nameEl.setAttribute('title', fullName);        // so ellipsis shows on hover
    }
  },

};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  UI.setupEarnedBPButton();
  UI.setupBPInfoButton();
});
