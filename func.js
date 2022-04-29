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
};

tfgs.func.default = function(cleardata) {
	let defldata = {};
	let flist = tfgs.func.list;
	for (let fname in flist) {
		let olist = flist[fname].option;
		let odefl = {};
		for (let oname in olist) {
			odefl[oname] = olist[oname].default;
		}
		defldata[fname] = {
			"enable": flist[fname].default,
			"option": odefl,
			"data": cleardata ? null : tfgs.data.list[fname].data
		}
	}
	tfgs.data.setjson(defldata);
};

tfgs.func.fixoption = function() {
	let flist = tfgs.func.list;
	for (let fname in flist) {
		let olist = flist[fname].option;
		for (let oname in olist) {
			let o = olist[oname];
			let O = tfgs.data.list[fname].option;
			switch (o.type) {
				case "text":
					if (typeof O[oname] !== "string") O[oname] = String(O[oname]);
					if ("maxlength" in o && O[oname].length > o.maxlength) O[oname] = O[oname].slice(0, o.maxlength);
					break;
				case "number":
					if (typeof O[oname] !== "number") O[oname] = Number(O[oname]);
					if (isNaN(O[oname])) O[oname] = o.default;
					if (O[oname] < o.min) O[oname] = o.min;
					if (O[oname] > o.max) O[oname] = o.max;
					break;
				case "check":
					if (typeof O[oname] !== "boolean") O[oname] = o.default;
					break;
				case "select":
					if (!o.value.includes(O[oname])) O[oname] = o.default;
					break;
			}
		}
	}
};
