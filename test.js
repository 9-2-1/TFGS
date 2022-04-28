let result = "";

function test(a, b, c) {
	if (a !== b) {
		result += c + ":" + JSON.stringify(a) + "!=" + JSON.stringify(b) + "\n";
	}
}

function err(e) {
	result += e.message;
	document.getElementById('test').value = result;
	throw e;
}

function fin() {
	result += "finish";
	document.getElementById('test').value = result;
}

function element(tagname, classname, type) {
	let ele = document.createElement(tagname);
	if (isstr(classname)) ele.className = classname;
	if (isstr(type)) ele.type = type;
	return ele;
}

try {
	tfgs.log.add("test", "#0202ff", "i  have been <b>fjej</b>,once.");
	let elog = element("div");
	tfgs.log.display(elog);
	document.body.appendChild(elog);
	fin();
} catch (e) {
	err(e);
}
