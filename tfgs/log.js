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
			tfgs.log.logwin.movetotop();
			return;
		}
		let logwin = tfgs.log.logwin = tfgs.window.create({
			title: "日志",
			width: 200,
			height: 200,
			minWidth: 100,
			minHeight: 50,
			minimizeWidth: 70
		});
		let logdiv = logwin.innerDiv;
		logdiv.innerHTML = `
<div class="tfgsLogContent"></div>
<div class="tfgsLogButtons">
	<span class="tfgsButton tfgsRight">清空</span>
</div>
`;
		let contentdiv = logdiv.children[0];
		let buttondiv = logdiv.children[1];
		let bclear = buttondiv.children[0];
		tfgs.log.dispIntv = tfgs.log.displayInterval(contentdiv, {
			"name": null,
			"color": null
		});
		bclear.addEventListener("click", function() {
			tfgs.log.clear();
		});
		logwin.onClose = function() {
			clearInterval(tfgs.log.dispIntv);
			logdiv.remove();
			tfgs.log.dispIntv = null;
		};
	} catch (e) {
		tfgs.error(e);
	}
};
