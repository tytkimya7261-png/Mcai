# LABORATORY SPAWNER (RARE)
# Spawns laboratories deep underground (Y: 20-30)
# 0.5% spawn chance, maximum 3 labs per world

execute @a[y=0,dy=20] ~~~ execute if score laboratory_count global matches ..2 ~~~ function mcai:spawn_lab_structure

# Lab containment effects
execute @e[family=laboratory] ~~~ effect @a[r=64] slowness 15 1 false
execute @e[family=laboratory] ~~~ effect @a[r=64] jump_boost 15 1 false
