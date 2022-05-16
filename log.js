function isstr(x) {
	return typeof x === "string";
}

function element(tagname, classname, type) {
	let ele = document.createElement(tagname);
	if (isstr(classname)) ele.className = classname;
	if (isstr(type)) ele.type = type;
	return ele;
}

tfgs.log = {};

tfgs.log.list = [];

tfgs.log.dispIntv = null;

tfgs.log.add = function(name, color, log) {
	tfgs.log.list.push({
		name: name,
		color: color,
		log: log
	});
	while (tfgs.log.list.length > 500)
		tfgs.log.list.splice(0, 1);
	tfgs.log.changed = true;
};

tfgs.log.clear = function() {
	tfgs.log.list = [];
	tfgs.log.changed = true;
};

tfgs.log.displayInterval = function(div, fliter) {
	tfgs.log.display(div, fliter);
	tfgs.log.changed = false;
	return setInterval(function() {
		let x = div.scrollX,
			y = div.scrollY;
		if (tfgs.log.changed) {
			div.innerHTML = "";
			tfgs.log.display(div, fliter);
			tfgs.log.changed = false;
		}
		div.scrollX = x;
		div.scrollY = y;
	}, 100);
};

tfgs.log.display = function(div, fliter) {
	div.classList.add("tfgsLogFormat");
	for (let i in tfgs.log.list) {
		let log1 = tfgs.log.list[i];
		if (fliter.name === null || fliter.name.includes(log1.name))
			if (fliter.color === null || fliter.color.includes(log1.color)) {
				let eline = element("div");
				eline.style.color = log1.color;
				eline.innerText = log1.name + "\t" + log1.log;
				div.appendChild(eline);
			}
	}
};

tfgs.log.create = function() {
	try {
		if (tfgs.log.dispIntv !== null) {
			return;
		}
		let element = function(tagName, className, type) {
			let ele = document.createElement(tagName);
			if (className !== undefined) ele.className = className;
			ele.className = className;
			if (type !== undefined) ele.type = type;
			return ele;
		};
		let logdiv = tfgs.log.logdiv = element("div", "tfgsLog");
		logdiv.innerHTML = `
<div class="tfgsLogContent"></div>
<div class="tfgsLogButtons">
	<span class="tfgsButton">拖动</span>
	<span class="tfgsButton tfgsRight">关闭</span>
	<span class="tfgsButton tfgsRight">清空</span>
</div>
`;
		logdiv.style.left = "20px";
		logdiv.style.top = "20px";
		let contentdiv = logdiv.children[0];
		let buttondiv = logdiv.children[1];
		let bmove = buttondiv.children[0];
		let bclose = buttondiv.children[1];
		let bclear = buttondiv.children[2];
		tfgs.log.dispIntv = tfgs.log.displayInterval(contentdiv, {
			"name": null,
			"color": null
		});
		let dx, dy, dm = false;
		let _px = function(x) {
			return Number(x.slice(0, -2));
		};
		let dragstart = function(x, y) {
			dx = x - _px(logdiv.style.left);
			dy = y - _px(logdiv.style.top);
			dm = true;
			bmove.classList.add("tfgsDrag");
		};
		let dragmove = function(x, y) {
			if (dm) {
				logdiv.style.left = x - dx + "px";
				logdiv.style.top = y - dy + "px";
				object_in_window(logdiv, 0);
				return true;
			}
			return false;
		};
		let dragend = function() {
			dm = false;
			bmove.classList.remove("tfgsDrag");
		};
		bmove.addEventListener("mousedown", function(event) {
			dragstart(event.clientX, event.clientY);
			event.preventDefault();
		});
		bmove.addEventListener("touchstart", function(event) {
			dragstart(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
			event.preventDefault();
		});
		window.addEventListener("mousemove", function(event) {
			if (dragmove(event.clientX, event.clientY))
				event.preventDefault();
		});
		bmove.addEventListener("touchmove", function(event) {
			if (dragmove(event.targetTouches[0].clientX, event.targetTouches[0].clientY))
				event.preventDefault();
		});
		bmove.addEventListener("touchend", function(event) {
			dragend();
		});
		window.addEventListener("mouseup", function(event) {
			dragend();
		});
		window.addEventListener("mouseleave", function(event) {
			dragend();
		});
		bclear.addEventListener("click", function() {
			tfgs.log.clear();
		});
		bclose.addEventListener("click", function() {
			clearInterval(tfgs.log.dispIntv);
			logdiv.remove();
			tfgs.log.dispIntv = null;
		});
		window.addEventListener("resize", function(event) {
			object_in_window(logdiv, 0);
		});
		document.body.appendChild(logdiv);
	} catch (e) {
		tfgs.error(e);
	}
};

function object_in_window(obj, pad) {
	let objrect = obj.getBoundingClientRect();
	if (objrect.right > window.innerWidth - pad)
		obj.style.left = (window.innerWidth - objrect.width - pad) + "px";
	if (objrect.left < 0 + pad)
		obj.style.left = (0 + pad) + "px";
	if (objrect.bottom > window.innerHeight - pad)
		obj.style.top = (window.innerHeight - objrect.height - pad) + "px";
	if (objrect.top < 0 + pad)
		obj.style.top = (0 + pad) + "px";
}
