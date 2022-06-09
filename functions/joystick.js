	let foption = {};
	let api, win = null;
	let shift = false,
		control = false,
		alt = false;
	let mousex = 0,
		mousey = 0,
		moused = false,
		touchx = 0,
		touchy = 0,
		toucht = 0,
		cursordiv = null;
	let globalKeyInterval = -1,
		globalKeyTimeout = -1;
	let realmousedown = false;
	let switchpage = -1;

	function monitorkey(event) {
		control = event.ctrlKey;
		alt = event.altKey;
		shift = event.shiftKey;
	}

	function opencontrol() {
		window.addEventListener("keydown", monitorkey);
		window.addEventListener("keyup", monitorkey);

		shift = false;
		control = false;
		alt = false;
		mousex = 0;
		mousey = 0;
		moused = false;
		touchx = 0;
		touchy = 0;
		toucht = 0;
		cursordiv = null;
		globalKeyInterval = -1;
		globalKeyTimeout = -1;

		win = tfgs.window.create({
			title: "JoyStick",
			canClose: false,
			canMaximize: false,
			onResize: function() {
				if (switchpage === 2) {
					let wchild = win.innerDiv.children[0].children;
					let parts = wchild[2].children;
					if (parts.length !== 0) {
						setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
						setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
					}
				}
			}
		});

		let wdiv = win.innerDiv;
		wdiv.innerHTML = `
<div class="tfgsJoystick">
	<div class="tfgsJoystickKeyBoard"></div>
	<div class="tfgsJoystickMouse"></div>
	<div class="tfgsJoystickGamepad"></div>
</div>`;

		wdiv.onmousedown = wdiv.ontouchstart = function(e) {
			win.movetotop();
			e.preventDefault();
			e.stopPropagation();
		};
		wdiv.onmousemove = wdiv.ontouchmove = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};
		wdiv.onmouseup = wdiv.ontouchend = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};

		switchto(foption.start);

		_refresh();
	}

	function switchto(x) {
		let wchild = win.innerDiv.children[0].children;
		for (let i = 0; i < wchild.length; i++) {
			let elem = wchild[i];
			elem.style.display = x === i ? "flex" : "none";
		}
		switchpage = x;
		if (x === 2) {
			let parts = wchild[2].children;
			if (parts.length !== 0) {
				setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
				setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
			}
		}
	}

	function _refresh() {
		let wchild = win.innerDiv.children[0].children;
		let jKeyb = wchild[0];
		let jMous = wchild[1];
		let jJoys = wchild[2];

		// 0: keyBoard

		let keybsets = [
			"`1234567890-=⌫\n⇄qwertyuiop[]\\\n asdfghjkl';↵\n⇧zxcvbnm,./ \n⌃⌥␣←↑↓→⌬",
			"1234567890\nqwertyuiop\nasdfghjkl\nzxcvbnm↑↵\n⌬␣←↓→"
		];

		let i = foption.fullkey ? 0 : 1;
		setKeyboard(jKeyb, keybsets[i], 1, true);

		// 1: mouse

		jMous.innerHTML = `
<span class="tfgsJoystickMouseMove"></span>
<span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 1 10
				A 9 9 0 0 1 10 1
				L 10 15
				L 1 15
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">
		<svg width=20 height=30>
			<path d="
				M 1 10
				A 9 9 0 0 1 19 10
				L 19 20
				A 9 9 0 0 1 1 20
				Z
				M 1 15
				L 19 15
				M 10 1
				L 10 5
				M 8 7
				A 2 2 0 0 1 12 7
				L 12 9
				A 2 2 0 0 1 8 9
				Z
				M 10 11
				L 10 15
			" stroke=black stroke-width=1 fill=none />
			<path d="
				M 10 1
				A 9 9 0 0 1 19 10
				L 19 15
				L 10 15
			" stroke=none fill=black />
		</svg>
	</span>
	<span class="tfgsJoystickMouseClick">▲</span>
	<span class="tfgsJoystickMouseClick">▼</span>
	<span class="tfgsJoystickMouseSwitch">◎∷</span>
</span>`;

		jMous.children[0].onmousedown = jMous.children[0].ontouchstart = synctouch;
		jMous.children[0].onmousemove = jMous.children[0].ontouchmove = synctouch;
		jMous.children[0].onmouseleave = jMous.children[0].onmouseup = jMous.children[0].ontouchend = synctouch;

		bindbutton(jMous.children[1].children[0], 0);
		if (foption.mousebuttons) {
			bindbutton(jMous.children[1].children[1], 1);
			bindbutton(jMous.children[1].children[2], 2);
		} else {
			jMous.children[1].children[1].style.display = "none";
			jMous.children[1].children[2].style.display = "none";
		}
		bindwheel(jMous.children[1].children[3], -120);
		bindwheel(jMous.children[1].children[4], 120);

		jMous.children[1].children[5].onmousedown = jMous.children[1].children[5].ontouchstart = function(e) {
			this.style.background = "grey";
		};

		jMous.children[1].children[5].onmouseup = jMous.children[1].children[5].ontouchend = function(e) {
			this.style.background = "inherit";
			switchto(2);
		};

		// 2: joystick

		jJoys.innerHTML = `<span></span><span></span><span class="tfgsJoystickSwitch">⌨</span>`;
		let parts = jJoys.children;

		parts[2].onmousedown = parts[2].ontouchstart = function() {
			this.style.background = "grey";
		};

		parts[2].onmouseup = parts[2].ontouchend = function() {
			this.style.background = "inherit";
			switchto(0);
		};

		setJoystick(parts[0], foption.joyleft, foption.joyleftcustom);
		setJoystick(parts[1], foption.joyright, foption.joyrightcustom);
	}

	function bindwheel(elem, delta) {
		let interval = -1;
		let step = function() {
			sendWheelEvent(mousex, mousey, "wheel", {
				deltaY: delta / 4,
				wheelDelta: -delta,
			});
		};

		elem.onmousedown = elem.ontouchstart = function(e) {
			if (interval !== -1) {
				clearInterval(interval);
			}
			step();
			interval = setInterval(step, 50);
			this.style.background = "grey";
		};

		elem.onmouseleave = elem.onmouseup = elem.ontouchend = function(e) {
			if (interval !== -1) {
				clearInterval(interval);
			}
			this.style.background = "inherit";
		};
	}

	function bindbutton(elem, button) {
		elem.onmousedown = elem.ontouchstart = function(e) {
			sendMouseEvent(mousex, mousey, "mousedown", {
				button: button
			});
			this.style.background = "grey";
		};

		elem.onmouseleave = elem.onmouseup = elem.ontouchend = function(e) {
			sendMouseEvent(mousex, mousey, "mouseup", {
				button: button
			});
			this.style.background = "inherit";
		};
	}

	function synctouch(e) {
		let tlist;
		switch (e.type) {
			case "mousedown":
				realmousedown = true;
				this.style.background = "grey";
				tlist = [{
					clientX: e.clientX,
					clientY: e.clientY
				}];
				break;
			case "mousemove":
				if (realmousedown) {
					tlist = [{
						clientX: e.clientX,
						clientY: e.clientY
					}]
				} else {
					tlist = [];
				}
				break;
			case "mouseup":
			case "mouseleave":
				realmousedown = false;
				this.style.background = "inherit";
				tlist = [];
				break;
			default:
				tlist = e.targetTouches;
		}
		let touchnewx = 0,
			touchnewy = 0,
			touchnewt = new Date().getTime();
		for (let i = 0; i < tlist.length; i++) {
			touchnewx += tlist[i].clientX;
			touchnewy += tlist[i].clientY;
		}

		if (cursordiv === null) {
			cursordiv = tfgs.element.create("span", "tfgsJoystickCursor");
			document.body.appendChild(cursordiv);
			cursordiv.innerHTML = `<svg>
	<defs>
		<filter id="fl" x="0" y="0" width="100" height="100">
			<feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
			<feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
			<feBlend in="SourceGraphic" in2="offsetBlur" mode="normal">
		</filter>
	</defs>
	<path d="
		M 0 0
		L 15 20
		L 10 21.67
		L 14 29.67
		L 9 31.33
		L 5 23.33
		L 0 25
		Z
	" stroke=black stroke-width=1 fill=white filter="url(#fl)" />
</svg>`;
		}

		if (e.type === "touchmove" || e.type === "mousemove" && realmousedown) {
			touchnewx /= tlist.length;
			touchnewy /= tlist.length;
			let deltax = touchnewx - touchx;
			let deltay = touchnewy - touchy;
			let deltat = touchnewt - toucht;
			let speed = Math.sqrt(deltax * deltax + deltay * deltay) / (deltat / 1000) //像素每秒
			let k = foption.mousespeed * (speed / (speed + foption.mouseaccer));
			mousex += deltax * k;
			mousey += deltay * k;
			if (mousex < 0) mousex = 0;
			if (mousey < 0) mousey = 0;
			if (mousex > window.innerWidth - 1) mousex = window.innerWidth - 1;
			if (mousey > window.innerHeight - 1) mousey = window.innerHeight - 1;
			touchx = touchnewx;
			touchy = touchnewy;
			toucht = touchnewt;
			sendMouseEvent(mousex, mousey, "mousemove", {});
		} else {
			if (foption.mouse2click && tlist.length > 1) {
				if (!moused) {
					sendMouseEvent(mousex, mousey, "mousedown", {});
					this.style.background = "grey";
				}
				moused = true;
			} else {
				if (moused) {
					sendMouseEvent(mousex, mousey, "mouseup", {});
					this.style.background = "inherit";
				}
				moused = false;
			}
			if (tlist.length > 0) {
				touchx = touchnewx / tlist.length;
				touchy = touchnewy / tlist.length;
				toucht = touchnewt;
			}
		}

		cursordiv.style.left = mousex - 1 + "px";
		cursordiv.style.top = mousey - 1 + "px";
	}

	function sendKey(type, char1) {
		let detail = getKeyDetail(char1, shift);
		sendKeyEvent(type, {
			key: detail.cname,
			code: detail.ccode,
			keyCode: detail.ccode
		});
	}

	function sendKeyEvent(type, data) {
		const event = new KeyboardEvent(type, Object.assign({
			view: window,
			ctrlKey: control,
			altKey: alt,
			shiftKey: shift,
			bubbles: true,
			cancelable: true
		}, data));
		let elem = document.activeElement;
		if (elem === null) elem = window;
		elem.dispatchEvent(event);
	}

	function sendMouseLikeEvent(btype, mousex, mousey, type, data) {
		const event = new btype(type, Object.assign({
			view: window,
			ctrlKey: control,
			altKey: alt,
			shiftKey: shift,
			clientX: mousex,
			clientY: mousey,
			bubbles: true,
			cancelable: true
		}, data));
		let elem = document.elementFromPoint(mousex, mousey);
		let eventx = event.clientX,
			eventy = event.clientY;
		if (elem !== null) {
			while (true) {
				let next = null;
				if (elem.tagName.toLowerCase() === "iframe") {
					let offs = elem.getBoundingClientRect();
					eventx -= offs.left;
					eventy -= offs.top;
					next = elem.contentWindow.document.elementFromPoint(eventx, eventy);
				} else if (type === "mousedown" && elem.shadowRoot !== null && elem.shadowRoot !== undefined) {
					next = elem.shadowRoot.elementFromPoint(eventx, eventy);
				}
				if (next === null) {
					break;
				} else {
					elem = next;
				}
			}
		}
		if (elem === null) elem = window;
		let pare = elem;
		while (pare !== null && pare !== win.windowDiv) {
			pare = pare.parentElement;
		}
		if (pare === null) {
			event.clientX = eventx;
			event.clientY = eventy;
			elem.dispatchEvent(event);
		}
	}

	function sendMouseEvent(mousex, mousey, type, data) {
		sendMouseLikeEvent(MouseEvent, mousex, mousey, type, data);
	}

	function sendWheelEvent(mousex, mousey, type, data) {
		sendMouseLikeEvent(WheelEvent, mousex, mousey, type, data);
	}

	function createKey(key, nextId, autoSize) {
		let x = tfgs.element.create("span");
		let detail = getKeyDetail(key, false);
		let shdetail = getKeyDetail(key, true);
		let name = detail.cname;
		let shname = shdetail.cname;
		let step = function() {
			if (name === "Control") control = true;
			if (name === "Alt") alt = true;
			if (name === "Shift") shift = true;
			sendKey("keydown", key);
		};
		if (name === "tfgsSwitch") {
			x.innerHTML = `<svg width=20 height=30>
	<path d="
		M 1 10
		A 9 9 0 0 1 19 10
		L 19 20
		A 9 9 0 0 1 1 20
		Z
		M 1 15
		L 19 15
		M 10 1
		L 10 5
		M 8 7
		A 2 2 0 0 1 12 7
		L 12 9
		A 2 2 0 0 1 8 9
		Z
		M 10 11
		L 10 15
	" stroke=black stroke-width=1 fill=none />
</svg>`;
		} else {
			x.innerText = key + (name.toLowerCase() !== shname.toLowerCase() && autoSize ? "\n" + shname : "");
		}
		x.onmousedown = x.ontouchstart = function(e) {
			if (name !== "tfgsSwitch") {
				if (globalKeyInterval !== -1) {
					clearInterval(globalKeyInterval);
				}
				if (globalKeyTimeout !== -1) {
					clearTimeout(globalKeyTimeout);
				}
				globalKeyInterval = -1;
				globalKeyTimeout = -1;
				step();
				if (
					name !== "Shift" &&
					name !== "Alt" &&
					name !== "Control"
				) {
					globalKeyTimeout = setTimeout(function() {
						globalKeyTimeout = -1;
						step();
						globalKeyInterval = setInterval(step, foption.keyInterval);
					}, foption.keyTimeout);
				}
			}
			x.style.background = "grey";
		};
		x.onmouseleave = x.onmouseup = x.ontouchend = function(e) {
			if (name !== "tfgsSwitch") {
				if (globalKeyInterval !== -1) {
					clearInterval(globalKeyInterval);
				}
				if (globalKeyTimeout !== -1) {
					clearTimeout(globalKeyTimeout);
				}
				globalKeyInterval = -1;
				globalKeyTimeout = -1;
				if (name === "Control") control = false;
				if (name === "Alt") alt = false;
				if (name === "Shift") shift = false;
				sendKey("keyup", key);
			} else {
				switchto(nextId);
			}
			x.style.background = "inherit";
		};
		if (autoSize) {
			if (name === "Unidentified") x.style.flexGrow = 1.5;
			if (name === "Shift") x.style.flexGrow = 2;
			if (name === "Control") x.style.flexGrow = 2;
			if (name === "Enter") x.style.flexGrow = 1.5;
			if (name === " ") x.style.flexGrow = 4;
		}
		if (name === "Unidentified") x.style.visibility = "hidden";
		return x;
	}

	function setKeyboard(elem, char1, nextId, autoSize) {
		elem.innerHTML = "";
		char1 = char1.split('\n');
		for (let i in char1) {
			let line1 = char1[i].split('');
			let line = tfgs.element.create("span");
			for (let j in line1) {
				let char1 = line1[j];
				line.appendChild(createKey(char1, nextId, autoSize));
			}
			elem.appendChild(line);
		}
	}

	function getKeyDetail(char1, isShift) {
		switch (char1) {
			case "⌫":
				ccode = 8;
				cname = "Backspace";
				break;
			case "⇄":
				ccode = 9;
				cname = "Tab";
				break;
			case "␣":
				ccode = 32;
				cname = " ";
				break;
			case "↵":
				ccode = 13;
				cname = "Enter";
				break;
			case "⇧":
				ccode = 0;
				cname = "Shift";
				break;
			case "⌥":
				ccode = 0;
				cname = "Alt";
				break;
			case "⌃":
				ccode = 0;
				cname = "Control";
				break;
			case "←":
				ccode = 37;
				cname = "ArrowLeft";
				break;
			case "↑":
				ccode = 38;
				cname = "ArrowUp";
				break;
			case "→":
				ccode = 39;
				cname = "ArrowRight";
				break;
			case "↓":
				ccode = 40;
				cname = "ArrowDown";
				break;
			case " ":
				ccode = 0;
				cname = "Unidentified";
				break;
			case "⌬":
				ccode = 0;
				cname = "tfgsSwitch";
				break;
			default:
				ccode = char1.toUpperCase().codePointAt(0);
				if (isShift) {
					let before = "`1234567890-=[]\\';.,/";
					let after_ = "~!@#$%^&*()_+{}|\":<>?";
					if (before.includes(char1)) {
						cname = after_[before.indexOf(char1)];
					} else {
						cname = char1.toUpperCase();
					}
				} else {
					cname = char1.toLowerCase();
				}
		}
		return {
			ccode: ccode,
			cname: cname
		};
	}

	function closecontrol() {
		window.removeEventListener("keydown", monitorkey);
		window.removeEventListener("keyup", monitorkey);
		if (win !== null) {
			win.close();
			win = null;
		}
		if (cursordiv !== null) {
			document.body.removeChild(cursordiv);
			cursordiv = null;
		}
	}

	function setJoystick(elem, mode, custom) {
		custom = custom.replace(/\|/g, "\n").replace(/\{[^}]+\}/g, function(str) {
			let repl = {
				"{space}": "␣",
				"{enter}": "↵",
				"{left}": "←",
				"{up}": "↑",
				"{down}": "↓",
				"{right}": "→",
				"{control}": "⌃",
				"{shift}": "⇧",
				"{alt}": "⌥",
				"{tab}": "⇄",
				"{backspace}": "⌫",
				"{bar}": "|",
				"{empty}": " ",
				"{leftcurly}": "{",
				"{rightcurly}": "}",
				"{switch}": "⌬"
			}
			if (str in repl) return repl[str];
			return " ";
		});

		switch (Math.floor(mode / 10)) {
			case 1: {
				let presets = [
					"↑↓←→",
					"WSAD",
					"IKJL",
					custom
				][mode % 10];
				elem.innerHTML = `<span class="tfgsJoystickJoystick"><span><span></span></span></span>`;

				let elemrect = elem.getBoundingClientRect();
				let r = Math.min(elemrect.right - elemrect.left, elemrect.bottom - elemrect.top) * 0.8;
				elem.children[0].style.setProperty("--size", r + "px");

				let circle = elem.children[0].children[0];
				let button = circle.children[0];
				let handleDrag = function(circle, event) {
					let rect = circle.getBoundingClientRect();
					let x0 = (rect.left + rect.right) / 2;
					let y0 = (rect.top + rect.bottom) / 2;
					if ("targetTouches" in event)
						event = event.targetTouches[0];
					let x = event.clientX - x0;
					let y = event.clientY - y0;
					let d = Math.sqrt(x * x + y * y);
					let dmax = (rect.right - rect.left) / 2 / 2;
					if (d > dmax) {
						x /= d;
						y /= d;
					} else {
						x /= dmax;
						y /= dmax;
					}
					// api.log(event.type+"|:"+d+","+dmax+","+x+","+y);
					if (y < -0.38) {
						sendKey("keydown", presets[0]);
					} else {
						sendKey("keyup", presets[0]);
					}
					if (y > 0.38) {
						sendKey("keydown", presets[1]);
					} else {
						sendKey("keyup", presets[1]);
					}
					if (x < -0.38) {
						sendKey("keydown", presets[2]);
					} else {
						sendKey("keyup", presets[2]);
					}
					if (x > 0.38) {
						sendKey("keydown", presets[3]);
					} else {
						sendKey("keyup", presets[3]);
					}
					button.style.left = x * dmax + "px";
					button.style.top = y * dmax + "px";
				};

				tfgs.drag.setdrag(circle, {
					onStart: function(event) {
						handleDrag(circle, event);
						return {
							x: 0,
							y: 0
						};
					},
					onMove: function(x, y, event) {
						handleDrag(circle, event);
					},
					onEnd: function(event) {
						for (let i = 0; i < 4; i++) {
							sendKey("keyup", presets[i]);
						}
						button.style.left = "0px";
						button.style.top = "0px";
					}
				});
				break;
			}
			case 2: {
				let presets = [
					"FC\nZX",
					"EQ\nR␣",
					"UIO\nJKL",
					"123\n456",
					"⌃⇧\n⌥␣",
					"↑↓{\n←→}\n| ",
					custom
				][mode % 10];
				elem.classList.add("tfgsJoystickJoystickKeyBoard");
				setKeyboard(elem, presets, 0, false);
				break;
			}
			case 3: {
				elem.innerHTML = `<span class="tfgsJoystickJoystickMouse"></span>`;
				elem = elem.children[0];
				elem.onmousedown = elem.ontouchstart = synctouch;
				elem.onmousemove = elem.ontouchmove = synctouch;
				elem.onmouseleave = elem.onmouseup = elem.ontouchend = synctouch;
				break;
			}
		}
	}

	tfgs.func.add({
		id: "joystick",
		name: "虚拟摇杆",
		info: "显示自定义虚拟摇杆",
		default: false,
		option: {
			start: {
				type: "menu",
				name: "默认模式",
				menu: ["键盘", "鼠标", "游戏手柄"],
				value: [0, 1, 2],
				default: 2
			},
			fullkey: {
				type: "check",
				name: "键盘显示更多按键",
				default: false
			},
			keyTimeout: {
				type: "number",
				name: "长按到自动连续按键的时间(毫秒)",
				min: 50,
				max: 5000,
				default: 600
			},
			keyInterval: {
				type: "number",
				name: "自动连续按键间隔(毫秒)",
				min: 5,
				max: 5000,
				default: 50
			},
			mousespeed: {
				type: "number",
				name: "鼠标指针速度",
				min: 0.05,
				max: 20,
				default: 1
			},
			mouseaccer: {
				type: "number",
				name: "鼠标指针减速",
				min: 0,
				max: 10000,
				default: 500
			},
			mouse2click: {
				type: "check",
				name: "放置两根手指模拟点击",
				default: true
			},
			mousebuttons: {
				type: "check",
				name: "鼠标显示中键和右键",
				default: false
			},
			joyleft: {
				type: "menu",
				name: "游戏手柄左侧布局",
				menu: [
					"摇杆(上下左右)",
					"摇杆(WSAD)",
					"摇杆(IKJL)",
					"摇杆(自定义)",
					"键盘(FC|ZX)",
					"键盘(EQ|R{space})",
					"键盘(UIO|JKL)",
					"键盘(123|456)",
					"键盘({ctrl}{shift}|{alt}{space})",
					"键盘({up}{down}{leftcurly}|{left}{right}{rightcurly})",
					"键盘(自定义)",
					"鼠标"
				],
				value: [10, 11, 12, 13, 20, 21, 22, 23, 24, 25, 26, 30],
				default: 10
			},
			joyright: {
				type: "menu",
				name: "游戏手柄右侧布局",
				menu: [
					"摇杆(上下左右)",
					"摇杆(WSAD)",
					"摇杆(IKJL)",
					"摇杆(自定义)",
					"键盘(FC|ZX)",
					"键盘(EQ|R{space})",
					"键盘(UIO|JKL)",
					"键盘(123|456)",
					"键盘({ctrl}{shift}|{alt}{space})",
					"键盘({up}{down}{leftcurly}|{left}{right}{rightcurly}|{bar}{empty})",
					"键盘(自定义)",
					"鼠标"
				],
				value: [10, 11, 12, 13, 20, 21, 22, 23, 24, 25, 26, 30],
				default: 20
			},
			joyleftcustom: {
				type: "text",
				name: "左侧自定义",
				default: "WSAD"
			},
			joyrightcustom: {
				type: "text",
				name: "右侧自定义",
				default: "IKJL"
			}
		},
		onenable: function(_api) {
			api = _api;
			foption = api.getoption();
			opencontrol();
		},
		ondisable: function() {
			closecontrol();
		},
		onoption: function() {
			let noption = api.getoption();
			if (
				noption.fullkey !== foption.fullkey ||
				noption.mouse2click !== foption.mouse2click ||
				noption.mousebuttons !== foption.mousebuttons ||
				noption.joyleft !== foption.joyleft ||
				noption.joyright !== foption.joyright ||
				noption.joyleftcustom !== foption.joyleftcustom ||
				noption.joyrightcustom !== foption.joyrightcustom
			) {
				foption = noption;
				_refresh();
			} else {
				foption = noption;
			}
		}
	});
