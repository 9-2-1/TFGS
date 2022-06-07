/* (allinone.js) */

try {
	let tfgs;

	if ("__TFGS$nbhyBNaFkY" in window) {
		throw new Error("TFGS 已经安装");
	} else {
		window["__TFGS$nbhyBNaFkY"] = {};
	}

	tfgs = window.tfgs = {};

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
	color: black;
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
		elem.addEventListener("mousemove", handleDragMove);
		window.addEventListener("mouseup", handleDragEnd);
		elem.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mouseleave", handleDragEnd);
		window.addEventListener("blur", handleDragEnd);
		elem.addEventListener("touchmove", handleDragMove);
		elem.addEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.stopPropagation();
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
		event.preventDefault();
		event.stopPropagation();
		event.cancelBubble = true;
		return false;
	};
	let handleDragEnd = function(event) {
		options.onEnd(mode, event);

		window.removeEventListener("mousemove", handleDragMove);
		elem.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
		elem.removeEventListener("mouseup", handleDragEnd);
		window.removeEventListener("mouseleave", handleDragEnd);
		window.removeEventListener("blur", handleDragEnd);
		elem.removeEventListener("touchmove", handleDragMove);
		elem.removeEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.stopPropagation();
		event.cancelBubble = true;
		return false;
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

/* ---------- 获取Scratch相关内容 ---------- */

tfgs.funcapi.blockly = function(name) {
	if ("Blockly" in window)
		return window.Blockly;
	else if ("ClipCCExtension" in window)
		return window.ClipCCExtension.getBlockInstance();
	else return undefined;
};

// 积木区相关
tfgs.funcapi.workspace = function(name) {
	return tfgs.funcapi.blockly().getMainWorkspace();
};

// 积木盒相关
tfgs.funcapi.toolbox = function(name) {
	return tfgs.funcapi.workspace().getFlyout().getWorkspace();
};

// 获取class以classname开头的元素
tfgs.funcapi.selele = function(name, classname, element) {
	return (element === undefined ? document : element).querySelector(`*[class^="${classname}"], *[class*=" ${classname}"]`);
};

// 获取元素中以classname开头的类型名
tfgs.funcapi.selcss = function(name, classname, element) {
	let elem = tfgs.funcapi.selele(name, classname, element);
	if (elem === null)
		return null;
	let csslist = elem.classList;
	for (let i in csslist)
		if (classname === csslist[i].slice(0, classname.length))
			return csslist[i];
	return null;
};

// 获取元素的__reactInternalInstance$xxx
// ClipCC用了react17，__reactFiber$
tfgs.funcapi.reactInternal = function(name, element) {
	let internal = "__reactInternalInstance$";
	let internal2 = "__reactFiber$";
	let fullname = null;
	Object.keys(element).forEach(function(a) {
		if (a.slice(0, internal.length) === internal)
			fullname = a;
		if (a.slice(0, internal2.length) === internal2)
			fullname = a;
	});
	return fullname === null ? undefined : element[fullname];
};

// 获取 redux store, 里面有vm和绘画参数
// ClipCC 目前不可用，因为react17的变化
tfgs.funcapi.store = function(name) {
	return tfgs.funcapi.reactInternal(
		name, tfgs.funcapi.selele(name, "gui_page-wrapper_")
	).child.stateNode.store;
};

// vm 对象
tfgs.funcapi.vm = function(name) {
	let errors = [];
	try {
		// 用 ClipCC 的 api
		return window.ClipCCExtension.api.getVmInstance();
	} catch (e) {
		errors.push(e);
		try {
			// 获取VM方法1
			return tfs.funcapi.selele(name, "gui_page-wrapper_")
				.return.return.return.return
				.return.return.return.return
				.stateNode.props.vm;
		} catch (e) {
			errors.push(e);
			try {
				// 获取VM方法2
				return tfgs.funcapi.reactInternal(name,
						tfgs.funcapi.selele("stage-wrapper_")
					)
					.return.return.return.return
					.return.return.return.return
					.return.return
					.stateNode.props.vm;
			} catch (e) {
				errors.push(e);
				try {
					// 获取VM方法3
					return tfgs.funcapi.store(name).getState().scratchGui.vm;
				} catch (e) {
					errors.push(e);
					for (let i in e) {
						tfgs.funcapi.error(name, `funcapi: 方法${i+1}错误:`);
						tfgs.funcapi.onerror(name, e);
					}
					throw new Error("tfgs.funcapi.vm: cannot find vm");
				}
			}
		}
	}
};

// 绘画状态
// ClipCC 目前不可用
tfgs.funcapi.paint = function(name) {
	return tfgs.funcapi.store(name).getState().scratchPaint;
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
			if (tfgs.log.display(div, fliter)) {
				tfgs.log.logwin.flash(500, 3, true);
			}
			tfgs.log.changed = false;
		}
		div.scrollX = x;
		div.scrollY = y;
	}, 100);
};

tfgs.log.display = function(div, fliter) {
	let empty = true;
	div.classList.add("tfgsLogFormat");
	for (let i in tfgs.log.list) {
		let log1 = tfgs.log.list[i];
		if (fliter.name === null || fliter.name.includes(log1.name))
			if (fliter.color === null || fliter.color.includes(log1.color)) {
				let eline = tfgs.element.create("div");
				eline.style.color = log1.color;
				eline.innerText = log1.name + "\t" + log1.log;
				div.appendChild(eline);
				empty = false;
			}
	}
	return !empty;
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
	let menuwin = tfgs.window.create({
		title: "TFGS选项",
		canMinimize: true,
		canClose: false,
		x: 50,
		y: 50,
		width: 400,
		height: 300,
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
		let funcdiv = tfgs.element.create("div", "tfgsMenuFunc");
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
			lab = tfgs.element.create("label");
			lab.innerText = o.name;
			switch (o.type) {
				case "number":
					inp = tfgs.element.create("input", undefined, "number");
					break;
				case "text":
					inp = tfgs.element.create("input");
					break;
				case "check":
					inp = tfgs.element.create("input", undefined, "checkbox");
					break;
				case "menu":
					inp = tfgs.element.create("select");
					for (let i in o.menu) {
						let op = tfgs.element.create("option");
						op.innerText = o.menu[i];
						op.value = i;
						inp.appendChild(op);
					}
					break;
				default:
					throw new Error("Unsupport type: " + o.type);
			}
			fl.option[oname] = inp;

			let fopdiv1 = tfgs.element.create("span", "tfgsMenuFuncOptionOne");

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
	font-size: 16px;
	font-family: monospace;
	color: black;
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
			if (this.isMinimize || this.isMaximize) {
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
			}
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
	let windowDiv = tfgs.element.create("div", "tfgsWindow");
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


/* tfgs/element.js */
tfgs.element = {};

tfgs.element.create = function(tagName, className, type) {
	let ele = document.createElement(tagName);
	if (className !== undefined) ele.className = className;
	ele.className = className;
	if (type !== undefined) ele.type = type;
	return ele;
};


/* functions/joystick.css */
_tfgsAddCSS(`.tfgsJoystick {
	display: flex;
	padding: 2px;
	height: calc(100% - 4px);
}

.tfgsJoystickKeyBoard {
	width: calc(100% - 4px);
	flex-flow: column nowrap;
	border: 1px solid black;
	font-size: 20px;
	padding: 1px;
}

.tfgsJoystickKeyBoard>span {
	display: flex;
	flex: 1 1 0;
	flex-flow: row nowrap;
	overflow: hidden;
}

.tfgsJoystickKeyBoard>span>span {
	flex: 1 1 0;
	margin: 1px;
	border: 1px solid black;
	font-size: 20px;
	box-sizing: border-box;
	white-space: pre;
	overflow: hidden;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}

.tfgsJoystickMouse {
	width: calc(100% - 4px);
	flex-flow: column nowrap;
	border: 1px solid black;
	font-size: 20px;
	padding: 1px;
}

.tfgsJoystickMouse>.tfgsJoystickMouseMove {
	flex: 4 4 0;
	border: 1px solid black;
	margin: 1px;
	padding: 1px;
}

.tfgsJoystickMouse>span {
	flex: 1 1 0;
	display: flex;
	flex-flow: row nowrap;
}

.tfgsJoystickMouseClick {
	flex: 1 1 0;
	border: 1px solid black;
	margin: 1px;
	padding: 1px;
}

.tfgsJoystickMouseSwitch {
	flex: 1 1 0;
	border: 1px solid black;
	margin: 1px;
	padding: 1px;
}

.tfgsJoystickCursor {
	position: fixed;
	z-index: 1000000000;
	text-shadow: 0px 0px 2px white;
	color: grey;
	pointer-events: none;
	font-size: 30px;
}

.tfgsJoystickGamepad {
	display: flex;
	flex-flow: row nowrap;
	width: calc(100% - 4px);
}

.tfgsJoystickGamepad>span {
	border: 1px solid black;
	flex: 1 1 0;
	overflow: hidden;
}

.tfgsJoystickJoystick {
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
}

.tfgsJoystickJoystick>span {
	display: flex;
	position: relative;
	width: var(--size);
	height: var(--size);
	border: 1px solid black;
	border-radius: 1000px;
	align-items: center;
	justify-content: center;
}

.tfgsJoystickJoystick>span>span {
	position: relative;
	width: 50%;
	height: 50%;
	border: 1px solid black;
	border-radius: 1000px;
}

.tfgsJoystickJoystickKeyBoard {
	display: flex;
	height: calc(100% - 4px);
	flex-flow: column nowrap;
	border: 1px solid black;
	font-size: 20px;
	padding: 1px;
}

.tfgsJoystickJoystickKeyBoard>span {
	display: flex;
	flex: 1 1 0;
	flex-flow: row nowrap;
	overflow: hidden;
}

.tfgsJoystickJoystickKeyBoard>span>span {
	flex: 1 1 0;
	margin: 5px;
	text-align: center;
	border: 1px solid black;
	font-size: 20px;
	box-sizing: border-box;
	white-space: pre;
	overflow: hidden;
	border-radius: 1000px;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}

.tfgsJoystickJoystickMouse {
	display: inline-block;
	height: 100%;
	width: 100%;
}

.tfgsJoystickSwitch {
	position: absolute;
	right: 2px;
	bottom: 2px;
	height: 30px;
	width: 30px;
	background-color: white !important;
}
`);
/* functions/joystick.js */
! function() {
	let foption = {};
	let api, win = null;
	let shift = false,
		control = false,
		alt = false;
	let mousex = 0,
		mousey = 0,
		moused = false,
		touchx = 0,
		touchy = 0,
		toucht = 0,
		cursordiv = null;
	let globalKeyInterval = -1,
		globalKeyTimeout = -1;
	let realmousedown = false;
	let switchpage = -1;

	function monitorkey(event) {
		control = event.ctrlKey;
		alt = event.altKey;
		shift = event.shiftKey;
	}

	function opencontrol() {
		window.addEventListener("keydown", monitorkey);
		window.addEventListener("keyup", monitorkey);

		shift = false;
		control = false;
		alt = false;
		mousex = 0;
		mousey = 0;
		moused = false;
		touchx = 0;
		touchy = 0;
		toucht = 0;
		cursordiv = null;
		globalKeyInterval = -1;
		globalKeyTimeout = -1;

		win = tfgs.window.create({
			title: "JoyStick",
			canClose: false,
			canMaximize: false,
			onResize: function() {
				if (switchpage === 2) {
					let wchild = win.innerDiv.children[0].children;
					let parts = wchild[2].children;
					if (parts.length !== 0) {
						setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
						setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
					}
				}
			}
		});

		let wdiv = win.innerDiv;
		wdiv.innerHTML = `
<div class="tfgsJoystick">
	<div class="tfgsJoystickKeyBoard"></div>
	<div class="tfgsJoystickMouse"></div>
	<div class="tfgsJoystickGamepad"></div>
</div>`;

		wdiv.onmousedown = wdiv.ontouchstart = function(e) {
			win.movetotop();
			e.preventDefault();
			e.stopPropagation();
		};
		wdiv.onmousemove = wdiv.ontouchmove = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};
		wdiv.onmouseup = wdiv.ontouchend = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};

		switchto(foption.start);

		_refresh();
	}

	function switchto(x) {
		let wchild = win.innerDiv.children[0].children;
		for (let i = 0; i < wchild.length; i++) {
			let elem = wchild[i];
			elem.style.display = x === i ? "flex" : "none";
		}
		switchpage = x;
		if (x === 2) {
			let parts = wchild[2].children;
			if (parts.length !== 0) {
				setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
				setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
			}
		}
	}

	function _refresh() {
		let wchild = win.innerDiv.children[0].children;
		let jKeyb = wchild[0];
		let jMous = wchild[1];
		let jJoys = wchild[2];

		// 0: keyBoard

		let keybsets = [
			"`1234567890-=⌫\n⇄qwertyuiop[]\\\n asdfghjkl';↵\n⇧zxcvbnm,./ \n⌃⌥␣←↑↓→⌬",
			"1234567890\nqwertyuiop\nasdfghjkl\nzxcvbnm↑↵\n⌬␣←↓→"
		];

		let i = foption.fullkey ? 0 : 1;
		setKeyboard(jKeyb, keybsets[i], 1);

		// 1: mouse

		jMous.innerHTML = `
<span class="tfgsJoystickMouseMove"></span>
<span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 1 10
				A 9 9 0 0 1 10 1
				L 10 15
				L 1 15
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 10 1
				A 9 9 0 0 1 19 10
				L 19 15
				L 10 15
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">▲</span>
	<span class="tfgsJoystickMouseClick">▼</span>
	<span class="tfgsJoystickMouseSwitch">◎∷</span>
</span>`;

		jMous.children[0].onmousedown = jMous.children[0].ontouchstart = synctouch;
		jMous.children[0].onmousemove = jMous.children[0].ontouchmove = synctouch;
		jMous.children[0].onmouseleave = jMous.children[0].onmouseup = jMous.children[0].ontouchend = synctouch;

		bindbutton(jMous.children[1].children[0], 0);
		if (foption.mousebuttons) {
			bindbutton(jMous.children[1].children[1], 1);
			bindbutton(jMous.children[1].children[2], 2);
		} else {
			jMous.children[1].children[1].style.display = "none";
			jMous.children[1].children[2].style.display = "none";
		}
		bindwheel(jMous.children[1].children[3], -120);
		bindwheel(jMous.children[1].children[4], 120);

		jMous.children[1].children[5].onmousedown = jMous.children[1].children[5].ontouchstart = function(e) {
			this.style.background = "grey";
		};

		jMous.children[1].children[5].onmouseup = jMous.children[1].children[5].ontouchend = function(e) {
			this.style.background = "inherit";
			switchto(2);
		};

		// 2: joystick

		jJoys.innerHTML = `<span></span><span></span><span class="tfgsJoystickSwitch">⌨</span>`;
		let parts = jJoys.children;

		parts[2].onmousedown = parts[2].ontouchstart = function() {
			this.style.background = "grey";
		};

		parts[2].onmouseup = parts[2].ontouchend = function() {
			this.style.background = "inherit";
			switchto(0);
		};

		setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
		setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
	}

	function bindwheel(elem, delta) {
		let interval = -1;
		let step = function() {
			sendWheelEvent(mousex, mousey, "wheel", {
				deltaY: delta / 4,
				wheelDelta: -delta,
			});
		};

		elem.onmousedown = elem.ontouchstart = function(e) {
			if (interval !== -1) {
				clearInterval(interval);
			}
			step();
			interval = setInterval(step, 50);
			this.style.background = "grey";
		};

		elem.onmouseleave = elem.onmouseup = elem.ontouchend = function(e) {
			if (interval !== -1) {
				clearInterval(interval);
			}
			this.style.background = "inherit";
		};
	}

	function bindbutton(elem, button) {
		elem.onmousedown = elem.ontouchstart = function(e) {
			sendMouseEvent(mousex, mousey, "mousedown", {
				button: button
			});
			this.style.background = "grey";
		};

		elem.onmouseleave = elem.onmouseup = elem.ontouchend = function(e) {
			sendMouseEvent(mousex, mousey, "mouseup", {
				button: button
			});
			this.style.background = "inherit";
		};
	}

	function synctouch(e) {
		let tlist;
		switch (e.type) {
			case "mousedown":
				realmousedown = true;
				this.style.background = "grey";
				tlist = [{
					clientX: e.clientX,
					clientY: e.clientY
				}];
				break;
			case "mousemove":
				if (realmousedown) {
					tlist = [{
						clientX: e.clientX,
						clientY: e.clientY
					}]
				} else {
					tlist = [];
				}
				break;
			case "mouseup":
			case "mouseleave":
				realmousedown = false;
				this.style.background = "inherit";
				tlist = [];
				break;
			default:
				tlist = e.targetTouches;
		}
		let touchnewx = 0,
			touchnewy = 0,
			touchnewt = new Date().getTime();
		for (let i = 0; i < tlist.length; i++) {
			touchnewx += tlist[i].clientX;
			touchnewy += tlist[i].clientY;
		}

		if (cursordiv === null) {
			cursordiv = tfgs.element.create("span", "tfgsJoystickCursor");
			document.body.appendChild(cursordiv);
			cursordiv.innerHTML = `<svg>
	<defs>
		<filter id="fl" x="0" y="0" width="100" height="100">
			<feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
			<feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
			<feBlend in="SourceGraphic" in2="offsetBlur" mode="normal">
		</filter>
	</defs>
	<path d="
		M 0 0
		L 15 20
		L 10 21.67
		L 14 29.67
		L 9 31.33
		L 5 23.33
		L 0 25
		Z
	" stroke=black stroke-width=1 fill=white filter="url(#fl)" />
</svg>`;
		}

		if (e.type === "touchmove" || e.type === "mousemove" && realmousedown) {
			touchnewx /= tlist.length;
			touchnewy /= tlist.length;
			let deltax = touchnewx - touchx;
			let deltay = touchnewy - touchy;
			let deltat = touchnewt - toucht;
			let speed = Math.sqrt(deltax * deltax + deltay * deltay) / (deltat / 1000) //像素每秒
			let k = foption.mousespeed * (speed / (speed + foption.mouseaccer));
			mousex += deltax * k;
			mousey += deltay * k;
			if (mousex < 0) mousex = 0;
			if (mousey < 0) mousey = 0;
			if (mousex > window.innerWidth - 1) mousex = window.innerWidth - 1;
			if (mousey > window.innerHeight - 1) mousey = window.innerHeight - 1;
			touchx = touchnewx;
			touchy = touchnewy;
			toucht = touchnewt;
			sendMouseEvent(mousex, mousey, "mousemove", {});
		} else {
			if (foption.mouse2click && tlist.length > 1) {
				if (!moused) {
					sendMouseEvent(mousex, mousey, "mousedown", {});
					this.style.background = "grey";
				}
				moused = true;
			} else {
				if (moused) {
					sendMouseEvent(mousex, mousey, "mouseup", {});
					this.style.background = "inherit";
				}
				moused = false;
			}
			if (tlist.length > 0) {
				touchx = touchnewx / tlist.length;
				touchy = touchnewy / tlist.length;
				toucht = touchnewt;
			}
		}

		cursordiv.style.left = mousex - 1 + "px";
		cursordiv.style.top = mousey - 1 + "px";
	}

	function sendKey(type, char1) {
		let detail = getKeyDetail(char1, shift);
		sendKeyEvent(type, {
			key: detail.cname,
			code: detail.ccode,
			keyCode: detail.ccode
		});
	}

	function sendKeyEvent(type, data) {
		const event = new KeyboardEvent(type, Object.assign({
			view: window,
			ctrlKey: control,
			altKey: alt,
			shiftKey: shift,
			bubbles: true,
			cancelable: true
		}, data));
		let elem = document.activeElement;
		if (elem === null) elem = window;
		elem.dispatchEvent(event);
	}

	function sendMouseLikeEvent(btype, mousex, mousey, type, data) {
		const event = new btype(type, Object.assign({
			view: window,
			ctrlKey: control,
			altKey: alt,
			shiftKey: shift,
			clientX: mousex,
			clientY: mousey,
			bubbles: true,
			cancelable: true
		}, data));
		let elem = document.elementFromPoint(mousex, mousey);
		let eventx = event.clientX,
			eventy = event.clientY;
		if (elem !== null) {
			while (true) {
				let next = null;
				if (elem.tagName.toLowerCase() === "iframe") {
					let offs = elem.getBoundingClientRect();
					eventx -= offs.left;
					eventy -= offs.top;
					next = elem.contentWindow.document.elementFromPoint(eventx, eventy);
				} else if (type === "mousedown" && elem.shadowRoot !== null && elem.shadowRoot !== undefined) {
					next = elem.shadowRoot.elementFromPoint(eventx, eventy);
				}
				if (next === null) {
					break;
				} else {
					elem = next;
				}
			}
		}
		if (elem === null) elem = window;
		let pare = elem;
		while (pare !== null && pare !== win.windowDiv) {
			pare = pare.parentElement;
		}
		if (pare === null) {
			event.clientX = eventx;
			event.clientY = eventy;
			elem.dispatchEvent(event);
		}
	}

	function sendMouseEvent(mousex, mousey, type, data) {
		sendMouseLikeEvent(MouseEvent, mousex, mousey, type, data);
	}

	function sendWheelEvent(mousex, mousey, type, data) {
		sendMouseLikeEvent(WheelEvent, mousex, mousey, type, data);
	}

	function createKey(key, nextId) {
		let x = tfgs.element.create("span");
		let detail = getKeyDetail(key, false);
		let shdetail = getKeyDetail(key, true);
		let name = detail.cname;
		let shname = shdetail.cname;
		let step = function() {
			if (name === "Control") control = true;
			if (name === "Alt") alt = true;
			if (name === "Shift") shift = true;
			sendKey("keydown", key);
		};
		if (name === "tfgsSwitch") {
			x.innerHTML = `<svg width=20 height=30>
	<path d="
		M 1 10
		A 9 9 0 0 1 19 10
		L 19 20
		A 9 9 0 0 1 1 20
		Z
		M 1 15
		L 19 15
		M 10 1
		L 10 5
		M 8 7
		A 2 2 0 0 1 12 7
		L 12 9
		A 2 2 0 0 1 8 9
		Z
		M 10 11
		L 10 15
	" stroke=black stroke-width=1 fill=none />
</svg>`;
		} else {
			x.innerText = key + (name.toLowerCase() !== shname.toLowerCase() ? "\n" + shname : "");
		}
		x.onmousedown = x.ontouchstart = function(e) {
			if (name !== "tfgsSwitch") {
				if (globalKeyInterval !== -1) {
					clearInterval(globalKeyInterval);
				}
				if (globalKeyTimeout !== -1) {
					clearTimeout(globalKeyTimeout);
				}
				globalKeyInterval = -1;
				globalKeyTimeout = -1;
				step();
				if (
					name !== "Shift" &&
					name !== "Alt" &&
					name !== "Control"
				) {
					globalKeyTimeout = setTimeout(function() {
						globalKeyTimeout = -1;
						step();
						globalKeyInterval = setInterval(step, foption.keyInterval);
					}, foption.keyTimeout);
				}
			}
			x.style.background = "grey";
		};
		x.onmouseleave = x.onmouseup = x.ontouchend = function(e) {
			if (name !== "tfgsSwitch") {
				if (globalKeyInterval !== -1) {
					clearInterval(globalKeyInterval);
				}
				if (globalKeyTimeout !== -1) {
					clearTimeout(globalKeyTimeout);
				}
				globalKeyInterval = -1;
				globalKeyTimeout = -1;
				if (name === "Control") control = false;
				if (name === "Alt") alt = false;
				if (name === "Shift") shift = false;
				sendKey("keyup", key);
			} else {
				switchto(nextId);
			}
			x.style.background = "inherit";
		};
		if (name === "Unidentified") x.style.flexGrow = 1.5;
		if (name === "Shift") x.style.flexGrow = 2;
		if (name === "Control") x.style.flexGrow = 2;
		if (name === "Enter") x.style.flexGrow = 1.5;
		if (name === " ") x.style.flexGrow = 4;
		return x;
	}

	function setKeyboard(elem, char1, nextId) {
		elem.innerHTML = "";
		char1 = char1.split('\n');
		for (let i in char1) {
			let line1 = char1[i].split('');
			let line = tfgs.element.create("span");
			for (let j in line1) {
				let char1 = line1[j];
				line.appendChild(createKey(char1, nextId));
			}
			elem.appendChild(line);
		}
	}

	function getKeyDetail(char1, isShift) {
		switch (char1) {
			case "⌫":
				ccode = 8;
				cname = "Backspace";
				break;
			case "⇄":
				ccode = 9;
				cname = "Tab";
				break;
			case "␣":
				ccode = 32;
				cname = " ";
				break;
			case "↵":
				ccode = 13;
				cname = "Enter";
				break;
			case "⇧":
				ccode = 0;
				cname = "Shift";
				break;
			case "⌥":
				ccode = 0;
				cname = "Alt";
				break;
			case "⌃":
				ccode = 0;
				cname = "Control";
				break;
			case "←":
				ccode = 37;
				cname = "ArrowLeft";
				break;
			case "↑":
				ccode = 38;
				cname = "ArrowUp";
				break;
			case "→":
				ccode = 39;
				cname = "ArrowRight";
				break;
			case "↓":
				ccode = 40;
				cname = "ArrowDown";
				break;
			case " ":
				ccode = 0;
				cname = "Unidentified";
				break;
			case "⌬":
				ccode = 0;
				cname = "tfgsSwitch";
				break;
			default:
				ccode = char1.toUpperCase().codePointAt(0);
				if (isShift) {
					let before = "`1234567890-=[]\\';.,/";
					let after_ = "~!@#$%^&*()_+{}|\":<>?";
					if (before.includes(char1)) {
						cname = after_[before.indexOf(char1)];
					} else {
						cname = char1.toUpperCase();
					}
				} else {
					cname = char1.toLowerCase();
				}
		}
		return {
			ccode: ccode,
			cname: cname
		};
	}

	function closecontrol() {
		window.removeEventListener("keydown", monitorkey);
		window.removeEventListener("keyup", monitorkey);
		if (win !== null) {
			win.close();
			win = null;
		}
		if (cursordiv !== null) {
			document.body.removeChild(cursordiv);
			cursordiv = null;
		}
	}

	function setJoystick(elem, mode, custom) {
		custom = custom.replace(/\|/g, "\n").replace(/\{[^}]+\}/g, function(str) {
			let repl = {
				"{space}": "␣",
				"{enter}": "↵",
				"{left}": "←",
				"{up}": "↑",
				"{down}": "↓",
				"{right}": "→",
				"{control}": "⌃",
				"{shift}": "⇧",
				"{alt}": "⌥",
				"{tab}": "⇄",
				"{backspace}": "⌫",
				"{leftcurly}": "{",
				"{rightcurly}": "}",
				"{switch}": "⌬"
			}
			if (str in repl) return repl[str];
			return " ";
		});

		switch (Math.floor(mode / 10)) {
			case 1: {
				let presets = [
					"↑↓←→",
					"WSAD",
					"IKJL",
					custom
				][mode % 10];
				elem.innerHTML = `<span class="tfgsJoystickJoystick"><span><span></span></span></span>`;

				let elemrect = elem.getBoundingClientRect();
				let r = Math.min(elemrect.right - elemrect.left, elemrect.bottom - elemrect.top) * 0.8;
				elem.children[0].style.setProperty("--size", r + "px");

				let circle = elem.children[0].children[0];
				let button = circle.children[0];
				let handleDrag = function(circle, event) {
					let rect = circle.getBoundingClientRect();
					let x0 = (rect.left + rect.right) / 2;
					let y0 = (rect.top + rect.bottom) / 2;
					if ("targetTouches" in event)
						event = event.targetTouches[0];
					let x = event.clientX - x0;
					let y = event.clientY - y0;
					let d = Math.sqrt(x * x + y * y);
					let dmax = (rect.right - rect.left) / 2 / 2;
					if (d > dmax) {
						x /= d;
						y /= d;
					} else {
						x /= dmax;
						y /= dmax;
					}
					// api.log(event.type+"|:"+d+","+dmax+","+x+","+y);
					if (y < -0.38) {
						sendKey("keydown", presets[0]);
					} else {
						sendKey("keyup", presets[0]);
					}
					if (y > 0.38) {
						sendKey("keydown", presets[1]);
					} else {
						sendKey("keyup", presets[1]);
					}
					if (x < -0.38) {
						sendKey("keydown", presets[2]);
					} else {
						sendKey("keyup", presets[2]);
					}
					if (x > 0.38) {
						sendKey("keydown", presets[3]);
					} else {
						sendKey("keyup", presets[3]);
					}
					button.style.left = x * dmax + "px";
					button.style.top = y * dmax + "px";
				};

				tfgs.drag.setdrag(circle, {
					onStart: function(event) {
						handleDrag(circle, event);
						return {
							x: 0,
							y: 0
						};
					},
					onMove: function(x, y, event) {
						handleDrag(circle, event);
					},
					onEnd: function(event) {
						for (let i = 0; i < 4; i++) {
							sendKey("keyup", presets[i]);
						}
						button.style.left = "0px";
						button.style.top = "0px";
					}
				});
				break;
			}
			case 2: {
				let presets = [
					"FC\nZX",
					"EQ\nR␣",
					"UIO\nJKL",
					"123\n456",
					"⌃⇧\n⌥␣",
					"↑↓{\n←→}",
					custom
				][mode % 10];
				elem.classList.add("tfgsJoystickJoystickKeyBoard");
				setKeyboard(elem, presets, 0);
				break;
			}
			case 3: {
				elem.innerHTML = `<span class="tfgsJoystickJoystickMouse"></span>`;
				elem = elem.children[0];
				elem.onmousedown = elem.ontouchstart = synctouch;
				elem.onmousemove = elem.ontouchmove = synctouch;
				elem.onmouseleave = elem.onmouseup = elem.ontouchend = synctouch;
				break;
			}
		}
	}

	tfgs.func.add({
		id: "joystick",
		name: "虚拟摇杆",
		info: "显示自定义虚拟摇杆",
		default: false,
		option: {
			start: {
				type: "menu",
				name: "默认模式",
				menu: ["键盘", "鼠标", "游戏手柄"],
				value: [0, 1, 2],
				default: 2
			},
			fullkey: {
				type: "check",
				name: "键盘显示更多按键",
				default: false
			},
			keyTimeout: {
				type: "number",
				name: "长按到自动连续按键的时间(毫秒)",
				min: 50,
				max: 5000,
				default: 600
			},
			keyInterval: {
				type: "number",
				name: "自动连续按键间隔(毫秒)",
				min: 5,
				max: 5000,
				default: 50
			},
			mousespeed: {
				type: "number",
				name: "鼠标指针速度",
				min: 0.05,
				max: 20,
				default: 1
			},
			mouseaccer: {
				type: "number",
				name: "鼠标指针减速",
				min: 0,
				max: 10000,
				default: 500
			},
			mouse2click: {
				type: "check",
				name: "放置两根手指模拟点击",
				default: true
			},
			mousebuttons: {
				type: "check",
				name: "鼠标显示中键和右键",
				default: false
			},
			joyleft: {
				type: "menu",
				name: "游戏手柄左侧布局",
				menu: [
					"摇杆(上下左右)",
					"摇杆(WSAD)",
					"摇杆(IKJL)",
					"摇杆(自定义)",
					"键盘(FC|ZX)",
					"键盘(EQ|R{space})",
					"键盘(UIO|JKL)",
					"键盘(123|456)",
					"键盘({ctrl}{shift}|{alt}{space})",
					"键盘({up}{down}{leftcurly}|{left}{right}{rightcurly})",
					"键盘(自定义)",
					"鼠标"
				],
				value: [10, 11, 12, 13, 20, 21, 22, 23, 24, 25, 26, 30],
				default: 10
			},
			joyright: {
				type: "menu",
				name: "游戏手柄右侧布局",
				menu: [
					"摇杆(上下左右)",
					"摇杆(WSAD)",
					"摇杆(IKJL)",
					"摇杆(自定义)",
					"键盘(FC|ZX)",
					"键盘(EQ|R{space})",
					"键盘(UIO|JKL)",
					"键盘(123|456)",
					"键盘({ctrl}{shift}|{alt}{space})",
					"键盘({up}{down}{leftcurly}|{left}{right}{rightcurly})",
					"键盘(自定义)",
					"鼠标"
				],
				value: [10, 11, 12, 13, 20, 21, 22, 23, 24, 25, 26, 30],
				default: 20
			},
			joyleftcustom: {
				type: "text",
				name: "左侧自定义",
				default: "WSAD"
			},
			joyrightcustom: {
				type: "text",
				name: "右侧自定义",
				default: "IKJL"
			}
		},
		onenable: function(_api) {
			api = _api;
			foption = api.getoption();
			opencontrol();
		},
		ondisable: function() {
			closecontrol();
		},
		onoption: function() {
			let noption = api.getoption();
			if (
				noption.fullkey !== foption.fullkey ||
				noption.mouse2click !== foption.mouse2click ||
				noption.mousebuttons !== foption.mousebuttons ||
				noption.joyleft !== foption.joyleft ||
				noption.joyright !== foption.joyright ||
				noption.joyleftcustom !== foption.joyleftcustom ||
				noption.joyrightcustom !== foption.joyrightcustom
			) {
				foption = noption;
				_refresh();
			} else {
				foption = noption;
			}
		}
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
				let target = api.selele(targetcss);
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
				let target = api.selele(targetcss /*"gui_menu-bar-position_"*/ );
				if (target === null) {
					// api.warn(buttonid + ": target not found.");
					return;
				}
				let button = document.createElement("span");
				button.classList.add(api.selcss("button_outlined-button_"));
				button.classList.add(api.selcss("stage-header_stage-button_"));
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
			let sel = api.selele("sprite-selector_scroll-wrapper_");
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
					document.body.style.setProperty("--tfgsGuimodifyMenubarHeight", window.getComputedStyle(api.selele("gui_menu-bar-position_")).height);
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
			"type": "text", // 选项类型，text 文字，number数字，check 复选框(开关)，menu 选项列表
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


/* functions/ccwterm.js */
! function() {
	let api, termwin = null,
		termdiv = null,
		lastvisi = "?",
		win = null,
		readyt = -1,
		lastmode = "?",
		vm;

	function getready() {
		if (readyt === -1) {
			readyt = setInterval(getready, 100);
			return;
		}
		if (win === null) {
			termwin = document.getElementById("gandi-terminal");
			termdiv = termwin.children[1];
			let tstyle = window.getComputedStyle(termdiv);
			let termspan = tfgs.element.create("span", "tfgsCCWtermSpan");
			let twidth = Number(tstyle.width.slice(0, -2)) + 20;
			let theight = Number(tstyle.height.slice(0, -2)) + 20;
			api.log(tstyle.width);
			api.log(tstyle.height);
			win = tfgs.window.create({
				title: "wterm",
				canClose: false,
				width: twidth + 6,
				height: theight + 26,
				onResize: function() {
					let istyle = window.getComputedStyle(this.innerDiv);
					let iw = Number(istyle.width.slice(0, -2));
					let ih = Number(istyle.height.slice(0, -2));
					termspan.style.setProperty("--scale", Math.min(iw / twidth, ih / theight));
				}
			});
			termspan.innerHTML = "<span></span>";
			termspan.children[0].appendChild(termdiv);
			termspan.style.setProperty("--termWidth", twidth + "px");
			termspan.style.setProperty("--termHeight", theight + "px");
			win.innerDiv.appendChild(termspan);
			termwin.style.display = "none";
		}
		win.title = termwin.children[0].children[0].innerText;
		win._refresh();
		if (lastvisi !== termwin.style.visibility) {
			lastvisi = termwin.style.visibility;
			api.log(`visibility: ${lastvisi}`);
			if (termwin.style.visibility !== "visible") {
				// HIDE
				switch (api.getoption().mode) {
					case "respect":
						win.windowDiv.style.visibility = "hidden";
						break;
					case "minmax":
						win.minimize();
						break;
					case "minshow":
						win.minimize();
						break;
					case "ignore":
						break;
				}
			} else {
				// SHOW
				win.windowDiv.style.visibility = "visible";
				win.movetotop();
				switch (api.getoption().mode) {
					case "respect":
						break;
					case "minmax":
						win.restore();
						break;
					case "minshow":
						break;
					case "ignore":
						break;
				}
				win.flash(200, 3, true);
			}
		}
	}

	function closecontrol() {
		if (win !== null) {
			win.close();
			win = null;
		}
		if (termwin !== null) {
			termwin.style.display = "block";
			termwin.appendChild(termdiv);
		}
	}

	tfgs.func.add({
		id: "ccwterm",
		name: "将ccw控制台放入tfgs窗口",
		info: "这个东西，我们叫它'Terminal'(终端)，微软叫它'Console'(控制台)，用着xterm又叫它控制台的ccw是",
		default: false,
		option: {
			mode: {
				type: "menu",
				name: "响应控制台消息",
				menu: ["尊重显示和隐藏操作", "将显示/隐藏理解为还原/最小化", "显示时闪烁,隐藏时最小化", "忽略隐藏请求"],
				value: ["respect", "minmax", "minshow", "ignore"],
				default: "respect"
			}
		},
		onenable: function(_api) {
			api = _api;
			lastvisi = "?";
			lastmode = api.getoption().mode;
			getready();
		},
		ondisable: function() {
			if (readyt !== -1) {
				clearInterval(readyt);
				readyt = -1;
			}
			closecontrol();
		},
		onoption: function() {
			if (api.getoption().mode !== lastmode) {
				lastvisi = "?";
				lastmode = api.getoption().mode;
			}
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
			workspace = api.workspace();
			flyoutWorkspace = api.toolbox();
			injectionDiv = api.selele("injectionDiv");
			injectionDiv.addEventListener("touchstart", on_blockTouch, true);
			//injectionDiv.addEventListener("touchmove",on_blockTouch,true);
			//injectionDiv.addEventListener("touchstop",on_blockTouch,true);
			document.body.addEventListener("mousedown", on_blockMousedown, true);
			api.log("打开");
		} catch (err) {
			api.onerror(err);
			api.log("启动失败次数: ", tryCount + 1);
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
		api.log("关闭");
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
			let menu = api.selele("blocklyContextMenu");
			if (menu !== null) {
				clearInterval(blockMenuTimer);
				blockMenuTimer = -1;
				on_blockMenu(blockBox, blockId, menu);
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
		let loaddata = function(data) {
			let blockly = api.blockly();
			let blockXML = blockly.Xml.textToDom(data);
			let blockIds = blockly.Xml.domToWorkspace(blockXML, workspace);
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
		};
		if ("clipboard" in navigator) {
			navigator.clipboard.readText().then(loaddata).catch(function(err) {
				api.onerror(err);
				loaddata(prompt("在下方粘贴:"));
			});
		} else {
			loaddata(prompt("在下方粘贴:"));
		}
	}

	function copyToXML(blockId, loadPrev, deleNext) {
		try {
			let blockly = api.blockly();
			let blockXML = blockly.Xml.workspaceToDom(workspace);
			let blockThisXML;
			if (blockId === null) {
				blockThisXML = blockly.Xml.domToText(blockXML, workspace);
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
				blockThisXML = "<xml>" + blockly.Xml.domToText(blockThis, workspace) + "</xml>";
			}
			if ("clipboard" in navigator) {
				navigator.clipboard.writeText(blockThisXML).then(function() {
					//alert('复制成功');
				}).catch(function(err) {
					api.onerror(err);
					prompt("请复制以下内容", blockThisXML);
				});
			} else {
				prompt("请复制以下内容", blockThisXML);
			}
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


/* functions/ccwterm.css */
_tfgsAddCSS(`.tfgsCCWtermSpan {
	position: absolute;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tfgsCCWtermSpan>span {
	display: inline-block;
	width: calc(var(--termWidth) * var(--scale));
	height: calc(var(--termHeight) * var(--scale));
	overflow: hidden;
}

.tfgsCCWtermSpan>span>div#terminal-container {
	background: black;
	transform: scale(var(--scale));
	transform-origin: -10px -10px;
}
`);
/* functions/forcecolor.css */
_tfgsAddCSS(`.tfgsForcecolorWin {
	font-size: 16px;
	text-align: center;
}

.tfgsForcecolorWin input {
	width: 150px;
	border: 1px solid black;
}

.tfgsForcecolorWin pre {
	font-size: 8px;
}
`);
/* functions/forcecolor.js */
! function() {
	let api = null;
	let interval = -1;
	let winob = null;

	function forcesetcolor(id, data) {
		// 强行发送颜色更改
		let div = api.selele("paint-editor_editor-container-top_")
		//id: 0填充 1轮廓
		div = div.children[1].children[0].children[id];
		let stateNode = api.reactInternal(div).return.return.return.stateNode;

		// 找到 stateNode 后，可以访问并执行react回调函数
		// 经过尝试和查看scratch源代码可以发现这些函数可以修改颜色
		stateNode.handleChangeGradientType(data.gradientType);
		// 改左颜色
		stateNode.props.onChangeColorIndex(0);
		stateNode.handleChangeColor(data.primary);
		// 如果需要改右颜色，就改右颜色
		// 如果在纯色模式下还去改右颜色会变成改左颜色，因此要特判
		if (data.gradientType !== "SOLID") {
			stateNode.props.onChangeColorIndex(1);
			stateNode.handleChangeColor(data.secondary);
		}
		// 象征性地
		stateNode.handleCloseColor();
		// 更改颜色后，如果有选中的项，它们会改变颜色，调用onUpdateImage提交造型的修改以免丢失。
		stateNode.props.onUpdateImage();

		// 如果设置的颜色包含透明度，在颜色通过方法一传播到最后的时候会被检查函数拦下，导致当前颜色没有改变（但是选中元素的颜色会正常改变），此时使用方法二
		let vm = api.vm();
		let color = tfgs.funcapi.paint().color;
		// 强行改变color的值，这在redux中很不规范，但是有效
		let colid = id === 1 ? "strokeColor" : "fillColor";
		color[colid].gradientType = data.gradientType;
		color[colid].primary = data.primary;
		color[colid].secondary = data.secondary;
		// 关键：调用refreshWorkspace直接刷新工作区，此时当前颜色完美改变。
		vm.refreshWorkspace();
	}

	function showwindow() {
		if (winob !== null) {
			return;
		}
		winob = tfgs.window.create({
			title: "forceColor",
			haveLogo: false,
			canClose: false,
			canMaximize: false,
			x: 100,
			y: 80,
			width: 250,
			height: 160,
			minWidth: 120,
			minHeight: 120
		});
		let win = tfgs.element.create("div", "tfgsForcecolorWin");
		win.innerHTML = `
类型: <select>
	<option value="0">填充颜色</option>
	<option value="1">轮廓颜色</option>
</select><br/>
颜色1: <input type="text" value="#00ff00"></input><br/>
颜色2: <input type="text" value="#ff0000"></input><br/>
混合模式: <select>
	<option value="SOLID">■</option>
	<option value="VERTICAL">↓</option>
	<option value="HORIZONTAL">→</option>
	<option value="RADIAL">○</option>
</select><br/>
<input type="button" value="设置"></input>
<pre>颜色格式: #RRGGBB 或者 rgb(红色, 绿色, 蓝色)
透明颜色: #RRGGBBAA 或者 rgba(红色, 绿色, 蓝色, 不透明度)</pre>
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
		winob.innerDiv.appendChild(win);
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
		name: "强行设定颜色",
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


/* (allinone.js) */
	tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
} catch(e) {
	alert(e.message);
	console.error(e);
	throw e;
}