var description_mode = 0, description_prompt_displayed = 0, subtask_level = 0, blank_entry = 0, last_level = 0;

$("#task_list_field").click(function(e) {
    /*var o = {
        left: e.pageX,
        top: e.pageY
    };
	$('#start_date_div').show().offset(o);
	$('#start_date_field').focus();
	$(".task_start_datepicker").datetimepicker('show');*/
	console.log(getCaret(this));
});

$('textarea').keyup(function (event) {
    if (event.keyCode == 13) {
		if (event.shiftKey) {
			var content = this.value;
			var caret = getCaret(this);
			//this.value = content.substring(0,caret)+"\n"+content.substring(caret,content.length-1);
			event.stopPropagation();
		}
		if (blank_entry == 1) {
			return;
		}
		if (description_mode == 1) {
			var value = $('#task_list_field').val();
			console.log('shift enter pressed' + value);
			$('#task_list_field').val(value + get_description_prompt());
			return;
		}
		var value = $('#task_list_field').val();
        console.log('only enter pressed' + value);
		$('#task_list_field').val(value + get_prompt());
	}
});

$('textarea').keypress(function (event) {
    /*if (event.keyCode == 13) {
        var value = $('#task_description_field2').val();
        console.log('only enter pressed' + value);
		$('#task_description_field2').val(value + '\n ');
    }*/
});
	
$('textarea').keydown(function (event){
	if(event.keyCode === 9 && !event.shiftKey) { // tab was pressed
        event.preventDefault();
		var value = $('#task_list_field').val();
		console.log('only tab pressed' + value);
		console.log('last 2 chars = "' + value.slice(-2) + '"');
		if (value.slice(-2) == '• ') {
			console.log('subtask started');
			increase_prompt(value);
		}
		else {
			$('#task_list_field').val(value + '\t');
		}
    }
	else if (event.keyCode == 9 && event.shiftKey) {
		//alert('tab with shift');
		event.preventDefault();
		var value = $('#task_list_field').val();
		console.log('only tab pressed' + value);
		console.log('last 2 chars = "' + value.slice(-2) + '"');
		if (value.slice(-2) == '• ') {
			console.log('subtask ended');
			decrease_prompt(value);
		}
		else {
			$('#task_list_field').val(value + '\t');
		}
	}
	else if (event.keyCode == 13) {
		console.log(getCaret(this));
		var value = $('#task_list_field').val();
		//console.log('last 2 chars = "' + value.slice(-2) + '"');
		console.log('last match = "' + value.match(/\s*[»• ]\s*$/) + '"');
		if (value.match(/\s*[»•]\s*$/)) {
			event.preventDefault();
			set_blank_entry();
		}
		else {
			clear_blank_entry();
			set_last_level();
		}
		console.log('last level set to ' + last_level);
		clear_description_mode();
		if (event.shiftKey) {
			set_description_mode();
			return;
		}
		clear_description_prompt_displayed();
	}
	/*else {
		var value = $('#task_description_field2').val();
		console.log('only tab pressed' + value);
		console.log('last 2 chars = "' + value.slice(-2) + '"');
		if (value.slice(-6) == 'start:') {
			var o = {
			    left: event.pageX,
			    top: event.pageY
			};
			$('#start_date_div').show().offset(o);
			$('#start_date_field').focus();
			$(".task_start_datepicker").datetimepicker('show');
		}
	}*/
});

/*$(document).delegate('#main', 'keydown', function(e) {
    var keyCode = e.keyCode || e.which;        
        if (keyCode == 9) {     // TAB key
            e.preventDefault();
		}
});*/

function getCaret(el) { 
    if (el.selectionStart) { 
        return el.selectionStart; 
    } else if (document.selection) { 
        el.focus();
        var r = document.selection.createRange(); 
        if (r == null) { 
            return 0; 
        }
        var re = el.createTextRange(), 
        rc = re.duplicate(); 
        re.moveToBookmark(r.getBookmark()); 
        rc.setEndPoint('EndToStart', re); 
        return rc.text.length; 
    }  
    return 0; 
}

function setSelectionRange(selectionStart, selectionEnd) {
	var input = document.getElementById('task_list_field');
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}
	else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function set_caret(pos) {
  setSelectionRange(pos, pos);
}

function insert_marker() {
    console.log('function called!');
    document.getElementById('textarea_guardian').innerHTML += '<span class="highlight">$</span>';
    console.log('after change = ' + document.getElementById('textarea_guardian').innerHTML);
}

/*function get_subtask_level() {
	return subtask_level;
}*/

function increase_subtask_level() {
	subtask_level++;
}

function decrease_subtask_level() {
	if (subtask_level == 0){
		return;
	}
	subtask_level--;
}

function set_blank_entry() {
	blank_entry = 1;
}

function clear_blank_entry() {
	blank_entry = 0;
}

function set_last_level() {
	last_level = subtask_level;
}

function set_description_mode() {
	description_mode = 1;
}

function toggle_description_mode() {
	description_mode = description_mode == 1 ? 0 : 1;
}

function clear_description_mode() {
	description_mode = 0;
}

function set_description_prompt_displayed() {
	description_prompt_displayed = 1;
}

function clear_description_prompt_displayed() {
	description_prompt_displayed = 0;
}

function clear_all_globals() {
	description_prompt = 0;
	description_mode_displayed = 0;
	subtask_level = 0;
	blank_entry = 0;
	last_level = 0;
}

function get_prompt() {
	if (subtask_level == 0) {
		return new Array(subtask_level + 1).join('\t') + '• ';
	}
	else {
		return new Array(subtask_level + 1).join('\t') + subtask_level + '• ';
	}
}

function get_description_prompt() {
	if (subtask_level == 0) {
		if (description_prompt_displayed == 0) {
			set_description_prompt_displayed();
			return new Array(subtask_level + 1).join('\t') + '» ';
		}
		return new Array(subtask_level + 1).join('\t') + '   ';
	}
	else {
		if (description_prompt_displayed == 0) {
			set_description_prompt_displayed();
			return new Array(subtask_level + 1).join('\t') + ' »  ';
		}
		return new Array(subtask_level + 1).join('\t') + '     ';
	}
}

function increase_prompt(value) {
	//var value = $('#task_description_field2').val();
	if (last_level < subtask_level) {
		return;
	}
	increase_subtask_level();
	len = subtask_level.toString().length;
	if (subtask_level == 1) {
		$('#task_list_field').val(value.slice(0, -len-1) + '\t' + subtask_level + '• ');
	}
	else {
		$('#task_list_field').val(value.slice(0, -len-2) + '\t' + subtask_level + '• ');
	}
}

function decrease_prompt(value) {
	//var value = $('#task_description_field2').val();
	len = subtask_level.toString().length;
	if (subtask_level > 1) {
		$('#task_list_field').val(value.slice(0, -len-3) + (subtask_level-1) + '• ');
	}
	else if (subtask_level == 1) {
		$('#task_list_field').val(value.slice(0, -len-3) + '• ');
	}
	decrease_subtask_level();
}
