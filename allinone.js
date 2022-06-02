let fs = require("fs");
let Uglifyjs = require("uglify-js");
let Cleancss = require("clean-css");

function randomkey(num) {
	let key = "";
	for (let i = 0; i < num; i++)
		key += String.fromCharCode(32 + Math.floor((127 - 32) * Math.random()));
	return key;
}

let tfgskey = JSON.stringify("__TFGS$" + randomkey(10));

let allinone = `/* (allinone.js) */
let tfgs = {};

try {
	if (${tfgskey} in window) {
		throw new Error("TFGS 已经安装");
	} else {
		window[${tfgskey}] = "tfgs_installed";
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

for (let i in flist) {
	let fname = flist[i];
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js": {
			let content = `/* ${fname} */
${fs.readFileSync(fname).toString()}

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
			allinone += `/* ${fname} */
_tfgsAddCSS(\`${text}\`);
`;
			allcssmin += text;
			break;
		}
	}
}

allcssmin = new Cleancss({
	inline: ["all"],
	level: 2
}).minify(allcssmin).styles;
allcssmin = allcssmin.replace(/\\/g, "\\\\")
	.replace(/\$/g, "\\$$")
	.replace(RegExp("`", "g"), "\\`")
	.replace(/\\/g, "\\\\");
allinonemin += `/* (allinone.css) */
_tfgsAddCSS(\`${allcssmin}\`);
`;

allinone += `/* (allinone.js) */
	tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
} catch(e) {
	alert(e.message);
	console.error(e);
	throw e;
}`;
allinonemin += `/* (allinone.js) */
	tfgs.data.load().then(tfgs.menu.create).catch(tfgs.error);
} catch(e) {
	alert(e.message);
	console.error(e);
	throw e;
}`;

if (!fs.existsSync("allinone")) fs.mkdirSync("allinone");
fs.writeFileSync("allinone/TFGS.js", allinone);

let res = Uglifyjs.minify(allinonemin, {
	compress: {
		passes: 3,
		toplevel: true
	},
	mangle: {
		toplevel: true
	},
	toplevel: true,
	warnings: true,
});

if (res.warning) console.error(res.warning);
if (res.error) console.error(res.error);

allinonemin = res.code;

fs.writeFileSync("allinone/TFGS.min.js", allinonemin);
fs.writeFileSync("allinone/TFGS.txt", "avascript:" + allinonemin.replace(/\n/g, "\\n"));
fs.writeFileSync("allinone/TFGS.html", `<!doctype HTML>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
		<title>TFGS 拓展使用方法</title>
		<style>
			textarea {
				width: 80%;
				height: 80%;
			}
		</style>
	</head>
	<body>
		<center>
			<b>需要注意：在使用类似的方式运行其他人提供的代码或者拓展时要小心，恶意代码或者拓展可能能够通过这种方式危害你的账号，请确保代码的来源可以信任后再运行。</b>
			<br />
			<a id="copyme" href="">右键这个链接，选择“加入到书签栏”，在需要使用的页面点击使用</a>
			<br />
			或者，复制右边的代码（点击自动全选）：
			<br />
			在需要的页面，点击地址栏，全部清空后<b>输入“j”后</b>再粘贴后回车。
			<br />
			<textarea id="copymee"></textarea>
			<br />
		</center>
		<script>
			var x;
			document.getElementById("copymee").value = x = "avascript:" + ${JSON.stringify(allinonemin.replace(/\n/g,"\\n"))};
			document.getElementById("copyme").href = "j" + x;
			document.getElementById("copymee").onfocus = function (e) {
				document.getElementById("copymee").select();
			};
			document.getElementById("copymee").oncut = p;
			document.getElementById("copymee").onpaste = p;
			document.getElementById("copymee").oninput = p;
			document.getElementById("copyme").onclick = function (e) {
				alert("请右键点击后选择加入到书签");
				e.preventDefault();
			};
			function p (e) {
				document.getElementById("copymee").value = x;
				e.preventDefault();
			};
		</script>
	</body>
</html>`);

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
