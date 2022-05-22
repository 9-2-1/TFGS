tfgs.funcapi = {};

// 以下name指拓展id

/* debug */
tfgs.funcapi.log = function(name, log) {
	tfgs.log.add(name, "#000000", log);
};

tfgs.funcapi.warn = function(name, log) {
	tfgs.log.add(name, "#808000", log);
};

/* try{...}catch(e){api.onerror(e);} */
/* async(...).then(...).catch(api.onerror); */
tfgs.funcapi.onerror = function(name, err) {
	tfgs.log.add(name, "#E00000", err.message);
};

tfgs.funcapi.error = function(name, log) {
	tfgs.log.add(name, "#E00000", log);
};

tfgs.funcapi.info = function(name, log) {
	tfgs.log.add(name, "#2020F0", log);
};

/* 加载数据(没必要) */
/* tfgs.funcapi.load = function(name) {
	return tfgs.data.load();
}; */

/* 数据处理 */

/* 读取设置 */
tfgs.funcapi.getoption = function(name) {
	return tfgs.data.list[name].option;
};

/* 读取数据 */
tfgs.funcapi.getdata = function(name) {
	return tfgs.data.list[name].data;
};

/* 保存数据，返回Promise */
tfgs.funcapi.setdata = function(name, data) {
	tfgs.data.list[name].data = data;
	return tfgs.data.save();
};

/* 弹窗交互，返回Promise */
tfgs.funcapi.alert = function(name, text) {
	return new Promise(function(resolve, reject) {
		alert(text);
		resolve();
	});
};

tfgs.funcapi.confirm = function(name, text) {
	return new Promise(function(resolve, reject) {
		resolve(confirm(text));
	});
};

tfgs.funcapi.prompt = function(name, text, defau) {
	return new Promise(function(resolve, reject) {
		resolve(prompt(text, defau));
	});
};

/* 为指定name的拓展定制api对象 */
tfgs.funcapi._getapi = function(name) {
	let objapi = {};
	for (let i in tfgs.funcapi) {
		objapi[i] = function() {
			// 在参数列表前面插入name再调用原函数
			let arg = [name];
			for (let i = 0; i < arguments.length; i++)
				arg.push(arguments[i]);
			return tfgs.funcapi[i].apply(tfgs.funcapi, arg);
		}
	}
	// 此时在objapi中可以忽略name调用上面的功能
	return objapi;
};
