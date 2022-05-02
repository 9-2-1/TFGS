let result = "";

function test(n, a, b) {
	if (a !== b) {
		result += n + ":" + a + "=" + JSON.stringify(a) + "!=" + b + "=" + JSON.stringify(b) + "\n";
	}
}

function err(e) {
	result += "Error: " + e.message;
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
	// object_format
	test("of001", object_format("a", "string"), "a");
	test("of002", object_format(123, "string"), "123");
	test("of003", object_format(123, "string!"), "");
	test("of004", object_format(123, "string?"), undefined);
	test("of005", object_format(true, "string"), "true");
	test("of006", object_format("1234", "number"), 1234);
	test("of007", Object.is(object_format("abc", "number"), NaN), true);
	test("of008", object_format("1234", "number!"), 0);
	test("of009", object_format("a", "boolean"), true);
	test("of010", object_format("a", "boolean!"), false);
	test("of011", object_format("a", "boolean?"), undefined);
	test("of012", JSON.stringify(object_format([1, 2, 3], "object")), "{\"0\":1,\"1\":2,\"2\":3}");
	test("of013", JSON.stringify(object_format({
		a: 1,
		b: 2,
		c: {
			d: "a",
			f: true
		}
	}, {
		a: "!",
		b: "0!",
		c: {
			e: "false!",
			f: "string!"
		}
	})), "{\"a\":\"\",\"b\":2,\"c\":{\"e\":false,\"f\":\"\"}}");
	// func
	tfgs.func.add({
		"id": "kkk",
		"name": "abc",
		"option": {},
		"default": true,
		"onenable": function(api) {
			api.log(123);
			api.error(456);
			api.info(789);
			api.warn(0);
		},
		"ondisable": function(api) {api.log("disa");},
		"onoption": function(api) {api.log("option");}
	});
	tfgs.func.default();
	tfgs.data.setjson("{}");
	tfgs.data.edit().then(function() {
		// log
		let elog = element("div");
		tfgs.log.display(elog, {
			"name": null,
			"color": null
		});
		document.body.appendChild(elog);
		fin();
	}).catch(err);
} catch (e) {
	err(e);
}
