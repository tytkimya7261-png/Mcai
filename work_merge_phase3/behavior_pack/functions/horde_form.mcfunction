# HORDE/SÜRÜ - Form horde cluster
# Initialize horde formation around spotted zombie

# Tag nearby zombies as horde members
tag @a[tag=horde_lead] add horde_member

# Apply horde effects (speed boost)
effect @e[type=zombie,tag=horde_member] speed 200 2

# Apply strength effect (faster attacks)
effect @e[type=zombie,tag=horde_member] strength 200 0

# Broadcast horde formation
title @a[distance=0..64] title {"text":"§c§l⚠ ZOMBIE HORDE FORMING!","color":"dark_red"}
title @a[distance=0..64] subtitle {"text":"§f§lZombies are coordinating their attack!"}

# Play horde sound
execute positioned ~ ~ ~ run playsound ambient.weather.thunder @a[distance=0..64]
