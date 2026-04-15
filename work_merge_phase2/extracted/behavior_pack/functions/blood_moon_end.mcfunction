# BLOOD MOON EVENT - Event end
# Cleanup and finish blood moon event

# Remove blood moon markers
kill @e[tag=blood_moon_zombie]

# Clear event active flag
scoreboard players set @a blood_moon_active 0
scoreboard players set @a wave_counter 0

# Broadcast end message
title @a title {"text":"§a§l=== BLOOD MOON ENDED ===","color":"dark_green"}
title @a subtitle {"text":"§aYou survived the night... for now.","color":"green"}

# Healing effect
effect @a regeneration 60 1

# Play victory sound
playsound entity.player.levelup @a

# Display stats
tellraw @a {"text":"","extra":[{"text":"Event ended. Prepare for the next blood moon..."}]}
