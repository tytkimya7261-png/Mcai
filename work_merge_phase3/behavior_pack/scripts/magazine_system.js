
import { world, EntityComponentTypes } from '@minecraft/server';

export class MagazineSystem {
  constructor() {
    this.magazineCapacity = { '9mm': 30, '556nato': 30, '762x39': 30, '338lapua': 20, '12gauge': 8, 'grenade': 6 };
  }
  
  onReload(player, magazineType) {
    const capacity = this.magazineCapacity[magazineType] || 30;
    const obj = world.scoreboard.getObjective('ammo') || world.scoreboard.addObjective('ammo');
    obj.setScore(player, capacity);
    return true;
  }
}

export const magazineSystem = new MagazineSystem();
