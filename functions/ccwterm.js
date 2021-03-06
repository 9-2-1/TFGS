let api, termwin = null,
	termdiv = null,
	lastvisi = "?",
	win = null,
	readyt = -1,
	lastmode = "?",
	vm;

function getready() {
	if (readyt === -1) {
		readyt = setInterval(getready, 1000);
		return;
	}
	if (win === null) {
		termwin = document.getElementById("gandi-terminal");
		if (termwin === null) return;
		termdiv = termwin.children[1];
		let tstyle = window.getComputedStyle(termdiv);
		let termspan = tfgs.element.create("span", "tfgsCCWtermSpan");
		let twidth = Number(tstyle.width.slice(0, -2)) + 20;
		let theight = Number(tstyle.height.slice(0, -2)) + 20;
		api.log(tstyle.width);
		api.log(tstyle.height);
		win = tfgs.window.create({
			title: "wterm",
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
	win.title = termwin.children[0].children[0].innerText;
	win._refresh();
	if (lastvisi !== termwin.style.visibility) {
		lastvisi = termwin.style.visibility;
		api.log(`visibility: ${lastvisi}`);
		if (termwin.style.visibility !== "visible") {
			// HIDE
			switch (api.getoption().mode) {
				case "respect":
					win.windowDiv.style.visibility = "hidden";
					break;
				case "minmax":
					win.minimize();
					break;
				case "minshow":
					win.minimize();
					break;
				case "ignore":
					break;
			}
		} else {
			// SHOW
			win.windowDiv.style.visibility = "visible";
			win.movetotop();
			switch (api.getoption().mode) {
				case "respect":
					break;
				case "minmax":
					win.restore();
					break;
				case "minshow":
					break;
				case "ignore":
					break;
			}
			win.flash(200, 3, true);
		}
	}
}

function closecontrol() {
	if (win !== null) {
		win.close();
		win = null;
	}
	if (termwin !== null) {
		termwin.style.display = "block";
		termwin.appendChild(termdiv);
	}
}

tfgs.func.add({
	id: "ccwterm",
	name: "???ccw???????????????tfgs??????",
	info: "???????????????????????????'Terminal'(??????)???????????????'Console'(?????????)?????????xterm?????????????????????ccw???",
	default: false,
	option: {
		mode: {
			type: "menu",
			name: "?????????????????????",
			menu: ["???????????????????????????", "?????????/?????????????????????/?????????", "???????????????,??????????????????", "??????????????????"],
			value: ["respect", "minmax", "minshow", "ignore"],
			default: "respect"
		}
	},
	onenable: function(_api) {
		api = _api;
		lastvisi = "?";
		lastmode = api.getoption().mode;
		getready();
	},
	ondisable: function() {
		if (readyt !== -1) {
			clearInterval(readyt);
			readyt = -1;
		}
		closecontrol();
	},
	onoption: function() {
		if (api.getoption().mode !== lastmode) {
			lastvisi = "?";
			lastmode = api.getoption().mode;
		}
	}
});
