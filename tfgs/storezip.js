// 获取storezip对象，用来生成无压缩的zip压缩包
//
// 例子:
// let zip = tfgs.storezip.create();
// zip.begin();
// zip.addfile("example.txt", "hello, world!");
// zip.addfile("timetravel.txt", "查看我的修改时间", "文件注释", "2022-10-10 12:34:56"); // 秒数会取最近的偶数
// zip.addfile("test.bin", [0x00, 0x05, 0x08, 0x0a]); // 支持字节数组，Uint8Array
// let zipdata = zip.end("zip 注释"); // 返回Uint8Array
// // 以下代码Node.js有效
// require('fs').writeFileSync('test.zip', Buffer.from(zipdata));

tfgs.storezip = {};

tfgs.storezip.create = function() {
	let bin = [];

	function append(x) {
		x.forEach(v => bin.push(v));
	}

	// 将字符串转换成Uint8Array
	function str2uint(x) {
		return new Uint8Array(new TextEncoder().encode(x));
	}

	// 将时间转换成数字
	function todatetime(x) {
		if (x === undefined || x === null) x = new Date();
		if (typeof x !== "object") {
			let str = x;
			x = new Date();
			x.setTime(Date.parse(str));
		}
		if (x.constructor.name === "Date") {
			x = {
				year: x.getYear() - 80,
				month: x.getMonth() + 1,
				date: x.getDate(),
				hour: x.getHours(),
				minute: x.getMinutes(),
				second: x.getSeconds()
			};
		}
		return (x.second >>> 1) & 0b11111 | // 秒数会取最近的偶数
			(x.minute & 0b111111) << 5 |
			(x.hour & 0b11111) << 11 |
			(x.date & 0b11111) << 16 |
			(x.month & 0b1111) << 21 |
			(x.year & 0b1111111) << 25;
	}

	function num2(x) {
		bin.push(x & 0xff);
		bin.push((x >>> 8) & 0xff);
	}

	function num4(x) {
		bin.push(x & 0xff);
		bin.push((x >>> 8) & 0xff);
		bin.push((x >>> 16) & 0xff);
		bin.push((x >>> 24) & 0xff);
	}

	let filehead = [
		0x50, 0x4b, 0x03, 0x04,
		0x0a, 0x00, //min unzip version
		0x00, 0x00,
		0x00, 0x00,
	];

	let central = [
		0x50, 0x4b, 0x01, 0x02,
		0x0a, 0x00, //version
		0x0a, 0x00, //min unzip version
		0x00, 0x00,
		0x00, 0x00,
	];

	let centralend = [
		0x50, 0x4b, 0x05, 0x06,
		0x00, 0x00,
		0x00, 0x00
	];

	let files = [];

	let crc32Table = crc32TableCreate();

	function crc32(uint) {
		if (typeof uint === "string") uint = str2uint(uint);
		let crc = 0xFFFFFFFF;
		uint.forEach(v => {
			crc = (crc >>> 8) ^ crc32Table[(crc ^ v) & 0xFF];
		});
		crc ^= 0xFFFFFFFF;
		return crc < 0 ? crc + 0x100000000 : crc;
	}

	function crc32TableCreate() {
		let table = [];
		for (i = 0; i < 256; i++) {
			let crc = i;
			for (j = 0; j < 8; j++) {
				if (crc & 1)
					crc = (crc >>> 1) ^ 0xEDB88320;
				else
					crc = crc >>> 1;
			}
			table.push(crc);
		}
		return table;
	}

	// 初始化
	function begin() {
		bin = [];
	}

	// 添加文件（名字、内容、注释、时间）
	function addfile(name, uint, cint, datetime) {
		if (uint === undefined || uint === null) uint = [];
		if (typeof uint === "string") uint = str2uint(uint);
		if (cint === undefined || cint === null) cint = [];
		if (typeof cint === "string") cint = str2uint(cint);
		if (cint.length > 65535) {
			tfgs.funcapi.warn(name, "压缩包注释太长(最多65535个字节)");
			cint = cint.slice(0, 65535);
		}
		if (typeof datetime !== "number") datetime = todatetime(datetime);
		let offs = bin.length;
		let crc = crc32(uint);
		let uname = str2uint(name);
		if (uname.length > 65535) {
			tfgs.funcapi.error(name, "压缩包文件名太长(最多65535个字节)");
			throw new Error("File name too long");
		}
		append(filehead);
		num4(datetime); // datetime
		num4(crc); // crc32
		num4(uint.length); // old size
		num4(uint.length); // new size
		num2(uname.length); // length of filename
		num2(0); // length of extra data
		append(uname); // filename
		append(uint); // data
		files.push({
			uname: uname,
			size: uint.length,
			offs: offs, // data offset
			crc: crc,
			cint: cint, // file comment
			datetime: datetime,
		});
	}

	// 结束并返回zip内容（全文注释）
	function end(cint) {
		if (cint === undefined || cint === null) cint = [];
		if (typeof cint === "string") cint = str2uint(cint);
		if (cint.length > 65535) cint = cint.slice(0, 65535);
		let offs = bin.length;
		files.forEach(v => {
			append(central);
			num4(v.datetime); // datetime
			num4(v.crc); // crc32
			num4(v.size); // old size
			num4(v.size); // new size
			num2(v.uname.length); // length of filename
			num2(0); // length of extra data
			num2(v.cint.length); // length of comment
			num2(0);
			num2(0); // internal attr
			num4(0b00100000); // external attr (xlADVSHR)
			num4(v.offs); // data offset
			append(v.uname); // filename
			append(v.cint); // file comment
		});

		let size = bin.length - offs;
		append(centralend);
		num2(files.length); // total files in this part
		num2(files.length); // total files
		num4(size); // size of central
		num4(offs); // cantral offset
		num2(cint.length); // comment length
		append(cint); // comment

		return bin;
	}

	return {
		crc32,
		str2uint,
		todatetime,
		begin,
		addfile,
		end
	};
};
