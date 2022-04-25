/** func */
tfgs.func = {};

tfgs.func.list = {};
tfgs.func.option = {};

tfgs.func.init = function() {
	let list = tfgs.func.list = {};
	let option = tfgs.func.option = {};

	list["-tfgs-"] = {
		"name": "TFGS 配置",
		"author": "TFGS",
		"version": "v0.1.0",
		"info": "点击左上角的对勾打开或者关闭整个插件",
		"enabled": true, // TODO check ##
		// ERROR TODO
		"default": true,
		"options": {
			"website": {
				"type": "text",
				"name": "在这些网站自动启用(没有实装)",
				"info": "只需要输入域名，例如scratch.abc.xyz\n多个域名请用分号隔开",
				"number": false,
				"default": "scratch.mit.edu;kada.163.com;aerfaying.com;gitblock.cn;ccw.site;codingclip.com;world.xiaomawang.com;",
				"check": function(value) {
					if (value.length === 0) {
						return "如果不提供启动列表，将尝试在任何页面启用。"; // ##
					} else if (value.includes('*') || value.includes('?')) {
						return "注意：目前不支持通配符";
					} else {
						return null;
					}
				}
			},
			"export": {
				"type": "button",
				"name": "导出设置",
				"onclick": tfgs.saveload.file.save
			},
			"import": {
				"type": "button",
				"name": "导入设置",
				"onclick": tfgs.saveload.file.load
			},
			"editjson": {
				"type": "button",
				"name": "编辑设置文本",
				"onclick": tfgs.saveload.edit
			}
		},
		"onenable": function() {}, // TODO
		"ondisable": function() {}, // TODO
		"onoption": function() {}
	};

	for (let name in tfgs._func) {
		let tfgsinfo = {};
		tfgsinfo.getoption = function() {
			return tfgs.func.option[name];
		};
		tfgs._func[name](tfgsinfo);
		list[name] = {
			name: tfgsinfo.name,
			author: tfgsinfo.author,
			info: tfgsinfo.info,
			version: tfgsinfo.version,
			default: tfgsinfo.default,
			options: tfgsinfo.options,
			onenable: tfgsinfo.onenable,
			ondisable: tfgsinfo.ondisable,
			onoption: tfgsinfo.onoption
		};
		let defl = {};
		for (let optname in tfgsinfo.options) {
			defl[optname] = tfgsinfo.options[optname].default;
		}
		option[name] = defl;
	}
};

tfgs.func.setoption = function(option) {
	let oldOption = tfgs.func.option;
	let newOption = {};
	let list = tfgs.func.list;
	let changelist = [];
	let enablelist = [];
	for (let name in list) {
		let change = false;
		let oldFuncO = name in oldOption ? oldOption[name] : {};
		let newFuncO = {};
		let funcO = name in option ? option[name] : {};
		let optl = list[name].option;
		for (let optn in optl) {
			newFuncO[optn] = optn in funcO ? funcO[optn] : oldFuncO[optn];
			if (oldFuncO[optn] !== newFuncO[optn]) change = true;
		}
		if (change) changelist.push(name);
		let optn = "_enabled";
		newFuncO[optn] = optn in funcO ? funcO[optn] : oldFuncO[optn];
		if (oldFuncO[optn] !== newFuncO[optn]) enablelist.push(name);
		newOption[name] = newFuncO;
	}
	for (let i in changelist) {
		let f = tfgs.func.list[changelist[i]].onoption;
		if (typeof f === "function")
			f(tfgs.func.option[changelist[i]]);
	}
	for (let i in enablelist) {
		if (tfgs.func.option[enablelist[i]]._enabled)
			f = tfgs.func.list[enablelist[i]].onenable;
		else
			f = tfgs.func.list[enablelist[i]].ondisable;
		if (typeof f === "function") f();
	}
	tfgs.func.option = newOption;
};

tfgs.func.setdata = function(data) {
	let newData = {};
	for (let name in tfgs.func.list) {
		if (name in data) {
			newData[name] = data[name];
		}
	}
	tfgs.func.data = data;
};

tfgs.func.getoption = function() {
	return tfgs.func.option;
};

tfgs.func.getdata = function() {
	return tfgs.func.data;
};

tfgs.func.startup = function() {
	let list = tfgs.func.list;
	for (let name in list) {
		if (tfgs.func.option[name]._enabled) {
			let f = list[name].onenable;
			if (typeof f === "function") f();
		}
	}
};

tfgs.func.enable = function(name) {
	if (tfgs.func.option[name]._enable === false) {
		try {
			tfgs.func.list[name].onenable();
			tfgs.func.list[name].enable = true;
		} catch (e) {
			tfgs.func.error("Enable " + name + ": " + e.message);
		}
	}
};

tfgs.func.disable = function(name) {
	if (tfgs.func.option[name]._enable === true) {
		try {
			tfgs.func.list[name].ondisable();
			tfgs.func.list[name].enable = false;
		} catch (e) {
			tfgs.func.error("Enable " + name + ": " + e.message);
		}
	}
};
