/*
© Anthrino > Anterius Settings Manager
*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');
var authorize = require('../lib/authorize.js');

router.get('/', authorize.auth, function (req, res, next) {

	anterius_settings_template = template_render.get_template("anterius_settings");

	var json_file = require('jsonfile');

	// /* Leases File */
	// input = template_render.form_input('Leases File', '<input type="input" class="form-control" name="leases_file" id="leases_file" placeholder="/var/lib/dhcp/dhcpd.leases" value="' + anterius_config.leases_file + '">');

	// /* Config File */
	// input = input + template_render.form_input('Config File', '<input type="input" class="form-control" name="config_file" id="config_file" placeholder="/etc/dhcp/dhcpd.conf" value="' + anterius_config.config_file + '">');

	/* Kea Control Agent Hostname Select */
	host_select = '<div class="input-field form-control"><select id="svr-host-select" name="svr-host-select" style="max-width:75%">';
	if (anterius_config.server_host_list) {
		svr_host_list = '<option value="" disabled>Choose Kea machine</option>';
		anterius_config.server_host_list.forEach(function (host, index) {
			svr_host_list += '<option value="' + index + '" id="server-host' + index + '" >' + host.hostname + ' [' + host.svr_addr + ':' + host.svr_port + ']</option>';
		});

		if (anterius_config.current_host_index == '-1')
			svr_host_list = svr_host_list.replace('<option value=""', '<option value="" selected');
		else
			svr_host_list = svr_host_list.replace('<option value="' + anterius_config.current_host_index + '"', '<option value="' + anterius_config.current_host_index + '" selected');

	} else
		svr_host_list = '<option value="" disabled selected>No server hosts configured</option>';

	input = template_render.form_input('Kea Control Agent Host[host:port]', host_select + svr_host_list + '</select></div>');

	/* Stats Refresh interval */
	input = input + template_render.form_input('Statistics Refresh Interval (s)', '<input type="input" class="form-control" name="stat_refr_int" id="stat_refr_int" placeholder="Enter refresh interval in secs" value="' + anterius_config.stat_refresh_interval + '">');

	/*  Default server */
	input = input + '<label> Default server </label><div class="form-group"><div class="form-line">'
		+ '<input name="svrselect" id="dhcp4" value="dhcp4" type="radio" class="with-gap" /><label for="dhcp4"><span>DHCPv4</span></label>'
		+ '<input name="svrselect" id="dhcp6" value="dhcp6" type="radio" class="with-gap" /><label for="dhcp6"><span>DHCPv6</span></label></div></div>';
	input = input.replace('value="' + anterius_config.current_server + '"', 'value="' + anterius_config.current_server + '" checked');

	/* Admin User */
	input = input + template_render.form_input('Admin User', '<input type="input" class="form-control" name="admin_user" id="admin_user" placeholder="Username" value="' + anterius_config.admin_user + '">');
	input = input + template_render.form_input('Admin Password', '<input type="input" class="form-control" name="admin_password" id="admin_password" placeholder="Password" value="' + anterius_config.admin_password + '">');

	/* Log File */
	// input = input + template_render.form_input('Log File', '<input type="input" class="form-control" name="log_file" id="log_file" placeholder="/var/log/dhcp.log" value="' + anterius_config.log_file + '">');

	input = input + '<br><div id="anterius_settings_result"></div>';

	form_data = template_render.form_body("anterius-settings-form", input);

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "body_content", form_data);

	server_host_list = anterius_config.server_host_list;
	hostname_data_table = '';

	for (var i = 0; i < server_host_list.length; i++) {

		/* Define hostname row for remote servers table */
		table_row = '';
		// table_row = table_row + '<td><input type="radio" name="svrhost" id="r' + i + '" value="' + i + '" class="with-gap"/></td>';
		table_row = table_row + '<td><p id="h' + i + '">' + server_host_list[i].hostname + '</p></td>';
		table_row = table_row + '<td><p id="a' + i + '">' + server_host_list[i].svr_addr + '</p></td>';
		table_row = table_row + '<td><p id="p' + i + '">' + server_host_list[i].svr_port + '</p></td>';
		table_row = table_row + '<td><button type="button" class="btn waves-effect" id="b' + i + '" onclick="edit_server_host(\'' + i + '\')">' +
			'<i class="material-icons">edit</i></button>' +
			'<button type="button" style="margin-left: 5%" class="btn waves-effect" id="b' + i + '" onclick="delete_server_host(\'' + i + '\')">' +
			'<i class="material-icons">delete</i></button></td>';

		table_row = table_row.replace(/<td><\/td>/g, '<td> -- </td>');
		hostname_data_table = hostname_data_table + '<tr>' + table_row + '</tr>';
	}

	// hostname_data_table = hostname_data_table.replace('value="' + anterius_config.current_host_index + '"', 'value="' + anterius_config.current_host_index + '" checked');

	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "svr_hosts_len", anterius_config.server_host_list.length);
	anterius_settings_template = template_render.set_template_variable(anterius_settings_template, "server_host_list", hostname_data_table);

	res.send(template_render.get_index_template(anterius_settings_template, req.url));
});

module.exports = router;	