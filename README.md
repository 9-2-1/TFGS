# TFGS

目前做了一个类似Scratch Addons的拓展管理器模板，可以启用或者禁用功能，设定功能的参数。

# 格式

功能文件放在`functions/`文件夹里。

`*.css`文件：定义给拓展用的样式表(无论拓展是否启用都会生效，因此请在需要用到的css类型名前加上前缀防止冲突。

`*.js`文件：定义功能内容，使用tfgsinfo变量

例子：

``` javascript
tfgsinfo.name = "自定义窗口标题"; // 设定功能名字
tfgsinfo.author = "作者名字"; // 设定作者(可选)
tfgsinfo.info = "让你能够修改窗口的标题"; // 设定说明(可选)
tfgsinfo.enabledefault = false, // 是否默认启用
tfgsinfo.options = { // 设定选项列表
	"title": { // 选项变量名
		"type": "text", // 选项类型，text 文字，check 复选框(开关)，select 单选框(多个选项)
		"name": "窗口标题", // 选项旁边的文字
		"info": "不可超过 16 个字", // 选项说明(可选)
		"number": false, // 设定这里的内容是否为数字
		"default": "example", // 默认值
		"check": function(value){ // 验证用的函数(可选)
			if(value.length > 16){
				throw "标题长度太长"; // 当不符合的时候，throw一段文字，使文本不被保存(只能在type:text的时候用，不要new Error，否则将视为拓展本身的错误)
			} else if(value.length === 0){
				return "请设定标题"; // 当不恰当的时候，返回字符串，让用户能够看到提示，但不会阻止选项被保存
			} else {
				return null; // 没有问题
			}
		}
	}
	// 可以添加更多内容
};
tfgsinfo.onenable = function() {
/* 启用的时候，添加内容，事件等 */
};
tfgsinfo.ondisable = function() {
/* 禁用的时候，移除内容，事件等 */
};
tfgsinfo.onoption = function(option) {
/* 选项修改的时候，做出反应
   选项也可以用 tfgsinfo.getoption() 获取 */
};
```

# 注意

目前`functions/`文件夹里的`*.css`文件会全部生效，无论拓展是否启用。

有可能onenable，ondisable会被多次重复调用，也就是说，启用之后onenable可能被再次调用，禁用之后ondisable可能会被再次调用。

onoption哪怕在拓展被禁用的时候修改设置也会被调用。
