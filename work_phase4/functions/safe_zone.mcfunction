# SAFE ZONE MAINTENANCE
# Continuous protection for 50-block bunker area
# Prevents hostile spawns, provides health regen

# Kill hostiles in safe zone
kill @e[type=zombie,r=50,m=!c]
kill @e[type=drowned,r=50,m=!c]
kill @e[type=husk,r=50,m=!c]
kill @e[type=zombie_villager,r=50,m=!c]

# Maintain protection effects
effect @a[r=50] regeneration 60 10 true
effect @a[r=50] resistance 60 10 true

# Environmental safety
weather clear
