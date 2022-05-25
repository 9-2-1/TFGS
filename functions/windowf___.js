let windowf___;
tfgs.func.add({
	id: "windowf___",
	name: "window f___",
	onenable: function(_api) {
		windowf___ = [];
		newwin();
	},
	ondisable: function() {
		for (let i in windowf___) {
			windowf___[i].onClose = function() {};
			windowf___[i].close();
		}
	},
	onoption: function() {}
});

function newwin() {
	let win = tfgs.window.create({
		title: "Teriteri",
		canMaximize: false,
		canMinimize: false,
		canResize: false,
		height: 130,
		width: 130,
		onClose: conti
	});
	win.innerDiv.style = "vertical-align:middle;text-align:center;font-size:80px;";
	win.innerDiv.innerText = "☆";
	windowf___.push(win);
}

function conti() {
	windowf___.splice(windowf___.indexOf(this), 1);
	newwin();
	newwin();
}
