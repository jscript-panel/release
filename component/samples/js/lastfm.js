function _lastfm() {
	this.notify_data = function (name, data) {
		if (name == '2K3.NOTIFY.LASTFM') {
			this.username = this.get_username();
			_.forEach(panel.list_objects, function (item) {
				if (item.mode == 'lastfm_info' && item.properties.mode.value > 0) {
					item.update();
				}
			});
		}
	}

	this.update_username = function () {
		var username = utils.InputBox('Enter your Last.fm username', window.Name, this.username);
		if (username != this.username) {
			this.username = username;
			this.write_username();
			window.NotifyOthers('2K3.NOTIFY.LASTFM', 'update');
			this.notify_data('2K3.NOTIFY.LASTFM', 'update');
		}
	}

	this.get_username = function () {
		return _.get(_jsonParseFile(this.json_file), 'username', '');
	}

	this.write_username = function () {
		utils.WriteTextFile(this.json_file, JSON.stringify({username:this.username}));
	}

	utils.CreateFolder(folders.data);
	this.json_file = folders.data + 'lastfm.json';
	this.username = this.get_username();
	this.api_key = '1f078d9e59cb34909f7ed56d7fc64aba';
	this.base_url = 'http://ws.audioscrobbler.com/2.0/?format=json&api_key=' + this.api_key;
	this.ua = 'foo_jscript_panel_lastfm2';
}
