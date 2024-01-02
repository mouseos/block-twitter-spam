// background.js



//content.jsから呼び出す
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getSyllabus') {
		getSyllabusData(request.url, request.search_department, request.search_teacher)
			.then(data => {
				sendResponse({
					data
				});
			});
		return true;
	}
});