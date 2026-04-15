# MILITARY BASE SPAWNER
# Triggered when players explore surface world
# Spawns military bases with 3% probability at suitable locations

# Check if player is at surface (y > 62)
execute @a[y=62,dy=200] ~~~ execute if score military_spawn_timer global matches ..0 ~~~ function mcai:spawn_military_structure

# Reset timer
scoreboard players set military_spawn_timer global 100
