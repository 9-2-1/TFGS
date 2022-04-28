let fs = require("fs");
let flist = lsSync("functions");
let allinone = "" +
	"let tfgs = {};\n" +
	"tfgs._func = {\n";

for (let i in flist) {
	let fname = flist[i];
	let ext = /(?:\.(.*))?$/.exec(fname)[1];
	switch (ext) {
		case "js":
			allinone += "" +
				'\t"' + fname + '": function (tfgsinfo) {\n' +
				fs.readFileSync("functions/" + fname).toString() +
				"\n\t},\n";
			break;
		case "css":
			allinone += "/* " + fname + " */\n";
			allinone += "" +
				'{\n' +
				'\tlet css = document.createElement("style");\n' +
				'\tcss.innerHTML = ';
			allinone += JSON.stringify(fs.readFileSync("functions/" + fname).toString());
			allinone += "" +
				';\n' +
				'\tdocument.head.appendChild(css);\n' +
				'}\n\n';
			break;
	}
}
allinone += "};\n\n";

flist = [
	"func.js",
	"funcapi.js",
	"log.js",
	"inspect.js"
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
