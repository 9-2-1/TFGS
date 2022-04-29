let tfgs = {};

tfgs.error = function(e) {
	alert(e.message);
	throw e;
};

// tfgs
// |-func
// | |-list
// | | |-(id)
// | | |-name*
// | | |-info*
// | | |-option*
// | | | |-(id)
// | | | |-name
// | | | |-info
// | | | |-type*
// | | | |-min(number)
// | | | |-max(number)
// | | | |-step(number)
// | | | |-maxlength(text)
// | | | |-menu(menu)
// | | | |-value(menu)
// | | | \-default*
// | | |-onenable*
// | | |-ondisable*
// | | \-onoption*
// | |-default*
// | |-fixoption*
// | \-add*
// |-funcapi
// | |-getdata*
// | |-setdata*
// | |-getoption*
// | |-log*
// | |-warn*
// | |-error*
// | |-info*
// | |-alert*
// | |-confirm*
// | |-prompt*
// | \-_getapi*
// |-log
// | |-add*
// | |-clear*
// | \-display*
// |-data
// | |-list
// | | |-(id)
// | | | |-enable
// | | | |-data
// | | | \-option
// | |-getjson
// | |-setjson
// | |-load
// | |-save
// | |-import
// | |-export
// | \-edit
// |-menu
// | |-create
// | |-save
// | \-delete
// \-button
//   |-create
//   |-show
//   \-hide
