let fs = require("fs");
let Uglifyjs = require("uglify-js");
let Cleancss = require("clean-css");

function progress(x) {
	process.stdout.write("\r" + ("   " + String(Math.floor(x))).slice(-3) + "%");
}

function randomkey(num) {
	let key = "";
	let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789";
	for (let i = 0; i < num; i++)
		key += chars[Math.floor(Math.random() * chars.length)];
	return key;
}

progress(0);

let tfgskey = JSON.stringify("__TFGS$" + randomkey(10));

let allinone = `/* (allinone.js) */

! function (){
	try {
		let tfgs;

		if (${tfgskey} in window) {
			throw new Error("TFGS 已经安装");
		} else {
			tfgs = window[${tfgskey}] = {};
		}

		function _tfgsAddCSS(css) {
			let style = document.createElement("style");
			style.innerHTML = css;
			document.head.appendChild(style);
		}
`;

let allinonemin = allinone;

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
			allcssmin += text;
			break;
		}
	}
	progress(1 + 79 * Number(i) / flist.length);
}

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

if (!fs.existsSync("allinone")) fs.mkdirSync("allinone");
fs.writeFileSync("allinone/TFGS.js", allinone);

progress(90);

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

fs.writeFileSync("allinone/TFGS.min.js", allinonemin);

let url1 = "avascript:void function(){" + allinonemin.replace(/[\r\n]/g, "\\n").replace(/%/g, "%25") + "}()";

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
		<center>
			<b>需要注意：在使用类似的方式运行其他人提供的代码或者拓展时要小心，恶意代码或者拓展可能能够通过这种方式危害你的账号，请确保代码的来源可以信任后再运行。</b>
			<br />
			右键下面的链接，选择“加入到书签栏”，在需要使用的页面点击使用
			<br />
			<a id="copyme" href="">TFGS 插件</a>
			<br />
			或者，复制下边的代码（点击自动全选）：
			<br />
			在需要的页面，点击地址栏，全部清空后<b>输入“j”后</b>再粘贴后回车。
			<br />
			<textarea readonly id="copymee"></textarea>
			<br />
		</center>
		<script>
			var x;
			document.getElementById("copymee").value = x = ${JSON.stringify(url1)};
			document.getElementById("copyme").href = "j" + x;
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
