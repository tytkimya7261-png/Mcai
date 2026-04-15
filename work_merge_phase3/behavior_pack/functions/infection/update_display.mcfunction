# INFECTION SYSTEM - Update display
# Updates actionbar with remaining time

# Display time remaining (approximate from ticks to minutes)
# scoreboard players display shows actual ticker value
title @s actionbar [{"text":"§c§l⚠ INFECTED - "},{"score":{"name":"@s","objective":"infection_timer"},"color":"red"},{"text":" ticks remaining"}]
