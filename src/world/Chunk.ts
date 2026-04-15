import { BlockId } from './BlockTypes';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 48;

export class Chunk {
  readonly blocks: Uint8Array;

  constructor(public readonly chunkX: number, public readonly chunkZ: number) {
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.generate();
  }

  private generate(): void {
    const baseX = this.chunkX * CHUNK_SIZE;
    const baseZ = this.chunkZ * CHUNK_SIZE;

    for (let x = 0; x < CHUNK_SIZE; x += 1) {
      for (let z = 0; z < CHUNK_SIZE; z += 1) {
        const worldX = baseX + x;
        const worldZ = baseZ + z;
        const height = Math.floor(10 + Math.sin(worldX * 0.08) * 2 + Math.cos(worldZ * 0.1) * 2);

        for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
          if (y > height) {
            this.setLocal(x, y, z, BlockId.Air);
          } else if (y === height) {
            this.setLocal(x, y, z, BlockId.Grass);
          } else if (y > height - 3) {
            this.setLocal(x, y, z, BlockId.Dirt);
          } else {
            this.setLocal(x, y, z, BlockId.Stone);
          }
        }

        if (height > 9 && (worldX + worldZ) % 29 === 0) {
          this.setLocal(x, height + 1, z, BlockId.Glow);
        }
      }
    }
  }

  setLocal(x: number, y: number, z: number, block: BlockId): void {
    this.blocks[this.index(x, y, z)] = block;
  }

  getLocal(x: number, y: number, z: number): BlockId {
    if (x < 0 || y < 0 || z < 0 || x >= CHUNK_SIZE || y >= CHUNK_HEIGHT || z >= CHUNK_SIZE) {
      return BlockId.Air;
    }
    return this.blocks[this.index(x, y, z)] as BlockId;
  }

  private index(x: number, y: number, z: number): number {
    return x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
  }
}
