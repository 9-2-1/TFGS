if (!("tfgs" in this)) tfgs = {};

/** @class - 控制选项按钮，显示选项菜单
 * 注意: 这个object没有构造函数，请直接使用<code style="text-decoration:underline;">tfgs.setting</code>。 */
let setting = {};

/** @member {Element} - 选项按钮 */
setting.button = null;
/** @member {Element} - 选项画面(包括灰色背景) */
setting.window = null;
/** @member {Element} - 选项菜单，选项直接在这里添加 */
setting.menu = null;

/** id ##
 * @param {string} id - id
 * @return {Element} */
function fromid(id) {
	return document.getElementById(id);
}

/** ## createelement
 * @param {string} tag - tagName
 * @param {?string} className - className
 * @param {?string} type - type of input
 * @return {Element} */
function element(tag, className, type) {
	let ele = document.createElement(tag);
	if (className !== undefined && className !== null) ele.className = className;
	if (type !== undefined && type !== null) ele.type = type;
	return ele;
}

/** ##
 * @param {Element} input
 * @param {Element} label */
function matchInputLabel(input, label, id) {
	if (id === undefined) id = input.id;
	if (id === undefined || id === null) id = Math.random();
	input.id = id;
	label.setAttribute("for", id);
}

/** @member {function} - 显示选项按钮
 * @function */
setting.showbutton = setting_show;

function setting_show() {
	if (setting.window === null) {

		// 菜单
		let menu = element("span", "-tfgs-setting-menu");

		// 关闭按钮
		let okbutton = element("span", "-tfgs-setting-okbutton");
		okbutton.innerText = "x";
		okbutton.addEventListener("click", function(event) {

			setting.button.style.display = "block";
			setting.window.style.display = "none";

		});

		// 选项窗口
		let win = element("span", "-tfgs-setting-window");
		win.appendChild(menu);
		win.appendChild(okbutton);

		// 背景
		let winbg = element("span", "-tfgs-setting-windowbg");
		winbg.appendChild(win);

		document.body.appendChild(winbg);

		setting.window = winbg;
		setting.menu = menu;
	}

	if (setting.button === null) {
		let button = element("span", "-tfgs-setting-button");
		button.innerText = "选项";
		button.addEventListener("click", function(event) {
			setting.button.style.display = "none";
			setting.window.style.display = "block";
			setting_menu();
			setting_set();
		});
		setting.button = document.body.appendChild(button);
	}
	setting.button.style.display = "block";
}

/** ##
 * @param {Object} optioninfo - ##
 * @param {function} callback - callback() ## */
setting._menu = setting_menu;

function addtips(target, info) {
	if (typeof info !== "string" || info === "") return;
	let headspan = element("span");
	headspan.style.position = "relative";
	headspan.style.margin = "0px";
	headspan.style.padding = "0px";

	let infospan = element("span", "-tfgs-setting-wrong-tips");
	infospan.innerText = info;

	headspan.appendChild(infospan);
	if (target.nextSibling === null)
		target.parentElement.appendChild(headspan);
	else target.parentElement.insertBefore(headspan, target.nextSibling);
}

function deltips(target) {
	let maybe = target.nextSibling;
	if (maybe !== null)
		if (maybe.childNodes.length === 1)
			if (maybe.childNodes[0].className === "-tfgs-setting-wrong-tips")
				maybe.parentElement.removeChild(maybe);
}

function addinfo(target, info) {
	if (typeof info !== "string" || info === "") return;
	let infospan = element("span", "-tfgs-setting-info");
	infospan.innerText = info;

	let infobutton = element("span", "-tfgs-setting-infobutton");
	infobutton.innerText = "i";
	infobutton.appendChild(infospan);

	function showinfo() {
		infospan.style.display = "block";
	}

	function hideinfo() {
		infospan.style.display = "none";
	}
	infobutton.addEventListener("mouseover", showinfo);
	infobutton.addEventListener("mousedown", showinfo);
	infobutton.addEventListener("mouseleave", hideinfo);

	target.appendChild(infobutton);
}

function checkFunc(check, change, funcname) {
	return function(event) {
		try {
			checkInput(event.target, check);
			setting_get();
			change(tfgs.optionconf[funcname]);
		} catch (e) {
			alert(e.message);
		}
	}
}

function checkFuncW(check, change, funcname) {
	return function(event) {
		setTimeout(function() {
			checkFunc(check, change, funcname)(event)
		}, 0);
	}
}

function checkInput(tinput, check) {
	try {
		deltips(tinput);
		tinput.classList.remove("-tfgs-warning");
		tinput.classList.remove("-tfgs-error");
		let ch = null;
		if (typeof check === "function") {
			switch (tinput.type) {
				case "text":
					ch = check(tinput.value);
					break;
				case "radio":
					if (tinput.checked)
						ch = check(tinput.value);
					break;
				case "checkbox":
					ch = check(tinput.checked);
					break;
			}
		}
		if (ch !== null) {
			addtips(tinput, ch);
			tinput.classList.add("-tfgs-warning");
		}
		return true;
	} catch (e) {
		if (typeof e === "string") {
			addtips(tinput, e);
			tinput.classList.add("-tfgs-error");
			return false;
		} else {
			throw e;
		}
	}
}

function setting_menu() {
	try {
		let optioninfo = tfgs.optioninfo;
		let menus = setting.menu.childNodes;
		while (menus.length !== 0) setting.menu.removeChild(menus[0]);

		let optioninput = {};

		for (let funcname in optioninfo) {
			let funcinfo = optioninfo[funcname];
			let funcinput = {};

			let info = "";
			if ("author" in funcinfo) {
				info += "Author: " + funcinfo.author + "\n";
			}
			if ("version" in funcinfo) {
				info += "Version: " + funcinfo.version + "\n";
			}
			if ("info" in funcinfo) {
				info += "\n" + funcinfo.info;
			}

			let enable = element("input");
			enable.type = "checkbox";
			enable.addEventListener("change", function() {
				setTimeout(function() {
					setting_get();
					tfgs.functions.enablefunction(funcname, enable.checked);
				}, 0);
			});

			funcinput._enabled = enable;

			let label = element("label");
			label.innerText = funcinfo.name;

			matchInputLabel(enable, label, "-tfgs-setting-" + funcname);

			let title = element("div", "-tfgs-setting-title");
			title.appendChild(enable);
			title.appendChild(label);

			addinfo(title, info);

			let optiondiv = element("div");

			for (let name in funcinfo.options) {
				let option = funcinfo.options[name];

				let toption = element("span", "-tfgs-setting-option");

				let tlabel = element("label");
				tlabel.innerText = option.name;

				let tinput = null;
				let finput = null;
				switch (option.type) {

					case "text":
						tinput = element("input", null, "text");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);

						tinput.addEventListener("change", checkFunc(option.check, funcinfo.optionchange, funcname));
						tinput.addEventListener("keydown", checkFuncW(option.check, funcinfo.optionchange, funcname));
						tinput.addEventListener("input", checkFuncW(option.check, funcinfo.optionchange, funcname));
						tinput.addEventListener("paste", checkFuncW(option.check, funcinfo.optionchange, funcname));

						toption.appendChild(tlabel);
						toption.appendChild(tinput);
						finput = tinput;
						break;

					case "check":
						tinput = element("input", null, "checkbox");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);

						tinput.addEventListener("change", checkFunc(option.check, funcinfo.optionchange, funcname));

						toption.appendChild(tinput);
						toption.appendChild(tlabel);
						finput = tinput;
						break;

					case "button":
						tinput = element("input", null, "button");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);
						tinput.value = option.name;
						if ("onclick" in option)
							tinput.addEventListener("click", option.onclick);
						tlabel.innerText = "";
						toption.appendChild(tinput);
						// toption.appendChild(tlabel);
						break;

					case "tips":
						toption.className = "-tfgs-setting-tips";
						toption.appendChild(tlabel);
						break;

					case "select":
						toption.appendChild(tlabel);
						finput = {};
						for (let opid in option.options) {
							let selectinfo = option.options[opid];
							let tselect = element("span", "-tfgs-setting-option-select");

							let tsinput = element("input", null, "radio");
							tsinput.name = "-tfgs-setting-option-" + funcname + "-" + name;
							tsinput.value = selectinfo.value;

							finput[selectinfo.value] = tsinput;

							tsinput.addEventListener("change", checkFunc(option.check, funcinfo.optionchange, funcname));

							let tslabel = element("label");
							matchInputLabel(tsinput, tslabel, "-tfgs-setting-option-" + funcname + "-" + name + "-" + selectinfo.value);
							tslabel.innerText = selectinfo.name;

							tselect.appendChild(tsinput);
							tselect.appendChild(tslabel);
							addinfo(tselect, selectinfo.info);

							toption.appendChild(tselect);
						}
						break;

				}

				addinfo(toption, option.info);

				if (finput !== null)
					funcinput[name] = finput;
				optiondiv.appendChild(toption);
			}

			let block = element("div", "-tfgs-setting-block");
			block.appendChild(title);
			block.appendChild(optiondiv);

			setting.menu.appendChild(block);

			optioninput[funcname] = funcinput;
		}

		tfgs.optioninput = optioninput;
	} catch (e) {
		alert(e.message);
		console.log(e);
	}
}

setting.setoption = setting_set;

function setting_set() {
	try {
		let optioninfo = tfgs.optioninfo;
		let optionconf = tfgs.optionconf;
		for (let funcname in optioninfo) {
			let funcconf = funcname in optionconf ? optionconf[funcname] : {};
			let funcinfo = optioninfo[funcname].options;

			if (!("_enabled" in funcconf)) funcconf._enabled = optioninfo[funcname].enabledefault;
			tfgs.optioninput[funcname]._enabled.checked = funcconf._enabled;

			for (let name in funcinfo) {
				let value = name in funcconf ? funcconf[name] : funcinfo[name].default;
				let check = funcinfo[name].check;

				switch (funcinfo[name].type) {

					case "text":
						tfgs.optioninput[funcname][name].value = value;
						checkInput(tfgs.optioninput[funcname][name], check);
						break;

					case "check":
						tfgs.optioninput[funcname][name].checked = value;
						checkInput(tfgs.optioninput[funcname][name], check);
						break;

					case "select":
						tfgs.optioninput[funcname][name][value].checked = true;
						checkInput(tfgs.optioninput[funcname][name][value], check);
						break;

				}
			}
		}
	} catch (e) {
		alert(e.message);
		console.log(e);
	}
}

setting.getoption = setting_get;

function setting_get() {
	try {
		let optioninfo = tfgs.optioninfo;
		if (!("optionconf" in tfgs)) tfgs.optionconf = {};
		let optionconf = tfgs.optionconf;
		for (let funcname in optioninfo) {
			if (!(funcname in optionconf)) optionconf[funcname] = {};
			let funcconf = optionconf[funcname];
			let funcinfo = optioninfo[funcname].options;

			funcconf._enabled = tfgs.optioninput[funcname]._enabled.checked;

			for (let name in funcinfo) {
				let check = funcinfo[name].check;

				switch (funcinfo[name].type) {

					case "text":
						if (checkInput(tfgs.optioninput[funcname][name], check)) {
							funcconf[name] = tfgs.optioninput[funcname][name].value;
						}
						break;

					case "check":
						funcconf[name] = tfgs.optioninput[funcname][name].checked;
						break;

					case "select":
						for (let value in tfgs.optioninput[funcname][name]) {
							if (tfgs.optioninput[funcname][name][value].checked) {
								funcconf[name] = value;
							}
						}
						break;

				}
			}
		}
		return tfgs.optionconf;

	} catch (e) {
		alert(e.message);
		console.log(e);
	}
}

/** @member {function} - 隐藏选项按钮
 * @function */
setting.hidebutton = setting_hide;

function setting_hide() {
	setting.button.style.display = "none";
}

tfgs.setting = setting;
