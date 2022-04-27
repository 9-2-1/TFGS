/** @class - 控制选项按钮，显示选项菜单
 * 注意: 这个object没有构造函数，请直接使用<code style="text-decoration:underline;">tfgs.setting</code>。 */
tfgs.settings = {};

/** @member {Element} - 选项按钮 */
tfgs.settings.button = null;
/** @member {Element} - 选项画面(包括灰色背景) */
tfgs.settings.window = null;
/** @member {Element} - 选项菜单，选项直接在这里添加 */
tfgs.settings.menu = null;

function fromid(id) {
	return document.getElementById(id);
}

function element(tag, className, type) {
	let ele = document.createElement(tag);
	if (className !== undefined && className !== null) ele.className = className;
	if (type !== undefined && type !== null) ele.type = type;
	return ele;
}

function numpx(x) {
	return Number(x.slice(0, -2));
}

function matchInputLabel(input, label, id) {
	if (id === undefined) id = input.id;
	if (id === undefined || id === null) id = Math.random();
	input.id = id;
	label.setAttribute("for", id);
}

function create_settings_window() {
	// 菜单
	let menu = element("span", "-tfgs-settings-menu");

	// 关闭按钮
	let okbutton = element("span", "-tfgs-settings-okbutton");
	okbutton.innerText = "x";
	okbutton.addEventListener("click", function(event) {

		tfgs.settings.button.style.display = "block";
		tfgs.settings.window.style.display = "none";

	});

	// 选项窗口
	let win = element("span", "-tfgs-settings-window");
	win.appendChild(menu);
	win.appendChild(okbutton);

	// 背景
	let winbg = element("span", "-tfgs-settings-windowbg");
	winbg.appendChild(win);

	document.body.appendChild(winbg);

	tfgs.settings.window = winbg;
	tfgs.settings.menu = menu;
}

function keep_button_in_windows() {
	let button = tfgs.settings.button;
	let x1 = 10;
	let y1 = 10;
	let x2 = window.innerWidth - 10 - button.clientWidth;
	let y2 = window.innerHeight - 10 - button.clientHeight;
	if (numpx(button.style.left) < x1)
		button.style.left = x1 + "px";
	if (numpx(button.style.left) > x2)
		button.style.left = x2 + "px";
	if (numpx(button.style.top) < y1)
		button.style.top = y1 + "px";
	if (numpx(button.style.top) > y2)
		button.style.top = y2 + "px";
}

function changeFuncW(funcname, name) {
	return function(event) {
		setTimeout(function() {
			let value = event.target.value;
			let optn = tfgs.func.list[funcname].options[name].number;
			if (optn) value = Number(value);
			tfgs.settings._set(funcname, name, value);
		}, 0)
	};
};

function create_settings_button() {
	let button = element("span", "-tfgs-settings-button");

	button.style.left = "20px";
	button.style.top = "20px";
	button.addEventListener("mousedown", function(event) {
		let button = event.target;
		button.setAttribute("data-m", "yes");
		button.setAttribute("data-mc", "yes");
		button.setAttribute("data-mx", numpx(button.style.left) - event.clientX);
		button.setAttribute("data-my", numpx(button.style.top) - event.clientY);
		// event.preventDefault();
	});
	window.addEventListener("mousemove", function(event) {
		if (button.getAttribute("data-m") === "yes") {
			button.setAttribute("data-mc", "no");
			button.style.left = Number(button.getAttribute("data-mx")) + event.clientX + "px";
			button.style.top = Number(button.getAttribute("data-my")) + event.clientY + "px";
			keep_button_in_windows();
			event.preventDefault();
		}
	});
	document.body.addEventListener("mouseleave", function(event) {
		button.setAttribute("data-m", "no");
	});
	button.addEventListener("mouseup", function(event) {
		button.setAttribute("data-m", "no");
		if (button.getAttribute("data-mc") === "yes") {
			tfgs.settings.button.style.display = "none";
			tfgs.settings.window.style.display = "block";
			tfgs.settings.createmenu();
			tfgs.settings._get();
		}
	});

	button.addEventListener("touchstart", function(event) {
		let button = event.target;
		button.setAttribute("data-m", "yes");
		button.setAttribute("data-mx", numpx(button.style.left) - event.targetTouches[0].clientX);
		button.setAttribute("data-my", numpx(button.style.top) - event.targetTouches[0].clientY);
		// event.preventDefault();
	});
	button.addEventListener("touchmove", function(event) {
		let button = event.target;
		if (button.getAttribute("data-m") === "yes") {
			button.style.left = Number(button.getAttribute("data-mx")) + event.targetTouches[0].clientX + "px";
			button.style.top = Number(button.getAttribute("data-my")) + event.targetTouches[0].clientY + "px";
			keep_button_in_windows();
			event.preventDefault();
		}
	});
	button.addEventListener("touchend", function(event) {
		button.setAttribute("data-m", "no");
	});

	window.addEventListener("resize", function(event) {
		keep_button_in_windows();
	});
	tfgs.settings.button = document.body.appendChild(button);
}

tfgs.settings.showbutton = function() {
	if (tfgs.settings.window === null) {
		create_settings_window();
	}
	if (tfgs.settings.button === null) {
		create_settings_button();
	}
	tfgs.settings.button.style.display = "block";
}

tfgs.settings.hidebutton = function() {
	tfgs.settings.button.style.display = "none";
}

/** ## */

function addinfo(target, info) {
	if (typeof info !== "string" || info === "") return;
	let infospan = element("span", "-tfgs-settings-info");
	infospan.innerText = info;

	let infobutton = element("span", "-tfgs-settings-infobutton");
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

tfgs.settings.createmenu = function() {
	try {
		let funclist = tfgs.func.list;

		//clear menu
		let menus = tfgs.settings.menu.childNodes;
		while (menus.length !== 0) tfgs.settings.menu.removeChild(menus[0]);

		let oinputs = {};

		for (let funcname in funclist) {
			let funcinfo = funclist[funcname];
			let funcinput = {};

			let info = "";
			if ("author" in funcinfo) {
				info += "作者: " + funcinfo.author + "\n";
			}
			if ("version" in funcinfo) {
				info += "版本: " + funcinfo.version + "\n";
			}
			if ("info" in funcinfo) {
				info += "\n" + funcinfo.info;
			}

			// title
			let enable = element("input", "", "checkbox");
			enable.addEventListener("change", function() {
				setTimeout(function() {
					tfgs.settings._set(funcname, "_enable", enable.checked);
					tfgs.settings._enable(funcname, enable.checked);
				}, 0);
			});
			funcinput._enable = enable;
			let label = element("label");
			label.innerText = funcinfo.name;
			matchInputLabel(enable, label, "-tfgs-settings-" + funcname);
			let title = element("div", "-tfgs-settings-title");
			title.appendChild(enable);
			title.appendChild(label);
			addinfo(title, info);

			//options
			let optiondiv = element("div");

			for (let name in funcinfo.options) {
				let option = funcinfo.options[name];

				let toption = element("span", "-tfgs-settings-option");

				let tlabel = element("label");
				tlabel.innerText = option.name;

				let tinput = null;
				let finput = null;
				let changefunc = changeFuncW(funcname, name);
				switch (option.type) {
					case "text":
						if (option.number) {
							tinput = element("input", null, "number");
						} else {
							tinput = element("input", null, "text");
						}
						matchInputLabel(tinput, tlabel, "-tfgs-settings-option-" + funcname + "-" + name);

						tinput.addEventListener("change", changefunc);
						tinput.addEventListener("keydown", changefunc);
						tinput.addEventListener("input", changefunc);
						tinput.addEventListener("paste", changefunc);

						toption.appendChild(tlabel);
						toption.appendChild(tinput);
						finput = tinput;
						break;

					case "check":
						tinput = element("input", null, "checkbox");
						matchInputLabel(tinput, tlabel, "-tfgs-settings-option-" + funcname + "-" + name);

						tinput.addEventListener("change", changefunc);

						toption.appendChild(tinput);
						toption.appendChild(tlabel);
						finput = tinput;
						break;

					case "select":
						toption.appendChild(tlabel);
						finput = {};
						for (let opid in option.options) {
							let selectinfo = option.options[opid];
							let tselect = element("span", "-tfgs-settings-option-select");

							let tsinput = element("input", null, "radio");
							tsinput.name = "-tfgs-settings-option-" + funcname + "-" + name;
							tsinput.value = selectinfo.value;

							finput[selectinfo.value] = tsinput;

							tsinput.addEventListener("change", changefunc);

							let tslabel = element("label");
							matchInputLabel(tsinput, tslabel, "-tfgs-settings-option-" + funcname + "-" + name + "-" + selectinfo.value);
							tslabel.innerText = selectinfo.name;

							tselect.appendChild(tsinput);
							tselect.appendChild(tslabel);
							addinfo(tselect, selectinfo.info);

							toption.appendChild(tselect);
						}
						break;
					case "button":
						tinput = element("input", null, "button");
						matchInputLabel(tinput, tlabel, "-tfgs-settings-option-" + funcname + "-" + name);
						tinput.value = option.name;
						if ("onclick" in option)
							tinput.addEventListener("click", option.onclick);
						tlabel.innerText = "";
						toption.appendChild(tinput);
						// toption.appendChild(tlabel);
						break;

					case "tips":
						toption.className = "-tfgs-settings-tips";
						toption.appendChild(tlabel);
						break;

				}

				addinfo(toption, option.info);

				if (finput !== null)
					funcinput[name] = finput;
				optiondiv.appendChild(toption);
			}

			let block = element("div", "-tfgs-settings-block");
			block.appendChild(title);
			block.appendChild(optiondiv);

			tfgs.settings.menu.appendChild(block);

			oinputs[funcname] = funcinput;
		}

		tfgs.oinputs = oinputs;
	} catch (e) {
		tfgs.error(e);
	}
}

tfgs.settings._set = function(funcname, optnname, value) {
	try {
		let funclist = tfgs.func.list;
		let optninfo = funclist[funcname].options[optnname];
		if (optninfo.number) value = Number(value);
		let setoption = {};
		setoption[funcname] = {};
		setoption[funcname][optnname] = value;
		let status = tfgs.func.setoptions(setoption);
		if (status.type === "error") alert(status.message);
	} catch (e) {
		tfgs.error(e);
	}
}

tfgs.settings._get = function() {
	try {
		let funclist = tfgs.func.list;
		let funcoptns = tfgs.func.getoptions();
		for (let funcname in funclist) {
			let optninfo = funclist[funcname].options;
			let funcoptn = funcoptns[funcname];

			eleid("test").value = inspect(funcoptns);
			tfgs.oinputs[funcname]._enable.checked = funcoptn._enable;

			for (let optn in optninfo) {
				let optni = optninfo[optn];

				switch (optni.type) {
					case "text":
						tfgs.settings.oinputs[funcname][name].value = value;
						break;

					case "check":
						tfgs.settings.oinputs[funcname][name].checked = value;
						break;

					case "select":
						tfgs.settings.oinputs[funcname][name][value].checked = true;
						break;

				}
			}
		}
	} catch (e) {
		tfgs.error(e);
	}
}
