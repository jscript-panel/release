function DrawCover(gr, img, dst_x, dst_y, dst_w, dst_h) {
	if (img) {
		var s = Math.min(dst_w / img.Width, dst_h / img.Height);
		var w = Math.floor(img.Width * s);
		var h = Math.floor(img.Height * s);
		dst_x += Math.round((dst_w - w) / 2);
		dst_w = w;
		dst_h = h;
		gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, 0, 0, img.Width, img.Height);
	}
	gr.DrawRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, 1, g_color_normal_txt);
}

function DrawWallpaper(gr) {
	if (images.wallpaper.Width / images.wallpaper.Height < ww / wh) {
		var src_x = 0;
		var src_w = images.wallpaper.Width;
		var src_h = Math.round(wh * images.wallpaper.Width / ww);
		var src_y = Math.round((images.wallpaper.Height - src_h) / 2);
	} else {
		var src_y = 0;
		var src_w = Math.round(ww * images.wallpaper.Height / wh);
		var src_h = images.wallpaper.Height;
		var src_x = Math.round((images.wallpaper.Width - src_w) / 2);
	}
	var opacity = 1 / 10 * (properties.wallpaperopacity - 3);
	gr.DrawImage(images.wallpaper, 0, p.list.y, ww, p.list.h, src_x, src_y, src_w, src_h, opacity);
}

function DrawColouredText(gr, text, font, default_colour, x, y, w, h, alignment) {
	var etx = String.fromCharCode(3);
	var arr = text.split(etx);
	if (arr.length > 1) {
		var start = 0;
		var styles = [];
		if (text.indexOf(etx) == 0) {
			text = '';
		} else {
			text = arr[0];
			start = text.length;
		}
		arr.shift();
		for (var i = 0; i < arr.length; i += 2) {
			var colour = arr[i];
			var tmp = arr[i + 1];
			var style = {
				start : start,
				length : tmp.length,
				colour : Number("0xFF" + colour.substr(4, 2) + colour.substr(2, 2) + colour.substr(0, 2)),
			}
			start += tmp.length;
			text += tmp
			styles.push(style);
		}

		// apply default font/size to whole range
		var parsed = JSON.parse(font);
		styles.unshift({start:0,length:text.length,Name:parsed.Name,Size:parsed.Size});

		gr.WriteText(text, JSON.stringify(styles), default_colour, x, y, w, h, alignment, 2, 1);
	} else {
		gr.WriteText(text, font, default_colour, x, y, w, h, alignment, 2, 1);
	}
}

function GetKeyboardMask() {
	if (utils.IsKeyPressed(VK_CONTROL))
		return KMask.ctrl;
	if (utils.IsKeyPressed(VK_SHIFT))
		return KMask.shift;
	return KMask.none;
}

function num(strg, nb) {
	var i;
	var str = strg.toString();
	var k = nb - str.length;
	if (k > 0) {
		for (i = 0; i < k; i++) {
			str = "0" + str;
		}
	}
	return str.toString();
}

function button(normal, hover, down) {
	this.img = [normal, hover, down];
	this.w = this.img[0].Width;
	this.h = this.img[0].Height;
	this.state = ButtonStates.normal;

	this.update = function (normal, hover, down) {
		this.img = [normal, hover, down];
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	}

	this.draw = function (gr, x, y) {
		this.x = x;
		this.y = y;
		if (this.img[this.state]) gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h);
	}

	this.checkstate = function (event, x, y) {
		this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
		var old = this.state;
		switch (event) {
		case "lbtn_down":
			switch (this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
				this.isdown = true;
				break;
			}
			break;
		case "lbtn_up":
			this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			this.isdown = false;
			break;
		case "move":
			switch (this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
				break;
			}
			break;
		}

		if (this.state != old) {
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
		return this.state;
	}
}

function playlist_can_add_items(playlistIndex) {
	return !(plman.GetPlaylistLockFilterMask(playlistIndex) & PlaylistLockFilterMask.filter_add);
}

function playlist_can_remove_items(playlistIndex) {
	return !(plman.GetPlaylistLockFilterMask(playlistIndex) & PlaylistLockFilterMask.filter_remove);
}

function playlist_can_rename(playlistIndex) {
	return !(plman.GetPlaylistLockFilterMask(playlistIndex) & PlaylistLockFilterMask.filter_rename);
}

function playlist_can_remove(playlistIndex) {
	return !(plman.GetPlaylistLockFilterMask(playlistIndex) & PlaylistLockFilterMask.filter_remove_playlist);
}

function playlist_can_reorder(playlistIndex) {
	return !(plman.GetPlaylistLockFilterMask(playlistIndex) & PlaylistLockFilterMask.filter_reorder);
}

function get_tfo(pattern) {
	if (!tfo[pattern]) {
		tfo[pattern] = fb.TitleFormat(pattern);
	}
	return tfo[pattern];
}

function renamePlaylist() {
	if (!p.playlistManager.inputbox.text || p.playlistManager.inputbox.text == "" || p.playlistManager.inputboxID == -1)
		p.playlistManager.inputbox.text = p.playlistManager.playlists[p.playlistManager.inputboxID].name;
	if (p.playlistManager.inputbox.text.length > 1 || (p.playlistManager.inputbox.text.length == 1 && (p.playlistManager.inputbox.text >= "a" && p.playlistManager.inputbox.text <= "z") || (p.playlistManager.inputbox.text >= "A" && p.playlistManager.inputbox.text <= "Z") || (p.playlistManager.inputbox.text >= "0" && p.playlistManager.inputbox.text <= "9"))) {
		p.playlistManager.playlists[p.playlistManager.inputboxID].name = p.playlistManager.inputbox.text;
		plman.RenamePlaylist(p.playlistManager.playlists[p.playlistManager.inputboxID].idx, p.playlistManager.inputbox.text);
		full_repaint();
	}
	p.playlistManager.inputboxID = -1;
}

function inputboxPlaylistManager_activate() {
	if (cPlaylistManager.inputbox_timeout) {
		window.ClearTimeout(cPlaylistManager.inputbox_timeout);
		cPlaylistManager.inputbox_timeout = false;
	}

	p.playlistManager.inputbox.on_focus(true);
	p.playlistManager.inputbox.edit = true;
	p.playlistManager.inputbox.Cpos = p.playlistManager.inputbox.text.length;
	p.playlistManager.inputbox.anchor = p.playlistManager.inputbox.Cpos;
	p.playlistManager.inputbox.SelBegin = p.playlistManager.inputbox.Cpos;
	p.playlistManager.inputbox.SelEnd = p.playlistManager.inputbox.Cpos;
	if (!cInputbox.cursor_interval) {
		p.playlistManager.inputbox.resetCursorTimer();
	}
	p.playlistManager.inputbox.dblclk = true;
	p.playlistManager.inputbox.SelBegin = 0;
	p.playlistManager.inputbox.SelEnd = p.playlistManager.inputbox.text.length;
	p.playlistManager.inputbox.text_selected = p.playlistManager.inputbox.text;
	p.playlistManager.inputbox.select = true;
	full_repaint();
}

function togglePlaylistManager() {
	if (!cPlaylistManager.hscroll_interval) {
		if (cPlaylistManager.visible) {
			cPlaylistManager.hscroll_interval = window.SetInterval(function () {
				p.playlistManager.repaint();
				p.playlistManager.woffset -= cPlaylistManager.step;
				if (p.playlistManager.woffset <= 0) {
					p.playlistManager.woffset = 0;
					cPlaylistManager.visible = false;
					window.SetProperty("JSPLAYLIST.PlaylistManager.Visible", cPlaylistManager.visible);
					p.headerBar.button.update(p.headerBar.slide_open, p.headerBar.slide_open, p.headerBar.slide_open);
					full_repaint();
					window.ClearInterval(cPlaylistManager.hscroll_interval);
					cPlaylistManager.hscroll_interval = false;
				}
			}, 16);
		} else {
			p.playlistManager.refresh();
			cPlaylistManager.hscroll_interval = window.SetInterval(function () {
				p.playlistManager.woffset += cPlaylistManager.step;
				if (p.playlistManager.woffset >= cPlaylistManager.width) {
					p.playlistManager.woffset = cPlaylistManager.width;
					cPlaylistManager.visible = true;
					window.SetProperty("JSPLAYLIST.PlaylistManager.Visible", cPlaylistManager.visible);
					p.headerBar.button.update(p.headerBar.slide_close, p.headerBar.slide_close, p.headerBar.slide_close);
					full_repaint();
					window.ClearInterval(cPlaylistManager.hscroll_interval);
					cPlaylistManager.hscroll_interval = false;
				} else {
					p.playlistManager.repaint();
				}
			}, 16);
		}
	}
}

function on_get_album_art_done(metadb, art_id, image) {
	var cover_metadb = null;
	for (var i = 0; i < p.list.items.length; i++) {
		if (p.list.items[i].metadb && p.list.items[i].metadb.Compare(metadb)) {
			p.list.items[i].cover_img = g_image_cache.set(metadb, image);
			if (!g_mouse_wheel_timeout && !cScrollBar.interval && !cover.repaint_timeout) {
				cover.repaint_timeout = window.SetTimeout(function () {
					cover.repaint_timeout = false;
					if (!g_mouse_wheel_timeout && !cScrollBar.interval)
						full_repaint();
				}, 75);
			}
			break;
		}
	}
}

function image_cache() {
	this.get = function (metadb) {
		var d = properties.showgroupheaders ? tf_group_key.EvalWithMetadb(metadb) : metadb.Path;
		var img = this.cachelist[d];
		if (!img && !cover.timeout) {
			cover.timeout = window.SetTimeout(function () {
				cover.timeout = false;
				metadb.GetAlbumArtAsync(window.ID);
			}, (g_mouse_wheel_timeout || cScrollBar.interval ? 20 : 10));
		}
		return img;
	}

	this.set = function (metadb, image) {
		var max = 250;
		var img;
		if (image) {
			if (image.Width > max || image.Height > max) {
				var s = Math.min(max / image.Width, max / image.Height);
				var w = Math.floor(image.Width * s);
				var h = Math.floor(image.Height * s);
				image.Resize(w, h);
			}
		} else {
			image = images.nocover;
		}
		var d = properties.showgroupheaders ? tf_group_key.EvalWithMetadb(metadb) : metadb.Path;
		this.cachelist[d] = image;
		return image;
	}

	this.reset = function () {
		for (var key in this.cachelist) {
			this.cachelist[key].Dispose();
		}
		this.cachelist = {};
	}

	this.cachelist = {};
}

function reset_cover_timers() {
	if (cover.timeout) {
		window.ClearTimeout(cover.timeout);
		cover.timeout = false;
	}
}

function full_repaint() {
	need_repaint = true;
}

function resize_panels() {
	cRow.playlist_h = scale(cRow.default_playlist_h);
	if (cList.enableExtraLine) {
		cRow.playlist_h += scale(6);
	}

	p.topBar.setSize(0, 0, ww, cTopBar.visible ? cTopBar.height + cHeaderBar.borderWidth : 0);

	p.headerBar.visible = cHeaderBar.locked;
	p.headerBar.setSize(0, p.topBar.h, ww, cHeaderBar.height);
	p.headerBar.calculateColumns();

	// set Size of List
	var list_h = wh - p.topBar.h - (p.headerBar.visible ? p.headerBar.h + cHeaderBar.borderWidth : 0);
	p.list.setSize(0, wh - list_h, ww, list_h);
	if (g_init_on_size) {
		p.list.setItems(true);
	}

	// set Size of scrollbar
	p.scrollbar.setSize(p.list.x + p.list.w - cScrollBar.width, p.list.y, cScrollBar.width, p.list.h);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);

	// set Size of Settings
	p.settings.setSize(0, 0, ww, wh);

	// set Size of PlaylistManager
	cPlaylistManager.visible_on_launch = cPlaylistManager.visible;
	if (cPlaylistManager.visible) {
		cPlaylistManager.visible = g_init_on_size;
		p.playlistManager.woffset = g_init_on_size ? 0 : cPlaylistManager.width;
	}
	p.playlistManager.setSize(ww, p.list.y, cPlaylistManager.width, p.list.h);
	p.playlistManager.refresh();
}

function init() {
	get_font();
	get_colors();
	plman.SetActivePlaylistContext();
	images.wallpaper = get_wallpaper();

	if (!properties.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	}

	p.list = new oList("p.list");
	p.topBar = new oTopBar();
	p.headerBar = new oHeaderBar();
	p.headerBar.initColumns();
	p.scrollbar = new PlaylistScrollBar();

	p.playlistManager = new oPlaylistManager();
	p.settings = new oSettings();

	window.SetInterval(function () {
		if (!window.IsVisible) {
			need_repaint = true;
			return;
		}

		if (need_repaint) {
			need_repaint = false;
			window.Repaint();
		}
	}, 40);
}

function on_size() {
	ww = window.Width;
	wh = window.Height;

	resize_panels();

	if (p.headerBar.columns[0].percent > 0) {
		cover.column = true;
		cGroup.count_minimum = Math.ceil((p.headerBar.columns[0].w) / cRow.playlist_h);
		if (cGroup.count_minimum < cGroup.default_count_minimum)
			cGroup.count_minimum = cGroup.default_count_minimum;
	} else {
		cover.column = false;
		cGroup.count_minimum = cGroup.default_count_minimum;
	}

	if (!g_init_on_size) {
		properties.collapseGroupsByDefault = p.list.groupby[cGroup.pattern_idx].collapseGroupsByDefault != 0;
		update_playlist(properties.collapseGroupsByDefault);
		if (cPlaylistManager.visible_on_launch) {
			if (!cPlaylistManager.init_timeout) {
				cPlaylistManager.init_timeout = window.SetTimeout(function () {
					cPlaylistManager.init_timeout = false;
					togglePlaylistManager();
				}, 150);
			}
		}
		g_init_on_size = true;
	}
}

function on_paint(gr) {
	if (cSettings.visible) {
		p.settings && p.settings.draw(gr);
	} else {
		gr.FillRectangle(0, 0, ww, wh, g_color_normal_bg);
		if (fb.IsPlaying && properties.showwallpaper && images.wallpaper) {
			DrawWallpaper(gr);
		}

		// List
		if (p.list) {
			if (p.list.count > 0) {
				// calculate columns metrics before drawing row contents!
				p.headerBar.calculateColumns();

				// scrollbar
				if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
					p.scrollbar.visible = true;
					p.scrollbar.draw(gr);
				} else {
					p.scrollbar.visible = false;
				}

				// draw rows of the playlist
				p.list.draw(gr);
			} else {
				if (plman.PlaylistCount > 0) {
					var text_top = plman.GetPlaylistName(g_active_playlist);
					var text_bot = "This playlist is empty";
				} else {
					var text_top = "JSPlaylist " + g_script_version + " coded by Br3tt";
					var text_bot = "Create a playlist to start!";
				}
				var y = Math.floor(wh / 2);
				gr.WriteText(text_top, g_font_19_1, g_color_normal_txt, 0, y - g_z5 - height(g_font_19_1), ww, height(g_font_19_1), 2, 1, 1);
				gr.FillRectangle(40, Math.floor(wh / 2), ww - 80, 1, g_color_normal_txt & 0x40ffffff);
				gr.WriteText(text_bot, g_font_12_1, blendColours(g_color_normal_txt, g_color_normal_bg, 0.35), 0, y + g_z5, ww, height(g_font_12_1), 2, 0, 1);
			}
		}

		// draw background part above playlist (topbar + headerbar)
		if (cTopBar.visible || p.headerBar.visible) {
			gr.FillRectangle(0, 0, ww, p.list.y, g_color_normal_bg);
		}

		// TopBar
		if (cTopBar.visible) {
			p.topBar && p.topBar.draw(gr);
		}

		// HeaderBar
		if (p.headerBar.visible) {
			p.headerBar && p.headerBar.drawColumns(gr);
			if (p.headerBar.borderDragged && p.headerBar.borderDraggedId >= 0) {
				// all borders
				for (var b = 0; b < p.headerBar.borders.length; b++) {
					var lg_x = p.headerBar.borders[b].x - 2;
					var lg_w = p.headerBar.borders[b].w;
					var segment_h = 5;
					var gap_h = 5;
					if (b == p.headerBar.borderDraggedId) {
						var d = ((mouse_x / 10) - Math.floor(mouse_x / 10)) * 10; // give a value between [0;9]
					} else {
						d = 5;
					}
					var ty = 0;
					for (var lg_y = p.list.y; lg_y < p.list.y + p.list.h + segment_h; lg_y += segment_h + gap_h) {
						ty = lg_y - segment_h + d;
						th = segment_h;
						if (ty < p.list.y) {
							th = th - Math.abs(p.list.y - ty);
							ty = p.list.y;
						}
						if (b == p.headerBar.borderDraggedId) {
							gr.FillRectangle(lg_x, ty, lg_w, th, g_color_normal_txt & 0x32ffffff);
						} else {
							gr.FillRectangle(lg_x, ty, lg_w, th, g_color_normal_txt & 0x16ffffff);
						}
					}
				}
			}
		} else {
			p.headerBar && p.headerBar.drawHiddenPanel(gr);
		}

		// PlaylistManager
		p.playlistManager && p.playlistManager.draw(gr);
	}
}

function on_mouse_lbtn_down(x, y) {
	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("lbtn_down", x, y);
	} else {
		// check list
		p.list.check("lbtn_down", x, y);

		// check scrollbar
		if (!cPlaylistManager.visible) {
			if (p.playlistManager.woffset == 0 && properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("lbtn_down", x, y);
			}

			// check scrollbar scroll on click above or below the cursor
			if (p.scrollbar.hover && !p.scrollbar.cursorDrag) {
				var scrollstep = p.list.totalRowVisible;
				if (y < p.scrollbar.cursorPos) {
					if (!p.list.buttonclicked && !cScrollBar.timeout) {
						p.list.buttonclicked = true;
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timeout = window.SetTimeout(function () {
							cScrollBar.timeout = false;
							p.list.scrollItems(1, scrollstep);
							if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
							cScrollBar.interval = window.SetInterval(function () {
								if (p.scrollbar.hover) {
									if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos > mouse_y) {
										p.list.scrollItems(1, scrollstep);
									}
								}
							}, 60);
						}, 400);
					}
				} else {
					if (!p.list.buttonclicked && !cScrollBar.timeout) {
						p.list.buttonclicked = true;
						p.list.scrollItems(-1, scrollstep);
						cScrollBar.timeout = window.SetTimeout(function () {
							cScrollBar.timeout = false;
							p.list.scrollItems(-1, scrollstep);
							if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
							cScrollBar.interval = window.SetInterval(function () {
								if (p.scrollbar.hover) {
									if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos + p.scrollbar.cursorHeight < mouse_y) {
										p.list.scrollItems(-1, scrollstep);
									}
								}
							}, 60);
						}, 400)
					}
				}
			}
		} else {
			p.playlistManager.check("lbtn_down", x, y);
		}

		// check topbar
		if (cTopBar.visible)
			p.topBar.buttonCheck("lbtn_down", x, y);
		// check headerbar
		if (p.headerBar.visible)
			p.headerBar.on_mouse("lbtn_down", x, y);
	}
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("lbtn_dblclk", x, y);
	} else {
		// check list
		p.list.check("lbtn_dblclk", x, y);
		// check headerbar
		if (p.headerBar.visible)
			p.headerBar.on_mouse("lbtn_dblclk", x, y);

		// check scrollbar
		if (!cPlaylistManager.visible) {
			if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("lbtn_dblclk", x, y);
				if (p.scrollbar.hover) {
					on_mouse_lbtn_down(x, y);
				}
			}
		} else {
			p.playlistManager.check("lbtn_dblclk", x, y);
		}
	}
}

function on_mouse_lbtn_up(x, y) {
	if (cSettings.visible) {
		p.settings.on_mouse("lbtn_up", x, y);
	} else {
		// scrollbar scrolls up and down RESET
		p.list.buttonclicked = false;
		if (cScrollBar.timeout) {
			window.ClearTimeout(cScrollBar.timeout);
			cScrollBar.timeout = false;
		}
		if (cScrollBar.interval) {
			window.ClearInterval(cScrollBar.interval);
			cScrollBar.interval = false;
		}

		// check list
		p.list.check("lbtn_up", x, y);

		// playlist manager (if visible)
		if (p.playlistManager.woffset > 0 || cPlaylistManager.visible) {
			p.playlistManager.check("lbtn_up", x, y);
		}

		// check scrollbar
		if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("lbtn_up", x, y);
		}

		// check topbar
		if (cTopBar.visible)
			p.topBar.buttonCheck("lbtn_up", x, y);

		// check headerbar
		if (p.headerBar.visible)
			p.headerBar.on_mouse("lbtn_up", x, y);

		// repaint on mouse up to refresh covers just loaded
		full_repaint();
	}
}

function on_mouse_rbtn_up(x, y) {
	if (cSettings.visible) {
		p.settings.on_mouse("rbtn_up", x, y);
	} else {
		// check list
		p.list.check("rbtn_up", x, y);
		// check headerbar
		if (p.headerBar.visible)
			p.headerBar.on_mouse("rbtn_up", x, y);
		// playlist manager
		if (p.playlistManager.ishoverItem || p.playlistManager.ishoverHeader) {
			p.playlistManager.check("rbtn_up", x, y);
		}
	}
	return true;
}

function on_mouse_move(x, y) {
	if (x == mouse_x && y == mouse_y)
		return;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("move", x, y);
	} else {
		// playlist manager (if visible)
		if (p.playlistManager.woffset > 0) {
			if (!cPlaylistManager.blink_interval) {
				p.playlistManager.check("move", x, y);
			}
		}

		// check list
		p.list.check("move", x, y);

		// check scrollbar
		if (!cPlaylistManager.visible) {
			if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("move", x, y);
			}
		}

		// check headerbar
		if (p.headerBar.visible)
			p.headerBar.on_mouse("move", x, y);

		// check toolbar for mouse icon dragging mode ***
		if (cPlaylistManager.drag_moved) {
			if (p.playlistManager.ishoverItem) {
				window.SetCursor(IDC_HELP);
			} else {
				window.SetCursor(IDC_NO);
			}
		}
	}

	// save coords
	mouse_x = x;
	mouse_y = y;
}

function on_mouse_wheel(delta) {
	if (g_middle_clicked)
		return;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("wheel", mouse_x, mouse_y, delta);
		if (cSettings.wheel_timeout) window.ClearTimeout(cSettings.wheel_timeout);
		cSettings.wheel_timeout = window.SetTimeout(function () {
			cSettings.wheel_timeout = false;
			on_mouse_move(mouse_x + 1, mouse_y + 1);
		}, 50);
	}

	reset_cover_timers();

	if (p.list.ishover || cScrollBar.timeout) {
		if (!g_mouse_wheel_timeout) {
			g_mouse_wheel_timeout = window.SetTimeout(function () {
				g_mouse_wheel_timeout = false;
				p.list.scrollItems(delta, cList.scrollstep);
			}, 20);
		}
	} else {
		p.playlistManager.check("wheel", mouse_x, mouse_y, delta);
	}
}

function on_mouse_mbtn_down(x, y, mask) {
	g_middle_clicked = true;
	togglePlaylistManager();
}

function on_mouse_mbtn_up(x, y, mask) {
	if (g_middle_click_timeout) window.ClearTimeout(g_middle_click_timeout);
	g_middle_click_timeout = window.SetTimeout(function () {
		g_middle_click_timeout = false;
		g_middle_clicked = false;
	}, 250);
}

function update_playlist(iscollapsed) {
	g_group_id_focused = 0;
	p.list.updateHandleList(iscollapsed);

	p.list.setItems(false);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	if (cHeaderBar.sortRequested) {
		window.SetCursor(IDC_ARROW);
		cHeaderBar.sortRequested = false;
	}
}

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist
	update_playlist(properties.collapseGroupsByDefault);
	p.topBar.setDatas();
	p.headerBar.resetSortIndicators();
	full_repaint();
}

function on_playlists_changed() {
	g_active_playlist = plman.ActivePlaylist;

	p.topBar.setDatas();
	if (cPlaylistManager.visible && cPlaylistManager.drag_dropped) {
		window.SetCursor(IDC_ARROW);
	}
	p.playlistManager.refresh();
	full_repaint();
}

function on_playlist_items_added(playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		update_playlist(properties.collapseGroupsByDefault);
		p.topBar.setDatas();
		p.headerBar.resetSortIndicators();
		full_repaint();
	}
}

function on_playlist_items_removed(playlist_idx, new_count) {
	if (playlist_idx == g_active_playlist) {
		update_playlist(properties.collapseGroupsByDefault);
		p.topBar.setDatas();
		p.headerBar.resetSortIndicators();
		full_repaint();
	}
}

function on_playlist_items_reordered(playlist_idx) {
	if (playlist_idx == g_active_playlist && p.headerBar.columnDragged == 0) {
		update_playlist(properties.collapseGroupsByDefault);
		p.headerBar.resetSortIndicators();
		full_repaint();
	} else {
		p.headerBar.columnDragged = 0;
	}
}

function on_playback_queue_changed() {
	full_repaint();
}

function on_item_focus_change(playlist, from, to) {
	if (playlist == g_active_playlist) {
		p.list.focusedTrackId = to;
		var center_focus_item = p.list.isFocusedItemVisible();

		if (properties.autocollapse) {
			var grpId = p.list.getGroupIdfromTrackId(to);
			if (grpId >= 0) {
				if (p.list.groups[grpId].collapsed) {
					p.list.updateGroupStatus(grpId);
					p.list.setItems(true);
					center_focus_item = p.list.isFocusedItemVisible();
				} else {
					if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
						p.list.setItems(true);
					}
				}
			}
		} else {
			if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
				p.list.setItems(true);
			}
		}
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	}
	full_repaint();
}

function on_metadb_changed() {
	p.list.setItems(false);
	full_repaint();
}

function on_playlist_items_selection_change() {
	full_repaint();
}

function on_key_up(vkey) {
	if (!cSettings.visible) {
		p.list.keypressed = false;
		if (cScrollBar.timeout) {
			window.ClearTimeout(cScrollBar.timeout);
			cScrollBar.timeout = false;
		}
		if (cScrollBar.interval) {
			window.ClearInterval(cScrollBar.interval);
			cScrollBar.interval = false;
		}
		if (vkey == VK_SHIFT) {
			p.list.SHIFT_start_id = null;
			p.list.SHIFT_count = 0;
		}
	}
}

function on_key_down(vkey) {
	if (cSettings.visible) {
		g_textbox_tabbed = false;
		var elements = p.settings.pages[p.settings.currentPageId].elements;
		for (var j = 0; j < elements.length; j++) {
			if (typeof elements[j].on_key_down == "function") elements[j].on_key_down(vkey);
		}
	} else {
		if (p.playlistManager.inputboxID >= 0) {
			switch (vkey) {
			case VK_ESCAPE:
			case 222:
				p.playlistManager.inputboxID = -1;
				full_repaint();
				break;
			default:
				p.playlistManager.inputbox.on_key_down(vkey);
			}
		} else {
			var mask = GetKeyboardMask();
			if (mask == KMask.none) {
				switch (vkey) {
				case VK_F2:
					// rename playlist (playlist manager panel visible)
					if (cPlaylistManager.visible && playlist_can_rename(g_active_playlist)) {
						p.playlistManager.inputbox = new oInputbox(p.playlistManager.w - p.playlistManager.border - p.playlistManager.scrollbarWidth - scale(40), cPlaylistManager.rowHeight - 10, plman.GetPlaylistName(g_active_playlist), "", "renamePlaylist()", 0, 12, 225);
						p.playlistManager.inputboxID = g_active_playlist;
						// activate box content + selection activated
						if (cPlaylistManager.inputbox_timeout) window.ClearTimeout(cPlaylistManager.inputbox_timeout);
						cPlaylistManager.inputbox_timeout = window.SetTimeout(inputboxPlaylistManager_activate, 20);
					}
					break;
				case VK_F5:
					// refresh covers
					g_image_cache.reset();
					full_repaint();
					break;
				case VK_TAB:
					togglePlaylistManager();
					break;
				case VK_UP:
					var scrollstep = 1;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timeout) {
						p.list.keypressed = true;
						reset_cover_timers();

						if (p.list.focusedTrackId < 0) {
							var old_grpId = 0;
						} else {
							var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
						}
						new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
						var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (!properties.autocollapse) {
							if (p.list.groups[old_grpId].collapsed) {
								if (old_grpId > 0 && old_grpId == grpId) {
									new_focus_id = (p.list.groups[grpId].start > 0) ? p.list.groups[grpId].start - scrollstep : 0;
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								}
							}
						}

						if (p.list.groups[grpId].collapsed) {
							if (properties.autocollapse) {
								new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
							} else {
								new_focus_id = p.list.groups[grpId].start;
							}
						}

						if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timeout = window.SetTimeout(function () {
								cScrollBar.timeout = false;
								p.list.scrollItems(1, scrollstep);
								if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
								cScrollBar.interval = window.SetInterval(function () {
									p.list.scrollItems(1, scrollstep);
								}, 50);
							}, 400);
						} else {
							plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
							cScrollBar.timeout = window.SetTimeout(function () {
								cScrollBar.timeout = false;
								if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
								cScrollBar.interval = window.SetInterval(function () {
									new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
									// if new track focused id is in a collapsed group, set the 1st track of the group as the focused track (= group focused)
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
									if (p.list.groups[grpId].collapsed) {
										if (properties.autocollapse) {
											new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
										} else {
											new_focus_id = p.list.groups[grpId].start;
										}
									}
									plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
									plman.ClearPlaylistSelection(g_active_playlist);
									plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
								}, 50);
							}, 400);
						}
					}
					break;
				case VK_DOWN:
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timeout) {
						p.list.keypressed = true;
						reset_cover_timers();

						if (p.list.focusedTrackId < 0) {
							var old_grpId = 0;
						} else {
							var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
						}
						new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
						var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (!properties.autocollapse) {
							if (p.list.groups[old_grpId].collapsed) {
								if (old_grpId < (p.list.groups.length - 1) && old_grpId == grpId) {
									new_focus_id = ((p.list.groups[grpId].start + p.list.groups[grpId].count - 1) < (p.list.count - 1)) ? (p.list.groups[grpId].start + p.list.groups[grpId].count - 1) + 1 : p.list.count - 1;
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								}
							}
						}

						if (p.list.groups[grpId].collapsed) {
							if (properties.autocollapse) {
								new_focus_id = p.list.groups[grpId].start;
							} else {
								new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
							}
						}
						plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
						cScrollBar.timeout = window.SetTimeout(function () {
							cScrollBar.timeout = false;
							if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
							cScrollBar.interval = window.SetInterval(function () {
								new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								if (p.list.groups[grpId].collapsed) {
									if (properties.autocollapse) {
										new_focus_id = p.list.groups[grpId].start;
									} else {
										new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
									}
								}
								plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
							}, 50);
						}, 400);
					}
					break;
				case VK_PGUP:
					var scrollstep = p.list.totalRowVisible;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timeout) {
						p.list.keypressed = true;
						reset_cover_timers();
						new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
						if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timeout = window.SetTimeout(function () {
								cScrollBar.timeout = false;
								p.list.scrollItems(1, scrollstep);
								if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
								cScrollBar.interval = window.SetInterval(function () {
									p.list.scrollItems(1, scrollstep);
								}, 60);
							}, 400);
						} else {
							plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
							cScrollBar.timeout = window.SetTimeout(function () {
								cScrollBar.timeout = false;
								if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
								cScrollBar.interval = window.SetInterval(function () {
									new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
									plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
									plman.ClearPlaylistSelection(g_active_playlist);
									plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
								}, 60);
							}, 400);
						}
					}
					break;
				case VK_PGDN:
					var scrollstep = p.list.totalRowVisible;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timeout) {
						p.list.keypressed = true;
						reset_cover_timers();
						new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
						plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
						cScrollBar.timeout = window.SetTimeout(function () {
							cScrollBar.timeout = false;
							if (cScrollBar.interval) window.ClearInterval(cScrollBar.interval);
							cScrollBar.interval = window.SetInterval(function () {
								new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
								plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
							}, 60);
						}, 400);
					}
					break;
				case VK_RETURN:
					plman.ExecutePlaylistDefaultAction(g_active_playlist, p.list.focusedTrackId);
					break;
				case VK_END:
					if (p.list.count > 0) {
						plman.SetPlaylistFocusItem(g_active_playlist, p.list.count - 1);
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.count - 1, true);
					}
					break;
				case VK_HOME:
					if (p.list.count > 0) {
						plman.SetPlaylistFocusItem(g_active_playlist, 0);
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, 0, true);
					}
					break;
				case VK_DELETE:
					if (playlist_can_remove_items(g_active_playlist)) {
						plman.UndoBackup(g_active_playlist);
						plman.RemovePlaylistSelection(g_active_playlist);
					}
					break;
				}
			} else {
				switch (mask) {
				case KMask.shift:
					switch (vkey) {
					case VK_SHIFT: // SHIFT key alone
						p.list.SHIFT_count = 0;
						break;
					case VK_UP: // SHIFT + KEY UP
						if (p.list.SHIFT_count == 0) {
							if (p.list.SHIFT_start_id == null) {
								p.list.SHIFT_start_id = p.list.focusedTrackId;
							}
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
							if (p.list.focusedTrackId > 0) {
								p.list.SHIFT_count--;
								p.list.focusedTrackId--;
								plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
							}
						} else if (p.list.SHIFT_count < 0) {
							if (p.list.focusedTrackId > 0) {
								p.list.SHIFT_count--;
								p.list.focusedTrackId--;
								plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
							}
						} else {
							plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, false);
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
						}
						break;
					case VK_DOWN: // SHIFT + KEY DOWN
						if (p.list.SHIFT_count == 0) {
							if (p.list.SHIFT_start_id == null) {
								p.list.SHIFT_start_id = p.list.focusedTrackId;
							}
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
							if (p.list.focusedTrackId < p.list.count - 1) {
								p.list.SHIFT_count++;
								p.list.focusedTrackId++;
								plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
							}
						} else if (p.list.SHIFT_count > 0) {
							if (p.list.focusedTrackId < p.list.count - 1) {
								p.list.SHIFT_count++;
								p.list.focusedTrackId++;
								plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
							}
						} else {
							plman.SetPlaylistSelectionSingle(g_active_playlist, p.list.focusedTrackId, false);
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistFocusItem(g_active_playlist, p.list.focusedTrackId);
						}
						break;
					}
					break;
				case KMask.ctrl:
					if (vkey == 65) { // CTRL+A
						fb.RunMainMenuCommand("Edit/Select all");
						full_repaint();
					}
					if (vkey == 88) { // CTRL+X
						if (playlist_can_remove_items(g_active_playlist)) {
							var items = plman.GetPlaylistSelectedItems(g_active_playlist);
							if (items.CopyToClipboard()) {
								plman.UndoBackup(g_active_playlist);
								plman.RemovePlaylistSelection(g_active_playlist);
							}
							items.Dispose();
						}
					}
					if (vkey == 67) { // CTRL+C
						var items = plman.GetPlaylistSelectedItems(g_active_playlist);
						items.CopyToClipboard();
						items.Dispose();
					}
					if (vkey == 86) { // CTRL+V
						if (playlist_can_add_items(g_active_playlist) && fb.CheckClipboardContents()) {
							var items = fb.GetClipboardContents();
							plman.UndoBackup(g_active_playlist);
							plman.InsertPlaylistItems(g_active_playlist, p.list.focusedTrackId + 1, items, false);
							items.Dispose();
						}
					}
					if (vkey == 73) { // CTRL+I
						cTopBar.visible = !cTopBar.visible;
						window.SetProperty("JSPLAYLIST.TopBar.Visible", cTopBar.visible);
						resize_panels();
						full_repaint();
					}
					if (vkey == 84) { // CTRL+T
						// Toggle Toolbar
						if (!p.on_key_timeout) {
							cHeaderBar.locked = !cHeaderBar.locked;
							window.SetProperty("JSPLAYLIST.HEADERBAR.Locked", cHeaderBar.locked);
							if (!cHeaderBar.locked) {
								p.headerBar.visible = false;
							}
							resize_panels();
							full_repaint();
							p.on_key_timeout = window.SetTimeout(function () {
								p.on_key_timeout = false;
							}, 300);
						}
					}
					if (vkey == 89) { // CTRL+Y
						fb.RunMainMenuCommand("Edit/Redo");
					}
					if (vkey == 90) { // CTRL+Z
						fb.RunMainMenuCommand("Edit/Undo");
					}
					break;
				}
			}
		}
	}
}

function on_char(code) {
	if (cSettings.visible) {
		for (var i = 0; i < p.settings.pages.length; i++) {
			for (var j = 0; j < p.settings.pages[i].elements.length; j++) {
				if (p.settings.pages[i].elements[j].objType == "TB") p.settings.pages[i].elements[j].on_char(code);
			}
		}
	} else if (p.playlistManager.inputboxID >= 0) {
		p.playlistManager.inputbox.on_char(code);
	}
}

function on_playback_new_track() {
	images.wallpaper = get_wallpaper();
	full_repaint();
}

function on_playback_dynamic_info_track(type) {
	if (type == 1) {
		images.wallpaper = get_wallpaper();
		full_repaint();
	}
}

function on_playback_stop(reason) {
	if (reason != 2) {
		images.wallpaper = null
		full_repaint();
	}
}

function on_playback_pause(state) {
	if (p.list.nowplaying_y + cRow.playlist_h > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
		window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cRow.playlist_h);
	}
}

function on_playback_time(time) {
	g_seconds = time;
	if (!cSettings.visible && p.list.nowplaying_y + cRow.playlist_h > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h)
		window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cRow.playlist_h);
}

function on_focus(is_focused) {
	if (p.playlistManager.inputboxID >= 0) {
		p.playlistManager.inputbox.on_focus(is_focused);
	}
	if (is_focused) {
		plman.SetActivePlaylistContext();
		g_selHolder.SetPlaylistSelectionTracking();
	} else {
		p.playlistManager.inputboxID = -1;
		full_repaint();
	}
}

function on_font_changed() {
	get_font();
	p.topBar.setButtons();
	p.headerBar.setButtons();
	p.scrollbar.setButtons();
	p.scrollbar.setCursorButton();
	p.playlistManager.setButtons();
	p.settings.setButtons();
	resize_panels();
	window.Repaint();
}

function on_colours_changed() {
	get_colors();
	p.topBar.setButtons();
	p.headerBar.setButtons();
	p.scrollbar.setButtons();
	p.scrollbar.setCursorButton();
	p.playlistManager.setButtons();
	p.settings.setButtons();
	resize_panels();
	window.Repaint();
}

function height(font) {
	return JSON.parse(font).Size + scale(4);
}

function scale(size) {
	return Math.round(size * g_font_size / 12);
}

function _font(name, size, bold) {
	var font = {
		Name : name,
		Size : scale(size),
		Weight : bold == 1 ? 700 : 400,
	};
	return JSON.stringify(font);
}

function get_font() {
	var default_font;

	if (window.IsDefaultUI) {
		default_font = JSON.parse(window.GetFontDUI(FontTypeDUI.playlists));
	} else {
		default_font = JSON.parse(window.GetFontCUI(FontTypeCUI.items));
	}

	var name = default_font.Name;
	g_font_size = default_font.Size;

	cTopBar.height = scale(54);
	cHeaderBar.height = scale(26);
	cHeaderBar.borderWidth = scale(2);
	cSettings.topBarHeight = scale(50);
	cSettings.tabPaddingWidth = scale(16);
	cSettings.rowHeight = scale(30);
	cPlaylistManager.width = scale(220);
	cPlaylistManager.rowHeight = scale(28);
	cPlaylistManager.statusBarHeight = scale(18);
	cScrollBar.width = scale(cScrollBar.defaultWidth);

	g_z2 = scale(2);
	g_z4 = scale(4);
	g_z5 = scale(5);
	g_z10 = scale(10);
	g_z16 = scale(16);

	g_font_12 = _font(name, 12);
	g_font_12_1 = _font(name, 12, 1);

	g_font_15_1 = _font(name, 15, 1);
	g_font_19_1 = _font(name, 19, 1);
	g_font_21_1 = _font(name, 21, 1);

	g_font_awesome_12 = _font("FontAwesome", 12);
	g_font_awesome_20 = _font("FontAwesome", 20);
	g_font_awesome_40 = _font("FontAwesome", 40);

	g_font_group1 = _font(name, 16);
	g_font_group2 = _font(name, 14);

	columns.rating_w = (chars.rating_off.calc_width(g_font_awesome_20) * 5) + 4;
}

function get_colors() {
	if (properties.enableCustomColours) {
		g_color_normal_txt = window.GetProperty("JSPLAYLIST.COLOUR TEXT NORMAL", RGB(180, 180, 180));
		g_color_normal_bg = window.GetProperty("JSPLAYLIST.COLOUR BACKGROUND NORMAL", RGB(25, 25, 35));
		g_color_selected_bg = window.GetProperty("JSPLAYLIST.COLOUR BACKGROUND SELECTED", RGB(130,150,255));
	} else {
		if (window.IsDefaultUI) {
			g_color_normal_txt = window.GetColourDUI(ColourTypeDUI.text);
			g_color_normal_bg = window.GetColourDUI(ColourTypeDUI.background);
			g_color_selected_bg = window.GetColourDUI(ColourTypeDUI.selection);
		} else {
			g_color_normal_txt = window.GetColourCUI(ColourTypeCUI.text);
			g_color_normal_bg = window.GetColourCUI(ColourTypeCUI.background);
			g_color_selected_bg = window.GetColourCUI(ColourTypeCUI.selection_background);
		}
	}

	g_line_colour = blendColours(g_color_normal_txt, g_color_normal_bg, 0.45);
}

function get_wallpaper() {
	if (!properties.showwallpaper) return null;

	var metadb = fb.GetNowPlaying();
	if (!metadb) return null;

	if (properties.wallpapertype == -1) {
		var img = utils.LoadImage(fb.ProfilePath + properties.wallpaperpath);
	} else {
		var img = metadb.GetAlbumArt(properties.wallpapertype);
	}

	if (img && properties.wallpaperblurred) {
		img.StackBlur(properties.wallpaperblurvalue);
	}
	return img;
}

function on_drag_enter() {
	g_drag_drop_status = true;
}

function on_drag_leave() {
	g_drag_drop_status = false;
	g_drag_drop_playlist_manager_hover = false;
	g_drag_drop_track_id = -1;
	g_drag_drop_row_id = -1;
	g_drag_drop_playlist_id = -1;
	p.list.buttonclicked = false;
	if (cScrollBar.interval) {
		window.ClearInterval(cScrollBar.interval);
		cScrollBar.interval = false;
	}
	window.Repaint();
}

function on_drag_over(action, x, y, mask) {
	g_drag_drop_playlist_manager_hover = false;
	g_drag_drop_track_id = -1;
	g_drag_drop_row_id = -1;
	g_drag_drop_bottom = false;

	if (y < p.list.y) {
		action.Effect = 0;
	} else if (cPlaylistManager.visible && p.playlistManager.isHoverObject(x, y)) {
		g_drag_drop_playlist_manager_hover = true;
		p.playlistManager.check("drag_over", x, y);
		if (g_drag_drop_playlist_id == -1) {
			action.Effect = p.playlistManager.ishoverHeader ? 1 : 0;
		} else if (g_drag_drop_internal) {
			action.Effect = g_drag_drop_playlist_id == g_active_playlist ? 0 : 1;
		} else if (playlist_can_add_items(g_drag_drop_playlist_id)) {
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	} else if (g_drag_drop_internal || playlist_can_add_items(g_active_playlist)) {
		p.list.check("drag_over", x, y);
		if (y > p.list.y && y < p.list.y + 40) {
			on_mouse_wheel(1);
		} else if (y > p.list.y + p.list.h - 40 && y < p.list.y + p.list.h) {
			on_mouse_wheel(-1);
		}
		action.Effect = 1;
	} else {
		action.Effect = 0;
	}
	full_repaint();
}

function on_drag_drop(action, x, y, mask) {
	if (y < p.list.y) {
		action.Effect = 0;
	} else if (cPlaylistManager.visible && p.playlistManager.isHoverObject(x, y)) {
		if (g_drag_drop_playlist_id == -1) {
			if (p.playlistManager.ishoverHeader) {
				if (g_drag_drop_internal) {
					var pl = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items")
					plman.InsertPlaylistItems(pl, 0, plman.GetPlaylistSelectedItems(g_active_playlist));
					action.Effect = 0;
				} else {
					action.Playlist = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items");
					action.Base = 0;
					action.ToSelect = false;
					action.Effect = 1;
				}
			} else {
				action.Effect = 0;
			}
		} else if (playlist_can_add_items(g_drag_drop_playlist_id)) {
			var base = plman.GetPlaylistItemCount(g_drag_drop_playlist_id);

			if (g_drag_drop_internal) {
				if (g_drag_drop_playlist_id != g_active_playlist) {
					plman.UndoBackup(g_drag_drop_playlist_id);
					plman.InsertPlaylistItems(g_drag_drop_playlist_id, base, plman.GetPlaylistSelectedItems(g_active_playlist));
				}
				action.Effect = 0;
			} else {
				plman.UndoBackup(g_drag_drop_playlist_id);
				action.Playlist = g_drag_drop_playlist_id;
				action.Base = base;
				action.ToSelect = false;
				action.Effect = 1;
			}
		} else {
			action.Effect = 0;
		}
	} else {
		var new_pos = g_drag_drop_bottom ? plman.GetPlaylistItemCount(g_active_playlist) : g_drag_drop_track_id;
		if (g_drag_drop_internal) {
			plman.UndoBackup(g_active_playlist);
			plman.MovePlaylistSelectionV2(g_active_playlist, new_pos);
			action.Effect = 0;
		} else if (playlist_can_add_items(g_active_playlist)) {
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.UndoBackup(g_active_playlist);
			action.Playlist = g_active_playlist;
			action.Base = new_pos;
			action.ToSelect = true;
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	}
	g_drag_drop_playlist_manager_hover = false;
	g_drag_drop_playlist_id = -1;
	g_drag_drop_track_id = -1;
	g_drag_drop_row_id = -1;
	g_drag_drop_bottom = false;
	g_drag_drop_internal = false;
	full_repaint();
}

String.prototype.calc_width = function (font_str) {
	var font = JSON.parse(font_str);
	return utils.CalcTextWidth(this, font.Name, font.Size, font.Weight || 400);
}

Number.prototype.calc_width = function (font_str) {
	var font = JSON.parse(font_str);
	return utils.CalcTextWidth(this.toString(), font.Name, font.Size, font.Weight || 400);
}

String.prototype.repeat = function (num) {
	if (num >= 0 && num <= 5) {
		var g = Math.round(num);
	} else {
		return "";
	}
	return new Array(g + 1).join(this);
}

window.MinWidth = 360;
window.MinHeight = 200;

var g_script_version = "v2022";
var g_middle_clicked = false;
var g_middle_click_timeout = false;
var g_textbox_tabbed = false;
var g_init_on_size = false;
var g_seconds = 0;
var g_mouse_wheel_timeout = false;
var g_active_playlist = plman.ActivePlaylist;
var g_image_cache = new image_cache();
var g_selHolder = fb.AcquireSelectionHolder();
g_selHolder.SetPlaylistSelectionTracking();

var g_drag_drop_status = false;
var g_drag_drop_bottom = false;
var g_drag_drop_track_id = -1;
var g_drag_drop_row_id = -1;
var g_drag_drop_playlist_id = -1;
var g_drag_drop_playlist_manager_hover = false;
var g_drag_drop_internal = false;

var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_font_size = 0;

var ww = 0, wh = 0;
var mouse_x = 0, mouse_y = 0;
var need_repaint = false;
var foo_playcount = utils.CheckComponent("foo_playcount");
var foo_lastfm_playcount_sync = utils.CheckComponent("foo_lastfm_playcount_sync");
var foo_lastfm = utils.CheckComponent("foo_lastfm");
var tfo = {};
var tf_group_key = null;

var KMask = {
	none: 0,
	ctrl: 1,
	shift: 2
};

var ButtonStates = {
	normal: 0,
	hover: 1,
	down: 2
};

var chars = {
	rating_on : '\uF005',
	rating_off : '\uF006',
	lock : "\uF023",
	list : "\uF0C9",
	play : '\uF04B',
	pause : '\uF04C',
	heart_on : '\uF004',
	heart_off : '\uF08A',
	close : '\uF00D',
	left : '\uF060',
	right : '\uF061',
	up : '\uF077',
	down : '\uF078',
};

var properties = {
	enableCustomColours: window.GetProperty("JSPLAYLIST.Enable Custom Colours", false),
	collapseGroupsByDefault : window.GetProperty("JSPLAYLIST.Collapse Groups by default", false),
	autocollapse : window.GetProperty("JSPLAYLIST.Auto-Collapse", false),
	showgroupheaders : window.GetProperty("JSPLAYLIST.Show Group Headers", true),
	showscrollbar : window.GetProperty("JSPLAYLIST.Show Scrollbar", true),
	showwallpaper : window.GetProperty("JSPLAYLIST.Show Wallpaper", false),
	wallpaperopacity : window.GetProperty("JSPLAYLIST.Wallpaper Opacity", 5), // 5-20% 6-30% 7-40% 8-50% 9-60%
	wallpaperblurred : window.GetProperty("JSPLAYLIST.Wallpaper Blurred", false),
	wallpaperblurvalue : window.GetProperty("JSPLAYLIST.Wallpaper StackBlur value", 60),
	wallpapertype : window.GetProperty("JSPLAYLIST.Wallpaper Type", 0),
	wallpaperpath : window.GetProperty("JSPLAYLIST.Default Wallpaper Path", ""),
	max_columns : 24,
	max_patterns : 25,
	use_foo_lastfm_playcount_sync : window.GetProperty("Love tracks with foo_lastfm_playcount_sync", false),
};

var images = {
	wallpaper : null,
};

var cRow = {
	default_playlist_h : window.GetProperty("JSPLAYLIST.Playlist Row Height in Pixel", 28),
	playlist_h : 29,
};

var p = {
	topbar : null,
	headerBar : null,
	list : null,
	playlistManager : null,
	settings : null,
	on_key_timeout : false
};

var cSettings = {
	visible : false,
	topBarHeight : 50,
	tabPaddingWidth : 16,
	rowHeight : 30,
	wheel_timeout : false
};

var cPlaylistManager = {
	width : 220,
	rowHeight : 28,
	showStatusBar : true,
	statusBarHeight : 18,
	step : 50,
	visible : window.GetProperty("JSPLAYLIST.PlaylistManager.Visible", false),
	visible_on_launch : false,
	drag_move_timeout : false,
	hscroll_interval : false,
	vscroll_interval : false,
	vscroll_timeout : false,
	blink_interval : false,
	blink_counter : -1,
	blink_id : null,
	drag_clicked : false,
	drag_moved : false,
	drag_target_id : -1,
	drag_source_id : -1,
	drag_x : -1,
	drag_y : -1,
	drag_dropped : false,
	rightClickedId : null,
	init_timeout : false,
	inputbox_timeout : false,
	sortPlaylists_timer : false
};

var cTopBar = {
	height : 54,
	visible : window.GetProperty("JSPLAYLIST.TopBar.Visible", true)
};

var cHeaderBar = {
	height : 26,
	borderWidth : 2,
	locked : window.GetProperty("JSPLAYLIST.HEADERBAR.Locked", true),
	timerAutoHide : false,
	sortRequested : false
};

var cScrollBar = {
	defaultWidth : 17,
	width : 17,
	buttonType : {
		cursor : 0,
		up : 1,
		down : 2
	},
	interval : false,
	timeout : false,
	timer_counter : 0,
	repaint_timeout : false,
};

var cGroup = {
	default_collapsed_height : 3,
	default_expanded_height : 3,
	collapsed_height : 3,
	expanded_height : 3,
	default_count_minimum : window.GetProperty("JSPLAYLIST.Minimum number of rows in a group", 0),
	count_minimum : window.GetProperty("JSPLAYLIST.Minimum number of rows in a group", 0),
	extra_rows : 0,
	pattern_idx : window.GetProperty("JSPLAYLIST.GROUPBY.Pattern Index", 0)
};

var cover = {
	show : true,
	column : false,
	timeout : false,
	repaint_timeout : false,
	w : 250,
	h : 250,
};

var cList = {
	scrollstep : window.GetProperty("JSPLAYLIST.Playlist Scroll Step", 3),
	scroll_timer : false,
	scroll_delta : cRow.playlist_h,
	scroll_direction : 1,
	scroll_step : Math.floor(cRow.playlist_h / 3),
	scroll_div : 2,
	borderWidth : 2,
	enableExtraLine : window.GetProperty("JSPLAYLIST.Enable Extra Line", true)
};

var columns = {
	mood_x : 0,
	mood_w : 0,
	rating_x : 0,
	rating_w : 0,
};

init();
