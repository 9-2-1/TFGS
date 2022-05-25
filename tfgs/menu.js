tfgs.menu = {};

tfgs.menu.menuwin = null;

tfgs.menu.modi = false;

window.addEventListener("beforeunload", function(event) {
	if (tfgs.menu.modi) {
		event.preventDefault();
		event.returnValue = "";
		return "";
	}
});

tfgs.menu.setmodi = function(modi) {
	if (modi !== tfgs.menu.modi) {
		let buttons = tfgs.menu.buttons;
		for (let i in buttons) {
			let flip = true;
			switch (i) {
				case "edit":
					continue;
				case "save":
				case "cancel":
					flip = false;
			}
			buttons[i].classList[modi === flip ? "add" : "remove"]("tfgsDisable");
		}
		tfgs.menu.menuwin.title = modi ? "TFGS 选项 (未保存)" : "TFGS 选项";
		tfgs.menu.menuwin.canMinimize = !modi;
		tfgs.menu.menuwin._refresh();
		tfgs.menu.modi = modi;
	}
};

tfgs.menu.create = function() {
	if (tfgs.menu.menuwin !== null)
		return;
	let element = function(tagName, className, type) {
		let ele = document.createElement(tagName);
		if (className !== undefined) ele.className = className;
		ele.className = className;
		if (type !== undefined) ele.type = type;
		return ele;
	};
	let menuwin = tfgs.window.create({
		title: "TFGS选项",
		canMinimize: true,
		canClose: false,
		x: 50,
		y: 50,
		width: 250,
		height: 250,
		minWidth: 200,
		minHeight: 100,
		minimizeWidth: 100
	});
	menuwin.minimize();
	let menudiv = menuwin.innerDiv;
	menudiv.innerHTML = `
<div class="tfgsMenuContent">
	<!--<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>
	<span class="tfgsMenuFuncSelect">Test</span>-->
</div>
<div class="tfgsMenuButtons">
	<span class="tfgsButton">导出</span>
	<span class="tfgsButton">导入</span>
	<span class="tfgsButton tfgsDisable">编辑文本</span>
	<span class="tfgsButton tfgsRight">显示日志</span>
	<span class="tfgsButton tfgsRight tfgsDisable">取消更改</span>
	<span class="tfgsButton tfgsDisable">保存更改</span>
</div>
`;
	let contentdiv = tfgs.menu.contentdiv = menudiv.children[0];
	let buttondiv = tfgs.menu.buttondiv = menudiv.children[1];
	let buttons = tfgs.menu.buttons = {};

	buttons.export = buttondiv.children[0];
	buttons.import = buttondiv.children[1];
	buttons.edit = buttondiv.children[2];
	buttons.log = buttondiv.children[3];
	buttons.cancel = buttondiv.children[4];
	buttons.save = buttondiv.children[5];

	buttons.export.addEventListener("click", function() {
		if (!tfgs.menu.modi) tfgs.data.export();
	});
	buttons.import.addEventListener("click", function() {
		if (!tfgs.menu.modi) tfgs.data.import().catch(tfgs.error);
	});
	buttons.edit.addEventListener("click", function() {
		if (!tfgs.menu.modi)
			tfgs.data.edit().then(tfgs.data.save).then(tfgs.menu.load).catch(tfgs.error);
	});
	buttons.log.addEventListener("click", function() {
		if (!tfgs.menu.modi)
			tfgs.log.create();
	});
	let _menumin = false;
	menuwin.onResize = function() {
		if (_menumin !== menuwin.isMinimize) {
			if (menuwin.isMinimize) {
				if (tfgs.menu.modi) menuwin.restore();
			} else {
				tfgs.menu.load();
			}
			_menumin = menuwin.isMinimize;
		}
	};
	buttons.save.addEventListener("click", function() {
		if (tfgs.menu.modi) {
			try {
				tfgs.menu.save().then(function() {
					tfgs.menu.load();
					tfgs.menu.setmodi(false);
				}).catch(tfgs.error);
			} catch (e) {
				tfgs.error(e);
			}
		}
	});
	buttons.cancel.addEventListener("click", function() {
		if (tfgs.menu.modi) {
			if (confirm("取消更改？")) {
				try {
					tfgs.menu.load();
					tfgs.menu.setmodi(false);
				} catch (e) {
					alert(e.message);
				}
			}
		}
	});

	let flist = tfgs.func.list;
	let list = tfgs.menu.list = {};
	for (let fname in flist) {
		let f = flist[fname];
		let funcdiv = element("div", "tfgsMenuFunc");
		funcdiv.innerHTML = `
<div class="tfgsMenuFuncTitle">
	<input type="checkbox"></input>
	<span class="tfgsMenuFuncName"></span>
	<span class="tfgsMenuFuncInfo"></span>
</div>
<div class="tfgsMenuFuncOption"></div>
`;
		let fl = list[fname] = {};
		fl.enable = funcdiv.children[0].children[0]
		fl.enable.addEventListener("change", function() {
			tfgs.menu.setmodi(true);
		});
		fl.option = {};
		funcdiv.children[0].children[1].innerText = f.name;
		let frame = function(x, y) {
			if (x !== undefined && x !== null && x !== "") return x + y;
			else return "";
		};
		funcdiv.children[0].children[2].innerText = frame(f.version, " ") + frame(f.author, " ") + frame(f.info, "");
		let fopdiv = funcdiv.children[1];
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let lab, inp;
			lab = element("label");
			lab.innerText = o.name;
			switch (o.type) {
				case "number":
					inp = element("input", undefined, "number");
					break;
				case "text":
					inp = element("input");
					break;
				case "check":
					inp = element("input", undefined, "checkbox");
					break;
				case "menu":
					inp = element("select");
					for (let i in o.menu) {
						let op = element("option");
						op.innerText = o.menu[i];
						op.value = i;
						inp.appendChild(op);
					}
					break;
				default:
					throw new Error("Unsupport type: " + o.type);
			}
			fl.option[oname] = inp;

			fopdiv1 = element("span", "tfgsMenuFuncOptionOne");

			fopdiv1.appendChild(lab);
			fopdiv1.appendChild(inp);

			fopdiv.appendChild(fopdiv1);
			inp.addEventListener("input", function() {
				tfgs.menu.setmodi(true);
			});
			inp.addEventListener("paste", function() {
				tfgs.menu.setmodi(true);
			});
			inp.addEventListener("change", function() {
				tfgs.menu.setmodi(true);
			});
		}
		contentdiv.appendChild(funcdiv);
	}

	tfgs.menu.menuwin = menuwin;

	tfgs.menu.load();
}

tfgs.menu.save = function() {
	tfgs.data.setjson(tfgs.menu._json());
	return tfgs.data.save();
};

tfgs.menu._json = function() {
	let flist = tfgs.func.list;
	let mlist = tfgs.menu.list;
	let json = {};
	for (let fname in flist) {
		let f = flist[fname];
		let m = mlist[fname];
		d = json[fname] = {};
		d.enable = m.enable.checked;
		d.option = {};
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let mi = m.option[oname];
			switch (o.type) {
				case "number":
					d.option[oname] = Number(mi.value);
					break;
				case "text":
					d.option[oname] = mi.value;
					break;
				case "check":
					d.option[oname] = mi.checked;
					break;
				case "menu":
					d.option[oname] = o.value[Number(mi.value)];
					break;
				default:
					throw new Error("类型错误: " + o.type);
			}
		}
	}
	//alert(JSON.stringify(json));
	return JSON.stringify(json);
};

tfgs.menu.load = function() {
	let json = tfgs.data.getjson();
	let flist = tfgs.func.list;
	let dlist = tfgs.data.list;
	let mlist = tfgs.menu.list;
	for (let fname in flist) {
		let f = flist[fname];
		let d = dlist[fname];
		let m = mlist[fname];
		m.enable.checked = d.enable;
		let olist = f.option;
		for (let oname in olist) {
			let o = olist[oname];
			let mi = m.option[oname];
			let di = d.option[oname];
			switch (o.type) {
				case "number":
					mi.value = di;
					break;
				case "text":
					mi.value = di;
					break;
				case "check":
					mi.checked = di;
					break;
				case "menu":
					if (o.value.includes(di))
						mi.options[o.value.indexOf(di)].selected = true;
					break;
				default:
					throw new Error("Unsupport type: " + o.type);
			}
		}
	}
};

tfgs.menu.delete = function() {
	tfgs.menu.menuwin.canClose = true;
	tfgs.menu.menuwin.close();
	tfgs.menu.menuwin = null;
};
