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
			try {
				// 获取Gui方法3
				let gui = tfgs.funcapi.reactInternal(name,
						tfgs.funcapi.selele(name, "stage-wrapper_")
					)
					.return.return.return.return
					.return.return.return.return
					.return.return
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
	if ("readOnly" in gui.props && gui.props.readOnly === true) return false;
	if ("canSaveToLocal" in gui.props && gui.props.canSaveToLocal === false) return false;
	return true;
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
