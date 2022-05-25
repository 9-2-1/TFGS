let tfgswindow = tfgs.window.create({
	title: "example",
	canMaximize: true,
	canMinimize: true,
	canMove: true,
	canResize: true,
	canClose: true,
	x: 20,
	y: 20,
	width: 200,
	height: 200,
	minWidth: 100,
	minHeight: 0,
	cnt: 0,
	onMove: function() {
		this.title = (this.isMinimize ? "Minimized" : this.isMaximize ? "Maximized" : "Moved") + ` (${Date()} x${++this.cnt}`;
		this._refresh();
	},
	onResize: function() {
		this.title = (this.isMinimize ? "Minimized" : this.isMaximize ? "Maximized" : "Resized") + ` (${Date()} x${++this.cnt}`;
		this._refresh();
	},
	onClose: function() {
		return confirm("X ?");
	},
});

/*
tfgswindow.title = "ABCDEFG";
tfgswindow.canMaximize = false;
tfgswindow._refresh();

tfgswindow.titleDiv; // Element

tfgswindow.close();
tfgswindow.maximize();
tfgswindow.minimize();
tfgswindow.move(x, y);
tfgswindow.resize(width, height);

*/
