! function() {
	let api = null;
	let interval = -1;

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
		let st = getStore();
		let color = st.getState().scratchPaint.color;
		color[id].gradientType = data[0];
		color[id].primary = data[1];
		color[id].secondary = data[2];
		let vm = st.getState().scratchGui.vm;
		vm.refreshWorkspace();
	}

	function showwindow() {
		let win = document.createElement("div");
		win.innerHTML = `
<div class="tfgsForcecolorWindow">
	<div class="tfgsForcecolorPicker">
		<div class="tfgsForcecolorH">
		</div>
		<div class="tfgsForcecolorSL">
		</div>
	</div>
	<div class="tfgsForcecolorList">
	</div>
</div>
`;
	}

	function scanner() {

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
