tfgs.error = function(e) {
	alert(e.message);
	console.error(e);
	throw e;
};
