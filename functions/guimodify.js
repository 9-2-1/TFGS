! function() {
	let api;
	let loadfinish = false;
	let interval = -1;

	let pelement = {};
	let pbutton = {};
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
				/* ------ foldmenu:on ------ */
				if (pelement.menubar === undefined) {
					let menubar = selectElement("gui_menu-bar-position_");
					let bodywrap = selectElement("gui_body-wrapper_");
					if (menubar !== null && bodywrap !== null) {
						if (pelement.foldmenubutton === undefined) {
							let button = pelement.foldmenubutton = createButton(menubar, "0", "100%");
							pbutton.foldmenubutton = false;
							button.innerText = "≡";
							button.addEventListener("click", function() {
								if (!pbutton.foldmenubutton) {
									button.innerText = "≡";
									menubar.classList.add("tfgsGuimodifyMenubarFold");
									bodywrap.classList.add("tfgsGuimodifyMenubarBody");
								} else {
									button.innerText = "▲";
									menubar.classList.remove("tfgsGuimodifyMenubarFold");
									bodywrap.classList.remove("tfgsGuimodifyMenubarBody");
								}
								pbutton.foldmenubutton = !pbutton.foldmenubutton;
								dispatchEvent(new Event("resize"));
							});
							button.click();
							api.log("menubar is OK");
						}
						pelement.menubar = menubar;
						pelement.bodywrap = bodywrap;
					} else {
						api.warn("menubar not found.");
					}
				}
			} else {
				/* ------ foldmenu:off ------ */
				if (pelement.menubar !== undefined) {
					let menubar = pelement.menubar;
					let bodywrap = pelement.bodywrap;
					if (pelement.foldmenubutton !== undefined) {
						pelement.foldmenubutton.remove();
						delete pelement.foldmenubutton;
					}
					menubar.classList.remove("tfgsGuimodifyMenubarFold");
					bodywrap.classList.remove("tfgsGuimodifyMenubarBody");
					dispatchEvent(new Event("resize"));
					delete pelement.menubar;
					delete pelement.bodywrap;
					api.log("menubar removed");
				}
			}

			/* ----------------- */

			if (foption.foldstagetarget) {
				/* ------ foldstagetarget:on ------ */
				if (pelement.stagetarget === undefined) {
					let stagetarget = selectElement("gui_stage-and-target-wrapper_");
					let buttpos = selectElement("gui_editor-wrapper_");
					if (stagetarget !== null) {
						if (pelement.foldstagetargetbutton === undefined) {
							let button = pelement.foldstagetargetbutton = createButton(buttpos, "0", "0.3rem");
							pbutton.foldstagetargetbutton = false;
							button.style.left = "unset";
							button.style.right = "0";
							button.innerText = "≫";
							button.addEventListener("click", function() {
								if (!pbutton.foldstagetargetbutton) {
									button.innerText = "≪";
									stagetarget.classList.add("tfgsGuimodifyStagetargetHide");
								} else {
									button.innerText = "≫";
									stagetarget.classList.remove("tfgsGuimodifyStagetargetHide");
								}
								pbutton.foldstagetargetbutton = !pbutton.foldstagetargetbutton;
								dispatchEvent(new Event("resize"));
							});
							api.log("stagetarget is OK");
						}
						pelement.stagetarget = stagetarget;
					} else {
						api.warn("stagetarget not found.");
					}
				}
			} else {
				/* ------ foldstagetarget:off ------ */
				if (pelement.stagetarget !== undefined) {
					let stagetarget = pelement.stagetarget;
					if (pelement.foldstagetargetbutton !== undefined) {
						pelement.foldstagetargetbutton.remove();
						delete pelement.foldstagetargetbutton;
					}
					stagetarget.classList.remove("tfgsGuimodifyStagetargetHide");
					dispatchEvent(new Event("resize"));
					delete pelement.stagetarget;
					api.log("stagetarget removed");
				}
			}

			/* ----------------- */

			if (foption.foldspriteinfo) {
				/* ------ foldspriteinfo:on ------ */
				if (pelement.spriteinfo === undefined) {
					let spriteinfo = selectElement("sprite-info_sprite-info_");
					if (spriteinfo !== null) {
						if (pelement.foldspriteinfobutton === undefined) {
							let button = pelement.foldspriteinfobutton = createButton(spriteinfo.nextSibling, "0", "0");
							pbutton.foldspriteinfobutton = false;
							button.innerText = "△";
							button.addEventListener("click", function() {
								if (!pbutton.foldspriteinfobutton) {
									button.innerText = "▽";
									spriteinfo.classList.add("tfgsGuimodifySpriteinfoFold")
								} else {
									button.innerText = "△";
									spriteinfo.classList.remove("tfgsGuimodifySpriteinfoFold")
								}
								pbutton.foldspriteinfobutton = !pbutton.foldspriteinfobutton;
							});
							api.log("spriteinfo is OK");
						}
						pelement.spriteinfo = spriteinfo;
					} else {
						api.warn("spriteinfo not found.");
					}
				}
			} else {
				/* ------ foldspriteinfo:off ------ */
				if (pelement.spriteinfo !== undefined) {
					let spriteinfo = pelement.spriteinfo;
					if (pelement.foldspriteinfobutton !== undefined) {
						pelement.foldspriteinfobutton.remove();
						delete pelement.foldspriteinfobutton;
					}
					spriteinfo.classList.remove("tfgsGuimodifySpriteinfoFold")
					delete pelement.spriteinfo;
					api.log("spriteinfo removed");
				}
			}

			/* ----------------- */
			if (foption.foldstagebutton) {
				/* ------ foldstagebutton:on ------ */
				if (pelement.stagebutton === undefined) {
					let stagebutton = selectElement("target-pane_stage-selector-wrapper_");
					if (stagebutton !== null) {
						if (pelement.foldstagebuttonbutton === undefined) {
							let button = pelement.foldstagebuttonbutton = createButton(MARK1 = stagebutton.previousSibling, "0", "0");
							button.style.left = "unset";
							button.style.right = "0";
							pbutton.foldstagebuttonbutton = false;
							button.innerText = "▷";
							button.addEventListener("click", function() {
								if (!pbutton.foldstagebuttonbutton) {
									button.innerText = "◁";
									stagebutton.classList.add("tfgsGuimodifyStagebuttonFold")
								} else {
									button.innerText = "▷";
									stagebutton.classList.remove("tfgsGuimodifyStagebuttonFold")
								}
								pbutton.foldstagebuttonbutton = !pbutton.foldstagebuttonbutton;
							});
							api.log("stagebutton is OK");
						}
						pelement.stagebutton = stagebutton;
					} else {
						api.warn("stagebutton not found.");
					}
				}
			} else {
				/* ------ foldstagebutton:off ------ */
				if (pelement.stagebutton !== undefined) {
					let stagebutton = pelement.stagebutton;
					if (pelement.foldstagebuttonbutton !== undefined) {
						pelement.foldstagebuttonbutton.remove();
						delete pelement.foldstagebuttonbutton;
					}
					stagebutton.classList.remove("tfgsGuimodifyStagebuttonFold")
					delete pelement.stagebutton;
					api.log("stagebutton removed");
				}
			}

			/* ----------------- */
			if (foption.foldthestage) {
				/* ------ foldthestage:on ------ */
				if (pelement.thestage === undefined) {
					let thestage = selectElement("stage-wrapper_stage-canvas-wrapper_");
					if (thestage !== null) {
						if (pelement.foldthestagebutton === undefined) {
							let button = pelement.foldthestagebutton = createButton(MARK1, "0", "0");
							button.style.left = "unset";
							button.style.right = "calc(2.5rem + 2px)";
							pbutton.foldthestagebutton = false;
							button.innerText = "△";
							button.addEventListener("click", function() {
								if (!pbutton.foldthestagebutton) {
									button.innerText = "▽";
									thestage.classList.add("tfgsGuimodifyStageFold")
								} else {
									button.innerText = "△";
									thestage.classList.remove("tfgsGuimodifyStageFold")
								}
								pbutton.foldthestagebutton = !pbutton.foldthestagebutton;
							});
							api.log("thestage is OK");
						}
						pelement.thestage = thestage;
					} else {
						api.warn("thestage not found.");
					}
				}
			} else {
				/* ------ foldthestage:off ------ */
				if (pelement.thestage !== undefined) {
					let thestage = pelement.thestage;
					if (pelement.foldthestagebutton !== undefined) {
						pelement.foldthestagebutton.remove();
						delete pelement.foldthestagebutton;
					}
					thestage.classList.remove("tfgsGuimodifyStageFold")
					delete pelement.thestage;
					api.log("thestage removed");
				}
			}

			/* ----------------- */
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
				name: "折叠菜单按钮",
				default: true
			},
			foldstagetarget: {
				type: "check",
				name: "折叠舞台按钮",
				default: true
			},
			foldspriteinfo: {
				type: "check",
				name: "折叠sprite按钮",
				default: true
			},
			foldstagebutton: {
				type: "check",
				name: "折叠stage按钮",
				default: true
			},
			foldthestage: {
				type: "check",
				name: "折叠stage",
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
