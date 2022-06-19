let fs = require("fs");

// 生成尽量小的压缩代码以便复制和放入书签
let Uglifyjs = require("uglify-js");
let Cleancss = require("clean-css");

// 显示操作进度
function progress(x) {
	process.stdout.write("\r" + ("   " + String(Math.floor(x))).slice(-3) + "%");
}

// 生成随机变量名
function randomkey(num) {
	let key = "";
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789";
	for (let i = 0; i < num; i++)
		key += chars[Math.floor(Math.random() * chars.length)];
	return key;
}

progress(0);

// 随机变量名，你在f12的时候能够找到类似 __TFGS$xxxxxxxxxx 的变量，就是tfgs对象
let tfgskey = JSON.stringify("__TFGS$" + randomkey(10));

let allinone = `/* (allinone.js) */

! function (){
	try {
		let tfgs;

		// 检测 TFGS 是否重复安装
		if (${tfgskey} in window) {
			throw new Error("TFGS 已经安装");
		} else {
			tfgs = window[${tfgskey}] = {};
		}

		// 插入 CSS 文件
		function _tfgsAddCSS(css) {
			let style = document.createElement("style");
			style.innerHTML = css;
			document.head.appendChild(style);
		}
`;

let allinonemin = allinone;

// 要合并的文件列表
let flist = [];
flist = flist.concat(lsSync("tfgs/"));
flist = flist.concat(lsSync("functions/"));
let allcssmin = "";

progress(1);

for (let i in flist) {
	let fname = flist[i];
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js": {
			let content = `		/* ${fname} */
		! function (){
${fs.readFileSync(fname).toString()}
		}();

`;
			allinone += content;
			allinonemin += content;
			break;
		}
		case "css": {
			let text = fs.readFileSync(fname).toString();
			text = text.replace(/\\/g, "\\\\")
				.replace(/\$/g, "\\$$")
				.replace(RegExp("`", "g"), "\\`")
				.replace(/\\/g, "\\\\");
			allinone += `		/* ${fname} */
		_tfgsAddCSS(\`${text}\`);

`;
			// 在压缩版本中css文件是合并为一个导入的，这意味着不能分开禁用。
			allcssmin += text;
			break;
		}
	}
	progress(1 + 79 * Number(i) / flist.length);
}

// 压缩css
allcssmin = new Cleancss({
	inline: ["all"],
	level: 2
}).minify(allcssmin).styles;
progress(85);
allcssmin = allcssmin.replace(/\\/g, "\\\\")
	.replace(/\$/g, "\\$$")
	.replace(RegExp("`", "g"), "\\`")
	.replace(/\\/g, "\\\\");
allinonemin += `		/* (allinone.css) */
		_tfgsAddCSS(\`${allcssmin}\`);

`;

// 错误处理
allinone += `		/* (allinone.js) */
		tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
	} catch(e) {
		alert(e.message);
		console.error(e);
		throw e;
	}
}();
`;
allinonemin += `	/* (allinone.js) */
		tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
	} catch(e) {
		alert(e.message);
		console.error(e);
		throw e;
	}
}();
`;

// 合并版 js
if (!fs.existsSync("allinone")) fs.mkdirSync("allinone");
fs.writeFileSync("allinone/TFGS.js", allinone);

progress(90);

// 压缩 js
let res = Uglifyjs.minify(allinonemin, {
	compress: {
		passes: 3,
	},
	mangle: {},
	warnings: true,
});

progress(95);

if (res.warning) console.error(res.warning);
if (res.error) console.error(res.error);

allinonemin = res.code;

// 压缩版本
fs.writeFileSync("allinone/TFGS.min.js", allinonemin);

// 二次压缩
allinonemin = "eval(" + mypacker(allinonemin) + ")";
fs.writeFileSync("allinone/TFGS.packer.js", allinonemin);

// 浏览器拓展版本
fs.writeFileSync("allinone/TFGS.extension.js", `/* TFGS injector */
let tfgsScript = "!" + function(){
${allinone}
}.toString() + "()";

// 此时 tfgsScript 包含了以上所有代码。创建新的script标签把它们插入（不能直接运行，因为在拓展域内，要转到网页域内
let script = document.createElement("script");
script.src = "data:text/javascript," + encodeURIComponent(tfgsScript);
document.body.appendChild(script);
`);

fs.writeFileSync("allinone/manifest.json", JSON.stringify({
	manifest_version: 2,
	name: "TFGS",
	version: "0",
	content_scripts: [{
		matches: ["<all_urls>"],
		js: ["TFGS.extension.js"]
	}],
}));

// 去掉了j，浏览器会屏蔽粘贴文本中的“javascript:”
let url1 = "avascript:void " + allinonemin.replace(/[\r\n]/g, "\\n").replace(/%/g, "%25");

fs.writeFileSync("allinone/TFGS.txt", url1);
fs.writeFileSync("allinone/TFGS.html", `<!doctype HTML>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
		<title>TFGS 拓展使用方法</title>
		<style>
			textarea {
				width: 80%;
				height: 300px;
			}
		</style>
	</head>
	<body>
		<b>需要注意：在使用类似的方式运行其他人提供的代码或者拓展时要小心，恶意代码或者拓展可能能够通过这种方式危害你的账号，请确保代码的来源可以信任后再运行。</b>
		<br />
		方法1: 右键下面的链接，选择“加入到书签栏”，在需要使用的页面点击使用
		<br />
		<a id="copyme" href="">TFGS 插件</a>
		<br /><br />
		方法2：复制最下方文本框里的代码（点击自动全选）：
		<br />
		在需要的页面，点击地址栏，全部清空后<b>输入“j”后</b>再粘贴后回车。
		<br /><br />
		方法3：如果因为链接太长等原因无法加入书签，且复制代码无效，可以分别下载TFGS.extension.js和manifest.json，放在同一文件夹（注意，不要改名）：
		<br />
		<a download="TFGS.extension.js" href="TFGS.extension.js">TFGS.extension.js</a>
		<a download="manifest.json" href="manifest.json">manifest.json</a>
		<br />
		然后在浏览器里作为拓展加载
		<br />
		Chrome: 地址栏输入 chrome://extensions ，点击右上角“开发者模式”，选择“加载已解压拓展”，选择包含上述两文件的文件夹
		<br />
		Firefox: 地址栏输入 about:debugging ，点击左侧“此 Firefox”，选择“加载临时插件”，选择manifest.json
		<br />
		之后所有的标签页都会加载此拓展。注意: 不同网站的设置不会同步。
		<br />
		<textarea readonly id="copymee"></textarea>
		<script>
			var x = ${str(allinonemin)};
			var url = x.replace(/[\\r\\n]/g, "\\\\n").replace(/%/g, "%25").replace(/#/g, "%23");
			document.getElementById("copymee").value = "avascript:void " + url;
			document.getElementById("copyme").href = "javascript:void " + url;
			document.getElementById("copymee").onfocus = function (e) {
				document.getElementById("copymee").select();
			};
			document.getElementById("copyme").onclick = function(e) {
				alert("请右键点击后选择加入到书签，或者拖到书签栏");
				e.preventDefault();
			};
		</script>
	</body>
</html>`);

progress(100);

// 列出文件夹里的的文件
function lsSync(path) {
	let flist = [];
	let dir = fs.opendirSync(path);
	let file;
	while ((file = dir.readSync()) !== null) {
		if (file.isFile()) {
			flist.push(path + file.name);
		}
	}
	dir.closeSync();
	return flist;
}

// 自己写的packer，只会按照词语的出现频率选择更短的词语替换，不会简化代码消除空白，因此前面要先用uglifyjs之类的处理
function mypacker(x) {
	let kwre = /\W*\b(\w+)\b/g;
	let words = {};
	let res;
	//统计词语出现次数并排序
	while (res = kwre.exec(x), res !== null) {
		let word = res[1];
		if (word in words) {
			words[word]++;
		} else {
			words[word] = 1;
		}
	}
	let wordc = [];
	let numb = 0,
		wordl = [];
	for (let i in words)
		wordc.push([words[i], i]);
	wordc.sort((a, b) => (-(a[1].length - 1) * (a[0] - 1) + (b[1].length - 1) * (b[0] - 1)));
	wordc.forEach(v => {
		if ((v[1].length - numb.toString(36).length) > 0 && (v[0] - 1) > 0) {
			// 跳过冲突的词语，空白代表跳过
			while (numb.toString(36) in words) {
				numb++;
				wordl.push("");
			}
			x = x.replace(RegExp("\\b" + v[1] + "\\b", "g"), numb.toString(36));
			numb++;
			wordl.push(v[1]);
		}
	});
	// 这里v.length是为了判断v.length!==0
	return "((a,b)=>(b.forEach((v,i)=>{v.length&&(a=a.replace(RegExp(\"\\\\b\"+i.toString(36)+\"\\\\b\",\"g\"),v))}),a))(" + str(x) + "," + str(wordl.join("|")) + ".split(\"|\"))";
}

// 生成单引号字符串
function str(x) {
	return "'" + x.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/'/g, "\\'") + "'";
}
