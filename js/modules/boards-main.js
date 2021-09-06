import {getData} from '../services/services';
import {postData} from '../services/services';

// Функция для создания HTML-шаблона под контент
function renderBoardsPattern() {
	const div = document.createElement('div');
	div.classList.add('container');
	div.innerHTML = `
		<div class="container_left">
			<div class="add_board__button btn_pointer">
					<h1>Новая доска</h1>
					<div class="close__button btn_pointer hide">&times;</div>
			</div>
			<form action="#" class="new_board__form hide">
				<h2>Название доски</h2>
				<input required placeholder="Моя доска" name="name" type="text" class="new_board__input">
				<div></div>
				<button type="button" class="btn btn_grey">Отмена</button>
				<button type="submit" class="btn btn_green">Сохранить</button>
				<div class="spacer" style="clear: both;"></div>
			</form>
		</div>
		<div class="container_right">
			<h1>Мои доски:</h1>
		</div>
	`;
	document.querySelector('.main').append(div);
}

function mainPage() {

	// Получаем доски из JSON-файла
	getData('http://localhost:3000/boards')
		.then(request => {

			// Отрисовываем шаблон
			document.querySelector('.main').innerHTML='';
			renderBoardsPattern();

			// Строим список досок функцией showBoard в правой части страницы
			if (request.length) {
				request.forEach(({name, id}) => {
					showBoard(name, id);
				});
			} else {
			// Если досок нет, то отображаем надпись об их отсутствии
				document.querySelector('.container_right').innerHTML += `
					<div class="no_boards">Здесь пока ничего нет...</div>
				`;
			}

			const addBtn = document.querySelector('.add_board__button'),
						closeBtn = document.querySelector('.close__button'),
						newBoardForm = document.querySelector('form.new_board__form'),
						formInput = newBoardForm.querySelector('.new_board__input');

			// Функция для отображения существующих досок справа
			function showBoard(name, id) {
				const createdBoardAnchor = document.createElement('a'),
							createdBoard = document.createElement('div');

				// Обертываем div с названием доски в ссылку, содержащую id доски для его передачи в роутер
				createdBoardAnchor.setAttribute('href', `/#/board-${id}`);
				createdBoardAnchor.classList.add('boards_list');
				createdBoard.innerHTML = `<h1>${name}</h1>`;
				document.querySelector('.container_right').append(createdBoardAnchor);
				createdBoardAnchor.append(createdBoard);
			}

			// Отображение формы создания новой доски
			function showAddForm(event) {
				if (!event.target.matches('div.close__button')) {
					closeBtn.classList.remove('hide');
					newBoardForm.classList.remove('hide');
					formInput.focus();
					addBtn.classList.remove('btn_pointer');
					addBtn.removeEventListener('click', showAddForm);
				}
			}

			// Скрытие формы создания доски
			function closeAddForm() {
				closeBtn.classList.add('hide');
				newBoardForm.classList.add('hide');
				addBtn.classList.add('btn_pointer');
				newBoardForm.reset();
				addBtn.addEventListener('click', showAddForm);
			}

			// Навешиваем обработчики событий по клику
			// для отображения/скрытия формы соответствующими функциями
			addBtn.addEventListener('click', showAddForm);
			closeBtn.addEventListener('click', closeAddForm);
			document.querySelector('.btn_grey').addEventListener('click', (event) => {
				event.preventDefault();
				closeAddForm();
			});

			// Функция добавления новой доски по сабмиту формы
			newBoardForm.addEventListener('submit', (event) => {
				event.preventDefault();

				// Помещаем данные из формы в FormData и конвертируем в JSON
				const formData = new FormData(newBoardForm);
				const json = JSON.stringify(Object.fromEntries(formData.entries()));

				// Постим данные в JSON-файл в раздел boards,
				// отображаем доску в списке справа и закрываем форму
				postData('http://localhost:3000/boards', json)
					.then(newBoardObj => {
						showBoard(newBoardObj.name, newBoardObj.id);
					}).finally(closeAddForm);

				// Убираем надпись об отсутствии досок
				if (document.querySelector('.no_boards')) {
					document.querySelector('.no_boards').remove();
				}
			});
		});
}

export default mainPage;