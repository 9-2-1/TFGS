//要保存的内容有：自己的设定，自己的数据，拓展的设定和拓展的数据。
//自己视为特殊拓展“-tfgs-”，设定数据为“option”，其他数据为“data”

/** saveload */
tfgs.saveload = {};

tfgs.saveload.loadfromtext = function(data) {
	if (data === undefined || data === null) data = {};
	if (typeof data === "string") data = JSON.parse(data);
	if (typeof data !== "object") data = {};
	tfgs.saveload.loadfromjson(data);
};

tfgs.saveload.loadfromjson = function(json) {
	tfgs.func.setoption(json.option);
	tfgs.func.setdata(json.data);
};

tfgs.saveload.savetotext = function() {
	return JSON.stringify(tfgs.saveload.savetojson(data));
};

tfgs.saveload.savetojson = function() {
	return {
		option: tfgs.func.getoption(),
		data: tfgs.func.getdata()
	};
};

tfgs.saveload.edit = function() {
	let newdata = prompt("编辑配置文本", tfgs.saveload.savetotext());
	if (newData !== null)
		tfgs.saveload.loadfromtext(newdata);
};

/** file */
tfgs.saveload.file = {};

tfgs.saveload.file.load = function() {
	return tfgs.saveload.file._load().then(tfgs.saveload.loadfromtext);
};
tfgs.saveload.file.save = function() {
	return tfgs.saveload.file._save(tfgs.saveload.savetotext());
};

tfgs.saveload.file._load = function() {
	return new Promise(function(resolve, reject) {
		let a = document.createElement("input");
		a.type = "file";
		a.addEventListener("change", function(event) {
			if (a.files.length > 0) {
				let f = new FileReader();
				f.addEventListener("load", function(event) {
					resolve(f.result.toString());
				});
				f.readAsBinaryString(a.files[0]);
			}
		});
		a.click();
	});
}

tfgs.saveload.file._save = function(data) {
	return new Promise(function(resolve, reject) {
		let a = document.createElement("a");
		a.href = "data:text/plain;charset:utf-8," + data;
		a.download = "tfgs-option.json";
		a.click();
	});
}

/** storage */
tfgs.saveload.storage = {};

tfgs.saveload.storage.load = function() {
	return tfgs.saveload.storage._load().then(tfgs.saveload.loadfromtext);
};
tfgs.saveload.storage.save = function() {
	return tfgs.saveload.saveto().then(tfgs.saveload.storage._save);
};

tfgs.saveload.storage._load = function() {
	return new Promise(function(resolve, reject) {
		let data = null;
		let extStorage = null;
		if ("chrome" in window && "storage" in chrome) {
			extStorage = chrome.storage;
		} else if ("browser" in window && "storage" in browser) {
			extStorage = browser.storage;
		}
		if (extStorage !== null) {
			extStorage.sync.getItem("-tfgs-", function(ret) {
				data = ret["-tfgs-"];
				saveload_load2();
			});
		} else {
			load2(callback);
		}

		function load2() {
			// if (data === null&&"indexedDB"in window) {

			// }
			if (data === null && "localStorage" in window) {
				data = localStorage.getItem("-tfgs-");
			}
			saveload.data = data;
			resolve(data);
		}
	});
}

tfgs.saveload.storage._save = function(data) {
	return new Promise(function(resolve, reject) {
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
				saveload_save2();
			});
		} else {
			saveload_save2();
		}

		function saveload_save2() {
			// if ("indexedDB"in window) {

			// }
			if ("localStorage" in window) {
				localStorage.setItem("-tfgs-", data);
			}
			resolve();
		}
	});
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
