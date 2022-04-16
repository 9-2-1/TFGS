function eleid(id) {
	return document.getElementById(id);
}
try {
	tfgs.optioninfo = {
		"-tfgs-": {
			"name": "TFGS ##", // ##
			"author": "TFGS ##", // ##
			"version": "TFGS ##", // ##
			"options": { // ##
				"text": {
					"type": "text",
					"name": "text field",
					"info": "This is a text field",
					"default": "hello, world!",
					"onchange": function(value) {
						if (value.length > 8) {
							throw "value is too long"; // ##
						} else if (value.length === 0) {
							return "##"; // ##
						} else {
							return null;
						}
					}
				},
				"check": {
					"type": "check",
					"name": "checkbox",
					"info": "This is a checkbox",
					"default": true,
					"onchange": function(value) {
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
							"value": 1,
							"name": "large",
							"info": "50x50"
						},
						{
							"value": 2,
							"name": "medium",
							"info": "30x30"
						},
						{
							"value": 3,
							"name": "small",
							"info": "10x10"
						}
					],
					"default": 1
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
					"type": "tip",
					"name": "This is a tip"
				}
			}
		}
	};

	eleid("show").addEventListener("click", function() {
		tfgs.setting.showbutton();
	})
	eleid("hide").addEventListener("click", function() {
		tfgs.setting.hidebutton();
	})
} catch (e) {
	alert(e.message);
}
