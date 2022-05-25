let windowf___;
tfgs.func.add({
	id: "windowf___",
	name: "window f___",
	onenable: function(_api) {
		windowf___ = [];
		windowf___.push(tfgs.window.create({
			title: "Grow",
			canMaximize: false,
			canMinimize: false,
			canResize: false,
			height: 130,
			width: 130,
			onClose: conti
		}));
	},
	ondisable: function() {
		for (let i in windowf___) {
			windowf___[i].onClose = function() {};
			windowf___[i].close();
		}
	},
	onoption: function() {}
});

function conti() {
	windowf___.splice(windowf___.indexOf(this), 1);
	windowf___.push(tfgs.window.create({
		title: "grow",
		canMaximize: false,
		canMinimize: false,
		canResize: false,
		height: 130,
		width: 130,
		onClose: conti
	}));
	windowf___.push(tfgs.window.create({
		title: "grow",
		canMaximize: false,
		canMinimize: false,
		canResize: false,
		height: 130,
		width: 130,
		onClose: conti
	}));
}
