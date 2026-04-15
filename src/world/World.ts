import { Group, Vector3 } from 'three';
import { BlockId, SOLID_BLOCKS } from './BlockTypes';
import { CHUNK_HEIGHT, CHUNK_SIZE, Chunk } from './Chunk';
import { ChunkMesh } from './ChunkMesh';
import { TextureGenerator } from '../render/TextureGenerator';

const WORLD_RADIUS = 2;

export class World {
  readonly group = new Group();
  readonly chunks = new Map<string, Chunk>();
  private readonly meshes = new Map<string, ChunkMesh>();

  constructor(textureGenerator: TextureGenerator) {
    this.group.name = 'world';

    for (let cx = -WORLD_RADIUS; cx <= WORLD_RADIUS; cx += 1) {
      for (let cz = -WORLD_RADIUS; cz <= WORLD_RADIUS; cz += 1) {
        const chunk = new Chunk(cx, cz);
        const key = this.key(cx, cz);
        this.chunks.set(key, chunk);

        const mesh = new ChunkMesh(chunk, textureGenerator, this);
        this.meshes.set(key, mesh);
        this.group.add(mesh.group);
      }
    }
  }

  rebuildChunk(chunkX: number, chunkZ: number): void {
    const key = this.key(chunkX, chunkZ);
    const mesh = this.meshes.get(key);
    if (mesh) mesh.rebuild();
  }

  getBlock(wx: number, wy: number, wz: number): BlockId {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return BlockId.Air;

    const { chunkX, chunkZ, localX, localZ } = this.worldToChunk(wx, wz);
    const chunk = this.chunks.get(this.key(chunkX, chunkZ));
    if (!chunk) return BlockId.Air;
    return chunk.getLocal(localX, wy, localZ);
  }

  setBlock(wx: number, wy: number, wz: number, block: BlockId): void {
    if (wy < 0 || wy >= CHUNK_HEIGHT) return;

    const { chunkX, chunkZ, localX, localZ } = this.worldToChunk(wx, wz);
    const chunk = this.chunks.get(this.key(chunkX, chunkZ));
    if (!chunk) return;

    chunk.setLocal(localX, wy, localZ, block);
    this.rebuildChunk(chunkX, chunkZ);

    if (localX === 0) this.rebuildChunk(chunkX - 1, chunkZ);
    if (localX === CHUNK_SIZE - 1) this.rebuildChunk(chunkX + 1, chunkZ);
    if (localZ === 0) this.rebuildChunk(chunkX, chunkZ - 1);
    if (localZ === CHUNK_SIZE - 1) this.rebuildChunk(chunkX, chunkZ + 1);
  }

  isSolid(wx: number, wy: number, wz: number): boolean {
    return SOLID_BLOCKS.has(this.getBlock(wx, wy, wz));
  }

  raycastVoxel(origin: Vector3, direction: Vector3, maxDistance: number): {
    hit: Vector3;
    adjacent: Vector3;
  } | null {
    const step = 0.1;
    const pos = origin.clone();
    let prev = origin.clone();

    for (let traveled = 0; traveled <= maxDistance; traveled += step) {
      pos.copy(origin).addScaledVector(direction, traveled);
      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);
      if (this.isSolid(bx, by, bz)) {
        return {
          hit: new Vector3(bx, by, bz),
          adjacent: new Vector3(Math.floor(prev.x), Math.floor(prev.y), Math.floor(prev.z))
        };
      }
      prev.copy(pos);
    }

    return null;
  }

  private worldToChunk(wx: number, wz: number): { chunkX: number; chunkZ: number; localX: number; localZ: number } {
    const chunkX = Math.floor(wx / CHUNK_SIZE);
    const chunkZ = Math.floor(wz / CHUNK_SIZE);
    const localX = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    return { chunkX, chunkZ, localX, localZ };
  }

  private key(x: number, z: number): string {
    return `${x},${z}`;
  }
}
