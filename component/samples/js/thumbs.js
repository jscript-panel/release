function _thumbs() {
	this.size = function (f) {
		this.nc = f || this.nc;
		this.close_btn.x = panel.w - this.close_btn.w;
		this.offset = 0;
		switch (true) {
		case panel.w < this.properties.px.value || panel.h < this.properties.px.value || this.properties.mode.value == 5: // off
			this.nc = true;
			_dispose(this.img);
			this.img = null;
			this.w = 0;
			this.h = 0;
			break;
		case this.properties.mode.value == 0: // grid
			this.x = 0;
			this.y = 0;
			this.w = panel.w;
			this.h = panel.h;
			if (!this.nc && this.columns != Math.floor(this.w / this.properties.px.value)) {
				this.nc = true;
			}
			this.rows = Math.ceil(this.h / this.properties.px.value);
			this.columns = Math.floor(this.w / this.properties.px.value);
			this.img_rows = Math.ceil(this.thumbs.length / this.columns);
			if (this.nc && this.thumbs.length) {
				this.nc = false;
				_dispose(this.img);
				this.img = null;
				this.img = utils.CreateImage(Math.min(this.columns, this.thumbs.length) * this.properties.px.value, this.img_rows * this.properties.px.value);
				var temp_gr = this.img.GetGraphics();
				var ci = 0;
				for (var row = 0; row < this.img_rows; row++) {
					for (var col = 0; col < this.columns; col++) {
						if (!this.thumbs[ci]) continue;
						if (this.properties.circular.enabled) {
							temp_gr.DrawImageWithMask(this.thumbs[ci], this.circular_mask, col * this.properties.px.value, row * this.properties.px.value, this.properties.px.value, this.properties.px.value);
						} else {
							_drawImage(temp_gr, this.thumbs[ci], col * this.properties.px.value, row * this.properties.px.value, this.properties.px.value, this.properties.px.value, image.crop_top);
						}
						ci++;
					}
				}
				this.img.ReleaseGraphics();
				temp_gr = null;
			}
			break;
		case this.properties.mode.value == 1: // left
		case this.properties.mode.value == 2: // right
			this.x = this.properties.mode.value == 1 ? 0 : panel.w - this.properties.px.value;
			this.y = 0;
			this.w = this.properties.px.value;
			this.h = panel.h;
			this.rows = Math.ceil(this.h / this.properties.px.value);
			if (this.nc && this.thumbs.length) {
				this.nc = false;
				_dispose(this.img);
				this.img = null;
				this.img = utils.CreateImage(this.properties.px.value, this.properties.px.value * this.thumbs.length);
				var temp_gr = this.img.GetGraphics();
				_.forEach(this.thumbs, function (item, i) {
					if (this.properties.circular.enabled) {
						temp_gr.DrawImageWithMask(item, this.circular_mask, 0, i * this.properties.px.value, this.properties.px.value, this.properties.px.value)
					} else {
						_drawImage(temp_gr, item, 0, i * this.properties.px.value, this.properties.px.value, this.properties.px.value, image.crop_top);
					}
				}, this);
				this.img.ReleaseGraphics();
				temp_gr = null;
			}
			break;
		case this.properties.mode.value == 3: // top
		case this.properties.mode.value == 4: // bottom
			this.x = 0;
			this.y = this.properties.mode.value == 3 ? 0 : panel.h - this.properties.px.value;
			this.w = panel.w;
			this.h = this.properties.px.value;
			this.columns = Math.ceil(this.w / this.properties.px.value);
			if (this.nc && this.thumbs.length) {
				this.nc = false;
				_dispose(this.img);
				this.img = null;
				this.img = utils.CreateImage(this.properties.px.value * this.thumbs.length, this.properties.px.value);
				var temp_gr = this.img.GetGraphics();
				_.forEach(this.thumbs, function (item, i) {
					if (this.properties.circular.enabled) {
						temp_gr.DrawImageWithMask(item, this.circular_mask, i * this.properties.px.value, 0, this.properties.px.value, this.properties.px.value);
					} else {
						_drawImage(temp_gr, item, i * this.properties.px.value, 0, this.properties.px.value, this.properties.px.value, image.crop_top);
					}
				}, this);
				this.img.ReleaseGraphics();
				temp_gr = null;
			}
			break;
		}
	}

	this.paint = function (gr) {
		var offset_px = this.offset * this.properties.px.value;

		switch (true) {
		case !this.images.length:
			this.image_xywh = [];
			break;
		case this.properties.mode.value == 5: // off
			if (this.properties.aspect.value == image.centre) {
				this.image_xywh = _drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - 40, this.properties.aspect.value);
			} else {
				this.image_xywh = _drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
			}
			break;
		case !this.img:
			break;
		case this.properties.mode.value == 0: // grid
			gr.DrawImage(this.img, this.x, this.y, this.img.Width, Math.min(this.img.Height - offset_px, this.h), 0, offset_px, this.img.Width, Math.min(this.img.Height - offset_px, this.h));
			if (this.overlay) {
				_drawOverlay(gr, this.x, this.y, this.w, this.h);
				this.image_xywh = _drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - 40, image.centre);
				this.close_btn.paint(gr, RGB(230, 230, 230));
			} else {
				this.image_xywh = [];
			}
			break;
		case this.properties.mode.value == 1: // left
			if (this.properties.aspect.value == image.centre) {
				this.image_xywh = _drawImage(gr, this.images[this.image], this.properties.px.value + 20, 20, panel.w - this.properties.px.value - 40, panel.h - 40, this.properties.aspect.value);
			} else {
				this.image_xywh = _drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
			}
			_drawOverlay(gr, this.x, this.y, this.w, this.h);
			gr.DrawImage(this.img, this.x, this.y, this.w, Math.min(this.img.Height - offset_px, this.h), 0, offset_px, this.w, Math.min(this.img.Height - offset_px, this.h));
			break;
		case this.properties.mode.value == 2: // right
			if (this.properties.aspect.value == image.centre) {
				this.image_xywh = _drawImage(gr, this.images[this.image], 20, 20, panel.w - this.properties.px.value - 40, panel.h - 40, this.properties.aspect.value);
			} else {
				this.image_xywh = _drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
			}
			_drawOverlay(gr, this.x, this.y, this.w, this.h);
			gr.DrawImage(this.img, this.x, this.y, this.w, Math.min(this.img.Height - offset_px, this.h), 0, offset_px, this.w, Math.min(this.img.Height - offset_px, this.h));
			break;
		case this.properties.mode.value == 3: // top
			if (this.properties.aspect.value == image.centre) {
				this.image_xywh = _drawImage(gr, this.images[this.image], 20, this.properties.px.value + 20, panel.w - 40, panel.h - this.properties.px.value - 40, this.properties.aspect.value);
			} else {
				this.image_xywh = _drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
			}
			_drawOverlay(gr, this.x, this.y, this.w, this.h);
			gr.DrawImage(this.img, this.x, this.y, Math.min(this.img.Width - offset_px, this.w), this.img.Height, offset_px, 0, Math.min(this.img.Width - offset_px, this.w), this.img.Height);
			break;
		case this.properties.mode.value == 4: // bottom
			if (this.properties.aspect.value == image.centre) {
				this.image_xywh = _drawImage(gr, this.images[this.image], 20, 20, panel.w - 40, panel.h - this.properties.px.value - 40, this.properties.aspect.value);
			} else {
				this.image_xywh = _drawImage(gr, this.images[this.image], 0, 0, panel.w, panel.h, this.properties.aspect.value);
			}
			_drawOverlay(gr, this.x, this.y, this.w, this.h);
			gr.DrawImage(this.img, this.x, this.y, Math.min(this.img.Width - offset_px, this.w), this.img.Height, offset_px, 0, Math.min(this.img.Width - offset_px, this.w), this.img.Height);
			break;
		}
	}

	this.metadb_changed = function () {
		if (panel.metadb) {
			if (this.properties.source.value == 0) { // custom folder
				var temp_folder = panel.tf(this.properties.tf.value);
				if (this.folder == temp_folder) {
					return;
				}
				this.folder = temp_folder;
			} else { // last.fm
				var temp_artist = panel.tf(DEFAULT_ARTIST);
				if (this.artist == temp_artist) {
					return;
				}
				this.artist = temp_artist;
				this.folder = _artistFolder(this.artist);
			}
		} else {
			this.artist = '';
			this.folder = '';
		}
		this.update();
	}

	this.playback_new_track = function () {
		this.counter = 0;
		panel.item_focus_change();
	}

	this.playback_time = function () {
		this.counter++;
		if (this.properties.source.value == 1 && this.properties.auto_download.enabled && this.counter == 2 && this.images.length == 0) {
			var np = fb.GetNowPlaying();
			if (panel.metadb.Path == np.Path && panel.metadb.SubSong == np.SubSong) {
				this.download();
			}
		}
	}

	this.containsXY = function (x, y) {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}

	this.image_containsxXY = function (x, y) {
		switch (true) {
		case !this.images.length:
		case this.properties.mode.value == 0 && !this.overlay: // grid
		case this.properties.mode.value != 0 && this.containsXY(x, y): // not grid
			return false;
		default:
			return x > this.image_xywh[0] && x < this.image_xywh[0] + this.image_xywh[2] && y > this.image_xywh[1] && y < this.image_xywh[1] + this.image_xywh[3];
		}
	}

	this.wheel = function (s) {
		var offset = this.offset - s;
		switch (true) {
		case !this.containsXY(this.mx, this.my):
		case this.properties.mode.value == 0 && this.overlay: // grid
			if (this.images.length < 2) {
				return;
			}
			this.image -= s;
			if (this.image < 0) {
				this.image = this.images.length - 1;
			}
			if (this.image >= this.images.length) {
				this.image = 0;
			}
			window.Repaint();
			return;
		case this.properties.mode.value == 0: // grid
			if (this.img_rows < this.rows) {
				return;
			}
			if (offset < 0) {
				offset = 0;
			}
			if (offset > this.img_rows - this.rows) {
				offset = this.img_rows - this.rows + 1;
			}
			break;
		case this.properties.mode.value == 1: // left
		case this.properties.mode.value == 2: // right
			if (this.images.length < this.rows) {
				return;
			}
			if (offset < 0) {
				offset = 0;
			}
			if (offset + this.rows > this.images.length) {
				offset = this.images.length - this.rows + 1;
			}
			break;
		case this.properties.mode.value == 3: // top
		case this.properties.mode.value == 4: // bottom
			if (this.images.length < this.columns) {
				return;
			}
			if (offset < 0) {
				offset = 0;
			}
			if (offset + this.columns > this.images.length) {
				offset = this.images.length - this.columns + 1;
			}
			break;
		}
		if (this.offset != offset) {
			this.offset = offset;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
	}

	this.move = function (x, y) {
		this.mx = x;
		this.my = y;
		this.index = this.images.length;
		switch (true) {
		case !this.containsXY(x, y):
			break;
		case this.properties.mode.value == 0: // grid
			if (this.overlay) {
				return window.SetCursor(this.close_btn.move(x, y) ? IDC_HAND : IDC_ARROW);
			}
			var tmp = Math.floor(x / this.properties.px.value);
			if (tmp < this.columns) {
				this.index = tmp + ((Math.floor(y / this.properties.px.value) + this.offset) * this.columns);
			}
			break;
		case this.properties.mode.value == 1: // left
		case this.properties.mode.value == 2: // right
			this.index = Math.floor(y / this.properties.px.value) + this.offset;
			break;
		case this.properties.mode.value == 3: // top
		case this.properties.mode.value == 4: // bottom
			this.index = Math.floor(x / this.properties.px.value) + this.offset;
			break;
		}
		window.SetCursor(this.index < this.images.length ? IDC_HAND : IDC_ARROW);
	}

	this.lbtn_up = function (x, y) {
		switch (true) {
		case !this.containsXY(x, y):
		case this.properties.mode.value == 0 && this.overlay && this.close_btn.lbtn_up(x, y):
			break;
		case this.properties.mode.value == 0 && !this.overlay && this.index < this.images.length:
			this.image = this.index;
			this.enable_overlay(true);
			break;
		case this.index < this.images.length:
			if (this.image != this.index) {
				this.image = this.index;
				window.Repaint();
			}
			break;
		}
	}

	this.lbtn_dblclk = function (x, y) {
		if (this.image_containsxXY(x, y)) {
			_run(this.images[this.image].Path);
		}
	}

	this.rbtn_up = function (x, y) {
		panel.m.AppendMenuItem(MF_STRING, 1000, 'Custom folder');
		panel.m.AppendMenuItem(MF_STRING, 1001, 'Last.fm artist art');
		panel.m.CheckMenuRadioItem(1000, 1001, this.properties.source.value + 1000);
		panel.m.AppendMenuSeparator();
		if (this.properties.source.value == 0) { // custom folder
			panel.m.AppendMenuItem(MF_STRING, 1002, 'Set custom folder...');
		} else { // last.fm
			panel.m.AppendMenuItem(panel.metadb ? MF_STRING : MF_GRAYED, 1003, 'Download now');
			panel.m.AppendMenuItem(MF_STRING, 1004, 'Automatic downloads');
			panel.m.CheckMenuItem(1004, this.properties.auto_download.enabled);
			_.forEach(this.limits, function (item) {
				panel.s10.AppendMenuItem(MF_STRING, item + 1010, item);
			});
			panel.s10.CheckMenuRadioItem(_.first(this.limits) + 1010, _.last(this.limits) + 1010, this.properties.limit.value + 1010);
			panel.s10.AppendTo(panel.m, MF_STRING, 'Limit');
		}
		panel.m.AppendMenuSeparator();
		if (!panel.text_objects.length && !panel.list_objects.length) {
			_.forEach(this.modes, function (item, i) {
				panel.s11.AppendMenuItem(MF_STRING, i + 1050, _.capitalize(item));
			});
			panel.s11.CheckMenuRadioItem(1050, 1055, this.properties.mode.value + 1050);
			panel.s11.AppendMenuSeparator();
			var flag = this.properties.mode.value != 5 ? MF_STRING : MF_GRAYED;
			_.forEach(this.pxs, function (item) {
				panel.s11.AppendMenuItem(flag, item + 1000, item + 'px');
			});
			panel.s11.CheckMenuRadioItem(_.first(this.pxs) + 1000, _.last(this.pxs) + 1000, this.properties.px.value + 1000);
			panel.s11.AppendMenuSeparator();
			panel.s11.AppendMenuItem(flag, 1399, 'Circular');
			panel.s11.AppendTo(panel.m, MF_STRING, 'Thumbs');
			panel.m.AppendMenuSeparator();
		}
		panel.s12.AppendMenuItem(MF_STRING, 1400, 'Off');
		panel.s12.AppendMenuItem(MF_STRING, 1405, '5 seconds');
		panel.s12.AppendMenuItem(MF_STRING, 1410, '10 seconds');
		panel.s12.AppendMenuItem(MF_STRING, 1420, '20 seconds');
		panel.s12.CheckMenuRadioItem(1400, 1420, this.properties.cycle.value + 1400);
		panel.s12.AppendTo(panel.m, MF_STRING, 'Cycle');
		panel.m.AppendMenuSeparator();
		if (this.image_containsxXY(x, y)) {
			if (this.properties.mode.value != 0) {
				panel.m.AppendMenuItem(MF_STRING, 1500, 'Crop (focus on centre)');
				panel.m.AppendMenuItem(MF_STRING, 1501, 'Crop (focus on top)');
				panel.m.AppendMenuItem(MF_STRING, 1502, 'Stretch');
				panel.m.AppendMenuItem(MF_STRING, 1503, 'Centre');
				panel.m.CheckMenuRadioItem(1500, 1503, this.properties.aspect.value + 1500);
				panel.m.AppendMenuSeparator();
			}
			if (this.properties.source.value == 1 && this.images.length > 1) {
				panel.m.AppendMenuItem(this.default_file != this.images[this.image].Path ? MF_STRING : MF_GRAYED, 1520, 'Set as default');
				panel.m.AppendMenuItem(utils.IsFile(this.default_file) ? MF_STRING : MF_GRAYED, 1521, 'Clear default');
				panel.m.AppendMenuSeparator();
			}
			panel.m.AppendMenuItem(MF_STRING, 1530, 'Open image');
			panel.m.AppendMenuItem(MF_STRING, 1531, 'Delete image');
			panel.m.AppendMenuSeparator();
		}
		panel.m.AppendMenuItem(utils.IsFolder(this.folder) ? MF_STRING : MF_GRAYED, 1540, 'Open containing folder');
		panel.m.AppendMenuSeparator();
	}

	this.rbtn_up_done = function (idx) {
		switch (idx) {
		case 1000:
		case 1001:
			this.properties.source.value = idx - 1000;
			this.artist = '';
			this.folder = '';
			panel.item_focus_change();
			break;
		case 1002:
			this.properties.tf.value = utils.InputBox('Enter title formatting or an absolute path to a folder.\n\nYou can specify multiple folders by using | as a separator.', window.Name, this.properties.tf.value);
			this.folder = '';
			panel.item_focus_change();
			break;
		case 1003:
			this.download();
			break;
		case 1004:
			this.properties.auto_download.toggle();
			break;
		case 1011:
		case 1013:
		case 1015:
		case 1020:
		case 1025:
		case 1030:
			this.properties.limit.value = idx - 1010;
			break;
		case 1050:
		case 1051:
		case 1052:
		case 1053:
		case 1054:
		case 1055:
			this.properties.mode.value = idx - 1050;
			this.size(true);
			window.Repaint();
			break;
		case 1075:
		case 1100:
		case 1150:
		case 1200:
		case 1250:
		case 1300:
			this.properties.px.value = idx - 1000;
			this.update();
			window.Repaint();
			break;
		case 1399:
			this.properties.circular.toggle();
			this.update();
			window.Repaint();
			break;
		case 1400:
		case 1405:
		case 1410:
		case 1420:
			this.properties.cycle.value = idx - 1400;
			break;
		case 1500:
		case 1501:
		case 1502:
		case 1503:
			this.properties.aspect.value = idx - 1500;
			window.Repaint();
			break;
		case 1520:
			this.set_default(this.images[this.image].Path.split('\\').pop());
			break;
		case 1521:
			this.set_default(undefined);
			break;
		case 1530:
			_run(this.images[this.image].Path);
			break;
		case 1531:
			utils.RemovePath(this.images[this.image].Path);
			this.update();
			break;
		case 1540:
			if (this.images.length) {
				_explorer(this.images[this.image].Path);
			} else {
				_run(this.folder);
			}
			break;
		}
	}

	this.key_down = function (k) {
		switch (k) {
		case VK_ESCAPE:
			if (this.properties.mode.value == 0 && this.overlay) { // grid
				this.enable_overlay(false);
			}
			break;
		case VK_LEFT:
		case VK_UP:
			this.wheel(1);
			break
		case VK_RIGHT:
		case VK_DOWN:
			this.wheel(-1);
			break;
		}
	}

	this.make_thumb = function (img) {
		var size = this.properties.px.value;

		if (img.Width < img.Height) {
			var src_x = 0;
			var src_w = img.Width;
			var src_h = img.Width;
			var src_y = Math.round((img.Height - src_h) / 4);
		} else {
			var src_y = 0;
			var src_w = img.Height;
			var src_h = img.Height;
			var src_x = Math.round((img.Width - src_w) / 2);
		}

		var square = utils.CreateImage(size, size);
		var temp_gr = square.GetGraphics();
		temp_gr.DrawImage(img, 0, 0, size, size, src_x, src_y, src_w, src_h);
		square.ReleaseGraphics();
		return square;
	}

	this.update = function () {
		this.image = 0;
		_dispose.apply(null, this.images);
		_dispose.apply(null, this.thumbs);
		this.images = [];
		this.thumbs = [];

		var files = _getFiles(this.folder, this.exts);
		if (this.properties.source.value == 1 && files.length > 1) {
			this.default_file = this.folder + this.defaults[this.artist];
			var tmp = _.indexOf(files, this.default_file);
			if (tmp > -1) {
				files.splice(tmp, 1);
				files.unshift(this.default_file);
			}
		}

		files.forEach((function (item) {
			var image = utils.LoadImage(item);
			if (image) {
				this.images.push(image);
				this.thumbs.push(this.make_thumb(image));
			}
		}).bind(this));

		if (this.circular_mask) this.circular_mask.Dispose();
		this.circular_mask = utils.CreateImage(512, 512);
		temp_gr = this.circular_mask.GetGraphics();
		temp_gr.FillEllipse(256, 256, 256, 256, RGB(0, 0, 0));
		this.circular_mask.ReleaseGraphics();
		temp_gr = null;

		this.size(true);
		window.Repaint();
	}

	this.enable_overlay = function (b) {
		this.overlay = b;
		window.Repaint();
	}

	this.set_default = function (val) {
		this.defaults[this.artist] = val;
		_save(this.json_file, JSON.stringify(this.defaults));
		this.update();
	}

	this.download = function () {
		if (!_tagged(this.artist)) {
			return;
		}
		var url = 'https://www.last.fm/music/' + encodeURIComponent(this.artist) + '/+images';
		var task_id = utils.HTTPRequestAsync(window.ID, 0, url);
		this.base[task_id] = this.folder + utils.ReplaceIllegalChars(this.artist) + '_';
	}

	this.http_request_done = function (id, success, content) {
		if (!this.base[id]) return; // we didn't request this id??
		if (!success) return console.log(N, content);

		_(_getElementsByTagName(content, 'li'))
			.filter({ className : 'image-list-item-wrapper' })
			.take(this.properties.limit.value)
			.forEach(function (item) {
				var url = item.getElementsByTagName('img')[0].src.replace('avatar170s/', '');
				var filename = this.base[id] + url.substring(url.lastIndexOf('/') + 1) + '.jpg';
				utils.DownloadFileAsync(window.ID, url, filename);
			}, this)
			.value();
	}

	this.interval_func = _.bind(function () {
		this.time++;
		if (this.properties.cycle.value > 0 && this.images.length > 1 && this.time % this.properties.cycle.value == 0) {
			this.image++;
			if (this.image == this.images.length) {
				this.image = 0;
			}
			window.Repaint();
		}
		if (this.time % 3 == 0 && _getFiles(this.folder, this.exts).length != this.images.length) {
			this.update();
		}
	}, this);

	this.get_defaults = function () {
		var defaults = _jsonParseFile(this.json_file);
		if (_.isArray(defaults)) return {};
		return defaults;
	}

	utils.CreateFolder(folders.artists);
	this.mx = 0;
	this.my = 0;
	this.images = [];
	this.thumbs = [];
	this.limits = [1, 3, 5, 10, 15, 20];
	this.modes = ['grid', 'left', 'right', 'top', 'bottom', 'off'];
	this.pxs = [75, 100, 150, 200, 250, 300];
	this.exts = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'heif', 'heic', 'avif'];
	this.json_file = folders.data + 'thumbs.json';
	this.defaults = this.get_defaults();
	this.default_file = '';
	this.folder = '';
	this.artist = '';
	this.base = {};
	this.img = null;
	this.nc = false;
	this.image = 0;
	this.image_xywh = [];
	this.index = 0;
	this.time = 0;
	this.counter = 0;
	this.circular_mask = null;
	this.properties = {
		mode : new _p('2K3.THUMBS.MODE', 4), // 0 grid 1 left 2 right 3 top 4 bottom 5 off
		source : new _p('2K3.THUMBS.SOURCE', 0), // 0 custom folder 1 last.fm
		tf : new _p('2K3.THUMBS.CUSTOM.FOLDER.TF', '$directory_path(%path%)'),
		limit : new _p('2K3.THUMBS.DOWNLOAD.LIMIT', 10),
		px : new _p('2K3.THUMBS.PX', 75),
		cycle : new _p('2K3.THUMBS.CYCLE', 0),
		aspect : new _p('2K3.THUMBS.ASPECT', image.crop_top),
		auto_download : new _p('2K3.THUMBS.AUTO.DOWNLOAD', false),
		circular : new _p('2K3.THUMBS.CIRCULAR', false),
	};
	this.close_btn = new _sb(chars.close, 0, 0, _scale(12), _scale(12), _.bind(function () { return this.properties.mode.value == 0 && this.overlay; }, this), _.bind(function () { this.enable_overlay(false); }, this));
	window.SetInterval(this.interval_func, 1000);
}
