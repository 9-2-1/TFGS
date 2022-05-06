! function() {
	let api;
	// 左边是积木区，右边是积木拖出区
	let workspace, flyoutWorkspace;
	let injectionDiv;
	// 打开重试计时器
	let opening = -1;
	// 积木菜单检测计时器 *
	let blockMenuTimer = -1;
	let blockMenuTime = 0;
	const blockMenuTimeout = 1200; // ms

	// 打开 tfgs
	function TFGSON(_api, tryCount) {
		api = _api;
		tryCount = tryCount === undefined ? 0 : tryCount;
		//部分社区的界面会加载，尝试多次
		try {
			workspace = Blockly.getMainWorkspace();
			flyoutWorkspace = workspace.getFlyout().getWorkspace();
			injectionDiv = document.getElementsByClassName("injectionDiv")[0];
			injectionDiv.addEventListener("touchstart", on_blockTouch, true);
			//injectionDiv.addEventListener("touchmove",on_blockTouch,true);
			//injectionDiv.addEventListener("touchstop",on_blockTouch,true);
			document.body.addEventListener("mousedown", on_blockMousedown, true);
			api.log("打开 TFGS");
			api.log(workspace, flyoutWorkspace);
		} catch (err) {
			api.onerror(err);
			api.log("TFGS 启动失败次数: ", tryCount + 1);
			opening = setTimeout(function() {
				TFGSON(api, tryCount + 1);
			}, 1000);
			return;
		}
	}

	function TFGSOFF() {
		// 停止重试
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		// 把事件响应函数卸掉就是关闭了
		if (injectionDiv) {
			injectionDiv.removeEventListener("touchstart", on_blockTouch, true);
		}
		//injectionDiv.removeEventListener("touchmove",on_blockTouch,true);
		//injectionDiv.removeEventListener("touchstop",on_blockTouch,true);
		document.body.removeEventListener("mousedown", on_blockMousedown, true);
		api.log("关闭 TFGS");
	}

	function on_blockMousedown(event) {
		if (event.button === 2) { // 右键
			on_blockMenuPossible(event.clientX, event.clientY);
		}
	}

	function on_blockTouch(event) {
		if (event.touches.length === 0) {
			return;
		}
		let touch = event.touches[0];
		on_blockMenuPossible(touch.clientX, touch.clientY);
	}

	function on_blockMenuPossible(x, y) {
		let element = document.elementFromPoint(x, y);
		let blockBox, blockId;
		if (element === null) {
			return;
		}
		//api.log(element);
		let clickSVG = getSVG(element);
		if (clickSVG === null) {
			return;
		}
		blockBox = clickSVG.classList.contains("blocklyFlyout");
		blockId = getBlockId(element);
		if (blockMenuTimer !== -1) {
			clearInterval(blockMenuTimer);
			blockMenuTimer = -1;
		}
		blockMenuTime = 0;
		blockMenuTimer = setInterval(function() {
			let menu = document.getElementsByClassName("blocklyContextMenu");
			if (menu.length !== 0) {
				clearInterval(blockMenuTimer);
				blockMenuTimer = -1;
				on_blockMenu(blockBox, blockId, menu[0]);
			} else {
				blockMenuTime += 10;
				if (blockMenuTime >= blockMenuTimeout) {
					clearInterval(blockMenuTimer);
					blockMenuTimer = -1;
				}
			}
		}, 10);
	}

	function on_blockMenu(blockBox, blockId, menu) {
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

	function getSVG(element) {
		while (element !== null && element.tagName.toLowerCase() !== "svg") {
			element = element.parentElement;
		}
		return element;
	}

	function getBlockId(element) {
		while (element !== null &&
			element.tagName.toLowerCase() !== "svg"
		) {
			if (element.tagName.toLowerCase() === "g") {
				let id = element.getAttribute("data-id");
				if (id !== null) {
					return id;
				}
			}
			element = element.parentElement;
		}
		return null;
	}

	function addToContextMenu(name, callback, element) {
		let menuItem = document.createElement("div");
		menuItem.classList.add("goog-menuitem");
		menuItem.setAttribute("role", "menuitem");
		menuItem.style.userSelect = "none";
		menuItem.innerText = name;
		menuItem.addEventListener("click", callback);
		element.parentElement.style.height = "4500px";
		element.appendChild(menuItem);
	}

	function pasteFromXML() {
		navigator.clipboard.readText().then(function(data) {
			let blockXML = Blockly.Xml.textToDom(data);
			let blockIds = Blockly.Xml.domToWorkspace(blockXML, workspace);
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
		}).catch(api.onerror);
	}

	function copyToXML(blockId, loadPrev, deleNext) {
		try {
			let blockXML = Blockly.Xml.workspaceToDom(workspace);
			let blockThisXML;
			if (blockId === null) {
				blockThisXML = Blockly.Xml.domToText(blockXML, workspace);
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
				blockThisXML = "<xml>" + Blockly.Xml.domToText(blockThis, workspace) + "</xml>";
			}
			navigator.clipboard.writeText(blockThisXML).then(function() {
				//alert('复制成功');
			}).catch(api.onerror);
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
		onenable: TFGSON,
		ondisable: TFGSOFF,
		onoption: function() {}
	});
}();
