if (!("tfgs" in this)) tfgs = {};

//要保存的内容有：自己的设定，自己的数据，拓展的设定和拓展的数据。
//自己视为特殊拓展“-tfgs-”，设定数据为“config”，其他数据为“data”

let saveload = {};
// let data = {
// 	"extensionname": {
// 		"config": {
// 			"size": 67,
// 			"abc": true,
// 			"eee": {
// 				"number": 3,
// 				"length": 7
// 			}
// 		}
// 		"data":{
// 			"time": 123,
// 			"huge": [1,2,3,4,5,6,7,8]
// 		}
// 	}
// }

saveload.load = saveload_load;

function saveload_load(callback) {
	let tfgsdata = null;
	let extStorage = null;
	if ("chrome" in window && "storage" in chrome) {
		extStorage = chrome.storage;
	} else if ("browser" in window && "storage" in browser) {
		extStorage = browser.storage;
	}
	if (extStorage !== null) {
		extStorage.sync.getItem("-tfgs-", function(ret) {
			tfgsdata = ret["-tfgs-"];
			saveload_load2(callback);
		});
	} else {
		saveload_load2(callback);
	}

	function saveload_load2(callback) {
		// if (tfgsdata === null&&"indexedDB"in window) {

		// }
		if (tfgsdata === null && "localStorage" in window) {
			tfgsdata = localStorage.getItem("-tfgs-");
		}
		saveload.data = tfgsdata;
		callback(tfgsdata);
	}
}

saveload.save = saveload_save;

function saveload_save(callback) {
	let extStorage = null;
	if ("chrome" in window && "storage" in chrome) {
		extStorage = chrome.storage;
	} else if ("browser" in window && "storage" in browser) {
		extStorage = browser.storage;
	}
	if (extStorage !== null) {
		extStorage.sync.setItem({
			"-tfgs-": saveload.data
		}, function(ret) {
			saveload_save2(callback);
		});
	} else {
		saveload_save2(callback);
	}

	function saveload_save2(callback) {
		// if ("indexedDB"in window) {

		// }
		if ("localStorage" in window) {
			localStorage.setItem("-tfgs-", saveload.data);
		}
		callback();
	}
}

// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
// window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// 
// function idbprom(idbrequest) {
// 	return new Promise((resolve, reject) => {
// 		idbrequest.addEventListener("success", () => {
// 			resolve(idbrequest.result)
// 		});
// 		idbrequest.addEventListener("error", () => {
// 			reject(idbrequest.error)
// 		});
// 	});
// }

tfgs.saveload = saveload;
