! function() {
	let api, termwin = null,
		termdiv = null,
		win = null,
		readyt = -1,
		vm;

	function getready() {
		termwin = document.getElementById("gandi-terminal");
		if (termwin === null) {
			readyt = setTimeout(getready, 100);
			return;
		}
		termdiv = termwin.children[1];
		let tstyle = window.getComputedStyle(termdiv);
		let termspan = tfgs.element.create("span", "tfgsCCWtermSpan");
		let twidth = Number(tstyle.width.slice(0, -2)) + 20;
		let theight = Number(tstyle.height.slice(0, -2)) + 20;
		api.log(tstyle.width);
		api.log(tstyle.height);
		win = tfgs.window.create({
			title: termwin.children[0].children[1].innerText,
			canClose: false,
			width: twidth + 6,
			height: theight + 26,
			onResize: function() {
				let istyle = window.getComputedStyle(this.innerDiv);
				let iw = Number(istyle.width.slice(0, -2));
				let ih = Number(istyle.height.slice(0, -2));

				termspan.style.setProperty("--scale", Math.min(iw / twidth, ih / theight));
			}
		});
		termspan.innerHTML = "<span></span>";
		termspan.children[0].appendChild(termdiv);
		termspan.style.setProperty("--termWidth", twidth + "px");
		termspan.style.setProperty("--termHeight", theight + "px");
		win.innerDiv.appendChild(termspan);
		termwin.style.display = "none";
	}

	function closecontrol() {
		if (win !== null) {
			win.close();
			win = null;
		}
	}

	tfgs.func.add({
		id: "ccwterm",
		name: "将ccw控制台放入tfgs窗口",
		info: "这个东西，我们叫它'Terminal'(终端)，微软叫它'Console'(控制台)，用着xterm又叫它控制台的ccw是",
		default: false,
		options: {},
		onenable: function(_api) {
			api = _api;
			getready();
		},
		ondisable: function() {
			if (readyt !== -1) {
				clearTimeout(readyt);
				readyt = -1;
			}
			closecontrol();
			if (termwin !== null) {
				termwin.style.display = "block";
				termwin.appendChild(termdiv);
			}
		},
		onoption: function() {}
	});
}();
