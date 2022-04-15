let fs = require("fs");
let flist = [];
let dir = fs.opendirSync("functions");
let file;
while ((file = dir.readSync()) !== null) {
	if (file.isFile()) {
		flist.push(file.name);
	}
}
dir.closeSync();
let allinone = "let tfgs = {};\n" +
	"tfgs.functions = {\n";
for (let i in flist) {
	let fname = flist[i];
	allinone += '	"' + fname + '": function (tfgsinfo) {\n' + fs.readFileSync("functions/" + fname).toString() + "\n	},\n";
}
allinone += "};\n\n";
allinone += fs.readFileSync("main.js");
allinone += "\n\n";
allinone += fs.readFileSync("saveload.js");
allinone += "\n\n";
allinone += fs.readFileSync("setting.js");
if (!fs.existsSync("allinone")) fs.mkdirSync("allinone");
fs.writeFileSync("allinone/TFGS.js", allinone);
