# INFECTION SYSTEM - Tick Update Function
# Run every tick to update infection timers and effects

# Update infection timer display for all players
scoreboard players add @a infection_timer 0

# Apply infection effects to infected players
execute as @a[scores={infection_status=1}] run function infection/apply_effects

# Check for infection cure
execute as @a[nbt={SelectedItem:{id:"mypack:antidote"}}] run function infection/cure_player

# Update infection status display
execute as @a[scores={infection_timer=0..}] run function infection/update_display
