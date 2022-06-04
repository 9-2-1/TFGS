! function() {
	let api, win = null,
		vm;

	function opencontrol() {
		win = tfgs.window.create({
			title: "JoyStick",
			canClose: false,
			canMaximize: false
		});

		crex(" ",32);
		crex("←",37);
		crex("↑",38);
		crex("↓",39);
		crex("→",40);
		crex("A",65);
		crex("B",66);
		crex("C",67);
		crex("D",68);
		crex("E",69);
		crex("F",70);
		crex("G",71);
		crex("H",72);
		crex("I",73);
		crex("J",74);
		crex("K",75);
		crex("L",76);
		crex("M",77);
		crex("N",78);
		crex("O",79);
		crex("P",80);
		crex("Q",81);
		crex("R",82);
		crex("S",83);
		crex("T",84);
		crex("U",85);
		crex("V",86);
		crex("W",87);
		crex("X",88);
		crex("Y",89);
		crex("Z",90);
		crex("0",96);
		crex("1",97);
		crex("2",98);
		crex("3",99);
		crex("4",100);
		crex("5",101);
		crex("6",102);
		crex("7",103);
		crex("8",104);
		crex("9",105);

		function crex(key,code){
			let x=tfgs.element.create("span","tfgsJoystickButton");
			x.innerText=key;
			x.ontouchstart = function(e) {
				e.preventDefault();
				const event = new KeyboardEvent('keydown', {
					view: window,
					key: key,
					code:code,
					keyCode:code,
					bubbles: true,
					cancelable: true
				});
				(document.activeElement||document.body).dispatchEvent(event);
			};
			x.ontouchmove = function(e) {
				e.preventDefault();
			};
			x.ontouchend = function(e) {
				e.preventDefault();
				const event = new KeyboardEvent('keyup', {
					view: window,
					key: key,
					bubbles: true,
					cancelable: true
				});
				(document.activeElement||document.body).dispatchEvent(event);
			};
			win.innerDiv.appendChild(x);
		}
	}

	function closecontrol() {
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
