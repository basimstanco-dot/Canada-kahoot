import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';

const hash = (value: string): number => {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const jitter = (seed: number, x: number, y: number): number => {
  const n = Math.sin((seed + x * 13.13 + y * 71.7) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
};

const toHex = (value: number): string => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');

const shiftColor = (base: string, amount: number): string => {
  const red = Number.parseInt(base.slice(1, 3), 16);
  const green = Number.parseInt(base.slice(3, 5), 16);
  const blue = Number.parseInt(base.slice(5, 7), 16);
  return `#${toHex(red + amount)}${toHex(green + amount)}${toHex(blue + amount)}`;
};

const PALETTE: Record<string, string> = {
  'grass-top': '#67b657',
  'grass-side': '#4f9f4e',
  dirt: '#7b4d2f',
  stone: '#7f8795',
  sand: '#d9c07d',
  glow: '#81ddff',
  air: '#000000'
};

export class TextureGenerator {
  private readonly tileSize = 32;
  private readonly textures = new Map<string, CanvasTexture>();

  generate(key: string): CanvasTexture {
    const cached = this.textures.get(key);
    if (cached) {
      return cached;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.tileSize;
    canvas.height = this.tileSize;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Cannot create 2D context for texture generation');
    }

    const base = PALETTE[key] ?? '#ff00ff';
    context.fillStyle = base;
    context.fillRect(0, 0, this.tileSize, this.tileSize);

    const seed = hash(key);

    for (let y = 0; y < this.tileSize; y += 1) {
      for (let x = 0; x < this.tileSize; x += 1) {
        const noise = jitter(seed, x, y);
        const variation = Math.round((noise - 0.5) * 40);
        context.fillStyle = shiftColor(base, variation);
        context.fillRect(x, y, 1, 1);
      }
    }

    if (key === 'grass-top') {
      context.fillStyle = 'rgba(80, 140, 70, 0.35)';
      for (let i = 0; i < 90; i += 1) {
        context.fillRect((seed + i * 11) % this.tileSize, (seed + i * 7) % this.tileSize, 1, 2);
      }
    }

    if (key === 'stone') {
      context.fillStyle = 'rgba(182,192,210,0.3)';
      for (let i = 0; i < 50; i += 1) {
        context.fillRect((seed + i * 17) % this.tileSize, (seed + i * 19) % this.tileSize, 2, 1);
      }
    }

    if (key === 'glow') {
      const gradient = context.createRadialGradient(16, 16, 4, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradient.addColorStop(1, 'rgba(20,80,100,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }

    const texture = new CanvasTexture(canvas);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.colorSpace = SRGBColorSpace;

    this.textures.set(key, texture);
    return texture;
  }
}
