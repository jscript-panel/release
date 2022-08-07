ppt.sort_album_tf = window.GetProperty("SMOOTH.SORT.ALBUM", "%album artist% | %date% | %album% | %discnumber% | %tracknumber% | %title%");
ppt.sort_artist_tf = window.GetProperty("SMOOTH.SORT.ARTIST", "$meta(artist,0) | %date% | %album% | %discnumber% | %tracknumber% | %title%");
ppt.sort_album_artist_tf = window.GetProperty("SMOOTH.SORT.ALBUM.ARTIST", "%album artist% | %date% | %album% | %discnumber% | %tracknumber% | %title%");

ppt.panelMode = window.GetProperty("SMOOTH.DISPLAY.MODE", 1); // 0 = column, 1 = column + art, 2 = album art grid, 3 - album art grid + overlay text
ppt.sendto_playlist = window.GetProperty("SMOOTH.SENDTO.PLAYLIST", "Library selection");
ppt.sendto_playlist_play = window.GetProperty("SMOOTH.SENDTO.PLAYLIST.PLAY", true);
ppt.showAllItem = window.GetProperty("SMOOTH.SHOW.ALL.ITEMS", true);
ppt.tagMode = window.GetProperty("SMOOTH.TAG.MODE", 0); // 0 = album, 1 = artist, 2 = album artist
ppt.tagText = ["album", "artist", "album artist"];

ppt.default_thumbnailWidthMin = window.GetProperty("SMOOTH.THUMB.MIN.WIDTH", 130);
ppt.thumbnailWidthMin = ppt.default_thumbnailWidthMin;
ppt.default_lineHeightMin = window.GetProperty("SMOOTH.LINE.MIN.HEIGHT", 120);
ppt.lineHeightMin = ppt.default_lineHeightMin;

var tfo = {
	groupkey_album : fb.TitleFormat("$if2(%album artist%,Unknown Artist) ^^ $if2(%album%,'('Singles')')"),
	groupkey_artist : fb.TitleFormat("$if2($meta(artist,0),Unknown Artist)"),
	groupkey_album_artist : fb.TitleFormat("%album artist%"),
	crc_artist : fb.TitleFormat("$crc32(artists$meta(artist,0))"),
	crc_album_artist : fb.TitleFormat("$crc32(artists%album artist%)"),
	crc_path : fb.TitleFormat("$crc32(%path%)"),
};

function oGroup(index, start, metadb, groupkey) {
	this.index = index;
	this.start = start;
	this.count = 1;
	this.metadb = metadb;
	this.groupkey = groupkey;
	this.cachekey = null;
	this.cover_image = null;
	this.image_requested = false;

	var arr = this.groupkey.split(" ^^ ");
	this.artist = arr[0];
	this.album = arr[1] || "";

	if (metadb) {
		switch (ppt.tagMode) {
		case 0:
			this.cachekey = tfo.crc_path.EvalWithMetadb(metadb);
			break;
		case 1:
			this.cachekey = tfo.crc_artist.EvalWithMetadb(metadb);
			break;
		case 2:
			this.cachekey = tfo.crc_album_artist.EvalWithMetadb(metadb);
			break;
		}
	}

	this.finalise = function (handles) {
		this.handles = handles.Clone();
		this.count = this.handles.Count;
		this.duration = utils.FormatDuration(this.handles.CalcTotalDuration());
	}
}

function oBrowser() {
	this.repaint = function () {
		need_repaint = true;
	}

	this.setSize = function () {
		this.x = 0;
		this.y = ppt.showHeaderBar ? ppt.headerBarHeight : 0;
		this.w = ww - cScrollBar.width;
		this.h = wh - this.y;

		switch (ppt.panelMode) {
		case 0:
		case 1:
			ppt.lineHeightMin = scale(ppt.default_lineHeightMin);
			this.totalColumns = 1;
			this.rowsCount = this.groups.length;
			this.thumbnailWidth = this.w;
			switch (ppt.tagMode) {
			case 0: // album
				this.rowHeight = (ppt.panelMode == 0 ? Math.ceil(g_fsize * 4.5) : ppt.lineHeightMin);
				break;
			case 1: // artist
			case 2: // album artist
				this.rowHeight = (ppt.panelMode == 0 ? Math.ceil(g_fsize * 2.5) : ppt.lineHeightMin);
				break;
			}
			break;
		case 2:
		case 3:
			ppt.thumbnailWidthMin = scale(ppt.default_thumbnailWidthMin);
			this.totalColumns = Math.floor(this.w / ppt.thumbnailWidthMin);
			if (this.totalColumns < 1) this.totalColumns = 1;
			this.thumbnailWidth = this.w / this.totalColumns;
			this.rowsCount = Math.ceil(this.groups.length / this.totalColumns);
			this.rowHeight = this.thumbnailWidth;
			if (ppt.panelMode == 2) this.rowHeight += g_font_height * 3;
			break;
		}

		this.totalRows = Math.ceil(this.h / this.rowHeight);
		this.totalRowsVis = Math.floor(this.h / this.rowHeight);

		this.inputbox.setSize(ww * 0.6, scale(20), g_fsize + 2);
		this.scrollbar.setSize();
		this.reset_bt = new button(images.reset, images.reset_hover, images.reset_hover);

		scroll = Math.round(scroll / this.rowHeight) * this.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update
		this.scrollbar.updateScrollbar();
	}

	this.init_groups = function () {
		this.groups = [];
		if (this.list.Count == 0) return;

		var previous = "";
		var g = 0;
		var handles = fb.CreateHandleList();
		var arr = [];

		switch (ppt.tagMode) {
		case 0: // album
			arr = tfo.groupkey_album.EvalWithMetadbs(this.list).toArray();
			break;
		case 1: // artist
			arr = tfo.groupkey_artist.EvalWithMetadbs(this.list).toArray();
			break;
		case 2: // album artist
			arr = tfo.groupkey_album_artist.EvalWithMetadbs(this.list).toArray();
			break;
		}

		for (var i = 0; i < this.list.Count; i++) {
			var handle = this.list.GetItem(i);
			var meta = arr[i];
			var current = meta.toLowerCase();

			if (current != previous) {
				if (g > 0) {
					this.groups[g - 1].finalise(handles);
					handles.RemoveAll();
				}
				this.groups.push(new oGroup(g + 1, i, handle, meta));
				handles.AddItem(handle);
				g++;
				previous = current;
			} else {
				handles.AddItem(handle);
			}
		}

		if (g > 0) {
			this.groups[g - 1].finalise(handles);

			if (g > 1 && ppt.showAllItem) {
				var meta = "All items";
				if (ppt.tagMode == 0) {
					var all_items = "(" + this.groups.length + " " + ppt.tagText[ppt.tagMode] + "s)"
					meta += " ^^ " + all_items;
				}
				this.groups.unshift(new oGroup(0, 0, null, meta));
				this.groups[0].finalise(this.list);
			}
		}
		handles.Dispose();
	}

	this.populate = function () {
		this.list = fb.GetLibraryItems();

		if (g_filter_text.length > 0) {
			try {
				this.list = this.list.GetQueryItems(g_filter_text);
			} catch (e) {
				// invalid query
			}
		}

		if (ppt.tagMode == 0) { //album
			this.list.SortByFormat(ppt.sort_album_tf, 1);
		} else if (ppt.tagMode == 1) { // artist
			this.list.SortByFormat(ppt.sort_artist_tf, 1);
		} else if (ppt.tagMode == 2) { // allbum artist
			this.list.SortByFormat(ppt.sort_album_artist_tf, 1);
		}

		this.init_groups();
		get_metrics();
		this.repaint();
	}

	this.activateItem = function (index) {
		if (this.groups.length == 0)
			return;
		this.selectedIndex = index;
	}

	this.sendItemsToPlaylist = function (index) {
		if (this.groups.length == 0)
			return;

		var p = plman.FindOrCreatePlaylist(ppt.sendto_playlist, true);
		plman.UndoBackup(p);
		plman.ClearPlaylist(p);
		plman.InsertPlaylistItems(p, 0, this.groups[index].handles)
		plman.ActivePlaylist = p;
		if (ppt.sendto_playlist_play) {
			plman.ExecutePlaylistDefaultAction(p, 0);
		}
	}

	this.getlimits = function () {
		if (this.groups.length <= this.totalRowsVis * this.totalColumns) {
			var start_ = 0;
			var end_ = this.groups.length;
		} else {
			var start_ = Math.round(scroll_ / this.rowHeight) * this.totalColumns;
			var end_ = Math.round((scroll_ + wh + this.rowHeight) / this.rowHeight) * this.totalColumns;
			// check values / limits
			end_ = (this.groups.length < end_) ? this.groups.length : end_;
			start_ = start_ > 0 ? start_ - this.totalColumns : (start_ < 0 ? 0 : start_);
		}
		g_start_ = start_;
		g_end_ = end_;
	}

	this.draw = function (gr) {
		this.getlimits();

		var total = this.groups.length;
		var cx = 0;
		var ax = 0;
		var ay = 0;
		var aw = this.thumbnailWidth;
		var ah = this.rowHeight;

		for (var i = g_start_; i < g_end_; i++) {
			var group = this.groups[i];

			var row = Math.floor(i / this.totalColumns);
			ax = this.x + (cx * this.thumbnailWidth);
			ay = Math.floor(this.y + (row * this.rowHeight) - scroll_);
			group.x = ax;
			group.y = ay;

			var normal_text = g_color_normal_txt;
			var fader_txt = blendColours(g_color_normal_txt, g_color_normal_bg, 0.25);

			if (ppt.panelMode != 0 && !group.cover_image && !group.image_requested && group.metadb) {
				group.image_requested = true;
				var id = ppt.tagMode == 0 ? AlbumArtId.front : AlbumArtId.artist;
				var filename = generate_filename(group.cachekey, id);
				group.cover_image = get_art(group.metadb, filename, id);
			}

			switch (ppt.panelMode) {
			case 0:
			case 1:
				if (i % 2 != 0) {
					gr.FillRectangle(ax, ay, aw, ah, g_color_normal_txt & 0x08ffffff);
				}

				// selected?
				if (i == this.selectedIndex) {
					gr.FillRectangle(ax, ay, aw, ah, g_color_selected_bg & 0xb0ffffff);
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
					if (normal_text == g_color_selected_bg) {
						normal_text = g_color_normal_bg;
						fader_txt = blendColours(normal_text, g_color_normal_bg, 0.25);
					}
				}

				var text_left = 8;
				var text_width = aw - (text_left * 2);
				if (ppt.panelMode == 1) {
					var cover_size = ah - (text_left * 2);
					if (ppt.showAllItem && i == 0 && this.groups.length > 1) {
						gr.FillRectangle(ax + text_left, ay + text_left, cover_size, cover_size, g_color_normal_bg);
						drawImage(gr, images.all, ax + text_left, ay + text_left, cover_size, cover_size, ppt.autoFill, normal_text & 0x25ffffff);
					} else {
						if (!group.cover_image) gr.FillRectangle(ax + text_left, ay + text_left, cover_size, cover_size, g_color_normal_bg);
						drawImage(gr, group.cover_image || images.noart, ax + text_left, ay + text_left, cover_size, cover_size, ppt.autoFill, normal_text & 0x25ffffff);
					}
					text_left += cover_size + 8;
					text_width = aw - text_left - 16;
				}

				if (ppt.tagMode == 0) { // album
					var fh = g_font_height + 4;
					if (ppt.panelMode == 0) { // no art
						gr.WriteText(group.album, g_font_bold, normal_text, ax + text_left, ay + (ah / 2) - fh, text_width, fh, 0, 2, 1, 1);
						gr.WriteText(group.artist, g_font, fader_txt, ax + text_left, ay + (ah / 2), text_width, fh, 0, 2, 1, 1);
					} else {
						gr.WriteText(group.album, g_font_bold, normal_text, ax + text_left, ay + fh, text_width, fh, 0, 2, 1, 1);
						gr.WriteText(group.artist, g_font, fader_txt, ax + text_left, ay + (fh * 2), text_width, fh, 0, 2, 1, 1);
						gr.WriteText(group.count + (group.count > 1 ? " tracks. " : " track. ") + group.duration + ".", g_font, fader_txt, ax + text_left, ay + (fh * 3) - 2, text_width, fh, 0, 2, 1, 1);
					}
				} else { // artist/album artist, 1 line
					gr.WriteText(group.artist, g_font, normal_text, ax + text_left, ay, text_width, ah, 0, 2, 1, 1);
				}
				break;
			case 2:
				var text_left = 8;
				var cover_size = aw - (text_left * 2);

				// selected?
				if (i == this.selectedIndex) {
					gr.FillRectangle(ax, ay, aw, ah, g_color_selected_bg & 0xb0ffffff);
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
					if (normal_text == g_color_selected_bg) {
						normal_text = g_color_normal_bg;
						fader_txt = blendColours(normal_text, g_color_normal_bg, 0.25);
					}
				}

				if (ppt.showAllItem && i == 0 && this.groups.length > 1) {
					gr.FillRectangle(ax + text_left, ay + text_left, cover_size, cover_size, g_color_normal_bg);
					drawImage(gr, images.all, ax + text_left, ay + text_left, cover_size, cover_size, ppt.autoFill, normal_text & 0x25ffffff);
				} else {
					if (group.cover_image) {
						drawImage(gr, group.cover_image, ax + text_left, ay + text_left, cover_size, cover_size, ppt.autoFill, normal_text & 0x25ffffff);
					} else {
						gr.FillRectangle(ax + text_left, ay + text_left, cover_size, cover_size, g_color_normal_bg);
						drawImage(gr, images.noart, ax + text_left, ay + text_left, cover_size, cover_size, ppt.autoFill, normal_text & 0x25ffffff);
					}
				}

				if (ppt.tagMode == 0) {
					gr.WriteText(group.album, g_font_bold, normal_text, ax + text_left, ay + cover_size + (text_left * 2), cover_size, g_font_bold_height + 2, 2, 2, 1, 1);
					gr.WriteText(group.artist, g_font, fader_txt, ax + text_left, ay + cover_size + (text_left * 2) + (g_font_bold_height * 1.4), cover_size, g_font_height + 2, 2, 2, 1, 1);
				} else {
					gr.WriteText(group.artist, g_font_bold, normal_text, ax + text_left, ay + cover_size + text_left, cover_size, g_font_bold_height * 3, 2, 2);
				}

				break;
			case 3: // auto-fil setting is ignored here and forced on. if turned off, it looks terrible with non square artist images
				if (ppt.showAllItem && i == 0 && this.groups.length > 1) {
					drawImage(gr, images.all, ax, ay, aw, ah, true, normal_text & 0x25ffffff);
				} else {
					drawImage(gr, group.cover_image || images.noart, ax, ay, aw, ah, true, normal_text & 0x25ffffff);
					var h = g_font_height * 3;
					var hh = h / 2;
					gr.FillRectangle(ax, ay + ah - h, aw, h, RGBA(0, 0, 0, 230));
					if (ppt.tagMode == 0) {
						gr.WriteText(group.album, g_font_bold, RGB(240, 240, 240), ax + 8, ay + ah - h + 2, aw - 16, hh, 0, 2, 1, 1);
						gr.WriteText(group.artist, g_font, RGB(230, 230, 230), ax + 8, ay + ah - hh - 2, aw - 16, hh, 0, 2, 1, 1);
					} else {
						gr.WriteText(group.artist, g_font, RGB(230, 230, 230), ax + 8, ay + ah - h, aw - 16, h, 0, 2, 1, 1);
					}
				}
				if (i == this.selectedIndex) {
					gr.DrawRectangle(ax + 1, ay + 1, aw - 3, ah - 3, 3.0, g_color_selected_bg);
				}
				break;
			}

			if (cx == this.totalColumns - 1) {
				cx = 0;
			} else {
				cx++;
			}
		}

		// draw scrollbar
		this.scrollbar.draw(gr);

		// draw top header bar
		if (ppt.showHeaderBar) {
			gr.FillRectangle(0, 0, ww, this.y - 1, g_color_normal_bg);
			gr.FillRectangle(this.x, 0, this.w + cScrollBar.width, ppt.headerBarHeight - 1, g_color_normal_bg & 0x20ffffff);
			gr.FillRectangle(this.x, ppt.headerBarHeight - 2, this.w + cScrollBar.width, 1, g_color_normal_txt & 0x22ffffff);
			var nb_groups = (ppt.showAllItem && total > 1 ? total - 1 : total);
			var boxText = nb_groups + " " + ppt.tagText[ppt.tagMode];
			if (nb_groups > 1) boxText += "s";
			gr.WriteText(boxText, g_font_box, blendColours(g_color_normal_txt, g_color_normal_bg, 0.4), 0, 0, ww - 5, ppt.headerBarHeight - 1, 1, 2, 1, 1);
		}
	}

	this._isHover = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	}

	this.on_mouse = function (event, x, y, delta) {
		this.ishover = this._isHover(x, y);
		this.activeIndex = -1;
		if (this.ishover) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / this.rowHeight) - 1;
			if (y > this.y && x > this.x && x < this.x + this.w) {
				this.activeColumn = Math.ceil((x - this.x) / this.thumbnailWidth) - 1;
				this.activeIndex = (this.activeRow * this.totalColumns) + this.activeColumn;
				this.activeIndex = this.activeIndex > this.groups.length - 1 ? -1 : this.activeIndex;
			}
		}

		switch (event) {
		case "lbtn_down":
		case "rbtn_down":
			if (this.ishover && this.activeIndex > -1 && this.activeIndex != this.selectedIndex) {
				this.activateItem(this.activeIndex)
				g_selHolder.SetSelection(this.groups[this.activeIndex].handles, 6);
				this.repaint();
			}
			break;
		case "lbtn_dblclk":
			if (this.ishover && this.activeIndex > -1) {
				this.sendItemsToPlaylist(this.activeIndex);
			}
			break;
		case "rbtn_up":
			if (this.ishover && this.activeIndex > -1) {
				this.context_menu(x, y, this.activeIndex);
			} else if (!this.inputbox.hover) {
				this.settings_context_menu(x, y);
			}
			break;
		case "wheel":
			if (cScrollBar.visible) {
				this.scrollbar.updateScrollbar();
			}
			break;
		}

		if (ppt.showHeaderBar) {
			this.inputbox.check(event, x, y);

			if (this.inputbox.text.length > 0) {
				if (event == "lbtn_down" || event == "move") {
					this.reset_bt.checkstate(event, x, y);
				} else if (event == "lbtn_up") {
					if (this.reset_bt.checkstate("lbtn_up", x, y) == ButtonStates.hover) {
						this.inputbox.text = "";
						this.inputbox.offset = 0;
						g_sendResponse();
					}
				}
			}
		}

		if (cScrollBar.visible) {
			this.scrollbar.on_mouse(event, x, y);
		}
	}

	this.g_time = window.SetInterval(function () {
		if (!window.IsVisible) {
			need_repaint = true;
			return;
		}

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			isScrolling = true;
			need_repaint = true;
			if (scroll_prev != scroll)
				brw.scrollbar.updateScrollbar();
		} else {
			if (scroll_ != scroll) {
				scroll_ = scroll; // force to scroll_ value to fixe the 5.5 stop value for expanding album action
				need_repaint = true;
			}
			if (isScrolling) {
				if (scroll_ < 1)
					scroll_ = 0;
				isScrolling = false;
				need_repaint = true;
			}
		}

		if (need_repaint) {
			need_repaint = false;
			window.Repaint();
		}

		scroll_prev = scroll;

	}, ppt.refreshRate);

	this.context_menu = function (x, y, albumIndex) {
		var _menu = window.CreatePopupMenu();
		var _context = fb.CreateContextMenuManager();
		var _add = window.CreatePopupMenu();

		_add.AppendMenuItem(MF_STRING, 1, "New Playlist");
		if (plman.PlaylistCount > 0) {
			_add.AppendMenuSeparator();
		}
		for (var i = 0; i < plman.PlaylistCount; i++) {
			_add.AppendMenuItem(EnableMenuIf(playlist_can_add_items(i)), i + 2, plman.GetPlaylistName(i));
		}
		_add.AppendTo(_menu, MF_STRING, "Add to");

		_menu.AppendMenuSeparator();
		_context.InitContext(this.groups[albumIndex].handles);
		_context.BuildMenu(_menu, 1000);

		var idx = _menu.TrackPopupMenu(x, y);
		switch (true) {
		case idx == 0:
			break;
		case idx == 1:
			var pl = plman.CreatePlaylist();
			plman.ActivePlaylist = pl
			plman.InsertPlaylistItems(pl, 0, this.groups[albumIndex].handles, false);
			break;
		case idx < 1000:
			var target_playlist = idx - 2;
			plman.UndoBackup(target_playlist);
			var base = plman.GetPlaylistItemCount(target_playlist);
			plman.InsertPlaylistItems(target_playlist, base, this.groups[albumIndex].handles, false);
			plman.ActivePlaylist = target_playlist;
			break;
		default:
			_context.ExecuteByID(idx - 1000);
			break;
		}
		_add.Dispose();
		_context.Dispose();
		_menu.Dispose();
		return true;
	}

	this.settings_context_menu = function (x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var _menu2 = window.CreatePopupMenu();

		_menu.AppendMenuItem(CheckMenuIf(ppt.showHeaderBar), 1, "Header Bar");
		_menu.AppendMenuSeparator();

		var colour_flag = EnableMenuIf(ppt.enableCustomColours);
		_menu1.AppendMenuItem(CheckMenuIf(ppt.enableCustomColours), 2, "Enable");
		_menu1.AppendMenuSeparator();
		_menu1.AppendMenuItem(colour_flag, 3, "Text");
		_menu1.AppendMenuItem(colour_flag, 4, "Background");
		_menu1.AppendMenuItem(colour_flag, 5, "Selected background");
		_menu1.AppendTo(_menu, MF_STRING, "Custom colours");
		_menu.AppendMenuSeparator();

		_menu2.AppendMenuItem(MF_STRING, 100, "Send to default playlist and play");
		_menu2.AppendMenuItem(MF_STRING, 101, "Send to default playlist");
		_menu2.CheckMenuRadioItem(100, 101, ppt.sendto_playlist_play ? 100 : 101);
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(MF_STRING, 102, "Default playlist name")
		_menu2.AppendTo(_menu, MF_STRING, "Double click");
		_menu.AppendMenuSeparator();

		_menu.AppendMenuItem(MF_STRING, 20, "Album");
		_menu.AppendMenuItem(MF_STRING, 21, "Artist");
		_menu.AppendMenuItem(MF_STRING, 22, "Album Artist");
		_menu.CheckMenuRadioItem(20, 22, 20 + ppt.tagMode);
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 30, "Column");
		_menu.AppendMenuItem(MF_STRING, 31, "Column + Album Art");
		_menu.AppendMenuItem(MF_STRING, 32, "Album Art Grid (Original style)");
		_menu.AppendMenuItem(MF_STRING, 33, "Album Art Grid (Overlayed text)");
		_menu.CheckMenuRadioItem(30, 33, 30 + ppt.panelMode);
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(CheckMenuIf(ppt.showAllItem), 40, "Show all items");
		_menu.AppendMenuItem(EnableMenuIf(ppt.panelMode == 1 || ppt.panelMode == 2), 41, "Album Art: Auto-fill");
		_menu.CheckMenuItem(41, ppt.autoFill);

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 50, "Panel Properties");
		_menu.AppendMenuItem(MF_STRING, 51, "Configure...");

		var idx = _menu.TrackPopupMenu(x, y);

		switch (idx) {
		case 1:
			ppt.showHeaderBar = !ppt.showHeaderBar;
			window.SetProperty("SMOOTH.SHOW.TOP.BAR", ppt.showHeaderBar);
			get_metrics();
			this.repaint();
			break;
		case 2:
			ppt.enableCustomColours = !ppt.enableCustomColours;
			window.SetProperty("SMOOTH.CUSTOM.COLOURS.ENABLED", ppt.enableCustomColours);
			on_colours_changed();
			break;
		case 3:
			g_color_normal_txt = utils.ColourPicker(g_color_normal_txt);
			window.SetProperty("SMOOTH.COLOUR.TEXT", g_color_normal_txt);
			on_colours_changed();
			break;
		case 4:
			g_color_normal_bg = utils.ColourPicker(g_color_normal_bg);
			window.SetProperty("SMOOTH.COLOUR.BACKGROUND.NORMAL", g_color_normal_bg);
			on_colours_changed();
			break;
		case 5:
			g_color_selected_bg = utils.ColourPicker(g_color_selected_bg);
			window.SetProperty("SMOOTH.COLOUR.BACKGROUND.SELECTED", g_color_selected_bg);
			on_colours_changed();
			break;
		case 20:
		case 21:
		case 22:
			ppt.tagMode = idx - 20;
			window.SetProperty("SMOOTH.TAG.MODE", ppt.tagMode);
			this.populate();
			break;
		case 30:
		case 31:
		case 32:
		case 33:
			ppt.panelMode = idx - 30;
			window.SetProperty("SMOOTH.DISPLAY.MODE", ppt.panelMode);
			get_metrics();
			this.repaint();
			break;
		case 40:
			ppt.showAllItem = !ppt.showAllItem;
			window.SetProperty("SMOOTH.SHOW.ALL.ITEMS", ppt.showAllItem);
			this.populate();
			break;
		case 41:
			ppt.autoFill = !ppt.autoFill;
			window.SetProperty("SMOOTH.AUTO.FILL", ppt.autoFill);
			images.clear();
			this.populate();
			break;
		case 50:
			window.ShowProperties();
			break;
		case 51:
			window.ShowConfigure();
			break;
		case 100:
		case 101:
			ppt.sendto_playlist_play = idx == 100;
			window.SetProperty("SMOOTH.SENDTO.PLAYLIST.PLAY", ppt.sendto_playlist_play);
			break;
		case 102:
			var tmp = utils.InputBox("Enter default playlist name", window.Name, ppt.sendto_playlist);
			if (tmp.length && tmp != ppt.sendto_playlist) {
				ppt.sendto_playlist = tmp;
				window.SetProperty("SMOOTH.SENDTO.PLAYLIST", ppt.sendto_playlist);
			}
		}
		_menu2.Dispose();
		_menu1.Dispose();
		_menu.Dispose();
		return true;
	}

	window.SetTimeout(function () {
		brw.populate();
	}, 100);

	this.groups = [];
	this.rowsCount = 0;
	this.scrollbar = new oScrollbar();
	this.selectedIndex = -1;
	this.inputbox = new oInputbox(300, scale(20), "", "Filter", g_color_normal_txt, 0, 0, g_color_selected_bg, g_sendResponse);
	this.inputbox.autovalidation = true;
}

function on_size() {
	ww = window.Width;
	wh = window.Height;
	brw.setSize();
}

function on_paint(gr) {
	if (ww < 10 || wh < 10)
		return;

	gr.FillRectangle(0, 0, ww, wh, g_color_normal_bg);
	brw.draw(gr);

	if (ppt.showHeaderBar) {
		var size = scale(20);

		if (brw.inputbox.text.length > 0) {
			brw.reset_bt.draw(gr, 5, 2);
		} else {
			gr.DrawImage(images.magnify, 5, 2, size - 1, size - 1, 0, 0, images.magnify.Width, images.magnify.Height);
		}

		brw.inputbox.draw(gr, 8 + size, 2);
		gr.FillRectangle(scale(22) + brw.inputbox.w, 4, 1, size - 3, g_color_normal_txt & 0x22ffffff);
	}
}

function on_mouse_lbtn_down(x, y) {
	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		if (Math.abs(scroll - scroll_) > brw.rowHeight) {
			scroll = (scroll > scroll_ ? scroll_ + brw.rowHeight : scroll_ - brw.rowHeight);
			scroll = check_scroll(scroll);
		}
	}

	var is_scroll_enabled = brw.rowsCount > brw.totalRowsVis;
	if (ppt.enableTouchControl && is_scroll_enabled) {
		if (brw._isHover(x, y) && !brw.scrollbar._isHover(x, y)) {
			if (!timers.mouseDown) {
				cTouch.y_prev = y;
				cTouch.y_start = y;
				if (cTouch.t1) {
					cTouch.t1.Reset();
				} else {
					cTouch.t1 = utils.CreateProfiler("t1");
				}
				timers.mouseDown = window.SetTimeout(function () {
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - m_y) > 015) {
						cTouch.down = true;
					} else {
						brw.on_mouse("lbtn_down", x, y);
					}
				}, 50);
			}
		} else {
			brw.on_mouse("lbtn_down", x, y);
		}
	} else {
		brw.on_mouse("lbtn_down", x, y);
	}
}

function on_mouse_lbtn_up(x, y) {
	brw.on_mouse("lbtn_up", x, y);

	if (timers.mouseDown) {
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - m_y) <= 030) {
			brw.on_mouse("lbtn_down", x, y);
		}
	}

	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = scroll - scroll_;
		if (Math.abs(cTouch.scroll_delta) > 015) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 015);
			if (cTouch.multiplier < 1)
				cTouch.multiplier = 1;
			if (cTouch.timer)
				window.ClearInterval(cTouch.timer);
			cTouch.timer = window.SetInterval(function () {
				scroll += cTouch.delta * cTouch.multiplier;
				scroll = check_scroll(scroll);
				cTouch.multiplier = cTouch.multiplier - 1;
				cTouch.delta = cTouch.delta - (cTouch.delta / 10);
				if (cTouch.multiplier < 1) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				}
			}, 75);
		}
	}
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	brw.on_mouse("lbtn_dblclk", x, y);
}

function on_mouse_rbtn_down(x, y) {
	brw.on_mouse("rbtn_down", x, y);
}

function on_mouse_rbtn_up(x, y) {
	brw.on_mouse("rbtn_up", x, y);
	return true;
}

function on_mouse_move(x, y) {
	if (m_x == x && m_y == y)
		return;

	if (cTouch.down) {
		cTouch.y_current = y;
		cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
		if (x < brw.w) {
			scroll -= cTouch.y_move;
			cTouch.scroll_delta = scroll - scroll_;
			if (Math.abs(cTouch.scroll_delta) < 030)
				cTouch.y_start = cTouch.y_current;
			cTouch.y_prev = cTouch.y_current;
		}
	} else {
		brw.on_mouse("move", x, y);
	}

	m_x = x;
	m_y = y;
}

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	}

	if (utils.IsKeyPressed(VK_CONTROL)) { // zoom all elements)
		var zoomStep = 1;
		var previous = ppt.extra_font_size;
		if (!timers.mouseWheel) {
			if (step > 0) {
				ppt.extra_font_size += zoomStep;
				if (ppt.extra_font_size > 10)
					ppt.extra_font_size = 10;
			} else {
				ppt.extra_font_size -= zoomStep;
				if (ppt.extra_font_size < 0)
					ppt.extra_font_size = 0;
			}
			if (previous != ppt.extra_font_size) {
				timers.mouseWheel = window.SetTimeout(function () {
					timers.mouseWheel = false;
					window.SetProperty("SMOOTH.EXTRA.FONT.SIZE", ppt.extra_font_size);
					get_font();
					get_metrics();
					get_images();
					brw.repaint();
				}, 100);
			}
		}
	} else {
		scroll -= step * brw.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll)
		brw.on_mouse("wheel", m_x, m_y, step);
	}
}

function get_metrics() {
	switch (ppt.panelMode) {
	case 0:
	case 1:
		ppt.rowScrollStep = 3;
		break;
	case 2:
	case 3:
		ppt.rowScrollStep = 1;
		break;
	}

	if (ppt.showHeaderBar) {
		ppt.headerBarHeight = scale(ppt.defaultHeaderBarHeight);
	} else {
		ppt.headerBarHeight = 0;
	}
	cScrollBar.width = scale(cScrollBar.defaultWidth);
	cScrollBar.minCursorHeight = scale(cScrollBar.defaultMinCursorHeight);

	brw.setSize();
}

function on_key_up(vkey) {
	cScrollBar.timerCounter = -1;
	if (cScrollBar.timerID) {
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
	brw.repaint();
}

function on_key_down(vkey) {
	if (ppt.showHeaderBar) {
		brw.inputbox.on_key_down(vkey);
	}

	if (GetKeyboardMask() == KMask.ctrl) {
		if (vkey == 84) { // CTRL+T
			ppt.showHeaderBar = !ppt.showHeaderBar;
			window.SetProperty("SMOOTH.SHOW.TOP.BAR", ppt.showHeaderBar);
			get_metrics();
			brw.repaint();
		}
		if (vkey == 48 || vkey == 96) { // CTRL+0
			if (ppt.extra_font_size > 0) {
				ppt.extra_font_size = 0;
				window.SetProperty("SMOOTH.EXTRA.FONT.SIZE", ppt.extra_font_size);
				get_font();
				get_metrics();
				get_images();
				brw.repaint();
			}
		}
	}
}

function on_char(code) {
	if (ppt.showHeaderBar && brw.inputbox.edit) {
		brw.inputbox.on_char(code);
	}
}

function on_library_items_added() {
	brw.populate();
}

function on_library_items_removed() {
	brw.populate();
}

function on_library_items_changed() {
	brw.populate();
}

function on_metadb_changed() {
	brw.populate();
}

function on_focus(is_focused) {
	if (!is_focused) {
		brw.repaint();
	}
}

function check_scroll(scroll___) {
	if (scroll___ < 0)
		scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * brw.rowHeight);
	var end_limit = (brw.rowsCount * brw.rowHeight) - (brw.totalRowsVis * brw.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	}
	return scroll___;
}

function g_sendResponse() {
	if (brw.inputbox.text.length == 0) {
		g_filter_text = "";
	} else {
		g_filter_text = brw.inputbox.text;
	}
	brw.populate();
}

var g_selHolder = fb.AcquireSelectionHolder();
var brw = new oBrowser();

get_metrics();
