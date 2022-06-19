let opening = -1;

let bl = null;
let ws = null;
let wsdiv = null;
let tb = null;
let tbdiv = null;

let _origFire = null;
let _origReadOnly = false;

let funcEnabled = false;
let foption = {};

// 追踪按键、鼠标状态
let traceShift = false;
let traceCtrl = false;
let traceAlt = false;
let traceMouseMode = "";
let traceMouseX = 0;
let traceMouseY = 0;
let traceTarget = document.body;
let traceId = "";

function setup() {
	try {
		if (_origFire === null) {
			bl = api.blockly();
			ws = api.workspace();
			wsdiv = ws.getCanvas().parentElement;
			tb = api.toolbox();
			tbdiv = tb.getCanvas().parentElement;
			_origFire = bl.Events.fire;
			bl.Events.fire = function(e) {
				try {
					if (funcEnabled && e.element === "click") {
						// 点击事件，记录点击的id
						traceId = e.blockId;
					}
					if (!funcEnabled || e.element !== "stackclick" || traceCtrl && foption.ctrlRun) {
						// 如果不需要拦截，就放行
						return _origFire.apply(this, arguments);
					} else if (foption.rightMenu) {
						// 启动右键菜单，触摸和鼠标点击不一样，如果在触摸使用了鼠标点击的模拟话复制积木时会卡死
						if (traceMouseMode === "touch") {
							let touchevent = {
								type: "touchstart",
								button: 2,
								changedTouches: [{
									identifier: -1, //关键是这个identifier属性，少了就会复制时卡死
									clientX: traceMouseX,
									clientY: traceMouseY,
									target: traceTarget
								}],
								clientX: traceMouseX,
								clientY: traceMouseY,
								preventDefault: function() {},
								stopPropagation: function() {},
								target: traceTarget
							};
							ws.getBlockById(traceId).showContextMenu_(touchevent);
						} else {
							let mouseevent = {
								type: "mousedown",
								button: 2,
								clientX: traceMouseX,
								clientY: traceMouseY,
								view: window,
								target: traceTarget //target要保留，会影响其它拓展的运行
							};
							ws.getBlockById(traceId).showContextMenu_(mouseevent);
						}
					}
				} catch (e) {
					api.onerror(e);
					return _origFire.apply(this, arguments);
				}
			};
		};
		funcEnabled = true;

		window.addEventListener("keydown", traceKey);
		window.addEventListener("keyup", traceKey);
		// 需要直接在wsdiv上监听鼠标/触摸事件
		wsdiv.addEventListener("mousedown", traceMouse);
		wsdiv.addEventListener("touchstart", traceTouch);
		tbdiv.addEventListener("mousedown", traceMouse, true);
		tbdiv.addEventListener("touchstart", traceTouch, true);
		window.addEventListener("blur", traceReset);

	} catch (e) {
		api.onerror(e);
		opening = setTimeout(setup, 500);
	}
}

function traceKey(e) {
	if (traceAlt !== e.altKey && foption.altMove) {
		if (e.altKey) {
			_origReadOnly = ws.options.readOnly;
			// 设置积木区为只读即可用鼠标拖动视角
			ws.options.readOnly = true;
		} else {
			ws.options.readOnly = _origReadOnly;
		}
	}
	traceShift = e.shiftKey;
	traceCtrl = e.ctrlKey;
	traceAlt = e.altKey;
}

function traceMouse(e) {
	traceMouseMode = "mouse";
	traceMouseX = e.clientX;
	traceMouseY = e.clientY;
	traceTarget = e.target;
}

function traceTouch(e) {
	traceMouseMode = "touch";
	if (e.touches.length !== 0) {
		traceMouseX = e.touches[0].clientX;
		traceMouseY = e.touches[0].clientY;
		traceTarget = e.target;
	}
}

function traceReset(e) {
	traceKey({
		altKey: false,
		ctrlKey: false,
		shiftKey: false
	});
	traceMouse({
		clientX: 0,
		clientY: 0,
		target: document.body
	});
}

tfgs.func.add({
	id: "lockrun",
	name: "禁止点击时运行积木",
	info: "点击积木时积木将不会运行",
	option: {
		rightMenu: {
			type: "check",
			name: "不仅不运行，还显示右键菜单",
			default: false
		},
		ctrlRun: {
			type: "check",
			name: "按住ctrl点击可以运行",
			default: true
		},
		altMove: {
			type: "check",
			name: "按住alt拖动视角(防止拖动视角时拖动积木)",
			default: true
		}
	},
	onenable: function(_api) {
		api = _api;
		foption = api.getoption();
		setup();
	},
	ondisable: function() {
		if (opening !== -1) {
			clearTimeout(opening);
			opening = -1;
		}
		funcEnabled = false;

		window.removeEventListener("keydown", traceKey);
		window.removeEventListener("keyup", traceKey);
		wsdiv.removeEventListener("mousedown", traceMouse);
		wsdiv.removeEventListener("touchstart", traceTouch);
		tbdiv.removeEventListener("mousedown", traceMouse, true);
		tbdiv.removeEventListener("touchstart", traceTouch, true);
		window.removeEventListener("blur", traceReset);

	},
	onoption: function() {
		foption = api.getoption();
	}
});
