import { useFrame } from "@react-three/fiber";
import { world } from "../state/world";
import { input } from "../input";
import { useQuests } from "../../state/questStore";
import { useProgression } from "../../state/progressionStore";
import { useInventory } from "../../state/inventoryStore";
import { NPCS } from "../entities/Npcs";

export default function NpcSystem() {
  useFrame(() => {
    const progOpen = useProgression.getState().treeOpen || useInventory.getState().invOpen;
    if (progOpen) {
      input.consumePress("KeyE");
      return;
    }
    if (useQuests.getState().dialogNpc !== null) {
      input.consumePress("KeyE");
      return;
    }
    if (!input.consumePress("KeyE")) return;
    if (!world.player.alive) return;
    for (const npc of NPCS) {
      const d = Math.hypot(world.player.pos.x - npc.pos[0], world.player.pos.z - npc.pos[2]);
      if (d < 3.2) {
        useQuests.getState().setDialog(npc.id);
        break;
      }
    }
  });
  return null;
}
