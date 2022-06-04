! function() {
	let api, win = null;
	let shift = false,
		control = false,
		alt = false;

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
					default:
						ccode = char1.codePointAt(0);
						cname = null;
				}
				line.appendChild(crex(char1, char2, ccode, cname));
			}
			jKeyB.appendChild(line);
		}

		function crex(key, key2, code, name) {
			let x = tfgs.element.create("span");
			x.innerText = key + (key !== key2 ? " " + key2 : "");
			x.__key = key;
			x.__key2 = key2;
			x.ontouchstart = function(e) {
				if (name === "Control") control = true;
				if (name === "Alt") alt = true;
				if (name === "Shift") shift = true;
				e.preventDefault();
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
				x.style.background = "grey";
			};
			x.ontouchmove = function(e) {
				e.preventDefault();
			};
			x.ontouchend = function(e) {
				e.preventDefault();
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
