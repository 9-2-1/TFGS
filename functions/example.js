tfgsinfo.name = "自定义窗口标题"; // 设定功能名字
tfgsinfo.author = "作者名字"; // 设定作者(可选)
tfgsinfo.version = "v0.1.0"; // 设定版本(可选)
tfgsinfo.info = "让你能够修改窗口的标题"; // 设定说明(可选)
tfgsinfo.enabledefault = false; // 是否默认启用
tfgsinfo.options = { // 设定选项列表
	"title": { // 选项变量名
		"type": "text", // 选项类型，text 文字，check 复选框(开关)，select 单选框(多个选项)
		"name": "窗口标题", // 选项旁边的文字
		"info": "不可超过 16 个字", // 选项说明(可选)
		"number": false, // 设定这里的内容是否为数字
		"default": "示例标题", // 默认值
		"check": function(value) { // 验证用的函数(可选)
			if (value.length > 16) {
				throw "标题长度太长"; // 当不符合的时候，throw一段文字，使文本不被保存(只能在type:text的时候用，不要new Error，否则将视为拓展本身的错误)
			} else if (value.length === 0) {
				return "请设定标题"; // 当不恰当的时候，返回字符串，让用户能够看到提示，但不会阻止选项被保存
			} else {
				return null; // 没有问题
			}
		}
	}
	// 可以添加更多内容
};
let oldtitle;
let _prevEnable = false;
tfgsinfo.onenable = function() {
	if (!_prevEnable) {
		oldtitle = document.title;
		document.title = tfgsinfo.getoption().title;
		_prevEnable = true;
	}
};
tfgsinfo.ondisable = function() {
	if (_prevEnable) {
		document.title = oldtitle;
		_prevEnable = false;
	}
};
tfgsinfo.onoption = function(option) {
	if (_prevEnable) {
		document.title = option.title;
	}
};
