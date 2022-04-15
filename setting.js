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

/** @member {function} - 显示选项按钮
 * @function */
setting.showbutton = setting_show;

function setting_show() {
	function element(tag) {
		return document.createElement(tag);
	}
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
		});
		setting.button = document.body.appendChild(button);
	}
	setting.button.style.display = "block";
}

/** @member {function} - 隐藏选项按钮
 * @function */
setting.hidebutton = setting_hide;

function setting_hide() {
	setting.button.style.display = "none";
}

tfgs.setting = setting;
