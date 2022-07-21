/* (allinone.js) */

! function (){
	try {
		let tfgs;

		// 检测 TFGS 是否重复安装
		if ("__TFGS$GjVPnZEHRf" in window) {
			throw new Error("TFGS 已经安装");
		} else {
			tfgs = window["__TFGS$GjVPnZEHRf"] = {};
		}

		// 插入 CSS 文件
		function _tfgsAddCSS(css) {
			let style = document.createElement("style");
			style.innerHTML = css;
			document.head.appendChild(style);
		}
		/* tfgs/menu.js */
		! function (){
tfgs.menu = {};

tfgs.menu.menuwin = null;

tfgs.menu.modi = false;

// 如果设置被更新，就在离开网站前提示
window.addEventListener("beforeunload", function(event) {
	if (tfgs.menu.modi) {
		event.preventDefault();
		event.returnValue = "";
		return "";
	}
});

// 设置被修改状态更新
tfgs.menu.setmodi = function(modi) {
	if (modi !== tfgs.menu.modi) {
		let buttons = tfgs.menu.buttons;
		for (let i in buttons) {
			let flip;
			switch (i) {
				case "edit":
					// 不影响编辑文本按钮（一直隐藏）
					continue;
				case "save":
				case "cancel":
					// 保存，取消按钮只有在修改后才显示
					flip = false;
					break;
				default:
					// 其他按钮在修改前显示
					flip = true;
					break;
			}
			buttons[i].classList[modi === flip ? "add" : "remove"]("tfgsDisable");
		}
		// 改变标题和是否可以最小化
		tfgs.menu.menuwin.title = modi ? "TFGS 选项 (未保存)" : "TFGS 选项";
		tfgs.menu.menuwin.canMinimize = !modi;
		tfgs.menu.menuwin._refresh();
		tfgs.menu.modi = modi;
	}
};

// 生成设置窗口
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
<div class="tfgsMenuContent"></div>
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

	// 底下的按钮
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
		// 打开/关闭按钮
		fl.enable = funcdiv.children[0].children[0]
		fl.enable.addEventListener("change", function() {
			tfgs.menu.setmodi(true);
		});
		fl.option = {};
		// 标题
		funcdiv.children[0].children[1].innerText = f.name;
		let frame = function(x, y) {
			if (x !== undefined && x !== null && x !== "") return x + y;
			else return "";
		};
		// 介绍
		funcdiv.children[0].children[2].innerText = frame(f.version, " ") + frame(f.author, " ") + frame(f.info, "");
		// 选项列表
		let fopdiv = funcdiv.children[1];
		fl.optiondiv = fopdiv;
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let lab, inp;
			lab = tfgs.element.create("label");
			lab.innerText = o.name;
			switch (o.type) {
				case "number":
					// 右边的tel，我之前用的number，但是问题是手机上在处于造型界面打开菜单的时候会卡死
					inp = tfgs.element.create("input", undefined, "tel");
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
		// 自动折叠
		fl.enable.addEventListener("change", function(event) {
			fl.optiondiv.classList[fl.enable.checked ? "remove" : "add"]("tfgsMenuFuncFold");
		});
	}

	tfgs.menu.menuwin = menuwin;

	tfgs.menu.load();
}

// 保存设置到data
tfgs.menu.save = function() {
	tfgs.data.setjson(tfgs.menu._json());
	return tfgs.data.save();
};

// 获取当前设置代表的json
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

// 从data加载设置
tfgs.menu.load = function() {
	let flist = tfgs.func.list;
	let dlist = tfgs.data.list;
	let mlist = tfgs.menu.list;
	for (let fname in flist) {
		let f = flist[fname];
		let d = dlist[fname];
		let m = mlist[fname];
		m.enable.checked = d.enable;
		m.optiondiv.classList[m.enable.checked ? "remove" : "add"]("tfgsMenuFuncFold");
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

// 删除菜单窗口
tfgs.menu.delete = function() {
	tfgs.menu.menuwin.canClose = true;
	tfgs.menu.menuwin.close();
	tfgs.menu.menuwin = null;
};

		}();

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

		/* tfgs/funcapi.js */
		! function (){
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

/* ---------- 复制粘贴 ---------- */

tfgs.funcapi.copy = function(name, text) {
	return new Promise((yes, no) => {
		if ("clipboard" in navigator && "writeText" in navigator.clipboard) {
			navigator.clipboard.writeText(text)
				.then(yes)
				.catch(function(err) {
					tfgs.funcapi.onerror(name, err);
					prompt("请复制以下内容", text);
					yes();
				});
		} else {
			prompt("请复制以下内容", text);
			yes();
		}
	});
};

tfgs.funcapi.paste = function(name) {
	return new Promise((yes, no) => {
		if ("clipboard" in navigator && "readText" in navigator.clipboard) {
			navigator.clipboard.readText().then(yes).catch(function(err) {
				tfgs.funcapi.onerror(name, err);
				yes(prompt("在下方粘贴:"));
			});
		} else {
			yes(prompt("在下方粘贴:"));
		}
	});
};

/* ---------- 获取Scratch相关内容 ---------- */

// scratchBlocks
tfgs.funcapi.blockly = function(name) {
	let errors = [];
	try {
		// 用 ClipCC 的 api
		return window.ClipCCExtension.api.getBlockInstance();
	} catch (e) {
		errors.push(e);
		try {
			// 获取Block方法2
			let block = tfgs.funcapi.vm(name).runtime.scratchBlocks;
			if (typeof block !== "object" || block === null || !("getMainWorkspace" in block))
				throw new Error("Invaild block");
			return block;
		} catch (e) {
			errors.push(e);
			try {
				// 获取Block方法3
				let block = tfgs.funcapi.reactInternal(name,
						tfgs.funcapi.selele(name, "blocks_blocks_")
					)
					.return.return.return.return
					.return
					.stateNode.ScratchBlocks;
				if (typeof block !== "object" || block === null || !("getMainWorkspace" in block))
					throw new Error("Invaild block");
				return block;
			} catch (e) {
				errors.push(e);
				for (let i = 0; i < errors.length; i++) {
					tfgs.funcapi.error(name, `funcapi: block: 方法${i+1}错误:`);
					tfgs.funcapi.onerror(name, errors[i]);
				}
				throw new Error("tfgs.funcapi.block: cannot find block");
			}
		}
	}
};

// 积木区相关
tfgs.funcapi.workspace = function(name) {
	return tfgs.funcapi.blockly(name).getMainWorkspace();
};

// 积木盒相关
tfgs.funcapi.toolbox = function(name) {
	return tfgs.funcapi.workspace(name).getFlyout().getWorkspace();
};

// 获取class包含classname的元素
tfgs.funcapi.selele = function(name, classname, element) {
	return (element === undefined ? document : element).querySelector(`[class*="${classname}"]`);
};

// 获取class包含classname的所有元素
tfgs.funcapi.selall = function(name, classname, element) {
	return (element === undefined ? document : element).querySelectorAll(`[class*="${classname}"]`);
};

// 获取元素中包含classname的类型名
tfgs.funcapi.selcss = function(name, classname, element) {
	let elem = tfgs.funcapi.selele(name, classname, element);
	if (elem === null)
		return null;
	let csslist = elem.classList;
	for (let i = 0; i < csslist.length; i++)
		if (csslist[i].includes(classname))
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
tfgs.funcapi.store = function(name) {
	let errors = [];
	try {
		// 获取store方法1
		let store = tfgs.funcapi.reactInternal(
			name, tfgs.funcapi.selele(name, "gui_page-wrapper_")
		).child.stateNode.store;
		if (typeof store !== "object" || store === null || !("dispatch" in store))
			throw new Error("Invaild store");
		return store;
	} catch (e) {
		errors.push(e);
		try {
			// 获取store方法2
			let store = tfgs.funcapi.reactInternal(
				name, tfgs.funcapi.selele(name, "blocks_blocks_")
			).return.return.return.return.pendingProps.value.store;
			if (typeof store !== "object" || store === null || !("dispatch" in store))
				throw new Error("Invaild store");
			return store;
		} catch (e) {
			errors.push(e);
			for (let i = 0; i < errors.length; i++) {
				tfgs.funcapi.error(name, `funcapi: store: 方法${i+1}错误:`);
				tfgs.funcapi.onerror(name, errors[i]);
			}
			throw new Error("tfgs.funcapi.store: cannot find store");
		}
	}
};

// gui 对象
tfgs.funcapi.gui = function(name) {
	let errors = [];
	try {
		// 用 ClipCC 的 api
		return window.ClipCCExtension.api.getGuiInstance();
	} catch (e) {
		errors.push(e);
		try {
			// 获取Gui方法2
			let gui = tfgs.funcapi.reactInternal(name,
					tfgs.funcapi.selele(name, "gui_page-wrapper_")
				)
				.return.return.return.return
				.return.return.return.return
				.stateNode;
			if (typeof gui.props !== "object" || gui.props === null || !("vm" in gui.props))
				throw new Error("Invaild gui");
			return gui;
		} catch (e) {
			errors.push(e);
			for (let i = 0; i < errors.length; i++) {
				tfgs.funcapi.error(name, `funcapi: gui: 方法${i+1}错误:`);
				tfgs.funcapi.onerror(name, errors[i]);
			}
			throw new Error("tfgs.funcapi.gui: cannot find gui");
		}
	}
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
			// 获取VM方法2
			let vm = tfgs.funcapi.gui(name).props.vm;
			if (typeof vm !== "object" || vm === null || !("runtime" in vm))
				throw new Error("Invaild vm");
			return vm;
		} catch (e) {
			errors.push(e);
			try {
				// 获取VM方法3
				let vm = tfgs.funcapi.store(name).getState().scratchGui.vm;
				if (typeof vm !== "object" || vm === null || !("runtime" in vm))
					throw new Error("Invaild vm");
				return vm;
			} catch (e) {
				errors.push(e);
				for (let i = 0; i < errors.length; i++) {
					tfgs.funcapi.error(name, `funcapi: vm: 方法${i+1}错误:`);
					tfgs.funcapi.onerror(name, errors[i]);
				}
				throw new Error("tfgs.funcapi.vm: cannot find vm");
			}
		}
	}
};

// 绘画状态
// ClipCC 目前不可用
tfgs.funcapi.paint = function(name) {
	return tfgs.funcapi.store(name).getState().scratchPaint;
};

// 当前处于的标签页
tfgs.funcapi.currenttab = function(name) {
	let selected = tfgs.funcapi.selele(name, "gui_is-selected_");
	if (selected === null)
		return -1;
	return Number(selected.id.slice(-1)) / 2;
};

// Respect community limits
tfgs.funcapi.RESPECTnodownload_DO_NOT_DELETE = function(name) {
	/****************************************\
	 *                                      *
	 *  社区的稳定和拓展的顺利开发很大程度  *
	 *  都基于用户和官方的相互信任。哪怕是  *
	 *  作为开源的支持者，也会尊重其他用户  *
	 *  的决定。                            *
	 *  如果你知道你在做什么，请不要修改这  *
	 *  个函数，因为一旦有人使用这个拓展破  *
	 *  坏规则，这个拓展可能将会被永久性地  *
	 *  封禁。                              *
	 *  感谢大家配合。                      *
	 *                                      *
	\****************************************/
	let gui = tfgs.funcapi.gui(name);
	if ("readOnly" in gui.props && gui.props.readOnly === true) return true;
	if ("canSaveToLocal" in gui.props && gui.props.canSaveToLocal === false) return true;
	if ("openSourceLevel" in gui.props && gui.props.openSourceLevel !== 3) return true;
	return false;
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

		}();

		/* tfgs/log.js */
		! function (){
tfgs.log = {};

tfgs.log.list = [];

// 自动更新计时器id
tfgs.log.dispIntv = null;

// 添加记录，color颜色，name拓展名字，log记录内容
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

// 清楚记录
tfgs.log.clear = function() {
	tfgs.log.list = [];
	tfgs.log.changed = true;
};

// 自动更新，div显示元素，fliter筛选
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

// 更新显示，div显示元素，fliter筛选
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

// 显示窗口
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

		}();

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
	max-height: 200px;
	box-sizing: border-box;
	overflow: auto;
	transition: all ease 0.2s;
}

.tfgsMenuFuncOption.tfgsMenuFuncFold {
	max-height: 0px;
}

.tfgsMenuFuncOptionOne {
	display: inline-block;
	margin: 2px;
	padding: 2px;
	background: #bdf;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
	border-radius: 2px;
	box-sizing: border-box;
	width: calc(50% - 6px);
	font-size: 12px;
}

.tfgsMenuFunc input,
.tfgsMenuFunc select {
	position: relative;
	vertical-align: middle;
	border: none;
	background: white;
	width: 80px;
	margin: 1px;
	padding: 1px;
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);
	border-radius: 2px;
	font-size: 12px;
}

.tfgsMenuFuncOptionOne>input {
	box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5) inset;
}

.tfgsMenuFuncOptionOne>input[type="checkbox"],
.tfgsMenuFuncTitle>input {
	width: 15px;
	height: 15px;
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

		/* tfgs/storezip.js */
		! function (){
// 获取storezip对象，用来生成无压缩的zip压缩包
//
// 例子:
// let zip = tfgs.storezip.create();
// zip.begin();
// zip.addfile("example.txt", "hello, world!");
// zip.addfile("timetravel.txt", "查看我的修改时间", "文件注释", "2022-10-10 12:34:56"); // 秒数会取最近的偶数
// zip.addfile("test.bin", [0x00, 0x05, 0x08, 0x0a]); // 支持字节数组，Uint8Array
// let zipdata = zip.end("zip 注释"); // 返回Uint8Array
// // 以下代码Node.js有效
// require('fs').writeFileSync('test.zip', Buffer.from(zipdata));
//
// 编码只有utf-8，中文在windows下默认乱码，需要解压程序支持utf-8编码

tfgs.storezip = {};

tfgs.storezip.create = function() {
	let bin = [];

	function append(x) {
		x.forEach(v => bin.push(v));
	}

	// 将字符串转换成Uint8Array
	function str2uint(x) {
		return new Uint8Array(new TextEncoder().encode(x));
	}

	// 将时间转换成数字
	function todatetime(x) {
		if (x === undefined || x === null) x = new Date();
		if (typeof x !== "object") {
			let str = x;
			x = new Date();
			x.setTime(Date.parse(str));
		}
		if (x.constructor.name === "Date") {
			x = {
				year: x.getYear() - 80,
				month: x.getMonth() + 1,
				date: x.getDate(),
				hour: x.getHours(),
				minute: x.getMinutes(),
				second: x.getSeconds()
			};
		}
		return (x.second >>> 1) & 0b11111 | // 秒数会取最近的偶数
			(x.minute & 0b111111) << 5 |
			(x.hour & 0b11111) << 11 |
			(x.date & 0b11111) << 16 |
			(x.month & 0b1111) << 21 |
			(x.year & 0b1111111) << 25;
	}

	function num2(x) {
		bin.push(x & 0xff);
		bin.push((x >>> 8) & 0xff);
	}

	function num4(x) {
		bin.push(x & 0xff);
		bin.push((x >>> 8) & 0xff);
		bin.push((x >>> 16) & 0xff);
		bin.push((x >>> 24) & 0xff);
	}

	let filehead = [
		0x50, 0x4b, 0x03, 0x04,
		0x0a, 0x00, //min unzip version
		0x00, 0x00,
		0x00, 0x00,
	];

	let central = [
		0x50, 0x4b, 0x01, 0x02,
		0x0a, 0x00, //version
		0x0a, 0x00, //min unzip version
		0x00, 0x00,
		0x00, 0x00,
	];

	let centralend = [
		0x50, 0x4b, 0x05, 0x06,
		0x00, 0x00,
		0x00, 0x00
	];

	let files = [];

	let crc32Table = crc32TableCreate();

	function crc32(uint) {
		if (typeof uint === "string") uint = str2uint(uint);
		let crc = 0xFFFFFFFF;
		uint.forEach(v => {
			crc = (crc >>> 8) ^ crc32Table[(crc ^ v) & 0xFF];
		});
		crc ^= 0xFFFFFFFF;
		return crc < 0 ? crc + 0x100000000 : crc;
	}

	function crc32TableCreate() {
		let table = [];
		for (i = 0; i < 256; i++) {
			let crc = i;
			for (j = 0; j < 8; j++) {
				if (crc & 1)
					crc = (crc >>> 1) ^ 0xEDB88320;
				else
					crc = crc >>> 1;
			}
			table.push(crc);
		}
		return table;
	}

	// 初始化
	function begin() {
		bin = [];
	}

	// 添加文件（名字、内容、注释、时间）
	function addfile(name, uint, cint, datetime) {
		if (uint === undefined || uint === null) uint = [];
		if (typeof uint === "string") uint = str2uint(uint);
		if (cint === undefined || cint === null) cint = [];
		if (typeof cint === "string") cint = str2uint(cint);
		if (cint.length > 65535) {
			tfgs.funcapi.warn(name, "压缩包注释太长(最多65535个字节)");
			cint = cint.slice(0, 65535);
		}
		if (typeof datetime !== "number") datetime = todatetime(datetime);
		let offs = bin.length;
		let crc = crc32(uint);
		let uname = str2uint(name);
		if (uname.length > 65535) {
			tfgs.funcapi.error(name, "压缩包文件名太长(最多65535个字节)");
			throw new Error("File name too long");
		}
		append(filehead);
		num4(datetime); // datetime
		num4(crc); // crc32
		num4(uint.length); // old size
		num4(uint.length); // new size
		num2(uname.length); // length of filename
		num2(0); // length of extra data
		append(uname); // filename
		append(uint); // data
		files.push({
			uname: uname,
			size: uint.length,
			offs: offs, // data offset
			crc: crc,
			cint: cint, // file comment
			datetime: datetime,
		});
	}

	// 结束并返回zip内容（全文注释）
	function end(cint) {
		if (cint === undefined || cint === null) cint = [];
		if (typeof cint === "string") cint = str2uint(cint);
		if (cint.length > 65535) cint = cint.slice(0, 65535);
		let offs = bin.length;
		files.forEach(v => {
			append(central);
			num4(v.datetime); // datetime
			num4(v.crc); // crc32
			num4(v.size); // old size
			num4(v.size); // new size
			num2(v.uname.length); // length of filename
			num2(0); // length of extra data
			num2(v.cint.length); // length of comment
			num2(0);
			num2(0); // internal attr
			num4(0b00100000); // external attr (xlADVSHR)
			num4(v.offs); // data offset
			append(v.uname); // filename
			append(v.cint); // file comment
		});

		let size = bin.length - offs;
		append(centralend);
		num2(files.length); // total files in this part
		num2(files.length); // total files
		num4(size); // size of central
		num4(offs); // cantral offset
		num2(cint.length); // comment length
		append(cint); // comment

		return bin;
	}

	return {
		crc32,
		str2uint,
		todatetime,
		begin,
		addfile,
		end
	};
};

		}();

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

		/* tfgs/drag.js */
		! function (){
tfgs.drag = {};

// 下面这个来自scratch的源代码
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

// drag.js的使用例子：
// // 保存移除回调函数的函数
// let canceldrag = tfgs.drag.setdrag(div, {
// 	"onStart": function(event) {
// 		if (draggable) {
// 			// 如果可以拖动，一定要返回当前的被拖动对象位置
// 			// 用来计算下次拖动的相对位置
// 			return {
// 				offsetX,
// 				offsetY
// 			};
// 		} else {
// 			// 否则返回null取消
// 			return null;
// 		}
// 	},
// 	"onDrag": function(x, y, event) {
// 		// x, y: 根据onStart的返回值计算出的位置，event是触发事件(可以获得原事件的鼠标位置等)
// 		offsetX = x;
// 		offsetY = y
// 		// 接着就可以实现拖动范围限制等内容
// 		if (offsetX < 0)
// 			offsetX = 0;
// 		// 移动元素等
// 		updateElement();
// 	},
// 	"onEnd": function(mode, event) {
// 		// mode 有两种选择：click表示没有拖动，只点击，还有move代表拖动了
// 		if (mode === "click") {
// 			handleClick();
// 		}
// 	}
// });
// // 如果你想要移除回调函数，可以运行之前返回的
// canceldrag();

tfgs.drag.setdrag = function(elem, options) {
	//elem
	//options
	//  onStart [!] 如果可以拖动，一定要返回当前的被拖动对象位置，否则返回null取消
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

		}();

		/* tfgs/window.js */
		! function (){
tfgs.window = {};

// 窗口初始z-index
tfgs.window.zIndex = 1e6;

// 创建窗口
tfgs.window.create = function(options) {
	let windowobj = { // 这和options的格式相似
		/* elements */
		titleDiv: null,
		innerDiv: null,
		windowDiv: null,
		resizeDiv: null,

		/* position */
		x: NaN, // 左上角位置，默认随机
		y: NaN,
		width: 400, // 窗口长宽
		height: 300,
		minHeight: 0, // 正常模式最小高度
		minWidth: 100, // 正常模式最小宽度
		minimizeWidth: 100, // 最小化时的宽度

		/* settings */
		title: "", // 窗口标题

		/* options */
		haveLogo: true, // logo指的是左上角的三个横线
		canMinimize: true, // 可以最小化，最大化，关闭
		canMaximize: true,
		canClose: true,
		canResize: true, // 可以改变大小，移动
		canMove: true,

		/* callback */
		onClose: function() {}, // 关闭/最大化/移动时回调(没有参数，用this获取窗口对象)
		onResize: function() {}, // 关闭回调可以返回false阻止关闭
		onMove: function() {},

		/* status */
		isMinimize: false, // 当前状态
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
		//最小化
		minimize: function() {
			this._rememberPos();
			this.isMinimize = true;
			this.isMaximize = false;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		//最大化
		maximize: function() {
			this._rememberPos();
			this.isMinimize = false;
			this.isMaximize = true;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		//还原
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
		//移到最上层
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
		//关闭(触发回调)
		close: function() {
			if (this.onClose() === false) return;
			this.windowDiv.remove();
			this.windowDiv = null;
			window.removeEventListener("resize", windowDiv._resizeCallback);
		},
		//改变大小
		resize: function(w, h) {
			if (w === this.width && h === this.height) return;
			this.width = w;
			this.height = h;
			this._refresh();
			this.onResize();
		},
		//移动
		move: function(x, y) {
			if (x === this.x && y === this.y) return;
			this.x = x;
			this.y = y;
			this._refresh();
			this.onMove();
		},
		//闪烁橙色(time闪烁间隔时间,count次数,stay闪完后是否保持橙色
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
		//刷新窗口，修改参数后要调用
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

		}();

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
		! function (){
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

		}();

		/* tfgs/element.js */
		! function (){
tfgs.element = {};

// 新建HTML元素, tagName元素类型，className css类型名(可省略), type 输入类型(可省略)（针对<input>）
tfgs.element.create = function(tagName, className, type) {
	let ele = document.createElement(tagName);
	if (className !== undefined) ele.className = className;
	ele.className = className;
	if (type !== undefined) ele.type = type;
	return ele;
};

		}();

		/* tfgs/error.js */
		! function (){
// 出错处理
tfgs.error = function(e) {
	alert(e.message);
	console.error(e);
	throw e;
};

		}();

		/* tfgs/func.js */
		! function (){
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

		}();

		/* functions/ccwterm.js */
		! function (){
let api, termwin = null,
	termdiv = null,
	lastvisi = "?",
	win = null,
	readyt = -1,
	lastmode = "?",
	vm;

function getready() {
	if (readyt === -1) {
		readyt = setInterval(getready, 1000);
		return;
	}
	if (win === null) {
		termwin = document.getElementById("gandi-terminal");
		if (termwin === null) return;
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

function getxtermhelp() {
	return document.getElementsByClassName("xterm-helper-textarea")[0];
}

function handleinput(e) {
	for (let x = 0; x < e.data.length; x++) {
		this.dispatchEvent(new KeyboardEvent('keypress', {
			charCode: e.data.codePointAt(x)
		}));
		e.preventDefault();
	}
}

function handlekeypress(e) {
	e.preventDefault();
}

function enableinputfix() {
	let xtermhelp = getxtermhelp();
	if (xtermhelp !== undefined) {
		xtermhelp.addEventListener('compositionend', handleinput);
		xtermhelp.addEventListener('input', handleinput);
		xtermhelp.addEventListener('keypress', handlekeypress);
	}
}

function disableinputfix() {
	let xtermhelp = getxtermhelp();
	if (xtermhelp !== undefined) {
		xtermhelp.removeEventListener('compositionend', handleinput);
		xtermhelp.removeEventListener('input', handleinput);
		xtermhelp.removeEventListener('keypress', handlekeypress);
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
		},
		fixinput: {
			type: "check",
			name: "修复中文/手机输入异常",
			default: "true"
		}
	},
	onenable: function(_api) {
		api = _api;
		lastvisi = "?";
		lastmode = api.getoption().mode;
		getready();
		if (api.getoption().fixinput) {
			enableinputfix();
		} else {
			disableinputfix();
		}
	},
	ondisable: function() {
		if (readyt !== -1) {
			clearInterval(readyt);
			readyt = -1;
		}
		closecontrol();
		disableinputfix();
	},
	onoption: function() {
		if (api.getoption().mode !== lastmode) {
			lastvisi = "?";
			lastmode = api.getoption().mode;
		}
		if (api.getoption().fixinput) {
			enableinputfix();
		} else {
			disableinputfix();
		}
	}
});

		}();

		/* functions/blockmenu.js */
		! function (){
let api;
let api_enabled = false;
let workspace, blockly;
// 打开重试计时器
let opening = -1;

let _origcontextmenu1 = null;
let _origcontextmenu2 = null;

let foption = {};

function setup(tryCount) {
	api_enabled = true;
	//部分社区的界面会加载，尝试多次
	try {
		blockly = api.blockly();
		workspace = api.workspace();
		// 积木区背景
		if (_origcontextmenu1 === null) {
			_origcontextmenu1 = workspace.showContextMenu_;
			workspace.showContextMenu_ = function(e) {
				let ret = _origcontextmenu1.apply(this, arguments);
				try {
					if (api_enabled) {
						on_blockMenu(e, null, workspace);
					}
				} catch (e) {
					api.onerror(e);
				}
				return ret;
			}
		}
		// 所有积木
		if (_origcontextmenu2 === null) {
			_origcontextmenu2 = blockly.BlockSvg.prototype.showContextMenu_;
			blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
				let ret = _origcontextmenu2.apply(this, arguments);
				try {
					if (api_enabled) {
						on_blockMenu(e, this, this.workspace);
					}
				} catch (e) {
					api.onerror(e);
				}
				return ret;
			}
		}
		api.log("打开");
	} catch (err) {
		api.onerror(err);
		api.log("启动失败次数: " + (tryCount + 1));
		opening = setTimeout(function() {
			setup(tryCount + 1);
		}, 500);
		return;
	}
}

// event: 触发菜单的模拟事件，block: 积木对象(可能是null)，blockspace：触发事件的workspace（可能是workspace或者toolbox）
function on_blockMenu(event, block, blockspace) {
	let menu = api.selele("blocklyContextMenu");
	if (menu === null) return;

	let blockId = block === null ? null : block.id;

	if (foption.copypaste &&
		// 积木在积木区里（不在积木盒里）？
		blockspace === workspace &&
		!api.RESPECTnodownload_DO_NOT_DELETE()) {
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
}

function addToContextMenu(name, callback, element) {
	let menuItem = tfgs.element.create("div", "goog-menuitem");
	menuItem.setAttribute("role", "menuitem");
	menuItem.style.userSelect = "none";
	let menuText = tfgs.element.create("div", "goog-menuitem-content");
	menuText.innerText = name;
	menuItem.appendChild(menuText);
	menuItem.addEventListener("click", callback);
	element.parentElement.style.height = "100000px";
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
	api.paste().then(loaddata);
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
		api.copy(blockThisXML);
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
	id: "blockmenu",
	name: "积木右键菜单",
	info: "在右键菜单中添加各种功能",
	default: false,
	option: {
		copypaste: {
			type: "check",
			name: "复制，粘贴积木为文本",
			default: true
			/*
		},
		copypastekey: {
			type: "check",
			name: "按下复制粘贴快捷键时触发(没有实装)",
			default: true
		},
		jumpto: {
			type: "check",
			name: "跳转到...(没有实装)",
			default: true
		},
		jumptodef: {
			type: "check",
			name: "跳转到定义(没有实装)",
			default: true
		},
		jumptoref: {
			type: "check",
			name: "跳转到引用...(没有实装)",
			default: true
		},
		jumptomodi: {
			type: "check",
			name: "跳转到修改...(没)",
			default: true
		},
		editdefault: {
			type: "check",
			name: "编辑默认值...(没)",
			default: true
		},
		search: {
			type: "check",
			name: "查找关键词...(没)",
			default: true
		},
		variable: {
			type: "check",
			name: "合并或修改变量...()",
			default: true
			*/
		}
	},
	onenable: function(_api) {
		api = _api;
		foption = api.getoption();
		setup(1);
	},
	ondisable: function() {
		api_enabled = false;
		// 停止重试
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		api.log("关闭");
	},
	onoption: function() {
		foption = api.getoption();
	}
});

		}();

		/* functions/forcecolor.js */
		! function (){
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

		/* functions/joystick.js */
		! function (){
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
	setKeyboard(jKeyb, keybsets[i], 1, true);

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

function createKey(key, nextId, autoSize) {
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
		x.innerText = key + (name.toLowerCase() !== shname.toLowerCase() && autoSize ? "\n" + shname : "");
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
	if (autoSize) {
		if (name === "Unidentified") x.style.flexGrow = 1.5;
		if (name === "Shift") x.style.flexGrow = 2;
		if (name === "Control") x.style.flexGrow = 2;
		if (name === "Enter") x.style.flexGrow = 1.5;
		if (name === " ") x.style.flexGrow = 4;
	}
	if (name === "Unidentified") x.style.visibility = "hidden";
	return x;
}

function setKeyboard(elem, char1, nextId, autoSize) {
	elem.innerHTML = "";
	char1 = char1.split('\n');
	for (let i in char1) {
		let line1 = char1[i].split('');
		let line = tfgs.element.create("span");
		for (let j in line1) {
			let char1 = line1[j];
			line.appendChild(createKey(char1, nextId, autoSize));
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
	custom = custom.replace(/\|/g, "\n").replace(new RegExp("\\{[^}]+\\}", "g"), function(str) {
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
			"{bar}": "|",
			"{empty}": " ",
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
				"↑↓{\n←→}\n| ",
				custom
			][mode % 10];
			elem.classList.add("tfgsJoystickJoystickKeyBoard");
			setKeyboard(elem, presets, 0, false);
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
			min: 0.5,
			max: 20,
			default: 5
		},
		mouseaccer: {
			type: "number",
			name: "鼠标指针减速",
			min: 0,
			max: 10000,
			default: 100
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
				"键盘({up}{down}{leftcurly}|{left}{right}{rightcurly}|{bar}{empty})",
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

		/* functions/foldbutton.css */
		_tfgsAddCSS(`span.tfgsFoldbuttonButton {
	position: absolute;
	color: grey;
	background: white;
	font-size: 1em;
	line-height: 30px;
	width: 30px;
	height: 30px;
	border-radius: 2px;
	border: 1px solid grey;
	text-align: center;
	cursor: pointer;
}

body.tfgsFoldbuttonMenubarFold div[class*=gui_menu-bar-position_] {
	top: calc(0px - var(--tfgsFoldbuttonMenubarHeight));
	margin-bottom: calc(0px - var(--tfgsFoldbuttonMenubarHeight));
}

body.tfgsFoldbuttonMenubarFold div[class*=gui_body-wrapper_] {
	height: 100%;
}

body.tfgsFoldbuttonBlocktoolFold .blocklyFlyoutScrollbar,
body.tfgsFoldbuttonBlocktoolFold .blocklyFlyout {
	left: -250px;
}

body.tfgsFoldbuttonStagetargetFold div[class*=gui_stage-and-target-wrapper_] {
	display: none;
}

/* gandi */
body.tfgsFoldbuttonSpriteinfoFold div[class*=sprite-info_sprite-info_],
body.tfgsFoldbuttonSpriteinfoFold div[class*=target-pane_target-preview_] {
	max-height: 0px;
	padding: 0px;
	overflow: hidden;
}

body.tfgsFoldbuttonStagebuttonFold div[class*=target-pane_stage-selector-wrapper_] {
	max-width: 0px;
	padding: 0px;
	margin-left: 0px;
	margin-right: 0px;
	overflow: hidden;
}

body.tfgsFoldbuttonStageFold div[class*=stage-wrapper_stage-canvas-wrapper_] {
	max-height: 0px;
	padding: 0px;
	overflow: hidden;
}

body.tfgsFoldbuttonFullscreen {
	overflow: scroll;
}

body.tfgsFoldbuttonExpand100 {
	position: fixed;
	bottom: 0;
}

body.tfgsFoldbuttonAssetpanelFold [class*=selector_wrapper_] {
	position: absolute;
	height: 100%;
	width: 100%;
	z-index: 2;
}

body.tfgsFoldbuttonAssetpanelFold [class*=selector_list-area_] {
	flex-direction: row;
	flex-wrap: wrap;
	align-content: flex-start;
}

body.tfgsFoldbuttonAssetpanelFold [class*="sprite-selector-item_sprite-selector-item_"] {
	margin-left: 0.8em;
}

body.tfgsFoldbuttonAssetpanelFold [class*=asset-panel_detail-area_] {
	padding-left: 45px;
}
`);

		/* functions/blocktips.js */
		! function (){
/*
let api, workspace;

let opening = -1;

let costume_sound = null;

function childof(parent, test) {
	if (parent === null) return false;
	while (test !== parent && test !== null) {
		test = test.parentElement;
	}
	return test === parent;
}

function starttips() {
	try {
		opening = -1;
		workspace = api.workspace();
	} catch (e) {
		opening = setTimeout(starttips, 500);
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

tfgs.func.add({
	id: "blocktips",
	name: "显示编辑提示",
	info: "不知道该咋解释",
	option: {},
	onenable: function(_api) {
		api = _api;
		starttips();
	},
	ondisable: function() {
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
	},
	onoption: function() {}
});
*/

		}();

		/* functions/foldbutton.js */
		! function (){
let api;
let interval = -1;

let pbutton = {};
let foption = {};
let _fullscreen = false;
let _oldTabIndex = 0;

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
			button.classList.add("tfgsFoldbuttonButton");
			for (let i in styles)
				button.style[i] = styles[i];
			button.innerText = addinner;
			button.checked = false;
			button.addEventListener("click", function() {
				if (button.checked) {
					if (cssname !== undefined)
						document.body.classList.remove(cssname /*"tfgsFoldbuttonMenubarFold"*/ );
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
		if (foption.expand100) {
			if (!document.body.classList.contains("tfgsFoldbuttonExpand100")) {
				document.body.classList.add("tfgsFoldbuttonExpand100");
				dispatchEvent(new Event("resize"));
			}
		} else {
			if (document.body.classList.contains("tfgsFoldbuttonExpand100")) {
				document.body.classList.remove("tfgsFoldbuttonExpand100");
				dispatchEvent(new Event("resize"));
			}
		}

		if (foption.foldmenu) {
			if (document.body.style.getPropertyValue("--tfgsFoldbuttonMenubarHeight") === "")
				document.body.style.setProperty("--tfgsFoldbuttonMenubarHeight", window.getComputedStyle(api.selele("gui_menu-bar-position_")).height);
		} else {
			if (document.body.style.getPropertyValue("--tfgsFoldbuttonMenubarHeight") !== "")
				document.body.style.removeProperty("--tfgsFoldbuttonMenubarHeight");
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
			cssname: "tfgsFoldbuttonMenubarFold",
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
			cssname: "tfgsFoldbuttonFullscreen",
			onadd: function(button) {
				if (document.fullscreenElement === null)
					document.body.requestFullscreen()
					.catch(api.onerror);
			},
			onremove: function(button) {
				if (document.fullscreenElement !== null)
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
			cssname: "tfgsFoldbuttonStagetargetFold"
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
			cssname: "tfgsFoldbuttonBlocktoolFold"
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
			cssname: "tfgsFoldbuttonSpriteinfoFold"
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
			cssname: "tfgsFoldbuttonStagebuttonFold"
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
			cssname: "tfgsFoldbuttonStageFold"
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
			onadd: function() {
				let l_a = api.selele("selector_list-area_1Xbj_");
				let l_s = api.selele("sprite-selector-item_is-selected_", l_a);
				l_a.scrollTo(0, l_s.parentElement.offsetTop - l_a.offsetHeight / 2 + l_s.parentElement.offsetHeight / 2)
			},
			onremove: function() {
				let l_a = api.selele("selector_list-area_1Xbj_");
				let l_s = api.selele("sprite-selector-item_is-selected_", l_a);
				l_a.scrollTo(0, l_s.parentElement.offsetTop - l_a.offsetHeight / 2 + l_s.parentElement.offsetHeight / 2)
			},
			targetcss: "selector_wrapper_",
			cssname: "tfgsFoldbuttonAssetpanelFold"
		});

		if (foption.autoscrollassetpanel) {
			let l_a = api.selele("selector_list-area_1Xbj_");
			if (l_a !== null) {
				if (getTabIndex() !== _oldTabIndex || getEditingId() !== _oldEditingId) {
					let l_s = api.selele("sprite-selector-item_is-selected_", l_a);
					l_a.scrollTo(0, l_s.parentElement.offsetTop - l_a.offsetHeight / 2 + l_s.parentElement.offsetHeight / 2)
					_oldTabIndex = getTabIndex();
					_oldEditingId = getEditingId();
				}
			}
		}

	} catch (e) {
		api.error(e);
	}
}

function getTabIndex() {
	return api.store().getState().scratchGui.editorTab.activeTabIndex;
}

function getEditingId() {
	return api.store().getState().scratchGui.targets.editingTarget;
}

tfgs.func.add({
	id: "foldbutton",
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
			name: "折叠积木盒",
			default: true
		},
		foldblocktoolauto: {
			type: "check",
			name: "点击类别时展开(五)",
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
			name: "展开素材列表",
			default: true
		},
		autoscrollassetpanel: {
			type: "check",
			name: "自动滚动到当前造型",
			default: true
		},
		expand100: {
			type: "check",
			name: "填满屏幕(可能开了反而出问题)",
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

		/* functions/resources.css */
		_tfgsAddCSS(`div.tfgsResourcesRenamable {
	border-bottom: 1px dotted hsla(225, 15%, 40%, 1);
	min-height: 1em;
}

[class*=sprite-selector-item_is-selected] div.tfgsResourcesRenamable {
	border-bottom: 1px dotted hsla(0, 100%, 100%, 1);
}

input.tfgsResourcesRename {
	border: 2px solid hsla(225, 15%, 40%, 1);
	width: 100%;
	height: 100%;
	background: inherit;
	color: inherit;
	box-sizing: border-box;
	text-align: inherit;
	margin: inherit;
	padding: inherit;
	font-family: inherit;
	font-size: inherit;
	line-height: inherit;
	outline: none;
}

[class*=sprite-selector-item_is-selected] input.tfgsResourcesRename {
	border: 2px solid hsla(0, 100%, 100%, 1);
}
`);

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

		/* functions/spritemenu.js */
		! function (){
let api, vm = null;

let extramenus = [];
let modimenus = [];
let modirenames = [];
let interval = -1;

let costume_sound = null;

let foption = {};

function childof(parent, test) {
	if (parent === null) return false;
	while (test !== parent && test !== null) {
		test = test.parentElement;
	}
	return test === parent;
}

function createmenu(parent, name, onclick) {
	let menu = tfgs.element.create("div",
		api.selcss("react-contextmenu-item") + " " +
		api.selcss("context-menu_menu-item_")
	);
	menu.innerText = name;
	menu.onclick = function(e) {
		parent.style.opacity = 0;
		parent.style.pointerEvents = "none";

		onclick(e);

		e.preventDefault();
		e.stopPropagation();
		e.cancelBubble = true;
		return false;
	};
	menu.onmousedown = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
		return false;
	};
	parent.appendChild(menu);
	return menu;
}

function automodify() {
	// 设定自动重复
	if (interval === -1) {
		interval = setInterval(automodify, 500);
	}
	if (vm === null)
		vm = api.vm();
	// 上面那个vm如果获取不到就会出错，导致下面的内容不会继续。
	// vm获取要在自动重复后面否则会导致自动重复无效，这样出错后不会重试
	costume_sound = api.selele("selector_list-area_");
	let allmenu = api.selall("sprite-selector-item_sprite-selector-item_");
	for (let i = 0; i < extramenus.length; i++) {
		if (!childof(document.body, extramenus[i])) {
			extramenus[i].remove();
			extramenus.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < modimenus.length; i++) {
		if (!childof(document.body, modimenus[i])) {
			modimenus.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < modirenames.length; i++) {
		if (!childof(document.body, modirenames[i])) {
			modirenames.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < allmenu.length; i++) {
		let parent = api.selele("react-contextmenu", allmenu[i]);
		if (parent === null) {
			api.warn("no menu found");
			api.warn(allmenu[i]);
			continue;
		}
		if (!modimenus.includes(parent)) {
			if (foption.rename) {
				extramenus.push(createmenu(parent, "重命名", function() {
					let index = childof(costume_sound, parent) ? 2 : 1;
					setTimeout(function() {
						parent.parentElement.children[index].children[0].click()
					}, 10);
				}));
			}
			/*
			extramenus.push(createmenu(parent, "排序...", function() {

			}));
			*/
			if (!api.RESPECTnodownload_DO_NOT_DELETE()) {
				if (childof(costume_sound, parent)) {
					if (foption.copymd5) {
						extramenus.push(createmenu(parent, "复制 md5ext", function() {
							let assets = api.currenttab() === 1 ? "costumes" : "sounds";
							let ob = parent.parentElement;
							let index = Number(ob.children[0].innerText) - 1;
							let asset = vm.runtime.getEditingTarget().sprite[assets][index];
							api.copy(asset.assetId + "." + asset.dataFormat);
						}));
					}
				} else {
					if (foption.download) {
						extramenus.push(createmenu(parent, "导出全部素材", function() {
							let list = vm.runtime.targets;
							let sprite = null;
							let ob = parent.parentElement;
							let name = ob.children[1].children[0].innerText;
							list.forEach(v => {
								if (v.isOriginal && v.sprite.name === name) {
									sprite = v.sprite;
								}
							});
							if (sprite === null) {
								api.error(`Sprite \`${val}' not found.`);
							} else {
								try {
									// windows保留文件名
									let reservedfilename = [
										"con", "prn", "aux", "nul",
										"com1", "com2", "com3", "com4",
										"com5", "com6", "com7", "com8",
										"com9", "lpt1", "lpt2", "lpt3",
										"lpt4", "lpt5", "lpt6", "lpt7",
										"lpt8", "lpt9"
									];
									let filelist = [];
									let filecomment = "";
									sprite.costumes.forEach((v, i) => {
										let comment = "造型 " + (i + 1) + "\n" +
											"角色: " + sprite.name + "\n" +
											"造型: " + v.name + "\n" +
											"md5ext: " + v.assetId + "." + v.asset.dataFormat;
										let vname;
										switch (foption.downloadname) {
											case "1":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												break;
											case "1a":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												vname += " " + v.name;
												break;
											case "a":
												vname = v.name;
												break;
										}
										filelist.push({
											folder: "costumes/",
											name: vname,
											ext: "." + v.asset.dataFormat,
											data: v.asset.data
										});
										filecomment += comment + "\n\n";
									});
									sprite.sounds.forEach((v, i) => {
										let comment = "声音 " + (i + 1) + "\n" +
											"角色: " + sprite.name + "\n" +
											"声音: " + v.name + "\n" +
											"md5ext: " + v.assetId + "." + v.asset.dataFormat;
										let vname;
										switch (foption.downloadname) {
											case "1":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												break;
											case "1a":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												vname += " " + v.name;
												break;
											case "a":
												vname = v.name;
												break;
										}
										filelist.push({
											folder: "sounds/",
											name: vname,
											ext: "." + v.asset.dataFormat,
											data: v.asset.data
										});
										filecomment += comment + "\n\n";
									});
									let zip = tfgs.storezip.create();
									zip.begin();
									let usedfile = [];
									filelist.forEach(v => {
										let folder = v.folder;
										// 文件名避免出现这些字符
										// 因为没法把中文转成gbk所以只能屏蔽
										let origname;
										switch (foption.downloadesc) {
											case "no":
												origname = v.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"\u00ff-\uffff]", "g"), "");
												break;
											case "_":
												origname = v.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"\u00ff-\uffff]", "g"), "_");
												break;
										}
										let name = origname;
										let ext = v.ext;
										let test = (folder + name + ext).toLowerCase();
										if (reservedfilename.includes(name) ||
											usedfile.includes(test)) {
											// 如果文件名被占用，就在后面加上(数字)
											for (let i = 1; i < 10000; i++) {
												name = origname + "(" + i + ")";
												test = (folder + name + "." + ext).toLowerCase();
												if (!(reservedfilename.includes(name) ||
														usedfile.includes(test))) {
													break;
												}
											}
										}
										usedfile.push(test);
										zip.addfile(folder + name + ext, v.data, v.comment);
									});
									zip.addfile("filelist.txt", filecomment);
									let file = zip.end(filecomment);
									let fr = new FileReader();
									fr.onload = function() {
										let a = tfgs.element.create('a');
										let name = sprite.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"]", "g"), "_");
										a.download = name + ".zip";
										a.href = fr.result;
										a.click();
									}
									file = new Uint8Array(file);
									fr.readAsDataURL(new Blob([file], {
										type: "application/zip"
									}));
								} catch (e) {
									api.onerror(e);
								}
							}
						}));
					}
				}
			}
		}
		modimenus.push(parent);
	}
	api.selall("sprite-selector-item_sprite-selector-item_").forEach(ob => {
		if (!modirenames.includes(ob)) {
			modirenames.push(ob);
			let th;
			if (childof(costume_sound, ob)) {
				th = ob.children[2].children[0];
			} else {
				th = ob.children[1].children[0];
			}
			console.log(th);
			if (foption.rename) {
				th.classList.add("tfgsResourcesRenamable");
				th.addEventListener("click", handleRenameInput);
			}
		}
	});
}

function handleRenameInput(e) {
	let th = this;
	let ob = th.parentElement.parentElement;
	let val = th.innerText;
	let input = tfgs.element.create("input", "tfgsResourcesRename");
	th.innerHTML = "";
	th.appendChild(input);
	input.value = val;
	input.onblur = function() {
		if (childof(costume_sound, ob)) {
			let renameFunc = api.currenttab() === 1 ? "renameCostume" : "renameSound";
			let index = Number(ob.children[0].innerText) - 1;
			if (input.value !== val)
				vm[renameFunc](index, input.value);
			th.innerText = val;
		} else {
			let list = vm.runtime.targets;
			let index = null;
			list.forEach(v => {
				if (v.isOriginal && v.sprite.name === val) {
					index = v.id;
				}
			});
			if (index === null) {
				api.error(`Sprite \`${val}' not found.`);
			} else {
				api.log(index);
				if (input.value !== val)
					vm.renameSprite(index, input.value);
				th.innerText = val;
			}
		}
	}
	input.ontouchstart = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.onkeydown = function(e) {
		if (e.code === 13) {
			input.blur();
			e.preventDefault();
		}
	}
	input.onmousedown = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.onclick = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.oncontextmenu = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.focus();

	e.preventDefault();
	e.stopPropagation();
	e.cancelBubble = true;
	return false;
}

function nomodify() {
	if (interval !== -1) {
		clearInterval(interval);
		interval = -1;
	}
	while (extramenus.length !== 0) {
		extramenus[0].remove();
		extramenus.splice(0, 1);
	}
	modimenus = [];
	while (modirenames.length !== 0) {
		let ob = modirenames.splice(0, 1)[0];
		let th = ob.children[2].children[0];
		th.classList.remove("tfgsResourcesRenamable");
		th.removeEventListener("click", handleRenameInput);
	}
}

tfgs.func.add({
	id: "spritemenu",
	name: "角色与素材右键菜单",
	info: "重命名、复制md5、导出所有造型和声音",
	option: {
		rename: {
			type: "check",
			name: "点击/右键重命名",
			default: true
		},
		download: {
			type: "check",
			name: "下载全部素材",
			default: true
		},
		downloadname: {
			type: "menu",
			name: "素材命名方式",
			menu: ["数字", "名字", "数字+名字"],
			value: ["1", "a", "1a"],
			default: "1a"
		},
		downloadnum: {
			type: "check",
			name: "数字前补0",
			default: true
		},
		downloadesc: {
			type: "menu",
			name: "特殊字符与中文处理(由于编码原因中文乱码)",
			menu: ["删除", "替换为_"],
			value: ["no", "_"],
			default: "_"
		},
		copymd5: {
			type: "check",
			name: "复制素材md5",
			default: true
		}
	},
	onenable: function(_api) {
		api = _api;
		foption = api.getoption();
		automodify();
	},
	ondisable: function() {
		nomodify();
	},
	onoption: function() {
		foption = api.getoption();
		nomodify();
		automodify();
	}
});

		}();

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
	height: 10%;
	width: 10%;
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

		/* functions/lockrun.js */
		! function (){
let opening = -1;

let bl = null;
let ws = null;
let wsdiv = null;
let tb = null;
let tbdiv = null;

let _origFire = null;
let _origReadOnly = false;

let funcEnabled = false;
let foption = {};

// 追踪按键、鼠标状态
let traceShift = false;
let traceCtrl = false;
let traceAlt = false;
let traceMouseMode = "";
let traceMouseX = 0;
let traceMouseY = 0;
let traceTarget = document.body;
let traceId = "";

function setup() {
	try {
		if (_origFire === null) {
			bl = api.blockly();
			ws = api.workspace();
			wsdiv = ws.getCanvas().parentElement;
			tb = api.toolbox();
			tbdiv = tb.getCanvas().parentElement;
			_origFire = bl.Events.fire;
			bl.Events.fire = function(e) {
				try {
					if (funcEnabled && e.element === "click") {
						// 点击事件，记录点击的id
						traceId = e.blockId;
					}
					if (!funcEnabled || e.element !== "stackclick" || traceCtrl && foption.ctrlRun) {
						// 如果不需要拦截，就放行
						return _origFire.apply(this, arguments);
					} else if (foption.rightMenu) {
						// 启动右键菜单，触摸和鼠标点击不一样，如果在触摸使用了鼠标点击的模拟话复制积木时会卡死
						if (traceMouseMode === "touch") {
							let touchevent = {
								type: "touchstart",
								button: 2,
								changedTouches: [{
									identifier: -1, //关键是这个identifier属性，少了就会复制时卡死
									clientX: traceMouseX,
									clientY: traceMouseY,
									target: traceTarget
								}],
								clientX: traceMouseX,
								clientY: traceMouseY,
								preventDefault: function() {},
								stopPropagation: function() {},
								target: traceTarget
							};
							ws.getBlockById(traceId).showContextMenu_(touchevent);
						} else {
							let mouseevent = {
								type: "mousedown",
								button: 2,
								clientX: traceMouseX,
								clientY: traceMouseY,
								view: window,
								target: traceTarget //target要保留，会影响其它拓展的运行
							};
							ws.getBlockById(traceId).showContextMenu_(mouseevent);
						}
					}
				} catch (e) {
					api.onerror(e);
					return _origFire.apply(this, arguments);
				}
			};
		};
		funcEnabled = true;

		window.addEventListener("keydown", traceKey);
		window.addEventListener("keyup", traceKey);
		// 需要直接在wsdiv上监听鼠标/触摸事件
		wsdiv.addEventListener("mousedown", traceMouse);
		wsdiv.addEventListener("touchstart", traceTouch);
		// 积木盒这里因为奇怪原因必须用捕获
		tbdiv.addEventListener("mousedown", traceMouse, true);
		tbdiv.addEventListener("touchstart", traceTouch, true);
		window.addEventListener("blur", traceReset);

	} catch (e) {
		api.onerror(e);
		opening = setTimeout(setup, 500);
	}
}

function traceKey(e) {
	if (traceAlt !== e.altKey && foption.altMove) {
		if (e.altKey) {
			_origReadOnly = ws.options.readOnly;
			// 设置积木区为只读即可用鼠标拖动视角
			ws.options.readOnly = true;
		} else {
			ws.options.readOnly = _origReadOnly;
		}
	}
	traceShift = e.shiftKey;
	traceCtrl = e.ctrlKey;
	traceAlt = e.altKey;
}

function traceMouse(e) {
	traceMouseMode = "mouse";
	traceMouseX = e.clientX;
	traceMouseY = e.clientY;
	traceTarget = e.target;
}

function traceTouch(e) {
	traceMouseMode = "touch";
	if (e.touches.length !== 0) {
		traceMouseX = e.touches[0].clientX;
		traceMouseY = e.touches[0].clientY;
		traceTarget = e.target;
	}
}

function traceReset(e) {
	traceKey({
		altKey: false,
		ctrlKey: false,
		shiftKey: false
	});
	traceMouse({
		clientX: 0,
		clientY: 0,
		target: document.body
	});
}

tfgs.func.add({
	id: "lockrun",
	name: "禁止点击时运行积木",
	info: "点击积木时积木将不会运行",
	option: {
		rightMenu: {
			type: "check",
			name: "不仅不运行，还显示右键菜单",
			default: false
		},
		ctrlRun: {
			type: "check",
			name: "按住ctrl点击可以运行",
			default: true
		},
		altMove: {
			type: "check",
			name: "按住alt拖动视角(防止拖动视角时拖动积木)",
			default: true
		}
	},
	onenable: function(_api) {
		api = _api;
		foption = api.getoption();
		setup();
	},
	ondisable: function() {
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		funcEnabled = false;

		window.removeEventListener("keydown", traceKey);
		window.removeEventListener("keyup", traceKey);
		wsdiv.removeEventListener("mousedown", traceMouse);
		wsdiv.removeEventListener("touchstart", traceTouch);
		tbdiv.removeEventListener("mousedown", traceMouse, true);
		tbdiv.removeEventListener("touchstart", traceTouch, true);
		window.removeEventListener("blur", traceReset);

	},
	onoption: function() {
		foption = api.getoption();
	}
});

		}();

		/* (allinone.js) */
		tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
	} catch(e) {
		alert(e.message);
		console.error(e);
		throw e;
	}
}();
