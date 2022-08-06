ppt.groupkey_tf = window.GetProperty("SMOOTH.GROUPKEY", "$if2(%album%,$if(%length%,'('Singles')',%title%)) ^^ $if2(%album artist%,$if(%length%,%directory%,Stream)) ^^ [%date%] ^^ [%genre%]")
ppt.doubleRowPixelAdds = 3;
ppt.doubleRowText = window.GetProperty("SMOOTH.DOUBLE.ROW.TEXT", true);
ppt.groupHeaderRowsNumber = window.GetProperty("SMOOTH.HEADER.ROWS", 2);
ppt.showArtistAlways = window.GetProperty("SMOOTH.SHOW.ARTIST.ALWAYS", true);
ppt.showGroupHeaders = window.GetProperty("SMOOTH.SHOW.GROUP.HEADERS", true);
ppt.showRating = window.GetProperty("SMOOTH.SHOW.RATING", true);

ppt.defaultRowHeight = window.GetProperty("SMOOTH.ROW.HEIGHT", 35);
ppt.rowHeight = ppt.defaultRowHeight;

if (ppt.groupHeaderRowsNumber < 1) ppt.groupHeaderRowsNumber = 1;
else if (ppt.groupHeaderRowsNumber > 4) ppt.groupHeaderRowsNumber = 4;

var tfo = {
	artist : fb.TitleFormat("[%artist%]"),
	title : fb.TitleFormat("[%title%]"),
	track : fb.TitleFormat("[%artist%] ^^ [%title%] ^^ [%tracknumber%] ^^ [%length%] ^^ $if2(%rating%,0)"),
	time_remaining : fb.TitleFormat("$if3(-%playback_time_remaining%,%playback_time%,)"),
	groupkey : fb.TitleFormat(ppt.groupkey_tf),
	crc_path: fb.TitleFormat("$crc32(%path%)"),
}

function oGroup(index, start, handle, groupkey) {
	this.index = index;
	this.start = start;
	this.count = 1;
	this.metadb = handle;
	this.groupkey = groupkey;
	this.cachekey = tfo.crc_path.EvalWithMetadb(handle);
	this.cover_image = null;
	this.image_requested = false;

	var arr = this.groupkey.split(" ^^ ");
	this.top_left = arr[0] || "";
	this.bottom_left = arr[1] || "";
	this.top_right = arr[2] || "";
	this.bottom_right = arr[3] || "";

	this.finalise = function (count) {
		this.count = count;
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
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		this.scrollbar.updateScrollbar();
	}

	this.setList = function () {
		this.rows = [];
		var r = 0;

		for (var i = 0; i < this.groups.length; i++) {
			var s = this.groups[i].start;

			if (ppt.showGroupHeaders) {
				this.groups[i].rowId = r;
				for (var k = 0; k < ppt.groupHeaderRowsNumber; k++) {
					this.rows[r] = new Object();
					this.rows[r].type = k + 1; // 1st line of group header
					this.rows[r].metadb = this.groups[i].metadb;
					this.rows[r].albumId = i;
					this.rows[r].albumTrackId = 0;
					this.rows[r].playlistTrackId = s;
					this.rows[r].groupkey = this.groups[i].groupkey;
					r++;
				}
			}

			var m = this.groups[i].count;
			for (var j = 0; j < m; j++) {
				this.rows[r] = new Object();
				this.rows[r].type = 0; // track
				this.rows[r].metadb = this.list.GetItem(s + j);
				this.rows[r].albumId = i;
				this.rows[r].albumTrackId = j;
				this.rows[r].playlistTrackId = s + j;
				this.rows[r].groupkey = this.groups[i].groupkey;
				r++;
			}
		}
	}

	this.showFocusedItem = function () {
		g_focus_row = this.getOffsetFocusItem(g_focus_id);
		scroll = (g_focus_row - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		this.scrollbar.updateScrollbar();
	}

	this.selectAtoB = function (start_id, end_id) {
		if (start_id == -1 || end_id == -1) return;
		var affectedItems = Array();

		if (this.SHIFT_start_id == null) {
			this.SHIFT_start_id = start_id;
		}

		plman.ClearPlaylistSelection(g_active_playlist);

		var previous_focus_id = g_focus_id;

		if (start_id < end_id) {
			var deb = start_id;
			var fin = end_id;
		} else {
			var deb = end_id;
			var fin = start_id;
		}

		for (var i = deb; i <= fin; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
		plman.SetPlaylistFocusItem(g_active_playlist, end_id);

		if (affectedItems.length > 1) {
			if (end_id > previous_focus_id) {
				var delta = end_id - previous_focus_id;
				this.SHIFT_count += delta;
			} else {
				var delta = previous_focus_id - end_id;
				this.SHIFT_count -= delta;
			}
		}
	}

	this.getAlbumIdfromTrackId = function (valeur) { // fixed!
		if (valeur < 0) {
			return -1;
		} else {
			var mediane = 0;
			var deb = 0;
			var fin = this.groups.length - 1;
			while (deb <= fin) {
				mediane = Math.floor((fin + deb) / 2);
				if (valeur >= this.groups[mediane].start && valeur < this.groups[mediane].start + this.groups[mediane].count) {
					return mediane;
				} else if (valeur < this.groups[mediane].start) {
					fin = mediane - 1;
				} else {
					deb = mediane + 1;
				}
			}
			return -1;
		}
	}

	this.getOffsetFocusItem = function (fid) { // fixed!
		var row_idx = 0;
		if (fid > -1) {
			if (ppt.showGroupHeaders) {
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				for (i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type != 0 && this.rows[i].albumId == g_focus_album_id) {
						var albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
						row_idx = i + ppt.groupHeaderRowsNumber + albumTrackId;
						break;
					}
				}
			} else {
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				for (i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type == 0 && this.rows[i].albumId == g_focus_album_id) {
						var albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
						row_idx = i + albumTrackId;
						break;
					}
				}
			}
		}
		return row_idx;
	}

	this.get_track_tags = function (index) {
		var track_arr = tfo.track.EvalWithMetadb(this.rows[index].metadb).split(" ^^ ");
		var tags = {
			artist : track_arr[0],
			title : track_arr[1],
			tracknumber : track_arr[2],
			length : track_arr[3],
			rating : track_arr[4],
		};
		return tags;
	}

	this.init_groups = function () {
		this.groups = [];
		if (this.list.Count == 0) return;

		var arr = tfo.groupkey.EvalWithMetadbs(this.list).toArray();
		var previous = "";
		var g = 0, t = 0;

		for (var i = 0; i < this.list.Count; i++) {
			var handle = this.list.GetItem(i);
			var meta = arr[i];
			var current = meta.toLowerCase();

			if (current != previous) {
				if (g > 0) {
					this.groups[g - 1].finalise(t);
					t = 0;
				}
				this.groups.push(new oGroup(g, i, handle, meta));
				t++;
				g++;
				previous = current;
			} else {
				t++;
			}
		}

		this.groups[g - 1].finalise(t);
	}

	this.populate = function () {
		this.list = plman.GetPlaylistItems(g_active_playlist);
		this.init_groups();
		this.setList();
		g_focus_row = this.getOffsetFocusItem(g_focus_id);

		this.update_playlist_info();
		this.scrollbar.updateScrollbar();
		this.repaint();
	}

	this.update_playlist_info = function () {
		this.playlist_info = "";
		if (g_active_playlist > -1) {
			this.playlist_info = plman.GetPlaylistName(g_active_playlist);
			var duration = this.list.CalcTotalDuration();
			this.playlist_info += ", " + this.list.count + (this.list.count == 1 ? " track" : " tracks") + (duration > 0 ? ", " + utils.FormatDuration(duration) : "");
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
			var end_ = start_ + this.totalRows + (ppt.groupHeaderRowsNumber - 1);
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0)
				start_ = 0;
			if (end_ >= this.rows.length)
				end_ = this.rows.length - 1;
		}
		g_start_ = start_;
		g_end_ = end_;
	}

	this.draw = function (gr) {
		this.getlimits();

		if (this.rows.length > 0) {
			var ax = 0;
			var ay = 0;
			var aw = this.w;
			var ah = ppt.rowHeight;
			var g = 0;

			if (fb.IsPlaying && plman.PlayingPlaylist == g_active_playlist) {
				this.nowplaying = plman.GetPlayingItemLocation();
			} else {
				this.nowplaying = null;
			}

			for (var i = g_start_; i <= g_end_; i++) {
				ay = Math.floor(this.y + (i * ah) - scroll_);
				var normal_text = g_color_normal_txt;
				var fader_txt = blendColours(g_color_normal_txt, g_color_normal_bg, 0.25);

				switch (this.rows[i].type) {
				case ppt.groupHeaderRowsNumber: // last group header row
					ay -= (ppt.groupHeaderRowsNumber - 1) * ah;

					gr.FillRectangle(ax, ay, aw, ah * ppt.groupHeaderRowsNumber, g_color_normal_txt & 0x08ffffff);
					gr.DrawRectangle(ax, ay, aw, ah * ppt.groupHeaderRowsNumber, 1, g_color_normal_txt & 0x25ffffff);

					var id = this.rows[i].albumId;
					var image_height = 0;
					if (ppt.groupHeaderRowsNumber >= 2) {
						image_height = ah * ppt.groupHeaderRowsNumber;
						if (!this.groups[id].cover_image && !this.groups[id].image_requested) {
							this.groups[id].image_requested = true;
							var filename = generate_filename(this.groups[id].cachekey, AlbumArtId.front);
							this.groups[id].cover_image = get_art(this.rows[i].metadb, filename, AlbumArtId.front);
						}
						drawImage(gr, this.groups[id].cover_image || (this.rows[i].metadb.Length ? images.noart : images.stream), ax + 1, ay + 1, image_height - 3, image_height - 3, ppt.autoFill, g_color_normal_txt & 0x25ffffff);
					}

					var text_width = aw - image_height - 30;
					if (ppt.groupHeaderRowsNumber == 1) {
						gr.WriteText(this.groups[id].bottom_left + " - " + this.groups[id].top_left, g_font_group1, g_color_normal_txt, ax + image_height + 5, ay, text_width - this.groups[id].top_right.calc_width(g_font_group1), ah, 0, 2, 1, 1);
						gr.WriteText(this.groups[id].top_right, g_font_group1, g_color_normal_txt, 0, ay, aw - 5, ah, 1, 2, 1, 1);
					} else {
						gr.WriteText(this.groups[id].top_left, g_font_group1, g_color_normal_txt, ax + image_height + 5, ay, text_width - this.groups[id].top_right.calc_width(g_font_group1), ah, 0, 2, 1, 1);
						gr.WriteText(this.groups[id].top_right, g_font_group1, g_color_normal_txt, 0, ay, aw - 5, ah, 1, 2, 1, 1);

						var bottom_y = ay + 5 + g_font_group2_height;
						gr.WriteText(this.groups[id].bottom_left, g_font_group2, fader_txt, ax + image_height + 5, bottom_y, text_width - this.groups[id].bottom_right.calc_width(g_font_group2), ah, 0, 2, 1, 1);
						gr.WriteText(this.groups[id].bottom_right, g_font_group2, fader_txt, 0, bottom_y, aw - 5, ah, 1, 2, 1, 1);
					}
					break;
				case 0: // track row
					 // alternating row background
					if (ppt.showGroupHeaders ? this.rows[i].albumTrackId % 2 != 0 : i % 2 != 0) {
						gr.FillRectangle(ax, ay, aw, ah, g_color_normal_txt & 0x08ffffff);
					}

					// selected?
					if (plman.IsPlaylistItemSelected(g_active_playlist, this.rows[i].playlistTrackId)) {
						gr.FillRectangle(ax, ay, aw, ah, g_color_selected_bg & 0xb0ffffff);

						if (normal_text == g_color_selected_bg) {
							normal_text = g_color_normal_bg;
							fader_txt = blendColours(normal_text, g_color_normal_bg, 0.25);
						}

						// and focused?
						if (this.rows[i].playlistTrackId == g_focus_id) {
							gr.DrawRectangle(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
						}
					}

					if (!this.rows[i].tags) {
						this.rows[i].tags = this.get_track_tags(i);
					}

					var tags = this.rows[i].tags;

					var rw = 0;
					if (ppt.showRating) {
						rw = g_rating_width;
						this.rating_x = aw - rw - g_time_width;
						gr.WriteText(chars.rating_off.repeat(5), g_font_awesome, setAlpha(normal_text, 128), this.rating_x, ay, rw, ah, 0, 2);
						gr.WriteText(chars.rating_on.repeat(tags.rating), g_font_awesome, normal_text, this.rating_x, ay, rw, ah, 0, 2);
					}

					var artist = tags.artist;
					var title = tags.title;
					var isplaying = this.nowplaying && this.rows[i].playlistTrackId == this.nowplaying.PlaylistItemIndex;
					if (isplaying) {
						artist = g_radio_artist;
						title = g_radio_title;
						this.nowplaying_y = ay;
						if (fb.IsPaused) {
							gr.WriteText(chars.pause, g_font_awesome, normal_text, ax, ay, ah, ah, 2, 2);
						} else {
							gr.WriteText(chars.play, g_font_awesome, g_seconds % 2 == 0 ? normal_text : setAlpha(normal_text, 128), ax, ay, ah, ah, 2, 2);
						}
					}

					if (ppt.doubleRowText) {
						if (isplaying) {
							gr.WriteText(g_time_remaining, g_font, normal_text, ax, ay, aw - 5, ah / 2, 1, 2, 1, 1);
						} else {
							gr.WriteText(tags.tracknumber, g_font, fader_txt, ax, ay, ah, ah / 2, 2, 2, 1, 1);
							gr.WriteText(tags.length, g_font, normal_text, ax, ay, aw - 5, ah / 2, 1, 2, 1, 1);
						}

						gr.WriteText(title, g_font, normal_text, ax + ah, ay, aw - ah - rw - g_time_width - 10, ah / 2, 0, 2, 1, 1);
						gr.WriteText(artist, g_font, fader_txt, ax + ah, ay + (ah / 2) - 2, aw - ah - rw - g_time_width - 10, ah / 2, 0, 2, 1, 1);
					} else {
						if (isplaying) {
							gr.WriteText(g_time_remaining, g_font, normal_text, ax, ay, aw - 5, ah, 1, 2, 1, 1);
						} else {
							gr.WriteText(tags.tracknumber, g_font, fader_txt, ax, ay, ah, ah, 2, 2, 1, 1);
							gr.WriteText(tags.length, g_font, normal_text, ax, ay, aw - 5, ah, 1, 2, 1, 1);
						}

						gr.WriteText(ppt.showArtistAlways ? artist + " - " + title : title, g_font, normal_text, ax + ah, ay, aw - ah - rw - g_time_width - 10, ah, 0, 2, 1, 1);
					}
					break;
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
			gr.WriteText(this.playlist_info, g_font_box, blendColours(g_color_normal_txt, g_color_normal_bg, 0.4), 0, 0, ww - 5, ppt.headerBarHeight - 1, 1, 2, 1, 1);
		}
	}

	this.selectGroupTracks = function (aId) { // fixed!
		var affectedItems = [];
		var end = this.groups[aId].start + this.groups[aId].count;
		for (var i = this.groups[aId].start; i < end; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
	}

	this._isHover = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}

	this.on_mouse = function (event, x, y) {
		this.ishover = this._isHover(x, y);

		if (this.ishover) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
			if (this.activeRow >= this.rows.length) {
				this.activeRow = -1;
			}
		} else {
			this.activeRow = -1;
		}

		var rating_hover = ppt.showRating && this.activeRow > -1 && x > this.rating_x && x < this.rating_x + g_rating_width;

		switch (event) {
		case "lbtn_down":
			if (y > this.y && !rating_hover && !cTouch.down && !timers.mouseDown && Math.abs(scroll - scroll_) < 2) {
				if (this.activeRow == -1) {
					plman.ClearPlaylistSelection(g_active_playlist);
				} else {
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					var rowType = this.rows[this.activeRow].type;

					switch (true) {
					case rowType > 0: // ----------------> group header row
						if (utils.IsKeyPressed(VK_SHIFT)) {
							if (g_focus_id != playlistTrackId) {
								if (this.SHIFT_start_id != null) {
									this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
								} else {
									this.selectAtoB(g_focus_id, playlistTrackId);
								}
							}
						} else if (utils.IsKeyPressed(VK_CONTROL)) {
							this.selectGroupTracks(this.rows[this.activeRow].albumId);
							this.SHIFT_start_id = null;
						} else {
							plman.ClearPlaylistSelection(g_active_playlist);
							this.selectGroupTracks(this.rows[this.activeRow].albumId);
							this.SHIFT_start_id = null;
						}
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
						break;
					case rowType == 0: // ----------------> track row
						if (utils.IsKeyPressed(VK_SHIFT)) {
							if (g_focus_id != playlistTrackId) {
								if (this.SHIFT_start_id != null) {
									this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
								} else {
									this.selectAtoB(g_focus_id, playlistTrackId);
								}
							}
						} else if (utils.IsKeyPressed(VK_CONTROL)) {
							if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, false);
							} else {
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							}
							this.SHIFT_start_id = null;
						} else {
							if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							}
							this.SHIFT_start_id = null;
						}
						break;
					}
					this.repaint();
				}
			}
			break;
		case "lbtn_up":
			if (rating_hover && this.rows[this.activeRow].metadb) {
				var handles = fb.CreateHandleList(this.rows[this.activeRow].metadb);
				var new_rating = Math.ceil((x - this.rating_x) / (g_rating_width / 5));

				if (foo_playcount) {
					if (new_rating != this.rows[this.activeRow].tags.rating && new_rating > 0) {
						handles.RunContextCommand("Playback Statistics/Rating/" + new_rating);
					} else {
						handles.RunContextCommand("Playback Statistics/Rating/<not set>");
					}
				} else {
					var rp = this.rows[this.activeRow].metadb.RawPath;
					if (rp.indexOf("file://") == 0 || rp.indexOf("cdda://") == 0) {
						if (new_rating != this.rows[this.activeRow].tags.rating && new_rating > 0) {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : new_rating}));
						} else {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : ""}));
						}
					}
				}

				handles.Dispose();
			} else {
				if (this.activeRow > -1) {
					if (this.rows[this.activeRow].type == 0) { // ----------------> track row
						var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
						if (!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) {
							if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								if (plman.GetPlaylistSelectedItems(g_active_playlist).Count > 1) {
									plman.ClearPlaylistSelection(g_active_playlist);
									plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
									plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
								}
							}
						}
					}
					this.repaint();
				}
			}
			break;
		case "lbtn_dblclk":
			if (y < this.y && ppt.wallpapermode == 1 && fb.IsPlaying) {
				fb.GetNowPlaying().ShowAlbumArtViewer();
			} else if (y > this.y && !rating_hover && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (this.rows[this.activeRow].type == 0) { // track
					play(g_active_playlist, this.rows[this.activeRow].playlistTrackId);
				}
				this.repaint();
			}
			break;
		case "rbtn_up":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				var rowType = this.rows[this.activeRow].type;
				switch (true) {
				case rowType > 0: // ----------------> group header row
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
						plman.ClearPlaylistSelection(g_active_playlist);
						this.selectGroupTracks(this.rows[this.activeRow].albumId);
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
						this.SHIFT_start_id = null;
					}
					this.context_menu(x, y, this.track_index, this.row_index);
					break;
				case rowType == 0: // ----------------> track row
					var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
					if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
						plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
					}
					this.context_menu(x, y, playlistTrackId, this.activeRow);
					break;
				}
				this.repaint();
			} else {
				this.settings_context_menu(x, y);
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

	this.context_menu = function (x, y, id, row_id) {
		var _menu = window.CreatePopupMenu();
		var _context = fb.CreateContextMenuManager();
		var _add = window.CreatePopupMenu();

		var flag = playlist_can_remove_items(g_active_playlist) ? MF_STRING : MF_GRAYED;

		_menu.AppendMenuItem(flag, 1, "Crop");
		_menu.AppendMenuItem(flag, 2, "Remove");
		_menu.AppendMenuItem(MF_STRING, 3, "Invert Selection");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(flag, 4, "Cut");
		_menu.AppendMenuItem(MF_STRING, 5, "Copy");
		_menu.AppendMenuItem(playlist_can_add_items(g_active_playlist) && fb.CheckClipboardContents() ? MF_STRING : MF_GRAYED, 6, "Paste");
		_menu.AppendMenuSeparator();

		_add.AppendMenuItem(MF_STRING, 10, "New Playlist");
		if (plman.PlaylistCount > 0) {
			_add.AppendMenuSeparator();
		}
		for (var i = 0; i < plman.PlaylistCount; i++) {
			_add.AppendMenuItem(i != g_active_playlist && playlist_can_add_items(i) ? MF_STRING : MF_GRAYED, 100 + i, plman.GetPlaylistName(i));
		}
		_add.AppendTo(_menu, MF_STRING, "Add to");
		_menu.AppendMenuSeparator();

		var items = plman.GetPlaylistSelectedItems(g_active_playlist);
		_context.InitContextPlaylist();
		_context.BuildMenu(_menu, 1000);

		var idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case idx == 0:
			break;
		case idx == 1:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist, true);
			break;
		case idx == 2:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case idx == 3:
			plman.InvertSelection(g_active_playlist);
			break;
		case idx == 4:
			items.CopyToClipboard();
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case idx == 5:
			items.CopyToClipboard();
			break;
		case idx == 6:
			var base = getFocusId();
			if (base == -1) {
				base = plman.GetPlaylistItemCount(g_active_playlist);
			} else {
				base++;
			}
			plman.UndoBackup(g_active_playlist);
			plman.InsertPlaylistItems(g_active_playlist, base, fb.GetClipboardContents());
			break;
		case idx == 10:
			var pl = plman.CreatePlaylist();
			plman.ActivePlaylist = pl;
			plman.InsertPlaylistItems(pl, 0, items);
			break;
		case idx < 1000:
			var pl = idx - 100;
			plman.UndoBackup(pl);
			plman.InsertPlaylistItems(pl, plman.GetPlaylistItemCount(pl), items);
			break;
		case idx >= 1000:
			_context.ExecuteByID(idx - 1000);
			break;
		}
		items.Dispose();
		_add.Dispose();
		_context.Dispose();
		_menu.Dispose();
		return true;
	}

	this.settings_context_menu = function (x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var _menu2 = window.CreatePopupMenu();
		var _menu3 = window.CreatePopupMenu();
		var _menu4 = window.CreatePopupMenu();

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

		_menu3.AppendMenuItem(MF_STRING, 15, "Enable");
		_menu3.CheckMenuItem(15, ppt.showGroupHeaders);
		_menu3.AppendMenuSeparator();
		_menu3.AppendMenuItem(MF_GRAYED, 0, "Rows");
		_menu3.AppendMenuItem(ppt.showGroupHeaders ? MF_STRING : MF_GRAYED, 11, "1");
		_menu3.AppendMenuItem(ppt.showGroupHeaders ? MF_STRING : MF_GRAYED, 12, "2");
		_menu3.AppendMenuItem(ppt.showGroupHeaders ? MF_STRING : MF_GRAYED, 13, "3");
		_menu3.CheckMenuRadioItem(11, 13, ppt.groupHeaderRowsNumber + 10);
		_menu3.AppendMenuSeparator();
		_menu3.AppendMenuItem(ppt.showGroupHeaders ? MF_STRING : MF_GRAYED, 19, "Album Art: Auto-fill");
		_menu3.CheckMenuItem(19, ppt.autoFill);
		_menu3.AppendTo(_menu, MF_STRING, "Group Headers");

		_menu4.AppendMenuItem(MF_STRING, 20, "Double Track Line");
		_menu4.CheckMenuItem(20, ppt.doubleRowText);
		_menu4.AppendMenuSeparator()
		_menu4.AppendMenuItem(!ppt.doubleRowText ? MF_STRING : MF_GRAYED, 21, "Artist");
		_menu4.CheckMenuItem(21, ppt.showArtistAlways);
		_menu4.AppendMenuItem(MF_STRING, 22, "Rating");
		_menu4.CheckMenuItem(22, ppt.showRating);
		_menu4.AppendTo(_menu, MF_STRING, "Track Info");

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 30, "Panel Properties");
		_menu.AppendMenuItem(MF_STRING, 31, "Configure...");

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
		case 11:
		case 12:
		case 13:
			ppt.groupHeaderRowsNumber = idx - 10;
			window.SetProperty("SMOOTH.HEADER.ROWS", ppt.groupHeaderRowsNumber);
			this.populate();
			break;
		case 15:
			ppt.showGroupHeaders = !ppt.showGroupHeaders;
			window.SetProperty("SMOOTH.SHOW.GROUP.HEADERS", ppt.showGroupHeaders);
			get_metrics();
			this.repaint();
			break;
		case 19:
			ppt.autoFill = !ppt.autoFill;
			window.SetProperty("SMOOTH.AUTO.FILL", ppt.autoFill);
			images.clear();
			this.populate();
			break;
		case 20:
			ppt.doubleRowText = !ppt.doubleRowText;
			window.SetProperty("SMOOTH.DOUBLE.ROW.TEXT", ppt.doubleRowText);
			get_metrics();
			this.repaint();
			break;
		case 21:
			ppt.showArtistAlways = !ppt.showArtistAlways;
			window.SetProperty("SMOOTH.SHOW.ARTIST.ALWAYS", ppt.showArtistAlways);
			get_metrics();
			this.repaint();
			break;
		case 22:
			ppt.showRating = !ppt.showRating;
			window.SetProperty("SMOOTH.SHOW.RATING", ppt.showRating);
			get_metrics();
			this.repaint();
			break;
		case 30:
			window.ShowProperties();
			break;
		case 31:
			window.ShowConfigure();
			break;
		}
		_menu4.Dispose();
		_menu3.Dispose();
		_menu2.Dispose();
		_menu1.Dispose();
		_menu.Dispose();
		return true;
	}

	window.SetTimeout(function () {
		brw.populate();
		brw.showFocusedItem();
	}, 100);

	this.groups = [];
	this.rows = [];
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.scrollbar = new oScrollbar();
	this.keypressed = false;
	this.playlist_info = "";
	this.list = fb.CreateHandleList();
}

function on_size() {
	ww = window.Width;
	wh = window.Height;
	brw.setSize();
}

function on_paint(gr) {
	gr.FillRectangle(0, 0, ww, wh, g_color_normal_bg);
	if (ppt.wallpapermode && g_wallpaperImg) {
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

	if (ppt.enableTouchControl && brw.rows.length > brw.totalRowsVis) {
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
	brw.on_mouse("lbtn_dblclk", x, y);
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
					get_images();
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

	if (ppt.doubleRowText) {
		ppt.rowHeight = scale(ppt.defaultRowHeight + ppt.doubleRowPixelAdds);
	} else {
		ppt.rowHeight = scale(ppt.defaultRowHeight);
	}

	cScrollBar.width = scale(cScrollBar.defaultWidth);
	cScrollBar.minCursorHeight = scale(cScrollBar.defaultMinCursorHeight);

	brw.setSize();
	brw.setList();
}

function kill_scrollbar_timer() {
	cScrollBar.timerCounter = -1;
	if (cScrollBar.timerID) {
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

function on_key_up(vkey) {
	// scroll keys up and down RESET (step and timers)
	brw.keypressed = false;
	kill_scrollbar_timer()
	if (vkey == VK_SHIFT) {
		brw.SHIFT_start_id = null;
		brw.SHIFT_count = 0;
	}
	brw.repaint();
}

function vk_up() {
	var scrollstep = 1;
	var new_focus_id = 0;
	var new_row = 0;

	new_row = g_focus_row - scrollstep;
	if (new_row < 0) {
		if (ppt.showGroupHeaders) {
			new_row = ppt.groupHeaderRowsNumber;
		} else {
			new_row = 0;
		}
		kill_scrollbar_timer();
	} else {
		if (brw.rows[new_row].type != 0) { // group row
			new_row -= ppt.groupHeaderRowsNumber;
		}
	}
	if (new_row >= 0) {
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		kill_scrollbar_timer();
	}
}

function vk_down() {
	var scrollstep = 1;
	var new_focus_id = 0;
	var new_row = 0;

	new_row = g_focus_row + scrollstep;
	if (new_row > brw.rows.length - 1) {
		new_row = brw.rows.length - 1;
		kill_scrollbar_timer();
	} else {
		if (brw.rows[new_row].type != 0) { // group row
			if (brw.rows[new_row].type <= 1) {
				new_row += ppt.groupHeaderRowsNumber;
			}
		}
	}
	if (new_row < brw.rows.length) {
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		kill_scrollbar_timer();
	}
}

function vk_pgup() {
	var scrollstep = brw.totalRowsVis;
	var new_focus_id = 0;
	var new_row = 0;

	new_row = g_focus_row - scrollstep;
	if (new_row < 0) {
		new_row = ppt.groupHeaderRowsNumber;
		kill_scrollbar_timer();
	} else {
		if (brw.rows[new_row].type != 0) { // group row
			new_row += (ppt.groupHeaderRowsNumber - brw.rows[new_row].type + 1);
		}
	}
	if (new_row >= 0) {
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		kill_scrollbar_timer();
	}
}

function vk_pgdn() {
	var scrollstep = brw.totalRowsVis;
	var new_focus_id = 0,
	new_row = 0;

	new_row = g_focus_row + scrollstep;
	if (new_row > brw.rows.length - 1) {
		new_row = brw.rows.length - 1;
	} else {
		if (brw.rows[new_row].type != 0) { // group row
			new_row += (ppt.groupHeaderRowsNumber - brw.rows[new_row].type + 1);
		}
	}
	if (new_row < brw.rows.length) {
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		kill_scrollbar_timer();
	}
}

function on_key_down(vkey) {
	var mask = GetKeyboardMask();

	if (mask == KMask.none) {
		switch (vkey) {
		case VK_UP:
			if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();

				vk_up();
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetTimeout(function () {
						cScrollBar.timerID = window.SetInterval(vk_up, 100);
					}, 400);
				}
			}
			break;
		case VK_DOWN:
			if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();

				vk_down();
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetTimeout(function () {
						cScrollBar.timerID = window.SetInterval(vk_down, 100);
					}, 400);
				}
			}
			break;
		case VK_PGUP:
			if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();

				vk_pgup();
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetTimeout(function () {
						cScrollBar.timerID = window.SetInterval(vk_pgup, 100);
					}, 400);
				}
			}
			break;
		case VK_PGDN:
			if (brw.rows.length > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();

				vk_pgdn();
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetTimeout(function () {
						cScrollBar.timerID = window.SetInterval(vk_pgdn, 100);
					}, 400);
				}
			}
			break;
		case VK_RETURN:
			play(g_active_playlist, g_focus_id);
			break;
		case VK_END:
			if (brw.rows.length > 0) {
				var new_focus_id = brw.rows[brw.rows.length - 1].playlistTrackId;
				plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
				plman.ClearPlaylistSelection(g_active_playlist);
				plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
			}
			break;
		case VK_HOME:
			if (brw.rows.length > 0) {
				var new_focus_id = brw.rows[0].playlistTrackId;
				plman.ClearPlaylistSelection(g_active_playlist);
				plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
				plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
			}
			break;
		case VK_DELETE:
			if (playlist_can_remove_items(g_active_playlist)) {
				plman.UndoBackup(g_active_playlist);
				plman.RemovePlaylistSelection(g_active_playlist);
			}
			break;
		}
	} else if (mask == KMask.shift) {
		switch (vkey) {
		case VK_SHIFT: // SHIFT key alone
			brw.SHIFT_count = 0;
			break;
		case VK_UP: // SHIFT + KEY UP
			if (brw.SHIFT_count == 0) {
				if (brw.SHIFT_start_id == null) {
					brw.SHIFT_start_id = g_focus_id;
				}
				plman.ClearPlaylistSelection(g_active_playlist);
				plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
				if (g_focus_id > 0) {
					brw.SHIFT_count--;
					g_focus_id--;
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
			} else if (brw.SHIFT_count < 0) {
				if (g_focus_id > 0) {
					brw.SHIFT_count--;
					g_focus_id--;
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
			} else {
				plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
				brw.SHIFT_count--;
				g_focus_id--;
				plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
			}
			break;
		case VK_DOWN: // SHIFT + KEY DOWN
			if (brw.SHIFT_count == 0) {
				if (brw.SHIFT_start_id == null) {
					brw.SHIFT_start_id = g_focus_id;
				}
				plman.ClearPlaylistSelection(g_active_playlist);
				plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
				if (g_focus_id < brw.list.Count - 1) {
					brw.SHIFT_count++;
					g_focus_id++;
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
			} else if (brw.SHIFT_count > 0) {
				if (g_focus_id < brw.list.Count - 1) {
					brw.SHIFT_count++;
					g_focus_id++;
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
				}
			} else {
				plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
				brw.SHIFT_count++;
				g_focus_id++;
				plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
			}
			break;
		}
	} else if (mask == KMask.ctrl) {
		if (vkey == 65) { // CTRL+A
			fb.RunMainMenuCommand("Edit/Select all");
			brw.repaint();
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
				plman.InsertPlaylistItems(g_active_playlist, plman.GetPlaylistItemCount(g_active_playlist), items, false);
				items.Dispose();
			}
		}
		if (vkey == 84) { // CTRL+T
			ppt.showHeaderBar = !ppt.showHeaderBar;
			window.SetProperty("SMOOTH.SHOW.TOP.BAR", ppt.showHeaderBar);
			get_metrics();
			brw.repaint();
		}
		if (vkey == 89) { // CTRL+Y
			fb.RunMainMenuCommand("Edit/Redo");
		}
		if (vkey == 90) { // CTRL+Z
			fb.RunMainMenuCommand("Edit/Undo");
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

function on_playback_dynamic_info_track(type) {
	if (type == 0) {
		g_radio_title = tfo.title.Eval();
		g_radio_artist = tfo.artist.Eval();

		if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
			brw.repaint();
		}
	} else if (type == 1 && ppt.wallpapermode == 1) {
		setWallpaperImg();
		brw.repaint();
	}
}

function on_playback_stop(reason) {
	g_time_remaining = "";
	g_radio_title = "";
	g_radio_artist = "";

	if (reason != 2 && ppt.wallpapermode == 1 && g_wallpaperImg) {
		g_wallpaperImg.Dispose();
		g_wallpaperImg = null;
	}
	brw.repaint();
}

function on_playback_new_track() {
	g_radio_title = tfo.title.Eval();
	g_radio_artist = tfo.artist.Eval();
	g_time_remaining = tfo.time_remaining.Eval();
	setWallpaperImg();
	brw.repaint();
}

function on_playback_time(time) {
	g_seconds = time;
	g_time_remaining = tfo.time_remaining.Eval();

	if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
		brw.repaint();
	}
}

function on_playback_pause(state) {
	if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
		brw.repaint();
	}
}

function on_playlists_changed() {
	g_active_playlist = plman.ActivePlaylist;
	brw.update_playlist_info();
	brw.repaint();
}

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist;
	g_focus_id = getFocusId();
	brw.populate();
}

function on_playlist_items_added(playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_playlist_items_removed(playlist_idx, new_count) {
	if (playlist_idx == g_active_playlist) {
		if (new_count == 0) {
			scroll = scroll_ = 0;
		}
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_playlist_items_reordered(playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId();
		brw.populate();
	}
}

function on_item_focus_change(playlist, from, to) {
	g_focus_id = to;

	if (playlist == g_active_playlist) {
		g_focus_row = brw.getOffsetFocusItem(g_focus_id);
		if (g_focus_row < scroll / ppt.rowHeight || g_focus_row > scroll / ppt.rowHeight + brw.totalRowsVis - 0.1) {
			var old = scroll;
			scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			if (Math.abs(scroll - scroll_) > ppt.rowHeight * 5) {
				if (scroll_ > scroll) {
					scroll_ = scroll + ppt.rowHeight * 5;
				} else {
					scroll_ = scroll - ppt.rowHeight * 5;
				}
			}
			brw.scrollbar.updateScrollbar();
		}

		if (!isScrolling)
			brw.repaint();
	}
}

function on_metadb_changed(handles) {
	brw.populate();
}

function on_playlist_items_selection_change() {
	brw.repaint();
}

function on_focus(is_focused) {
	if (is_focused) {
		plman.SetActivePlaylistContext();
		g_selHolder.SetPlaylistSelectionTracking();
	} else {
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
	return isNaN(scroll___) ? 0 : scroll___;
}

function getFocusId() {
	return plman.GetPlaylistFocusItemIndex(g_active_playlist);
}

function on_drag_over(action, x, y, mask) {
	if (y < brw.y) {
		action.Effect = 0;
	} else {
		if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1 || playlist_can_add_items(plman.ActivePlaylist)) {
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	}
}

function on_drag_drop(action, x, y, mask) {
	if (y < brw.y) {
		action.Effect = 0;
	} else {
		if (playlist_can_add_items(plman.ActivePlaylist)) {
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			action.Playlist = plman.ActivePlaylist;
			action.Base = plman.GetPlaylistItemCount(plman.ActivePlaylist);
			action.ToSelect = true;
			action.Effect = 1;
		} else if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1) {
			action.Playlist = plman.CreatePlaylist(plman.PlaylistCount, "Dropped Items");
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		} else {
			action.Effect = 0;
		}
	}
}

var foo_playcount = utils.CheckComponent("foo_playcount");

var g_active_playlist = plman.ActivePlaylist;
var g_focus_id = getFocusId();
var g_focus_row = 0;
var g_focus_album_id = -1;
var g_seconds = 0;
var g_time_remaining = 0;
var g_radio_title = tfo.title.Eval();
var g_radio_artist = tfo.artist.Eval();

var g_selHolder = fb.AcquireSelectionHolder();
g_selHolder.SetPlaylistSelectionTracking();
plman.SetActivePlaylistContext();

var brw = new oBrowser();

get_metrics();
setWallpaperImg();
