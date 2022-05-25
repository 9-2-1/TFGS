/* (allinone.js) */
let tfgs = {};

try {
	if ("__TFGS$O{{iQq\\\\}{" in window) {
		throw new Error("TFGS 已经安装");
	} else {
		window["__TFGS$O{{iQq\\\\}{"] = "tfgs_installed";
	}

	function _tfgsAddCSS(css) {
		let style = document.createElement("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	}
/* tfgs/button.css */
_tfgsAddCSS(`.tfgsButton {
	display: inline-block;
	min-width: 40px;
	height: 25px;
	line-height: 25px;
	text-align: center;
	font-size: 16px;
	margin: 2px;
	background: white;
	user-select: none;
	border-radius: 2px;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
}

.tfgsButton:active {
	background: #9cf;
}

.tfgsDisable {
	display: none;
}

.tfgsRight {
	float: right;
}
`);
/* tfgs/button.js */
tfgs.button = {};

tfgs.button.create = function() {
	tfgs.menu.create();
};


/* tfgs/data.js */
/* 迟早要加注释 */
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
				}
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
				}
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
}

tfgs.data = {};

tfgs.data.list = {};

tfgs.data.getjson = function() {
	return JSON.stringify(tfgs.data.list);
};

/* 设置全部数据，触发数据改变的触发器 */
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

/* 一个留给tfgs.func.default(恢复默认设置)的后门，其实现在就可以删了 */
/* tfgs.data._default = function(data) {
	tfgs.data.list = data;
};*/

/* 异步加载拓展数据,返回Promise */
/* 优先级：浏览器拓展存储 > localStorage */
tfgs.data.load = function() {
	return new Promise(function(resolve, reject) {
		// 尝试浏览器拓展的存档功能 (chrome.storage, browser.storage)
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
				load2();
			});
		} else {
			load2();
		}

		function load2() {
			// if (data === null&&"indexedDB"in window) {

			// }
			if (data === null && "localStorage" in window) {
				// 不行的话，就用localStorage
				data = localStorage.getItem("-tfgs-");
			}
			resolve(data);
		}
	}).then(tfgs.data.setjson);
};

/* 异步保存拓展数据,返回Promise */
/* 浏览器拓展存储 和 localStorage */
tfgs.data.save = function() {
	return new Promise(function(resolve, reject) {
		// 尝试浏览器拓展的存档功能 (chrome.storage, browser.storage)
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
				save2();
			});
		} else {
			save2();
		}

		function save2() {
			// if ("indexedDB"in window) {

			// }
			// 尝试localStorage
			if ("localStorage" in window) {
				localStorage.setItem("-tfgs-", tfgs.data.getjson());
			}
			resolve();
		}
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


/* tfgs/drag.js */
tfgs.drag = {};

// TODO I remenber that the function I have seen in the source code of Scratch. Later I will grep it out.
function getEventXY() {
	if ("targetTouches" in event) {
		return {
			x: Math.round(event.targetTouches[0].clientX),
			y: Math.round(event.targetTouches[0].clientY)
		};
	}
	return {
		x: Math.round(event.clientX),
		y: Math.round(event.clientY)
	};
}

// Example
// let canceldrag = tfgs.drag.setdrag(div, {
// 	"onStart": function(event) {
// 		if (draggable) {
// 			return {
// 				offsetX,
// 				offsetY
// 			};
// 		} else {
// 			return null;
// 		}
// 	},
// 	"onDrag": function(x, y, event) {
// 		offsetX = x;
// 		offsetY = y
// 		// limits
// 		if (offsetX < 0)
// 			offsetX = 0;
// 		// ...
// 		updateElement();
// 	},
// 	"onEnd": function(mode, event) {
// 		if (mode === "click") {
// 			handleClick();
// 		}
// 	}
// });
// after you want to disable drag...
// canceldrag();

tfgs.drag.setdrag = function(elem, options) {
	//elem
	//options
	//  onStart [!] MUST return current position/offset or null to stop
	//  onMove
	//  onEnd
	let offsetX, offsetY;
	let mode, lastxy;
	let handleDragStart = function(event) {
		let beginPos = options.onStart(event);
		if (beginPos === null) {
			return;
		}
		let xy = getEventXY(event);
		lastxy = xy;
		offsetX = xy.x - beginPos.x;
		offsetY = xy.y - beginPos.y;
		mode = "click";

		window.addEventListener("mousemove", handleDragMove);
		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mouseleave", handleDragEnd);
		window.addEventListener("blur", handleDragEnd);
		elem.addEventListener("touchmove", handleDragMove);
		elem.addEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.cancelBubble = true;
		return false;
	};
	let handleDragMove = function(event) {
		let xy = getEventXY(event);
		if (lastxy.x !== xy.x || lastxy.y !== xy.y) {
			options.onMove(xy.x - offsetX, xy.y - offsetY, event);
			lastxy = xy;
			mode = "drag";
		}
	};
	let handleDragEnd = function(event) {
		options.onEnd(mode, event);

		window.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
		window.removeEventListener("mouseleave", handleDragEnd);
		window.removeEventListener("blur", handleDragEnd);
		elem.removeEventListener("touchmove", handleDragMove);
		elem.removeEventListener("touchend", handleDragEnd);
	};

	elem.addEventListener("mousedown", handleDragStart);
	elem.addEventListener("touchstart", handleDragStart);

	return function canceldrag() {
		elem.removeEventListener("mousedown", handleDragStart);
		elem.removeEventListener("touchstart", handleDragStart);
	};
};


/* tfgs/error.js */
tfgs.error = function(e) {
	alert(e.message);
	console.error(e);
	throw e;
};


/* tfgs/func.js */
tfgs.func = {};

/* 功能列表,格式见下funcinfo */
tfgs.func.list = {};

tfgs.func.add = function(funcinfo) {
	// 格式参考 ../functions/example.js
	// funcinfo
	// |-id
	// |-name
	// |-info
	// |-option
	// | |-(id)
	// | |-name
	// | |-info
	// | |-type
	// | |-min(number)
	// | |-max(number)
	// | |-step(number)
	// | |-maxlength(text)
	// | |-menu(menu)
	// | \-default
	// |-onenable
	// |-ondisable
	// \-onoption
	if (funcinfo.id in tfgs.func.list) throw new Error("id used: " + funcinfo.id);
	tfgs.func.list[funcinfo.id] = {
		name: funcinfo.name,
		info: funcinfo.info,
		default: funcinfo.default,
		option: funcinfo.option,
		onenable: funcinfo.onenable,
		ondisable: funcinfo.ondisable,
		onoption: funcinfo.onoption,
		enable: false
	};
};

/* 重置数据，cleardata代表是否要重置data数据(默认只还原option，也就是拓展菜单里的设置 */
tfgs.func.default = function(cleardata) {
	let defldata = {};
	let flist = tfgs.func.list;
	for (let fname in flist) {
		let olist = flist[fname].option;
		let odefl = {};
		for (let oname in olist) {
			odefl[oname] = olist[oname].default;
		}
		defldata[fname] = {
			"enable": flist[fname].default,
			"option": odefl,
			"data": cleardata ? undefined : fname in tfgs.data.list ? tfgs.data.list[fname].data : undefined
		};
	}
	tfgs.data._default(defldata);
};

/* 设置和数据变化的触发器 */
tfgs.func.datachange = function() {
	tfgs.func.fixoption();
	let flist = tfgs.func.list;
	for (let fname in flist) {
		let e = tfgs.func.list[fname];
		let E = tfgs.data.list[fname].enable;
		if (e.enable !== E) {
			try {
				e[E ? "onenable" : "ondisable"](tfgs.funcapi._getapi(fname));
			} catch (e) {
				tfgs.funcapi.error(fname, "Error: " + e.message);
				console.error(e);
			}
			e.enable = E;
		} else if (E) {
			try {
				e.onoption(tfgs.funcapi._getapi(fname));
			} catch (e) {
				tfgs.funcapi.error(fname, "Error: " + e.message);
				console.error(e);
			}
		}
	}
};

/* 检查设置数据是否符合规则 */
tfgs.func.fixoption = function() {
	let flist = tfgs.func.list;
	for (let fname in flist) {
		if (typeof tfgs.data.list[fname].enable !== "boolean")
			tfgs.data.list[fname].enable = flist[fname].default;
		let olist = flist[fname].option;
		for (let oname in olist) {
			let o = olist[oname];
			let O = tfgs.data.list[fname].option;
			switch (o.type) {
				case "text":
					if (O[oname] === null || O[oname] === undefined) O[oname] = o.default;
					if (typeof O[oname] !== "string") O[oname] = String(O[oname]);
					if ("maxlength" in o && O[oname].length > o.maxlength) O[oname] = O[oname].slice(0, o.maxlength);
					break;
				case "number":
					if (typeof O[oname] !== "number") O[oname] = Number(O[oname]);
					if (isNaN(O[oname])) O[oname] = o.default;
					if (O[oname] < o.min) O[oname] = o.min;
					if (O[oname] > o.max) O[oname] = o.max;
					break;
				case "check":
					if (typeof O[oname] !== "boolean") O[oname] = o.default;
					break;
				case "menu":
					if (!o.value.includes(O[oname])) O[oname] = o.default;
					break;
			}
		}
	}
};


/* tfgs/funcapi.js */
tfgs.funcapi = {};

// 以下name指拓展id

/* ---------- debug ---------- */
tfgs.funcapi.log = function(name, log) {
	console.log(name, log);
	tfgs.log.add(name, "#000000", log);
};

tfgs.funcapi.warn = function(name, log) {
	console.warn(name, log);
	tfgs.log.add(name, "#808000", log);
};

/* try{...}catch(e){api.onerror(e);} */
/* async(...).then(...).catch(api.onerror); */
tfgs.funcapi.onerror = function(name, err) {
	console.error(name, err);
	tfgs.log.add(name, "#E00000", err.message);
};

tfgs.funcapi.error = function(name, log) {
	console.error(name, log);
	tfgs.log.add(name, "#E00000", log);
};

tfgs.funcapi.info = function(name, log) {
	console.info(name, log);
	tfgs.log.add(name, "#2020F0", log);
};

/* 加载数据(没必要) */
/* tfgs.funcapi.load = function(name) {
	return tfgs.data.load();
}; */

/* ---------- 数据处理 ---------- */

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

/* ---------- 弹窗交互，返回Promise ---------- */

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

/* ---------- 为指定name的拓展定制api对象 ---------- */

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


/* tfgs/log.css */
_tfgsAddCSS(`.tfgsLogFormat {
	display: block;
	white-space: pre-wrap;
	word-break: break-all;
	font-family: monospace;
	font-size: 15;
	overflow: scroll;
}

.tfgsLogFormat>*:nth-child(odd) {
	background: #f0f8ff;
}

.tfgsLogFormat>*:nth-child(even) {
	background: #def;
}

.tfgsLogContent {
	height: calc(100% - 30px);
	background: #fff;
}

.tfgsLogButtons {
	height: 30px;
	background: var(--tfgsWindowColor);
}
`);
/* tfgs/log.js */
function isstr(x) {
	return typeof x === "string";
}

function element(tagname, classname, type) {
	let ele = document.createElement(tagname);
	if (isstr(classname)) ele.className = classname;
	if (isstr(type)) ele.type = type;
	return ele;
}

tfgs.log = {};

tfgs.log.list = [];

tfgs.log.dispIntv = null;

tfgs.log.add = function(name, color, log) {
	tfgs.log.list.push({
		name: name,
		color: color,
		log: log
	});
	while (tfgs.log.list.length > 500)
		tfgs.log.list.splice(0, 1);
	tfgs.log.changed = true;
};

tfgs.log.clear = function() {
	tfgs.log.list = [];
	tfgs.log.changed = true;
};

tfgs.log.displayInterval = function(div, fliter) {
	tfgs.log.display(div, fliter);
	tfgs.log.changed = false;
	return setInterval(function() {
		let x = div.scrollX,
			y = div.scrollY;
		if (tfgs.log.changed) {
			div.innerHTML = "";
			tfgs.log.display(div, fliter);
			tfgs.log.logwin.flash(500, 3, true);
			tfgs.log.changed = false;
		}
		div.scrollX = x;
		div.scrollY = y;
	}, 100);
};

tfgs.log.display = function(div, fliter) {
	div.classList.add("tfgsLogFormat");
	for (let i in tfgs.log.list) {
		let log1 = tfgs.log.list[i];
		if (fliter.name === null || fliter.name.includes(log1.name))
			if (fliter.color === null || fliter.color.includes(log1.color)) {
				let eline = element("div");
				eline.style.color = log1.color;
				eline.innerText = log1.name + "\t" + log1.log;
				div.appendChild(eline);
			}
	}
};

tfgs.log.create = function(x, y) {
	try {
		if (tfgs.log.dispIntv !== null) {
			tfgs.log.logwin.movetotop();
			tfgs.log.logwin.flash(200, 3, false);
			return;
		}
		let logwin = tfgs.log.logwin = tfgs.window.create({
			title: "日志",
			x: typeof x === "number" ? x : 20,
			y: typeof y === "number" ? y : 20,
			width: 200,
			height: 200,
			minWidth: 100,
			minHeight: 50,
			minimizeWidth: 70
		});
		let logdiv = logwin.innerDiv;
		logdiv.innerHTML = `
<div class="tfgsLogContent"></div>
<div class="tfgsLogButtons">
	<span class="tfgsButton tfgsRight">清空</span>
</div>
`;
		let contentdiv = logdiv.children[0];
		let buttondiv = logdiv.children[1];
		let bclear = buttondiv.children[0];
		tfgs.log.dispIntv = tfgs.log.displayInterval(contentdiv, {
			"name": null,
			"color": null
		});
		bclear.addEventListener("click", function() {
			tfgs.log.clear();
		});
		logwin.onClose = function() {
			clearInterval(tfgs.log.dispIntv);
			logdiv.remove();
			tfgs.log.dispIntv = null;
		};
	} catch (e) {
		tfgs.error(e);
	}
};


/* tfgs/menu.css */
_tfgsAddCSS(`.tfgsMenuContent {
	height: calc(100% - 30px);
	background: #f0f8ff;
	overflow: auto;
	text-align: center;
}

.tfgsMenuButtons {
	height: 30px;
	background: var(--tfgsWindowColor);
}

.tfgsMenuFunc {
	margin: 5px;
	border-radius: 2px;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
	overflow: hidden;
	text-align: left;
}

.tfgsMenuFuncOption {
	background: #def;
	padding: 2px;
}

.tfgsMenuFuncOptionOne {
	display: inline-block;
	margin: 2px;
	padding: 2px;
	background: #bdf;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
	border-radius: 2px;
	min-width: calc(25% - 10px);
	max-width: calc(100% - 10px);
}

.tfgsMenuFunc input,
.tfgsMenuFunc select {
	position: relative;
	vertical-align: middle;
	border: none;
	background: white;
	width: 100px;
	height: 20px;
	margin: 2px;
	padding: 2px;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
	border-radius: 2px;
}

.tfgsMenuFuncOptionOne>input {
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5) inset;
}

.tfgsMenuFuncOptionOne>input[type="checkbox"],
.tfgsMenuFuncTitle>input {
	width: 20px;
	height: 20px;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
}

.tfgsMenuFunc input:active,
.tfgsMenuFunc select:active {
	background: #9cf;
}

.tfgsMenuFunc input:focus,
.tfgsMenuFunc select:focus {
	background: #def;
	outline: none;
}

.tfgsMenuFuncTitle {
	background: #08f;
	color: white;
	padding: 2px;
	font-weight: bold;
	font-family: monospace;
}

.tfgsMenuFuncInfo {
	font-size: 12px;
}

.tfgsMenuFuncName {
	font-size: 15px;
}
`);
/* tfgs/menu.js */
tfgs.menu = {};

tfgs.menu.menuwin = null;

tfgs.menu.modi = false;

window.addEventListener("beforeunload", function(event) {
	if (tfgs.menu.modi) {
		event.preventDefault();
		event.returnValue = "";
		return "";
	}
});

tfgs.menu.setmodi = function(modi) {
	if (modi !== tfgs.menu.modi) {
		let buttons = tfgs.menu.buttons;
		for (let i in buttons) {
			let flip = true;
			switch (i) {
				case "edit":
					continue;
				case "save":
				case "cancel":
					flip = false;
			}
			buttons[i].classList[modi === flip ? "add" : "remove"]("tfgsDisable");
		}
		tfgs.menu.menuwin.title = modi ? "TFGS 选项 (未保存)" : "TFGS 选项";
		tfgs.menu.menuwin.canMinimize = !modi;
		tfgs.menu.menuwin._refresh();
		tfgs.menu.modi = modi;
	}
};

tfgs.menu.create = function() {
	if (tfgs.menu.menuwin !== null)
		return;
	let element = function(tagName, className, type) {
		let ele = document.createElement(tagName);
		if (className !== undefined) ele.className = className;
		ele.className = className;
		if (type !== undefined) ele.type = type;
		return ele;
	};
	let menuwin = tfgs.window.create({
		title: "TFGS选项",
		canMinimize: true,
		canClose: false,
		x: 50,
		y: 50,
		width: 250,
		height: 250,
		minWidth: 200,
		minHeight: 100,
		minimizeWidth: 100
	});
	menuwin.minimize();
	let menudiv = menuwin.innerDiv;
	menudiv.innerHTML = `
<div class="tfgsMenuContent">
	<!--<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>-->
</div>
<div class="tfgsMenuButtons">
	<span class="tfgsButton">导出</span>
	<span class="tfgsButton">导入</span>
	<span class="tfgsButton tfgsDisable">编辑文本</span>
	<span class="tfgsButton tfgsRight">显示日志</span>
	<span class="tfgsButton tfgsRight tfgsDisable">取消更改</span>
	<span class="tfgsButton tfgsDisable">保存更改</span>
</div>
`;
	let contentdiv = tfgs.menu.contentdiv = menudiv.children[0];
	let buttondiv = tfgs.menu.buttondiv = menudiv.children[1];
	let buttons = tfgs.menu.buttons = {};

	buttons.export = buttondiv.children[0];
	buttons.import = buttondiv.children[1];
	buttons.edit = buttondiv.children[2];
	buttons.log = buttondiv.children[3];
	buttons.cancel = buttondiv.children[4];
	buttons.save = buttondiv.children[5];

	buttons.export.addEventListener("click", function() {
		if (!tfgs.menu.modi) tfgs.data.export();
	});
	buttons.import.addEventListener("click", function() {
		if (!tfgs.menu.modi) tfgs.data.import().catch(tfgs.error);
	});
	buttons.edit.addEventListener("click", function() {
		if (!tfgs.menu.modi)
			tfgs.data.edit().then(tfgs.data.save).then(tfgs.menu.load).catch(tfgs.error);
	});
	buttons.log.addEventListener("click", function() {
		if (!tfgs.menu.modi)
			tfgs.log.create();
	});
	let _menumin = false;
	menuwin.onResize = function() {
		if (_menumin !== menuwin.isMinimize) {
			if (menuwin.isMinimize) {
				if (tfgs.menu.modi) menuwin.restore();
			} else {
				tfgs.menu.load();
			}
			_menumin = menuwin.isMinimize;
		}
	};
	buttons.save.addEventListener("click", function() {
		if (tfgs.menu.modi) {
			try {
				tfgs.menu.save().then(function() {
					tfgs.menu.load();
					tfgs.menu.setmodi(false);
				}).catch(tfgs.error);
			} catch (e) {
				tfgs.error(e);
			}
		}
	});
	buttons.cancel.addEventListener("click", function() {
		if (tfgs.menu.modi) {
			if (confirm("取消更改？")) {
				try {
					tfgs.menu.load();
					tfgs.menu.setmodi(false);
				} catch (e) {
					alert(e.message);
				}
			}
		}
	});

	let flist = tfgs.func.list;
	let list = tfgs.menu.list = {};
	for (let fname in flist) {
		let f = flist[fname];
		let funcdiv = element("div", "tfgsMenuFunc");
		funcdiv.innerHTML = `
<div class="tfgsMenuFuncTitle">
	<input type="checkbox"></input>
	<span class="tfgsMenuFuncName"></span>
	<span class="tfgsMenuFuncInfo"></span>
</div>
<div class="tfgsMenuFuncOption"></div>
`;
		let fl = list[fname] = {};
		fl.enable = funcdiv.children[0].children[0]
		fl.enable.addEventListener("change", function() {
			tfgs.menu.setmodi(true);
		});
		fl.option = {};
		funcdiv.children[0].children[1].innerText = f.name;
		let frame = function(x, y) {
			if (x !== undefined && x !== null && x !== "") return x + y;
			else return "";
		};
		funcdiv.children[0].children[2].innerText = frame(f.version, " ") + frame(f.author, " ") + frame(f.info, "");
		let fopdiv = funcdiv.children[1];
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let lab, inp;
			lab = element("label");
			lab.innerText = o.name;
			switch (o.type) {
				case "number":
					inp = element("input", undefined, "number");
					break;
				case "text":
					inp = element("input");
					break;
				case "check":
					inp = element("input", undefined, "checkbox");
					break;
				case "menu":
					inp = element("select");
					for (let i in o.menu) {
						let op = element("option");
						op.innerText = o.menu[i];
						op.value = i;
						inp.appendChild(op);
					}
					break;
				default:
					throw new Error("Unsupport type: " + o.type);
			}
			fl.option[oname] = inp;

			let fopdiv1 = element("span", "tfgsMenuFuncOptionOne");

			fopdiv1.appendChild(lab);
			fopdiv1.appendChild(inp);

			fopdiv.appendChild(fopdiv1);
			inp.addEventListener("input", function() {
				tfgs.menu.setmodi(true);
			});
			inp.addEventListener("paste", function() {
				tfgs.menu.setmodi(true);
			});
			inp.addEventListener("change", function() {
				tfgs.menu.setmodi(true);
			});
		}
		contentdiv.appendChild(funcdiv);
	}

	tfgs.menu.menuwin = menuwin;

	tfgs.menu.load();
}

tfgs.menu.save = function() {
	tfgs.data.setjson(tfgs.menu._json());
	return tfgs.data.save();
};

tfgs.menu._json = function() {
	let flist = tfgs.func.list;
	let mlist = tfgs.menu.list;
	let json = {};
	for (let fname in flist) {
		let f = flist[fname];
		let m = mlist[fname];
		let d = json[fname] = {};
		d.enable = m.enable.checked;
		d.option = {};
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let mi = m.option[oname];
			switch (o.type) {
				case "number":
					d.option[oname] = Number(mi.value);
					break;
				case "text":
					d.option[oname] = mi.value;
					break;
				case "check":
					d.option[oname] = mi.checked;
					break;
				case "menu":
					d.option[oname] = o.value[Number(mi.value)];
					break;
				default:
					throw new Error("类型错误: " + o.type);
			}
		}
	}
	//alert(JSON.stringify(json));
	return JSON.stringify(json);
};

tfgs.menu.load = function() {
	let flist = tfgs.func.list;
	let dlist = tfgs.data.list;
	let mlist = tfgs.menu.list;
	for (let fname in flist) {
		let f = flist[fname];
		let d = dlist[fname];
		let m = mlist[fname];
		m.enable.checked = d.enable;
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let mi = m.option[oname];
			let di = d.option[oname];
			switch (o.type) {
				case "number":
					mi.value = di;
					break;
				case "text":
					mi.value = di;
					break;
				case "check":
					mi.checked = di;
					break;
				case "menu":
					if (o.value.includes(di))
						mi.options[o.value.indexOf(di)].selected = true;
					break;
				default:
					throw new Error("Unsupport type: " + o.type);
			}
		}
	}
};

tfgs.menu.delete = function() {
	tfgs.menu.menuwin.canClose = true;
	tfgs.menu.menuwin.close();
	tfgs.menu.menuwin = null;
};


/* tfgs/window.css */
_tfgsAddCSS(`.tfgsWindow.tfgsEmergency {
	--tfgsWindowColor: #f80;
}

.tfgsWindow {
	--tfgsWindowColor: #08f;
	box-shadow: 0px 0px 2px black;
	position: fixed;
	background: white;
	border: 3px solid var(--tfgsWindowColor);
	border-radius: 3px;
	overflow: hidden;
	box-sizing: border-box;
}

.tfgsWindow * {
	box-sizing: content-box;
}

.tfgsWindowTitle {
	background: var(--tfgsWindowColor);
	display: flex;
	display: -webkit-flex;
	flex-flow: row nowrap;
	align-items: center;
	border-bottom: 3px solid var(--tfgsWindowColor);
	color: white;
	font-family: sans-serif;
	font-size: 16px;
	line-height: 20px;
	height: 20px;
}

.tfgsWindowTitle>span {
	width: 20px;
	height: 20px;
	text-align: center;
	flex: none;
	user-select: none;
	-moz-user-select: none;
}

.tfgsWindowTitle>span:active {
	background: rgba(0, 0, 0, 0.25);
	box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3) inset;
}

.tfgsWindowTitle>.tfgsWindowText {
	width: fit-content;
	flex: auto;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-overflow: "...";
	position: relative;
}

.tfgsWindowTitle>.tfgsWindowText:active {
	background: none;
	box-shadow: none;
}

.tfgsWindowContent {
	height: calc(100% - 20px - 2px);
	overflow: auto;
	position: relative;
}

.tfgsWindowResize {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 0;
	height: 0;
	border-left: 15px solid transparent;
	border-bottom: 15px solid var(--tfgsWindowColor);
	cursor: se-resize;
}

.tfgsWindowResize:after {
	content: "=";
	position: absolute;
	left: -8px;
	top: 0px;
	transform: rotate(-45deg);
	color: white;
}
`);
/* tfgs/window.js */
tfgs.window = {};

tfgs.window.zIndex = 1e6;

tfgs.window.create = function(options) {
	let windowobj = {
		/* elements */
		titleDiv: null,
		innerDiv: null,
		windowDiv: null,
		resizeDiv: null,

		/* position */
		x: NaN,
		y: NaN,
		width: 400,
		height: 300,
		minHeight: 0,
		minWidth: 100, // 正常模式最小宽度
		minimizeWidth: 100, // 最小化时的宽度

		/* settings */
		title: "",

		/* options */
		haveLogo: true,
		canMinimize: true,
		canMaximize: true,
		canClose: true,
		canResize: true,
		canMove: true,

		/* callback */
		onClose: function() {},
		onResize: function() {},
		onMove: function() {},

		/* status */
		isMinimize: false,
		isMaximize: false,
		posRestore: {},
		flashMode: false,
		flashTimer: -1,

		/* functions */
		_rememberPos: function() {
			if (!this.isMinimize && !this.isMaximize) {
				this.posRestore.x = this.x;
				this.posRestore.y = this.y;
				this.posRestore.width = this.width;
				this.posRestore.height = this.height;
			}
		},
		minimize: function() {
			this._rememberPos();
			this.isMinimize = true;
			this.isMaximize = false;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		maximize: function() {
			this._rememberPos();
			this.isMinimize = false;
			this.isMaximize = true;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		restore: function() {
			if (this.isMaximize) {
				this.x = this.posRestore.x;
				this.y = this.posRestore.y;
			}
			this.width = this.posRestore.width;
			this.height = this.posRestore.height;
			this.isMinimize = false;
			this.isMaximize = false;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		movetotop: function() {
			this.windowDiv.style.zIndex = ++tfgs.window.zIndex;
			if (this.flashMode) {
				this.windowDiv.classList.remove("tfgsEmergency");
				this.flashMode = false;
			}
			if (this.flashTimer !== -1) {
				clearInterval(this.flashTimer);
				this.flashTimer = -1;
			}
		},
		close: function() {
			if (this.onClose() === false) return;
			this.windowDiv.remove();
			this.windowDiv = null;
			window.removeEventListener("resize", windowDiv._resizeCallback);
		},
		resize: function(w, h) {
			if (w === this.width && h === this.height) return;
			this.width = w;
			this.height = h;
			this._refresh();
			this.onResize();
		},
		move: function(x, y) {
			if (x === this.x && y === this.y) return;
			this.x = x;
			this.y = y;
			this._refresh();
			this.onMove();
		},
		flash: function(time, count, stay) {
			if (this.flashTimer !== -1) {
				clearInterval(this.flashTimer);
				// this.flashTimer=-1;
			}
			this.windowDiv.classList.add("tfgsEmergency");
			let flash = true;
			let that = this;
			this.flashTimer = setInterval(function() {
				if (count > 0) {
					if (!flash) {
						that.windowDiv.classList.add("tfgsEmergency");
						flash = true;
					} else {
						that.windowDiv.classList.remove("tfgsEmergency");
						flash = false;
						count--;
					}
				} else {
					if (stay) {
						that.windowDiv.classList.add("tfgsEmergency");
						flash = true;
					}
					clearInterval(that.flashTimer);
					that.flashTimer = -1;
				}
				that.flashMode = flash;
			}, time);
		},
		_refresh: function() {
			let sX = window.innerWidth,
				sY = window.innerHeight;
			if (this.isMaximize) {
				this.x = 0;
				this.y = 0;
				this.width = sX;
				this.height = sY;
			} else {
				let mX = this.minWidth + 6,
					mY = this.minHeight + 26,
					x = this.x,
					y = this.y,
					w = this.width,
					h = this.height;
				if (this.isMinimize) {
					w = this.minimizeWidth + 6;
					h = 26;
				} else {
					if (w < mX) w = mX;
					if (h < mY) h = mY;
					if (w > sX) w = sX;
					if (h > sY) h = sY;
				}

				let X = x + w,
					Y = y + h;
				if (isNaN(x)) x = Math.floor(Math.random() * (sX - w));
				if (isNaN(y)) y = Math.floor(Math.random() * (sY - h));
				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (X > sX) x -= X - sX;
				if (Y > sY) y -= Y - sY;

				this.x = x;
				this.y = y;
				this.width = w;
				this.height = h;
			}

			let styl = this.windowDiv.style;
			styl.left = this.x + "px";
			styl.top = this.y + "px";
			styl.width = this.width + "px";
			styl.height = this.height + "px";

			showhide(this.titleDiv.children[0],
				!this.isMinimize && this.haveLogo);
			this.titleDiv.children[1].innerText = this.title;
			showhide(this.titleDiv.children[2],
				!this.isMinimize && this.canMinimize);
			showhide(this.titleDiv.children[3],
				this.isMaximize);
			showhide(this.titleDiv.children[4],
				!this.isMinimize && !this.isMaximize && this.canMaximize);
			showhide(this.titleDiv.children[5],
				this.canClose);
			showhide(this.innerDiv,
				!this.isMinimize);
			showhide(this.resizeDiv,
				!this.isMinimize && !this.isMaximize && this.canResize);
		}
	};

	windowobj = Object.assign(windowobj, options);
	let windowDiv = element("div", "tfgsWindow");
	windowDiv.innerHTML = `
<div class="tfgsWindowTitle">
	<span>≡</span>
	<span class="tfgsWindowText"></span>
	<span>_</span>
	<span>▭</span>
	<span>□</span>
	<span>✕</span>
</div>
<div class="tfgsWindowContent"></div>
<div class="tfgsWindowResize"></div>
`;
	document.body.appendChild(windowDiv);
	windowDiv.style.zIndex = ++tfgs.window.zIndex;

	windowDiv._resizeCallback = function() {
		windowobj._refresh();
		windowobj.onResize();
	};

	window.addEventListener("resize", windowDiv._resizeCallback);

	let titleDiv = windowDiv.children[0];
	let innerDiv = windowDiv.children[1];
	let resizeDiv = windowDiv.children[2];

	let titleDivs = titleDiv.children;

	// 不能写成
	// windowDiv.addEventListener("mousedown", windowobj.movetotop, true);
	// 否则里面的this会指向windowDiv而不是windowobj

	windowDiv.addEventListener("mousedown", function(event) {
		windowobj.movetotop();
	}, true);

	titleDivs[2].addEventListener("click", function(event) {
		windowobj.minimize();
	});

	titleDivs[3].addEventListener("click", function(event) {
		windowobj.restore();
	});

	titleDivs[4].addEventListener("click", function(event) {
		windowobj.maximize();
	});

	titleDivs[5].addEventListener("click", function(event) {
		windowobj.close();
	});

	let moveObj = {
		onStart: function(event) {
			if (windowobj.isMaximize)
				return null;
			windowobj.movetotop();
			return {
				x: windowobj.x,
				y: windowobj.y
			};
		},
		onMove: function(x, y, event) {
			if (windowobj.canMove)
				windowobj.move(x, y);
		},
		onEnd: function(mode, event) {
			if (mode === "click") {
				if (windowobj.isMinimize)
					windowobj.restore();
			}
		}
	};

	tfgs.drag.setdrag(titleDivs[0], moveObj);
	tfgs.drag.setdrag(titleDivs[1], moveObj);

	tfgs.drag.setdrag(resizeDiv, {
		onStart: function(event) {
			return {
				x: windowobj.width,
				y: windowobj.height
			};
		},
		onMove: function(x, y, event) {
			windowobj.resize(x, y);
		},
		onEnd: function(mode, event) {}
	});

	windowobj.windowDiv = windowDiv;
	windowobj.titleDiv = titleDiv;
	windowobj.innerDiv = innerDiv;
	windowobj.resizeDiv = resizeDiv;

	windowobj._refresh();
	windowobj.flash(300, 1, false);

	return windowobj;
};

function showhide(x, show) {
	x.style.display = show ? "inherit" : "none";
}


/* functions/copyblock.js */
! function() {
	let api;
	// 左边是积木区，右边是积木拖出区
	let workspace, flyoutWorkspace;
	let injectionDiv;
	// 打开重试计时器
	let opening = -1;
	// 积木菜单检测计时器 *
	let blockMenuTimer = -1;
	let blockMenuTime = 0;
	const blockMenuTimeout = 1200; // ms

	// 打开 tfgs
	function TFGSON(_api, tryCount) {
		api = _api;
		tryCount = tryCount === undefined ? 0 : tryCount;
		//部分社区的界面会加载，尝试多次
		try {
			workspace = Blockly.getMainWorkspace();
			flyoutWorkspace = workspace.getFlyout().getWorkspace();
			injectionDiv = document.getElementsByClassName("injectionDiv")[0];
			injectionDiv.addEventListener("touchstart", on_blockTouch, true);
			//injectionDiv.addEventListener("touchmove",on_blockTouch,true);
			//injectionDiv.addEventListener("touchstop",on_blockTouch,true);
			document.body.addEventListener("mousedown", on_blockMousedown, true);
			api.log("打开 TFGS");
			api.log(workspace, flyoutWorkspace);
		} catch (err) {
			api.onerror(err);
			api.log("TFGS 启动失败次数: ", tryCount + 1);
			opening = setTimeout(function() {
				TFGSON(api, tryCount + 1);
			}, 1000);
			return;
		}
	}

	function TFGSOFF() {
		// 停止重试
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		// 把事件响应函数卸掉就是关闭了
		if (injectionDiv) {
			injectionDiv.removeEventListener("touchstart", on_blockTouch, true);
		}
		//injectionDiv.removeEventListener("touchmove",on_blockTouch,true);
		//injectionDiv.removeEventListener("touchstop",on_blockTouch,true);
		document.body.removeEventListener("mousedown", on_blockMousedown, true);
		api.log("关闭 TFGS");
	}

	function on_blockMousedown(event) {
		if (event.button === 2) { // 右键
			on_blockMenuPossible(event.clientX, event.clientY);
		}
	}

	function on_blockTouch(event) {
		if (event.touches.length === 0) {
			return;
		}
		let touch = event.touches[0];
		on_blockMenuPossible(touch.clientX, touch.clientY);
	}

	function on_blockMenuPossible(x, y) {
		let element = document.elementFromPoint(x, y);
		let blockBox, blockId;
		if (element === null) {
			return;
		}
		//api.log(element);
		let clickSVG = getSVG(element);
		if (clickSVG === null) {
			return;
		}
		blockBox = clickSVG.classList.contains("blocklyFlyout");
		blockId = getBlockId(element);
		if (blockMenuTimer !== -1) {
			clearInterval(blockMenuTimer);
			blockMenuTimer = -1;
		}
		blockMenuTime = 0;
		blockMenuTimer = setInterval(function() {
			let menu = document.getElementsByClassName("blocklyContextMenu");
			if (menu.length !== 0) {
				clearInterval(blockMenuTimer);
				blockMenuTimer = -1;
				on_blockMenu(blockBox, blockId, menu[0]);
			} else {
				blockMenuTime += 10;
				if (blockMenuTime >= blockMenuTimeout) {
					clearInterval(blockMenuTimer);
					blockMenuTimer = -1;
				}
			}
		}, 10);
	}

	function on_blockMenu(blockBox, blockId, menu) {
		if (blockId !== null) {
			addToContextMenu("复制这个积木", function() {
				copyToXML(blockId, false, true);
				menu.remove();
			}, menu);
			/*addToContextMenu("复制以下积木", function() {
				copyToXML(blockId, false, false);
				menu.remove();
			}, menu);*/
			addToContextMenu("复制这组积木", function() {
				copyToXML(blockId, true, false);
				menu.remove();
			}, menu);
		} else {
			addToContextMenu("复制全部积木", function() {
				copyToXML(null, true, false);
				menu.remove();
			}, menu);
			addToContextMenu("粘贴积木文本", function() {
				pasteFromXML();
				menu.remove();
			}, menu);
		}
	}

	function getSVG(element) {
		while (element !== null && element.tagName.toLowerCase() !== "svg") {
			element = element.parentElement;
		}
		return element;
	}

	function getBlockId(element) {
		while (element !== null &&
			element.tagName.toLowerCase() !== "svg"
		) {
			if (element.tagName.toLowerCase() === "g") {
				let id = element.getAttribute("data-id");
				if (id !== null) {
					return id;
				}
			}
			element = element.parentElement;
		}
		return null;
	}

	function addToContextMenu(name, callback, element) {
		let menuItem = document.createElement("div");
		menuItem.classList.add("goog-menuitem");
		menuItem.setAttribute("role", "menuitem");
		menuItem.style.userSelect = "none";
		menuItem.innerText = name;
		menuItem.addEventListener("click", callback);
		element.parentElement.style.height = "4500px";
		element.appendChild(menuItem);
	}

	function pasteFromXML() {
		navigator.clipboard.readText().then(function(data) {
			let blockXML = Blockly.Xml.textToDom(data);
			let blockIds = Blockly.Xml.domToWorkspace(blockXML, workspace);
			if (blockIds.length === 0) {
				throw new Error("粘贴失败");
			}
			let met = workspace.getMetrics();
			let posX = met.viewLeft + 15;
			let posY = met.viewTop + 15;
			for (let i = 0; i < blockIds.length; i++) {
				let bl = workspace.getBlockById(blockIds[i]);
				if (bl.getParent() === null) {
					let oldpos = bl.getRelativeToSurfaceXY();
					bl.moveBy(
						posX / workspace.scale - oldpos.x,
						posY / workspace.scale - oldpos.y
					);
					posY += (bl.getHeightWidth().height + 30) * workspace.scale;
				}
			}
		}).catch(api.onerror);
	}

	function copyToXML(blockId, loadPrev, deleNext) {
		try {
			let blockXML = Blockly.Xml.workspaceToDom(workspace);
			let blockThisXML;
			if (blockId === null) {
				blockThisXML = Blockly.Xml.domToText(blockXML, workspace);
			} else {
				let blockThis = findBlock(blockXML, blockId);
				while (blockThis !== null &&
					blockThis.tagName.toLowerCase() !== "block"
				) {
					blockThis = blockThis.parentElement;
				}
				if (blockThis === null) {
					throw new Error('复制失败:找不到积木');
				}
				if (deleNext) {
					let bc = blockThis.children;
					for (let i = 0; i < bc.length; i++) {
						if (bc[i].tagName.toLowerCase() === "next") {
							bc[i].remove();
							i--;
						}
					}
				}
				if (loadPrev) {
					while (blockThis.parentElement !== null &&
						(blockThis.parentElement.tagName.toLowerCase() === 'block' ||
							blockThis.parentElement.tagName.toLowerCase() === 'next')
					) {
						blockThis = blockThis.parentElement;
					}
				}
				blockThisXML = "<xml>" + Blockly.Xml.domToText(blockThis, workspace) + "</xml>";
			}
			navigator.clipboard.writeText(blockThisXML).then(function() {
				//alert('复制成功');
			}).catch(api.onerror);
		} catch (e) {
			api.onerror(e);
		}
	}

	function findBlock(blockXML, blockId) {
		if (blockXML.getAttribute('id') === blockId) {
			return blockXML;
		} else {
			let bc = blockXML.children;
			for (let i = 0; i < bc.length; i++) {
				let find = findBlock(bc[i], blockId);
				if (find !== null) {
					return find;
				}
			}
			return null;
		}
	}

	tfgs.func.add({
		id: "copyblock",
		name: "复制积木为文字",
		info: "在右键菜单中添加“复制积木”“粘贴积木”选项，可以跨作品复制，或者粘贴到记事本(是xml格式)",
		default: false,
		option: {},
		onenable: TFGSON,
		ondisable: TFGSOFF,
		onoption: function() {}
	});
}();


/* functions/example.js */
let oldtitle;
tfgs.func.add({
	id: "example",
	name: "自定义窗口标题", // 设定功能名字
	author: "作者名字", // 设定作者(可选)
	version: "v0.1.0", // 设定版本(可选)
	info: "让你能够修改窗口的标题", // 设定说明(可选)
	default: false, // 是否默认启用
	option: { // 设定选项列表
		"title": { // 选项变量名
			"type": "text", // 选项类型，text 文字，number数字，check 复选框(开关)，select 选项列表
			"name": "窗口标题", // 选项旁边的文字
			"maxlength": 16, // 设定文本最大长度
			// "max": 9, // 数字最大值
			// "min": 1, // 数字最小值
			// "menu": ["a", "b", "c"], // 选项列表
			// "value": [1, 2, 3], // 选项对应的数值
			"default": "示例标题" // 默认值
		}
		// 可以添加更多内容
	},
	onenable: function(api) {
		oldtitle = document.title;
		document.title = api.getoption().title;
	},
	ondisable: function(api) {
		document.title = oldtitle;
	},
	// onoption 只有在功能启用时改选项才触发
	onoption: function(api) {
		document.title = api.getoption().title;
	}
});


/* functions/forcecolor.js */
! function() {
	let api = null;
	let interval = -1;
	let winob = null;

	function getReactInternel(elem) {
		let keys = Object.keys(elem);
		let rII = null;
		for (let i in keys)
			if (keys[i].slice(0, 24) === "__reactInternalInstance$")
				rII = keys[i];
		if (rII === null)
			throw new Error("reactInternelInstance not found");
		return rII;
	}

	// 获取 redux store, 里面有vm和绘画参数
	function getStore() {
		let gp = document.querySelector('[class^=gui_page-wrapper_]');
		let keys = Object.keys(gp);
		let rII = null;
		for (let i in keys)
			if (keys[i].slice(0, 24) === "__reactInternalInstance$")
				rII = keys[i];
		if (rII === null)
			throw new Error("reactInternelInstance not found");
		let st = gp[rII].child.stateNode.store;
		// st.getState().scratchGui.vm; -- vm
		// st.getState().scratchPaint.color.
		// fillColor strokeColor strokeWidth gradientType primary secondary
		// SOLID VERTICAL HORIZONTAL RADIAL

		// st.dispatch({type: "xxx", ...args})
		return st;
	}

	function forcesetcolor(id, data) {
		// step 1
		let div = selectElement("paint-editor_editor-container-top_")
		div = div.children[1].children[0].children[id];
		let key = getReactInternel(div);
		let stateNode = div[key].return.return.return.stateNode;
		stateNode.handleChangeGradientType(data.gradientType);
		stateNode.props.onChangeColorIndex(0);
		stateNode.handleChangeColor(data.primary);
		if (data.gradientType !== "SOLID") {
			stateNode.props.onChangeColorIndex(1);
			stateNode.handleChangeColor(data.secondary);
		}
		stateNode.handleCloseColor();
		stateNode.props.onUpdateImage();

		// step 2
		let st = getStore();
		let color = st.getState().scratchPaint.color;
		let colid = id === 1 ? "strokeColor" : "fillColor";
		color[colid].gradientType = data.gradientType;
		color[colid].primary = data.primary;
		color[colid].secondary = data.secondary;
		let vm = st.getState().scratchGui.vm;
		vm.refreshWorkspace();
	}

	function selectElement(namebegin) {
		return document.querySelector(`[class^=${namebegin}],[class*= ${namebegin}]`);
	}

	function showwindow() {
		if (winob !== null) return;
		winob = tfgs.window.create({
			title: "forceColor",
			haveLogo: false,
			canClose: false,
			canMaximize: false,
			canMinimize: false,
			x: 100,
			y: 80,
			minHeight: 120,
			minWidth: 80,
			width: 80,
			height: 120
		});
		let win = winob.innerDiv;
		win.innerHTML = `
<input type="text" value="0"></input><br/>
<input type="text" value="#00ff00"></input><br/>
<input type="text" value="#ff0000"></input><br/>
<input type="text" value="SOLID"></input><br/>
<input type="button" value="PUSH"></input>
`;
		let ins = win.children;
		ins[8].addEventListener("click", function() {
			try {
				forcesetcolor(Number(ins[0].value), {
					primary: ins[2].value,
					secondary: ins[4].value,
					gradientType: ins[6].value
				});
			} catch (e) {
				api.onerror(e);
			}
		});
	}

	function scanner() {
		showwindow();
	}

	function stopscan() {
		if (winob !== null) {
			winob.close();
			winob = null
		}
	}

	tfgs.func.add({
		id: "forcecolor",
		name: "qiangxinshezhitoumingyanse",
		onenable: function(_api) {
			api = _api;
			if (interval === -1) interval = setInterval(scanner, 100);
		},
		ondisable: function() {
			if (interval !== -1) {
				clearInterval(interval);
				interval = -1;
			}
			stopscan();
		},
		onoption: function() {}
	});
}();


/* functions/guimodify.css */
_tfgsAddCSS(`span.tfgsGuimodifyButton {
	position: absolute;
	color: grey;
	font-size: 1em;
	line-height: 1em;
	text-align: center;
}

body.tfgsGuimodifyMenubarFold div[class^=gui_menu-bar-position_] {
	top: calc(0px - var(--tfgsGuimodifyMenubarHeight));
	margin-bottom: calc(0px - var(--tfgsGuimodifyMenubarHeight));
}

body.tfgsGuimodifyMenubarFold div[class^=gui_body-wrapper_] {
	height: 100%;
}

body.tfgsGuimodifyBlocktoolFold .blocklyFlyoutScrollbar,
body.tfgsGuimodifyBlocktoolFold .blocklyFlyout {
	left: -250px;
}

body.tfgsGuimodifyStagetargetFold div[class^=gui_stage-and-target-wrapper_] {
	display: none;
}

body.tfgsGuimodifySpriteinfoFold div[class^=sprite-info_sprite-info_] {
	max-height: 0px;
	padding: 0px;
	overflow: hidden;
}

body.tfgsGuimodifyStagebuttonFold div[class^=target-pane_stage-selector-wrapper_] {
	max-width: 0px;
	padding: 0px;
	margin-left: 0px;
	margin-right: 0px;
	overflow: hidden;
}

body.tfgsGuimodifyStageFold div[class^=stage-wrapper_stage-canvas-wrapper_] {
	max-height: 0px;
	padding: 0px;
	overflow: hidden;
}

body.tfgsGuimodifyFullscreen {
	overflow: scroll;
}

body.tfgsGuimodifyExpand100 {
	position: fixed;
	bottom: 0;
}

body.tfgsGuimodifyAssetpanelFold [class^=selector_wrapper_] {
	position: absolute;
	height: 100%;
	width: 100%;
	z-index: 2;
}

body.tfgsGuimodifyAssetpanelFold [class^=selector_list-area_] {
	flex-direction: row;
	flex-wrap: wrap;
	align-content: flex-start;
}

body.tfgsGuimodifyAssetpanelFold [class*=" sprite-selector-item_sprite-selector-item_"] {
	margin-left: 0.8em;
}

body.tfgsGuimodifyAssetpanelFold [class^=asset-panel_detail-area_] {
	padding-left: 45px;
}
`);
/* functions/guimodify.js */
! function() {
	let api;
	let interval = -1;

	let pbutton = {};
	let foption = {};
	let _fullscreen = false;

	function selectClass(namebegin) {
		let csslist = selectElement(namebegin);
		if (csslist === null)
			return null;
		csslist = csslist.classList;
		for (let i in csslist)
			if (namebegin === csslist[i].slice(0, namebegin.length))
				return csslist[i];
		return null;
	}

	function selectElement(namebegin) {
		return document.querySelector(`[class^=${namebegin}],[class*= ${namebegin}]`);
	}

	function configButton(options) {
		let buttonid = options.buttonid;
		let enable = options.enable;
		let addinner = options.addinner;
		let removeinner = options.removeinner;
		let styles = options.styles;
		let targetcss = options.targetcss;
		let cssname = options.cssname;
		let onadd = options.onadd;
		let onremove = options.onremove;
		if (enable /*foption.foldmenu*/ ) {
			/* ------ on ------ */
			if (pbutton[buttonid] !== undefined) {
				let target = selectElement(targetcss);
				if (pbutton[buttonid].parentElement !== target) {
					pbutton[buttonid].remove();
					pbutton[buttonid] = undefined;
					if (cssname !== undefined)
						document.body.classList.remove(cssname);
					if (typeof onremove === "function")
						onremove();
					api.info(buttonid + ": restart");
				}
			}
			if (pbutton[buttonid] === undefined) {
				let target = selectElement(targetcss /*"gui_menu-bar-position_"*/ );
				if (target === null) {
					// api.warn(buttonid + ": target not found.");
					return;
				}
				let button = document.createElement("span");
				button.classList.add(selectClass("button_outlined-button_"));
				button.classList.add(selectClass("stage-header_stage-button_"));
				button.classList.add("tfgsGuimodifyButton");
				for (let i in styles)
					button.style[i] = styles[i];
				button.innerText = addinner;
				button.checked = false;
				button.addEventListener("click", function() {
					if (button.checked) {
						if (cssname !== undefined)
							document.body.classList.remove(cssname /*"tfgsGuimodifyMenubarFold"*/ );
						if (typeof onremove === "function")
							onremove();
						button.innerText = addinner;
					} else {
						if (cssname !== undefined)
							document.body.classList.add(cssname);
						if (typeof onadd === "function")
							onadd();
						button.innerText = removeinner;
					}
					button.checked ^= true;
					dispatchEvent(new Event("resize"));
				});
				target.appendChild(button);
				if (options.clickaftercreate)
					button.click();
				pbutton[buttonid] = button;
				api.info(buttonid + ": OK");
			}
		} else {
			/* ------ off ------ */
			if (pbutton[buttonid] !== undefined) {
				pbutton[buttonid].remove();
				pbutton[buttonid] = undefined;
				if (cssname !== undefined)
					document.body.classList.remove(cssname);
				if (typeof onremove === "function")
					onremove();
				dispatchEvent(new Event("resize"));
				api.info(buttonid + ": OFF");
			}
		}
	}

	function updateStatus() {
		try {
			let sel = selectElement("sprite-selector_scroll-wrapper_");
			if (sel !== null)
				if (foption.foldspriteinfo ||
					foption.foldstagebutton ||
					foption.foldthestage)
					sel.style.position = "relative";
				else
					sel.style.position = "inherit";

			if (foption.expand100) {
				if (!document.body.classList.contains("tfgsGuimodifyExpand100")) {
					document.body.classList.add("tfgsGuimodifyExpand100");
					dispatchEvent(new Event("resize"));
				}
			} else {
				if (document.body.classList.contains("tfgsGuimodifyExpand100")) {
					document.body.classList.remove("tfgsGuimodifyExpand100");
					dispatchEvent(new Event("resize"));
				}
			}

			if (foption.foldmenu) {
				if (document.body.style.getPropertyValue("--tfgsGuimodifyMenubarHeight") === "")
					document.body.style.setProperty("--tfgsGuimodifyMenubarHeight", window.getComputedStyle(selectElement("gui_menu-bar-position_")).height);
			} else {
				if (document.body.style.getPropertyValue("--tfgsGuimodifyMenubarHeight") !== "")
					document.body.style.removeProperty("--tfgsGuimodifyMenubarHeight");
			}

			configButton({
				buttonid: "foldmenubar",
				enable: foption.foldmenu,
				styles: {
					left: 0,
					top: "100%",
					position: "absolute"
				},
				addinner: "▲",
				removeinner: "▼",
				targetcss: "gui_menu-bar-position_",
				cssname: "tfgsGuimodifyMenubarFold",
				clickaftercreate: true
			});

			configButton({
				buttonid: "fullscreen",
				enable: foption.fullscreen,
				styles: {
					right: "calc(2em + 1px)",
					top: "0.3em",
					position: "absolute"
				},
				addinner: "✠",
				removeinner: "×",
				targetcss: "gui_editor-wrapper_",
				cssname: "tfgsGuimodifyFullscreen",
				onadd: function(button) {
					document.body.requestFullscreen()
						.catch(api.onerror);
				},
				onremove: function(button) {
					document.exitFullscreen()
						.catch(api.onerror);
				}
			});

			let _fullscreenchange = function() {
				let button = pbutton["fullscreen"];
				if ((document.fullscreenElement === null) !==
					(button.innerText === "✠"))
					button.click();
			}

			if (foption.fullscreen !== _fullscreen) {
				if (foption.fullscreen)
					document.addEventListener("fullscreenchange", _fullscreenchange);
				else
					document.removeEventListener("fullscreenchange", _fullscreenchange);
				_fullscreen = foption.fullscreen;
			}

			configButton({
				buttonid: "foldstagetarget",
				enable: foption.foldstagetarget,
				styles: {
					right: 0,
					top: "0.3em",
					position: "absolute"
				},
				addinner: "▶",
				removeinner: "◀",
				targetcss: "gui_editor-wrapper_",
				cssname: "tfgsGuimodifyStagetargetFold"
			});

			configButton({
				buttonid: "foldblocktool",
				enable: foption.foldblocktool,
				styles: {
					left: "calc(60px + 0.5em)",
					top: "0.5em",
					position: "absolute",
					zIndex: 2000
				},
				addinner: "◀",
				removeinner: "▶",
				targetcss: "injectionDiv",
				cssname: "tfgsGuimodifyBlocktoolFold"
			});

			configButton({
				buttonid: "foldspriteinfo",
				enable: foption.foldspriteinfo,
				styles: {
					left: 0,
					top: 0,
					position: "absolute"
				},
				addinner: "▲",
				removeinner: "▼",
				targetcss: "sprite-selector_scroll-wrapper_",
				cssname: "tfgsGuimodifySpriteinfoFold"
			});

			configButton({
				buttonid: "foldstagebutton",
				enable: foption.foldstagebutton,
				styles: {
					right: 0,
					top: "calc(2em + 1px)",
					position: "absolute"
				},
				addinner: "▶",
				removeinner: "◀",
				targetcss: "sprite-selector_scroll-wrapper_",
				cssname: "tfgsGuimodifyStagebuttonFold"
			});

			configButton({
				buttonid: "foldthestage",
				enable: foption.foldthestage,
				styles: {
					right: 0,
					top: 0,
					position: "absolute"
				},
				addinner: "▲",
				removeinner: "▼",
				targetcss: "sprite-selector_scroll-wrapper_",
				cssname: "tfgsGuimodifyStageFold"
			});

			configButton({
				buttonid: "foldassetpanel",
				enable: foption.foldassetpanel,
				styles: {
					right: 0,
					top: 0,
					position: "absolute"
				},
				addinner: "▶",
				removeinner: "◀",
				targetcss: "selector_wrapper_",
				cssname: "tfgsGuimodifyAssetpanelFold"
			});
		} catch (e) {
			api.error(e);
		}
	}

	tfgs.func.add({
		id: "guifold",
		name: "折叠展开按钮",
		info: "添加可以折叠舞台、角色，展开列表等区域的按钮",
		option: {
			foldmenu: {
				type: "check",
				name: "折叠菜单",
				default: true
			},
			fullscreen: {
				type: "check",
				name: "全屏按钮",
				default: true
			},
			foldblocktool: {
				type: "check",
				name: "折叠jimuhe",
				default: true
			},
			foldstagetarget: {
				type: "check",
				name: "折叠舞台和角色列表",
				default: true
			},
			foldspriteinfo: {
				type: "check",
				name: "折叠角色参数",
				default: true
			},
			foldstagebutton: {
				type: "check",
				name: "折叠舞台按钮",
				default: true
			},
			foldthestage: {
				type: "check",
				name: "折叠舞台",
				default: true
			},
			foldassetpanel: {
				type: "check",
				name: "折叠asset",
				default: true
			},
			expand100: {
				type: "check",
				name: "填满屏幕(实验)",
				default: false
			}
		},
		onenable: function(_api) {
			api = _api;
			foption = api.getoption();
			if (interval === -1)
				interval = setInterval(updateStatus, 200);
		},
		ondisable: function() {
			if (interval !== -1) {
				clearInterval(interval);
				foption = {};
				updateStatus();
				interval = -1;
			}
		},
		onoption: function() {
			foption = api.getoption();
		}
	});
}();


/* functions/windowf___.js */
let windowf___;
tfgs.func.add({
	id: "windowf___",
	name: "window f___",
	onenable: function(_api) {
		windowf___ = [];
		newwin();
	},
	ondisable: function() {
		for (let i in windowf___) {
			windowf___[i].onClose = function() {};
			windowf___[i].close();
		}
	},
	onoption: function() {}
});

function newwin() {
	let win = tfgs.window.create({
		title: "Teriteri",
		canMaximize: false,
		canMinimize: false,
		canResize: false,
		height: 130,
		width: 130,
		onClose: conti
	});
	win.innerDiv.style = "vertical-align:middle;text-align:center;font-size:80px;";
	win.innerDiv.innerText = "☆";
	windowf___.push(win);
}

function conti() {
	windowf___.splice(windowf___.indexOf(this), 1);
	newwin();
	newwin();
}


/* (allinone.js) */
	tfgs.data.load().then(tfgs.button.create).catch(tfgs.error);
} catch(e) {
	alert(e.message);
	console.error(e);
	throw e;
}