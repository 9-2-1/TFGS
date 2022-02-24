//当检测到有Extension的存在，也就是被作为ClipCC拓展加载的时候，不自启动。
if(typeof Extension !== "function"){
	// 在规则配对之前这个脚本不会加载，只有打开之后才会加载。因此加载必是要打开。
	TFGS();
	TFGSON();
	
	// 用于 chrome 拓展的弹窗遥控
	window.addEventListener("message",function(event){
		if(event.source === event.target){
			if(typeof event.data === "object" && "enable" in event.data){
				// 编辑规则的时候有可能会重复打开，此时先关掉后打开。
				TFGSOFF();
				if(event.data.enable){
					TFGSON();
				}
			}
		}
	});
}
// 左边是积木区，右边是积木拖出区
var workspace, flyoutWorkspace;
// 打开重试计时器
var opening = -1;

// 打开 tfgs
function TFGSON(tryCount){
	var tryCount = tryCount === undefined ? 0 : tryCount;
	//部分社区的界面会加载，尝试5次
	try{
		workspace = Blockly.getMainWorkspace();
		flyoutWorkspace = workspace.getFlyout().getWorkspace();
		document.body.addEventListener("keydown",on_keydown,true);
		//document.body.addEventListener("mousedown",on_mousedown,true);
		console.log("打开 TFGS");
		console.log(workspace,flyoutWorkspace);
	}catch(err){
		console.error(err);
		console.log("TFGS 启动失败次数: ",tryCount + 1);
		if(tryCount + 1 >= 5){
			// 遥控关闭
			window.postMessage({"error":err},document.location.href);
			alert("开启 TFGS 失败，TFGS 已自动关闭。\n" +
				"TFGS 需要在 Scratch 3 创作页中使用。\n" +
				"你可能需要等作品加载完后再次打开。");
			return;
		}else{
			// 再试一次
			opening = setTimeout(function(){
				TFGSON(tryCount+1);
			},1000);
			return;
		}
	}
}

function TFGSOFF(){
	// 停止重试
	if(opening != -1){
		clearTimeout(opening);
		opening = -1;
	}
	TFGS_T_STOP();
	// 把事件响应函数卸掉就是关闭了
	document.body.removeEventListener("keydown",on_keydown,true);
	//document.body.removeEventListener("mousedown",on_mousedown,true);
	console.log("关闭 TFGS");
}

function on_keydown(event){
	if(!isCode())
		return;
	if(event.path[0] !== document.body)
		return;
	if(!event.altKey
		&& !event.shiftKey
		&& !event.metaKey
		&& !event.ctrlKey){
		switch(event.key){
			case 't':
				console.log('TFGS: T');
				TFGS_T();
				event.preventDefault();
				break;
			case 'f':
				console.log('TFGS: F');
				TFGS_F();
				break;
			case 'g':
				console.log('TFGS: G');
				TFGS_G();
				break;
			case 's':
				console.log('TFGS: S');
				TFGS_S();
				break;
		}
	}
	//console.log(event);
}

var tfgs_t_input = null,
	tfgs_t_block = [],
	tfgs_t_list  = [];

// 检查是否打开代码区（而不是造型、声音区）
function isCode(){
	//使用ClipCC api
	// NODE_ENV=production
	/*if(api !== undefined){
		var gi = api.getGuiInstance();
		console.log("state",gi.state);
		//return gi.state === 0;
	}*/
	// state恒等于null？
	// 使用前缀匹配代替写死
	var guiIsSelected = document.querySelector("*[class*=gui_is-selected_]");
	if(guiIsSelected !== null){
		return guiIsSelected.id === 'react-tabs-0';
	}
	return false;
	//return document.getElementsByClassName("gui_is-selected_sHAiu")[0].id == 'react-tabs-0';
	//className写死的话可能会出问题
}

function TFGS_T_STOP(){
	if(tfgs_t_input !== null){
		tfgs_t_input.remove();
		tfgs_t_input = null;
	}
	tfgs_t_block = [];
	tfgs_t_list = [];
}

function TFGS_T(){
	// 输入还没开始
	if(tfgs_t_input !== null){
		tfgs_t_input.remove();
		tfgs_t_input = null;
	}

	TFGS_T_LIST();

	tfgs_t_input = document.createElement("textarea");
	tfgs_t_input.style.top = (window.innerHeight / 2 - 100) + "px";
	tfgs_t_input.style.right = "50px";
	tfgs_t_input.style.width = "200px";
	tfgs_t_input.style.height = "200px";
	tfgs_t_input.style.backgroundColor = "white";
	tfgs_t_input.style.position = "absolute";
	tfgs_t_input.style.borderColor = "black";
	tfgs_t_input.style.color = "black";
	tfgs_t_input.style.fontSize = "10px";
	tfgs_t_input.style.fontFamily = "consolas";
	tfgs_t_input.style.borderRadius = "5px";
	tfgs_t_input.style.boxShadow = "0px 0px 5px black";
	tfgs_t_input.addEventListener('blur',TFGS_T_STOP,true);
	tfgs_t_input.addEventListener('keydown',function(){setTimeout(TFGS_T_BLOCK,0)},true);
	document.body.appendChild(tfgs_t_input);
	tfgs_t_input.focus();
}

function TFGS_T_LIST(){
	var met = workspace.getMetrics();
	tfgs_t_x = met.viewLeft + 15;
	tfgs_t_y = met.viewTop  + 15;

	tfgs_t_list = [];
	var blockList = flyoutWorkspace.getAllBlocks();
	var xmlList = Blockly.Xml.workspaceToDom(flyoutWorkspace);
	for(var i=0;i<blockList.length;i++){
		var desp = {};
		var bloc = blockList[i];
		if(bloc.getParent() === null){
			desp.opcode = bloc.type;
			desp.shape = bloc.getOutputShape();
			desp.next = bloc.nextConnection !== null;
			desp.start = bloc.startHat_;
			desp.input = [];
			var text = "";
			var inpl = bloc.inputList;
			var xml = "";
			for(var j=0;j<inpl.length;j++){
				var fldr = inpl[j].fieldRow;
				for(var k=0;k<fldr.length;k++){
					var input = {name: fldr[k].name};
					switch(fldr[k].getArgTypes()){
						case null:
							text += fldr[k].getText();
							break;
						case "dropdown":
							var menu = fldr[k].menuGenerator_;
							if(typeof menu === "function"){
								menu = menu();
							}
							input.type = "f_dropdown";
							input.menu = [];
							for(var l=0;l<menu.length;l++){
								input.menu.push(menu[l][0]);
							}
							text += "■";
							break;
						case "variable":
							input.type = "f_variable:" + fldr[k].getVariable().type;
							// workspace.getAllVariables()
							//     type == name
							//     isCloud: false
							//     isLocal: false
							//     name: "45"
							text += "■";
							break;
						default:
							input.type = "f_unknown"
							text += "■";
							break;
					}
    				if("type" in input){
    					desp.input.push(input);
    				}
				}
				//text += "[" + inpl[j].type + ":" + inpl[j].name + "]";
				var input = {name: inpl[j].name};
				switch(inpl[j].type){
					case 5: // 无input
						break;
					case 3: // C形
						input.type = "i_stack";
						text += "□";
						break;
					case 1: // 普通
						if(inpl[j].connection === null
						|| inpl[j].connection.targetBlock() === null){
							text += "◆";
							input.type = "i_bool";
						}else{
							try{
								var blo2 = inpl[j].connection.targetBlock();
								var inp2 = blo2.inputList;
								var got = false;
								if(inp2.length === 1){
									var fld2 = inp2[0].fieldRow;
									if(fld2[0].getArgTypes() === "dropdown"){
										var menu = fld2[0].menuGenerator_;
										if(typeof menu === "function"){
											menu = menu();
										}
										input.type = "i_dropdown";
										input.menu = [];
										for(var l=0;l<menu.length;l++){
											input.menu.push(menu[l][0]);
										}
										text += "●";
										got = true;
									}
								}
								if(!got){
									input.type = "i_normal:" + blo2.type;
									text += "○";
								}
							}catch(err){
								alert(err.message);
							}
						}
						break;
				}
				if("type" in input){
					desp.input.push(input);
				}
				//debugger;
			}
			// 查找对应的 block xml
			for(var k=0;k<xmlList.children.length;k++){
				var xc = xmlList.children[k];
				if(xc.getAttribute("id") === bloc.id){
					xml = Blockly.Xml.domToText(xc);
				}
			}
			desp.xml = xml;
			desp.text = text;
			//趁机获取下颜色
			desp.colour = bloc.getColour();
			tfgs_t_list.push(desp);
		}
	}
	//快速复制 list
	if(true){
		var a = document.createElement("input");
		a.value = JSON.stringify(tfgs_t_list);
		document.body.appendChild(a);
	}
}

// 更新积木
function TFGS_T_BLOCK(){
	var input = tfgs_t_input.value;
	for(var i=0;i<tfgs_t_block.length;i++){
		workspace.getBlockById(tfgs_t_block[i]).dispose();
	}
	// 奇怪的是，上面的删除没有计入记录，有可能计入记录有延迟！
	// 用延迟打败延迟
	// 删除撤销记录
	var deleteBlockList = [];
	for(var i=0;i<tfgs_t_block.length;i++){
		// 复制一遍，免受影响
		// 其实严格意义上来说不需要，因为后面 tfgs_t_block 直接被 [] 覆盖
		deleteBlockList.push(tfgs_t_block[i]);
	}

	setTimeout(function(){
		var un = workspace.undoStack_;
		for(var i=0;i<un.length;){
			if(deleteBlockList.includes(un[i].blockId)){
				un.splice(i,1);
			}else{
				i++;
			}
		}
	},20);

	//if(tfgs_t_block.length > 0)
	//	workspace.undo();
	tfgs_t_block = [];
	var in_xml = Blockly.Xml.textToDom("<xml><variable></variable></xml>");
	var inputList = input.split("\n");

	for(var i = 0,addTo = in_xml;i < inputList.length;i++){
		//假装这是查找积木代码
		var j = Number(inputList[i]);
		if (/^\s*$/.test(inputList[i]) || isNaN(j)){
			addTo = in_xml;
			continue;
		}else{
			if(j < 0)j = 0;
			if(j >= tfgs_t_list.length)
				j = tfgs_t_list.length - 1;
			var blockXml = document.createElement("xml");
			var pattern = tfgs_t_list[j];
			blockXml.innerHTML = pattern.xml;
			var block = blockXml.children[0];
			if(pattern.shape === null){
				if(pattern.start){
					addTo = in_xml;
				}
				addTo.appendChild(block);
				if(pattern.next){
					var next = document.createElement("next");
					block.appendChild(next);
					addTo = next;
				}else{
					addTo = in_xml;
				}
			}else{
				addTo = in_xml;
				addTo.appendChild(block);
			}
		}
	}

	tfgs_t_block = Blockly.Xml.domToWorkspace(in_xml,workspace);
	if(tfgs_t_block === undefined){
		tfgs_t_block = [];
	}

	var posX = tfgs_t_x;
	var posY = tfgs_t_y;
	for(var i=0;i<tfgs_t_block.length;i++){
		var bl = workspace.getBlockById(tfgs_t_block[i]);
		if(bl.getParent() === null){
			var oldpos = bl.getRelativeToSurfaceXY();
			bl.moveBy(
				posX / workspace.scale - oldpos.x,
				posY / workspace.scale - oldpos.y
			);
			posY += (bl.getHeightWidth().height + 30) * workspace.scale;
		}
	}
	var met = workspace.getMetrics();
	var my = met.viewTop + met.viewHeight;
	if(posY > my){
		var px = (met.viewLeft - met.contentLeft) / met.contentWidth ;
		var py = (posY - met.viewHeight  - met.contentTop ) / met.contentHeight;
		workspace.setMetrics({x:px,y:py});
	}
		my = met.viewTop;
	if(posY - 45 < my){
		var px = (met.viewLeft - met.contentLeft) / met.contentWidth ;
		var py = (posY - 45 - met.contentTop ) / met.contentHeight;
		workspace.setMetrics({x:px,y:py});
	}
}

function TFGS_F(){
}

function TFGS_G(){
}

function TFGS_S(){
}

function TFGS(){
	console.log("" +
		" _____________    _____________      __________    _____________ \n" +
		"|_____   _____|  |  ___________|    / _________|  |  ___________|\n" +
		"      | |        | |               / /            | |            \n" +
		"      | |        | |___________   / /    ______   | |___________ \n" +
		"      | |        |  ___________| / /    |_____ |  |___________  |\n" +
		"      | |        | |             | |         | |              | |\n" +
		"      | |        | |             | |_________/ |   ___________| |\n" +
		"      |_|        |_|             |_____________/  |_____________| 成功载入\n" +
"");
}

// 在前面粘贴 TFGS.js 的内容

var _enableTFGS = true;

class TFGS {
    getInfo() {
        TFGS();
        TFGSON();
        return {
            id: 'TFGS',
            name: 'TFGS',

            blocks: [
                {
                    opcode: 'turnon',
                    blockType: Scratch.BlockType.BUTTON,
                    text: '打开 TFGS'
                },
                {
                    opcode: 'turnoff',
                    blockType: Scratch.BlockType.BUTTON,
                    text: '关闭 TFGS'
                }
            ]
        };
    }

    turnon() {
        if (!_enableTFGS) {
            try {
                TFGSON();
                _enableTFGS = true;
                alert("TFGS 已打开")
            } catch (err) {
                alert("错误: " + err.message);
            }
        }
    }
    turnoff() {
        if (!_enableTFGS) {
            try {
                TFGSOFF();
                _enableTFGS = false;
                alert("TFGS 已关闭")
            } catch (err) {
                alert("错误: " + err.message);
            }
        }
    }
}

Scratch.extensions.register(new TFGS());