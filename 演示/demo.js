let inn = document.getElementById("inn");
let out = document.getElementById("out");
let wok;
wok = new Worker("demo.worker.js");
wok.onmessage = function(msg) {
	workTime = false;
	out.style.color = "black";
	out.value = msg.data.text;
	applyColorChange(msg.data.colorSet);
}
wok.onerror = function(err) {
	workTime = false;
	out.style.color = "red";
	out.value = err.message;
	err.preventDefault();
}
let workTime = false,
	workTout = -1;
inn.contentEditable = true;
inn.addEventListener('keydown', innChange, true);
inn.addEventListener('paste', innChange);

function innChange(event) {
	if (event.keyCode === 13) {
		event.preventDefault();;
	}
	setTimeout(function() {
		if (workTime) {
			if (workTout === null) {
				workTout = setInterval(function() {
					if (!workTime) {
						startWork();
						clearInterval(workTout);
						workTout = null;
					}
				}, 30);
			}
		} else {
			startWork();
		}
	}, 0);
}

function startWork() {
	out.style.color = "blue";
	workTime = true;
	wok.postMessage(inn.innerText.replace(/[\r\n]/g, "").replace(/\u00A0/g, " "));
}

function applyColorChange(colorSet) {
	let tx = inn.innerText;
	let select = document.getSelection();
	let offset = select.focusOffset;
	let offNode = select.focusNode;
	while (offNode !== null && offNode.nodeName.toLowerCase() !== "div") {
		let prevNode = offNode.previousSibling;
		if (prevNode === null) {
			offNode = offNode.parentElement;
		} else {
			offNode = prevNode;
			offset += offNode.innerText.length;
		}
	}
	if (offNode === null) {
		return;
	}

	inn.innerHTML = "";
	let colorStack = [ /* 颜色 */ ];
	let bgcolor = "white",
		color = "black",
		txI = 0,
		ch = "";
	let range = document.createRange(),
		rangeSet = false;
	for (let i = 0; i < colorSet.length; i++) {
		if (colorSet[i].pos !== txI) {
			let font = document.createElement("font");
			font.style.color = color;
			font.style.backgroundColor = bgcolor;
			font.innerText = tx.slice(txI, colorSet[i].pos);
			inn.appendChild(font);
			if (!rangeSet && offset <= colorSet[i].pos) {
				range.setStart(font.childNodes[0], offset - txI);
				range.setEnd(font.childNodes[0], offset - txI);
				rangeSet = true;
			}
			txI = colorSet[i].pos;
		}
		switch (colorSet[i].type) {
			case "push":
				colorStack.push(bgcolor);
				colorStack.push(color);
				// break;
			case "set":
				if ("color" in colorSet[i]) {
					color = colorSet[i].color;
				}
				if ("bgcolor" in colorSet[i]) {
					bgcolor = colorSet[i].bgcolor;
				}
				break;
			case "pop":
				color = colorStack.pop();
				bgcolor = colorStack.pop();
				break;
		}
	}
	if (tx.length !== txI) {
		let font = document.createElement("font");
		font.style.color = color;
		font.style.backgroundColor = bgcolor;
		font.innerText = tx.slice(txI, tx.length);
		inn.appendChild(font);
		if (!rangeSet) {
			range.setStart(font.childNodes[0], offset - txI);
			range.setEnd(font.childNodes[0], offset - txI);
		}
	}
	select.removeAllRanges();
	select.addRange(range);
}

out.addEventListener('focus', function(event) {
	out.blur();
});
out.value = "Script loaded."
