import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../state/world";
import { collectDrop } from "../loot";
import { useInventory } from "../../state/inventoryStore";

const toPlayer = new THREE.Vector3();

export default function LootSystem() {
  useFrame((_, raw) => {
    if (useInventory.getState().invOpen) return;
    const dt = Math.min(raw, 0.05) * world.timeScale;
    if (dt <= 0 || world.drops.length === 0) return;
    const p = world.player.pos;
    const alive = world.player.alive;
    for (let i = world.drops.length - 1; i >= 0; i--) {
      const d = world.drops[i];
      d.life -= dt;
      if (d.life <= 0) {
        world.drops.splice(i, 1);
        world.dropVersion++;
        continue;
      }
      if (!alive) continue;
      toPlayer.copy(p).sub(d.pos).setY(0);
      const dist = toPlayer.length();
      if (dist < 3.5) {
        toPlayer.normalize();
        d.pos.addScaledVector(toPlayer, Math.min(dist, 9 * dt));
      }
      if (dist < 1.1) collectDrop(d.id);
    }
  });
  return null;
}
