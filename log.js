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

tfgs.log.add = function(name, color, log) {
	tfgs.log.list.push({
		name: name,
		color: color,
		log: log
	});
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
	div.classList.add("-tfgs-log");
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
