try {
	tfgs.saveload.browser.load(step2);

	function step2() {
		try {
			tfgsdata = JSON.parse(tfgsdata);
		} catch (e) {
			tfgsdata = null;
		}
		if (tfgsdata === null) tfgsdata = {};
		if (!("config" in tfgsdata)) tfgsdata.config = {};
		tfgs.optionconf = tfgsdata.config;

		tfgs.functionsload();

		tfgs.setting.showbutton();
	}
} catch (e) {
	alert(e.message);
	throw e;
}
