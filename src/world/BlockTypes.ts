export enum BlockId {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Sand = 4,
  Glow = 5
}

export type FaceName = 'top' | 'bottom' | 'side';

export interface BlockDefinition {
  id: BlockId;
  key: string;
  solid: boolean;
  emissive?: boolean;
  textureSeed: {
    top: string;
    bottom: string;
    side: string;
  };
}

export const BLOCKS: Record<BlockId, BlockDefinition> = {
  [BlockId.Air]: {
    id: BlockId.Air,
    key: 'air',
    solid: false,
    textureSeed: { top: 'air', bottom: 'air', side: 'air' }
  },
  [BlockId.Grass]: {
    id: BlockId.Grass,
    key: 'grass',
    solid: true,
    textureSeed: { top: 'grass-top', bottom: 'dirt', side: 'grass-side' }
  },
  [BlockId.Dirt]: {
    id: BlockId.Dirt,
    key: 'dirt',
    solid: true,
    textureSeed: { top: 'dirt', bottom: 'dirt', side: 'dirt' }
  },
  [BlockId.Stone]: {
    id: BlockId.Stone,
    key: 'stone',
    solid: true,
    textureSeed: { top: 'stone', bottom: 'stone', side: 'stone' }
  },
  [BlockId.Sand]: {
    id: BlockId.Sand,
    key: 'sand',
    solid: true,
    textureSeed: { top: 'sand', bottom: 'sand', side: 'sand' }
  },
  [BlockId.Glow]: {
    id: BlockId.Glow,
    key: 'glow',
    solid: true,
    emissive: true,
    textureSeed: { top: 'glow', bottom: 'glow', side: 'glow' }
  }
};

export const SOLID_BLOCKS = new Set([
  BlockId.Grass,
  BlockId.Dirt,
  BlockId.Stone,
  BlockId.Sand,
  BlockId.Glow
]);
