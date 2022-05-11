let fs = require("fs");
let allinone = `/* (allinone.js) */
try {
	function _tfgsAddCSS(css) {
		let style = document.createElement("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	}
`;

let flist = [
	"inspect.js",
	"object_format.js",
	"main.js",
	"data.js",
	"func.js",
	"funcapi.js",
	"log.js",
	"log.css",
	"button.js",
	"menu.js",
	"menu.css"
];

for (let i in flist) {
	let fname = flist[i];
	if (fname === "allinone.js") continue;
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js":
			allinone += "/* " + fname + " */\n";
			allinone += fs.readFileSync(fname).toString();
			allinone += "\n\n";
			break;
		case "css":
			let textld = fs.readFileSync(fname).toString();
			textld = textld.replace(/\\/g, "\\\\")
				.replace(/\$/g, "\\$$")
				.replace(RegExp("`", "g"), "\\`")
				.replace(/\\/g, "\\\\");
			allinone += `/* ${fname} */
_tfgsAddCSS(\`${textld}\`);
`;
			break;
	}
}

flist = lsSync("functions");

for (let i in flist) {
	let fname = flist[i];
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js":
			allinone += "/* " + fname + " */\n";
			allinone += fs.readFileSync("functions/" + fname).toString();
			allinone += "\n\n";
			break;
		case "css":
			let textld = fs.readFileSync("functions/" + fname).toString();
			textld = textld.replace(/\\/g, "\\\\")
				.replace(/\$/g, "\\$$")
				.replace(RegExp("`", "g"), "\\`")
				.replace(/\\/g, "\\\\");
			allinone += `/* ${fname} */
_tfgsAddCSS(\`${textld}\`);
`;
			break;
	}
}

allinone += `/* (allinone.js) */
	tfgs.data.load().then(tfgs.button.create).catch(tfgs.error);
} catch(e) {
	alert(e.message);
	console.error(e);
	throw e;
}`;
if (!fs.existsSync("allinone")) fs.mkdirSync("allinone");
fs.writeFileSync("allinone/TFGS.js", allinone);

function lsSync(path) {
	let flist = [];
	let dir = fs.opendirSync(path);
	let file;
	while ((file = dir.readSync()) !== null) {
		if (file.isFile()) {
			flist.push(file.name);
		}
	}
	dir.closeSync();
	return flist;
}
