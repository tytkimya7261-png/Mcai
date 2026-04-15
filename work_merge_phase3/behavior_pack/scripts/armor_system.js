
import { world, EntityComponentTypes } from '@minecraft/server';

export class ArmorSystem {
  applyHelmetEffects(player) {
    player.addEffect('night_vision', 20);
    return true;
  }
  
  applyVestEffects(player) {
    player.addEffect('resistance', 1);
    return true;
  }
}

export const armorSystem = new ArmorSystem();
