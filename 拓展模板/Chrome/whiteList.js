var defaultList = [
	"+ https://scratch.mit.edu/projects/0000/editor",
	"+ https://aerfaying.com/project/0000/editor",
	"+ https://gitblock.cn/project/0000/editor",
	"+ https://ccw.site/creator....",
	"+ https://kada.163.com/project/v3/create....",
	"+ https://world.xiaomawang.com/scratch3-playground...."
];

//全局列表：global array
var whiteList;

//什么都不做
function noop(){}

// Get/set the list of websites.
// 获取/保存打开的网站列表到 whiteList
// callback: 回调函数
function getWhiteList(callback){
	chrome.storage.local.get(["whiteList"],function(data){
		whiteList = data.whiteList;
		if(!Array.isArray(whiteList)){
			whiteList = defaultList;
		}
		callback(whiteList);
	});
}

function setWhiteList(callback){
	chrome.storage.local.set({"whiteList":whiteList},callback);
}

// url: 网址
// whiteList 格式 pattern:
// 以 - 开头：禁用 以 + 开头：启用 其他：注释
// begin with -: disable +: enable other:comments
//
// ....(4 or more .) = any numbers of charactors
// xxxx(4 or more x) = any numbers of number or letter,
// 0000(4 or more 0) = any numbers of number
//
// .... 任意个字符，xxxx 任意个数字和字母，0000 任意个数字

// 查找url匹配的名单行(0开始)，或者-1表示找不到
function whiteListIndex(url){
	for(var i=0;i<whiteList.length;i++){
		var line = whiteList[i];
		if(line.length > 0
			&& (line[0]=='+' || line[0]=='-')){
			//whiteList转正则
				var rule = line.slice(1);
				var regTrim = /^\s+|\s+$/g;
				var regaxEsc = /([\[\]\{\}\(\)\.\+\?\*\^\$\\\/])/g;
				var re4dot = /(?:\\\.){4,}/g; // .在之前被regaxEsc影响过一次
				var re4x = /x{4,}/ig;
				var re40 = /0{4,}/g;
				rule = rule
					.replace(regTrim,"")
					.replace(regaxEsc, "\\$1")
					.replace(re4dot,".+")
					.replace(re4x,"\\w+")
					.replace(re40,"\\d+");
				var ruleRe = RegExp("^"+rule+"$", "i");
				//console.log(ruleRe);
				if(ruleRe.test(url)){
					return i; //直接返回，至于是+还是-由后面决定。
				}
			}
	}
	return -1;//没找到
}

//如果url不在白名单内，将url转换为whiteList
function addtoWhiteList(url){
	whiteList.push("+ " + getAutoPattern(url));
	setWhiteList(noop);
	return whiteList.length - 1;
}

//排除域名区域，把网址后面疑似数字替换为0000，字母序列替换为xxxx，?#后面替换为....
function getAutoPattern(url){
	var reDomain = /^(?:\w+:\/\/)?[^\/]*\//g; //为了lastIndex
	var re4dot = /([?#]).*$/;
	var re4x = /(^|[\\\/\-\.])\w{8,}([\\\/]?(?:[?#]|$))/g;
	var re4x2 = /(^|[\\\/\-\.])\w{16,}([\\\/\-\.]|$)/g;
	var re40 = /(^|[\\\/\-\.])\d+/g;
	var domain = reDomain.exec(url);
	if(domain){
		domain = domain[0];
		url = url.slice(reDomain.lastIndex);
	}else{
		domain = "";
	}
	url = url
		.replace(re40,  "$10000")
		.replace(re4x,  "$1xxxx$2")
		.replace(re4x2, "$1xxxx$2")
		.replace(re4dot,"$1....");
	return domain + url;
}

//url在白名单里且被启用？
function getStatus(url){
	var index = whiteListIndex(url);
	if(index == -1){
		return false;
	}
	return whiteList[index][0] == '+';
}

//启用或者禁用url所在的白名单规则(没有将自动创建合适规则)
function setStatus(url, status, ruledescp){
	var index = whiteListIndex(url);
	if(index == -1){
		if(whiteList.length > 0
			&& !/^\s*$/.test(whiteList[whiteList.length - 1]))
			whiteList.push("");
		whiteList.push(
			(
				ruledescp === undefined ?
				"// " :
				ruledescp
			) + url
		);
		index = addtoWhiteList(url);
	}
	whiteList[index] = (status ? "+" : "-") + whiteList[index].slice(1);
	setWhiteList(noop);
}

//whiteList变量实时同步，读取后和每次改变都会调用一次callback
function watchWhiteList(callback){
	getWhiteList(callback);
	function watchWhiteLister(event){
		if("whiteList" in event){
			whiteList = event.whiteList.newValue;
			//debugger;
			if(!Array.isArray(whiteList)){
				whiteList = defaultList;
			}
		}
		callback(whiteList);
	}
	chrome.storage.local.onChanged.addListener(
		watchWhiteLister
	);
}

//watchWhiteList(noop);
