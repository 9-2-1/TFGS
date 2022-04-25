tfgs.functionsload = function() {
	tfgs.optioninfo = {};

	tfgs.optioninfo["-tfgs-"] = {
		"name": "TFGS 配置", // ##
		"author": "TFGS", // ##
		"version": "v0.1.0", // ##
		"info": "点击左上角的对勾打开或者关闭整个插件",
		"enabledefault": true,
		"options": { // ##
			"website": {
				"type": "text",
				"name": "在这些网站自动启用",
				"info": "只需要输入域名，例如scratch.abc.xyz\n多个域名请用分号隔开",
				"number": false,
				"default": "scratch.mit.edu;kada.163.com;aerfaying.com;gitblock.cn;ccw.site;codingclip.com;world.xiaomawang.com;",
				"check": function(value) {
					if (value.length === 0) {
						return "如果不提供启动列表，将尝试在任何页面启用。"; // ##
					} else if (value.includes('*') || value.includes('?')) {
						return "注意：目前不支持通配符";
					} else {
						return null;
					}
				}
			},
			"export": {
				"type": "button",
				"name": "导出设置",
				"onclick": function() {
					let a = document.createElement("a");
					a.href = "data:text/plain;charset:utf-8," + JSON.stringify(tfgs.optionconf);
					a.download = "tfgs-config.json";
					a.click();
				}
			},
			"import": {
				"type": "button",
				"name": "导入设置",
				"onclick": function() {
					let a = document.createElement("input");
					a.type = "file";
					a.addEventListener("change", function(event) {
						if (a.files.length > 0) {
							let f = new FileReader();
							f.addEventListener("load", function(event) {
								try {
									let newconf = JSON.parse(f.result.toString());
									tfgs.optionconf = newconf;
									tfgs.setting.setoption();
									for (let name in tfgs.optioninfo) {
										if (name in tfgs.optionconf && tfgs.optionconf[name]._enabled)
											tfgs.optioninfo[name].onenable();
										else
											tfgs.optioninfo[name].ondisable();

										let change = tfgs.optioninfo[name].onoption;
										if (typeof change === "function")
											change(tfgs.optionconf[name]);
									}
									alert("设置导入成功");
								} catch (e) {
									alert("设定错误：" + e.message);
								}
							});
							f.readAsBinaryString(a.files[0]);
						}
					});
					a.click();
				}
			},
			"editjson": {
				"type": "button",
				"name": "编辑设置文本",
				"onclick": function() {
					let newconf = prompt("复制这里的文字导出配置，或者在这里粘贴导入", JSON.stringify(tfgs.optionconf));
					if (newconf !== null && newconf !== "") {
						try {
							newconf = JSON.parse(newconf);
							tfgs.optionconf = newconf;
							tfgs.setting.setoption();
							for (let name in tfgs.optioninfo) {
								if (name in tfgs.optionconf && tfgs.optionconf[name]._enabled)
									tfgs.optioninfo[name].onenable();
								else
									tfgs.optioninfo[name].ondisable();

								let change = tfgs.optioninfo[name].onoption;
								if (typeof change === "function")
									change(tfgs.optionconf[name]);
							}
						} catch (e) {
							alert("设定错误：" + e.message);
						}
					}
				}
			}
		},
		"onenable": function() {},
		"ondisable": function() {},
		"onoption": function() {}
	};

	for (let name in tfgs._functions) {
		let tfgsinfo = {};
		tfgsinfo.getoption = function() {
			return tfgs.optionconf[name];
		};
		tfgs._functions[name](tfgsinfo);
		tfgs.optioninfo[name] = tfgsinfo;
		if (name in tfgs.optionconf && tfgs.optionconf[name]._enabled)
			tfgs.optioninfo[name].onenable();
	}
	tfgs.setting._enablefunction = function(funcname, enable) {
		if (enable) tfgs.optioninfo[funcname].onenable();
		else tfgs.optioninfo[funcname].ondisable();
	};
};
