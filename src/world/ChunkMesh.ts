import {
  BoxGeometry,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D
} from 'three';
import { TextureGenerator } from '../render/TextureGenerator';
import { BLOCKS, BlockId } from './BlockTypes';
import { CHUNK_HEIGHT, CHUNK_SIZE, Chunk } from './Chunk';
import { World } from './World';

const TEMP = new Object3D();

export class ChunkMesh {
  readonly group = new Group();
  private readonly box = new BoxGeometry(1, 1, 1);
  private readonly instancedByBlock = new Map<BlockId, InstancedMesh>();

  constructor(
    private readonly chunk: Chunk,
    private readonly textureGenerator: TextureGenerator,
    private readonly world: World
  ) {
    this.group.position.set(chunk.chunkX * CHUNK_SIZE, 0, chunk.chunkZ * CHUNK_SIZE);
    this.rebuild();
  }

  rebuild(): void {
    this.group.clear();
    this.instancedByBlock.clear();

    const counts = new Map<BlockId, number>();

    for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
      for (let z = 0; z < CHUNK_SIZE; z += 1) {
        for (let x = 0; x < CHUNK_SIZE; x += 1) {
          const block = this.chunk.getLocal(x, y, z);
          if (block === BlockId.Air) continue;

          const wx = this.chunk.chunkX * CHUNK_SIZE + x;
          const wz = this.chunk.chunkZ * CHUNK_SIZE + z;
          if (!this.isVisible(wx, y, wz)) continue;

          counts.set(block, (counts.get(block) ?? 0) + 1);
        }
      }
    }

    for (const [block, count] of counts.entries()) {
      const definition = BLOCKS[block];
      const material = new MeshStandardMaterial({
        map: this.textureGenerator.generate(definition.textureSeed.side),
        roughness: 0.95,
        metalness: 0.0,
        emissiveMap: definition.emissive ? this.textureGenerator.generate('glow') : null,
        emissive: definition.emissive ? '#6fd6ff' : '#000000',
        emissiveIntensity: definition.emissive ? 0.85 : 0
      });
      const mesh = new InstancedMesh(this.box, material, count);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.instancedByBlock.set(block, mesh);
      this.group.add(mesh);
    }

    const cursor = new Map<BlockId, number>();

    for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
      for (let z = 0; z < CHUNK_SIZE; z += 1) {
        for (let x = 0; x < CHUNK_SIZE; x += 1) {
          const block = this.chunk.getLocal(x, y, z);
          if (block === BlockId.Air) continue;

          const wx = this.chunk.chunkX * CHUNK_SIZE + x;
          const wz = this.chunk.chunkZ * CHUNK_SIZE + z;
          if (!this.isVisible(wx, y, wz)) continue;

          const index = cursor.get(block) ?? 0;
          const mesh = this.instancedByBlock.get(block);
          if (!mesh) continue;

          TEMP.position.set(x + 0.5, y + 0.5, z + 0.5);
          TEMP.updateMatrix();
          mesh.setMatrixAt(index, TEMP.matrix);
          cursor.set(block, index + 1);
        }
      }
    }

    for (const mesh of this.instancedByBlock.values()) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }

  private isVisible(wx: number, wy: number, wz: number): boolean {
    return (
      this.world.getBlock(wx + 1, wy, wz) === BlockId.Air ||
      this.world.getBlock(wx - 1, wy, wz) === BlockId.Air ||
      this.world.getBlock(wx, wy + 1, wz) === BlockId.Air ||
      this.world.getBlock(wx, wy - 1, wz) === BlockId.Air ||
      this.world.getBlock(wx, wy, wz + 1) === BlockId.Air ||
      this.world.getBlock(wx, wy, wz - 1) === BlockId.Air
    );
  }
}
