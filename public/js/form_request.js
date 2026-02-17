function setCookie(name,value) {
	document.cookie = name + "="+ escape(value);
}
function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}
function form_request(action, key, value) {
	var form = document.createElement("form");
	var input = document.createElement("input");

	form.action = action;
	form.method = "post";
	input.type = "hidden";
	input.name = key;
	input.value = value;
	form.appendChild(input);

	setCookie('key', value);
	document.body.appendChild(form);
	form.submit();

	return true;
}