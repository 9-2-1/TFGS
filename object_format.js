function object_format(obj, format) {
	if (typeof format === "object") {
		let fmtobj = Array.isArray(format) ? [] : {};
		for (let x in format) {
			fmtobj[x] = object_format(obj === null || obj === undefined ? undefined : obj[x], format[x]);
		}
		return fmtobj;
	} else {
		switch (format) {
			case "string":
			case "":
				return String(obj);
			case "string!":
			case "!":
				return typeof obj === "string" ? obj : "";
			case "string?":
			case "?":
				return typeof obj === "string" ? obj : undefined;
			case "number":
			case "0":
				return Number(obj);
			case "number!":
			case "0!":
				return typeof obj === "number" ? obj : 0;
			case "number?":
			case "0?":
				return typeof obj === "number" ? obj : undefined;
			case "boolean":
				return Boolean(obj);
			case "boolean!":
			case "false!":
				return typeof obj === "boolean" ? obj : false;
			case "boolean?":
			case "false?":
				return typeof obj === "boolean" ? obj : undefined;
			case "array":
			case "[]": {
				let fmtobj = [];
				for (let x in obj) {
					fmtobj[x] = obj[x];
				};
				return fmtobj;
			}
			case "array!":
			case "[]!":
				return Array.isArray(obj) ? obj : [];
			case "array?":
			case "[]?":
				return Array.isArray(obj) ? obj : undefined;
			case "object":
			case "{}": {
				let fmtobj = {};
				for (let x in obj) {
					fmtobj[x] = obj[x];
				};
				return fmtobj;
			}
			case "object!":
			case "{}!":
				return Object.isObject(obj) ? obj : {};
			case "object?":
			case "{}?":
				return Object.isObject(obj) ? obj : undefined;
			case "any":
				return obj;
		}
	}
};
