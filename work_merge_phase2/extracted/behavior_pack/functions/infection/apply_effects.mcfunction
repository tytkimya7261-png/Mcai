# INFECTION SYSTEM - Apply infection effects
# Called when player is infected

# Apply visual effects
effect @s slowness 1 1

# Red particle emission (handled by JavaScript)
particle minecraft:redstone ^ ^ ^

# Actionbar message
title @s actionbar {"text":"§c⚠ INFECTION ACTIVE - Seek antidote!"}

# Play sound effect
playsound ambient.weather.thunder @s

# Reduce movement speed
attribute @s minecraft:movement_speed modifier add infection_slow -0.1 multiply
