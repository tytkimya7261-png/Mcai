# BLOOD MOON EVENT - Event startup
# Initialize blood moon event

# Clear previous event markers
scoreboard players set @a blood_moon_active 0
scoreboard players set @a wave_counter 0

# Set event active
scoreboard players set @a blood_moon_active 1

# Broadcast start message
title @a title {"text":"§c§l=== BLOOD MOON ===","bold":true,"color":"dark_red"}
title @a subtitle {"text":"§f§lThe moon turns blood red. Defend yourselves!","color":"red"}

# Play ominous sound
playsound intentionally.quiet @a

# Darkness effect
effect @a darkness 30 0

# Summon initial zombie wave (20 zombies per player)
execute as @a run summon minecraft:zombie ~ ~ ~ {Tags:["blood_moon_zombie"]}
