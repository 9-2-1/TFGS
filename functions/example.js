let oldtitle;
tfgs.func.add({
	id: "example",
	name: "自定义窗口标题", // 设定功能名字
	author: "作者名字", // 设定作者(可选)
	version: "v0.1.0", // 设定版本(可选)
	info: "让你能够修改窗口的标题", // 设定说明(可选)
	default: false, // 是否默认启用
	option: { // 设定选项列表
		"title": { // 选项变量名
			"type": "text", // 选项类型，text 文字，number数字，check 复选框(开关)，select 选项列表
			"name": "窗口标题", // 选项旁边的文字
			"maxlength": 16, // 设定文本最大长度
			// "max": 9, // 数字最大值
			// "min": 1, // 数字最小值
			// "menu": ["a", "b", "c"], // 选项列表
			// "value": [1, 2, 3], // 选项对应的数值
			"default": "示例标题" // 默认值
		}
		// 可以添加更多内容
	},
	onenable: function(api) {
		oldtitle = document.title;
		document.title = api.getoption().title;
	},
	ondisable: function(api) {
		document.title = oldtitle;
	},
	// onoption 只有在功能启用时改选项才触发
	onoption: function(api) {
		document.title = api.getoption().title;
	}
});
