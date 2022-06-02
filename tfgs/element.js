tfgs.element = {};

tfgs.element.create = function(tagName, className, type) {
	let ele = document.createElement(tagName);
	if (className !== undefined) ele.className = className;
	ele.className = className;
	if (type !== undefined) ele.type = type;
	return ele;
};
