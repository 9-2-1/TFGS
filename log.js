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
};

tfgs.log.clear = function() {
	tfgs.log.list = [];
};

tfgs.log.displayInterval = function(div, fliter) {
	return setInterval(function() {
		let x = div.scrollX,
			y = div.scrollY;
		div.innerHTML = "";
		tfgs.log.display(div, fliter);
		div.scrollX = x;
		dov.scrollY = y;
	}, 100);
};

tfgs.log.display = function(div, fliter) {
	div.classList.add("tfgsLogFormat");
	div.style.overflow = "scroll";
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
			tfgs.log.logdiv.style.left = "20px";
			tfgs.log.logdiv.style.top = "20px";
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
</div>
`;
		logdiv.style.left = "20px";
		logdiv.style.top = "20px";
		let contentdiv = logdiv.children[0];
		let buttondiv = logdiv.children[1];
		let bmove = buttondiv.children[0];
		let bclose = buttondiv.children[1];
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
		};
		let dragmove = function(x, y) {
			if (dm) {
				logdiv.style.left = x - dx + "px";
				logdiv.style.top = y - dy + "px";
				return true;
			}
			return false;
		};
		let dragend = function() {
			dm = false;
		};
		bmove.addEventListener("mousedown", function(event) {
			dragstart(event.clientX, event.clientY);
			event.preventDefault();
		});
		bmove.addEventListener("touchstart", function(event) {
			dragstart(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
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
		bclose.addEventListener("click", function() {
			clearInterval(tfgs.log.dispIntv);
			logdiv.remove();
			tfgs.log.dispIntv = null;
		});
		document.body.appendChild(logdiv);
	} catch (e) {
		tfgs.error(e);
	}
};
