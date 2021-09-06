// Подключаем полифиллы для IE
import polyfill from 'cross-browser-polyfill';
polyfill();
import 'whatwg-fetch';
import 'formdata-polyfill'

// Подключаем роутер
import Router from './services/Router';

// Подключаем функции отображения главной страницы и страницы доски
import mainPage from './modules/boards-main';
import boardPage from './modules/board';

// Инициализируем роутер
const router = new Router({
  mode: 'hash',
  root: '/'
});

router
  // Если передается адрес доски с ее id, то выполняем функцию отображения доски с передачей данного id
  .add(/board-(.*)/, (boardId) => {
		boardPage(boardId);
  })
  // Если адрес не передается, выполняем функцию отображения главной страницы
  .add('', () => {
		mainPage();
  });