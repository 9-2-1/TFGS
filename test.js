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
	tfgs._func = {
		"abc": function(tfgsinfo) {
			tfgsinfo.name = "xyz";
			tfgsinfo.default = false;
			tfgsinfo.options = {
				"aaa": {
					"type": "text",
					"default": "abc"
				}
			};
		}
	}
	// init, default
	tfgs.func.init();
	// getoption
	let options = tfgs.func.getoptions();
	//result += inspect(options);
	test(options.abc._enable, false, 1);
	test(options.abc.aaa, "abc", 2);
	// setoption
	tfgs.func.setoptions({
		"abc": {
			"aaa": "ddd"
		}
	});
	test(options.abc.aaa, "ddd", 3);
	fin();
} catch (e) {
	err(e);
}
