import {postData} from '../services/services';
import {patchData} from '../services/services';

class Element {
	constructor(listId, content, elementId, isChecked, position, ...classes) {
		this.listId = listId;
		this.content = content;
		this.elementId = elementId;
		this.isChecked = isChecked;
		this.position = position;
		this.classes = classes;
	}

	render(addingForm) {
		const listElement = document.createElement('div'),
					elementContent = document.createElement('span'),
					elementCheck = document.createElement('div');

		elementCheck.classList.add('element_check', 'btn_pointer');
		listElement.classList.add('element');
		listElement.draggable = true;
		if (this.isChecked == true) {
			listElement.classList.add('checked');
		} else {
			listElement.classList.remove('checked');
		}
		elementCheck.innerHTML = '&#10004;';
		listElement.append(elementCheck);
		elementContent.textContent = this.content;
		listElement.prepend(elementContent);
		listElement.setAttribute('data-element-id', this.elementId);
		listElement.setAttribute('data-position', this.position);

		addingForm.parentNode.insertBefore(listElement, addingForm.nextSibling);

		elementCheck.addEventListener('click', () => {
			if (listElement.classList.contains('checked')) {
				listElement.classList.remove('checked');
				this.isChecked = false;
				const json = JSON.stringify({isChecked: this.isChecked});
				patchData(`http://localhost:3000/elements/${this.elementId}`, json);
			} else {
				listElement.classList.add('checked');
				this.isChecked = true;
				const json = JSON.stringify({isChecked: this.isChecked});
				patchData(`http://localhost:3000/elements/${this.elementId}`, json);
			}
		});
	}

	postIntoDB() {
		const postedElement = {
			listId: this.listId,
			content: this.content,
			isChecked: this.isChecked,
			position: this.position
		};
		const json = JSON.stringify(postedElement);
		postData('http://localhost:3000/elements', json)
				.then(newElement => {
					this.elementId = newElement.id;
					return newElement;
				});
	}
}

export default Element;