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
						cname = "Space";
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
				line.appendChild(crex(char1, char2, ccode, cname));
			}
			line.ontouchstart = function(e) {
				e.preventDefault();
			};
			jKeyB.appendChild(line);
		}
		jKeyB.ontouchstart = function(e) {
			e.preventDefault();
		};

		// 1: mouse

		jMous.innerHTML = `
<span class="tfgsJoystickMouseMove"></span>
<span>
	<span class="tfgsJoystickMouseClick">+</span>
	<span class="tfgsJoystickMouseSwitch">⌬</span>
</span>`;

		jMous.children[0].ontouchstart = synctouch;
		jMous.children[0].ontouchmove = synctouch;
		jMous.children[0].ontouchend = synctouch;

		jMous.children[1].children[0].ontouchstart = function() {
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
		};

		jMous.children[1].children[0].ontouchend = function() {
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
		};

		jMous.children[1].children[1].ontouchstart = function() {
			this.style.background = "grey";
		};

		jMous.children[1].children[1].ontouchend = function() {
			this.style.background = "inherit";
			switchto(0);
		};

		function synctouch(e) {
			e.preventDefault();
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
				cursordiv.innerText = "◤";
			}

			cursordiv.style.left = mousex - 1 + "px";
			cursordiv.style.top = mousey - 2 + "px";

			if (e.type === "touchmove") {
				touchnewx /= tlist.length;
				touchnewy /= tlist.length;
				mousex += touchnewx - touchx;
				mousey += touchnewy - touchy;
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

		function crex(key, key2, code, name) {
			let x = tfgs.element.create("span");
			x.innerText = key + (key !== key2 ? " " + key2 : "");
			x.ontouchstart = function(e) {
				e.preventDefault();
				if (name !== "tfgsSwitch") {
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
				}
				x.style.background = "grey";
			};
			x.ontouchmove = function(e) {
				e.preventDefault();
			};
			x.ontouchend = function(e) {
				e.preventDefault();
				if (name !== "tfgsSwitch") {
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
			if (name === "Space") x.style.flexGrow = 4;
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
