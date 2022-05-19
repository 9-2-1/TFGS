! function() {
	let api = null;
	let interval = -1;
	let shown = false;

	function getReactInternel(elem) {
		let keys = Object.keys(elem);
		let rII = null;
		for (let i in keys)
			if (keys[i].slice(0, 24) === "__reactInternalInstance$")
				rII = keys[i];
		if (rII === null)
			throw new Error("reactInternelInstance not found");
		return rII;
	}

	// 获取 redux store, 里面有vm和绘画参数
	function getStore() {
		let gp = document.querySelector('[class^=gui_page-wrapper_]');
		let keys = Object.keys(gp);
		let rII = null;
		for (let i in keys)
			if (keys[i].slice(0, 24) === "__reactInternalInstance$")
				rII = keys[i];
		if (rII === null)
			throw new Error("reactInternelInstance not found");
		let st = gp[rII].child.stateNode.store;
		// st.getState().scratchGui.vm; -- vm
		// st.getState().scratchPaint.color.
		// fillColor strokeColor strokeWidth gradientType primary secondary
		// SOLID VERTICAL HORIZONTAL RADIAL

		// st.dispatch({type: "xxx", ...args})
		return st;
	}

	function forcesetcolor(id, data) {
		// step 1
		let div = selectElement("paint-editor_editor-container-top_")
		div = div.children[1].children[0].children[id];
		let key = getReactInternel(div);
		let stateNode = div[key].return.return.return.stateNode;
		stateNode.handleChangeGradientType(data.gradientType);
		stateNode.props.onChangeColorIndex(0);
		stateNode.handleChangeColor(data.primary);
		if (data.gradientType !== "SOLID") {
			stateNode.props.onChangeColorIndex(1);
			stateNode.handleChangeColor(data.secondary);
		}
		stateNode.handleCloseColor();
		stateNode.props.onUpdateImage();

		// step 2
		let st = getStore();
		let color = st.getState().scratchPaint.color;
		let colid = id === 1 ? "strokeColor" : "fillColor";
		color[colid].gradientType = data.gradientType;
		color[colid].primary = data.primary;
		color[colid].secondary = data.secondary;
		let vm = st.getState().scratchGui.vm;
		vm.refreshWorkspace();
	}

	function selectElement(namebegin) {
		return document.querySelector(`[class^=${namebegin}],[class*= ${namebegin}]`);
	}

	function showwindow(id) {
		if (shown) return;
		let win = document.createElement("div");
		win.innerHTML = `
<div class="tfgsForcecolorWindow">
	<input type="text" value="0"></input><br/>
	<input type="text" value="#00ff00"></input><br/>
	<input type="text" value="#ff0000"></input><br/>
	<input type="text" value="SOLID"></input><br/>
	<input type="button" value="PUSH"></input>
</div>
`;
		document.body.appendChild(win);
		win.style = "position:fixed;height:100px;width:100px;left:50px;top:50px;overflow:scroll;background:green;z-index:200000;";
		let ins = win.children[0].children;
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
		shown = true;
	}

	function scanner() {
		showwindow();
	}

	function stopscan() {

	}

	tfgs.func.add({
		id: "forcecolor",
		name: "qiangxinshezhitoumingyanse",
		onenable: function(_api) {
			api = _api;
			if (interval === -1) interval = setInterval(scanner, 100);
		},
		ondisable: function() {
			if (interval !== -1) {
				clearInterval(interval);
				interval = -1;
			};
			stopscan();
		},
		onoption: function() {}
	})
}();
