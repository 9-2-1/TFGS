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

tfgs.log.display = function(div) {
	div.classList.add("-tfgs-log");
	for (let i in tfgs.log.list) {
		let eline = element("div");
		let log1 = tfgs.log.list[i];
		eline.style.color = log1.color;
		eline.innerText = log1.name + "\t" + log1.log;
		div.appendChild(eline);
	}
};
