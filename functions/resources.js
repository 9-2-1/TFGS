let api;

let extramenus = [];
let modimenus = [];
let modirenames = [];
let interval = -1;

let costume_sound = null;

function childof(parent, test) {
	if (parent === null) return false;
	while (test !== parent && test !== null) {
		test = test.parentElement;
	}
	return test === parent;
}

function automodify() {
	if (interval === -1) {
		interval = setInterval(automodify, 500);
	}
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
			let menu = tfgs.element.create("div",
				api.selcss("react-contextmenu-item") + " " +
				api.selcss("context-menu_menu-item_")
			);
			menu.innerText = "重命名";
			menu.onclick = function(e) {
				parent.style.opacity = 0;
				parent.style.pointerEvents = "none";

				if (childof(costume_sound, parent)) {
					setTimeout(function() {
						parent.parentElement.children[2].children[0].click()
					}, 10);
				} else {
					setTimeout(function() {
						parent.parentElement.children[1].children[0].click()
					}, 10);
				}

				e.preventDefault();
				e.stopPropagation();
				e.cancelBubble = true;
				return false;
			};
			extramenus.push(parent.appendChild(menu));
			modimenus.push(parent);
		}
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
			th.classList.add("tfgsResourcesRenamable");
			th.addEventListener("click", handleRenameInput);
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
		let vm = api.vm();
		api.log("ob");
		api.log(ob);
		api.log("costume_sound");
		api.log(costume_sound);
		if (childof(costume_sound, ob)) {
			let renameFunc = api.currenttab() === 1 ? "renameCostume" : "renameSound"
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
	id: "resources",
	name: "点击重命名",
	info: "点击角色/造型/声音的名字可以直接重命名",
	option: {},
	onenable: function(_api) {
		api = _api;
		automodify();
	},
	ondisable: function() {
		nomodify();
	},
	onoption: function() {}
});
