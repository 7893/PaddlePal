function page_refresh() {
	var form = document.createElement("form");
	var input;

	form.action = "PlayinfoPage";
	form.method = "post";

	input = document.createElement("input");
	input.type = "text";
	input.name = "Date";
	input.value = document.getElementById("Date").value;
	form.appendChild(input);

	input = document.createElement("input");
	input.type = "text";
	input.name = "Area";
	input.value = document.getElementById("Area").value;
	form.appendChild(input);

	input = document.createElement("input");
	input.type = "text";
	input.name = "Interval";
	input.value = document.getElementById("Interval").value;
	form.appendChild(input);
	document.body.appendChild(form);

	form.submit();
	return true;
}

function page_load() {
	var value = document.getElementById("Interval").value;
	if (value != null && value.length > 0)
		setTimeout("page_refresh()", parseInt(value) * 1000);
}  