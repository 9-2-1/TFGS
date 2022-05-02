tfgs.funcapi = {};

tfgs.funcapi.log = function(name, log) {
	tfgs.log.add(name, "#000000", log);
};

tfgs.funcapi.warn = function(name, log) {
	tfgs.log.add(name, "#808000", log);
};

tfgs.funcapi.error = function(name, log) {
	tfgs.log.add(name, "#E00000", log);
};

tfgs.funcapi.info = function(name, log) {
	tfgs.log.add(name, "#2020F0", log);
};

tfgs.funcapi.getoption = function(name) {
	return tfgs.data.storage.load().then(function() {
		return tfgs.data.getoption()[name]
	});
};

tfgs.funcapi.getdata = function(name) {
	return tfgs.data.storage.load().then(function() {
		return tfgs.data.getdata()[name]
	});
};

tfgs.funcapi.setdata = function(name, data) {
	tfgs.data.setdata(name, data);
	return tfgs.data.storage.save();
};

tfgs.funcapi.alert = function(name, text) {
	return new Promise(function(resolve, reject) {
		alert(text);
		resolve();
	});
};

tfgs.funcapi.confirm = function(name, text) {
	return new Promise(function(resolve, reject) {
		resolve(confirm(text));
	});
};

tfgs.funcapi.prompt = function(name, text, defau) {
	return new Promise(function(resolve, reject) {
		resolve(prompt(text, defau));
	});
};

tfgs.funcapi._getapi = function(name) {
	let objapi = {};
	for (let i in tfgs.funcapi) {
		objapi[i] = function() {
			let arg = [name];
			for (let i = 0; i < arguments.length; i++)
				arg.push(arguments[i]);
			tfgs.funcapi[i].apply(tfgs.funcapi, arg);
		}
	}
	//tfgs.funcapi.log("x",inspect(objapi));
	return objapi;
};
