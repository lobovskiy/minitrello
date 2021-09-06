import List from './list';
import {getData} from '../services/services';

// Объявляем переменные для хранения объекта доски и массива ее листов
let boardObj;
let boardLists = [];

// Функция для навешивания на контейнер зоны сброса перетаскиваемого элемента
function setDragover(container) {
	container.addEventListener('dragover', (evt) => {
		evt.preventDefault();

		// Определяем перетаскиваемый элемент
		// (по классу selected, присваиваемому событием dragstart - прописано в классе List)
		// и элемент, над которым находится курсор
		const activeElement = container.querySelector('.selected');
		const currentElement = evt.target;

		// Задаем триггер для проверки, что событие срабатывает не на перемещаемом элементе,
		// и курсор находится над элементом списка element
		// или пустым элементом empty_element в конце списка (нужен для сброса в пустой список)
		const isMoveable = activeElement !== currentElement &&
			currentElement.classList.contains('element') ||
			currentElement.classList.contains('empty_element');

		// Если триггер не сработал, то прерываем обработку
		if (!isMoveable) {
			return;
		}

		// Вставляем перетаскиваемый элемент либо перед пустым элементом в конце списка,
		if (currentElement.classList.contains('empty_element')) {
			currentElement.parentNode.insertBefore(activeElement, currentElement);
		} else {
		// либо определяем элемент, перед которым будем вставлять перетаскиваемый элемент
		// (если курсор находится над элементом, расположенным после перетаскиваемого,
		// то вставлять будем перед следующим еще дальше за ним -
		// чтобы перетаскиваемый и следующий сразу после него элемент поменялись местами)
			const nextElement = (currentElement === activeElement.nextElementSibling) ?
				currentElement.nextElementSibling :
				currentElement;
			
			// и вставляем перед ним перетаскиваемый элемент
			currentElement.parentNode.insertBefore(activeElement, nextElement);
		}
	});
}

function boardPage(currentBoardId) {

	// Получаем объект доски по ее id, переданному от роутера в аргумент функции
	getData(`http://localhost:3000/boards/${currentBoardId}`)
		.then(board => {

			// Помещаем объект доски в переменную boardObj,
			// если доски с таким id не существует, то выполняем reject и отправляем промис в catch (в конце)
			return new Promise ((resolve, reject) => {
				if (board.id) {
					boardObj = JSON.parse(JSON.stringify(board));
				} else {
					reject();
				}

				// Получаем массив списков, чтобы далее по ID доски выбрать из них те,
				// которые принадлежат открытой доске (лучше бэкендом)
				const data = getData('http://localhost:3000/lists');
				resolve(data);
			});
			
		}).then(listsArr => {

			// Наполняем массив списками отображаемой доски по ее ID
			for (const list of listsArr) {
				if (list.boardId == currentBoardId) {
					boardLists.push(list);
				}
			}

			// Отрисовываем контейнер для списков и кнопки их добавления
			// со спиннером, закрывающим загрузку списков
			document.querySelector('.main').innerHTML='';

			const div = document.createElement('div');
			div.classList.add('container');
			div.innerHTML = `
				<div class="board_name">
					<h1>${boardObj.name}</h1>
				</div>
				<div class="container">
					<div class="spinner">
						<img src="./img/spinner.svg" alt="minitrello">
					</div>
					<div class="lists_container hide">
						<div class="add_list__button btn_pointer">
								<h1>Новый список</h1>
						</div>
						<form action="#" class="new_list__form hide">
							<input required placeholder="Список ${boardLists.length + 1}" name="name" type="text" class="new_list__input">
							<div class="close__button btn_pointer hide">&times;</div>
						</form>
					</div>
				</div>
			`;
			document.querySelector('.main').append(div);

			const listsContainer = document.querySelector('.lists_container'),
						addBtn = listsContainer.querySelector('.add_list__button'),
						closeBtn = listsContainer.querySelector('.close__button'),
						newListForm = listsContainer.querySelector('form.new_list__form'),
						formInput = newListForm.querySelector('.new_list__input');

			// Вешаем на контейнер зону сброса для перетаскивания элементов
			setDragover(listsContainer);

			// Функция для отображения формы добавления нового списка
			function showAddForm(event) {
				if (!event.target.matches('div.close__button')) {
					closeBtn.classList.remove('hide');
					newListForm.classList.remove('hide');
					formInput.focus();
					addBtn.classList.add('hide');
				}
			}

			// Функция для скрытия формы добавления нового списка
			function closeAddForm() {
				closeBtn.classList.add('hide');
				newListForm.classList.add('hide');
				addBtn.classList.remove('hide');
				newListForm.reset();
			}

			// Навешиваем обработчики на кнопки для скрытия и отображения формы добавления списка
			addBtn.addEventListener('click', showAddForm);
			closeBtn.addEventListener('click', closeAddForm);

			// Функия для добавления нового списка по сабмиту формы
			newListForm.addEventListener('submit', async (event) => {
				event.preventDefault();

				// Создаем новый инстанс класса List
				const newList = new List(+currentBoardId, formInput.value, 0);

				// Записываем его в JSON-файл методом postIntoDB,
				await newList.postIntoDB()
					// затем добавляем возвращаемый методом объект нового списка в массив списков
					.then((board) => {
						boardLists.push(board);
					// и отрисовываем его на странице методом render, передав контейнер и кнопку,
					// перед которой будем помещать список, а также обновляем счетчик списка в placeholder формы
					}).then(() => {
						newList.render(listsContainer, addBtn);
						formInput.setAttribute('placeholder', `Список ${boardLists.length + 1}`);
					// В конце сбрасываем поле формы
					}).finally(() => { newListForm.reset(); });
			});
			
			// Функция для отображения всех списков из заполненного массива
			// путем последовательного создания инстансов класса List
			// и отрисовки их методом render
			async function renderLists() {
				if (boardLists.length) {
					for (const {boardId, name, id} of boardLists) {
						await new List(boardId, name, id).render(listsContainer, addBtn);
					}
				}
			}

			// Отрисовываем все списки функцией renderLists,
			// убираем спиннер и отображаем контейенtр со списками снятием класса hide
			renderLists().then(() => {
				div.querySelector('.spinner').remove();
				listsContainer.classList.remove('hide');
			});
		// Выдаем ошибку, если первый промис не нашел доску с переданным id
		}).catch(() => { throw new Error('Board does not exist'); });
		
}

export default boardPage;