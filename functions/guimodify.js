! function() {
	let api;
	let interval = -1;

	let pbutton = {};
	let foption = {};
	let _fullscreen = false;

	function selectClass(namebegin) {
		let csslist = selectElement(namebegin);
		if (csslist === null)
			return null;
		csslist = csslist.classList;
		for (let i in csslist)
			if (namebegin === csslist[i].slice(0, namebegin.length))
				return csslist[i];
		return null;
	};

	function selectElement(namebegin) {
		return document.querySelector(`[class^=${namebegin}],[class*= ${namebegin}]`);
	}

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
			if (pbutton[buttonid] === undefined) {
				let target = selectElement(targetcss /*"gui_menu-bar-position_"*/ );
				if (target === null) {
					api.warn(buttonid + ": target not found.");
					return;
				}
				let button = document.createElement("span");
				button.classList.add(selectClass("button_outlined-button_"));
				button.classList.add(selectClass("stage-header_stage-button_"));
				button.classList.add("tfgsGuimodifyButton");
				for (let i in styles)
					button.style[i] = styles[i];
				button.innerText = addinner;
				button.checked = false;
				button.addEventListener("click", function() {
					if (button.checked) {
						if (cssname !== undefined)
							document.body.classList.remove(cssname /*"tfgsGuimodifyMenubarFold"*/ );
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
			let sel = selectElement("sprite-selector_scroll-wrapper_");
			if (sel !== null)
				if (foption.foldspriteinfo ||
					foption.foldstagebutton ||
					foption.foldthestage)
					sel.style.position = "relative";
				else
					sel.style.position = "inherit";

			if (foption.expand100) {
				if (!document.body.classList.contains("tfgsGuimodifyExpand100")) {
					document.body.classList.add("tfgsGuimodifyExpand100");
					dispatchEvent(new Event("resize"));
				}
			} else {
				if (document.body.classList.contains("tfgsGuimodifyExpand100")) {
					document.body.classList.remove("tfgsGuimodifyExpand100");
					dispatchEvent(new Event("resize"));
				}
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
				cssname: "tfgsGuimodifyMenubarFold",
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
				cssname: "tfgsGuimodifyFullscreen",
				onadd: function(button) {
					document.body.requestFullscreen()
						.catch(api.onerror);
				},
				onremove: function(button) {
					document.exitFullscreen()
						.catch(api.onerror);
				}
			});

			function _fullscreenchange() {
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
				cssname: "tfgsGuimodifyStagetargetFold"
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
				cssname: "tfgsGuimodifySpriteinfoFold"
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
				cssname: "tfgsGuimodifyStagebuttonFold"
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
				cssname: "tfgsGuimodifyStageFold"
			});
		} catch (e) {
			api.error(e);
		}
	}

	tfgs.func.add({
		id: "guifold",
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
			expand100: {
				type: "check",
				name: "填满屏幕(实验)",
				default: true
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
