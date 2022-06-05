! function() {
	let api, win = null;
	let shift = false,
		control = false,
		alt = false;
	let mousex = 0,
		mousey = 0,
		moused = false,
		touchx = 0,
		touchy = 0,
		cursordiv = null;

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
		cursordiv = null;


		win = tfgs.window.create({
			title: "JoyStick",
			canClose: false,
			canMaximize: false
		});

		let wdiv = win.innerDiv;
		wdiv.innerHTML = `
<div class="tfgsJoystick">
	<div class="tfgsJoystickKeyBoard"></div>
	<div class="tfgsJoystickMouse"></div>
	<div class="tfgsJoystickGamepad"></div>
</div>`;

		wdiv.onmousedown = wdiv.ontouchstart = function(e) {
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

		let jKeyB = wdiv.children[0].children[0];
		let jMous = wdiv.children[0].children[1];
		let jJoys = wdiv.children[0].children[2];

		function switchto(x) {
			for (let i = 0; i < wdiv.children[0].children.length; i++) {
				let elem = wdiv.children[0].children[i];
				elem.style.display = x === i ? "flex" : "none";
			}
		}

		switchto(0);

		// 0: keyBoard

		// let char1 = "~1234567890-=⌫\n⇄QWERTYUIOP[]\\\n ASDFGHJKL';↵\n⇧ZXCVBNM,./ \n⌃⌥␣←↑↓→⌬".split('\n');
		// let char2 = "`!@#$%^&*()_+⌫\n⇄QWERTYUIOP{}|\n ASDFGHJKL\":↵\n⇧ZXCVBNM<>? \n⌃⌥␣←↑↓→⌬".split('\n');

		let char1 = "1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM↑↵\n⌬␣←↓→".split('\n');
		let char2 = "1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM↑↵\n⌬␣←↓→".split('\n');

		for (let i in char1) {
			let line1 = char1[i].split('');
			let line2 = char2[i].split('');
			line = tfgs.element.create("span");
			for (let j in line1) {
				let char1 = line1[j];
				let char2 = line2[j];
				let ccode, cname;
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
						ccode = char1.codePointAt(0);
						cname = null;
				}
				line.appendChild(createKey(char1, char2, ccode, cname));
			}
			jKeyB.appendChild(line);
		}

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
	<span class="tfgsJoystickMouseSwitch">⌨</span>
</span>`;

		jMous.children[0].onmousedown = jMous.children[0].ontouchstart = synctouch;
		jMous.children[0].onmousemove = jMous.children[0].ontouchmove = synctouch;
		jMous.children[0].onmouseup = jMous.children[0].ontouchend = synctouch;

		bindbutton(jMous.children[1].children[0], 0);
		bindbutton(jMous.children[1].children[1], 1);
		bindbutton(jMous.children[1].children[2], 2);
		bindwheel(jMous.children[1].children[3], -120);
		bindwheel(jMous.children[1].children[4], 120);

		jMous.children[1].children[5].onmousedown = jMous.children[1].children[5].ontouchstart = function(e) {
			this.style.background = "grey";
		};

		jMous.children[1].children[5].onmouseup = jMous.children[1].children[5].ontouchend = function(e) {
			this.style.background = "inherit";
			switchto(0);
		};

		function bindwheel(elem, delta) {
			let interval = -1;
			let step = function() {
				const event = new WheelEvent('wheel', {
					view: window,
					ctrlKey: control,
					altKey: alt,
					shiftKey: shift,
					clientX: mousex,
					clientY: mousey,
					deltaY: delta / 4,
					wheelDelta: -delta,
					bubbles: true,
					cancelable: true
				});
				(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
			};

			elem.onmousedown = elem.ontouchstart = function(e) {
				if (interval !== -1) {
					clearInterval(interval);
				}
				step();
				interval = setInterval(step, 50);
				this.style.background = "grey";
			};

			elem.onmouseup = elem.ontouchend = function(e) {
				if (interval !== -1) {
					clearInterval(interval);
				}
				this.style.background = "inherit";
			};
		}

		function bindbutton(elem, button) {
			elem.onmousedown = elem.ontouchstart = function(e) {
				const event = new MouseEvent('mousedown', {
					view: window,
					button: button,
					ctrlKey: control,
					altKey: alt,
					shiftKey: shift,
					clientX: mousex,
					clientY: mousey,
					bubbles: true,
					cancelable: true
				});
				this.style.background = "grey";
				(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
			};

			elem.onmouseup = elem.ontouchend = function(e) {
				const event = new MouseEvent('mouseup', {
					view: window,
					button: button,
					ctrlKey: control,
					altKey: alt,
					shiftKey: shift,
					clientX: mousex,
					clientY: mousey,
					bubbles: true,
					cancelable: true
				});
				this.style.background = "inherit";
				(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
			};
		}

		function synctouch(e) {
			let tlist = e.targetTouches;
			let touchnewx = 0,
				touchnewy = 0;
			for (let i = 0; i < tlist.length; i++) {
				touchnewx += tlist[i].clientX;
				touchnewy += tlist[i].clientY;
			}

			if (cursordiv === null) {
				cursordiv = tfgs.element.create("span", "tfgsJoystickCursor");
				document.body.appendChild(cursordiv);
				cursordiv.innerHTML = `<svg>
	<path d="
		M 0 0
		L 15 20
		L 10 21.67
		L 14 29.67
		L 9 31.33
		L 5 23.33
		L 0 25
		Z
	" stroke=black stroke-width=1 fill=white />
</svg>`;
			}

			cursordiv.style.left = mousex - 1 + "px";
			cursordiv.style.top = mousey - 1 + "px";

			if (e.type === "touchmove") {
				touchnewx /= tlist.length;
				touchnewy /= tlist.length;
				let deltax = touchnewx - touchx;
				let deltay = touchnewy - touchy;
				let k = 1 * Math.pow(Math.sqrt(deltax * deltax + deltay * deltay), 0.5);
				mousex += deltax * k;
				mousey += deltay * k;
				if (mousex < 0) mousex = 0;
				if (mousey < 0) mousey = 0;
				if (mousex > window.innerWidth - 1) mousex = window.innerWidth - 1;
				if (mousey > window.innerHeight - 1) mousey = window.innerHeight - 1;
				touchx = touchnewx;
				touchy = touchnewy;
				const event = new MouseEvent('mousemove', {
					view: window,
					ctrlKey: control,
					altKey: alt,
					shiftKey: shift,
					clientX: mousex,
					clientY: mousey,
					bubbles: true,
					cancelable: true
				});
				(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
			} else {
				if (tlist.length > 1) {
					if (!moused) {
						const event = new MouseEvent('mousedown', {
							view: window,
							ctrlKey: control,
							altKey: alt,
							shiftKey: shift,
							clientX: mousex,
							clientY: mousey,
							bubbles: true,
							cancelable: true
						});
						this.style.background = "grey";
						(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
					}
					moused = true;
				} else {
					if (moused) {
						const event = new MouseEvent('mouseup', {
							view: window,
							ctrlKey: control,
							altKey: alt,
							shiftKey: shift,
							clientX: mousex,
							clientY: mousey,
							bubbles: true,
							cancelable: true
						});
						this.style.background = "inherit";
						(document.elementFromPoint(mousex, mousey) || document.body).dispatchEvent(event);
					}
					moused = false;
				}
				if (tlist.length > 0) {
					touchx = touchnewx / tlist.length;
					touchy = touchnewy / tlist.length;
				}
			}
		}

		function createKey(key, key2, code, name) {
			let x = tfgs.element.create("span");
			let interval = -1;
			let timeout = -1;
			let step = function() {
				if (name === "Control") control = true;
				if (name === "Alt") alt = true;
				if (name === "Shift") shift = true;
				const event = new KeyboardEvent('keydown', {
					view: window,
					ctrlKey: control,
					altKey: alt,
					shiftKey: shift,
					key: name !== null ? name : shift ? key2 : key,
					code: code,
					keyCode: code,
					bubbles: true,
					cancelable: true
				});
				(document.activeElement || document.body).dispatchEvent(event);
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
				x.innerText = key + (key !== key2 ? " " + key2 : "");
			}
			x.onmousedown = x.ontouchstart = function(e) {
				if (name !== "tfgsSwitch") {
					if (interval !== -1) {
						clearInterval(interval);
					}
					if (timeout !== -1) {
						clearTimeout(timeout);
					}
					interval = -1;
					timeout = -1;
					step();
					timeout = setTimeout(function() {
						timeout = -1;
						step();
						interval = setInterval(step, 50);
					}, 600);
				}
				x.style.background = "grey";
			};
			x.onmouseup = x.ontouchend = function(e) {
				if (name !== "tfgsSwitch") {
					if (interval !== -1) {
						clearInterval(interval);
					}
					if (timeout !== -1) {
						clearTimeout(timeout);
					}
					interval = -1;
					timeout = -1;
					if (name === "Control") control = false;
					if (name === "Alt") alt = false;
					if (name === "Shift") shift = false;
					const event = new KeyboardEvent('keyup', {
						view: window,
						ctrlKey: control,
						altKey: alt,
						shiftKey: shift,
						key: name !== null ? name : shift ? key2 : key,
						code: code,
						keyCode: code,
						bubbles: true,
						cancelable: true
					});
					(document.activeElement || document.body).dispatchEvent(event);
				} else {
					switchto(1);
				}
				x.style.background = "inherit";
			};
			if (name === "Unidentified") x.style.flexGrow = 1.5;
			if (name === "Shift") x.style.flexGrow = 2;
			if (name === "Control") x.style.flexGrow = 2;
			if (name === "Enter") x.style.flexGrow = 1.5;
			if (name === " ") x.style.flexGrow = 4;
			return x;
		}
	}

	function closecontrol() {
		window.removeEventListener("keydown", monitorkey);
		window.removeEventListener("keyup", monitorkey);
		if (win !== null) {
			win.close();
		}
	}

	tfgs.func.add({
		id: "joystick",
		name: "虚拟摇杆",
		info: "显示自定义虚拟摇杆",
		default: false,
		options: {},
		onenable: function(_api) {
			api = _api;
			opencontrol();
			// add a button
		},
		ondisable: function() {
			closecontrol();
		},
		onoption: function() {}
	});
}();
