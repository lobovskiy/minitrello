import {getData} from '../services/services';
import {postData} from '../services/services';

function renderBoardsPattern() {
	const div = document.createElement('div');
	div.classList.add('container');
	div.innerHTML = `
		<div class="container_left">
			<div class="add_board__button btn_pointer">
					<h1>Новая доска</h1>
					<div class="close_btn btn_pointer hide">&times;</div>
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
			<h1>Мои доски</h1>
		</div>
	`;
	document.querySelector('.main').append(div);
}

function mainPage() {
	getData('http://localhost:3000/boards')
		.then(request => {
			document.querySelector('.main').innerHTML='';
			renderBoardsPattern();

			if (request.length) {
				request.forEach(({name, id}) => {
					showBoard(name, id);
				});
			} else {
				// const emptyDiv = document.createElement('div');
				// emptyDiv.innerHTML = 'Здесь пока ничего нет...';
				// document.querySelector('.container_right').append(emptyDiv);
			}

			const addBtn = document.querySelector('.add_board__button'),
						closeBtn = document.querySelector('.close_btn'),
						newBoardForm = document.querySelector('form.new_board__form'),
						formInput = newBoardForm.querySelector('.new_board__input');

			function showBoard(name, id) {
				const createdBoardAnchor = document.createElement('a'),
							createdBoard = document.createElement('div');
				createdBoardAnchor.setAttribute('href', `/#/board-${id}`);
				createdBoardAnchor.classList.add('boards_list');
				createdBoard.innerHTML = `<h1>${name}</h1>`;
				document.querySelector('.container_right').append(createdBoardAnchor);
				createdBoardAnchor.append(createdBoard);
			}

			function showAddForm(event) {
				if (!event.target.matches('div.close_btn')) {
					closeBtn.classList.remove('hide');
					newBoardForm.classList.remove('hide');
					formInput.focus();
					addBtn.classList.remove('btn_pointer');
					addBtn.removeEventListener('click', showAddForm);
				}
			}

			function closeAddForm() {
				closeBtn.classList.add('hide');
				newBoardForm.classList.add('hide');
				addBtn.classList.add('btn_pointer');
				newBoardForm.reset();
				addBtn.addEventListener('click', showAddForm);
			}

			addBtn.addEventListener('click', showAddForm);
			closeBtn.addEventListener('click', closeAddForm);
			document.querySelector('.btn_grey').addEventListener('click', (event) => {
				event.preventDefault();
				closeAddForm();
			});

			newBoardForm.addEventListener('submit', (event) => {
				event.preventDefault();
				const formData = new FormData(newBoardForm);
				const json = JSON.stringify(Object.fromEntries(formData.entries()));
				postData('http://localhost:3000/boards', json)
					.then(newBoardObj => {
						showBoard(newBoardObj.name, newBoardObj.id);
					});
				closeAddForm();
			});
		});
}

export default mainPage;