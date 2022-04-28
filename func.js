tfgs.func = {};

tfgs.func.list = {};

tfgs.func.add = function(funcinfo) {
	// funcinfo
	// |-id
	// |-name
	// |-info
	// |-option
	// | |-(id)
	// | |-name
	// | |-info
	// | |-type
	// | |-min(number)
	// | |-max(number)
	// | |-step(number)
	// | |-maxlength(text)
	// | |-menu(menu)
	// | \-default
	// |-onenable
	// |-ondisable
	// \-onoption
	if (funcinfo.id in tfgs.func.list) throw new Error("id used: " + funcinfo.id);
	tfgs.func.list[funcinfo.id] = {
		name: funcinfo.name,
		info: funcinfo.info,
		option: funcinfo.option,
		onenable: funcinfo.onenable,
		ondisable: funcinfo.ondisable,
		onoption: funcinfo.onoption
	};

	//tfgs.option.default();
};
