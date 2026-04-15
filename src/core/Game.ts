import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { PlayerController } from '../player/PlayerController';
import { TextureGenerator } from '../render/TextureGenerator';
import { BlockId } from '../world/BlockTypes';
import { World } from '../world/World';

export class Game {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
  private readonly renderer = new WebGLRenderer({ antialias: true });
  private readonly composer: EffectComposer;
  private readonly clock = new Clock();
  private readonly world: World;
  private readonly player: PlayerController;

  private readonly ambient = new AmbientLight('#97b5ff', 0.25);
  private readonly hemisphere = new HemisphereLight('#85a7ff', '#4f6a45', 0.4);
  private readonly sun = new DirectionalLight('#fff2cc', 1.2);
  private dayTime = 0.2;

  constructor(private readonly root: HTMLElement) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene.background = new Color('#8fb5ff');
    this.scene.fog = new Fog('#8fb5ff', 20, 180);

    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 160;
    this.sun.shadow.camera.left = -50;
    this.sun.shadow.camera.right = 50;
    this.sun.shadow.camera.top = 50;
    this.sun.shadow.camera.bottom = -50;

    const textures = new TextureGenerator();
    this.world = new World(textures);
    this.player = new PlayerController(this.camera, this.world, this.renderer.domElement);

    this.scene.add(this.world.group, this.ambient, this.hemisphere, this.sun);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.2, 0.4, 0.9));

    this.bindEvents();
    this.createHud();

    root.append(this.renderer.domElement);
  }

  start(): void {
    this.renderer.setAnimationLoop(() => {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      this.player.update(delta);
      this.updateLighting(delta);
      this.composer.render();
    });
  }

  private updateLighting(delta: number): void {
    this.dayTime = (this.dayTime + delta * 0.02) % 1;
    const angle = this.dayTime * Math.PI * 2;
    const heightFactor = Math.max(0.05, Math.sin(angle) * 0.5 + 0.5);

    this.sun.position.set(Math.cos(angle) * 40, 8 + heightFactor * 65, Math.sin(angle) * 35);
    this.sun.intensity = 0.1 + heightFactor * 1.4;
    this.ambient.intensity = 0.14 + heightFactor * 0.28;
    this.hemisphere.intensity = 0.25 + heightFactor * 0.45;

    const sky = new Color().setHSL(0.58, 0.45, 0.18 + heightFactor * 0.55);
    this.scene.background = sky;
    (this.scene.fog as Fog).color.copy(sky);
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousedown', (event) => {
      const hit = this.world.raycastVoxel(this.camera.position, this.player.forwardVector(), 7);
      if (!hit) return;

      if (event.button === 0) {
        this.world.setBlock(hit.hit.x, hit.hit.y, hit.hit.z, BlockId.Air);
      }

      if (event.button === 2) {
        const place = hit.adjacent;
        this.world.setBlock(place.x, place.y, place.z, BlockId.Sand);
      }
    });

    window.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  private createHud(): void {
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.innerHTML = '<div class="crosshair"></div>';

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.innerHTML = 'Click: lock souris • ZQSD/WASD: bouger • Espace: sauter • Gauche: casser • Droite: poser';

    this.root.append(hud, hint);
  }
}
