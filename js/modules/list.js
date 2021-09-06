import {getData} from '../services/services';
import {postData} from '../services/services';
import {patchData} from '../services/services';
import Element from './element';

// Создаем класс для списков
class List {
	constructor(boardId, name, listId, ...classes) {
		this.boardId = boardId;
		this.name = name;
		this.listId = listId;
		this.classes = classes;
		this.elements = [];
	}

	// Метод для отрисовки списка на странице
	async render(parent, addBtn) {

		// Получаем все элементы из JSON-файла, чтобы далее выбрать только те,
		// которые принадлежат данному списку по id этого списка (лучше бэкендом)
		await getData('http://localhost:3000/elements')
			.then(elementsArr => {
				if (elementsArr.length) {
					// Заполняем в свойстве elements массив элементов текущего списка по его id
					elementsArr.forEach(element => {
						if (element.listId == this.listId) {
							this.elements.push(element);
						}
					});

					// и сортируем массив по свойству позиции
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

				// Отрисовываем div-контейнер, вписываем имя списка 
				const listContainer = document.createElement('div');
				listContainer.innerHTML = `
					<h1>${this.name}</h1>
					<div class="divider"></div>
				`;

				// Присваиваем div-контейнеру css-класс по умолчанию (если не были переданы в ...classes)
				// или все классы, переданные в аргумент Rest-оператора ...classes при создании инстанса
				if (this.classes.length === 0) {
						this.classes = 'list';
						listContainer.classList.add(this.classes);
				} else {
						this.classes.forEach(className => listContainer.classList.add(className));
				}

				// Строим структуру HTML-тэгов для отрисовки контейнера для элементов
				// и формы создания нового элемента
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

				// Отображаем все элементы списка из массива свойства elements 
				// путем последовательного создания инстансов класса Element
				// и отрисовки методом render перед формой создания нового элемента
				if (this.elements.length) {
					this.elements.forEach(({listId, content, id, isChecked, position}) => {
						new Element(listId, content, id, isChecked, position).render(newElementForm);
					});
				}

				// Помещаем все на страницу в контейнер, переданный при вызове метода
				listContainer.append(elementsDiv);
				parent.insertBefore(listContainer, addBtn);

				// Добавляем пустой контейнер для возможности перетаскивания с помощью него
				// элементов в пустой список, когда нет ориентировочных элементов для сброса перетаскиваемого
				const emptyDiv = document.createElement('div');
				emptyDiv.classList.add('empty_element');
				emptyDiv.style.height = '10px';
				elementsDiv.append(emptyDiv);

				//  Функия для добавления нового элемента по сабмиту формы
				newElementForm.addEventListener('submit', async (event) => {
					event.preventDefault();

					// Определяем свойство позиции нового элемента
					// путем подсчета кол-ва существующих элементов в списке
					const position = elementsDiv.querySelectorAll('.element').length + 1;

					// Создаем новый инстанс класса Element
					const newElement = new Element(this.listId, input.value, 0, false, position);

					// Записываем его в JSON-файл методом postIntoDB
					await newElement.postIntoDB()
						// затем добавляем возвращаемый методом объект нового элемента в массив свойства с элементами
						.then((element) => {
							this.elements.push(element);
						// и отрисовываем его на странице методом render, передав форму, перед которой поместим его
						}).then(() => {
							newElement.render(newElementForm);
						// В конце сбрасываем поле формы
						}).finally(() => { newElementForm.reset(); });
				});

				// Вешаем на контейнер с элементами событие dragstart, отслеживающее начало перетаскивания,
				// для обозначения классом selected перетаскиваемого элемента
				// (нужно в т.ч. для работы функции setDragover в board.js)
				elementsDiv.addEventListener('dragstart', (event) => {
					event.target.classList.add('selected');
				});

				// и событие dragend, отслеживающее окончание перетаскивания,
				// для снятия класса selected и последующей вставки элемента
				elementsDiv.addEventListener('dragend', (event) => {
					event.target.classList.remove('selected');

					// Конвертируем в JSON объект, в который записываем свойство listID
					// (id списка, которому принадлежит элемент) со значением нового id списка,
					// в который был перемещен элемент, полученного по атрибуту data-list-id этого списка,
					// после чего меняем это свойство у перемещаемого элемента, обращаясь к нему
					// в JSON-файле по id, записанному в атрибут data-element-id элемента
					const json = JSON.stringify({listId: +event.target.parentNode.getAttribute('data-list-id')});
					patchData(`http://localhost:3000/elements/${event.target.getAttribute('data-element-id')}`, json);

					// Переписываем всем элементам значение атрибута позиции
					// (элементы позиционируются снизу вверх, поэтому вычитаем в цикле счетчик i из общего кол-ва)
					const allListElements = event.target.parentNode.querySelectorAll('.element');
					allListElements.forEach((element, i) => {
						element.setAttribute('data-position', allListElements.length - i);
						// и записываем новые позиции всем этим элементам в JSON-файл,
						// переписывая свойство position и обращаясь по id,
						// записанному в атрибут data-element-id каждого элемента
						const json = JSON.stringify({position: allListElements.length - i});
						patchData(`http://localhost:3000/elements/${element.getAttribute('data-element-id')}`, json);
					});
				});
			});
	}

	// Метод записи списка в JSON-файл
	async postIntoDB() {

		// Создаем объект со свойствами инстанса,
		const postedList = {
			boardId: this.boardId,
			name: this.name
		};
		// конвертируем его в JSON и записываем в JSON-файл
		await postData('http://localhost:3000/lists', JSON.stringify(postedList))
			// после чего полученный из JSON-файла id нового списка записываем в свойство listId инстанса
			.then(newList => {
				this.listId = newList.id;
				return newList;
			});
	}
}

export default List;