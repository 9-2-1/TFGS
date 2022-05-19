tfgs.func = {};

/* 功能列表,格式见下funcinfo */
tfgs.func.list = {};

tfgs.func.add = function(funcinfo) {
	// 格式参考 ../functions/example.js
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
		default: funcinfo.default,
		option: funcinfo.option,
		onenable: funcinfo.onenable,
		ondisable: funcinfo.ondisable,
		onoption: funcinfo.onoption,
		enable: false
	};
};

/* 重置数据，cleardata代表是否要重置data数据(默认只还原option，也就是拓展菜单里的设置 */
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
			"data": cleardata ? undefined : fname in tfgs.data.list ? tfgs.data.list[fname].data : undefined
		};
	}
	tfgs.data._default(defldata);
};

/* 设置和数据变化的触发器 */
tfgs.func.datachange = function() {
	tfgs.func.fixoption();
	let flist = tfgs.func.list;
	for (let fname in flist) {
		let e = tfgs.func.list[fname];
		let E = tfgs.data.list[fname].enable;
		if (e.enable !== E) {
			try {
				e[E ? "onenable" : "ondisable"](tfgs.funcapi._getapi(fname));
			} catch (e) {
				tfgs.funcapi.error(fname, "Error: " + e.message);
				console.error(e);
			}
			e.enable = E;
		} else if (E) {
			try {
				e.onoption(tfgs.funcapi._getapi(fname));
			} catch (e) {
				tfgs.funcapi.error(fname, "Error: " + e.message);
				console.error(e);
			}
		}
	}
};

/* 检查设置数据是否符合规则 */
tfgs.func.fixoption = function() {
	let flist = tfgs.func.list;
	for (let fname in flist) {
		if (typeof tfgs.data.list[fname].enable !== "boolean")
			tfgs.data.list[fname].enable = flist[fname].default;
		let olist = flist[fname].option;
		for (let oname in olist) {
			let o = olist[oname];
			let O = tfgs.data.list[fname].option;
			switch (o.type) {
				case "text":
					if (O[oname] === null || O[oname] === undefined) O[oname] = o.default;
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
				case "menu":
					if (!o.value.includes(O[oname])) O[oname] = o.default;
					break;
			}
		}
	}
};
