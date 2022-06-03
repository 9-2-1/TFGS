tfgs.window = {};

tfgs.window.zIndex = 1e6;

tfgs.window.create = function(options) {
	let windowobj = {
		/* elements */
		titleDiv: null,
		innerDiv: null,
		windowDiv: null,
		resizeDiv: null,

		/* position */
		x: NaN,
		y: NaN,
		width: 400,
		height: 300,
		minHeight: 0,
		minWidth: 100, // 正常模式最小宽度
		minimizeWidth: 100, // 最小化时的宽度

		/* settings */
		title: "",

		/* options */
		haveLogo: true,
		canMinimize: true,
		canMaximize: true,
		canClose: true,
		canResize: true,
		canMove: true,

		/* callback */
		onClose: function() {},
		onResize: function() {},
		onMove: function() {},

		/* status */
		isMinimize: false,
		isMaximize: false,
		posRestore: {},
		flashMode: false,
		flashTimer: -1,

		/* functions */
		_rememberPos: function() {
			if (!this.isMinimize && !this.isMaximize) {
				this.posRestore.x = this.x;
				this.posRestore.y = this.y;
				this.posRestore.width = this.width;
				this.posRestore.height = this.height;
			}
		},
		minimize: function() {
			this._rememberPos();
			this.isMinimize = true;
			this.isMaximize = false;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		maximize: function() {
			this._rememberPos();
			this.isMinimize = false;
			this.isMaximize = true;
			this._refresh();
			this.onResize();
			this.onMove();
		},
		restore: function() {
			if (this.isMinimize || this.isMaximize) {
				if (this.isMaximize) {
					this.x = this.posRestore.x;
					this.y = this.posRestore.y;
				}
				this.width = this.posRestore.width;
				this.height = this.posRestore.height;
				this.isMinimize = false;
				this.isMaximize = false;
				this._refresh();
				this.onResize();
				this.onMove();
			}
		},
		movetotop: function() {
			this.windowDiv.style.zIndex = ++tfgs.window.zIndex;
			if (this.flashMode) {
				this.windowDiv.classList.remove("tfgsEmergency");
				this.flashMode = false;
			}
			if (this.flashTimer !== -1) {
				clearInterval(this.flashTimer);
				this.flashTimer = -1;
			}
		},
		close: function() {
			if (this.onClose() === false) return;
			this.windowDiv.remove();
			this.windowDiv = null;
			window.removeEventListener("resize", windowDiv._resizeCallback);
		},
		resize: function(w, h) {
			if (w === this.width && h === this.height) return;
			this.width = w;
			this.height = h;
			this._refresh();
			this.onResize();
		},
		move: function(x, y) {
			if (x === this.x && y === this.y) return;
			this.x = x;
			this.y = y;
			this._refresh();
			this.onMove();
		},
		flash: function(time, count, stay) {
			if (this.flashTimer !== -1) {
				clearInterval(this.flashTimer);
				// this.flashTimer=-1;
			}
			this.windowDiv.classList.add("tfgsEmergency");
			let flash = true;
			let that = this;
			this.flashTimer = setInterval(function() {
				if (count > 0) {
					if (!flash) {
						that.windowDiv.classList.add("tfgsEmergency");
						flash = true;
					} else {
						that.windowDiv.classList.remove("tfgsEmergency");
						flash = false;
						count--;
					}
				} else {
					if (stay) {
						that.windowDiv.classList.add("tfgsEmergency");
						flash = true;
					}
					clearInterval(that.flashTimer);
					that.flashTimer = -1;
				}
				that.flashMode = flash;
			}, time);
		},
		_refresh: function() {
			let sX = window.innerWidth,
				sY = window.innerHeight;
			if (this.isMaximize) {
				this.x = 0;
				this.y = 0;
				this.width = sX;
				this.height = sY;
			} else {
				let mX = this.minWidth + 6,
					mY = this.minHeight + 26,
					x = this.x,
					y = this.y,
					w = this.width,
					h = this.height;
				if (this.isMinimize) {
					w = this.minimizeWidth + 6;
					h = 26;
				} else {
					if (w < mX) w = mX;
					if (h < mY) h = mY;
					if (w > sX) w = sX;
					if (h > sY) h = sY;
				}

				let X = x + w,
					Y = y + h;
				if (isNaN(x)) x = Math.floor(Math.random() * (sX - w));
				if (isNaN(y)) y = Math.floor(Math.random() * (sY - h));
				if (x < 0) x = 0;
				if (y < 0) y = 0;
				if (X > sX) x -= X - sX;
				if (Y > sY) y -= Y - sY;

				this.x = x;
				this.y = y;
				this.width = w;
				this.height = h;
			}

			let styl = this.windowDiv.style;
			styl.left = this.x + "px";
			styl.top = this.y + "px";
			styl.width = this.width + "px";
			styl.height = this.height + "px";

			showhide(this.titleDiv.children[0],
				!this.isMinimize && this.haveLogo);
			this.titleDiv.children[1].innerText = this.title;
			showhide(this.titleDiv.children[2],
				!this.isMinimize && this.canMinimize);
			showhide(this.titleDiv.children[3],
				this.isMaximize);
			showhide(this.titleDiv.children[4],
				!this.isMinimize && !this.isMaximize && this.canMaximize);
			showhide(this.titleDiv.children[5],
				this.canClose);
			showhide(this.innerDiv,
				!this.isMinimize);
			showhide(this.resizeDiv,
				!this.isMinimize && !this.isMaximize && this.canResize);
		}
	};

	windowobj = Object.assign(windowobj, options);
	let windowDiv = tfgs.element.create("div", "tfgsWindow");
	windowDiv.innerHTML = `
<div class="tfgsWindowTitle">
	<span>≡</span>
	<span class="tfgsWindowText"></span>
	<span>_</span>
	<span>▭</span>
	<span>□</span>
	<span>✕</span>
</div>
<div class="tfgsWindowContent"></div>
<div class="tfgsWindowResize"></div>
`;
	document.body.appendChild(windowDiv);
	windowDiv.style.zIndex = ++tfgs.window.zIndex;

	windowDiv._resizeCallback = function() {
		windowobj._refresh();
		windowobj.onResize();
	};

	window.addEventListener("resize", windowDiv._resizeCallback);

	let titleDiv = windowDiv.children[0];
	let innerDiv = windowDiv.children[1];
	let resizeDiv = windowDiv.children[2];

	let titleDivs = titleDiv.children;

	// 不能写成
	// windowDiv.addEventListener("mousedown", windowobj.movetotop, true);
	// 否则里面的this会指向windowDiv而不是windowobj

	windowDiv.addEventListener("mousedown", function(event) {
		windowobj.movetotop();
	}, true);

	titleDivs[2].addEventListener("click", function(event) {
		windowobj.minimize();
	});

	titleDivs[3].addEventListener("click", function(event) {
		windowobj.restore();
	});

	titleDivs[4].addEventListener("click", function(event) {
		windowobj.maximize();
	});

	titleDivs[5].addEventListener("click", function(event) {
		windowobj.close();
	});

	let moveObj = {
		onStart: function(event) {
			if (windowobj.isMaximize)
				return null;
			windowobj.movetotop();
			return {
				x: windowobj.x,
				y: windowobj.y
			};
		},
		onMove: function(x, y, event) {
			if (windowobj.canMove)
				windowobj.move(x, y);
		},
		onEnd: function(mode, event) {
			if (mode === "click") {
				if (windowobj.isMinimize)
					windowobj.restore();
			}
		}
	};

	tfgs.drag.setdrag(titleDivs[0], moveObj);
	tfgs.drag.setdrag(titleDivs[1], moveObj);

	tfgs.drag.setdrag(resizeDiv, {
		onStart: function(event) {
			return {
				x: windowobj.width,
				y: windowobj.height
			};
		},
		onMove: function(x, y, event) {
			windowobj.resize(x, y);
		},
		onEnd: function(mode, event) {}
	});

	windowobj.windowDiv = windowDiv;
	windowobj.titleDiv = titleDiv;
	windowobj.innerDiv = innerDiv;
	windowobj.resizeDiv = resizeDiv;

	windowobj._refresh();
	windowobj.flash(300, 1, false);

	return windowobj;
};

function showhide(x, show) {
	x.style.display = show ? "inherit" : "none";
}
