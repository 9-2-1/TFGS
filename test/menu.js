try {
	tfgs.func.add({
		"id": "kkk",
		"name": "abc",
		"option": {
			"a": {
				"name": "asd",
				"type": "text",
				"default": "abc"
			},
			"b": {
				"name": "nfk",
				"type": "check",
				"default": true
			},
			"c": {
				"name": "mdj",
				"type": "menu",
				"menu": ["aa", "bb"],
				"value": [1, 2],
				"default": 2
			}
		},
		"default": true,
		"onenable": function(api) {
			api.info("Extension enabled");
			let option = api.getoption();
			api.log("Option: " + JSON.stringify(option));
		},
		"ondisable": function(api) {
			api.info("Extension disabled");
		},
		"onoption": function(api) {
			api.info("Option changed");
			let option = api.getoption();
			api.log("Option: " + JSON.stringify(option));
		}
	});
	tfgs.data.load().then(function() {
		tfgs.menu.create();
	}).catch(tfgs.error);
} catch (e) {
	tfgs.error(e);
}
