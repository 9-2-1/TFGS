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

function getVM() {
	return getStore().getState().scratchGui.vm;
}

function getPaintState() {
	return getStore().getState().scratchPaint;
}
