tfgs.button = {};

tfgs.button.button = null;

tfgs.button.create = function() {
	try {
		if (tfgs.button.button !== null)
			return;
		let element = function(tagName, className, type) {
			let ele = document.createElement(tagName);
			if (className !== undefined) ele.className = className;
			ele.className = className;
			if (type !== undefined) ele.type = type;
			return ele;
		};
		let button = tfgs.button.button = element("div", "tfgsButton");
		button.innerText = "插件选项";
		button.style.position = "fixed";
		button.style.left = "20px";
		button.style.top = "20px";
		button.style.zIndex = "100000000";
		let ox, oy, od, dx, dy, dm = false;
		let _px = function(x) {
			return Number(x.slice(0, -2));
		};
		let dragstart = function(x, y) {
			ox = x;
			oy = y;
			od = false;
			dx = x - _px(button.style.left);
			dy = y - _px(button.style.top);
			dm = true;
		};
		let dragmove = function(x, y) {
			if (dm) {
				if (!od)
					if (ox !== x || oy !== y) od = true;
				button.style.left = x - dx + "px";
				button.style.top = y - dy + "px";
				return true;
			}
			return false;
		};
		let dragend = function() {
			if (dm) {
				dm = false;
				if (!od) tfgs.menu.create();
			}
		};
		button.addEventListener("mousedown", function(event) {
			dragstart(event.clientX, event.clientY);
			event.preventDefault();
		});
		button.addEventListener("touchstart", function(event) {
			dragstart(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
		});
		window.addEventListener("mousemove", function(event) {
			if (dragmove(event.clientX, event.clientY))
				event.preventDefault();
		});
		button.addEventListener("touchmove", function(event) {
			if (dragmove(event.targetTouches[0].clientX, event.targetTouches[0].clientY))
				event.preventDefault();
		});
		button.addEventListener("touchend", function(event) {
			dragend();
		});
		window.addEventListener("mouseup", function(event) {
			dragend();
		});
		window.addEventListener("mouseleave", function(event) {
			dragend();
		});
		document.body.appendChild(button);
	} catch (e) {
		tfgs.error(e);
	}
};
