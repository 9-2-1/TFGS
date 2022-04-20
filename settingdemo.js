function eleid(id) {
	return document.getElementById(id);
}
try {
	tfgs.optioninfo = {
		"-tfgs-": {
			"name": "TFGS TFGS", // ##
			"author": "TFGS ABC", // ##
			"version": "TFGS 123", // ##
			"enabledefault": true,
			"optionchange": function(newoption) {
				eleid("test").value = inspect(newoption);
			},
			"options": { // ##
				"text": {
					"type": "text",
					"name": "text field",
					"info": "This is a text field",
					"number": false,
					"default": "hello, world!",
					"check": function(value) {
						if (value.length > 16) {
							throw "value is too long"; // ##
						} else if (value.length === 0) {
							return "##"; // ##
						} else {
							return null;
						}
					}
				},
				"text2": {
					"type": "text",
					"name": "text field",
					"info": "This is a 8 text field",
					"number": false,
					"default": "abcdefgh",
					"check": function(value) {
						if (value.length > 8) {
							throw "value is too long"; // ##
						} else if (value.length === 0) {
							return "##"; // ##
						} else {
							return null;
						}
					}
				},
				"textnumapt": {
					"type": "text",
					"name": "number field",
					"info": "This is a number field",
					"number": true,
					"default": 50,
					"check": function(value) {
						if (isNaN(value)) {
							throw "value is not a number"; // ##
						} else if (value < 0) {
							return "less than 0"; // ##
						} else {
							return null;
						}
					}
				},
				"checkerr": {
					"type": "check",
					"name": "checkbox",
					"info": "This is a checkbox",
					"default": true,
					"check": function(value) {
						if (!value) {
							return "Attention: if you enable it, it will be enabled."; // ##
						} else {
							return null;
						}
					},
				},
				"check": {
					"type": "check",
					"name": "checkbox",
					"info": "This is a checkbox",
					"default": true,
					"check": function(value) {
						if (value) {
							return "Attention: if you enable it, it will be enabled."; // ##
						} else {
							return null;
						}
					},
				},
				"select": {
					"type": "select",
					"name": "select items",
					"info": "This is a list of options",
					"options": [{
							"value": "1",
							"name": "large",
							"info": "50x50"
						},
						{
							"value": "2",
							"name": "medium",
							"info": "30x30"
						},
						{
							"value": "3",
							"name": "small",
							"info": "10x10"
						}
					],
					"default": "1",
					"check": function(value) {
						switch (value) {
							case "1":
								return "Maybe too large."; // ##
							default:
								return null;
						}
					},
				},
				"button": {
					"type": "button",
					"name": "This is a button",
					"info": "info...",
					"onclick": function() {
						alert("clicked");
					}
				},
				"tips": {
					"type": "tips",
					"name": "This is a tip"
				}
			}
		}
	};

	tfgs.optionconf = {};

	tfgs.functions = {};

	tfgs.functions.enablefunction = function(funcname) {
		eleid("test").value = inspect(tfgs.optionconf[funcname]);
	};

	eleid("show").addEventListener("click", function() {
		tfgs.setting.showbutton();
	})
	eleid("hide").addEventListener("click", function() {
		tfgs.setting.hidebutton();
	})

	tfgs.setting.showbutton();
	tfgs.setting.button.click();
} catch (e) {
	alert(e.message);
	console.log(e);
}
