if (!("tfgs" in this)) tfgs = {};

let setting = {};

setting.button = null;
setting.window = null;

setting.showbutton = setting_show;

function setting_show() {
	function element(tag) {
		return document.createElement(tag);
	}
	if (setting.button === null) {
		let button = element("span");
		button.classList.add("-tfgs-setting-button");
		setting.button = document.body.appendChild(button);
	}
	setting.button.style.display = "block";
}

setting.hidebutton = setting_hide;

function setting_hide() {
	setting.button.style.display = "none";
}

tfgs.setting = setting;
