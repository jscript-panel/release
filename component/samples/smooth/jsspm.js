ppt.defaultRowHeight = window.GetProperty("SMOOTH.ROW.HEIGHT", 35);
ppt.rowHeight = ppt.defaultRowHeight;
ppt.autoplaylist_sort_pattern = "%album artist% | $if(%album%,%date%,9999) | %album% | %discnumber% | %tracknumber% | %title%";

var cPlaylistManager = {
	drag_clicked: false,
	drag_droped: false,
	drag_source_id: -1,
	drag_target_id: -1,
	inputbox_w: 0,
	inputbox_h: 0
}

function oPlaylist(idx, rowId, name) {
	this.idx = idx;
	this.rowId = rowId;
	this.name = name;
	this.y = -1;
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
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		if (this.inputboxID > -1) {
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 10;
			this.inputbox && this.inputbox.setSize(tw, rh, g_fsize);
		}

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update
		this.scrollbar.updateScrollbar();
	}

	this.init_groups = function () {
		var total = plman.PlaylistCount;
		this.rows = [];

		for (var i = 0; i < total; i++) {
			var name = plman.GetPlaylistName(i);
			this.rows.push(new oPlaylist(i, i, name));
		}
	}

	this.getlimits = function () {
		if (this.rows.length <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rows.length - 1;
		} else {
			if (scroll_ < 0)
				scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			// check boundaries
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0)
				start_ = 0;
			if (end_ >= this.rows.length)
				end_ = this.rows.length - 1;
		}
		g_start_ = start_;
		g_end_ = end_;
	}

	this.populate = function () {
		this.init_groups();
		this.scrollbar.updateScrollbar();
		this.repaint();
	}

	this.getRowIdFromIdx = function (idx) {
		var total = this.rows.length;
		var rowId = -1;
		if (plman.PlaylistCount > 0) {
			for (var i = 0; i < total; i++) {
				if (this.rows[i].idx == idx) {
					rowId = i;
					break;
				}
			}
		}
		return rowId;
	}

	this.isVisiblePlaylist = function (idx) {
		var rowId = this.getRowIdFromIdx(idx);
		var offset_active_pl = ppt.rowHeight * rowId;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		} else {
			return true;
		}
	}

	this.showSelectedPlaylist = function () {
		var rowId = this.getRowIdFromIdx(this.selectedRow);

		if (!this.isVisiblePlaylist(this.selectedRow)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		}
	}

	this.showActivePlaylist = function () {
		var rowId = this.getRowIdFromIdx(plman.ActivePlaylist);

		if (!this.isVisiblePlaylist(plman.ActivePlaylist)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		}
	}

	this.draw = function (gr) {
		this.getlimits();

		if (this.rows.length > 0) {
			var ax = 0;
			var ay = 0;
			var aw = this.w;
			var ah = ppt.rowHeight;

			for (var i = g_start_; i <= g_end_; i++) {
				ay = Math.floor(this.y + (i * ah) - scroll_);
				var normal_text = g_color_normal_txt;
				var fader_txt = blendColours(g_color_normal_txt, g_color_normal_bg, 0.25);

				 // alternating row background
				if (i % 2 != 0) {
					gr.FillRectangle(ax, ay, aw, ah, g_color_normal_txt & 0x08ffffff);
				}

				// active?
				if (this.rows[i].idx == plman.ActivePlaylist) {
					gr.FillRectangle(ax, ay, aw, ah, g_color_selected_bg & 0xb0ffffff);
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);

					if (normal_text == g_color_selected_bg) {
						normal_text = g_color_normal_bg;
						fader_txt = blendColours(normal_text, g_color_normal_bg, 0.25);
					}
				}

				// selectedRow?
				if (i == this.selectedRow) {
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg & 0xd0ffffff);
				};

				// target location mark
				if (cPlaylistManager.drag_target_id == i) {
					if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
						gr.DrawRectangle(ax, ay + ppt.rowHeight - 2, aw - 1, 1, 2.0, g_color_selected_bg);
					} else if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
						gr.DrawRectangle(ax, ay + 1, aw - 1, 1, 2.0, g_color_selected_bg);
					}
				}

				if (g_drag_drop_active && i == g_drag_drop_target_id && playlist_can_add_items(i)) {
					gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_normal_txt & 0xa0ffffff);
				}

				// draw blink rectangle after an external drag'n drop files
				if (blink.counter > -1) {
					if (i == blink.id && playlist_can_add_items(i)) {
						if (blink.counter <= 5 && Math.floor(blink.counter / 2) == Math.ceil(blink.counter / 2)) {
							gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
						}
					}
				}

				gr.WriteText(plman.IsPlaylistLocked(this.rows[i].idx) ? chars.lock : chars.list, g_font_awesome, normal_text, ax, ay, ah, ah, 2, 2);

				if (this.inputboxID == i) {
					this.inputbox.draw(gr, ah, ay + 5);
				} else {
					gr.WriteText(this.rows[i].name, g_font, normal_text, ah, ay, aw - (ah * 3), ah, 0, 2, 1);
					gr.WriteText(plman.GetPlaylistItemCount(this.rows[i].idx), g_font, fader_txt, ah, ay, aw - ah - 5, ah, 1, 2, 1);
				}
			}
		}

		// draw scrollbar
		if (this.scrollbar) this.scrollbar.draw(gr);

		// draw header
		if (ppt.showHeaderBar) {
			gr.FillRectangle(0, 0, ww, this.y - 1, g_color_normal_bg);
			gr.FillRectangle(this.x, 0, this.w + cScrollBar.width, ppt.headerBarHeight - 1, g_color_normal_bg & 0x20ffffff);
			gr.FillRectangle(this.x, ppt.headerBarHeight - 2, this.w + cScrollBar.width, 1, g_color_normal_txt & 0x22ffffff);
			var boxText = this.rows.length + " playlist";
			if (this.rows.length > 1) boxText += "s";
			gr.WriteText(boxText, g_font_box, blendColours(g_color_normal_txt, g_color_normal_bg, 0.3), 0, 0, ww - 5, ppt.headerBarHeight - 1, 1, 2, 1);
		}
	}

	this._isHover = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}

	this.on_mouse = function (event, x, y) {
		this.ishover = this._isHover(x, y);

		// get hover row index (mouse cursor hover)
		if (y > this.y && y < this.y + this.h) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
			if (this.activeRow >= this.rows.length)
				this.activeRow = -1;
		} else {
			this.activeRow = -1;
		}

		switch (event) {
		case "lbtn_down":
			this.down = true;
			if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				this.selectedRow = this.activeRow;
				if (this.activeRow == this.inputboxID) {
					this.inputbox.check("lbtn_down", x, y);
				} else {
					if (this.inputboxID > -1)
						this.inputboxID = -1;
					//if(this.selectedRow == this.rows[this.activeRow].idx) {
					if (!this.up) {
						// set dragged item to reorder list
						cPlaylistManager.drag_clicked = true;
						cPlaylistManager.drag_source_id = this.selectedRow;
					}
					//}
				}
				this.repaint();
			} else {
				if (this.inputboxID > -1)
					this.inputboxID = -1;
			}
			this.up = false;
			break;
		case "lbtn_up":
			this.up = true;
			if (this.down) {
				if (this.inputboxID >= 0) {
					this.inputbox.check("lbtn_up", x, y);
				} else {
					// drop playlist switch
					if (cPlaylistManager.drag_target_id > -1) {
						if (cPlaylistManager.drag_target_id != cPlaylistManager.drag_source_id) {
							cPlaylistManager.drag_droped = true
								if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
									plman.MovePlaylist(this.rows[cPlaylistManager.drag_source_id].idx, this.rows[cPlaylistManager.drag_target_id].idx);
								} else if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
								plman.MovePlaylist(this.rows[cPlaylistManager.drag_source_id].idx, this.rows[cPlaylistManager.drag_target_id].idx);
							}
						}
						this.selectedRow = cPlaylistManager.drag_target_id;
					}
				}

				if (timers.movePlaylist) {
					window.ClearInterval(timers.movePlaylist);
					timers.movePlaylist = false;
				}
			}

			this.down = false;

			if (cPlaylistManager.drag_moved)
				window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_source_id = -1;
			cPlaylistManager.drag_target_id = -1;
			break;
		case "lbtn_dblclk":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (plman.ActivePlaylist != this.rows[this.activeRow].idx) {
					if (this.inputboxID > -1)
						this.inputboxID = -1;
					this.repaint();
					plman.ActivePlaylist = this.rows[this.activeRow].idx;
				}
			}
			break;
		case "move":
			this.up = false;
			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			} else {
				if (cPlaylistManager.drag_clicked) {
					cPlaylistManager.drag_moved = true;
				}
				if (cPlaylistManager.drag_moved) {
					window.SetCursor(IDC_HELP);
					if (this.activeRow > -1) {
						if (timers.movePlaylist) {
							window.ClearInterval(timers.movePlaylist);
							timers.movePlaylist = false;
						}
						if (this.activeRow != cPlaylistManager.drag_source_id) {
							cPlaylistManager.drag_target_id = this.activeRow;
						} else {
							cPlaylistManager.drag_target_id = -1;
						}
					} else {
						if (y < this.y) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function () {
									scroll -= ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id > 0 ? cPlaylistManager.drag_target_id - 1 : 0;
								}, 100);
							}
						} else if (y > this.y + this.h) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function () {
									scroll += ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id < this.rows.length - 1 ? cPlaylistManager.drag_target_id + 1 : this.rows.length - 1;
								}, 100);
							}
						}
					}
					this.repaint();
				}
			}
			break;
		case "rbtn_up":
			if (this.inputboxID >= 0) {
				if (!this.inputbox.hover) {
					this.inputboxID = -1;
					this.on_mouse("rbtn_up", x, y);
				} else {
					this.inputbox.check("rbtn_up", x, y);
				}
			} else {
				if (this.ishover) {
					if (this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
						this.repaint();
						this.selectedRow = this.activeRow;
						this.context_menu(x, y, this.selectedRow);
					} else {
						this.context_menu(x, y, this.activeRow);
					}
				} else {
					this.settings_context_menu(x, y);
				}
			}
			break;
		case "drag_over":
			if (this.rows.length > 0 && this.activeRow > -1) {
				g_drag_drop_target_id = this.activeRow;
			}
			break;
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

		// get hover row index (mouse cursor hover)
		if (m_y > brw.y && m_y < brw.y + brw.h) {
			brw.activeRow = Math.ceil((m_y + scroll_ - brw.y) / ppt.rowHeight - 1);
			if (brw.activeRow >= brw.rows.length)
				brw.activeRow = -1;
		} else {
			brw.activeRow = -1;
		}

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			need_repaint = true;
			isScrolling = true;
			//
			if (scroll_prev != scroll)
				brw.scrollbar.updateScrollbar();
		} else {
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

	this.context_menu = function (x, y, id) {
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var _autoplaylist = window.CreatePopupMenu();
		var _restore = window.CreatePopupMenu();

		if (g_filter_text.length == 0) {
			_menu.AppendMenuItem(MF_STRING, 100, "Load Playlist...");
			_newplaylist.AppendMenuItem(MF_STRING, 101, "New Playlist");
			_newplaylist.AppendMenuItem(MF_STRING, 102, "New Autoplaylist");
			_autoplaylist.AppendTo(_newplaylist, MF_STRING, "Preset AutoPlaylists");
			_autoplaylist.AppendMenuItem(MF_STRING, 200, "Media Library (full)");
			_autoplaylist.AppendMenuItem(MF_STRING, 201, "Tracks never played");
			_autoplaylist.AppendMenuItem(MF_STRING, 202, "Tracks played in the last 5 days");
			_autoplaylist.AppendMenuSeparator();
			_autoplaylist.AppendMenuItem(MF_STRING, 203, "Tracks unrated");
			_autoplaylist.AppendMenuItem(MF_STRING, 204, "Tracks rated 1");
			_autoplaylist.AppendMenuItem(MF_STRING, 205, "Tracks rated 2");
			_autoplaylist.AppendMenuItem(MF_STRING, 206, "Tracks rated 3");
			_autoplaylist.AppendMenuItem(MF_STRING, 207, "Tracks rated 4");
			_autoplaylist.AppendMenuItem(MF_STRING, 208, "Tracks rated 5");
			_newplaylist.AppendTo(_menu, MF_STRING, "Add");
			var count = plman.RecyclerCount;
			if (count > 0) {
				var history = [];
				for (var i = 0; i < count; i++) {
					history.push(i);
					_restore.AppendMenuItem(MF_STRING, 10 + i, plman.GetRecyclerName(i));
				}
				_restore.AppendMenuSeparator();
				_restore.AppendMenuItem(MF_STRING, 99, "Clear history");
				_restore.AppendTo(_menu, MF_STRING, "Restore");
			}
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(MF_STRING, 1, "Sort playlists A-Z");
			_menu.AppendMenuItem(MF_STRING, 2, "Sort playlists Z-A");
			if (id > -1) _menu.AppendMenuSeparator();
		}

		if (id > -1) {
			var lock_name = plman.GetPlaylistLockName(id);

			_menu.AppendMenuItem(MF_STRING, 3, "Duplicate this playlist");
			_menu.AppendMenuItem(playlist_can_rename(id) ? MF_STRING : MF_GRAYED, 4, "Rename this playlist\tF2");
			_menu.AppendMenuItem(playlist_can_remove(id) ? MF_STRING : MF_GRAYED, 5, "Remove this playlist\tDel");
			_menu.AppendMenuSeparator();
			if (plman.IsAutoPlaylist(id)) {
				_menu.AppendMenuItem(MF_STRING, 6, lock_name + " properties");
				_menu.AppendMenuItem(MF_STRING, 7, "Convert to a normal playlist");
			} else {
				var is_locked = plman.IsPlaylistLocked(id);
				var is_mine = lock_name == "JScript Panel 3";

				_menu.AppendMenuItem(is_mine || !is_locked ? MF_STRING : MF_GRAYED, 8, "Edit playlist lock...");
				_menu.AppendMenuItem(is_mine ? MF_STRING : MF_GRAYED, 9, "Remove playlist lock");
			}
		}

		var idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case idx == 0:
			break;
		case idx == 1:
			plman.SortPlaylistsByName(1);
			break;
		case idx == 2:
			plman.SortPlaylistsByName(-1);
			break;
		case idx == 3:
			plman.DuplicatePlaylist(id, "Copy of " + plman.GetPlaylistName(id));
			plman.ActivePlaylist = id + 1;
			break;
		case idx == 4:
			this.edit_playlist(id);
			break;
		case idx == 5:
			plman.RemovePlaylistSwitch(id);
			break;
		case idx == 6:
			plman.ShowAutoPlaylistUI(id);
			break;
		case idx == 7:
			plman.DuplicatePlaylist(id, plman.GetPlaylistName(id));
			plman.RemovePlaylist(id);
			plman.ActivePlaylist = id;
			break;
		case idx == 8:
			plman.ShowPlaylistLockUI(id);
			break;
		case idx == 9:
			plman.RemovePlaylistLock(id);
			break;
		case idx >= 10 && idx <= 98:
			plman.RecyclerRestore(idx - 10);
			plman.ActivePlaylist = plman.PlaylistCount - 1;
			break;
		case idx == 99:
			plman.RecyclerPurge(history);
			break;
		case idx == 100:
			fb.LoadPlaylist();
			break;
		case idx == 101:
			var p = plman.CreatePlaylist();
			plman.ActivePlaylist = p;
			this.edit_playlist(p);
			break;
		case idx == 102:
			var p = plman.CreateAutoPlaylist(plman.PlaylistCount, "", "enter your query here");
			plman.ActivePlaylist = p;
			plman.ShowAutoPlaylistUI(p);
			this.edit_playlist(p);
			break;
		case idx == 200:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Media Library", "ALL", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 201:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks never played", "%play_count% MISSING", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 202:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks played in the last 5 days", "%last_played% DURING LAST 5 DAYS", "%last_played%");
			break;
		case idx == 203:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks unrated", "%rating% MISSING", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 204:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks rated 1", "%rating% IS 1", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 205:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks rated 2", "%rating% IS 2", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 206:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks rated 3", "%rating% IS 3", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 207:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks rated 4", "%rating% IS 4", ppt.autoplaylist_sort_pattern);
			break;
		case idx == 208:
			plman.ActivePlaylist = plman.CreateAutoPlaylist(plman.PlaylistCount, "Tracks rated 5", "%rating% IS 5", ppt.autoplaylist_sort_pattern);
			break;
		}
		_restore.Dispose();
		_autoplaylist.Dispose();
		_newplaylist.Dispose();
		_menu.Dispose();
		this.repaint();
		return true;
	}

	this.edit_playlist = function (p) {
		var rh = ppt.rowHeight - 10;
		var tw = this.w - rh - 100;
		this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(p), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_selected_bg, "renamePlaylist()");
		this.inputbox.setSize(tw, rh, g_fsize);
		this.inputboxID = p;
		this.inputbox.on_focus(true);
		this.inputbox.edit = true;
		this.inputbox.Cpos = this.inputbox.text.length;
		this.inputbox.anchor = this.inputbox.Cpos;
		this.inputbox.SelBegin = this.inputbox.Cpos;
		this.inputbox.SelEnd = this.inputbox.Cpos;
		if (!cInputbox.timer_cursor) {
			this.inputbox.resetCursorTimer();
		}
		this.inputbox.dblclk = true;
		this.inputbox.SelBegin = 0;
		this.inputbox.SelEnd = this.inputbox.text.length;
		this.inputbox.text_selected = this.inputbox.text;
		this.inputbox.select = true;
		this.repaint();
	}

	this.settings_context_menu = function (x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var _menu2 = window.CreatePopupMenu();

		_menu.AppendMenuItem(MF_STRING, 1, "Header Bar");
		_menu.CheckMenuItem(1, ppt.showHeaderBar);
		_menu.AppendMenuSeparator();

		var colour_flag = ppt.enableCustomColours ? MF_STRING : MF_GRAYED;
		_menu1.AppendMenuItem(MF_STRING, 2, "Enable");
		_menu1.CheckMenuItem(2, ppt.enableCustomColours);
		_menu1.AppendMenuSeparator();
		_menu1.AppendMenuItem(colour_flag, 3, "Text");
		_menu1.AppendMenuItem(colour_flag, 4, "Background");
		_menu1.AppendMenuItem(colour_flag, 5, "Selected background");
		_menu1.AppendTo(_menu, MF_STRING, "Custom colours");

		_menu2.AppendMenuItem(MF_STRING, 6, "None");
		_menu2.AppendMenuItem(MF_STRING, 7, "Front cover of playing track");
		_menu2.AppendMenuItem(MF_STRING, 8, "Custom image");
		_menu2.CheckMenuRadioItem(6, 8, ppt.wallpapermode + 6);
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(ppt.wallpapermode == 2 ? MF_STRING : MF_GRAYED, 9, "Custom image path...");
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(ppt.wallpapermode != 0 ? MF_STRING : MF_GRAYED, 10, "Blur");
		_menu2.CheckMenuItem(10, ppt.wallpaperblurred);
		_menu2.AppendTo(_menu, MF_STRING, "Background Wallpaper");

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 20, "Panel Properties");
		_menu.AppendMenuItem(MF_STRING, 21, "Configure...");

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
		case 6:
		case 7:
		case 8:
			ppt.wallpapermode = idx - 6;
			window.SetProperty("SMOOTH.WALLPAPER.MODE", ppt.wallpapermode);
			setWallpaperImg();
			this.repaint();
			break;
		case 9:
			var tmp = utils.InputBox("Enter the full path to an image.", window.Name, ppt.wallpaperpath);
			if (tmp != ppt.wallpaperpath) {
				ppt.wallpaperpath = tmp;
				window.SetProperty("SMOOTH.WALLPAPER.PATH", ppt.wallpaperpath);
				setWallpaperImg();
				this.repaint();
			}
			break;
		case 10:
			ppt.wallpaperblurred = !ppt.wallpaperblurred;
			window.SetProperty("SMOOTH.WALLPAPER.BLURRED", ppt.wallpaperblurred);
			setWallpaperImg();
			this.repaint();
			break;
		case 20:
			window.ShowProperties();
			break;
		case 21:
			window.ShowConfigure();
			break;
		}
		_menu2.Dispose();
		_menu1.Dispose();
		_menu.Dispose();
		return true;
	}

	window.SetTimeout(function () {
		brw.populate();
	}, 100);

	this.rows = [];
	this.scrollbar = new oScrollbar();
	this.inputbox = null;
	this.inputboxID = -1;
	this.selectedRow = plman.ActivePlaylist;
}

function on_size() {
	ww = window.Width;
	wh = window.Height;
	brw.setSize();
}

function on_paint(gr) {
	gr.FillRectangle(0, 0, ww, wh, g_color_normal_bg);
	if (ppt.wallpapermode != 0 && g_wallpaperImg) {
		drawImage(gr, g_wallpaperImg, brw.x, brw.y, brw.w, brw.h, true, null, ppt.wallpaperopacity);
	}

	brw.draw(gr);
}

function on_mouse_lbtn_down(x, y) {
	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		// stop scrolling but not abrupt, add a little offset for the stop
		if (Math.abs(scroll - scroll_) > ppt.rowHeight) {
			scroll = (scroll > scroll_ ? scroll_ + ppt.rowHeight : scroll_ - ppt.rowHeight);
			scroll = check_scroll(scroll);
		}
	}

	var is_scroll_enabled = brw.rows.length > brw.totalRowsVis;
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
		window.ClearTimeout(timers.mouseDown);
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
		//cTouch.y_delta = cTouch.y_start - cTouch.y_end;
		if (Math.abs(cTouch.scroll_delta) > 030) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 030);
			if (cTouch.multiplier < 1)
				cTouch.multiplier = 1;
			if (cTouch.timer) window.ClearInterval(cTouch.timer);
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
	if (y >= brw.y) {
		brw.on_mouse("lbtn_dblclk", x, y);
	} else if (x > brw.x && x < brw.x + brw.w) {
		brw.showActivePlaylist();
	} else {
		brw.on_mouse("lbtn_dblclk", x, y);
	}
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

	if (utils.IsKeyPressed(VK_CONTROL)) {
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
					brw.repaint();
				}, 100);
			}
		}
	} else {
		scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll);
		brw.on_mouse("wheel", m_x, m_y, step);
	}
}

function get_metrics() {
	if (ppt.showHeaderBar) {
		ppt.headerBarHeight = scale(ppt.defaultHeaderBarHeight);
	} else {
		ppt.headerBarHeight = 0;
	}

	ppt.rowHeight = scale(ppt.defaultRowHeight);
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
	if (brw.inputboxID >= 0) {
		switch (vkey) {
		case VK_ESCAPE:
		case 222:
			brw.inputboxID = -1;
			brw.repaint();
			break;
		default:
			brw.inputbox.on_key_down(vkey);
		}
	} else {
		var rowId = brw.selectedRow;
		var mask = GetKeyboardMask();

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_F2:
				if (rowId > -1 && playlist_can_rename(rowId)) {
					brw.edit_playlist(brw.rows[rowId].idx);
				}
				break;
			case VK_F3:
				brw.showActivePlaylist();
				break;
			case VK_ESCAPE:
			case 222:
				brw.inputboxID = -1;
				break;
			case VK_UP:
				if (brw.rows.length > 0 && rowId > 0) {
					if (brw.inputboxID > -1)
						brw.inputboxID = -1;
					brw.repaint();
					brw.selectedRow--;
					if (brw.selectedRow < 0)
						brw.selectedRow = 0;
					brw.showSelectedPlaylist();
					brw.repaint();
				}
				break;
			case VK_DOWN:
				if (brw.rows.length > 0 && rowId < brw.rows.length - 1) {
					if (brw.inputboxID > -1)
						brw.inputboxID = -1;
					brw.repaint();
					brw.selectedRow++;
					if (brw.selectedRow > brw.rows.length - 1)
						brw.selectedRow = brw.rows.length - 1;
					brw.showSelectedPlaylist();
					brw.repaint();
				}
				break;
			case VK_RETURN:
				if (brw.rows.length > 0) {
					plman.ActivePlaylist = brw.selectedRow;
					brw.repaint();
				}
				break;
			case VK_END:
				if (brw.rows.length > 0) {
					if (brw.inputboxID > -1)
						brw.inputboxID = -1;
					brw.repaint();
					brw.selectedRow = brw.rows.length - 1;
					brw.showSelectedPlaylist();
				}
				break;
			case VK_HOME:
				if (brw.rows.length > 0) {
					if (brw.inputboxID > -1)
						brw.inputboxID = -1;
					brw.repaint();
					brw.selectedRow = 0;
					brw.showSelectedPlaylist();
				}
				break;
			case VK_DELETE:
				plman.RemovePlaylistSwitch(brw.selectedRow);
				break;
			}
		} else if (mask == KMask.ctrl) {
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
}

function on_char(code) {
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_char(code);
	}
}

function on_playback_dynamic_info_track(type) {
	if (type == 1 && ppt.wallpapermode == 1) {
		setWallpaperImg();
		brw.repaint();
	}
}

function on_playback_stop(reason) {
	if (reason != 2 && ppt.wallpapermode == 1 && g_wallpaperImg) {
		g_wallpaperImg.Dispose();
		g_wallpaperImg = null;
	}
	brw.repaint();
}

function on_playback_new_track() {
	setWallpaperImg();
	brw.repaint();
}

function on_playlists_changed() {
	brw.populate();

	if (brw.selectedRow > brw.rows.length)
		brw.selectedRow = plman.ActivePlaylist;

	brw.repaint();
}

function on_playlist_switch() {
	brw.showActivePlaylist();
	if (brw.selectedRow > brw.rows.length)
		brw.selectedRow = plman.ActivePlaylist;
	brw.repaint();
}

function on_playlist_items_added() {
	brw.repaint();
}

function on_playlist_items_removed() {
	brw.repaint();
}

function on_focus(is_focused) {
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_focus(is_focused);
	}
	if (!is_focused) {
		brw.inputboxID = -1;
		brw.repaint();
	}
}

function check_scroll(scroll___) {
	if (scroll___ < 0)
		scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * ppt.rowHeight);
	var end_limit = (brw.rows.length * ppt.rowHeight) - (brw.totalRowsVis * ppt.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	}
	return scroll___;
}

function renamePlaylist() {
	if (!brw.inputbox.text || brw.inputbox.text == "" || brw.inputboxID == -1)
		brw.inputbox.text = brw.rows[brw.inputboxID].name;
	if (brw.inputbox.text.length > 1 || (brw.inputbox.text.length == 1 && (brw.inputbox.text >= "a" && brw.inputbox.text <= "z") || (brw.inputbox.text >= "A" && brw.inputbox.text <= "Z") || (brw.inputbox.text >= "0" && brw.inputbox.text <= "9"))) {
		brw.rows[brw.inputboxID].name = brw.inputbox.text;
		plman.RenamePlaylist(brw.rows[brw.inputboxID].idx, brw.inputbox.text);
		brw.repaint();
	}
	brw.inputboxID = -1;
}

function on_drag_enter() {
	g_drag_drop_active = true;
}

function on_drag_leave() {
	g_drag_drop_active = false;
	g_drag_drop_target_id = -1;
	brw.buttonclicked = false;
	if (cScrollBar.timerID) {
		window.ClearInterval(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
	brw.repaint();
}

function on_drag_over(action, x, y, mask) {
	if (y < brw.y) {
		action.Effect = 0;
	} else {
		g_drag_drop_target_id = -1;
		brw.on_mouse("drag_over", x, y);
		if (g_drag_drop_target_id > -1) {
			action.Effect = playlist_can_add_items(g_drag_drop_target_id) ? 1 : 0;
		} else {
			action.Effect = 1;
		}
	}
	brw.repaint();
}

function on_drag_drop(action, x, y, mask) {
	if (y < brw.y) {
		action.Effect = 0;
	} else {
		var drop_done = false;
		if (g_drag_drop_target_id > -1) {
			if (playlist_can_add_items(g_drag_drop_target_id)) {
				drop_done = true;
				action.Playlist = g_drag_drop_target_id;
				action.Base = plman.GetPlaylistItemCount(g_drag_drop_target_id);
				action.ToSelect = false;
				action.Effect = 1;
			} else {
				action.Effect = 0;
			}
		} else {
			// blank area, drop to new playlist
			drop_done = true;
			action.Playlist = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items");;
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		}

		if (drop_done) {
			if (!blink.timer) {
				blink.id = brw.activeRow;
				blink.counter = 0;
				blink.timer = window.SetInterval(function () {
					blink.counter++;
					if (blink.counter > 5) {
						window.ClearInterval(blink.timer);
						blink.timer = false;
						blink.counter = -1;
						blink.id = null;
					}
					brw.repaint();
				}, 125);
			}
		}
	}
	g_drag_drop_active = false;
	brw.repaint();
}

var blink = {
	id: -1,
	counter: -1,
	timer: false
}

var g_drag_drop_active;
var g_drag_drop_target_id = -1;
var brw = new oBrowser();

get_metrics();
setWallpaperImg();
