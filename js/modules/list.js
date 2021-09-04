import {getData} from '../services/services';
import {postData} from '../services/services';
import {patchData} from '../services/services';
import Element from './element';

class List {
	constructor(boardId, name, listId, btnElement, ...classes) {
		this.boardId = boardId;
		this.name = name;
		this.listId = listId;
		this.btnElement = btnElement;
		this.classes = classes;
		this.elements = [];
	}

	render(parent) {
		getData('http://localhost:3000/elements')
			.then(elementsArr => {
				if (elementsArr.length) {
					// Заполняем массив элементов текущего списка (опять лучше бэкендом выдавать готовый массив)
					elementsArr.forEach(element => {
						if (element.listId == this.listId) {
							this.elements.push(element);
						}
					});

					// Сортируем массив по свойству позиции
					this.elements.sort(function (a, b) {
						if (a.position > b.position) {
							return 1;
						}
						if (a.position < b.position) {
							return -1;
						}
						return 0;
					});
				}
			}).then(() => {
				const listContainer = document.createElement('div');
				// Присваиваем css-класс по умолчанию, если они не были переданы в аргумент Rest-оператора
				if (this.classes.length === 0) {
						this.classes = 'list';
						listContainer.classList.add(this.classes);
				} else {
						this.classes.forEach(className => listContainer.classList.add(className));
				}

				listContainer.innerHTML = `
					<h1>${this.name}</h1>
					<div class="divider"></div>
				`;
				const elementsDiv = document.createElement('div'),
							newElementForm = document.createElement('form'),
							input = document.createElement('input');
				
				elementsDiv.classList.add('elements');
				elementsDiv.setAttribute('data-list-id', this.listId);
				input.classList.add('new_element__input');
				input.setAttribute('required', '');
				input.setAttribute('placeholder', '');
				input.setAttribute('name', 'element_name');
				input.setAttribute('type', 'text');

				newElementForm.append(input);
				elementsDiv.append(newElementForm);

				if (this.elements) {
					this.elements.forEach(({listId, content, id, isChecked, position}) => {
						new Element(listId, content, id, isChecked, position).render(newElementForm);
					});
				}

				listContainer.append(elementsDiv);
				parent.insertBefore(listContainer, this.btnElement);

				const emptyDiv = document.createElement('div');
				emptyDiv.classList.add('empty_element');
				emptyDiv.style.height = '10px';
				elementsDiv.append(emptyDiv);

				newElementForm.addEventListener('submit', (event) => {
					event.preventDefault();
					const position = elementsDiv.querySelectorAll('.element').length + 1;
					const newElement = new Element(this.listId, input.value, 0, false, position);
					this.elements.push(newElement.postIntoDB());
					newElementForm.reset(); // добавить в finally
					newElement.render(newElementForm);
				});

				elementsDiv.addEventListener('dragstart', (event) => {
					event.target.classList.add('selected');
				});

				elementsDiv.addEventListener('dragend', (event) => {
					event.target.classList.remove('selected');
					const json = JSON.stringify({listId: +event.target.parentNode.getAttribute('data-list-id')});
					patchData(`http://localhost:3000/elements/${event.target.getAttribute('data-element-id')}`, json);

					const allListElements = event.target.parentNode.querySelectorAll('.element');
					allListElements.forEach((element, i) => {
						element.setAttribute('data-position', allListElements.length - i);
						const json = JSON.stringify({position: allListElements.length - i});
						patchData(`http://localhost:3000/elements/${element.getAttribute('data-element-id')}`, json);
					});
				});
			});
	}

	postIntoDB() {
		const postedList = {
			boardId: this.boardId,
			name: this.name
		};
		const json = JSON.stringify(postedList);
		postData('http://localhost:3000/lists', json)
				.then(newList => {
					this.listId = newList.id;
					return newList;
				});
	}
}

export default List;