# BUNKER INITIALIZATION - Safe Zone at Spawn
# Runs once at world start, creates 50-block safe zone with spawn protection

# Kill existing bunker entities (if any)
execute @e[name="BunkerController"] ~~~ kill @s

# Spawn bunker controller
summon mcai:bunker_controller 0 65 0

# Create safe zone effect (50-block radius)
execute @a ~~~ effect @a[r=50] regeneration 999999 10 true
execute @a ~~~ effect @a[r=50] resistance 999999 10 true
execute @a ~~~ effect @a[r=50] night_vision 999999 0 true

# Load bunker structure
setblock 0 64 0 structure_block 0
structure load mcai:bunker 0 64 0

# Bunker loot chest setup
setblock 5 65 5 chest
fill 6 65 5 6 65 5 air
loot insert 5 65 5 loot mcai:bunker_loot

# Safe zone notification
title @a actionbar §6§lSAFE ZONE ACTIVATED - You are protected
