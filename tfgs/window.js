tfgs.window = {};

tfgs.window.create = function(options) {
	let windowobj = {
		titleDiv: null,
		innerDiv: null,
		windowDiv: null,
		top: 0,
		left: 0,
		height: 300,
		width: 300,
		margin: 0,
		isMinimize: false,
		isMaximize: false,
		canMinimize: true,
		canMaximize: true,
		canClose: true,
		canResize: true,
		canMove: true,
		onMinimize: function() {},
		onMaximize: function() {},
		onClose: function() {},
		onResize: function() {},
		onMove: function() {},
		minimize: function() {},
		maximize: function() {},
		close: function() {},
		resize: function() {},
		move: function() {}
	};

	let windowDiv = element("div", "tfgsWindow");
	windowDiv.innerHTML = `
<div class="tfgsWindowTitle">
	<span>≡</span>
	<span class="tfgsWindowText">Titkjvhkvkvojvpjv9jvojbole</span>
	<span>_</span>
	<span>▭</span>
	<span>□</span>
	<span>✕</span>
</div>
<div class="tfgsWindowContent">
	<pre>
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	pre
	</pre>
</div>
<div class="tfgsWindowResize"></div>
`;
	document.body.appendChild(windowDiv);

	window.addEventListener("resize", function() {
		frameinscreen(windowDiv);
	});

	windowDiv.children[0].children[2].addEventListener("click", function() {
		windowDiv.style.width = "150px";
		windowDiv.style.height = "26px";
		frameinscreen(windowDiv);
	});

	windowDiv.children[0].children[3].addEventListener("click", function() {
		windowDiv.style.width = "200px";
		windowDiv.style.height = "150px";
		frameinscreen(windowDiv);
	});

	windowDiv.children[0].children[4].addEventListener("click", function() {
		windowDiv.style.width = "1000000px";
		windowDiv.style.height = "1000000px";
		frameinscreen(windowDiv);
	});

	windowDiv.children[0].children[5].addEventListener("click", function() {
		windowDiv.remove();
	});

	tfgs.drag.setdrag(windowDiv.children[0].children[1], {
		onStart: function(event) {
			if (event.target.tagName === "INPUT") return null;
			let css = window.getComputedStyle(windowDiv);
			let x = cssnum(css.left);
			let y = cssnum(css.top);
			frameinscreen(windowDiv);
			return {
				x: x,
				y: y
			};
		},
		onMove: function(x, y, event) {
			windowDiv.style.left = x + "px";
			windowDiv.style.top = y + "px";
			frameinscreen(windowDiv);
		},
		onEnd: function(mode, event) {
			/* Edit the title when click on the title bar */
			if (mode === "click") {
				let newInput = element("input", "tfgsNewInput", "text");
				newInput.value = windowDiv.children[0].children[1].innerText;
				windowDiv.children[0].children[1].innerHTML = "";
				windowDiv.children[0].children[1].appendChild(newInput);
				newInput.focus();
				newInput.addEventListener("blur", function() {
					newInput.remove();
					windowDiv.children[0].children[1].innerText = newInput.value;
				});
			}
		}
	});

	tfgs.drag.setdrag(windowDiv.children[2], {
		onStart: function(event) {
			let css = window.getComputedStyle(windowDiv);
			let x = cssnum(css.width);
			let y = cssnum(css.height);
			return {
				x: x,
				y: y
			};
		},
		onMove: function(x, y, event) {
			if (x < 100) x = 100;
			if (y < 26) y = 26;
			windowDiv.style.width = x + "px";
			windowDiv.style.height = y + "px";
			frameinscreen(windowDiv);
		},
		onEnd: function(mode, event) {}
	});
};

function cssnum(x) {
	return Number(/[-.\d]*(?:e[+-]?\d+)?/.exec(x)[0]);
}

function frameinscreen(elem) {
	let css = window.getComputedStyle(elem);
	let sX = window.innerWidth;
	let sY = window.innerHeight;
	let x = cssnum(css.left);
	let y = cssnum(css.top);
	let w = cssnum(css.width);
	let h = cssnum(css.height);
	let ch = false;
	if (w > sX) {
		w = sX;
		ch = true;
	}
	if (h > sY) {
		h = sY;
		ch = true;
	}
	let X = x + w,
		Y = y + h;
	if (x < 0) {
		x = 0;
		ch = true;
	}
	if (y < 0) {
		y = 0;
		ch = true;
	}
	if (X > sX) {
		x -= X - sX;
		ch = true;
	}
	if (Y > sY) {
		y -= Y - sY;
		ch = true;
	}
	if (ch) {
		elem.style.left = x + "px";
		elem.style.top = y + "px";
		elem.style.width = w + "px";
		elem.style.height = h + "px";
	}
}
