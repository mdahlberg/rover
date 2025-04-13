window.MorphAbilities = {
  natural_weapons: {
    name: "Natural Weapons",
    description: `Allows use of a special short blade boffer to represent claws, horns, beaks, or fangs. Automatically grants proficiency with this weapon. Choose either one short blade that deals 2 damage or two blades that deal 1 damage. These cannot be destroyed or disarmed, but can be broken. Treated as Short Blades for all prerequisites.`,
    cost: 0,
    maxPurchases: 1,
  },
  naturally_strong: {
    name: "Naturally Strong",
    description: "Raise your strength by 1. This has no effect on your BCS.",
    cost: 0,
    maxPurchases: 1,
  },
  rapid_regeneration: {
    name: "Rapid Regeneration",
    description: `Gain a use of Regenerate 10 once per rest. All regeneration effects only take 10 seconds (instead of 30). Add the word "Rapid" to your audible call.`,
    cost: 0,
    maxPurchases: 1,
  },
  scent: {
    name: "Scent",
    description: "Gain extra information from Plot Marshalls based on scents. Enhances tracking-based Lores.",
    cost: 0,
    maxPurchases: 1,
  },
  insulating_hide: {
    name: "Insulating Hide",
    description: "Resistant to cold damage. Reduce any cold damage by 5 (minimum 0).",
    cost: 0,
    maxPurchases: 1,
  },
  armored_plating: {
    name: "Armored Plating",
    description: "Gain free shield proficiency. Shield cannot be destroyed or disarmed. Should be marked with green stripes to denote natural armor. Does not allow dual-shielding.",
    cost: 0,
    maxPurchases: 1,
  },
  hard_to_kill: {
    name: "Hard to Kill",
    description: "Once per cycle, when health reaches 0, begin a silent 10 count and regain 1 health.",
    cost: 5,
    maxPurchases: 4,
    firstFree: true
  },
  naturally_tough: {
    name: "Naturally Tough",
    description: "Gain 3 additional health points.",
    cost: 4,
    maxPurchases: 4,
    firstFree: true
  },
  regenerate_limb: {
    name: "Regenerate Limb",
    description: `End a single wrapped, pinned, or withered effect after a 3 count while roleplaying ripping free. Take 5 health damage and gain Long Unsteady. After Unsteady ends, regain 5 health.`,
    cost: 5,
    maxPurchases: 4,
    firstFree: true
  },
  blinding_venom: {
    name: "Blinding Venom Spray",
    description: `Thrown packet ability: “Blinding Venom! Toxin 5 / Long Blind” once per Cycle. Physical damage.`,
    cost: 6,
    maxPurchases: 4,
    firstFree: true
  },
  neurotoxin_venom: {
    name: "Neurotoxin Venom Spray",
    description: `Thrown packet ability: “Neurotoxin! Toxin 5 / Long Weaken 2” once per Cycle. Physical damage.`,
    cost: 6,
    maxPurchases: 4,
    firstFree: true
  },
  terrifying_glare: {
    name: "Terrifying Glare",
    description: `Once per rest, throw a packet to call “Terrifying Glare! Short Terror!” Physical effect. Creatures immune to fear are unaffected.`,
    cost: 4,
    maxPurchases: 4,
    firstFree: true
  }
};
