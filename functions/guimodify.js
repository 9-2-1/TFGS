! function() {
	let api;
	let loadfinish = false;
	let interval = -1;

	let classmask = {
		menubar: "gui_menu-bar-position_",
		stage: "stage-wrapper_stage-canvas-wrapper_",
		spriteinfo: "sprite-info_sprite-info_",
		watermark: "gui_watermark_",
		selector: "selector_wrapper_",
		selectorlist: "selector_list-area_",
		selectoritem: "sprite-selector-item_sprite-selector-item_",
		assetdetail: "asset-panel_detail-area_"
	};

	let pclass = {};
	let pelement = {};

	let buttonstatus = {};
	let foption = {};

	function getRulesList() {
		let sss = document.styleSheets;
		let list = [];
		for (let i in sss) {
			let rus = sss[i].cssRules;
			for (let j in rus) {
				var stx = rus[j].selectorText;
				if (!list.includes(stx))
					list.push(stx);
			}
		}
		return list;
	}

	function getClassList() {
		let rus = getRulesList();
		let list = [];
		for (let i in rus) {
			var rgx = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
			var ex;
			while (ex = rgx.exec(rus[i]), ex !== null)
				if (!list.includes(ex[1]))
					list.push(ex[1]);
		}
		return list.sort();
	}

	function selectClass(namebegin) {
		let csslist = getClassList();
		for (let i in csslist)
			if (namebegin === csslist[i].slice(0, namebegin.length))
				return csslist[i];
		return null;
	};

	function selectElement(namebegin) {
		return document.querySelector(`[class^=${namebegin}],[class*= ${namebegin}]`);
	}

	function createButton(element, offx, offy) {
		let button = document.createElement("span");
		button.classList.add(selectClass("button_outlined-button_"));
		button.classList.add(selectClass("stage-header_stage-button_"));
		button.classList.add("tfgsGuimodifyButton");
		button.style.left = offx;
		button.style.top = offy;
		element.appendChild(button);
		return button;
	}

	function updateStatus() {
		try {
			if (foption.foldmenu) {
				let menubar = selectElement(classmask.menubar);
				if (menubar !== null) {
					if (pelement.foldmenubutton === undefined) {
						menubar.classList.add("tfgsGuimodifyMenubar");
						let button = pelement.foldmenubutton = createButton(menubar, "0", "100%");
						buttonstatus.foldmenubutton = false;
						button.innerText = "△";
						button.addEventListener("click", function() {
							if (!buttonstatus.foldmenubutton) {
								menubar.classList.add("tfgsGuimodifyMenubarFold");
								button.innerText = "▽";
								buttonstatus.foldmenubutton = true;
							} else {
								menubar.classList.remove("tfgsGuimodifyMenubarFold");
								button.innerText = "△";
								buttonstatus.foldmenubutton = false;
							}
						});
						api.log("button is OK");
					}
				} else api.warn("menubar not found.")
			} else {
				let menubar = selectElement(classmask.menubar);
				if (menubar !== null) {
					if (pelement.foldmenubutton !== undefined) {
						api.log("remove");
						pelement.foldmenubutton.remove();
						delete pelement.foldmenubutton;
					}
					menubar.classList.remove("tfgsGuimodifyMenubar");
					menubar.classList.remove("tfgsGuimodifyMenubarFold");
				}
			}
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
				name: "折叠舞台按钮",
				default: true
			}
		},
		onenable: function(_api) {
			api = _api;
			foption = api.getoption();
			try {
				if (interval === -1)
					interval = setInterval(updateStatus, 200);
			} catch (e) {
				api.onerror(e);
			}
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
