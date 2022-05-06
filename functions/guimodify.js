! function() {
	let api;
	let buttons = {};
	let status = {};
	let element = null;
	tfgs.func.add({
		id: "guifold",
		name: "折叠展开按钮",
		info: "添加可以折叠舞台、角色，展开列表等区域的按钮",
		option: {
			foldstage: {
				type: "check",
				name: "折叠菜单栏",
				default: true
			},
			foldsprite: {
				type: "check",
				name: "折叠舞台和角色",
				default: true
			},
			foldsetting: {
				type: "check",
				name: "折叠角色设置",
				default: true
			},
			foldstage: {
				type: "check",
				name: "折叠舞台按钮",
				default: true
			},
			expandlist: {
				type: "check",
				name: "展开造型/声音列表",
				default: true
			},
		},
		onenable: function(_api) {
			api = _api;
			if (element === null) {
				api.info("尝试获取元素");
				element = {
					foldstage: ""
				}
			}
		},
		ondisable: function() {},
		onoption: function() {}
	});
}();
