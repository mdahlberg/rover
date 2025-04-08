// weaponProperties.js - Weapon properties granted by proficiencies and used to unlock abilities

window.WeaponProperties = {
  availableProperties: {
    armor_destroyer: {
      name: "Armor Destroyer",
      description: "Attacks with these weapons ignore a portion of the target's armor.",
      grantedBy: ["long_crushing_weapons", "two_handed_blades", "two_handed_crushing_weapons"],
      unlocksAbilities: ["helm_crusher", "staggering_blows", "clear_the_way", "sword_breaker"]
    },
    assassins_tools: {
      name: "Assassin's Tools",
      description: "Grants access to precise, stealthy strikes effective from behind.",
      grantedBy: ["small_weapons"],
      unlocksAbilities: ["strike_from_behind", "crippling_strike", "slit_throat"]
    },
    cutting_edge: {
      name: "Cutting Edge",
      description: "Weapons with sharp edges designed to deal critical strikes.",
      grantedBy: ["short_weapons", "long_blades", "two_handed_blades", "bayonet"],
      unlocksAbilities: ["bleeding_edge", "rend", "precise_strike"]
    },
    defender: {
      name: "Defender",
      description: "Weapons or gear designed for defense and blocking.",
      grantedBy: ["double_weapons", "shields"],
      unlocksAbilities: ["block", "parry", "deflect"]
    },
    duelist: {
      name: "Duelist",
      description: "Balanced weapons suited for one-on-one combat with quick response.",
      grantedBy: ["small_weapons", "short_weapons", "long_blades", "double_weapons"],
      unlocksAbilities: ["counterstrike", "riposte"]
    },
    heavy_plus: {
      name: "Heavy+",
      description: "Heavy weapons capable of delivering powerful, staggering strikes.",
      grantedBy: ["long_crushing_weapons", "two_handed_blades", "two_handed_crushing_weapons"],
      unlocksAbilities: ["cleave", "crushing_blow"]
    },
    light_plus: {
      name: "Light+",
      description: "Very light weapons that allow fast and nimble attacks.",
      grantedBy: ["small_weapons"],
      unlocksAbilities: ["quick_strike", "darting_flurry"]
    },
    piercing: {
      name: "Piercing",
      description: "Weapons designed to puncture armor or hit vital areas.",
      grantedBy: ["long_blades", "two_handed_blades"],
      unlocksAbilities: ["pierce_armor", "vital_strike"]
    },
    tricky: {
      name: "Tricky",
      description: "Weapons that allow for deceptive attacks and unexpected angles.",
      grantedBy: ["short_weapons", "double_weapons"],
      unlocksAbilities: ["feint", "catch_off_guard"]
    },
    unstoppable: {
      name: "Unstoppable",
      description: "Crushing weapons that can batter through blocks or defenses.",
      grantedBy: ["two_handed_crushing_weapons"],
      unlocksAbilities: ["overwhelming_force", "battering_ram"]
    },
    versatile_plus: {
      name: "Versatile+",
      description: "Weapons that serve multiple functions or can be adapted easily.",
      grantedBy: ["long_blades", "long_crushing_weapons"],
      unlocksAbilities: ["adaptive_style", "momentum_strike"]
    },
    weighty_blows: {
      name: "Weighty Blows",
      description: "Weapons that deal significant impact, disrupting enemies.",
      grantedBy: ["short_weapons", "long_crushing_weapons", "two_handed_crushing_weapons"],
      unlocksAbilities: ["body_blow", "strike_the_throat", "smite", "helm_crusher"]
    },
  },

  getPlayerProperties: function () {
    const properties = new Set();
  
    for (const [propId, propData] of Object.entries(this.availableProperties)) {
      if (!propData.grantedBy) continue;
  
      for (const profId of propData.grantedBy) {
        if (Proficiencies.isPurchased?.(profId)) {
          properties.add(propId);
          break; // No need to keep checking once we know this property is granted
        }
      }
    }
  
    return properties;
  }

};
