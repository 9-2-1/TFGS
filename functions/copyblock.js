let api;
let api_enabled = false;
let workspace, blockly;
// 打开重试计时器
let opening = -1;

let _origcontextmenu1 = null;
let _origcontextmenu2 = null;

// 打开 tfgs
function setup(tryCount) {
	api_enabled = true;
	//部分社区的界面会加载，尝试多次
	try {
		blockly = api.blockly();
		workspace = api.workspace();
		// 积木区背景
		if (_origcontextmenu1 === null) {
			_origcontextmenu1 = workspace.showContextMenu_;
			workspace.showContextMenu_ = function(e) {
				let ret = _origcontextmenu1.apply(this, arguments);
				try {
					if (api_enabled) {
						on_blockMenu(e, null, workspace);
					}
				} catch (e) {
					api.onerror(e);
				}
				return ret;
			}
		}
		// 所有积木
		if (_origcontextmenu2 === null) {
			_origcontextmenu2 = blockly.BlockSvg.prototype.showContextMenu_;
			blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
				let ret = _origcontextmenu2.apply(this, arguments);
				try {
					if (api_enabled) {
						on_blockMenu(e, this, this.workspace);
					}
				} catch (e) {
					api.onerror(e);
				}
				return ret;
			}
		}
		api.log("打开");
	} catch (err) {
		api.onerror(err);
		api.log("启动失败次数: " + (tryCount + 1));
		opening = setTimeout(function() {
			setup(api, tryCount + 1);
		}, 500);
		return;
	}
}

function on_blockMenu(event) {
	let element = event.target;
	if (element === null) return;

	let clickSVG = getSVG(element);
	if (clickSVG === null) return;

	let menu = api.selele("blocklyContextMenu");
	if (menu === null) return;

	let blockId = block === null ? null : block.id;

	// 积木在积木区里（不在积木盒里）？
	if (blockspace === workspace &&
		!api.RESPECTnodownload_DO_NOT_DELETE()) {
		if (blockId !== null) {
			addToContextMenu("复制这个积木", function() {
				copyToXML(blockId, false, true);
				menu.remove();
			}, menu);
			/*addToContextMenu("复制以下积木", function() {
				copyToXML(blockId, false, false);
				menu.remove();
			}, menu);*/
			addToContextMenu("复制这组积木", function() {
				copyToXML(blockId, true, false);
				menu.remove();
			}, menu);
		} else {
			addToContextMenu("复制全部积木", function() {
				copyToXML(null, true, false);
				menu.remove();
			}, menu);
			addToContextMenu("粘贴积木文本", function() {
				pasteFromXML();
				menu.remove();
			}, menu);
		}
	}
}

function addToContextMenu(name, callback, element) {
	let menuItem = tfgs.element.create("div", "goog-menuitem");
	menuItem.setAttribute("role", "menuitem");
	menuItem.style.userSelect = "none";
	let menuText = tfgs.element.create("div", "goog-menuitem-content");
	menuText.innerText = name;
	menuItem.appendChild(menuText);
	menuItem.addEventListener("click", callback);
	element.parentElement.style.height = "100000px";
	element.appendChild(menuItem);
}

function pasteFromXML() {
	let loaddata = function(data) {
		let blockly = api.blockly();
		let blockXML = blockly.Xml.textToDom(data);
		let blockIds = blockly.Xml.domToWorkspace(blockXML, workspace);
		if (blockIds.length === 0) {
			throw new Error("粘贴失败");
		}
		let met = workspace.getMetrics();
		let posX = met.viewLeft + 15;
		let posY = met.viewTop + 15;
		for (let i = 0; i < blockIds.length; i++) {
			let bl = workspace.getBlockById(blockIds[i]);
			if (bl.getParent() === null) {
				let oldpos = bl.getRelativeToSurfaceXY();
				bl.moveBy(
					posX / workspace.scale - oldpos.x,
					posY / workspace.scale - oldpos.y
				);
				posY += (bl.getHeightWidth().height + 30) * workspace.scale;
			}
		}
	};
	api.paste().then(loaddata);
}

function copyToXML(blockId, loadPrev, deleNext) {
	try {
		let blockly = api.blockly();
		let blockXML = blockly.Xml.workspaceToDom(workspace);
		let blockThisXML;
		if (blockId === null) {
			blockThisXML = blockly.Xml.domToText(blockXML, workspace);
		} else {
			let blockThis = findBlock(blockXML, blockId);
			while (blockThis !== null &&
				blockThis.tagName.toLowerCase() !== "block"
			) {
				blockThis = blockThis.parentElement;
			}
			if (blockThis === null) {
				throw new Error('复制失败:找不到积木');
			}
			if (deleNext) {
				let bc = blockThis.children;
				for (let i = 0; i < bc.length; i++) {
					if (bc[i].tagName.toLowerCase() === "next") {
						bc[i].remove();
						i--;
					}
				}
			}
			if (loadPrev) {
				while (blockThis.parentElement !== null &&
					(blockThis.parentElement.tagName.toLowerCase() === 'block' ||
						blockThis.parentElement.tagName.toLowerCase() === 'next')
				) {
					blockThis = blockThis.parentElement;
				}
			}
			blockThisXML = "<xml>" + blockly.Xml.domToText(blockThis, workspace) + "</xml>";
		}
		api.copy(blockThisXML);
	} catch (e) {
		api.onerror(e);
	}
}

function findBlock(blockXML, blockId) {
	if (blockXML.getAttribute('id') === blockId) {
		return blockXML;
	} else {
		let bc = blockXML.children;
		for (let i = 0; i < bc.length; i++) {
			let find = findBlock(bc[i], blockId);
			if (find !== null) {
				return find;
			}
		}
		return null;
	}
}

tfgs.func.add({
	id: "copyblock",
	name: "复制积木为文字",
	info: "在右键菜单中添加“复制积木”“粘贴积木”选项，可以跨作品复制，或者粘贴到记事本(是xml格式)",
	default: false,
	option: {},
	onenable: function(_api) {
		api = _api;
		setup(1);
	},
	ondisable: function() {
		api_enabled = false;
		// 停止重试
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		api.log("关闭");
	},
	onoption: function() {}
});
