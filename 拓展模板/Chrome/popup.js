var switch1 = document.getElementById("switch");
switch1.addEventListener("click",modify);

var url;

chrome.tabs.query({'active': true, 'currentWindow': true}, function(tab){
	url = tab[0].url;
	watchWhiteList(wWhiteList);
});

function wWhiteList(){
	if(getStatus(url)){
		switch1.value = "关闭 TFGS";
	}else{
		switch1.value = "开启 TFGS";
	}
	switch1.disabled = false;
}

function modify(){
	switch1.disabled = true;
	setStatus(url,!getStatus(url));
}
