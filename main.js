try {
	tfgs.func.init();
	tfgs.saveload.storage.load().then(function() {
		tfgs.func.startup();
		tfgs.setting.showbutton();
	});
} catch (e) {
	tfgs.error(e);
}
