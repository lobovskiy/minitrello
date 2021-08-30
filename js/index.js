// Import polyfills
import polyfill from 'cross-browser-polyfill';
polyfill();
import 'whatwg-fetch';

// Import the Router
import Router from './services/Router';

// Import main page module
import mainPage from './modules/boards-main';
import boardPage from './modules/board';

const router = new Router({
  mode: 'hash',
  root: '/'
});

router
  .add(/board-(.*)/, (boardId) => {
		boardPage(boardId);
  })
  .add('', () => {
    // general controller
    console.log('welcome in catch all controller');
		mainPage();
  });