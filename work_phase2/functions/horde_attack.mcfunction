# HORDE/SÜRÜ - Coordinated attack
# Executed during horde attack phase

# Find nearest player
execute as @e[type=zombie,tag=horde_member] at @s as @a[distance=0..50] run function horde_attack/target_player

# Emit attack particles
particle minecraft:smoke ~ ~1 ~

# Play aggressive sounds
playsound entity.zombie.aggro @a[distance=0..50]

# Boost zombie movement speed temporarily
effect @e[type=zombie,tag=horde_member] speed 40 3
