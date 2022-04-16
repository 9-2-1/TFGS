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

/** ## document.createElement
 * @param {string} tag - tagName */
function element(tag) {
	return document.createElement(tag);
}

/** @member {function} - 显示选项按钮
 * @function */
setting.showbutton = setting_show;

function setting_show() {
	if (setting.window === null) {

		// 菜单
		let menu = element("span");
		menu.classList.add("-tfgs-setting-menu");

		// 关闭按钮
		let okbutton = element("span");
		okbutton.classList.add("-tfgs-setting-okbutton");
		okbutton.innerText = "x";
		okbutton.addEventListener("click", function(event) {

			setting.button.style.display = "block";
			setting.window.style.display = "none";

		});

		// 选项窗口
		let win = element("span");
		win.classList.add("-tfgs-setting-window");
		win.appendChild(menu);
		win.appendChild(okbutton);

		// 背景
		let winbg = element("span");
		winbg.classList.add("-tfgs-setting-windowbg");
		winbg.appendChild(win);

		document.body.appendChild(winbg);

		setting.window = winbg;
		setting.menu = menu;
	}

	if (setting.button === null) {
		let button = element("span");
		button.classList.add("-tfgs-setting-button");
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

			let title = element("div");
			title.classList.add("-tfgs-setting-title");
			title.appendChild(enable);
			title.appendChild(label);

			function addinfo(target, info) {
				if(typeof info !== "string" || info === "")return;
				let infospan = element("span");
				infospan.classList.add("-tfgs-setting-info");
				infospan.innerText = info;

				let infobutton = element("span");
				infobutton.classList.add("-tfgs-setting-infobutton");
				infobutton.innerText = "i";
				infobutton.appendChild(infospan);

				target.appendChild(infobutton);
			}

				addinfo(title, info);

			let optiondiv = element("div");

			for (let name in funcinfo.options) {
				let option = funcinfo.options[name];

				let toption = element("span");
				toption.classList.add("-tfgs-setting-option");

				let tlabel = element("label");
				tlabel.innerText = option.name;

				addinfo(tlabel, option.info);

				let optioninput = null;
				switch (option.type) {
					case "text":
						optioninput = element("input");
						optioninput.type = "text";
						toption.appendChild(tlabel);
						toption.appendChild(optioninput);
						break;

				}
				optiondiv.appendChild(toption);
			}

			let block = element("div");
			block.classList.add("-tfgs-setting-block");
			block.appendChild(title);
			block.appendChild(optiondiv);

			setting.menu.appendChild(block);
		}
	} catch (e) {
		alert(e.message);
	}
}


/** @member {function} - 隐藏选项按钮
 * @function */
setting.hidebutton = setting_hide;

function setting_hide() {
	setting.button.style.display = "none";
}

tfgs.setting = setting;
