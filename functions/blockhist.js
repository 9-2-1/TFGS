/*

let history=[];

function scanundolist() {
	let undol = [];
	for (let i in undol) {
		let un = undol[i];
		if (un.type === "add") {
			copytohistory(un.blocks);
		}
	}
}

function copytohistory(block){
	let xml=Blockly.blocktoxml(...);
	history.push(xml);
}

function showhistory(){
	let win=elememt("div","tfgsBlockhistWindow");
	win.innerHTML=`
	<div class="tfgsBlockhistTitle">
	<span>history</span>
	<span class="tfgsBlockhistClose"></span>
	</div>
	<div class="tfgsBlockhistList"></div>
	`;
	document.body.appendChild(win);
	setDrag(selele("tfgsBlockhistWindow"),selele("tfgsBlockhistTitle"));

*/

tfgs.func.add({
	id: "blockhistory",
	name: "",
	default: false,
	option: {},
	onenable: function(_api) {},
	ondisable: function() {},
	onoption: function() {}
})
