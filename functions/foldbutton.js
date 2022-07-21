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
