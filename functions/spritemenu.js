let api, vm = null;

let extramenus = [];
let modimenus = [];
let modirenames = [];
let interval = -1;

let costume_sound = null;

let foption = {};

function childof(parent, test) {
	if (parent === null) return false;
	while (test !== parent && test !== null) {
		test = test.parentElement;
	}
	return test === parent;
}

function createmenu(parent, name, onclick) {
	let menu = tfgs.element.create("div",
		api.selcss("react-contextmenu-item") + " " +
		api.selcss("context-menu_menu-item_")
	);
	menu.innerText = name;
	menu.onclick = function(e) {
		parent.style.opacity = 0;
		parent.style.pointerEvents = "none";

		onclick(e);

		e.preventDefault();
		e.stopPropagation();
		e.cancelBubble = true;
		return false;
	};
	menu.onmousedown = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
		return false;
	};
	parent.appendChild(menu);
	return menu;
}

function automodify() {
	// 设定自动重复
	if (interval === -1) {
		interval = setInterval(automodify, 500);
	}
	if (vm === null)
		vm = api.vm();
	// 上面那个vm如果获取不到就会出错，导致下面的内容不会继续。
	// vm获取要在自动重复后面否则会导致自动重复无效，这样出错后不会重试
	costume_sound = api.selele("selector_list-area_");
	let allmenu = api.selall("sprite-selector-item_sprite-selector-item_");
	for (let i = 0; i < extramenus.length; i++) {
		if (!childof(document.body, extramenus[i])) {
			extramenus[i].remove();
			extramenus.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < modimenus.length; i++) {
		if (!childof(document.body, modimenus[i])) {
			modimenus.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < modirenames.length; i++) {
		if (!childof(document.body, modirenames[i])) {
			modirenames.splice(i, 1);
			i--;
		}
	}
	for (let i = 0; i < allmenu.length; i++) {
		let parent = api.selele("react-contextmenu", allmenu[i]);
		if (parent === null) {
			api.warn("no menu found");
			api.warn(allmenu[i]);
			continue;
		}
		if (!modimenus.includes(parent)) {
			if (foption.rename) {
				extramenus.push(createmenu(parent, "重命名", function() {
					let index = childof(costume_sound, parent) ? 2 : 1;
					setTimeout(function() {
						parent.parentElement.children[index].children[0].click()
					}, 10);
				}));
			}
			/*
			extramenus.push(createmenu(parent, "排序...", function() {

			}));
			*/
			if (!api.RESPECTnodownload_DO_NOT_DELETE()) {
				if (childof(costume_sound, parent)) {
					if (foption.copymd5) {
						extramenus.push(createmenu(parent, "复制 md5ext", function() {
							let assets = api.currenttab() === 1 ? "costumes" : "sounds";
							let ob = parent.parentElement;
							let index = Number(ob.children[0].innerText) - 1;
							let asset = vm.runtime.getEditingTarget().sprite[assets][index];
							api.copy(asset.assetId + "." + asset.dataFormat);
						}));
					}
				} else {
					if (foption.download) {
						extramenus.push(createmenu(parent, "导出全部素材", function() {
							let list = vm.runtime.targets;
							let sprite = null;
							let ob = parent.parentElement;
							let name = ob.children[1].children[0].innerText;
							list.forEach(v => {
								if (v.isOriginal && v.sprite.name === name) {
									sprite = v.sprite;
								}
							});
							if (sprite === null) {
								api.error(`Sprite \`${val}' not found.`);
							} else {
								try {
									// windows保留文件名
									let reservedfilename = [
										"con", "prn", "aux", "nul",
										"com1", "com2", "com3", "com4",
										"com5", "com6", "com7", "com8",
										"com9", "lpt1", "lpt2", "lpt3",
										"lpt4", "lpt5", "lpt6", "lpt7",
										"lpt8", "lpt9"
									];
									let filelist = [];
									let filecomment = "";
									sprite.costumes.forEach((v, i) => {
										let comment = "造型 " + (i + 1) + "\n" +
											"角色: " + sprite.name + "\n" +
											"造型: " + v.name + "\n" +
											"md5ext: " + v.assetId + "." + v.asset.dataFormat;
										let vname;
										switch (foption.downloadname) {
											case "1":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												break;
											case "1a":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												vname += " " + v.name;
												break;
											case "a":
												vname = v.name;
												break;
										}
										filelist.push({
											folder: "costumes/",
											name: vname,
											ext: "." + v.asset.dataFormat,
											data: v.asset.data
										});
										filecomment += comment + "\n\n";
									});
									sprite.sounds.forEach((v, i) => {
										let comment = "声音 " + (i + 1) + "\n" +
											"角色: " + sprite.name + "\n" +
											"声音: " + v.name + "\n" +
											"md5ext: " + v.assetId + "." + v.asset.dataFormat;
										let vname;
										switch (foption.downloadname) {
											case "1":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												break;
											case "1a":
												vname = String(i + 1);
												if (foption.downloadnum) {
													vname = vname.padStart("0", String(sprite.costumes.length).length);
												}
												vname += " " + v.name;
												break;
											case "a":
												vname = v.name;
												break;
										}
										filelist.push({
											folder: "sounds/",
											name: vname,
											ext: "." + v.asset.dataFormat,
											data: v.asset.data
										});
										filecomment += comment + "\n\n";
									});
									let zip = tfgs.storezip.create();
									zip.begin();
									let usedfile = [];
									filelist.forEach(v => {
										let folder = v.folder;
										// 文件名避免出现这些字符
										// 因为没法把中文转成gbk所以只能屏蔽
										let origname;
										switch (foption.downloadesc) {
											case "no":
												origname = v.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"\u00ff-\uffff]", "g"), "");
												break;
											case "_":
												origname = v.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"\u00ff-\uffff]", "g"), "_");
												break;
										}
										let name = origname;
										let ext = v.ext;
										let test = (folder + name + ext).toLowerCase();
										if (reservedfilename.includes(name) ||
											usedfile.includes(test)) {
											// 如果文件名被占用，就在后面加上(数字)
											for (let i = 1; i < 10000; i++) {
												name = origname + "(" + i + ")";
												test = (folder + name + "." + ext).toLowerCase();
												if (!(reservedfilename.includes(name) ||
														usedfile.includes(test))) {
													break;
												}
											}
										}
										usedfile.push(test);
										zip.addfile(folder + name + ext, v.data, v.comment);
									});
									zip.addfile("filelist.txt", filecomment);
									let file = zip.end(filecomment);
									let fr = new FileReader();
									fr.onload = function() {
										let a = tfgs.element.create('a');
										let name = sprite.name.replace(RegExp("[*.?:/\\<|>\n\r\t\"]", "g"), "_");
										a.download = name + ".zip";
										a.href = fr.result;
										a.click();
									}
									file = new Uint8Array(file);
									fr.readAsDataURL(new Blob([file], {
										type: "application/zip"
									}));
								} catch (e) {
									api.onerror(e);
								}
							}
						}));
					}
				}
			}
		}
		modimenus.push(parent);
	}
	api.selall("sprite-selector-item_sprite-selector-item_").forEach(ob => {
		if (!modirenames.includes(ob)) {
			modirenames.push(ob);
			let th;
			if (childof(costume_sound, ob)) {
				th = ob.children[2].children[0];
			} else {
				th = ob.children[1].children[0];
			}
			console.log(th);
			if (foption.rename) {
				th.classList.add("tfgsResourcesRenamable");
				th.addEventListener("click", handleRenameInput);
			}
		}
	});
}

function handleRenameInput(e) {
	let th = this;
	let ob = th.parentElement.parentElement;
	let val = th.innerText;
	let input = tfgs.element.create("input", "tfgsResourcesRename");
	th.innerHTML = "";
	th.appendChild(input);
	input.value = val;
	input.onblur = function() {
		if (childof(costume_sound, ob)) {
			let renameFunc = api.currenttab() === 1 ? "renameCostume" : "renameSound";
			let index = Number(ob.children[0].innerText) - 1;
			if (input.value !== val)
				vm[renameFunc](index, input.value);
			th.innerText = val;
		} else {
			let list = vm.runtime.targets;
			let index = null;
			list.forEach(v => {
				if (v.isOriginal && v.sprite.name === val) {
					index = v.id;
				}
			});
			if (index === null) {
				api.error(`Sprite \`${val}' not found.`);
			} else {
				api.log(index);
				if (input.value !== val)
					vm.renameSprite(index, input.value);
				th.innerText = val;
			}
		}
	}
	input.ontouchstart = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.onkeydown = function(e) {
		if (e.code === 13) {
			input.blur();
			e.preventDefault();
		}
	}
	input.onmousedown = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.onclick = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.oncontextmenu = function(e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}
	input.focus();

	e.preventDefault();
	e.stopPropagation();
	e.cancelBubble = true;
	return false;
}

function nomodify() {
	if (interval !== -1) {
		clearInterval(interval);
		interval = -1;
	}
	while (extramenus.length !== 0) {
		extramenus[0].remove();
		extramenus.splice(0, 1);
	}
	modimenus = [];
	while (modirenames.length !== 0) {
		let ob = modirenames.splice(0, 1)[0];
		let th = ob.children[2].children[0];
		th.classList.remove("tfgsResourcesRenamable");
		th.removeEventListener("click", handleRenameInput);
	}
}

tfgs.func.add({
	id: "spritemenu",
	name: "角色与素材右键菜单",
	info: "重命名、复制md5、导出所有造型和声音",
	option: {
		rename: {
			type: "check",
			name: "点击/右键重命名",
			default: true
		},
		download: {
			type: "check",
			name: "下载全部素材",
			default: true
		},
		downloadname: {
			type: "menu",
			name: "素材命名方式",
			menu: ["数字", "名字", "数字+名字"],
			value: ["1", "a", "1a"],
			default: "1a"
		},
		downloadnum: {
			type: "check",
			name: "数字前补0",
			default: true
		},
		downloadesc: {
			type: "menu",
			name: "特殊字符与中文处理(由于编码原因中文乱码)",
			menu: ["删除", "替换为_"],
			value: ["no", "_"],
			default: "_"
		},
		copymd5: {
			type: "check",
			name: "复制素材md5",
			default: true
		}
	},
	onenable: function(_api) {
		api = _api;
		foption = api.getoption();
		automodify();
	},
	ondisable: function() {
		nomodify();
	},
	onoption: function() {
		foption = api.getoption();
		nomodify();
		automodify();
	}
});
