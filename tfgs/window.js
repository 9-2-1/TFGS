tfgs.window = {};

tfgs.window.create = function(options) {
	let windowobj = {
		titleDiv: null,
		innerDiv: null,
		windowDiv: null,
		top: 0,
		left: 0,
		height: 300,
		width: 300,
		margin: 0,
		isMinimize: false,
		isMaximize: false,
		canMinimize: true,
		canMaximize: true,
		canClose: true,
		canResize: true,
		canMove: true,
		onMinimize: function() {},
		onMaximize: function() {},
		onClose: function() {},
		onResize: function() {},
		onMove: function() {},
		minimize: function() {},
		maximize: function() {},
		close: function() {},
		resize: function() {},
		move: function() {}
	};

	let windowDiv = element("div", "tfgsWindow");
	windowDiv.innerHTML = `
<div class="tfgsWindowTitle">
	<span>≡</span>
	<span class="tfgsWindowText">Titkjvhkvkvojvpjv9jvojbole</span>
	<span>_</span>
	<span>▭</span>
	<span>□</span>
	<span>✕</span>
</div>
<div class="tfgsWindowContent"></div>
<div class="tfgsWindowResize"></div>
`;
	document.body.appendChild(windowDiv);
};
