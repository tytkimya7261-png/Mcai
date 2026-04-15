# BLOOD TRACKING - Emit blood particles
# Run when player is wounded

# Red dripping particles
particle minecraft:redstone ~ ~1 ~

# Occasional blood splatter
execute if predicate 10% run particle minecraft:redstone ~ ~1 ~ 0.3 0.3 0.3 1 5

# Update wound status
title @s actionbar [{"text":"§c§lWOUNDED - Zombies can smell your blood!"}]

# Play wound sound
playsound entity.player.hurt @s
