tfgs.log = {};

tfgs.log.list = [];

// 自动更新计时器id
tfgs.log.dispIntv = null;

// 添加记录，color颜色，name拓展名字，log记录内容
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

// 清楚记录
tfgs.log.clear = function() {
	tfgs.log.list = [];
	tfgs.log.changed = true;
};

// 自动更新，div显示元素，fliter筛选
tfgs.log.displayInterval = function(div, fliter) {
	tfgs.log.display(div, fliter);
	tfgs.log.changed = false;
	return setInterval(function() {
		let x = div.scrollX,
			y = div.scrollY;
		if (tfgs.log.changed) {
			div.innerHTML = "";
			if (tfgs.log.display(div, fliter)) {
				tfgs.log.logwin.flash(500, 3, true);
			}
			tfgs.log.changed = false;
		}
		div.scrollX = x;
		div.scrollY = y;
	}, 100);
};

// 更新显示，div显示元素，fliter筛选
tfgs.log.display = function(div, fliter) {
	let empty = true;
	div.classList.add("tfgsLogFormat");
	for (let i in tfgs.log.list) {
		let log1 = tfgs.log.list[i];
		if (fliter.name === null || fliter.name.includes(log1.name))
			if (fliter.color === null || fliter.color.includes(log1.color)) {
				let eline = tfgs.element.create("div");
				eline.style.color = log1.color;
				eline.innerText = log1.name + "\t" + log1.log;
				div.appendChild(eline);
				empty = false;
			}
	}
	return !empty;
};

// 显示窗口
tfgs.log.create = function(x, y) {
	try {
		if (tfgs.log.dispIntv !== null) {
			tfgs.log.logwin.movetotop();
			tfgs.log.logwin.flash(200, 3, false);
			return;
		}
		let logwin = tfgs.log.logwin = tfgs.window.create({
			title: "日志",
			x: typeof x === "number" ? x : 20,
			y: typeof y === "number" ? y : 20,
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
