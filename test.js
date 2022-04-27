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

try {
	fin();
} catch (e) {
	err(e);
}
