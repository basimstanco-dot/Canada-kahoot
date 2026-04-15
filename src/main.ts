import './styles.css';
import { Game } from './core/Game';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app root element');
}

const game = new Game(app);
game.start();
