var TFGS_installed = false;
watchWhiteList(function(){
	if(getStatus(document.location.href)){
		if(!TFGS_installed){
			install("TFGS.js");
			TFGS_installed = true;
		}else{
			window.postMessage({"enable":true},document.location.href);
		}
	}else{
			window.postMessage({"enable":false},document.location.href);
	}
});

function install(src){
	var script = document.createElement("script");
	script.src = chrome.extension.getURL(src);
	document.body.appendChild(script);
}

window.addEventListener("message",function(event){
	if(event.source === event.target){
		if(typeof event.data === "object" && "error" in event.data){
			setStatus(document.location.href,false);
		}
	}
});
