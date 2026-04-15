# METRO TUNNEL SPAWNER
# Spawns metro tunnels underground (Y: 30-45)
# 2% spawn rate per chunk, underground_only

execute @a[y=20,dy=25] ~~~ execute if score metro_spawn_timer global matches ..0 ~~~ function mcai:spawn_metro_structure

# Tunnel effects
execute @e[family=metro_tunnel] ~~~ effect @a[r=64] mining_fatigue 10 1 false
execute @e[family=metro_tunnel] ~~~ effect @a[r=64] darkness 20 1 false
