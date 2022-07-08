function oGroup(index, start, count, total_time_length, focusedTrackId, iscollapsed) {
	this.index = index;
	this.start = start;
	this.count = count;
	this.total_time_length = total_time_length;
	this.total_group_duration_txt = utils.FormatDuration(total_time_length);

	if (count < cGroup.count_minimum) {
		this.rowsToAdd = cGroup.count_minimum - count;
	} else {
		this.rowsToAdd = 0;
	}

	this.rowsToAdd += cGroup.extra_rows;

	if (properties.autocollapse) {
		if (focusedTrackId >= this.start && focusedTrackId < this.start + this.count) {
			this.collapsed = false;
			g_group_id_focused = this.index;
		} else {
			this.collapsed = true;
		}
	} else if (iscollapsed) {
		this.collapsed = true;
	} else {
		this.collapsed = false;
	}

	this.totalPreviousRows = 0;

	this.collapse = function () {
		this.collapse = true;
	}

	this.expand = function () {
		this.collapse = false;
	}
}

function oItem(row_index, type, handle, track_index, group_index, track_index_in_group, heightInRow, groupRowDelta, obj, empty_row_index) {
	this.type = type; // 0 track, 1 group
	this.row_index = row_index;
	this.metadb = handle;
	this.track_index = track_index;
	this.track_index_in_group = track_index_in_group;
	this.group_index = group_index;
	this.heightInRow = heightInRow;
	this.groupRowDelta = groupRowDelta;
	this.obj = obj;
	this.empty_row_index = empty_row_index;

	if (this.type == 1 && this.metadb) {
		this.l1 = get_tfo(p.list.groupby[cGroup.pattern_idx].l1).EvalWithMetadb(this.metadb);
		this.r1 = get_tfo(p.list.groupby[cGroup.pattern_idx].r1).EvalWithMetadb(this.metadb);
		this.l2 = get_tfo(p.list.groupby[cGroup.pattern_idx].l2).EvalWithMetadb(this.metadb);
		this.r2 = get_tfo(p.list.groupby[cGroup.pattern_idx].r2).EvalWithMetadb(this.metadb);
	}

	this.parseTF = function (tf, default_color) {
		var result = [tf, default_color];
		var txt = "", i = 1, tmp = "";
		var pos = tf.indexOf(String.fromCharCode(3));
		if (pos > -1) {
			var tab = tf.split(String.fromCharCode(3));
			var fin = tab.length;
			// if first part is text (not a color)
			if (pos > 0)
				txt = tab[0];
			// get color and other text part
			tmp = tab[1];
			result[1] = eval("0xFF" + tmp.substr(4, 2) + tmp.substr(2, 2) + tmp.substr(0, 2));
			while (i < fin) {
				txt = txt + tab[i + 1];
				i += 2;
			}
			result[0] = txt;
		}
		return result;
	}

	this.drawRowContents = function (gr) {
		var is_item_selected = plman.IsPlaylistItemSelected(g_active_playlist, this.track_index);
		var txt_color = is_item_selected && g_color_normal_txt == g_color_selected_bg ? RGB(255, 255, 255) : g_color_normal_txt;
		var fader_txt = blendColours(txt_color, g_color_normal_bg, 0.35);

		if (is_item_selected) {
			gr.FillRectangle(this.x + cover.w, this.y, this.w - cover.w, this.h, setAlpha(g_color_selected_bg, 150));
			if (p.list.focusedTrackId == this.track_index) {
				DrawRectangle(gr, this.x + cover.w + 1, this.y, this.w - cover.w - 2, this.h, setAlpha(txt_color, 150));
			}
		}

		if (cList.enableExtraLine) {
			var tf1_y = this.y;
			var tf1_h = (this.h / 2) + 2;
			var tf2_y = this.y + (this.h / 2);
			var tf2_h = (this.h / 2) - 2;
		} else {
			var tf1_y = this.y;
			var tf1_h = this.h;
			var tf2_y = 0;
			var tf2_h = 0;
		}

		columns.mood_x = ww;
		columns.rating_x = ww;
		for (var j = 0; j < p.headerBar.columns.length; j++) {
			var tf1 = tf2 = null;
			if (p.headerBar.columns[j].w > 0) {
				var cx = p.headerBar.columns[j].x + g_z5;
				var cw = (Math.abs(p.headerBar.w * p.headerBar.columns[j].percent / 100000)) - g_z10;
				switch (p.headerBar.columns[j].ref) {
				case "State":
					switch (p.headerBar.columns[j].align) {
					case 1:
						cx += (cw - cRow.playlist_h) / 2;
						break;
					case 2:
						cx = cx + cw - cRow.playlist_h;
						break;
					};

					if (!is_item_selected)
						gr.FillRectangle(cx, this.y + 2, cRow.playlist_h - 4, cRow.playlist_h - 4, txt_color & 0x08ffffff);

					if (fb.IsPlaying && plman.PlayingPlaylist == g_active_playlist && this.track_index == p.list.nowplaying.PlaylistItemIndex) {
						if (fb.IsPaused) {
							gr.WriteText(chars.pause, g_font_awesome_20, txt_color, cx, this.y + 2, cRow.playlist_h - 4, cRow.playlist_h - 4, 2, 2);
						} else {
							gr.WriteText(chars.play, g_font_awesome_20, g_seconds % 2 == 0 ? txt_color : setAlpha(txt_color, 60), cx + 2, this.y + 2, cRow.playlist_h - 4, cRow.playlist_h - 4, 2, 2);
						}
					} else {
						var queue_index = get_tfo("[%queue_index%]").EvalActivePlaylistItem(this.track_index);
						if (queue_index.length) {
							DrawRectangle(gr, cx, this.y + 2, cRow.playlist_h - 4, cRow.playlist_h - 4, txt_color);
							gr.WriteText(queue_index, g_font_15_1, txt_color, cx + 1, this.y + 3, cRow.playlist_h - 4, cRow.playlist_h - 4, 2, 2, 1, 1);
						}
					}
					break;
				case "Mood":
					if (typeof this.mood == "undefined") {
						this.mood = get_tfo(p.headerBar.columns[j].tf).EvalWithMetadb(this.metadb);
						var moodArray = this.parseTF(this.mood, txt_color);
						this.mood = moodArray[0];
						this.mood_color = moodArray[1];
					}
					columns.mood_w = cRow.playlist_h;
					p.headerBar.columns[j].minWidth = 36;
					switch (p.headerBar.columns[j].align) {
					case 1:
						columns.mood_x = cx + ((cw - columns.mood_w) / 2);
						break;
					case 2:
						columns.mood_x = cx + (cw - columns.mood_w);
						break;
					}
					if (this.mood != 0) {
						gr.WriteText(chars.heart_on, g_font_awesome_20, this.mood_color, columns.mood_x, this.y, columns.mood_w, cRow.playlist_h, 2, 2);
					} else {
						gr.WriteText(chars.heart_off, g_font_awesome_20, txt_color & 0x20ffffff, columns.mood_x, this.y, columns.mood_w, cRow.playlist_h, 2, 2);
					}
					break;
				case "Rating":
					cw = p.headerBar.columns[j].w - g_z5;
					if (typeof this.rating != "number") {
						this.rating = get_tfo(p.headerBar.columns[j].tf).EvalWithMetadb(this.metadb);
						var ratingArray = this.parseTF(this.rating, RGB(255, 128, 0));
						this.rating = ratingArray[0];
						this.rating_color = ratingArray[1];
					}
					p.headerBar.columns[j].minWidth = columns.rating_w; // columns.rating_w set inside get_font
					switch (p.headerBar.columns[j].align) {
					case 0:
						columns.rating_x = cx;
						break;
					case 1:
						columns.rating_x = cx + (cw - columns.rating_w);
						break;
					case 2:
						columns.rating_x = cx + ((cw - columns.rating_w) /2);
						break;
					}
					gr.WriteText(chars.rating_off.repeat(5), g_font_awesome_20, txt_color & 0x20ffffff, columns.rating_x, this.y, columns.rating_w, cRow.playlist_h, 0, 2);
					gr.WriteText(chars.rating_on.repeat(this.rating), g_font_awesome_20, this.rating_color, columns.rating_x, this.y, columns.rating_w, cRow.playlist_h, 0, 2);
					break;
				default:
					if (p.headerBar.columns[j].tf != "null") {
						var line1 = get_tfo(p.headerBar.columns[j].tf).EvalActivePlaylistItem(this.track_index);
						DrawColouredText(gr, line1, g_font_12, txt_color, cx, tf1_y, cw, tf1_h, p.headerBar.columns[j].align);
					}
					if (cList.enableExtraLine && p.headerBar.columns[j].tf2 != "null") {
						var line2 = get_tfo(p.headerBar.columns[j].tf2).EvalActivePlaylistItem(this.track_index);
						DrawColouredText(gr, line2, g_font_12, fader_txt, cx, tf2_y, cw, tf2_h, p.headerBar.columns[j].align);
					}
					break;
				}
			}
		}
	}

	this.draw = function (gr, x, y, w, h) {
		var is_item_selected = plman.IsPlaylistItemSelected(g_active_playlist, this.track_index);
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		cover.w = 0;

		switch (this.type) {
		case 0:
			// Draw cover art
			// ==============
			if (cover.column) {
				cover.w = p.headerBar.columns[0].w;
				cover.h = cover.w;

				if (this.row_index == 0 && this.track_index_in_group > 0 && this.track_index_in_group <= Math.ceil(cover.h / cRow.playlist_h)) {
					var cover_draw_delta = this.track_index_in_group * cRow.playlist_h;
				} else {
					var cover_draw_delta = 0;
				}
				if ((this.track_index_in_group == 0 || (this.row_index == 0 && cover_draw_delta > 0))) {
					var cv_x = Math.floor(this.x + g_z5);
					var cv_y = Math.floor((this.y - cover_draw_delta) + g_z5);
					var cv_w = Math.floor(cover.w - g_z10);
					var cv_h = Math.floor(cover.h - g_z10);

					var groupmetadb = p.list.handleList.GetItem(p.list.groups[this.group_index].start);
					DrawCover(gr, g_image_cache.get(groupmetadb), cv_x, cv_y, cv_w, cv_h);
				}
			}

			// ===============
			// draw track item
			// ===============
			if (this.empty_row_index == 0) {
				// now playing track
				if (fb.IsPlaying) {
					if (plman.PlayingPlaylist == g_active_playlist) {
						if (this.track_index == p.list.nowplaying.PlaylistItemIndex) {
							p.list.nowplaying_y = this.y;
						}
					}
				}

				// Draw Track content
				// ==================
				this.drawRowContents(gr);
			}

			// if no group header draw a thin line on the top of the 1st track of the group
			if (!properties.showgroupheaders && this.track_index_in_group == 0) {
				gr.FillRectangle(this.x, this.y, this.w, 2, g_color_normal_txt & 0x10ffffff);
			}

			if (this.ishover && g_drag_drop_status && g_drag_drop_row_id > -1) {
				if (this.row_index == g_drag_drop_row_id) {
					gr.FillRectangle(this.x + cover.w, this.y - Math.floor(cList.borderWidth / 2), this.w - cover.w, cList.borderWidth, g_color_selected_bg);
					gr.FillRectangle(this.x + cover.w, this.y - Math.floor(cList.borderWidth / 2) - 3 * cList.borderWidth, cList.borderWidth, 7 * cList.borderWidth, g_color_selected_bg);
					gr.FillRectangle(this.x + this.w - cList.borderWidth, this.y - Math.floor(cList.borderWidth / 2) - 3 * cList.borderWidth, cList.borderWidth, 7 * cList.borderWidth, g_color_selected_bg);
				}
			}

			break;
		case 1:
			// ===============
			// draw group item
			// ===============
			if (this.obj) {
				if (!cover.column || (cover.column && this.obj.collapsed)) {
					if (this.heightInRow > 1 && cover.show) {
						cover.h = this.heightInRow * cRow.playlist_h;
						cover.w = cover.h;
					} else {
						cover.h = g_z5;
						cover.w = cover.h;
					}
				} else {
					cover.h = g_z4;
					cover.w = cover.h;
				}
			} else {
				cover.h = g_z4;
				cover.w = cover.h;
			}
			var groupDelta = this.groupRowDelta * cRow.playlist_h;

			// group header bg
			gr.FillRectangle(this.x, (this.y - groupDelta) - 1 + this.h, this.w, 1, g_color_normal_txt & 0x25ffffff);
			gr.FillRectangle(this.x, (this.y - groupDelta) + 1, this.w, this.h - 2, setAlpha(g_color_normal_txt, 14));

			// group text info
			var text_left_padding = g_z2;
			var scrollbar_gap = (p.scrollbar.visible && (p.list.totalRows > p.list.totalRowVisible)) ? 0 : cScrollBar.width;
			var fader_txt = blendColours(g_color_normal_txt, g_color_normal_bg, 0.35);
			var lg1_right_field_w = this.r1.calc_width(g_font_group1) + cList.borderWidth * 2;
			var lg2_right_field_w = this.r2.calc_width(g_font_group2) + cList.borderWidth * 2;

			// Draw Header content
			// ===================
			if (this.heightInRow == 1) {
				gr.WriteText(this.l1 + " / " + this.l2, g_font_group1, g_color_normal_txt, this.x + cover.w + text_left_padding, (this.y - groupDelta) - 1, this.w - cover.w - text_left_padding * 4 - lg1_right_field_w - scrollbar_gap, this.h, 0, 2, 1, 1);
				gr.WriteText(this.r1, g_font_group1, g_color_normal_txt, this.x + cover.w + text_left_padding, (this.y - groupDelta) - 1, this.w - cover.w - text_left_padding * 5 + 2 - scrollbar_gap, this.h, 1, 2, 1, 1);
				gr.FillRectangle(this.x + cover.w + text_left_padding, Math.round(this.y + cRow.playlist_h * 1 - groupDelta - 5), this.w - cover.w - text_left_padding * 5 + 2 - scrollbar_gap, 1, g_line_colour);
				break;
			} else {
				gr.WriteText(this.l1, g_font_group1, g_color_normal_txt, this.x + cover.w + text_left_padding, (this.y - groupDelta) + 3, this.w - cover.w - text_left_padding * 4 - lg1_right_field_w - scrollbar_gap, cRow.playlist_h, 0, 2, 1, 1);
				gr.WriteText(this.l2, g_font_group2, fader_txt, this.x + cover.w + text_left_padding, (this.y + cRow.playlist_h - groupDelta) - 4, this.w - cover.w - text_left_padding * 4 - lg2_right_field_w - scrollbar_gap, cRow.playlist_h, 0, 2, 1, 1);
				gr.WriteText(this.r1, g_font_group1, g_color_normal_txt, this.x + cover.w + text_left_padding, (this.y - groupDelta) + 3, this.w - cover.w - text_left_padding * 5 + 2 - scrollbar_gap, cRow.playlist_h, 1, 2, 1, 1);
				gr.WriteText(this.r2, g_font_group2, fader_txt, this.x + cover.w + text_left_padding, (this.y + cRow.playlist_h - groupDelta) - 4, this.w - cover.w - text_left_padding * 5 + 1 - scrollbar_gap, cRow.playlist_h, 1, 2, 1, 1);
				gr.FillRectangle(this.x + cover.w + text_left_padding, (this.y + cRow.playlist_h * 2 - groupDelta) - 8, this.w - cover.w - text_left_padding * 5 + 2 - scrollbar_gap, 1, g_line_colour);

				if (this.heightInRow > 2 && this.obj) {
					var lg3_left_field = this.obj.count + (this.obj.count > 1 ? " tracks. " : " track. ") + this.obj.total_group_duration_txt + ".";
					var lg3_right_field = (this.group_index + 1) + " / " + p.list.groups.length;
					var lg3_right_field_w = lg3_right_field.calc_width(g_font_12) + cList.borderWidth * 2;
					gr.WriteText(lg3_left_field, g_font_12, fader_txt, this.x + cover.w + text_left_padding, (this.y + cRow.playlist_h * 2 - groupDelta) - 4, this.w - cover.w - text_left_padding * 4 - lg3_right_field_w - scrollbar_gap, cRow.playlist_h, 0, 0, 1);
				}
			}

			// Draw cover art
			// ==============
			if (this.obj) {
				if (!cover.column || (cover.column && this.obj.collapsed)) {
					if (this.heightInRow > 1 && cover.show) {
						var cv_x = Math.floor(this.x + g_z5);
						var cv_y = Math.floor((this.y - groupDelta) + g_z5);
						var cv_w = Math.floor(cover.w - g_z10);
						var cv_h = Math.floor(cover.h - g_z10);
						DrawCover(gr, g_image_cache.get(this.metadb), cv_x, cv_y, cv_w, cv_h);
					}
				}
			}

			// Draw line if dragging over group header
			if (this.ishover && g_drag_drop_status && g_drag_drop_row_id > -1 && this.row_index == g_drag_drop_row_id) {
				gr.FillRectangle(this.x, this.y - Math.floor(cList.borderWidth / 2), this.w, cList.borderWidth, g_color_selected_bg);
				gr.FillRectangle(this.x, this.y - Math.floor(cList.borderWidth / 2) - 3 * cList.borderWidth, cList.borderWidth, 7 * cList.borderWidth, g_color_selected_bg);
				gr.FillRectangle(this.x + this.w - cList.borderWidth, this.y - Math.floor(cList.borderWidth / 2) - 3 * cList.borderWidth, cList.borderWidth, 7 * cList.borderWidth, g_color_selected_bg);
			}
			break;
		}
	}

	this.drag_drop_check = function (x, y, id) {
		var groupDelta = this.groupRowDelta * cRow.playlist_h;
		var col_cover_w = (p.headerBar.columns[0].percent > 0 ? p.headerBar.columns[0].w : 0);
		this.ishover = (x >= this.x + col_cover_w && x < this.x + this.w && y >= this.y && y < this.y + this.h - groupDelta);
		if (this.ishover) {
			var trackId = p.list.getTrackId(this.row_index);
			g_drag_drop_track_id = this.track_index;
			g_drag_drop_row_id = this.row_index;
		}
	}

	this.check = function (event, x, y) {
		var is_item_selected = plman.IsPlaylistItemSelected(g_active_playlist, this.track_index);
		var groupDelta = this.groupRowDelta * cRow.playlist_h;
		var col_cover_w = (p.headerBar.columns[0].percent > 0 ? p.headerBar.columns[0].w : 0);
		this.ishover = (x >= this.x + col_cover_w && x < this.x + this.w && y >= this.y && y < this.y + this.h - groupDelta);

		var rating_hover = (this.type == 0 && this.empty_row_index == 0 && x >= columns.rating_x && x <= columns.rating_x + columns.rating_w && y > this.y + 2 && y < this.y + this.h - 2);
		var mood_hover = (this.type == 0 && this.empty_row_index == 0 && x >= columns.mood_x && x <= columns.mood_x + columns.mood_w - 3 && y > this.y + 2 && y < this.y + this.h - 2);

		switch (event) {
		case "lbtn_down":
			if (this.ishover) {
				p.list.item_clicked = true;
				if (this.type == 1) { // group header
					if (utils.IsKeyPressed(VK_SHIFT)) {
						if (this.obj && p.list.focusedTrackId != this.track_index) {
							if (p.list.SHIFT_start_id != null) {
								p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index + this.obj.count - 1);
							} else {
								p.list.selectAtoB(p.list.focusedTrackId, this.track_index + this.obj.count - 1);
							}
						}
					} else if (utils.IsKeyPressed(VK_CONTROL)) {
						plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
						p.list.selectGroupTracks(this.group_index, true);
						p.list.SHIFT_start_id = null;
					} else {
						plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
						plman.ClearPlaylistSelection(g_active_playlist);
						if (this.obj) {
							if ((properties.autocollapse && !this.obj.collapsed) || !properties.autocollapse) {
								p.list.selectGroupTracks(this.group_index, true);
							}
						}
						p.list.SHIFT_start_id = null;
					}
					if (this.obj && properties.autocollapse) {
						if (this.obj.collapsed) {
							p.list.updateGroupStatus(this.group_index);
							full_repaint();
						}
					}
				} else { // track
					if (!rating_hover && !mood_hover) {
						if (is_item_selected) {
							if (playlist_can_reorder(g_active_playlist)) {
								g_drag_drop_internal = true;
							}
							if (utils.IsKeyPressed(VK_SHIFT)) {
								if (p.list.focusedTrackId != this.track_index) {
									if (p.list.SHIFT_start_id != null) {
										p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index);
									} else {
										p.list.selectAtoB(p.list.focusedTrackId, this.track_index);
									}
								}
							} else if (utils.IsKeyPressed(VK_CONTROL)) {
								plman.SetPlaylistSelectionSingle(g_active_playlist, this.track_index, false);
							} else if (plman.GetPlaylistSelectedItems(g_active_playlist).Count == 1) {
								plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, this.track_index, true);
							}
						} else { // click on a not selected track
							if (utils.IsKeyPressed(VK_SHIFT)) {
								if (p.list.focusedTrackId != this.track_index) {
									if (p.list.SHIFT_start_id != null) {
										p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index);
									} else {
										p.list.selectAtoB(p.list.focusedTrackId, this.track_index);
									}
								}
							} else {
								p.list.selX = x;
								p.list.selY = y;
								p.list.drawRectSel_click = true;
								p.list.selStartId = this.track_index;
								p.list.selStartOffset = p.list.offset;
								p.list.selEndOffset = p.list.offset;
								p.list.selDeltaRows = 0;
								p.list.selAffected.splice(0, p.list.selAffected.length);
								plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
								if (!utils.IsKeyPressed(VK_CONTROL)) {
									plman.ClearPlaylistSelection(g_active_playlist);
								}
								plman.SetPlaylistSelectionSingle(g_active_playlist, this.track_index, true);
								p.list.SHIFT_start_id = null;
							}
						}
					}
				}
			}
			break;
		case "lbtn_dblclk":
			if (this.ishover) {
				if (this.type == 1) { // group header
					if (!properties.autocollapse) {
						if (this.obj) {
							if (this.obj.collapsed) {
								p.list.updateGroupsOnExpand(this.group_index);
							} else {
								p.list.updateGroupsOnCollapse(this.group_index);
							}
						}
					}
					p.list.setItems(false);
					full_repaint();
				} else { // track
					if (!rating_hover && !mood_hover) plman.ExecutePlaylistDefaultAction(g_active_playlist, this.track_index);
				}
			}
			break;
		case "lbtn_up":
			g_drag_drop_internal = false;
			if (this.ishover && this.metadb) {
				var handles = fb.CreateHandleList(this.metadb);
				var rp = this.metadb.RawPath;
				var can_tag = rp.indexOf("file://") == 0 || rp.indexOf("cdda://") == 0;

				if (rating_hover ) {
					var new_rating = Math.ceil((x - columns.rating_x) / (columns.rating_w / 5));

					if (foo_playcount) {
						if (new_rating != this.rating && new_rating > 0) {
							handles.RunContextCommand("Playback Statistics/Rating/" + new_rating);
						} else {
							handles.RunContextCommand("Playback Statistics/Rating/<not set>");
						}
					} else if (can_tag) {
						if (new_rating != this.rating && new_rating > 0) {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : new_rating}));
						} else {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : ""}));
						}
					}
				} else if (mood_hover) {
					if (properties.use_foo_lastfm_playcount_sync) {
						var loved = get_tfo("$if2(%lfm_loved%,0)").EvalWithMetadb(this.metadb);
						if (foo_lastfm) {
							handles.RunContextCommand("Last.fm/" + (loved == 1 ? "Unlove" : "Love"));
						} else if (foo_lastfm_playcount_sync) {
							handles.RunContextCommand("Last.fm Playcount Sync/" + (loved == 1 ? "Unlove" : "Love"));
						}
					} else if (can_tag) {
						if (typeof this.mood == "undefined" || this.mood == 0) {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : utils.TimestampToDateString(new Date().getTime() / 1000)}));
						} else {
							handles.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : ""}));
						}
					}
				}
				handles.Dispose();
			}
			this.drawRectSel_click = false;
			this.drawRectSel = false;
			break;
		case "rbtn_up":
			if (this.ishover) {
				if (this.type == 1) { // group header
					if (!is_item_selected) {
						plman.ClearPlaylistSelection(g_active_playlist);
						plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
						p.list.selectGroupTracks(this.group_index, true);
						p.list.SHIFT_start_id = null;
					}
				} else { // track
					if (!this.rating_hover && !this.mood_hover) {
						if (!is_item_selected) {
							plman.SetPlaylistFocusItem(g_active_playlist, this.track_index);
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, this.track_index, true);
						}
					}
				}
			}
			break;
		case "move":
			// update on mouse move to draw rect selection zone
			if (!this.drawRectSel) {
				this.drawRectSel = this.drawRectSel_click;
			}
			if (p.list.drawRectSel) {
				if (this.ishover) {
					if (this.type == 0) { // track
						p.list.selEndId = this.track_index;
					} else { // group header
						if (this.track_index > 0) {
							if (y > p.list.selY) {
								if (p.list.selStartId <= p.list.selEndId) {
									if (this.track_index == this.track_index + 1) {
										p.list.selEndId = this.track_index - 0;
									} else {
										p.list.selEndId = this.track_index - 1;
									}
								} else {
									if (this.track_index == this.track_index + 1) {
										p.list.selEndId = this.track_index - 1;
									} else {
										p.list.selEndId = this.track_index - 0;
									}
								}
							} else {
								if (p.list.selStartId < p.list.selEndId) {
									if (this.track_index == this.track_index + 1) {
										p.list.selEndId = this.track_index - 0;
									} else {
										p.list.selEndId = this.track_index - 1;
									}
								} else {
									if (this.track_index == this.track_index + 1) {
										p.list.selEndId = this.track_index - 1;
									} else {
										p.list.selEndId = this.track_index - 0;
									}
								}
							}
						}
					}

					if (!cList.interval) {
						window.SetCursor(IDC_HAND);
						cList.interval = window.SetInterval(function () {
							if (mouse_y < p.list.y + cRow.playlist_h) {
								p.list.selEndId = p.list.selEndId > 0 ? p.list.items[0].track_index : 0;
								if (p.scrollbar.visible)
									on_mouse_wheel(1);
							} else if (mouse_y > p.list.y + p.list.h - cRow.playlist_h) {
								p.list.selEndId = p.list.selEndId < p.list.count - 1 ? p.list.items[p.list.items.length - 1].track_index : p.list.count - 1;
								if (p.scrollbar.visible)
									on_mouse_wheel(-1);
							}
							// set selection on items in the rect area drawn
							plman.SetPlaylistSelection(g_active_playlist, p.list.selAffected, false);
							p.list.selAffected.splice(0, p.list.selAffected.length);
							var deb = p.list.selStartId <= p.list.selEndId ? p.list.selStartId : p.list.selEndId;
							var fin = p.list.selStartId <= p.list.selEndId ? p.list.selEndId : p.list.selStartId;
							for (var i = deb; i <= fin; i++) {
								p.list.selAffected.push(i);
							}
							plman.SetPlaylistSelection(g_active_playlist, p.list.selAffected, true);
							plman.SetPlaylistFocusItem(g_active_playlist, p.list.selEndId);
							p.list.selEndOffset = p.list.offset;
						}, 100);
					} else {
						window.SetCursor(IDC_ARROW);
					}
				}
			}
			if (g_drag_drop_internal) {
				plman.GetPlaylistSelectedItems(g_active_playlist).DoDragDrop(1);
				g_drag_drop_internal = false;
			}
			break;
		}
	}
}

function oGroupBy(label, tf, sortOrder, ref, playlistFilter, extraRows, collapsedHeight, expandedHeight, showCover, autoCollapse, l1, r1, l2, r2, collapseGroupsByDefault) {
	this.label = label;
	this.tf = tf;
	this.sortOrder = sortOrder;
	this.ref = ref;
	this.l1 = l1;
	this.r1 = r1;
	this.l2 = l2;
	this.r2 = r2;
	this.playlistFilter = playlistFilter;
	this.collapsedHeight = collapsedHeight;
	this.expandedHeight = expandedHeight;
	this.extraRows = extraRows;
	this.showCover = showCover;
	this.autoCollapse = autoCollapse;
	this.collapseGroupsByDefault = collapseGroupsByDefault;
}

function oList(object_name) {
	this.objectName = object_name;
	this.focusedTrackId = plman.GetPlaylistFocusItemIndex(g_active_playlist);
	this.handleList = plman.GetPlaylistItems(g_active_playlist);
	this.count = this.handleList.Count;
	this.groups = [];
	this.items = [];
	this.groupby = [];
	this.totalGroupBy = window.GetProperty("JSPLAYLIST.GROUPBY.TotalGroupBy", 0);
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.ishover = false;
	this.buttonclicked = false;
	this.selAffected = [];
	this.drawRectSel_click = false;
	this.drawRectSel = false;
	this.item_clicked = false;

	this.saveGroupBy = function () {
		var tmp;
		var fin = this.groupby.length;
		for (var j = 0; j < 15; j++) {
			tmp = "";
			for (var i = 0; i < fin; i++) {
				switch (j) {
				case 0:
					tmp = tmp + this.groupby[i].label;
					break;
				case 1:
					tmp = tmp + this.groupby[i].tf;
					break;
				case 2:
					tmp = tmp + this.groupby[i].sortOrder;
					break;
				case 3:
					tmp = tmp + this.groupby[i].ref;
					break;
				case 4:
					tmp = tmp + this.groupby[i].playlistFilter;
					break;
				case 5:
					tmp = tmp + this.groupby[i].extraRows;
					break;
				case 6:
					tmp = tmp + this.groupby[i].collapsedHeight;
					break;
				case 7:
					tmp = tmp + this.groupby[i].expandedHeight;
					break;
				case 8:
					tmp = tmp + this.groupby[i].showCover;
					break;
				case 9:
					tmp = tmp + this.groupby[i].autoCollapse;
					break;
				case 10:
					tmp = tmp + this.groupby[i].l1;
					break;
				case 11:
					tmp = tmp + this.groupby[i].r1;
					break;
				case 12:
					tmp = tmp + this.groupby[i].l2;
					break;
				case 13:
					tmp = tmp + this.groupby[i].r2;
					break;
				case 14:
					tmp = tmp + this.groupby[i].collapseGroupsByDefault;
					break;
				}
				// add separator
				if (i < this.groupby.length - 1) {
					tmp = tmp + "^^";
				}
			}
			switch (j) {
			case 0:
				window.SetProperty("JSPLAYLIST.GROUPBY.label", tmp);
				break;
			case 1:
				window.SetProperty("JSPLAYLIST.GROUPBY.tf", tmp);
				break;
			case 2:
				window.SetProperty("JSPLAYLIST.GROUPBY.sortOrder", tmp);
				break;
			case 3:
				window.SetProperty("JSPLAYLIST.GROUPBY.ref", tmp);
				break;
			case 4:
				window.SetProperty("JSPLAYLIST.GROUPBY.playlistFilter", tmp);
				break;
			case 5:
				window.SetProperty("JSPLAYLIST.GROUPBY.extraRows", tmp);
				break;
			case 6:
				window.SetProperty("JSPLAYLIST.GROUPBY.collapsedHeight", tmp);
				break;
			case 7:
				window.SetProperty("JSPLAYLIST.GROUPBY.expandedHeight", tmp);
				break;
			case 8:
				window.SetProperty("JSPLAYLIST.GROUPBY.showCover", tmp);
				break;
			case 9:
				window.SetProperty("JSPLAYLIST.GROUPBY.autoCollapse", tmp);
				break;
			case 10:
				window.SetProperty("JSPLAYLIST.GROUPBY.l1", tmp);
				break;
			case 11:
				window.SetProperty("JSPLAYLIST.GROUPBY.r1", tmp);
				break;
			case 12:
				window.SetProperty("JSPLAYLIST.GROUPBY.l2", tmp);
				break;
			case 13:
				window.SetProperty("JSPLAYLIST.GROUPBY.r2", tmp);
				break;
			case 14:
				window.SetProperty("JSPLAYLIST.GROUPBY.collapseGroupsByDefault", tmp);
				break;
			}
		}
		this.initGroupBy();
	}

	this.initGroupBy = function () {
		this.groupby.splice(0, this.groupby.length);
		if (this.totalGroupBy == 0) {
			// INITIALIZE GroupBy patterns
			var fields = [],
			tmp,
			fin;

			for (var i = 0; i < 15; i++) {
				switch (i) {
				case 0:
					fields.push(["Album Artist | Album | Disc", "Folder Structure"]);
					break;
				case 1:
					fields.push(["%album artist%%album%%discnumber%", "$replace(%path%,%filename_ext%,)"]);
					break;
				case 2:
					fields.push(["%album artist% | $if(%album%,%date%,9999) | %album% | %discnumber% | %tracknumber% | %title%", "%path%"]);
					break;
				case 3:
					fields.push(["Album", "Custom"]);
					break;
				case 4: // playlist filter
					fields.push(["null", "null"]);
					break;
				case 5: // extra rows
					fields.push(["0", "0"]);
					break;
				case 6: // collapsed height
					fields.push(["2", "2"]);
					break;
				case 7: // expanded height
					fields.push(["3", "3"]);
					break;
				case 8: // show cover
					fields.push(["1", "1"]);
					break;
				case 9: // auto collapse
					fields.push(["0", "0"]);
					break;
				case 10: // l1
					fields.push(["$if(%album%,%album% ['('Disc %discnumber% of %totaldiscs%')'],)", "$directory(%path%,1)"]);
					break;
				case 11: // r1
					fields.push(["[%date%]", "[%date%]"]);
					break;
				case 12: // l2
					fields.push(["$if(%length%,%album artist%,Stream)", "$directory(%path%,2)"]);
					break;
				case 13: // r2
					fields.push(["$if2(%genre%,Other)", "$if2(%genre%,Other)"]);
					break;
				case 14: // collapseGroupsByDefault
					fields.push(["0", "0"]);
					break;
				}
				// convert array to csv string
				tmp = "";
				fin = fields[i].length;
				for (var j = 0; j < fin; j++) {
					tmp = tmp + fields[i][j];
					if (j < fields[i].length - 1) {
						tmp = tmp + "^^";
					}
				}
				// save CSV string into window Properties
				switch (i) {
				case 0:
					window.SetProperty("JSPLAYLIST.GROUPBY.label", tmp);
					break;
				case 1:
					window.SetProperty("JSPLAYLIST.GROUPBY.tf", tmp);
					break;
				case 2:
					window.SetProperty("JSPLAYLIST.GROUPBY.sortOrder", tmp);
					break;
				case 3:
					window.SetProperty("JSPLAYLIST.GROUPBY.ref", tmp);
					break;
				case 4:
					window.SetProperty("JSPLAYLIST.GROUPBY.playlistFilter", tmp);
					break;
				case 5:
					window.SetProperty("JSPLAYLIST.GROUPBY.extraRows", tmp);
					break;
				case 6:
					window.SetProperty("JSPLAYLIST.GROUPBY.collapsedHeight", tmp);
					break;
				case 7:
					window.SetProperty("JSPLAYLIST.GROUPBY.expandedHeight", tmp);
					break;
				case 8:
					window.SetProperty("JSPLAYLIST.GROUPBY.showCover", tmp);
					break;
				case 9:
					window.SetProperty("JSPLAYLIST.GROUPBY.autoCollapse", tmp);
					break;
				case 10:
					window.SetProperty("JSPLAYLIST.GROUPBY.l1", tmp);
					break;
				case 11:
					window.SetProperty("JSPLAYLIST.GROUPBY.r1", tmp);
					break;
				case 12:
					window.SetProperty("JSPLAYLIST.GROUPBY.l2", tmp);
					break;
				case 13:
					window.SetProperty("JSPLAYLIST.GROUPBY.r2", tmp);
					break;
				case 14:
					window.SetProperty("JSPLAYLIST.GROUPBY.collapseGroupsByDefault", tmp);
					break;
				}
			}
			// create GroupBy Objects
			this.totalGroupBy = fields[0].length;
			window.SetProperty("JSPLAYLIST.GROUPBY.TotalGroupBy", this.totalGroupBy);
			for (var k = 0; k < this.totalGroupBy; k++) {
				this.groupby.push(new oGroupBy(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k], fields[7][k], fields[8][k], fields[9][k], fields[10][k], fields[11][k], fields[12][k], fields[13][k], fields[14][k]));
			}

		} else {
			var fields = [];
			var tmp;
			// LOAD GroupBy patterns from Properties
			for (var i = 0; i < 15; i++) {
				switch (i) {
				case 0:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.label", "?;?");
					break;
				case 1:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.tf", "?;?");
					break;
				case 2:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.sortOrder", "?;?");
					break;
				case 3:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.ref", "?;?");
					break;
				case 4:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.playlistFilter", "?;?");
					break;
				case 5:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.extraRows", "?;?");
					break;
				case 6:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.collapsedHeight", "?;?");
					break;
				case 7:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.expandedHeight", "?;?");
					break;
				case 8:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.showCover", "?;?");
					break;
				case 9:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.autoCollapse", "?;?");
					break;
				case 10:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.l1", "?;?");
					break;
				case 11:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.r1", "?;?");
					break;
				case 12:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.l2", "?;?");
					break;
				case 13:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.r2", "?;?");
					break;
				case 14:
					tmp = window.GetProperty("JSPLAYLIST.GROUPBY.collapseGroupsByDefault", "?;?");
					break;
				}
				fields.push(tmp.split("^^"));
			}
			for (var k = 0; k < this.totalGroupBy; k++) {
				this.groupby.push(new oGroupBy(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k], fields[7][k], fields[8][k], fields[9][k], fields[10][k], fields[11][k], fields[12][k], fields[13][k], fields[14][k]));
			}
		}
	}
	this.initGroupBy();

	this.getTotalRows = function () {
		var ct = 0;
		var cv = 0;
		var fin = this.groups.length;
		for (var i = 0; i < fin; i++) {
			this.groups[i].totalPreviousRows += ct;
			this.groups[i].totalPreviousTracks += cv;
			if (this.groups[i].collapsed) {
				ct += cGroup.collapsed_height;
			} else {
				ct += this.groups[i].count + cGroup.expanded_height;
				ct += this.groups[i].rowsToAdd;
			}
			cv += this.groups[i].count;
			cv += this.groups[i].rowsToAdd;
		}
		return ct;
	}

	this.updateGroupsOnCollapse = function (group_id) {
		if (!this.groups[group_id].collapsed) {
			var delta = (this.groups[group_id].count + this.groups[group_id].rowsToAdd) + (cGroup.expanded_height - cGroup.collapsed_height);
			var fin = this.groups.length;
			for (var i = group_id + 1; i < fin; i++) {
				this.groups[i].totalPreviousRows -= delta;
			}
			this.totalRows -= delta;
			if (this.totalRows <= this.totalRowVisible) {
				this.offset = 0;
			} else {
				if (this.totalRows - this.offset < this.totalRowVisible) {
					this.offset = this.totalRows - this.totalRowVisible;
					if (this.offset < 0)
						this.offset = 0;
				}
			}
			this.groups[group_id].collapsed = true;
		}
	}

	this.updateGroupsOnExpand = function (group_id) {
		if (this.groups[group_id].collapsed) {
			var delta = (this.groups[group_id].count + this.groups[group_id].rowsToAdd) + (cGroup.expanded_height - cGroup.collapsed_height);
			var fin = this.groups.length;
			for (var i = group_id + 1; i < fin; i++) {
				this.groups[i].totalPreviousRows += delta;
			}
			this.totalRows += delta;
			if (this.totalRows <= this.totalRowVisible) {
				this.offset = 0;
			} else {
				if (this.totalRows - this.offset < this.totalRowVisible) {
					this.offset = this.totalRows - this.totalRowVisible;
					if (this.offset < 0)
						this.offset = 0;
				}
			}
			this.groups[group_id].collapsed = false;
		}
	}

	this.updateGroupStatus = function (group_id) {
		if (properties.autocollapse) {
			this.updateGroupsOnCollapse(g_group_id_focused);
		}
		this.updateGroupsOnExpand(group_id);
		g_group_id_focused = group_id;
	}

	this.updateGroupByPattern = function (pattern_idx) {
		tf_group_key = get_tfo(this.groupby[pattern_idx].tf);
		cover.show = this.groupby[pattern_idx].showCover == "1";
		properties.autocollapse = this.groupby[pattern_idx].autoCollapse == "1" ;
		cGroup.extra_rows = Math.floor(this.groupby[pattern_idx].extraRows);
		cGroup.default_collapsed_height = Math.floor(this.groupby[pattern_idx].collapsedHeight);
		cGroup.collapsed_height = cGroup.default_collapsed_height;
		cGroup.default_expanded_height = Math.floor(this.groupby[pattern_idx].expandedHeight);
		cGroup.expanded_height = cGroup.default_expanded_height;
		properties.collapseGroupsByDefault = this.groupby[pattern_idx].collapseGroupsByDefault == "1";
	}

	this.init_groups = function (iscollapsed) {
		var previous;
		var count = 0;
		var start = 0;
		var total_time_length = 0;

		if (properties.showgroupheaders) {
			this.updateGroupByPattern(cGroup.pattern_idx);
		} else {
			cGroup.extra_rows = 0;
		}

		this.groups = [];
		for (var i = 0; i < this.count; i++) {
			var handle = this.handleList.GetItem(i);
			var length = Math.max(handle.length, 0);
			var current = properties.showgroupheaders ? tf_group_key.EvalWithMetadb(handle) : handle.Path;

			if (previous != current) {
				if (i > 0) {
					this.groups.push(new oGroup(this.groups.length, start, count, total_time_length, this.focusedTrackId, iscollapsed))
				}
				previous = current;
				start = i;
				count = 1;
				total_time_length = length;
			} else {
				count++;
				total_time_length += length;
			}

			if (i == this.count - 1) {
				this.groups.push(new oGroup(this.groups.length, start, count, total_time_length, this.focusedTrackId, iscollapsed));
			}
		}

		this.totalRows = this.getTotalRows();
		g_total_duration_text = utils.FormatDuration(this.handleList.CalcTotalDuration());
	}

	this.updateHandleList = function (iscollapsed) {
		this.focusedTrackId = plman.GetPlaylistFocusItemIndex(g_active_playlist);
		if (this.handleList)
			this.handleList.Dispose();
		this.handleList = plman.GetPlaylistItems(g_active_playlist);
		this.count = this.handleList.Count;
		this.init_groups(iscollapsed);
		this.getStartOffsetFromFocusId();
	}

	this.setSize = function (x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.totalRowVisible = Math.floor(this.h / cRow.playlist_h);
		this.totalRowToLoad = this.totalRowVisible + 1;
	}

	this.selectAtoB = function (start_id, end_id) {
		var affectedItems = [];

		if (this.SHIFT_start_id == null) {
			this.SHIFT_start_id = start_id;
		}

		plman.ClearPlaylistSelection(g_active_playlist);

		var previous_focus_id = this.focusedTrackId;

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

	this.selectGroupTracks = function (gp_id, state) {
		var affectedItems = [];
		var first_trk = this.groups[gp_id].start;
		var total_trks = this.groups[gp_id].count;
		for (var i = first_trk; i < first_trk + total_trks; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, state);
	}

	this.getStartOffsetFromFocusId = function () {
		this.focusedTrackId = plman.GetPlaylistFocusItemIndex(g_active_playlist);
		if (this.focusedTrackId == -1) {
			this.offset = 0;
		} else {
			this.focusedRowId = this.getRowId(this.focusedTrackId);
			if (this.totalRows > this.totalRowVisible) {
				var mid = Math.floor(this.totalRowToLoad / 2) - 1;
				if (this.focusedRowId <= mid) {
					this.offset = 0;
				} else {
					var d = this.totalRows - (this.focusedRowId + 1);
					if (d >= Math.floor(this.totalRowToLoad / 2)) {
						this.offset = this.focusedRowId - mid;
					} else {
						this.offset = this.totalRows - this.totalRowVisible;
					}
				}
				if (this.offset < 0)
					this.offset = 0;
			} else {
				this.offset = 0;
			}
		}
		return this.offset;
	}

	this.getGroupIdfromTrackId = function (valeur) {
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

	this.getGroupIdFromRowId = function (valeur) {
		var mediane = 0;
		var deb = 0;
		var fin = this.groups.length - 1;
		while (deb <= fin) {
			mediane = Math.floor((fin + deb) / 2);
			grp_height = this.groups[mediane].collapsed ? cGroup.collapsed_height : cGroup.expanded_height;
			grp_size = this.groups[mediane].collapsed ? grp_height : grp_height + this.groups[mediane].count + this.groups[mediane].rowsToAdd;
			if (valeur >= this.groups[mediane].totalPreviousRows && valeur < this.groups[mediane].totalPreviousRows + grp_size) {
				return mediane;
			} else if (valeur < this.groups[mediane].totalPreviousRows) {
				fin = mediane - 1;
			} else {
				deb = mediane + 1;
			}
		}
		return -1;
	}

	this.getRowId = function (trackId) {
		var grp_id = this.getGroupIdfromTrackId(trackId);
		if (this.groups[grp_id].collapsed) {
			var row_index = this.groups[grp_id].totalPreviousRows + 1;
		} else {
			var row_index = this.groups[grp_id].totalPreviousRows + cGroup.expanded_height + (trackId - this.groups[grp_id].start);
		}
		return row_index;
	}

	this.getTrackId = function (rowId) {
		this.s_group_id = this.getGroupIdFromRowId(rowId);
		if (this.s_group_id >= 0) {
			this.s_group_height = this.groups[this.s_group_id].collapsed ? cGroup.collapsed_height : cGroup.expanded_height;
			if (this.groups[this.s_group_id].collapsed) {
				var a = rowId - this.groups[this.s_group_id].totalPreviousRows;
				this.s_groupheader_line_id = a;
				this.s_track_id = this.groups[this.s_group_id].start;
			} else {
				var a = rowId - this.groups[this.s_group_id].totalPreviousRows;
				if (a < this.s_group_height) { // row is in the group header
					this.s_groupheader_line_id = a;
					this.s_track_id = this.groups[this.s_group_id].start;
				} else { // row is a track
					this.s_groupheader_line_id = -1;
					this.s_track_id = (a - this.s_group_height) + this.groups[this.s_group_id].start;
					var track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start;
					if (track_index_in_group >= this.groups[this.s_group_id].count) {
						this.s_delta = (track_index_in_group - this.groups[this.s_group_id].count) + 1;
						this.s_track_id -= this.s_delta;
					} else {
						this.s_delta = 0;
					}
				}
			}
			return this.s_track_id;
		} else {
			return 0;
		}
	}

	this.scrollItems = function (delta, scrollstep) {
		cList.scroll_direction = (delta < 0 ? -1 : 1);
		if (delta > 0) { // scroll up
			this.offset -= scrollstep;
			if (this.offset < 0)
				this.offset = 0;
		} else { // scroll down
			this.offset += scrollstep;
			if (this.offset > this.totalRows - this.totalRowVisible) {
				this.offset = this.totalRows - this.totalRowVisible;
			}
			if (this.offset < 0)
				this.offset = 0;
		}
		this.setItems(false);
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);

		if (!p.list.drawRectSel)
			full_repaint();
	}

	this.setItems = function (forceFocus) {
		var track_index_in_group = 0;
		var row_index = 0;
		if (forceFocus) { // from focus item centered in panel
			if (this.totalRows > this.totalRowVisible) {
				var i = this.getStartOffsetFromFocusId();
				if (this.totalRows - this.offset <= this.totalRowVisible) {
					var total_rows_to_draw = this.totalRows < this.totalRowVisible ? this.totalRows : this.totalRowVisible;
				} else {
					var total_rows_to_draw = this.totalRows < this.totalRowToLoad ? this.totalRows : this.totalRowToLoad;
				}

				this.items.splice(0, this.items.length);
				while (i < this.offset + total_rows_to_draw) {
					this.getTrackId(i);
					if (this.s_groupheader_line_id >= 0) { // group header
						this.items.push(new oItem(row_index, 1, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
						i += this.s_group_height - this.s_groupheader_line_id;
						row_index += this.s_group_height - this.s_groupheader_line_id;
					} else { // track row
						track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
						this.items.push(new oItem(row_index, 0, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
						i++;
						row_index++;
					}
				}
			} else {
				this.offset = 0;
				var i = 0; // offset = 0

				this.items.splice(0, this.items.length);
				while (i < this.totalRows) {
					this.getTrackId(i);
					if (this.s_groupheader_line_id >= 0) { // group header
						this.items.push(new oItem(row_index, 1, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
						i += this.s_group_height - this.s_groupheader_line_id;
						row_index += this.s_group_height - this.s_groupheader_line_id;
					} else { // track row
						track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
						this.items.push(new oItem(row_index, 0, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
						i++;
						row_index++;
					}
				}
			}
		} else { // fill items from current offset
			if (this.totalRows > this.totalRowVisible) {
				if (typeof this.offset == "undefined") {
					this.getStartOffsetFromFocusId();
				}

				var i = this.offset;
				if (this.totalRows - this.offset <= this.totalRowVisible) {
					var total_rows_to_draw = this.totalRows < this.totalRowVisible ? this.totalRows : this.totalRowVisible;
				} else {
					var total_rows_to_draw = this.totalRows < this.totalRowToLoad ? this.totalRows : this.totalRowToLoad;
				}

				this.items.splice(0, this.items.length);
				while (i < this.offset + total_rows_to_draw) {
					this.getTrackId(i);
					if (this.s_groupheader_line_id >= 0) { // group header
						this.items.push(new oItem(row_index, 1, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
						i += this.s_group_height - this.s_groupheader_line_id;
						row_index += this.s_group_height - this.s_groupheader_line_id;
					} else { // track row
						track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
						this.items.push(new oItem(row_index, 0, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
						i++;
						row_index++;
					}
				}
			} else {
				var i = 0; // offset = 0
				this.items.splice(0, this.items.length);
				while (i < this.totalRows) {
					this.getTrackId(i);
					if (this.s_groupheader_line_id >= 0) { // group header
						this.items.push(new oItem(row_index, 1, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
						i += this.s_group_height - this.s_groupheader_line_id;
						row_index += this.s_group_height - this.s_groupheader_line_id;
					} else { // track row
						track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
						this.items.push(new oItem(row_index, 0, this.handleList.GetItem(this.s_track_id), this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
						i++;
						row_index++;
					}
				}
			}
		}
	}

	this.getOffsetFromCursorPos = function () {
		var r = (this.cursorPos / this.h);
		this.offset = Math.round(r * this.totalRows);
		if (this.offset < 0)
			this.offset = 0;
	}

	this.isFocusedItemVisible = function () {
		if (this.totalRows <= this.totalRowVisible) {
			return true;
		} else {
			var fin = this.items.length;
			for (var i = 0; i < fin; i++) {
				if (this.items[i].group_index >= 0) {
					if ((this.items[i].type == 0 && this.items[i].empty_row_index == 0) || this.groups[this.items[i].group_index].collapsed) {
						if (this.groups[this.items[i].group_index].collapsed) {
							if (this.focusedTrackId >= this.groups[this.items[i].group_index].start && this.focusedTrackId < this.groups[this.items[i].group_index].start + this.groups[this.items[i].group_index].count) {
								return true;
							}
						} else if (this.focusedTrackId == this.items[i].track_index && this.items[i].row_index < this.totalRowVisible) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	this.draw = function (gr) {
		var item_h = 0;

		if (cList.scroll_timer) {
			var row_top_y = this.y - (cList.scroll_delta * cList.scroll_direction);
		} else {
			var row_top_y = this.y;
		}
		var width = 0;

		if (fb.IsPlaying && plman.PlayingPlaylist == g_active_playlist) {
			this.nowplaying = plman.GetPlayingItemLocation();
		}

		var fin = this.items.length;
		for (var i = 0; i < fin; i++) {
			item_h = this.items[i].heightInRow * cRow.playlist_h;
			// test if scrollbar displayed or not for the items width to draw
			if (this.totalRows <= this.totalRowVisible || !properties.showscrollbar) {
				width = this.w;
			} else {
				width = this.w - cScrollBar.width;
			}
			this.items[i].draw(gr, this.x, row_top_y, width, item_h);
			row_top_y += item_h - (this.items[i].groupRowDelta * cRow.playlist_h);
		}

		if (g_drag_drop_status && g_drag_drop_bottom) {
			var rowId = fin - 1;
			var item_height_row = (this.items[rowId].type == 0 ? 1 : this.items[rowId].heightInRow);
			var item_height = item_height_row * cRow.playlist_h;
			var limit = this.items[rowId].y + item_height;
			var rx = this.items[rowId].x;
			var ry = this.items[rowId].y;
			var rw = this.items[rowId].w;

			gr.FillRectangle(rx + cover.w, ry + item_height - Math.floor(cList.borderWidth / 2), rw - cover.w, cList.borderWidth, g_color_selected_bg);
			gr.FillRectangle(rx + cover.w, ry + item_height - Math.floor(cList.borderWidth / 2) - 4 * cList.borderWidth, cList.borderWidth, 9 * cList.borderWidth, g_color_selected_bg);
			gr.FillRectangle(rx + rw - cList.borderWidth, ry + item_height - Math.floor(cList.borderWidth / 2) - 4 * cList.borderWidth, cList.borderWidth, 9 * cList.borderWidth, g_color_selected_bg);
		}

		// Draw rect selection
		if (this.drawRectSel) {
			this.selDeltaRows = this.selEndOffset - this.selStartOffset;
			if (this.selX <= mouse_x) {
				if (this.selY - this.selDeltaRows * cRow.playlist_h <= mouse_y) {
					gr.FillRectangle(this.selX, (this.selY - this.selDeltaRows * cRow.playlist_h), mouse_x - this.selX, mouse_y - (this.selY - this.selDeltaRows * cRow.playlist_h), g_color_selected_bg & 0x33ffffff);
					gr.DrawRectangle(this.selX, (this.selY - this.selDeltaRows * cRow.playlist_h), mouse_x - this.selX - 1, mouse_y - (this.selY - this.selDeltaRows * cRow.playlist_h) - 1, 1, g_color_selected_bg & 0x66ffffff);
				} else {
					gr.FillRectangle(this.selX, mouse_y, mouse_x - this.selX, this.selY - mouse_y - this.selDeltaRows * cRow.playlist_h, g_color_selected_bg & 0x33ffffff);
					gr.DrawRectangle(this.selX, mouse_y, mouse_x - this.selX - 1, this.selY - mouse_y - this.selDeltaRows * cRow.playlist_h - 1, 1, g_color_selected_bg & 0x66ffffff);
				}
			} else {
				if (this.selY - this.selDeltaRows * cRow.playlist_h <= mouse_y) {
					gr.FillRectangle(mouse_x, (this.selY - this.selDeltaRows * cRow.playlist_h), this.selX - mouse_x, mouse_y - (this.selY - this.selDeltaRows * cRow.playlist_h), g_color_selected_bg & 0x33ffffff);
					gr.DrawRectangle(mouse_x, (this.selY - this.selDeltaRows * cRow.playlist_h), this.selX - mouse_x - 1, mouse_y - (this.selY - this.selDeltaRows * cRow.playlist_h) - 1, 1, g_color_selected_bg & 0x66ffffff);
				} else {
					gr.FillRectangle(mouse_x, mouse_y, this.selX - mouse_x, this.selY - mouse_y - this.selDeltaRows * cRow.playlist_h, g_color_selected_bg & 0x33ffffff);
					gr.DrawRectangle(mouse_x, mouse_y, this.selX - mouse_x - 1, this.selY - mouse_y - this.selDeltaRows * cRow.playlist_h - 1, 1, g_color_selected_bg & 0x66ffffff);
				}
			}
		}
	}

	this.isHoverObject = function (x, y) {
		return (x > this.x && x < this.x + this.w - p.playlistManager.woffset && y > this.y && y < this.y + this.h);
	}

	this.check = function (event, x, y, delta) {
		this.ishover = this.isHoverObject(x, y);
		switch (event) {
		case "lbtn_down":
			this.mclicked = this.ishover;
			if (this.ishover) {
				this.item_clicked = false;
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].check(event, x, y);
				}
				if (!p.scrollbar.isHoverObject(x, y) && x < p.scrollbar.x) {
					if (this.items.length > 0 && !this.item_clicked) {
						this.selX = x;
						this.selY = y;
						this.drawRectSel_click = true;
						this.selStartId = this.items[this.items.length - 1].track_index;
						this.selStartOffset = p.list.offset;
						this.selEndOffset = p.list.offset;
						this.selDeltaRows = 0;
						this.selAffected.splice(0, this.selAffected.length);
						if (!utils.IsKeyPressed(VK_CONTROL)) {
							plman.ClearPlaylistSelection(g_active_playlist);
						}
						this.SHIFT_start_id = null;
						full_repaint();
					}
				}
			}
			break;
		case "lbtn_up":
			if (this.ishover) {
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].check(event, x, y);
				}
			}

			p.list.drawRectSel_click = false;
			p.list.drawRectSel = false;
			if (cList.interval) {
				window.ClearInterval(cList.interval);
				cList.interval = false;
			}
			if (cPlaylistManager.vscroll_interval) {
				window.ClearInterval(cPlaylistManager.vscroll_interval);
				cPlaylistManager.vscroll_interval = false;
			}
			if (cPlaylistManager.vscroll_timeout) {
				window.ClearTimeout(cPlaylistManager.vscroll_timeout);
				cPlaylistManager.vscroll_timeout = false;
			}
			if (this.mclicked) {
				window.SetCursor(IDC_ARROW);
				this.mclicked = false;
			}
			break;
		case "drag_over":
			g_drag_drop_bottom = false;
			if (this.count > 0) {
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].drag_drop_check(x, y, i);
				}
				if (p.playlistManager.woffset == 0 || (cPlaylistManager.visible && x < p.playlistManager.x - p.playlistManager.woffset)) {
					var rowId = this.items.length - 1;
					var item_height_row = (this.items[rowId].type == 0 ? 1 : this.items[rowId].heightInRow);
					var limit = this.items[rowId].y + item_height_row * cRow.playlist_h;
					if (y > limit) {
						g_drag_drop_bottom = true;
						g_drag_drop_track_id = this.items[rowId].track_index;
						g_drag_drop_row_id = p.list.getTrackId(rowId);
					}
				}
			} else {
				g_drag_drop_bottom = true;
				g_drag_drop_track_id = 0;
				g_drag_drop_row_id = 0;
			}
			break;
		case "move":
			for (var i = 0; i < this.items.length; i++) {
				this.items[i].check(event, x, y);
			}
			if (!this.drawRectSel) {
				this.drawRectSel = this.drawRectSel_click;
			}
			break;
		case "lbtn_dblclk":
			if (this.ishover) {
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].check(event, x, y);
				}
			}
			break;
		case "rbtn_up":
			if (this.ishover) {
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].check(event, x, y);
				}
				if (this.items.length) {
					var rowId = this.items.length - 1;
					var item_height_row = (this.items[rowId].type == 0 ? 1 : this.items[rowId].heightInRow);
					var limit = this.items[rowId].y + item_height_row * cRow.playlist_h;
					if (y > limit) {
						plman.ClearPlaylistSelection(g_active_playlist);
					}
				}
				p.list.contextMenu(x, y);
			}
			break;
		}
	}

	this.contextMenu = function (x, y, id, row_id) {
		var _menu = window.CreatePopupMenu();
		var _colours = window.CreatePopupMenu();
		var _context = fb.CreateContextMenuManager();
		var can_remove_flag = playlist_can_remove_items(g_active_playlist) ? MF_STRING : MF_GRAYED;
		var can_paste_flag = playlist_can_add_items(g_active_playlist) && fb.CheckClipboardContents() ? MF_STRING : MF_GRAYED;

		_menu.AppendMenuItem(MF_STRING, 1, "Panel Settings...");

		var colour_flag = properties.enableCustomColours ? MF_STRING : MF_GRAYED;
		_colours.AppendMenuItem(MF_STRING, 2, "Enable");
		_colours.CheckMenuItem(2, properties.enableCustomColours);
		_colours.AppendMenuSeparator();
		_colours.AppendMenuItem(colour_flag, 3, "Text");
		_colours.AppendMenuItem(colour_flag, 4, "Background");
		_colours.AppendMenuItem(colour_flag, 5, "Selected background");
		_colours.AppendTo(_menu, MF_STRING, "Custom colours");

		var items = plman.GetPlaylistSelectedItems(g_active_playlist);
		if (items.Count > 0) {
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(can_remove_flag, 10, "Crop");
			_menu.AppendMenuItem(can_remove_flag, 11, "Remove");
			_menu.AppendMenuItem(MF_STRING, 12, "Invert selection");
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(can_remove_flag, 13, "Cut");
			_menu.AppendMenuItem(MF_STRING, 14, "Copy");
			_menu.AppendMenuItem(can_paste_flag , 15, "Paste");
			_menu.AppendMenuSeparator();
			_context.InitContextPlaylist();
			_context.BuildMenu(_menu, 1000);
		} else {
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(can_paste_flag, 14, "Paste");
		}

		var idx = _menu.TrackPopupMenu(x, y);
		switch (idx) {
		case 0:
			break;
		case 1:
			for (var i = 0; i < p.settings.pages.length; i++) {
				p.settings.pages[i].reSet();
			}
			p.settings.currentPageId = 0;
			cSettings.visible = true;
			full_repaint();
			break;
		case 2:
			properties.enableCustomColours = !properties.enableCustomColours;
			window.SetProperty("JSPLAYLIST.Enable Custom Colours", properties.enableCustomColours);
			on_colours_changed();
			break;
		case 3:
			g_color_normal_txt = utils.ColourPicker(g_color_normal_txt);
			window.SetProperty("JSPLAYLIST.COLOUR TEXT NORMAL", g_color_normal_txt);
			on_colours_changed();
			break;
		case 4:
			g_color_normal_bg = utils.ColourPicker(g_color_normal_bg);
			window.SetProperty("JSPLAYLIST.COLOUR BACKGROUND NORMAL", g_color_normal_bg);
			on_colours_changed();
			break;
		case 5:
			g_color_selected_bg = utils.ColourPicker(g_color_selected_bg);
			window.SetProperty("JSPLAYLIST.COLOUR BACKGROUND SELECTED", g_color_selected_bg);
			on_colours_changed();
			break;
		case 10:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist, true);
			break;
		case 11:
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case 12:
			plman.InvertSelection(g_active_playlist);
			break;
		case 13:
			items.CopyToClipboard();
			plman.UndoBackup(g_active_playlist);
			plman.RemovePlaylistSelection(g_active_playlist);
			break;
		case 14:
			items.CopyToClipboard();
			break;
		case 15:
			var count = plman.GetPlaylistItemCount(g_active_playlist);
			var base = plman.GetPlaylistFocusItemIndex(g_active_playlist);
			if (base < count) {
				base = base + 1;
			} else {
				base = count;
			}
			plman.UndoBackup(g_active_playlist);
			plman.InsertPlaylistItems(g_active_playlist, base, fb.GetClipboardContents());
			break;
		default:
			_context.ExecuteByID(idx - 1000);
			break;
		}
		items.Dispose();
		_colours.Dispose();
		_context.Dispose();
		_menu.Dispose();
		return true;
	}
}
