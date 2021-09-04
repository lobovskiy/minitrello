import List from './list';
import {getData} from '../services/services';

let boardObj;
let boardLists = [];

function renderBoardPattern() {
	const divBoardName = document.createElement('div'),
				divLists = document.createElement('div');
	divBoardName.classList.add('container');
	divLists.classList.add('container');
	divBoardName.innerHTML = `
		<div class="board_name">
				<h1>${boardObj.name}</h1>
		</div>
	`;
	divLists.innerHTML = `
		<div class="lists_container">
			<div class="add_list__button btn_pointer">
					<h1>Новый список</h1>
			</div>
			<form action="#" class="new_list__form hide">
				<input required placeholder="Список ${boardLists.length + 1}" name="name" type="text" class="new_list__input">
				<div class="close__btn btn_pointer hide">&times;</div>
			</form>
		</div>
	`;
	document.querySelector('.main').append(divBoardName);
	document.querySelector('.main').append(divLists);

	setDragover(document.querySelector('.lists_container'));
}

function setDragover(listsContainer) {
	listsContainer.addEventListener('dragover', (evt) => {
		evt.preventDefault();

		const activeElement = listsContainer.querySelector(`.selected`);
		const currentElement = evt.target;
		const isMoveable = activeElement !== currentElement &&
			currentElement.classList.contains('element') ||
			currentElement.classList.contains('empty_element');

		if (!isMoveable) {
			return;
		}

		if (currentElement.classList.contains('empty_element')) {
			currentElement.parentNode.insertBefore(activeElement, currentElement);
		} else {
			const nextElement = (currentElement === activeElement.nextElementSibling) ?
				currentElement.nextElementSibling :
				currentElement;
			
		currentElement.parentNode.insertBefore(activeElement, nextElement);
		}
	});
}

function boardPage(currentBoardId) {
	getData(`http://localhost:3000/boards/${currentBoardId}`)
		.then(board => { 						// throw new Error('Board is not exist'); записать в catch
			boardObj = JSON.parse(JSON.stringify(board));

			// Получаем массив списков, чтобы далее по ID доски выбрать из них те,
			// что принадлежат открытой доске (считаю, что опять же лучше делать бэкендом)
			const data = getData('http://localhost:3000/lists');
			return data;
		}).then(listsArr => {
			// Составляем массив из листов отображаемой доски по ее ID
			for (const list of listsArr) {
				if (list.boardId == currentBoardId) {
					boardLists.push(list);
				}
			}
			
			document.querySelector('.main').innerHTML='';
			renderBoardPattern();

			const addBtn = document.querySelector('.add_list__button'),
						closeBtn = document.querySelector('.close__btn'),
						newListForm = document.querySelector('form.new_list__form'),
						formInput = newListForm.querySelector('.new_list__input');

			function showAddForm(event) {
				if (!event.target.matches('div.close__btn')) {
					closeBtn.classList.remove('hide');
					newListForm.classList.remove('hide');
					formInput.focus();
					addBtn.classList.add('hide');
				}
			}

			function closeAddForm() {
				closeBtn.classList.add('hide');
				newListForm.classList.add('hide');
				addBtn.classList.remove('hide');
				newListForm.reset();
			}

			addBtn.addEventListener('click', showAddForm);
			closeBtn.addEventListener('click', closeAddForm);

			newListForm.addEventListener('submit', (event) => {
				event.preventDefault();
				const newList = new List(+currentBoardId, formInput.value, 0, addBtn);
				boardLists.push(newList.postIntoDB());
				newList.render(document.querySelector('.lists_container'));
				newListForm.reset(); // добавить в finally
				formInput.setAttribute('placeholder', `Список ${boardLists.length + 1}`);
			});

			if (boardLists.length) {
				boardLists.forEach(({boardId, name, id}) => {
					new List(boardId, name, id, addBtn).render(document.querySelector('.lists_container'));
				});
			}
		});
}

export default boardPage;