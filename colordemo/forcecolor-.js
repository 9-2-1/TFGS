let color = {
	primary: "#8566ff",
	secondary: null,
	gradientType: "SOLID"
};
let colorIndex = 0;

let gradients = ["SOLID", "VERTICAL", "HORIZONAL", "RADIAL"];

function unnull(x) {
	return x === null ? "transparent" : x;
};

function CSS2RGBA(color) {
	if (color === null) return [0, 0, 0, 0];
	let kero = document.createElement("span");
	kero.style.color = color;
	document.body.appendChild(kero);
	let formatted = window.getComputedStyle(kero, null).color;
	kero.remove();
	let rgx = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
	let col = rgx.exec(formatted);
	if (col === null) {
		return [0, 0, 0, 0];
	} else {
		let rgba = [];
		rgba.push(Number(col[1]));
		rgba.push(Number(col[2]));
		rgba.push(Number(col[3]));
		if (col[4] !== undefined)
			rgba.push(Number(col[4]) * 255);
		else
			rgba.push(255);
		return rgba;
	}
}

function fHue(x) {
	x = Math.abs(x - Math.round(x / 360) * 360);
	if (x < 60)
		return 1;
	else if (x > 120)
		return 0;
	else
		return (120 - x) / 60;
}

function fHex(x) {
	let hex = "0123456789abcdef";
	x = Math.round(x);
	if (x < 0) x = 0;
	if (x > 255) x = 255;
	return hex[Math.floor(x / 16)] + hex[x % 16];
}

/* --- */

function RGBA2HMMA(rgba) {
	let sta, dir;
	// sta rgba数组最大值点
	// dir 把r(0),g(1),b(2)值组成一个环，最大值点走向次小值点的最近方向
	//
	//     r
	//    / \
	//   /   \
	//  g-----b
	//
	// 例子： r=35 g=127 b=253
	// r最小 g较小 b最大，那么sta=2 dir=-1(b->g逆时针)
	// r较小 g最小 b最大，那么sta=2 dir=1(b->r顺时针)
	for (let i = 0; i < 4; i++) {
		rgba[i] /= 255;
	}

	let hue = 0,
		min = Infinity,
		max = -Infinity;
	for (let i = 0; i < 3; i++) {
		if (rgba[i] < min) {
			min = rgba[i];
			dir = i; // dir -> min
		}
		if (rgba[i] > max) {
			max = rgba[i];
			sta = i;
		}
	}

	if (max !== min) {
		dir = 3 /*0+1+2*/ - sta - dir; // dir -> mid
		let mid = rgba[dir];

		dir = dir - sta;
		if (dir < -1) dir += 3;
		if (dir > 1) dir -= 3;

		hue = sta * 120 + dir * (mid - min) / (max - min) * 60;
	}

	return [hue, min, max, rgba[3]];
}

function HMMA2RGBA(hmma) {
	let h = hmma[0],
		min = hmma[1],
		max = hmma[2];
	let delta = max - min;
	let rgb = [];
	for (let i = 0; i < 3; i++)
		rgb.push((min + fHue(h - i * 120) * delta) * 255);
	rgb.push(Math.round(hmma[3] * 255));
	return rgb;
}

/* --- */

function HSLA2HMMA(hsla) {
	let h = hsla[0],
		s = hsla[1],
		l = hsla[2],
		a = hsla[3];
	let min, max, delta;
	if (l >= 0.5) {
		delta = 1 - l;
	} else {
		delta = l;
	}
	min = l - delta * s;
	max = l + delta * s;
	return [h, min, max, a];
}

function HMMA2HSLA(hmma) {
	let h = hmma[0],
		min = hmma[1],
		max = hmma[2],
		a = hmma[3],
		s, l;
	l = (min + max) / 2;
	if (l === 0 || l === 1)
		s = 0;
	else if (l >= 0.5)
		s = (max - min) / (2 - max - min);
	else
		s = (max - min) / (max + min);
	return [h, s, l, a];
}

/* --- */

function HSBA2HMMA(hsba) {
	let h = hsba[0] * 360 / 100,
		s = hsba[1],
		b = hsba[2],
		a = hsba[3] / 100;
	h -= Math.floor(h / 360) * 360;
	let min, max, delta;
	min = (1 - s / 100) * b;
	max = b;
	return [h, min / 100, max / 100, a];
}

function HMMA2HSBA(hmma) {
	let h = hmma[0] * 100 / 360,
		min = hmma[1],
		max = hmma[2],
		a = hmma[3],
		s = 0,
		b = max;
	h -= Math.floor(h / 100) * 100;
	if (b > 0)
		s = 1 - min / max;
	s *= 100;
	b *= 100;
	a *= 100
	return [h, s, b, a];
}

/* --- */

function HEX2RGBA(hex) {
	if (hex === null || hex[0] !== "#")
		return [0, 0, 0, 0];
	else if (hex.length === 7) {
		return [
			Number("0x" + hex.slice(1, 2)),
			Number("0x" + hex.slice(3, 2)),
			Number("0x" + hex.slice(5, 2)),
			255
		];
	} else if (hex.length === 9) {
		return [
			Number("0x" + hex.slice(1, 2)),
			Number("0x" + hex.slice(3, 2)),
			Number("0x" + hex.slice(5, 2)),
			Number("0x" + hex.slice(7, 2))
		];
	} else
		return [0, 0, 0, 0];
}

function RGBA2HEX(rgba) {
	if (rgba[3] === 0)
		return null;
	else
		return "#" +
			fHex(rgba[0]) +
			fHex(rgba[1]) +
			fHex(rgba[2]) +
			(Math.round(rgba[3] === 255) ? "" : fHex(rgba[3]));
}

/* --- */

function HEX2HSBA(hex) {
	return RGBA2HSBA(HEX2RGBA(hex));
}

function HSBA2HEX(hsba) {
	return RGBA2HEX(HSBA2RGBA(hsba));
}

function HSLA2HSBA(hsla) {
	return HMMA2HSBA(HSLA2HMMA(hsla));
}

function HSBA2HSLA(hsba) {
	return HMMA2HSLA(HSBA2HMMA(hsba));
}

function RGBA2HSBA(rgba) {
	return HMMA2HSBA(RGBA2HMMA(rgba));
}

function HSBA2RGBA(hsba) {
	return HMMA2RGBA(HSBA2HMMA(hsba));
}

function selele(x) {
	return document.getElementsByClassName(x)[0];
}

function clamp(x, min, max) {
	return isNaN(x) ? min : x < min ? min : x > max ? max : Number(x);
}

function refreshWindow() {
	editColor[0] -= Math.floor(editColor[0] / 100) * 100;
	editColor[1] = clamp(editColor[1], 0, 100);
	editColor[2] = clamp(editColor[2], 0, 100);
	editColor[3] = clamp(editColor[3], 0, 100);

	color[colorIndex === 0 ? "primary" : "secondary"] = HSBA2HEX(editColor);

	// mode
	let cm = selele("tfgsForcecolorMode").children;

	cm[0].style.setProperty("--C", unnull(color.primary));
	if (color.gradientType === "SOLID") {
		cm[1].style.visibility = "hidden";
		if (colorIndex === 1) {
			changeIndex(0);
			return;
		}
	} else {
		cm[1].style.setProperty("--C", unnull(color.secondary));
		cm[1].style.visibility = "visible";
	}

	for (let i = 0; i < 2; i++)
		cm[i].classList[i === colorIndex ? "add" : "remove"]("tfgsForcecolorSelect");

	let gradientIndex = gradients.indexOf(color.gradientType);

	for (let i = 0; i < 4; i++)
		cm[i + 2].classList[i === gradientIndex ? "add" : "remove"]("tfgsForcecolorSelect");

	// picker
	let cp = selele("tfgsForcecolorPicker");
	cp.style.setProperty("--H", editColor[0]);
	cp.style.setProperty("--S", editColor[1]);
	cp.style.setProperty("--B", editColor[2]);
	cp.style.setProperty("--A", editColor[3]);

	cp.style.setProperty("--HC", HSBA2HEX([editColor[0], 100, 100, 100]));
	cp.style.setProperty("--AC", HSBA2HEX([editColor[0], editColor[1], editColor[2], 100]));

	let cin = selele("tfgsForcecolorInput").children;
	let val;
	switch (cin[0].value) {
		case "HSBA":
			val = editColor;
			break;
		case "RGBA":
			val = HSBA2RGBA(editColor);
			break;
		case "RGBA255":
			val = HSBA2RGBA(editColor);
			break;
		case "HSLA":
			val = HSBA2HSLA(editColor);
			break;
		default:
	}
	let sel = document.activeElement;
	let modify = false;
	for (let i = 1; i < 5; i++)
		if (cin[i] === sel)
			modify = true;
	if (!modify) {
		for (let i = 0; i < 4; i++) {
			let valu = Math.round(Math.abs(val[i]) * 10);
			cin[i + 1].value = "" +
				(val[i] < 0 ? "-" : "") +
				String(valu / 10);
		}
	}
	let chex = HSBA2HEX(editColor);
	cin[5].style.setProperty("--C", unnull(chex));
	cin[6].value = unnull(chex);

	// history

	let cl = selele("tfgsForcecolorList");
	cl.innerHTML = "";
	for (let i = 0; i < colorHistory.length; i++) {
		let col = colorHistory[i];
		let sty = "";
		switch (col.gradientType) {
			case "SOLID":
				sty = unnull(col.primary);
				break;
			case "VERTICAL":
				sty = `linear-gradient(90deg,${unnull(col.primary)},${unnull(col.secondary)})`;
				break;
			case "HORIZONAL":
				sty = `linear-gradient(0deg,${unnull(col.primary)},${unnull(col.secondary)})`;
				break;
			case "RADIAL":
				sty = `radial-gradient(${unnull(col.primary)},${unnull(col.secondary)})`;
				break;
		}
		let item = document.createElement("span");
		item.style.setProperty("--C", sty);
		item.addEventListener("click", function(event) {
			color = {
				...colorHistory[i]
			};
			changeIndex(0);
		});
		cl.appendChild(item);
	}
}

function dragCallback(elem, func) {
	let dragFunc = function(event) {
		if ("targetTouches" in event) {
			func(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
		} else {
			func(event.clientX, event.clientY);
		}
		event.preventDefault();
		event.cancelBubble = true;
		event.stopPropagation();
	};
	let dragStart = function(event) {
		if (document.activeElement !== null)
			document.activeElement.blur();
		window.addEventListener("mousemove", dragFunc);
		window.addEventListener("touchmove", dragFunc);
		window.addEventListener("mouseup", dragStop);
		window.addEventListener("mouseleave", dragStop);
		window.addEventListener("blur", dragStop);
		window.addEventListener("touchend", dragStop);
		dragFunc(event);
		event.preventDefault();
		event.cancelBubble = true;
		event.stopPropagation();
	};
	let dragStop = function() {
		window.removeEventListener("mousemove", dragFunc);
		window.removeEventListener("touchmove", dragFunc);
		window.removeEventListener("mouseup", dragStop);
		window.removeEventListener("mouseleave", dragStop);
		window.removeEventListener("blur", dragStop);
		window.removeEventListener("touchend", dragStop);
		event.preventDefault();
		event.cancelBubble = true;
		event.stopPropagation();
	};
	elem.addEventListener("mousedown", dragStart);
	elem.addEventListener("touchstart", dragStart);
	return function removeCallback() {
		elem.removeEventListener("mousedown", dragStart);
		elem.removeEventListener("touchstart", dragStart);
	};
}

let editColor = [0, 0, 0, 0];

function changeIndex(index) {
	colorIndex = index;
	let current = CSS2RGBA(color[colorIndex === 0 ? "primary" : "secondary"]);
	editColor = RGBA2HSBA(current);
	refreshWindow();
}

// colorHistory
let colorHistory = [];
for (let i = 0; i < 5; i++) {
	for (let j = 0; j < 12; j++) {
		colorHistory.push({
			primary: HSBA2HEX(HSLA2HSBA([j * 360 / 12, 1, i / 5 + 1 / 10, 100])),
			secondary: null,
			gradientType: "SOLID"
		});
	}
}
for (let j = 0; j < 6; j++) {
	colorHistory.push({
		primary: HSBA2HEX(HSLA2HSBA([j * 360 / 6, 1, 0.5, 1])),
		secondary: HSBA2HEX(HSLA2HSBA([(j + 1) * 360 / 6, 1, 0.5, 1]).concat([255])),
		gradientType: "VERTICAL"
	});
}
for (let j = 0; j < 12; j++) {
	colorHistory.push({
		primary: HSBA2HEX(HSLA2HSBA([0, 0, j / 11, 1])),
		secondary: null,
		gradientType: "SOLID"
	});
}
colorHistory.push({
	primary: "#000000",
	secondary: null,
	gradientType: "RADIAL"
});
colorHistory.push({
	primary: "#FFFFFF",
	secondary: null,
	gradientType: "RADIAL"
});

function addHistory(x) {
	let pos = -1;
	for (let i = 0; i < colorHistory.length; i++) {
		let hi = colorHistory[i];
		if (hi.gradientType === x.gradientType &&
			hi.primary === x.primary &&
			hi.secondary === x.secondary) {
			pos = i;
		}
	}
	if (pos !== -1)
		colorHistory.splice(pos, 1);
	colorHistory.splice(0, 0, {
		...x
	});
	while (colorHistory.length > 80)
		colorHistory.pop();
	refreshWindow();
}

try {
	// tab
	let ct = selele("tfgsForcecolorTab");
	for (let i = 0; i < 2; i++) {
		ct.children[i].addEventListener("click", function(event) {
			let ctp = ct.parentElement;
			for (let j = 0; j < 2; j++) {
				if (i === j) {
					ct.children[j].classList.add("tfgsForcecolorTabon");
					ctp.children[j + 1].style.display = "block";
				} else {
					ct.children[j].classList.remove("tfgsForcecolorTabon");
					ctp.children[j + 1].style.display = "none";
				}
			}
		});
	}
	ct.children[0].click();

	// mode
	let cm = selele("tfgsForcecolorMode").children;
	for (let i = 0; i < 2; i++) {
		cm[i].addEventListener("click", function(event) {
			if (i === colorIndex && color.gradientType !== "SOLID") {
				let tmp = color.primary;
				color.primary = color.secondary;
				color.secondary = tmp;
				changeIndex(i);
			} else {
				changeIndex(i);
			}
		});
	}
	for (let i = 0; i < 4; i++) {
		cm[i + 2].addEventListener("click", function(event) {
			if (color.gradientType !== gradients[i]) {
				color.gradientType = gradients[i];
				if (gradients[i] !== "SOLID" && color.secondary === null) {
					color.secondary = color.primary;
					changeIndex(1);
					return;
				}
				refreshWindow();
			}
		});
	}

	// picker
	let colH = selele("tfgsForcecolorH");
	dragCallback(colH, function(x, y) {
		try {
			let rect = colH.getBoundingClientRect();
			let ox = (rect.left + rect.right) / 2 - x;
			let oy = (rect.top + rect.bottom) / 2 - y;
			editColor[0] = Math.atan2(ox, oy) * -180 / Math.PI / 3.6;
			refreshWindow();
		} catch (e) {
			alert(e.message);
		}
	});
	let colSB = selele("tfgsForcecolorSB");
	dragCallback(colSB, function(x, y) {
		try {
			let rect = colSB.getBoundingClientRect();
			let s = clamp((y - rect.bottom) / (rect.top - rect.bottom), 0, 1) * 100;
			let b = clamp((x - rect.left) / (rect.right - rect.left), 0, 1) * 100;
			editColor[1] = s;
			editColor[2] = b;
			refreshWindow();
		} catch (e) {
			alert(e.message);
		}
	});
	let colA = selele("tfgsForcecolorA");
	dragCallback(colA, function(x, y) {
		try {
			let rect = colA.getBoundingClientRect();
			let a = clamp((x - rect.left) / (rect.right - rect.left), 0, 1) * 100;
			editColor[3] = a;
			refreshWindow();
		} catch (e) {
			alert(e.message);
		}
	});
	let colI = selele("tfgsForcecolorInput").children;

	function wheninput(event) {
		setTimeout(function() {
			let set = [];
			for (let i = 1; i < 5; i++)
				set.push(Number(colI[i].value));
			switch (colI[0].value) {
				case "HSBA":
					editColor = set;
					break;
				case "RGBA":
					editColor = RGBA2HSBA(set);
					break;
				case "RGBA255":
					editColor = RGBA2HSBA(set);
					break;
				case "HSLA":
					editColor = HSLA2HSBA(set);
					break;
				default:
			}
			refreshWindow();
		}, 10);
	}

	function whenenter(event) {
		if (event.keyCode === 13)
			wheninput2();
	}

	function wheninput2() {
		setTimeout(function() {
			let rgba = CSS2RGBA(colI[6].value);
			editColor = RGBA2HSBA(rgba).concat(rgba[3]);
			refreshWindow();
		}, 10);
	}

	function whenchange() {
		refreshWindow();
	}

	colI[0].addEventListener("change", whenchange);

	for (let i = 1; i < 5; i++) {
		colI[i].addEventListener("input", wheninput);
		colI[i].addEventListener("cut", wheninput);
		colI[i].addEventListener("paste", wheninput);
		colI[i].addEventListener("blur", wheninput);
	}

	colI[6].addEventListener("blur", wheninput2);
	colI[6].addEventListener("keydown", whenenter);

	// history
	// let ca = selele("tfgsForcecolorAdd");

	// ca.addEventListener("click", function(event) {
	// 	addHistory(color);
	// });

	// initial
	changeIndex(0);
} catch (e) {
	alert(e.message);
}
