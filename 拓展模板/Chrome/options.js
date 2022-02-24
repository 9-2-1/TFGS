var listInput = document.getElementById("whiteList");

listInput.addEventListener("keydown",setWhiteList2);

watchWhiteList(getWhiteList2);

function setWhiteList2(event){
	setTimeout(function(){
		whiteList = listInput.value.split("\n");
		setWhiteList(noop);
	},0);
};

function getWhiteList2(){
	function getWhiteListCallback(listval){
		listInput.value = listval.join("\n");
	}
	getWhiteList(getWhiteListCallback);
}

chrome.tabs.query({'active': true, 'currentWindow': true}, function(tab){
	url = tab[0].url;
	var example = getAutoPattern(url);
	if(!(/^chrome/i.test(url)))
		document.getElementById("example").innerText = "+ " + example;
});
