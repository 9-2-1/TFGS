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
			setting_menu(tfgs.optioninfo);
		});
		setting.button = document.body.appendChild(button);
	}
	setting.button.style.display = "block";
}

/** ##
 * @param {Object} optioninfo - ##
 * @param {function} callback - callback() ## */
setting._menu = setting_menu;

function setting_menu(optioninfo) {
	try {
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

		let menus = setting.menu.childNodes;
		while (menus.length !== 0) menus[0].remove();

		for (let funcname in optioninfo) {
			let menuid = "-tfgs-setting-" + funcname;
			let funcinfo = optioninfo[funcname];

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
			enable.id = menuid;

			let label = element("label");
			label.innerText = funcinfo.name;
			label.setAttribute("for", menuid);

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
				switch (option.type) {

					case "text":
						tinput = element("input", null, "text");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);
						tinput.setAttribute("data-funcname", funcname);
						tinput.setAttribute("data-infoname", name);
						toption.appendChild(tlabel);
						toption.appendChild(tinput);
						break;

					case "check":
						tinput = element("input", null, "checkbox");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);
						tinput.setAttribute("data-funcname", funcname);
						tinput.setAttribute("data-infoname", name);
						toption.appendChild(tinput);
						toption.appendChild(tlabel);
						break;

					case "button":
						tinput = element("input", null, "button");
						matchInputLabel(tinput, tlabel, "-tfgs-setting-option-" + funcname + "-" + name);
						tinput.value = option.name;
						if ("onclick" in option)
							tinput.addEventListener("click", option.onclick);
						tlabel.innerText = "";
						toption.appendChild(tinput);
						toption.appendChild(tlabel);
						break;

					case "tips":
						toption.className = "-tfgs-setting-tips";
						toption.appendChild(tlabel);
						break;

					case "select":
						toption.appendChild(tlabel);
						for (let opid in option.options) {
							let selectinfo = option.options[opid];
							let tselect = element("span", "-tfgs-setting-option-select");

							let tsinput = element("input", null, "radio");
							tsinput.name = "-tfgs-setting-option-" + funcname + "-" + name;
							let tslabel = element("label");
							matchInputLabel(tsinput, tslabel, "-tfgs-setting-option-" + funcname + "-" + name + "-" + opid);
							tslabel.innerText = selectinfo.name;

							tsinput.setAttribute("data-funcname", funcname);
							tsinput.setAttribute("data-infoname", name);
							tsinput.setAttribute("data-value", selectinfo.value);

							if (tsinput !== null) {
								let classname = ["", "-tfgs-warning", "-tfgs-error"][Math.floor(Math.random() * 3)];
								if (classname !== "")
									tsinput.classList.add(classname);
							}

							tselect.appendChild(tsinput);
							tselect.appendChild(tslabel);
							addinfo(tselect, selectinfo.info);

							toption.appendChild(tselect);
						}
						break;

				}
				if (tinput !== null) {
					let classname = ["", "-tfgs-warning", "-tfgs-error"][Math.floor(Math.random() * 3)];
					if (classname !== "")
						tinput.classList.add(classname);
				}

				addinfo(toption, option.info);

				optiondiv.appendChild(toption);
			}

			let block = element("div", "-tfgs-setting-block");
			block.appendChild(title);
			block.appendChild(optiondiv);

			setting.menu.appendChild(block);
		}
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
