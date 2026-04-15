# INFECTION SYSTEM - Cure player
# Called when player uses antidote

# Clear infection
scoreboard players set @s infection_timer 0
scoreboard players set @s infection_status 0

# Remove slowness effect
effect @s slowness 0

# Play healing sound
playsound mob.wither.break @s

# Show healing particles
particle minecraft:heart ^ ^ ^

# Actionbar message
title @s actionbar {"text":"§a✓ Infection cured!"}

# Remove attribute modifier
attribute @s minecraft:movement_speed modifier remove infection_slow
