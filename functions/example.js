tfgsinfo.name = "example";
tfgsinfo.author = "abcd";
tfgsinfo.info = "set title to example";
tfgsinfo.options = {};
let oldtitle;
let _prevEnable = false;
tfgsinfo.onenable = function() {
	if (!_prevEnable) {
		oldtitle = document.title;
		document.title = "example";
		_prevEnable = true;
	}
};
tfgsinfo.ondisable = function() {
	if (_prevEnable) {
		document.title = oldtitle;
		_prevEnable = false;
	}
};
