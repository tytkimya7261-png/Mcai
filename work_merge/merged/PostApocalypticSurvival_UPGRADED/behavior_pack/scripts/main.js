import {
  world,
  system,
  EquipmentSlot,
  EntityDamageCause,
  BlockPermutation,
  ItemStack
} from "@minecraft/server";

// =====================================================================
// POST-APOCALYPTIC SURVIVAL — Scripting API v1.2
// Bedrock Edition 1.21+  |  @minecraft/server 1.12.0
// =====================================================================

// --- SABITLER ---
const INFECTION_DURATION_TICKS = 72000;  // 60 dk × 20 tick/sn × 60 sn
const BLOOD_HP_THRESHOLD       = 8;      // 4 kalp
const BLOOD_TRAIL_INTERVAL     = 40;     // 2 sn
const HORDE_CHECK_INTERVAL     = 600;    // 30 sn
const HUD_INTERVAL             = 40;     // 2 sn
const ZOMBIE_CALL_RADIUS       = 48;
const BLOOD_SMELL_RADIUS       = 32;
const BLOOD_TRAIL_MAX_TICKS    = 6000;   // 5 dk
const BLOOD_MOON_PERIOD        = 7;
const BLOOD_MOON_START         = 13000;
const BLOOD_MOON_END           = 23000;
const TNT_PLANT_RADIUS         = 5;
const RAD_INTERVAL             = 100;    // 5 sn
const RAD_Y_LIMIT              = -40;
const BLOCK_BREAK_RADIUS       = 2;      // Zombinin blok kırabileceği mesafe
const BLOCK_BREAK_INTERVAL     = 100;    // Her 5 sn
const GEN_INTERVAL             = 600;    // Yapı kontrol sıklığı (30 sn)

// Silah hasar tablosu — TACZ gerçek değerleri (damage per shot)
const WEAPON_DAMAGE = {
  // Original weapons
  "pas:pistol":          8,
  "pas:rifle":           14,
  "pas:shotgun":         6,
  "pas:sniper":          30,
  // TACZ Pistols (10)
  "pas:glock_17":        6,
  "pas:m1911":           11,
  "pas:deagle":          16,
  "pas:deagle_golden":   12,
  "pas:b93r":            7.5,
  "pas:cz75":            5,
  "pas:p320":            10,
  "pas:uzi":             6.5,
  "pas:vector45":        7,
  "pas:timeless50":      15,
  // TACZ Rifles (18)
  "pas:ak47":            9,
  "pas:aug":             7,
  "pas:fn_fal":          13,
  "pas:g36k":            7,
  "pas:hk416a5":         6.5,
  "pas:hk416d":          6.5,
  "pas:hk_g3":           12,
  "pas:m16a1":           8,
  "pas:m16a4":           8,
  "pas:m4a1":            6.5,
  "pas:mk14":            16,
  "pas:qbz_191":         7.5,
  "pas:qbz_95":          7.5,
  "pas:scar_h":          14,
  "pas:scar_l":          7.5,
  "pas:sks_tactical":    11,
  "pas:spr15hb":         10,
  "pas:type_81":         9,
  // TACZ SMGs (3)
  "pas:hk_mp5a5":        6,
  "pas:p90":             5.5,
  "pas:ump45":           9,
  // TACZ Shotguns (6) — full per-shot damage from TACZ data
  "pas:aa12":            30,
  "pas:db_long":         30,
  "pas:db_short":        24,
  "pas:m1014":           40,
  "pas:m870":            36,
  "pas:spas_12":         64,
  // TACZ Snipers (4)
  "pas:ai_awp":          42,
  "pas:m107":            55,
  "pas:m700":            24,
  "pas:m95":             75,
  // TACZ LMGs (4)
  "pas:fn_evolys":       12,
  "pas:m249":            7.5,
  "pas:minigun":         8,
  "pas:rpk":             10,
  // TACZ Launchers (2)
  "pas:m320":            10,
  "pas:rpg7":            20,
  // TACZ Historical (1)
  "pas:springfield1873": 35,
};

// Silah bekleme süresi tablosu — 60000 / RPM ms cinsinden
const WEAPON_COOLDOWN = {
  // Original weapons (ms)
  "pas:pistol":          500,
  "pas:rifle":           250,
  "pas:shotgun":         1000,
  "pas:sniper":          2000,
  // TACZ Pistols (RPM → 60000/RPM ms)
  "pas:glock_17":        Math.round(60000 / 400),    // 150 ms
  "pas:m1911":           Math.round(60000 / 350),    // 171 ms
  "pas:deagle":          Math.round(60000 / 300),    // 200 ms
  "pas:deagle_golden":   Math.round(60000 / 350),    // 171 ms
  "pas:b93r":            Math.round(60000 / 900),    // 67 ms
  "pas:cz75":            Math.round(60000 / 900),    // 67 ms
  "pas:p320":            Math.round(60000 / 450),    // 133 ms
  "pas:uzi":             Math.round(60000 / 600),    // 100 ms
  "pas:vector45":        Math.round(60000 / 1200),   // 50 ms
  "pas:timeless50":      Math.round(60000 / 300),    // 200 ms
  // TACZ Rifles
  "pas:ak47":            Math.round(60000 / 600),    // 100 ms
  "pas:aug":             Math.round(60000 / 710),    // 85 ms
  "pas:fn_fal":          Math.round(60000 / 350),    // 171 ms
  "pas:g36k":            Math.round(60000 / 780),    // 77 ms
  "pas:hk416a5":         Math.round(60000 / 900),    // 67 ms
  "pas:hk416d":          Math.round(60000 / 943),    // 64 ms
  "pas:hk_g3":           Math.round(60000 / 350),    // 171 ms
  "pas:m16a1":           Math.round(60000 / 750),    // 80 ms
  "pas:m16a4":           Math.round(60000 / 400),    // 150 ms
  "pas:m4a1":            Math.round(60000 / 810),    // 74 ms
  "pas:mk14":            Math.round(60000 / 300),    // 200 ms
  "pas:qbz_191":         Math.round(60000 / 750),    // 80 ms
  "pas:qbz_95":          Math.round(60000 / 660),    // 91 ms
  "pas:scar_h":          Math.round(60000 / 570),    // 105 ms
  "pas:scar_l":          Math.round(60000 / 650),    // 92 ms
  "pas:sks_tactical":    Math.round(60000 / 510),    // 118 ms
  "pas:spr15hb":         Math.round(60000 / 700),    // 86 ms
  "pas:type_81":         Math.round(60000 / 630),    // 95 ms
  // TACZ SMGs
  "pas:hk_mp5a5":        Math.round(60000 / 820),    // 73 ms
  "pas:p90":             Math.round(60000 / 810),    // 74 ms
  "pas:ump45":           Math.round(60000 / 660),    // 91 ms
  // TACZ Shotguns
  "pas:aa12":            Math.round(60000 / 350),    // 171 ms
  "pas:db_long":         Math.round(60000 / 100),    // 600 ms
  "pas:db_short":        Math.round(60000 / 150),    // 400 ms
  "pas:m1014":           Math.round(60000 / 200),    // 300 ms
  "pas:m870":            Math.round(60000 / 180),    // 333 ms
  "pas:spas_12":         Math.round(60000 / 200),    // 300 ms
  // TACZ Snipers
  "pas:ai_awp":          Math.round(60000 / 171),    // 351 ms
  "pas:m107":            Math.round(60000 / 400),    // 150 ms
  "pas:m700":            Math.round(60000 / 180),    // 333 ms
  "pas:m95":             Math.round(60000 / 151),    // 397 ms
  // TACZ LMGs
  "pas:fn_evolys":       Math.round(60000 / 750),    // 80 ms
  "pas:m249":            Math.round(60000 / 750),    // 80 ms
  "pas:minigun":         Math.round(60000 / 1200),   // 50 ms
  "pas:rpk":             Math.round(60000 / 630),    // 95 ms
  // TACZ Launchers
  "pas:m320":            Math.round(60000 / 150),    // 400 ms
  "pas:rpg7":            Math.round(60000 / 150),    // 400 ms
  // TACZ Historical
  "pas:springfield1873": Math.round(60000 / 90),     // 667 ms
};

// Silah verileri — WEAPON_DAMAGE ve WEAPON_COOLDOWN'dan türetilir
// cooldown: ms → tick dönüşümü (1 tick = 50 ms)
const GUNS = (() => {
  const rangeMap = {
    // Original
    "pas:pistol": 30, "pas:rifle": 60, "pas:shotgun": 15, "pas:sniper": 120,
    // TACZ Pistols
    "pas:glock_17": 30, "pas:m1911": 30, "pas:deagle": 35, "pas:deagle_golden": 35,
    "pas:b93r": 25, "pas:cz75": 25, "pas:p320": 30, "pas:uzi": 20,
    "pas:vector45": 20, "pas:timeless50": 30,
    // TACZ Rifles
    "pas:ak47": 60, "pas:aug": 60, "pas:fn_fal": 70, "pas:g36k": 55,
    "pas:hk416a5": 60, "pas:hk416d": 60, "pas:hk_g3": 70, "pas:m16a1": 65,
    "pas:m16a4": 65, "pas:m4a1": 60, "pas:mk14": 80, "pas:qbz_191": 60,
    "pas:qbz_95": 60, "pas:scar_h": 70, "pas:scar_l": 60, "pas:sks_tactical": 75,
    "pas:spr15hb": 70, "pas:type_81": 60,
    // TACZ SMGs
    "pas:hk_mp5a5": 30, "pas:p90": 30, "pas:ump45": 30,
    // TACZ Shotguns
    "pas:aa12": 15, "pas:db_long": 18, "pas:db_short": 12,
    "pas:m1014": 15, "pas:m870": 15, "pas:spas_12": 15,
    // TACZ Snipers
    "pas:ai_awp": 120, "pas:m107": 150, "pas:m700": 120, "pas:m95": 150,
    // TACZ LMGs
    "pas:fn_evolys": 60, "pas:m249": 60, "pas:minigun": 50, "pas:rpk": 60,
    // TACZ Launchers
    "pas:m320": 40, "pas:rpg7": 50,
    // TACZ Historical
    "pas:springfield1873": 80,
  };
  const spreadMap = {
    "pas:pistol": 0.00, "pas:rifle": 0.00, "pas:shotgun": 0.35, "pas:sniper": 0.00,
    "pas:glock_17": 0.00, "pas:m1911": 0.00, "pas:deagle": 0.00, "pas:deagle_golden": 0.00,
    "pas:b93r": 0.02, "pas:cz75": 0.02, "pas:p320": 0.00, "pas:uzi": 0.03,
    "pas:vector45": 0.03, "pas:timeless50": 0.00,
    "pas:ak47": 0.01, "pas:aug": 0.01, "pas:fn_fal": 0.00, "pas:g36k": 0.01,
    "pas:hk416a5": 0.01, "pas:hk416d": 0.01, "pas:hk_g3": 0.00, "pas:m16a1": 0.01,
    "pas:m16a4": 0.00, "pas:m4a1": 0.01, "pas:mk14": 0.00, "pas:qbz_191": 0.01,
    "pas:qbz_95": 0.01, "pas:scar_h": 0.00, "pas:scar_l": 0.01, "pas:sks_tactical": 0.00,
    "pas:spr15hb": 0.00, "pas:type_81": 0.01,
    "pas:hk_mp5a5": 0.02, "pas:p90": 0.02, "pas:ump45": 0.02,
    "pas:aa12": 0.30, "pas:db_long": 0.25, "pas:db_short": 0.35,
    "pas:m1014": 0.28, "pas:m870": 0.28, "pas:spas_12": 0.28,
    "pas:ai_awp": 0.00, "pas:m107": 0.00, "pas:m700": 0.00, "pas:m95": 0.00,
    "pas:fn_evolys": 0.03, "pas:m249": 0.03, "pas:minigun": 0.05, "pas:rpk": 0.02,
    "pas:m320": 0.00, "pas:rpg7": 0.00, "pas:springfield1873": 0.00,
  };
  const result = {};
  for (const id of Object.keys(WEAPON_DAMAGE)) {
    const cdMs = WEAPON_COOLDOWN[id] ?? 200;
    result[id] = {
      damage:   WEAPON_DAMAGE[id],
      range:    rangeMap[id] ?? 50,
      cooldown: Math.max(1, Math.round(cdMs / 50)), // ms → ticks (1 tick = 50 ms)
      shots:    1,
      spread:   spreadMap[id] ?? 0.01
    };
  }
  // Original shotgun fires multiple pellets (no change to original mechanic)
  result["pas:shotgun"].shots = 6;
  return result;
})();

// Hikaye günlüğü içerikleri
const JOURNAL_CONTENT = {
  "pas:journal_bunker": [
    "§8--- SIĞINAK GÜNLÜĞü - Gün 1 ---",
    "§7Virüs Ankara'ya ulaştı. Hükümet yayını",
    "kesti. Komşularım sokağa çıkıyor...",
    "Sığınağı kapattım. Yeterince erzakım var.",
    "",
    "§8--- Gün 7 ---",
    "§7Elektrik kesildi. Dışarısı sessiz.",
    "Çok sessiz. Arada bir sesler duyuyorum.",
    "İnsanlar değil o sesler. Allah yardım etsin."
  ],
  "pas:journal_military": [
    "§8--- ASKERİ ÜS RAPORU - GİZLİ ---",
    "§7Bölge 4 düşmüş. Virüs yayılma hızı",
    "öngörülenden 10x fazla. Evacuation",
    "mümkün değil. Kalan personel: 0.",
    "",
    "§8--- Son not ---",
    "§7Eğer bunu okuyorsan — antidot",
    "laboratuvarda. Kat -2. Koridorun sonu.",
    "İyi şanslar. Hepimize iyi şanslar."
  ]
};

// Kırılabilir blok türleri (taş, toprak vs)
const BREAKABLE_BLOCKS = new Set([
  "minecraft:stone", "minecraft:cobblestone", "minecraft:dirt",
  "minecraft:gravel", "minecraft:sand", "minecraft:planks",
  "minecraft:log", "minecraft:wooden_slab", "minecraft:glass"
]);

// Bunker şablon verisi: [dx, dy, dz, blockId]
// Zemin (dy=0): taş tuğla plaka; iç oda (dy=1-3): hava; tavan (dy=4): taş tuğla
// Duvarlar (dx/dz extremes): taş tuğla
const BUNKER_TEMPLATE = (() => {
  const t = [];
  for (let dx = -4; dx <= 4; dx++) {
    for (let dy = 0; dy <= 4; dy++) {
      for (let dz = -4; dz <= 4; dz++) {
        const isShell = dx === -4 || dx === 4 || dz === -4 || dz === 4 || dy === 0 || dy === 4;
        t.push([dx, dy, dz, isShell ? "minecraft:stone_bricks" : "minecraft:air"]);
      }
    }
  }
  // Meşaleler
  for (const [ox, oz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
    t.push([ox, 1, oz, "minecraft:torch"]);
  }
  return t;
})();

// Şehir binası şablon üretici
function cityBuildingTemplate(w, d) {
  const t = [];
  for (let dx = 0; dx < w; dx++) {
    for (let dz = 0; dz < d; dz++) {
      for (let dy = 0; dy < 5; dy++) {
        const isWall = dx === 0 || dx === w - 1 || dz === 0 || dz === d - 1;
        if (!isWall) {
          if (dy === 0) t.push([dx, dy, dz, "minecraft:gray_concrete"]);
          continue;
        }
        // %30 hasar rasgelesi — gerçek zamanlı değil; her inşa dinamik kalmaya devam eder
        t.push([dx, dy, dz, dy < 3 ? "minecraft:stone_bricks" : "minecraft:cracked_stone_bricks"]);
      }
    }
  }
  return t;
}

// --- DURUMLAR ---
const infectionMap    = new Map(); // playerId -> { startTick, stage }
const bloodTrails     = new Map(); // playerId -> Array<{x,y,z,tick}>
const gunCooldowns    = new Map(); // playerId -> { [itemId]: lastFiredTick }
const tntPlanted      = new Set(); // entityId
const generatedChunks = new Set(); // "cx,cz"
let   tick            = 0;
let   bloodMoonOn     = false;

// =====================================================================
// 1. ENFEKSİYON SİSTEMİ
// =====================================================================

// Enfekte edebilen zombi türleri (infected hayvanlar + yeni zombiler dahil)
const INFECTING_TYPES = new Set([
  "pas:apocalypse_zombie", "pas:horde_zombie", "pas:tnt_zombie",
  "pas:infected_cow", "pas:infected_pig", "pas:infected_wolf",
  "pas:crawler_zombie", "pas:nighthunter_zombie",
  "pas:military_zombie", "pas:flesh_howler", "pas:juggernaut_zombie"
]);

world.afterEvents.entityHurt.subscribe((ev) => {
  const victim   = ev.hurtEntity;
  const attacker = ev.damageSource?.damagingEntity;
  if (victim.typeId !== "minecraft:player") return;
  if (!INFECTING_TYPES.has(attacker?.typeId)) return;
  if (infectionMap.has(victim.id)) return;

  infectionMap.set(victim.id, { startTick: tick, stage: -1 });
  victim.sendMessage("§c⚠ ENFEKSİYON! Zombi seni ısırdı! Antidot bul!");
});

function tickInfections() {
  for (const player of world.getPlayers()) {
    const data = infectionMap.get(player.id);
    if (!data) continue;

    const elapsed  = tick - data.startTick;
    const progress = Math.min(elapsed / INFECTION_DURATION_TICKS, 1.0);
    const stage    = Math.min(Math.floor(progress * 4), 3);

    if (stage !== data.stage) {
      data.stage = stage;
      const msgs = [
        "§e[Evre 1/4] Hafif titreme. Antidot kullan!",
        "§6[Evre 2/4] Görüş bozuluyor. Hastene!",
        "§c[Evre 3/4] Yavaşlama ve kriz. Zaman azalıyor!",
        "§4[Evre 4/4] KRİTİK — ANTIDOT KULLAN!"
      ];
      player.sendMessage(msgs[stage]);
    }

    if (tick % 100 === 0) {
      const effectSets = [
        ["effect @s mining_fatigue 6 0 false"],
        ["effect @s mining_fatigue 6 0 false", "effect @s blindness 4 0 false"],
        ["effect @s slowness 6 1 false", "effect @s mining_fatigue 6 1 false", "effect @s blindness 4 0 false"],
        ["effect @s slowness 6 2 false", "effect @s weakness 6 2 false", "effect @s nausea 6 0 false", "effect @s wither 6 1 false"]
      ];
      for (const cmd of effectSets[stage]) {
        player.runCommand(cmd).catch(e => console.error("[PAS] infection-effect:", e));
      }
    }

    if (tick % 60 === 0 && !bloodMoonOn) {
      const rem = Math.max(0, Math.ceil((INFECTION_DURATION_TICKS - elapsed) / 1200));
      player.onScreenDisplay.setActionBar(`§c[ENFEKSİYON] §e${rem} dk kaldı | Antidot kullan!`);
    }
  }
}

// =====================================================================
// 2. ITEM KULLANIMI (Antidot, Silahlar, Bombalar, Günlükler)
// =====================================================================

world.afterEvents.itemUse.subscribe((ev) => {
  const player = ev.source;
  const item   = ev.itemStack;
  if (!item) return;

  if (item.typeId === "pas:antidote") {
    handleAntidote(player);
  } else if (item.typeId === "pas:grenade") {
    handleGrenade(player);
    consumeItem(player);
  } else if (GUNS[item.typeId]) {
    handleGunFire(player, item.typeId);
  } else if (JOURNAL_CONTENT[item.typeId]) {
    showJournal(player, item.typeId);
  }
});

function handleAntidote(player) {
  if (!infectionMap.has(player.id)) {
    player.sendMessage("§7Enfekte değilsin.");
    return;
  }
  infectionMap.delete(player.id);
  player.runCommand("effect @s clear").catch(e => console.error("[PAS] antidote-clear:", e));
  player.runCommand("effect @s regeneration 100 2 false").catch(e => console.error("[PAS] antidote-regen:", e));
  player.runCommand("effect @s resistance 200 1 false").catch(e => console.error("[PAS] antidote-resist:", e));
  player.sendMessage("§a✓ Antidot etkili oldu! Enfeksiyondan kurtuldun!");
  player.onScreenDisplay.setActionBar("§a✓ ENFEKSİYONDAN KURTULDUN!");
  consumeItem(player);
}

function showJournal(player, itemId) {
  const lines = JOURNAL_CONTENT[itemId];
  if (!lines) return;
  player.sendMessage("§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const line of lines) player.sendMessage(line);
  player.sendMessage("§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

function consumeItem(player) {
  const eq = player.getComponent("equippable");
  if (!eq) return;
  const item = eq.getEquipment(EquipmentSlot.Mainhand);
  if (!item) return;
  if (item.amount > 1) {
    item.amount--;
    eq.setEquipment(EquipmentSlot.Mainhand, item);
  } else {
    eq.setEquipment(EquipmentSlot.Mainhand, undefined);
  }
}

// =====================================================================
// 3. SİLAH SİSTEMİ — Raycast + Cooldown
// =====================================================================

function handleGunFire(player, itemId) {
  const gun = GUNS[itemId];
  if (!gunCooldowns.has(player.id)) gunCooldowns.set(player.id, {});
  const cd    = gunCooldowns.get(player.id);
  const delta = tick - (cd[itemId] ?? 0);

  if (delta < gun.cooldown) {
    player.onScreenDisplay.setActionBar(`§c⟳ Şarj: ${((gun.cooldown - delta) / 20).toFixed(1)}s`);
    return;
  }
  cd[itemId] = tick;

  let hitCount = 0;

  for (let s = 0; s < gun.shots; s++) {
    const view = player.getViewDirection();
    const head = player.getHeadLocation();
    let dx = view.x, dy = view.y, dz = view.z;

    if (gun.spread > 0) {
      dx += (Math.random() - 0.5) * gun.spread;
      dy += (Math.random() - 0.5) * gun.spread;
      dz += (Math.random() - 0.5) * gun.spread;
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (len > 0) { dx /= len; dy /= len; dz /= len; }
    }

    const results = player.dimension.getEntitiesFromRay(
      head,
      { x: dx, y: dy, z: dz },
      { maxDistance: gun.range, excludeTypes: ["minecraft:player"] }
    );

    for (const hit of results) {
      if (!hit.entity) continue;
      hit.entity.applyDamage(gun.damage, {
        cause: EntityDamageCause.projectile,
        damagingEntity: player
      });
      hitCount++;
      break;
    }
  }

  const taczSounds = {
    "pas:glock_17": "pas.weapon.glock_17.fire",
    "pas:m1911": "pas.weapon.m1911.fire",
    "pas:deagle": "pas.weapon.deagle.fire",
    "pas:deagle_golden": "pas.weapon.deagle_golden.fire",
    "pas:b93r": "pas.weapon.b93r.fire",
    "pas:cz75": "pas.weapon.cz75.fire",
    "pas:p320": "pas.weapon.p320.fire",
    "pas:uzi": "pas.weapon.uzi.fire",
    "pas:vector45": "pas.weapon.vector45.fire",
    "pas:timeless50": "pas.weapon.timeless50.fire",
    "pas:ak47": "pas.weapon.ak47.fire",
    "pas:aug": "pas.weapon.aug.fire",
    "pas:fn_fal": "pas.weapon.fn_fal.fire",
    "pas:g36k": "pas.weapon.g36k.fire",
    "pas:hk416a5": "pas.weapon.hk416a5.fire",
    "pas:hk416d": "pas.weapon.hk416d.fire",
    "pas:hk_g3": "pas.weapon.hk_g3.fire",
    "pas:m16a1": "pas.weapon.m16a1.fire",
    "pas:m16a4": "pas.weapon.m16a4.fire",
    "pas:m4a1": "pas.weapon.m4a1.fire",
    "pas:mk14": "pas.weapon.mk14.fire",
    "pas:qbz_191": "pas.weapon.qbz_191.fire",
    "pas:qbz_95": "pas.weapon.qbz_95.fire",
    "pas:scar_h": "pas.weapon.scar_h.fire",
    "pas:scar_l": "pas.weapon.scar_l.fire",
    "pas:sks_tactical": "pas.weapon.sks_tactical.fire",
    "pas:spr15hb": "pas.weapon.spr15hb.fire",
    "pas:type_81": "pas.weapon.type_81.fire",
    "pas:hk_mp5a5": "pas.weapon.hk_mp5a5.fire",
    "pas:p90": "pas.weapon.p90.fire",
    "pas:ump45": "pas.weapon.ump45.fire",
    "pas:aa12": "pas.weapon.aa12.fire",
    "pas:db_long": "pas.weapon.db_long.fire",
    "pas:db_short": "pas.weapon.db_short.fire",
    "pas:m1014": "pas.weapon.m1014.fire",
    "pas:m870": "pas.weapon.m870.fire",
    "pas:spas_12": "pas.weapon.spas_12.fire",
    "pas:ai_awp": "pas.weapon.ai_awp.fire",
    "pas:m107": "pas.weapon.m107.fire",
    "pas:m700": "pas.weapon.m700.fire",
    "pas:m95": "pas.weapon.m95.fire",
    "pas:fn_evolys": "pas.weapon.fn_evolys.fire",
    "pas:m249": "pas.weapon.m249.fire",
    "pas:minigun": "pas.weapon.minigun.fire",
    "pas:rpk": "pas.weapon.rpk.fire",
    "pas:m320": "pas.weapon.m320.fire",
    "pas:rpg7": "pas.weapon.rpg7.fire",
    "pas:springfield1873": "pas.weapon.springfield1873.fire"
  };
  const snd = {
    "pas:pistol":  "random.orb",
    "pas:rifle":   "random.bow",
    "pas:shotgun": "ambient.weather.thunder",
    "pas:sniper":  "random.levelup"
  }[itemId] ?? taczSounds[itemId] ?? "random.bow";

  player.runCommand(`playsound ${snd} @s ~ ~ ~ 1 1.5`).catch(() => {});
  player.onScreenDisplay.setActionBar(
    hitCount > 0 ? `§e✓ HEDEF VURULDU (${gun.damage} hasar × ${hitCount})` : "§7Iskaladın!"
  );
}

function handleGrenade(player) {
  const view = player.getViewDirection();
  const head = player.getHeadLocation();
  const target = {
    x: Math.floor(head.x + view.x * 14),
    y: Math.floor(head.y + view.y * 14 + 1),
    z: Math.floor(head.z + view.z * 14)
  };
  player.dimension.spawnEntity("minecraft:tnt", target);
  player.runCommand("playsound random.fuse @s ~ ~ ~ 1 0.9").catch(() => {});
}

// =====================================================================
// 4. KAN İZİ — pas:blood_drop partikülü
// =====================================================================

function tickBloodTrail() {
  for (const player of world.getPlayers()) {
    const hc = player.getComponent("health");
    if (!hc || hc.currentValue >= BLOOD_HP_THRESHOLD) continue;

    const loc = player.location;

    // Kan partikülleri — pas:blood_drop, fallback vanilla
    for (let i = 0; i < 3; i++) {
      const px = loc.x + (Math.random() - 0.5) * 0.6;
      const pz = loc.z + (Math.random() - 0.5) * 0.6;
      const pLoc = { x: px, y: loc.y + 0.05, z: pz };
      try {
        player.dimension.spawnParticle("pas:blood_drop", pLoc);
      } catch (_) {
        // Partikül henüz yüklenmediyse sessizce geç; tekrar deneme sonraki tick'te
      }
    }

    // İz kaydet
    if (!bloodTrails.has(player.id)) bloodTrails.set(player.id, []);
    const trail = bloodTrails.get(player.id);
    trail.push({ x: loc.x, y: loc.y, z: loc.z, tick });

    // Süresi geçen izleri sil (5 dk)
    const cutoff  = tick - BLOOD_TRAIL_MAX_TICKS;
    const trimmed = trail.filter(p => p.tick > cutoff);
    bloodTrails.set(player.id, trimmed);

    // Zombileri uyar
    alertZombiesToBlood(player, loc);
  }
}

function alertZombiesToBlood(player, pos) {
  const nearZombies = player.dimension.getEntities({
    location: { x: pos.x, y: pos.y, z: pos.z },
    maxDistance: BLOOD_SMELL_RADIUS,
    families: ["zombie"]
  });
  for (const zombie of nearZombies) {
    if (zombie.typeId.startsWith("pas:")) {
      moveEntityToward(zombie, player.location, 4);
    }
  }
}

// =====================================================================
// 5. ZOMBİ BLOK KIRMA — Oyuncu ile Zombi Arasındaki Engel
// =====================================================================

function tickZombieBlockBreaking() {
  for (const player of world.getPlayers()) {
    const pLoc = player.location;

    const nearZombies = player.dimension.getEntities({
      location: pLoc,
      maxDistance: ZOMBIE_CALL_RADIUS / 2,
      families:  ["zombie"]
    });

    for (const zombie of nearZombies) {
      if (!zombie.typeId.startsWith("pas:")) continue;
      tryBreakBlockBetween(zombie, player);
    }
  }
}

function tryBreakBlockBetween(zombie, player) {
  const zLoc = zombie.location;
  const pLoc = player.location;

  // Oyuncuya giden çizgi üzerindeki komşu bloğu bul
  const dx = Math.sign(pLoc.x - zLoc.x);
  const dz = Math.sign(pLoc.z - zLoc.z);

  for (const [ox, oz] of [[dx, 0], [0, dz], [dx, dz]]) {
    const bx = Math.floor(zLoc.x) + ox;
    const by = Math.floor(zLoc.y + 1);  // Göğüs seviyesi
    const bz = Math.floor(zLoc.z) + oz;

    const block = zombie.dimension.getBlock({ x: bx, y: by, z: bz });
    if (!block) continue;

    const blockId = block.typeId;
    if (!BREAKABLE_BLOCKS.has(blockId)) continue;

    // Bloğu kır (havaya çevir)
    block.setPermutation(BlockPermutation.resolve("minecraft:air"));
    // Kırılan bloktan parçacık efekti
    try {
      zombie.dimension.spawnParticle("minecraft:destroy_block_effect", { x: bx + 0.5, y: by + 0.5, z: bz + 0.5 });
    } catch (_) {}  // Partikül opsiyonel — hata kritik değil
    return; // Her tick'te 1 zombi 1 blok kırar
  }
}

// =====================================================================
// 6. SÜRÜ (HORDE) SİSTEMİ — Deterministik hareket
// =====================================================================

function tickHorde() {
  for (const player of world.getPlayers()) {
    const pLoc = player.location;
    const nearZombies = player.dimension.getEntities({
      location: pLoc, maxDistance: ZOMBIE_CALL_RADIUS, families: ["zombie"]
    });
    if (nearZombies.length < 3) continue;

    const farZombies = player.dimension.getEntities({
      location: pLoc, maxDistance: ZOMBIE_CALL_RADIUS * 2, families: ["zombie"]
    });

    for (const z of farZombies) {
      if (z.typeId.startsWith("pas:")) moveEntityToward(z, pLoc, 4);
    }

    if (nearZombies.length >= 6) {
      player.sendMessage(`§c🧟 SÜRÜ! ${nearZombies.length} zombi saldırıyor!`);
      player.runCommand("playsound mob.zombie.infect @s ~ ~ ~ 2 0.4").catch(() => {});
    }
  }
}

function moveEntityToward(entity, target, step) {
  const l  = entity.location;
  const dx = target.x - l.x;
  const dz = target.z - l.z;
  const d  = Math.sqrt(dx*dx + dz*dz);
  if (d < 2) return;
  const r = Math.min(step / d, 1);
  entity.teleport(
    { x: l.x + dx * r, y: l.y, z: l.z + dz * r },
    { dimension: entity.dimension, keepVelocity: false }
  );
}

// =====================================================================
// 7. KAN AYI (BLOOD MOON)
// =====================================================================

function tickBloodMoon() {
  const time = world.getTimeOfDay();
  const day  = world.getDay();
  const isNight      = time > BLOOD_MOON_START && time < BLOOD_MOON_END;
  const isBloodNight = day > 0 && (day % BLOOD_MOON_PERIOD === 0);

  if (isBloodNight && isNight && !bloodMoonOn) {
    bloodMoonOn = true;
    for (const player of world.getPlayers()) {
      player.sendMessage("§4☽ KAN AYI! Sürüler yürüyüşe geçiyor!");
      player.runCommand("playsound ambient.weather.thunder @s ~ ~ ~ 3 0.3").catch(() => {});
      const loc = player.location;
      // 18 horde zombi halka şeklinde çevrede
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const dist  = 40 + Math.random() * 20;
        const sx    = Math.floor(loc.x + Math.cos(angle) * dist);
        const sz    = Math.floor(loc.z + Math.sin(angle) * dist);
        player.dimension.runCommand(`summon pas:horde_zombie ${sx} ~ ${sz}`)
                        .catch(e => console.error("[PAS] blood-moon horde spawn:", e));
      }
      // 3 TNT zombi orta mesafede
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        const sx = Math.floor(loc.x + Math.cos(a) * 50);
        const sz = Math.floor(loc.z + Math.sin(a) * 50);
        player.dimension.runCommand(`summon pas:tnt_zombie ${sx} ~ ${sz}`)
                        .catch(e => console.error("[PAS] blood-moon tnt spawn:", e));
      }
      // 2 nighthunter uzaktan hızla yaklaşıyor
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        const sx = Math.floor(loc.x + Math.cos(a) * 70);
        const sz = Math.floor(loc.z + Math.sin(a) * 70);
        player.dimension.runCommand(`summon pas:nighthunter_zombie ${sx} ~ ${sz}`)
                        .catch(e => console.error("[PAS] blood-moon nighthunter spawn:", e));
      }
      // 1 juggernaut, kan ayı başına
      {
        const a = Math.random() * Math.PI * 2;
        const sx = Math.floor(loc.x + Math.cos(a) * 55);
        const sz = Math.floor(loc.z + Math.sin(a) * 55);
        player.dimension.runCommand(`summon pas:juggernaut_zombie ${sx} ~ ${sz}`)
                        .catch(e => console.error("[PAS] blood-moon juggernaut spawn:", e));
      }
      // 1 flesh howler — sürüyü çağırmak için
      {
        const a = Math.random() * Math.PI * 2;
        const sx = Math.floor(loc.x + Math.cos(a) * 45);
        const sz = Math.floor(loc.z + Math.sin(a) * 45);
        player.dimension.runCommand(`summon pas:flesh_howler ${sx} ~ ${sz}`)
                        .catch(e => console.error("[PAS] blood-moon howler spawn:", e));
      }
    }
  } else if ((!isBloodNight || !isNight) && bloodMoonOn) {
    bloodMoonOn = false;
    for (const p of world.getPlayers()) p.sendMessage("§a☀ Kan Ayı bitti. Hayatta kaldın!");
  }
}

// =====================================================================
// 8A. FLESH HOWLER — Yakın zombileri çağırma çığlığı
// =====================================================================

const HOWLER_COOLDOWNS = new Map(); // entityId -> lastHowlTick
const HOWLER_HOWL_INTERVAL = 400;  // Her ~20 saniyede bir
const HOWLER_SUMMON_RADIUS  = 30;
const HOWLER_SUMMON_COUNT   = 4;

function tickFleshHowler() {
  let howlers;
  try {
    howlers = world.getDimension("overworld").getEntities({ type: "pas:flesh_howler" });
  } catch (e) { return; }

  for (const howler of howlers) {
    const lastHowl = HOWLER_COOLDOWNS.get(howler.id) ?? 0;
    if (tick - lastHowl < HOWLER_HOWL_INTERVAL) continue;

    // Yalnızca bir oyuncu yakınsa ulur
    const nearPlayers = howler.dimension.getEntities({
      location: howler.location, maxDistance: 40, type: "minecraft:player"
    });
    if (nearPlayers.length === 0) continue;

    HOWLER_COOLDOWNS.set(howler.id, tick);
    howler.runCommand("playsound mob.wolf.howl @a ~ ~ ~ 2 0.6").catch(() => {});

    // Etrafta yeni zombi çağır
    const loc = howler.location;
    const spawnTypes = ["pas:horde_zombie", "pas:apocalypse_zombie", "pas:crawler_zombie"];
    for (let i = 0; i < HOWLER_SUMMON_COUNT; i++) {
      const a  = Math.random() * Math.PI * 2;
      const d  = 15 + Math.random() * 15;
      const sx = Math.floor(loc.x + Math.cos(a) * d);
      const sz = Math.floor(loc.z + Math.sin(a) * d);
      const t  = spawnTypes[Math.floor(Math.random() * spawnTypes.length)];
      howler.dimension.runCommand(`summon ${t} ${sx} ~ ${sz}`)
            .catch(e => console.error("[PAS] howler summon:", e));
    }
    // Mesaj
    nearPlayers[0].sendMessage("§5🐺 Flesh Howler uluyarak sürüyü çağırıyor!");
  }
}

// =====================================================================
// 8. TNT ZOMBİ — Blok Kırma + Bomba Yerleştirme
// =====================================================================

function tickTntZombies() {
  let zombies;
  try {
    zombies = world.getDimension("overworld").getEntities({ type: "pas:tnt_zombie" });
  } catch (e) {
    console.error(`[PAS] TNT zombie query failed: ${e}`);
    return;
  }

  for (const zombie of zombies) {
    if (tntPlanted.has(zombie.id)) continue;

    // Engel blok kırma — hedefe giderken yolu temizle
    const nearPlayers = zombie.dimension.getEntities({
      location: zombie.location, maxDistance: TNT_PLANT_RADIUS, type: "minecraft:player"
    });

    if (nearPlayers.length === 0) {
      // Oyuncuya giden engelleri kır
      const farthest = zombie.dimension.getEntities({
        location: zombie.location, maxDistance: 30, type: "minecraft:player"
      });
      if (farthest.length > 0) tryBreakBlockBetween(zombie, farthest[0]);
      continue;
    }

    // Oyuncuya yetişince primed TNT entity spawn et
    const zLoc = zombie.location;

    // Hazır (primed) TNT entity spawn et — blok koyma yerine entity, garantili patlama
    try {
      const tntLoc = { x: Math.floor(zLoc.x) + 0.5, y: Math.floor(zLoc.y) + 0.5, z: Math.floor(zLoc.z) + 0.5 };
      zombie.dimension.spawnEntity("minecraft:tnt", tntLoc);
      tntPlanted.add(zombie.id);
      nearPlayers[0].sendMessage("§c💣 TNT Zombi bomba bıraktı — KAÇ!");
      nearPlayers[0].runCommand("playsound random.fuse @s ~ ~ ~ 2 0.8").catch(() => {});
      // Zombi patlama bölgesinden hızla kaçsın
      zombie.runCommand("effect @s speed 30 3 false").catch(e => console.error("[PAS] tnt-zombie-speed:", e));
      moveEntityToward(zombie, {
        x: zLoc.x - (nearPlayers[0].location.x - zLoc.x) * 2,
        y: zLoc.y,
        z: zLoc.z - (nearPlayers[0].location.z - zLoc.z) * 2
      }, 6);
    } catch (e) {
      console.error(`[PAS] TNT spawn failed: ${e}`);
    }
  }
}

// =====================================================================
// 9. RADYASYON BÖLGESİ (Y < -40)
// =====================================================================

function tickRadiation() {
  for (const player of world.getPlayers()) {
    if (player.dimension.id !== "minecraft:overworld") continue;
    if (player.location.y >= RAD_Y_LIMIT) continue;
    if (playerHasHazmat(player)) continue;

    player.applyDamage(1, { cause: EntityDamageCause.magic });
    player.runCommand("effect @s nausea 10 0 false").catch(e => console.error("[PAS] rad-nausea:", e));
    player.runCommand("effect @s weakness 10 0 false").catch(e => console.error("[PAS] rad-weakness:", e));
    player.sendMessage("§2☢ RADYASYON! Koruyucu ekipman olmadan bu derinliğe inemezsin!");
  }
}

function playerHasHazmat(player) {
  const eq = player.getComponent("equippable");
  if (!eq) return false;
  const head  = eq.getEquipment(EquipmentSlot.Head);
  const chest = eq.getEquipment(EquipmentSlot.Chest);
  return head?.typeId === "pas:military_helmet" || chest?.typeId === "pas:steel_vest";
}

// =====================================================================
// 10. GÜN SAYACI HUD
// =====================================================================

function tickDayHUD() {
  const time = world.getTimeOfDay();
  const day  = world.getDay() + 1;
  const lbl  = time < 6000 ? "☀ Sabah" : time < 12000 ? "☀ Öğle" : time < 13000 ? "🌅 Akşam" : "☾ Gece";
  const nextBM = BLOOD_MOON_PERIOD - ((day - 1) % BLOOD_MOON_PERIOD);
  const note   = bloodMoonOn ? " §4[KAN AYI!]" : nextBM === 1 ? " §6[YARIN KAN AYI!]" : "";

  for (const player of world.getPlayers()) {
    if (infectionMap.has(player.id) && tick % 60 !== 0) continue;
    player.onScreenDisplay.setActionBar(`§e[Gün ${day}] §7${lbl}${note}`);
  }
}

// =====================================================================
// 11. YAPI OLUŞTURMA — Bunker, Askeri Üs, Terk Edilmiş Şehir
// Sandıklar ItemStack ile doldurulur (container API)
// =====================================================================

/**
 * Sandık oluştur ve içini loot listesiyle doldur.
 * @param {Dimension} dim
 * @param {{x,y,z}} loc
 * @param {Array<{typeId:string, count?:number}>} loot
 */
function placeChestWithLoot(dim, loc, loot) {
  const block = dim.getBlock(loc);
  if (!block) return;
  block.setPermutation(BlockPermutation.resolve("minecraft:chest"));
  // Container erişimi için kısa gecikme (blok state güncellenmeli)
  system.runTimeout(() => {
    const b2  = dim.getBlock(loc);
    const inv = b2?.getComponent("minecraft:inventory");
    if (!inv) return;
    const cont = inv.container;
    if (!cont) return;
    let slot = 0;
    for (const entry of loot) {
      if (slot >= cont.size) break;
      const count = entry.count ?? 1;
      cont.setItem(slot, new ItemStack(entry.typeId, count));
      slot++;
    }
  }, 5);
}

// ZE yapı isimleri — davranış paketinin structures/ klasöründen
const ZE_STRUCTURES = [
  "gas_station1", "caff", "modern_house1", "lighthouse",
  "ruin1", "ruin2", "ruin3", "ruin4", "ruin5", "build1"
];

function placeZeStructure(dim, loc, structName) {
  const x = Math.floor(loc.x);
  const y = Math.floor(loc.y);
  const z = Math.floor(loc.z);
  dim.runCommand(`structure load "${structName}" ${x} ${y} ${z} 0_degrees none false false`)
     .catch(e => console.error(`[PAS] structure load ${structName}:`, e));
}

function tryGenerateStructures(player) {
  const loc = player.location;
  const cx  = Math.floor(loc.x / 32);
  const cz  = Math.floor(loc.z / 32);
  const key = `${cx},${cz}`;
  if (generatedChunks.has(key)) return;
  generatedChunks.add(key);

  const absCx = Math.abs(cx) + Math.abs(cz);

  if (absCx % 5 === 0) system.runTimeout(() => generateBunker(player.dimension, loc), 20);
  if (absCx % 8 === 0) system.runTimeout(() => generateMilitaryBase(player.dimension, loc), 40);
  if (absCx % 6 === 0) system.runTimeout(() => generateAbandonedCity(player.dimension, loc), 60);

  // ZE harita yapıları — her 7. bölmede rastgele biri yerleştir
  if (absCx % 7 === 0) {
    const structName = ZE_STRUCTURES[absCx % ZE_STRUCTURES.length];
    system.runTimeout(() => placeZeStructure(player.dimension, loc, structName), 80);
  }
}

function generateBunker(dim, refLoc) {
  const cx = Math.floor(refLoc.x);
  const cz = Math.floor(refLoc.z);
  const by = Math.floor(refLoc.y) - 8;  // Yüzeyin 8 blok altı

  // Şablon verisinden blok yerleştir
  for (const [dx, dy, dz, blockId] of BUNKER_TEMPLATE) {
    const block = dim.getBlock({ x: cx + dx, y: by + dy, z: cz + dz });
    if (!block) continue;
    const perm = BlockPermutation.resolve(blockId);
    if (perm) block.setPermutation(perm);
  }

  // Sandık — bunker loot (şablon konumunda sabit)
  placeChestWithLoot(dim, { x: cx + 2, y: by + 1, z: cz + 2 }, [
    { typeId: "pas:antidote",        count: 2 },
    { typeId: "pas:pistol",          count: 1 },
    { typeId: "pas:military_helmet", count: 1 },
    { typeId: "minecraft:bread",     count: 5 },
    { typeId: "minecraft:iron_ingot",count: 6 },
    { typeId: "pas:journal_bunker",  count: 1 },
    { typeId: "minecraft:torch",     count: 8 }
  ]);

  // Bekçi zombi
  dim.runCommand(`summon pas:apocalypse_zombie ${cx} ${by + 1} ${cz - 5}`)
     .catch(e => console.error("[PAS] bunker zombie summon:", e));
}

function generateMilitaryBase(dim, refLoc) {
  const cx = Math.floor(refLoc.x) + 20;
  const cz = Math.floor(refLoc.z) + 20;
  const by = Math.floor(refLoc.y);

  // Çevre duvarı — taş tuğla (giriş kapısı açık)
  for (let dx = -7; dx <= 7; dx++) {
    for (let dy = 0; dy <= 3; dy++) {
      for (let dz = -7; dz <= 7; dz++) {
        if (dx !== -7 && dx !== 7 && dz !== -7 && dz !== 7) continue;
        if (dz === -7 && Math.abs(dx) <= 1 && dy < 3) continue;  // Kapı boşluğu
        const b = dim.getBlock({ x: cx + dx, y: by + dy, z: cz + dz });
        if (b) b.setPermutation(BlockPermutation.resolve("minecraft:stone_bricks"));
      }
    }
  }

  // Zemin — taş döşeme
  for (let dx = -6; dx <= 6; dx++) {
    for (let dz = -6; dz <= 6; dz++) {
      const b = dim.getBlock({ x: cx + dx, y: by, z: cz + dz });
      if (b) b.setPermutation(BlockPermutation.resolve("minecraft:smooth_stone"));
    }
  }

  // Merkez sandık — askeri loot
  placeChestWithLoot(dim, { x: cx, y: by + 1, z: cz }, [
    { typeId: "pas:rifle",              count: 1 },
    { typeId: "pas:shotgun",            count: 1 },
    { typeId: "pas:grenade",            count: 3 },
    { typeId: "pas:steel_vest",         count: 1 },
    { typeId: "pas:antidote",           count: 1 },
    { typeId: "minecraft:golden_apple", count: 1 },
    { typeId: "pas:journal_military",   count: 1 }
  ]);

  // Kamp zombileri (askeri üs: military + crawler + tnt)
  for (let i = 0; i < 3; i++) {
    const a  = (i / 3) * Math.PI * 2;
    const sx = Math.floor(cx + Math.cos(a) * 5);
    const sz = Math.floor(cz + Math.sin(a) * 5);
    dim.runCommand(`summon pas:military_zombie ${sx} ${by + 1} ${sz}`)
       .catch(e => console.error("[PAS] military zombie summon:", e));
  }
  dim.runCommand(`summon pas:crawler_zombie ${cx + 3} ${by + 1} ${cz + 3}`)
     .catch(e => console.error("[PAS] military crawler summon:", e));
  dim.runCommand(`summon pas:tnt_zombie ${cx} ${by + 1} ${cz + 6}`)
     .catch(e => console.error("[PAS] military tnt_zombie summon:", e));
}

function generateAbandonedCity(dim, refLoc) {
  // Terk edilmiş şehir: 3 hasar görmüş bina + enkaz + cadde sandığı
  const baseCx = Math.floor(refLoc.x) - 30;
  const baseCz = Math.floor(refLoc.z) - 30;
  const by     = Math.floor(refLoc.y);

  const buildings = [
    { ox: 0,  oz: 0,  w: 8,  d: 8  },
    { ox: 14, oz: 0,  w: 6,  d: 10 },
    { ox: 0,  oz: 14, w: 10, d: 6  }
  ];

  for (const bld of buildings) {
    const bx = baseCx + bld.ox;
    const bz = baseCz + bld.oz;
    const template = cityBuildingTemplate(bld.w, bld.d);

    for (const [dx, dy, dz, blockId] of template) {
      // %30 hasar efekti — duvar bloklarını rastgele atla
      if (blockId !== "minecraft:gray_concrete" && Math.random() < 0.30) continue;
      const b = dim.getBlock({ x: bx + dx, y: by + dy, z: bz + dz });
      if (b) b.setPermutation(BlockPermutation.resolve(blockId));
    }

    // Enkaz — çakıl + kum saçılımı
    const debrisBlocks = ["minecraft:gravel", "minecraft:sand", "minecraft:cobblestone"];
    for (let i = 0; i < 6; i++) {
      const rx = bx + Math.floor(Math.random() * bld.w);
      const rz = bz + Math.floor(Math.random() * bld.d);
      const rb = dim.getBlock({ x: rx, y: by + 1, z: rz });
      if (rb) rb.setPermutation(BlockPermutation.resolve(debrisBlocks[Math.floor(Math.random() * debrisBlocks.length)]));
    }

    // Zombi sakinleri
    dim.runCommand(`summon pas:apocalypse_zombie ${bx + Math.floor(bld.w / 2)} ${by + 1} ${bz + Math.floor(bld.d / 2)}`)
       .catch(e => console.error("[PAS] city zombie summon:", e));
  }

  // Cadde loot sandığı
  placeChestWithLoot(dim, { x: baseCx + 6, y: by + 1, z: baseCz + 6 }, [
    { typeId: "minecraft:bread",       count: 3 },
    { typeId: "minecraft:iron_ingot",  count: 4 },
    { typeId: "pas:grenade",           count: 2 },
    { typeId: "minecraft:torch",       count: 6 },
    { typeId: "pas:glock_17",          count: 1 },
    { typeId: "pas:journal_military",  count: 1 }
  ]);
}

// =====================================================================
// 12. OYUNCU SPAWN
// =====================================================================

world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  system.runTimeout(() => {
    const p = ev.player;
    p.sendMessage("§8══════════════════════════════════");
    p.sendMessage("§c   POST-APOKALİPTİK HAYATTA KALMA   ");
    p.sendMessage("§8══════════════════════════════════");
    p.sendMessage("§7Yıl 2047. Virüs yeryüzünü ele geçirdi.");
    p.sendMessage("§e→ Zombi ısırığı = 60 dk'lık enfeksiyon");
    p.sendMessage("§e→ Antidot ile tedavi ol");
    p.sendMessage("§4→ Kan Ayı: Her 7. gece sürü hücum eder!");
    p.sendMessage("§2→ Y=-40 altı: Radyasyon! Kask/Yelek giy.");
    p.sendMessage("§8══════════════════════════════════");
    p.runCommand("give @s minecraft:bread 8").catch(e => console.error("[PAS] give-bread:", e));
    p.runCommand("give @s minecraft:wooden_sword 1").catch(e => console.error("[PAS] give-sword:", e));
    p.runCommand("give @s minecraft:torch 16").catch(e => console.error("[PAS] give-torch:", e));
  }, 60);
});

// =====================================================================
// 13. ÖLÜM — Durum temizleme
// =====================================================================

world.afterEvents.entityDie.subscribe((ev) => {
  if (ev.deadEntity.typeId !== "minecraft:player") return;
  const id = ev.deadEntity.id;
  infectionMap.delete(id);
  bloodTrails.delete(id);
  gunCooldowns.delete(id);
});

// =====================================================================
// 14. ANA TICK DÖNGÜSÜ
// =====================================================================

system.runInterval(() => {
  tick++;

  if (tick % 20 === 0)                      tickInfections();
  if (tick % BLOOD_TRAIL_INTERVAL === 0)    tickBloodTrail();
  if (tick % HORDE_CHECK_INTERVAL === 0)    tickHorde();
  if (tick % BLOCK_BREAK_INTERVAL === 0)    tickZombieBlockBreaking();
  if (tick % 100 === 0)                     tickBloodMoon();
  if (tick % 20 === 0)                      tickTntZombies();
  if (tick % 100 === 0)                     tickFleshHowler();
  if (tick % HUD_INTERVAL === 0)            tickDayHUD();
  if (tick % RAD_INTERVAL === 0)            tickRadiation();
  if (tick % GEN_INTERVAL === 0) {
    for (const player of world.getPlayers()) tryGenerateStructures(player);
  }
}, 1);
