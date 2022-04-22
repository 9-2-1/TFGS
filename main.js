try {

	tfgs.saveload.load(step2);

	function step2(tfgsdata) {
		try {
			tfgsdata = JSON.parse(tfgsdata);
		} catch (e) {
			tfgsdata = null;
		}
		if (tfgsdata === null) tfgsdata = {};
		if (!("config" in tfgsdata)) tfgsdata.config = {};
		tfgs.optionconf = tfgsdata.config;

		tfgs.optioninfo = {};
		for (let name in tfgs._functions) {
			let tfgsinfo = {};
			tfgsinfo.getoption = function() {
				return tfgs.optionconf[name];
			};
			tfgs._functions[name](tfgsinfo);
			tfgs.optioninfo[name] = tfgsinfo;
			if (name in tfgs.optionconf && tfgs.optionconf[name]._enabled)
				tfgs.optioninfo[name].onenable();
		}
		tfgs.setting._enablefunction = function(funcname, enable) {
			if (enable) tfgs.optioninfo[funcname].onenable();
			else tfgs.optioninfo[funcname].ondisable();
		};

		tfgs.setting.showbutton();
	}
} catch (e) {
	alert(e.message);
	throw e;
}
