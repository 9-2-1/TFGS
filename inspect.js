(function() {
	let origbind = Function.prototype.bind;
	Function.prototype.bind = fakebind;

	function fakebind() {
		Function.prototype.bind = origbind;
		try {
			let res = origbind.apply(this, arguments);
			res.origfunc = this;
			res.bindargs = arguments;
			return res;
		} catch (err) {
			alert(err.message);
		} finally {
			Function.prototype.bind = fakebind;
		}
	}
})();

function inspect(x) {
	let u = [];
	let str = "";

	function inspect2(x, ind) {
		let t = typeof x;
		if (t !== "function")
			str += t + " ";
		if (t === "function" || t === "object") {
			if (x === null) {
				str += "null";
				return;
			}
			if (u.includes(x)) {
				str += "[goto __" + (u.indexOf(x) + 1) + "__]";
				return;
			}
			if (t === "function") {
				//str += JSON.stringify(x.name);
				str += x.toString().replace(/\n/g, "\n  " + ind);
				listAttr(x, x);
			}
			if (t === "object") {
				if (typeof x.constructor === "function") {
					try {
						str += JSON.stringify(x.constructor.name);
					} catch (err) {
						str += "ERR: " + err.message
					}
				} else {
					str += "??????";
				}
				listAttr(x, x);
			}

			function listAttr(xx, x) {
				let hide = false;
				if (u.includes(xx)) {
					str += " [goto __" + (u.indexOf(x) + 1) + "__]";
					return;
				}
				while (true) {
					if (u.includes(x))
						hide = true;
					else
						u.push(x);
					str += " [__" + (u.length) + "__]";
					let y = Object.getOwnPropertyDescriptors(x);
					let z = Object.getOwnPropertyNames(x)
						.concat(Object.getOwnPropertySymbols(x));
					if (z.length > 200) {
						str += "\n  " + ind + z.length + "items";
					} else {
						for (let j in z) {
							let i = z[j];
							try {
								if ("get" in y[i]) {
									str += "\n  " + ind;
									str += y[i].configurable ? "-" : "x";
									str += y[i].enumerable ? "-" : "+";
									str += " ";
									str += typeof i === "symbol" ? "Symbol " + JSON.stringify(i.description) : JSON.stringify(i);
									str += " ~ ";
									inspect2(xx[i], ind + "  ");
									str += "\n  " + ind + "  ~~ get = ";
									inspect2(y[i].get, ind + "    ");
									str += "\n  " + ind + "  ~~ set = ";
									inspect2(y[i].set, ind + "    ");
								} else if (!hide) {
									str += "\n  " + ind;
									str += y[i].configurable ? "-" : "x";
									str += y[i].enumerable ? "-" : "+";
									str += " ";
									str += typeof i === "symbol" ? "Symbol " + JSON.stringify(i.description) : JSON.stringify(i);
									str += " = ";
									inspect2(y[i].value, ind + "  ");
								}
							} catch (err) {
								str += "ERR: " + err.message;
							}
						}
					}
					if (typeof x.constructor === "function" && x !== x.constructor.prototype) {
						str += "\n  " + ind + "== From " + JSON.stringify(x.constructor.name) + " ==";
						if (u.includes(x.constructor.prototype)) {
							str += " [goto __" + (u.indexOf(x.constructor.prototype) + 1) + "__]";
						}
						x = x.constructor.prototype;
					} else {
						return;
					}
					//u.pop();
				}
			}
		} else {
			if (t === "number") {
				str += String(x);
			} else {
				str += JSON.stringify(x);
			}
		}
	}
	inspect2(x, "");
	return str;
}

/*
setTimeout(function() {
	try {
		let x = document.createElement('a');
		x.href = "data:text/plain," + encodeURIComponent(inspect(Blockly.getMainWorkspace()));
		x.download = "inspect.txt";
		x.innerText = "a";
		x.click();
	} catch (err) {
		alert(err.message);
	}
}, 3000);
*/
