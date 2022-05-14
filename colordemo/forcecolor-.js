function fakeColor(color) {
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
			rgba.push(Number(col[4]) * 1);
		else
			rgba.push(1);
		return rgba;
	}
}

// let dd = document.querySelector("[class^=tfgsForcecolorInput2]");
// let fc = fakeColor("olive");
// dd.value = `${fc[1]},${fc[2]},${fc[3]}`;

function RGB2HMM(rgb) {
	let sta, dir;
	// sta rgb数组最大值点
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
	for (let i = 0; i < 3; i++) {
		rgb[i] /= 255;
	}

	let hue = 0,
		min = Infinity,
		max = -Infinity;
	for (let i = 0; i < 3; i++) {
		if (rgb[i] < min) {
			min = rgb[i];
			dir = i; // dir -> min
		}
		if (rgb[i] > max) {
			max = rgb[i];
			sta = i;
		}
	}

	if (max !== min) {
		dir = 3 /*0+1+2*/ - sta - dir; // dir -> mid
		let mid = rgb[dir];

		dir = dir - sta;
		if (dir < -1) dir += 3;
		if (dir > 1) dir -= 3;

		hue = sta * 120 + dir * (mid - min) / (max - min) * 60;
	}

	return [hue, min, max];
}

function HMM2RGB(hmm) {
	let h = hmm[0],
		min = hmm[1],
		max = hmm[2];
	let delta = max - min;
	let rgb = [];
	for (let i = 0; i < 3; i++)
		rgb.push((min + fHue(h - i * 120) * delta) * 255);
	return rgb;
}

/* --- */

function HSL2HMM(hsl) {
	let h = hsl[0],
		s = hsl[1],
		l = hsl[2];
	let min, max, delta;
	if (l >= 0.5) {
		delta = 1 - l;
	} else {
		delta = l;
	}
	min = l - delta * s;
	max = l + delta * s;
	return [h, min, max];
}

function HMM2HSL(hmm) {
	let h = hmm[0],
		min = hmm[1],
		max = hmm[2],
		s, l;
	l = (min + max) / 2;
	if (l === 0 || l === 1)
		s = 0;
	else if (l >= 0.5)
		s = (max - min) / (2 - max - min);
	else
		s = (max - min) / (max + min);
	return [h, s, l];
}

/* --- */

function HSB2HMM(hsb) {
	let h = hsb[0] / (100 / 360),
		s = hsb[1],
		b = hsb[2];
	h -= Math.floor(h / 360) * 360;
	let min, max, delta;
	min = (1 - s / 100) * b;
	max = b;
	return [h, min / 100, max / 100];
}

function HMM2HSB(hmm) {
	let h = hmm[0] * (100 / 360),
		min = hmm[1],
		max = hmm[2],
		s = 0,
		b;
	h -= Math.floor(h / 100) * 100;
	b = max;
	if (b > 0)
		s = 1 - min / max;
	s *= 100;
	b *= 100;
	return [h, s, b];
}

/* --- */

function RGB2HSL(rgb) {
	return HMM2HSL(RGB2HMM(rgb));
}

function RGB2HSB(rgb) {
	return HMM2HSB(RGB2HMM(rgb));
}

function HSL2RGB(hsl) {
	return HMM2RGB(HSL2HMM(hsl));
}

function HSB2RGB(hsb) {
	return HMM2RGB(HSB2HMM(hsb));
}

//for(let x=-360;x<=360;x+=10)console.log(x,fHue(x));

function fHue(x) {
	x = Math.abs(x - Math.round(x / 360) * 360);
	if (x < 60)
		return 1;
	else if (x > 120)
		return 0;
	else
		return (120 - x) / 60;
}

function test() {
	check(RGB2HSL([0, 0, 0]), [0, 0, 0]);
	check(RGB2HSL([255, 255, 255]), [0, 0, 1]);
	check(RGB2HSL([0, 255, 255]), [180, 1, 0.5]);
	check(RGB2HSL([0, 255, 0]), [120, 1, 0.5]);
	check(RGB2HSL([255, 0, 0]), [0, 1, 0.5]);
	check(RGB2HSL([127.5, 255, 255]), [180, 1, 0.75]);
	check(RGB2HSL([127.5, 191.25, 191.25]), [180, 1 / 3, 0.625]);

	check(RGB2HSB([0, 0, 0]), [0, 0, 0]);
	check(RGB2HSB([255, 255, 255]), [0, 0, 100]);
	check(RGB2HSB([0, 255, 255]), [50, 100, 100]);
	check(RGB2HSB([0, 255, 0]), [100 / 3, 100, 100]);
	check(RGB2HSB([255, 0, 0]), [0, 100, 100]);
	check(RGB2HSB([127.5, 255, 255]), [50, 50, 100]);
	check(RGB2HSB([127.5, 191.25, 191.25]), [50, 100 / 3, 75]);

	check(HSL2RGB([0, 0, 0]), [0, 0, 0]);
	check(HSL2RGB([0, 0, 1]), [255, 255, 255]);
	check(HSL2RGB([180, 1, 0.5]), [0, 255, 255]);
	check(HSL2RGB([120, 1, 0.5]), [0, 255, 0]);
	check(HSL2RGB([0, 1, 0.5]), [255, 0, 0]);
	check(HSL2RGB([180, 1, 0.75]), [127.5, 255, 255]);
	check(HSL2RGB([180, 1 / 3, 0.625]), [127.5, 191.25, 191.25]);

	check(HSB2RGB([0, 0, 0]), [0, 0, 0]);
	check(HSB2RGB([0, 0, 100]), [255, 255, 255]);
	check(HSB2RGB([50, 100, 100]), [0, 255, 255]);
	check(HSB2RGB([100 / 3, 100, 100]), [0, 255, 0]);
	check(HSB2RGB([0, 100, 100]), [255, 0, 0]);
	check(HSB2RGB([50, 50, 100]), [127.5, 255, 255]);
	check(HSB2RGB([50, 100 / 3, 75]), [127.5, 191.25, 191.25]);
}

// test();

function check(x, y) {
	for (let i = 0; i < 3; i++) {
		if (Math.abs(x[i] - y[i]) > 1e-5) {
			console.log(x, y);
			throw "test failed";
		}
	}
}

function HEX2RGBA(hex) {
	if (hex === null || hex[0] !== "#")
		return [0, 0, 0, 0];
	else if (hex.length === 7) {
		return [
			Number("0x" + hex.slice(1, 2)),
			Number("0x" + hex.slice(3, 2)),
			Number("0x" + hex.slice(5, 2)), , 255
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
	return "#" +
		fHex(rgba[0]) +
		fHex(rgba[1]) +
		fHex(rgba[2]) +
		(Math.round(rgba[3] === 255) ? "" : fHex(rgba[3]));
}

function fHex(x) {
	let hex = "0123456789abcdef";
	x = Math.round(x);
	if (x < 0) x = 0;
	if (x > 255) x = 255;
	return hex[Math.floor(x / 16)] + hex[x % 16];
}

function selele(x) {
	return document.getElementsByClassName(x)[0];
}

function clamp(x, min, max) {
	return x < min ? min : x > max ? max : x;
}

function sethmmcolor(hmma) {
	hmma[0] -= Math.floor(hmma[0] / 360) * 360;
	hmma[1] = clamp(hmma[1], 0, 1);
	hmma[2] = clamp(hmma[2], hmma[1], 1);
	hmma[3] = clamp(hmma[3], 0, 1);
	let cp = selele("tfgsForcecolorPicker");
	let hsb = HMM2HSB(hmma);
	cp.style.setProperty("--H", hmma[0]);
	cp.style.setProperty("--S", hsb[1]);
	cp.style.setProperty("--B", hsb[2]);
	cp.style.setProperty("--A", hmma[3] * 100);

	let HCrgb = HMM2RGB([hmma[0], 0, 1]).concat([255]);
	let ACrgb = HMM2RGB(hmma).concat([255]);

	cp.style.setProperty("--HC", RGBA2HEX(HCrgb));
	cp.style.setProperty("--AC", RGBA2HEX(ACrgb));

	let cin = selele("tfgsForcecolorInput").children;
	let val;
	switch (cin[0].value) {
		case "HSBA":
			val = HMM2HSB(hmma).concat(hmma[3] * 100);
			break;
		case "RGBA":
			val = HMM2RGB(hmma).concat(hmma[3] * 100);
			break;
		case "RGBA255":
			val = HMM2RGB(hmma).concat(hmma[3] * 255);
			break;
		case "HSLA":
			val = HMM2HSL(hmma).concat(hmma[3] * 100);
			val[1] *= 100;
			val[2] *= 100;
			break;
		default:
	}
	let sel = document.activeElement;
	let modify = false;
	for (let i = 1; i < 5; i++)
		if (cin[i] === sel)
			modify = true;
	if (!modify) {
		for (let i = 0; i < 4; i++)
			cin[i + 1].value = val[i].toString().replace(/(\..).*/, "$1");
	}
	let chex = RGBA2HEX(HMM2RGB(hmma).concat([hmma[3]] * 255));
	cin[5].style.setProperty("--C", chex);
	cin[6].value = chex;
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
		if(document.activeElement!==null)
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

let sethmma = [180, 0.3, 0.7, 0.5];
try {
	sethmmcolor(sethmma);
	let colH = selele("tfgsForcecolorH");
	dragCallback(colH, function(x, y) {
		try {
			let rect = colH.getBoundingClientRect();
			let ox = (rect.left + rect.right) / 2 - x;
			let oy = (rect.top + rect.bottom) / 2 - y;
			sethmma[0] = Math.atan2(ox, oy) * -180 / Math.PI;
			sethmmcolor(sethmma);
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
			let hsb = HMM2HSB(sethmma);
			hsb[1] = s;
			hsb[2] = b;
			let hmm = HSB2HMM(hsb);
			sethmma[1] = hmm[1];
			sethmma[2] = hmm[2];
			sethmmcolor(sethmma);
		} catch (e) {
			alert(e.message);
		}
	});
	let colA = selele("tfgsForcecolorA");
	dragCallback(colA, function(x, y) {
		try {
			let rect = colA.getBoundingClientRect();
			let a = clamp((x - rect.left) / (rect.right - rect.left), 0, 1) * 100;
			sethmma[3] = a / 100;
			sethmmcolor(sethmma);
		} catch (e) {
			alert(e.message);
		}
	});
	let colI = selele("tfgsForcecolorInput").children;

	function wheninput(event) {
		setTimeout(function() {
			let set = [];
			for (let i = 1; i < 5; i++)
				set.push(colI[i].value);
			switch (colI[0].value) {
				case "HSBA":
					sethmma = HSB2HMM(set).concat(set[3] / 100);
					break;
				case "RGBA":
					sethmma = RGB2HMM(set).concat(set[3] / 100);
					break;
				case "RGBA255":
					sethmma = RGB2HMM(set).concat(set[3] / 255);
					break;
				case "HSLA":
					sethmma = HSL2HMM([set[0],set[1]/100,set[2]/100]).concat(set[3] / 100);
					break;
				default:
			}
			sethmmcolor(sethmma);
		}, 10);
	}

	function whenenter(event) {
		if (event.keyCode === 13)
			wheninput2();
	}

	function wheninput2() {
		setTimeout(function() {
			let rgba = fakeColor(colI[6].value);
			sethmma = RGB2HMM(rgba).concat(rgba[3]);
			sethmmcolor(sethmma);
		}, 10);
	}

	function whenchange() {
		sethmmcolor(sethmma);
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
} catch (e) {
	alert(e.message);
}
