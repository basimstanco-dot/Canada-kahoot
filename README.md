# Voxel Vibecraft (Iteration 1)

Base d'un moteur voxel stylisé type Minecraft, sans assets externes:
- Textures générées procéduralement (Canvas API)
- Chunks avec `InstancedMesh`
- Contrôleur FPS (gravité + collisions)
- Ajout/suppression de blocs
- Lumière dynamique avec cycle jour/nuit + bloom léger

## Stack
- **Three.js + TypeScript + Vite**

Ce choix garantit une boucle de dev rapide et une architecture facile à optimiser (greedy meshing, worker chunks, culling) sans complexité excessive.

## Lancer
```bash
npm install
npm run dev
```

## Contrôles
- Clic: verrouiller la souris
- ZQSD / WASD: déplacer
- Espace: sauter
- Clic gauche: casser un bloc
- Clic droit: poser un bloc
