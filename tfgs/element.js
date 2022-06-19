tfgs.element = {};

// 新建HTML元素, tagName元素类型，className css类型名(可省略), type 输入类型(可省略)（针对<input>）
tfgs.element.create = function(tagName, className, type) {
	let ele = document.createElement(tagName);
	if (className !== undefined) ele.className = className;
	ele.className = className;
	if (type !== undefined) ele.type = type;
	return ele;
};
