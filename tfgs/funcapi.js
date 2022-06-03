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
			return tfs.funcapi.selele(name, "gui_page-wrapper_").return.return.return.return.return.return.return.return.stateNode.props.vm;
		} catch (e) {
			errors.push(e);
			try {
				// 获取VM方法2
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
