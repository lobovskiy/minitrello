async function getData(url) {
	const res = await fetch(url);

	if (!res.ok) {
			throw new Error(`Could not fetch ${url}, status: ${res.status}`);
	}

	return await res.json();
}

async function postData(url, data) {
	const res = await fetch(url, {
			method: 'POST',
			headers: {
					'Content-type': 'application/json'
			},
			body: data
	});

	return await res.json();
}

async function patchData(url, data) {
	const res = await fetch(url, {
			method: 'PATCH',
			headers: {
					'Content-type': 'application/json'
			},
			body: data
	});

	return await res.json();
}

export {getData};
export {postData};
export {patchData};