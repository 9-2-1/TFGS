tfgs.data = {};

tfgs.data.list = {};

tfgs.data.getjson = function() {
	return JSON.stringify(tfgs.data.list);
};

/* 设置全部数据，触发数据改变的触发器 */
tfgs.data.setjson = function(json) {
	let data = JSON.parse(json);
	if (typeof data !== "object" || data === null) data = {};
	// 按照格式调整data对象
	let formated = {};
	for (let fname in tfgs.func.list) {
		let fdata = typeof data[fname] === "object" || data[fname] === null ? data[fname] : {};
		let formated1 = formated[fname] = {};
		formated1.enable = fdata.enable;
		if (typeof formated1.enable !== "boolean")
			formated1.enable = undefined;
		formated1.data = fdata.data;
		let foption = typeof fdata.option === "object" || fdata.option === null ? fdata.option : {};
		let formated2 = {};
		for (let oname in tfgs.func.list[fname].option)
			formated2[oname] = foption[oname];
		formated1.option = formated2;
	}
	tfgs.data.list = formated;
	tfgs.func.datachange();
};

/* 异步加载拓展数据,返回Promise */
/* 优先级：浏览器拓展存储 > localStorage */
tfgs.data.load = function() {
	return new Promise(function(resolve, reject) {
		// 这里的Promise是为后面转成indexedDB做准备
		let data = localStorage.getItem("-tfgs-");
		resolve(data);
	}).then(tfgs.data.setjson);
};

/* 异步保存拓展数据,返回Promise */
/* 浏览器拓展存储 和 localStorage */
tfgs.data.save = function() {
	return new Promise(function(resolve, reject) {
		localStorage.setItem("-tfgs-", tfgs.data.getjson());
		resolve();
	});
};

/* 加载数据文件 */
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

/* 保存数据文件 */
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

/* 弹窗编辑 */
tfgs.data.edit = function() {
	return tfgs.funcapi.prompt("-tfgs-", "编辑配置文本", tfgs.data.getjson())
		.then(function(newdata) {
			if (newdata !== null)
				tfgs.data.setjson(newdata);
		});
};
