import {getData} from '../services/services';
import {putData} from '../services/services';

let boardObj;
let boardListsNum = 0;

class List {
	constructor(name, listId, elements, addBtnElement, ...classes) {
			this.name = name;
			this.listId = listId;
			this.addBtnElement = addBtnElement;
			this.classes = classes;
			this.elements = elements;
	}

	render() {
		const div = document.createElement('div');
		if (this.classes.length === 0) {
				this.classes = 'list';
				div.classList.add(this.classes);
		} else {
				this.classes.forEach(className => div.classList.add(className));
		}
		div.innerHTML = `
			<h1>${this.name}</h1>
			<div class="divider"></div>
		`;
		const elementsDiv = document.createElement('div'),
					newElementForm = document.createElement('form'),
					input = document.createElement('input');
		
		elementsDiv.classList.add('elements');
		input.classList.add('new_element__input');
		input.setAttribute('required', '');
		input.setAttribute('placeholder', '');
		input.setAttribute('name', 'element_name');
		input.setAttribute('type', 'text');

		newElementForm.append(input);
		elementsDiv.append(newElementForm);

		if (this.elements) {
			this.elements.forEach((element, index) => {
				this.pasteElement(input, element, index);
			});
		}

		div.append(elementsDiv);
		this.addBtnElement.before(div);

		newElementForm.addEventListener('submit', (event) => {
			event.preventDefault();
			const newElement = {};
			newElement.content = input.value;
			newElement.isChecked = false;
			this.elements.push(newElement);
			newElementForm.reset();
			
			boardObj.lists[this.listId].elements = JSON.parse(JSON.stringify(this.elements));
			const json = JSON.stringify(boardObj);
			putData(`http://localhost:3000/boards/${boardObj.id}`, json)
				.then(newBoardObj => {
					this.pasteElement(input, newElement, this.elements.length - 1);
				});
		});
	}

	pasteElement(input, element, elementIndex) {
		const listElement = document.createElement('div'),
					elementContent = document.createElement('span'),
					elementCheck = document.createElement('div');
		elementCheck.classList.add('element_check', 'btn_pointer');
		listElement.classList.add('element');
		listElement.draggable = true;
		if (element.isChecked) {
			listElement.classList.add('checked');
		}
		elementCheck.innerHTML = '&#10004;';
		listElement.append(elementCheck);
		elementContent.textContent = element.content;
		listElement.prepend(elementContent);
		input.after(listElement);

		elementCheck.addEventListener('click', () => {
			if (listElement.classList.contains('checked')) {
				listElement.classList.remove('checked');
				boardObj.lists[this.listId].elements[elementIndex].isChecked = false;
				const json = JSON.stringify(boardObj);
				putData(`http://localhost:3000/boards/${boardObj.id}`, json);
			} else {
				listElement.classList.add('checked');
				boardObj.lists[this.listId].elements[elementIndex].isChecked = true;
				const json = JSON.stringify(boardObj);
				putData(`http://localhost:3000/boards/${boardObj.id}`, json);
			}
		});
	}
}

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
				<input required placeholder="Список ${boardListsNum + 1}" name="name" type="text" class="new_list__input">
				<div class="close_btn btn_pointer hide">&times;</div>
			</form>
		</div>
	`;
	document.querySelector('.main').append(divBoardName);
	document.querySelector('.main').append(divLists);
}

function boardPage(boardId) {
	getData('http://localhost:3000/boards')
	.then(request => {
		document.querySelector('.main').innerHTML='';
		if (request.length) {
			// Получаем объект с нужной доской (лучше делать бэкендом)
			request.forEach((board) => {
				if (board.id == boardId) {
					boardObj = JSON.parse(JSON.stringify(board));
				}
			});
			if (boardObj.lists) {
				boardListsNum = boardObj.lists.length;
			}
		} else {
			throw new Error('There is no any boards');
		}
	}).then(() => {
		renderBoardPattern();

		const addBtn = document.querySelector('.add_list__button'),
					closeBtn = document.querySelector('.close_btn'),
					newListForm = document.querySelector('form.new_list__form'),
					formInput = newListForm.querySelector('.new_list__input');

		if (boardObj.lists) {
			boardObj.lists.forEach(({name, elements}, listId) => {
				if (!elements) {
					elements = [];
				}
				new List(name, listId, elements, addBtn).render();
			});
		}

		function showList(name) {
			const createdList = document.createElement('div');
			createdList.classList.add('list');
			createdList.innerHTML = `<h1>${name}</h1>`;
			addBtn.before(createdList);
		}

		function showAddForm(event) {
			if (!event.target.matches('div.close_btn')) {
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
			boardObj.lists = boardObj.lists || [];
			boardObj.lists[boardObj.lists.length] = {};
			boardObj.lists[boardObj.lists.length - 1].name = formInput.value;
			newListForm.reset();
			const json = JSON.stringify(boardObj);
			putData(`http://localhost:3000/boards/${boardObj.id}`, json)
				.then(newBoardObj => {
					boardListsNum++;
					formInput.setAttribute('placeholder', `Список ${boardListsNum + 1}`);
					new List(newBoardObj.lists[newBoardObj.lists.length - 1].name, boardListsNum - 1, [], addBtn).render();
				});
		});
	});
}

export default boardPage;