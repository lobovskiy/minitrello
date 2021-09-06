import {postData} from '../services/services';
import {patchData} from '../services/services';

// Создаем класс для элементов
class Element {
	constructor(listId, content, elementId, isChecked, position, ...classes) {
		this.listId = listId;
		this.content = content;
		this.elementId = elementId;
		this.isChecked = isChecked;
		this.position = position;
		this.classes = classes;
	}

	// Метод для отрисовки элемента на странице
	render(addingForm) {

		// Строим структуру HTML-тэгов для отрисовки контейнера элемента
		const listElement = document.createElement('div'),
					elementContent = document.createElement('span'),
					elementCheck = document.createElement('div');

		listElement.classList.add('element');
		listElement.setAttribute('data-element-id', this.elementId);
		listElement.setAttribute('data-position', this.position);
		listElement.draggable = true;

		// Присваиваем класс checked согласно значению свойства isChecked
		if (this.isChecked == true) {
			listElement.classList.add('checked');
		} else {
			listElement.classList.remove('checked');
		}
		elementContent.textContent = this.content;
		elementCheck.classList.add('element_check', 'btn_pointer');
		elementCheck.innerHTML = '&#10004;';

		// Помещаем на страницу
		listElement.append(elementContent);
		listElement.append(elementCheck);
		addingForm.parentNode.insertBefore(listElement, addingForm.nextSibling);

		// Вещаем обработчик клика на контейнер с галочкой для изменения состояния активности
		elementCheck.addEventListener('click', () => {

			// если элемент активен (содержит класс checked), то удаляем класс
			if (listElement.classList.contains('checked')) {
				listElement.classList.remove('checked');
				// перезаписываем свойство инстанса isChecked и меняем его в JSON-файле
				this.isChecked = false;
				const json = JSON.stringify({isChecked: this.isChecked});
				patchData(`http://localhost:3000/elements/${this.elementId}`, json);
			
			// если элемент неактивен (не содержит класс checked), то добавляем класс
			} else {
				listElement.classList.add('checked');
				// перезаписываем свойство инстанса isChecked и меняем его в JSON-файле
				this.isChecked = true;
				const json = JSON.stringify({isChecked: this.isChecked});
				patchData(`http://localhost:3000/elements/${this.elementId}`, json);
			}
		});
	}

	// Метод записи элемента в JSON-файл
	async postIntoDB() {

		// Создаем объект со свойствами инстанса,
		const postedElement = {
			listId: this.listId,
			content: this.content,
			isChecked: this.isChecked,
			position: this.position
		};

		// конвертируем его в JSON и записываем в JSON-файл
		await postData('http://localhost:3000/elements', JSON.stringify(postedElement))
			// после чего полученный из JSON-файла id нового элемента записываем в свойство elementId инстанса
			.then(newElement => {
				this.elementId = newElement.id;
				return newElement;
			});
	}
}

export default Element;