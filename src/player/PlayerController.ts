import { Camera, Vector2, Vector3 } from 'three';
import { World } from '../world/World';

const PLAYER_HALF_WIDTH = 0.3;
const PLAYER_HEIGHT = 1.75;
const GRAVITY = 24;
const MOVE_SPEED = 7;
const JUMP_VELOCITY = 8.6;

export class PlayerController {
  readonly velocity = new Vector3();
  readonly direction = new Vector3();
  readonly look = new Vector2(0, 0);
  private readonly keys = new Set<string>();
  private grounded = false;
  private pointerLocked = false;

  constructor(private readonly camera: Camera, private readonly world: World, private readonly dom: HTMLElement) {
    this.camera.position.set(8, 18, 8);
    this.bindInput();
  }

  update(delta: number): void {
    const forward = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const strafe = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));

    const yaw = this.look.x;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);

    this.direction.set(strafe * cos - forward * sin, 0, -forward * cos - strafe * sin);
    if (this.direction.lengthSq() > 0) this.direction.normalize();

    this.velocity.x = this.direction.x * MOVE_SPEED;
    this.velocity.z = this.direction.z * MOVE_SPEED;

    if (this.grounded && this.keys.has('Space')) {
      this.velocity.y = JUMP_VELOCITY;
      this.grounded = false;
    }

    this.velocity.y -= GRAVITY * delta;

    this.moveAxis('x', this.velocity.x * delta);
    this.moveAxis('z', this.velocity.z * delta);
    this.moveAxis('y', this.velocity.y * delta);

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.look.x;
    this.camera.rotation.x = this.look.y;
  }

  forwardVector(): Vector3 {
    return new Vector3(0, 0, -1).applyEuler(this.camera.rotation).normalize();
  }

  private moveAxis(axis: 'x' | 'y' | 'z', amount: number): void {
    if (amount === 0) return;

    this.camera.position[axis] += amount;
    if (this.collides()) {
      this.camera.position[axis] -= amount;
      if (axis === 'y') {
        if (amount < 0) {
          this.grounded = true;
        }
        this.velocity.y = 0;
      }
    } else if (axis === 'y') {
      this.grounded = false;
    }
  }

  private collides(): boolean {
    const minX = Math.floor(this.camera.position.x - PLAYER_HALF_WIDTH);
    const maxX = Math.floor(this.camera.position.x + PLAYER_HALF_WIDTH);
    const minY = Math.floor(this.camera.position.y - PLAYER_HEIGHT);
    const maxY = Math.floor(this.camera.position.y);
    const minZ = Math.floor(this.camera.position.z - PLAYER_HALF_WIDTH);
    const maxZ = Math.floor(this.camera.position.z + PLAYER_HALF_WIDTH);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          if (this.world.isSolid(x, y, z)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private bindInput(): void {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    this.dom.addEventListener('click', () => {
      void this.dom.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.dom;
    });

    window.addEventListener('mousemove', (event) => {
      if (!this.pointerLocked) return;
      const sensitivity = 0.0017;
      this.look.x -= event.movementX * sensitivity;
      this.look.y -= event.movementY * sensitivity;
      this.look.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.look.y));
    });
  }
}
