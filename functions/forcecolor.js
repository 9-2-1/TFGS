! function() {
	let api = null;
	let interval = -1;
	let winob = null;

	function forcesetcolor(id, data) {
		// 强行发送颜色更改
		let div = api.selele("paint-editor_editor-container-top_")
		//id: 0填充 1轮廓
		div = div.children[1].children[0].children[id];
		let stateNode = api.reactInternal(div).return.return.return.stateNode;

		// 找到 stateNode 后，可以访问并执行react回调函数
		// 经过尝试和查看scratch源代码可以发现这些函数可以修改颜色
		stateNode.handleChangeGradientType(data.gradientType);
		// 改左颜色
		stateNode.props.onChangeColorIndex(0);
		stateNode.handleChangeColor(data.primary);
		// 如果需要改右颜色，就改右颜色
		// 如果在纯色模式下还去改右颜色会变成改左颜色，因此要特判
		if (data.gradientType !== "SOLID") {
			stateNode.props.onChangeColorIndex(1);
			stateNode.handleChangeColor(data.secondary);
		}
		// 象征性地
		stateNode.handleCloseColor();
		// 更改颜色后，如果有选中的项，它们会改变颜色，调用onUpdateImage提交造型的修改以免丢失。
		stateNode.props.onUpdateImage();

		// 如果设置的颜色包含透明度，在颜色通过方法一传播到最后的时候会被检查函数拦下，导致当前颜色没有改变（但是选中元素的颜色会正常改变），此时使用方法二
		let vm = api.vm();
		let color = tfgs.funcapi.paint().color;
		// 强行改变color的值，这在redux中很不规范，但是有效
		let colid = id === 1 ? "strokeColor" : "fillColor";
		color[colid].gradientType = data.gradientType;
		color[colid].primary = data.primary;
		color[colid].secondary = data.secondary;
		// 关键：调用refreshWorkspace直接刷新工作区，此时当前颜色完美改变。
		vm.refreshWorkspace();
	}

	function showwindow() {
		if (winob !== null) {
			return;
		}
		winob = tfgs.window.create({
			title: "forceColor",
			haveLogo: false,
			canClose: false,
			canMaximize: false,
			x: 100,
			y: 80,
			width: 250,
			height: 160,
			minWidth: 120,
			minHeight: 120
		});
		let win = tfgs.element.create("div", "tfgsForcecolorWin");
		win.innerHTML = `
类型: <select>
	<option value="0">填充颜色</option>
	<option value="1">轮廓颜色</option>
</select><br/>
颜色1: <input type="text" value="#00ff00"></input><br/>
颜色2: <input type="text" value="#ff0000"></input><br/>
混合模式: <select>
	<option value="SOLID">■</option>
	<option value="VERTICAL">↓</option>
	<option value="HORIZONTAL">→</option>
	<option value="RADIAL">○</option>
</select><br/>
<input type="button" value="设置"></input>
<pre>颜色格式: #RRGGBB 或者 rgb(红色, 绿色, 蓝色)
透明颜色: #RRGGBBAA 或者 rgba(红色, 绿色, 蓝色, 不透明度)</pre>
`;
		let ins = win.children;
		ins[8].addEventListener("click", function() {
			try {
				forcesetcolor(Number(ins[0].value), {
					primary: ins[2].value,
					secondary: ins[4].value,
					gradientType: ins[6].value
				});
			} catch (e) {
				api.onerror(e);
			}
		});
		winob.innerDiv.appendChild(win);
	}

	function scanner() {
		showwindow();
	}

	function stopscan() {
		if (winob !== null) {
			winob.close();
			winob = null
		}
	}

	tfgs.func.add({
		id: "forcecolor",
		name: "强行设定颜色",
		onenable: function(_api) {
			api = _api;
			if (interval === -1) interval = setInterval(scanner, 100);
		},
		ondisable: function() {
			if (interval !== -1) {
				clearInterval(interval);
				interval = -1;
			}
			stopscan();
		},
		onoption: function() {}
	});
}();
