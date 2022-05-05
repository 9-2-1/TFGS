let fs = require("fs");
let allinone = "";

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
	"menu.css",
	"allinone_.js"
];

for (let i in flist) {
	let fname = flist[i];
	if (fname === "allinone.js") continue;
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js":
			allinone += "/* " + fname + " */\n";
			allinone += fs.readFileSync(fname);
			allinone += "\n\n";
			break;
		case "css":
			allinone += "/* " + fname + " */\n";
			allinone += "" +
				'{\n' +
				'\tlet css = document.createElement("style");\n' +
				'\tcss.innerHTML = ';
			allinone += JSON.stringify(fs.readFileSync(fname).toString()).replace(/\\./g, function(str) {
				return str === '\\n' ? '\\n" +\n' +
					'\t\t"' : str;
			});
			allinone += "" +
				';\n' +
				'\tdocument.head.appendChild(css);\n' +
				'}\n\n';
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
			allinone += fs.readFileSync("functions/" + fname);
			allinone += "\n\n";
			break;
		case "css":
			allinone += "/* " + fname + " */\n";
			allinone += "" +
				'{\n' +
				'\tlet css = document.createElement("style");\n' +
				'\tcss.innerHTML = ';
			allinone += JSON.stringify(fs.readFileSync("functions/" + fname).toString()).replace(/\\./g, function(str) {
				return str === '\\n' ? '\\n" +\n' +
					'\t\t"' : str;
			});
			allinone += "" +
				';\n' +
				'\tdocument.head.appendChild(css);\n' +
				'}\n\n';
			break;
	}
}

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
