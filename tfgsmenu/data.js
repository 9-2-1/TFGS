function object_format(obj, format) {
	if (typeof format === "object") {
		let fmtobj = Array.isArray(format) ? [] : {};
		for (let x in format) {
			fmtobj[x] = object_format(obj === null || obj === undefined ? undefined : obj[x], format[x]);
		}
		return fmtobj;
	} else {
		switch (format) {
			case "string":
			case "":
				return String(obj);
			case "string!":
			case "!":
				return typeof obj === "string" ? obj : "";
			case "string?":
			case "?":
				return typeof obj === "string" ? obj : undefined;
			case "number":
			case "0":
				return Number(obj);
			case "number!":
			case "0!":
				return typeof obj === "number" ? obj : 0;
			case "number?":
			case "0?":
				return typeof obj === "number" ? obj : undefined;
			case "boolean":
				return Boolean(obj);
			case "boolean!":
			case "false!":
				return typeof obj === "boolean" ? obj : false;
			case "boolean?":
			case "false?":
				return typeof obj === "boolean" ? obj : undefined;
			case "array":
			case "[]": {
				let fmtobj = [];
				for (let x in obj) {
					fmtobj[x] = obj[x];
				};
				return fmtobj;
			}
			case "array!":
			case "[]!":
				return Array.isArray(obj) ? obj : [];
			case "array?":
			case "[]?":
				return Array.isArray(obj) ? obj : undefined;
			case "object":
			case "{}": {
				let fmtobj = {};
				for (let x in obj) {
					fmtobj[x] = obj[x];
				};
				return fmtobj;
			}
			case "object!":
			case "{}!":
				return Object.isObject(obj) ? obj : {};
			case "object?":
			case "{}?":
				return Object.isObject(obj) ? obj : undefined;
			case "any":
				return obj;
		}
	}
};

tfgs.data = {};

tfgs.data.list = {};

tfgs.data.getjson = function() {
	return JSON.stringify(tfgs.data.list);
};

tfgs.data.setjson = function(json) {
	let data = JSON.parse(json);
	let format = {};
	for (let fname in tfgs.func.list) {
		let olist = {};
		for (let oname in tfgs.func.list[fname].option)
			olist[oname] = "any";
		format[fname] = {
			enable: "boolean?",
			data: "any",
			option: olist
		}
		tfgs.data.list = object_format(data, format);
	}
	tfgs.func.datachange();
};

tfgs.data._default = function(data) {
	tfgs.data.list = data;
};

tfgs.data.load = function() {
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
			load2();
		}

		function load2() {
			// if (data === null&&"indexedDB"in window) {

			// }
			if (data === null && "localStorage" in window) {
				data = localStorage.getItem("-tfgs-");
			}
			resolve(data);
		}
	}).then(tfgs.data.setjson);
};

tfgs.data.save = function() {
	return new Promise(function(resolve, reject) {
		let extStorage = null;
		if ("chrome" in window && "storage" in chrome) {
			extStorage = chrome.storage;
		} else if ("browser" in window && "storage" in browser) {
			extStorage = browser.storage;
		}
		if (extStorage !== null) {
			extStorage.sync.setItem({
				"-tfgs-": tfgs.data.getjson()
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
				localStorage.setItem("-tfgs-", tfgs.data.getjson());
			}
			resolve();
		}
	});
};

tfgs.data.import = function() {
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
	}).then(tfgs.data.setjson).then(tfgs.data.save).then(tfgs.menu.load);
};

tfgs.data.export = function() {
	let data = tfgs.data.getjson();
	return new Promise(function(resolve, reject) {
		let a = document.createElement("a");
		a.href = "data:text/plain;charset:utf-8," + data;
		a.download = "tfgs-options.json";
		a.click();
		resolve();
	});
};

tfgs.data.edit = function() {
	return tfgs.funcapi.prompt("-tfgs-", "编辑配置文本", tfgs.data.getjson())
		.then(function(newdata) {
			if (newdata !== null)
				tfgs.data.setjson(newdata);
		});
};
