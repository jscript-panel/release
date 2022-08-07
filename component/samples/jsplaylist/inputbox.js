var cInputbox = {
	cursor_interval: false,
	cursor_state: true,
	clipboard: null
};

function oInputbox(w, h, default_text, empty_text, func, id, font_size) {
	this.id = id;
	this.w = w;
	this.h = h;
	this.textcolor = RGB(0, 0, 0);
	this.backcolor = RGB(240, 240, 240);
	this.bordercolor = RGB(180, 180, 180);
	this.backselectioncolor = RGBA(150, 150, 150, 200);
	this.default_text = default_text;
	this.text = default_text;
	this.text_selected = "";
	this.empty_text = empty_text;
	this.stext = "";
	this.prev_text = "";
	this.func = func;
	this.launch_timeout = false;
	this.autovalidation = false;
	this.edit = false;
	this.select = false;
	this.hover = false;
	this.Cpos = 0;
	this.Cx = 0;
	this.offset = 0;
	this.right_margin = 2;
	this.drag = false;

	if (cInputbox.cursor_interval) {
		window.ClearInterval(cInputbox.cursor_interval);
		cInputbox.cursor_interval = false;
	}
	this.ibeam_set = false;

	this.draw = function (gr, x, y) {
		this.x = x;
		this.y = y;
		// draw bg
		if (this.bordercolor) {
			gr.DrawRectangle(x - 2, y, (this.w + 4) - 1, this.h - 1, 1, this.bordercolor);
		}
		gr.FillRectangle(x - 1, y + 1, (this.w + 2), this.h - 2, this.backcolor);

		// adjust offset to always see the cursor
		if (!this.drag && !this.select) {
			this.Cx = this.text.substr(this.offset, this.Cpos - this.offset).calc_width(g_font_12);
			while (this.Cx >= this.w - this.right_margin) {
				this.offset++;
				this.Cx = this.text.substr(this.offset, this.Cpos - this.offset).calc_width(g_font_12);
			}
		}
		// draw selection
		if (this.SelBegin != this.SelEnd) {
			this.select = true;
			this.CalcText();
			if (this.SelBegin < this.SelEnd) {
				if (this.SelBegin < this.offset) {
					var px1 = this.x;
				} else {
					var px1 = this.x + this.GetCx(this.SelBegin);
				}
				var px1 = this.GetCx(this.SelBegin);
				var px2 = this.GetCx(this.SelEnd);
				this.text_selected = this.text.substring(this.SelBegin, this.SelEnd);
			} else {
				if (this.SelEnd < this.offset) {
					var px1 = this.x;
				} else {
					var px1 = this.x - this.GetCx(this.SelBegin);
				}
				var px2 = this.GetCx(this.SelBegin);
				var px1 = this.GetCx(this.SelEnd);
				this.text_selected = this.text.substring(this.SelEnd, this.SelBegin);
			}
			if ((this.x + px1 + (px2 - px1)) > this.x + this.w) {
				gr.FillRectangle(this.x + px1, this.y + 2, this.w - px1, this.h - 4, this.backselectioncolor & 0xaaffffff);
			} else {
				gr.FillRectangle(this.x + px1, this.y + 2, px2 - px1, this.h - 4, this.backselectioncolor & 0xaaffffff);
			}
		} else {
			this.select = false;
			this.text_selected = "";
		}

		// draw text
		if (this.text.length > 0) {
			gr.WriteText(this.text.substr(this.offset), g_font_12, this.edit ? this.textcolor : blendColours(this.textcolor, this.backcolor, 0.5), this.x, this.y, this.w, this.h, 0, 2, this.edit ? 0 : 1);
		} else {
			gr.WriteText(this.empty_text, g_font_12, blendColours(this.textcolor, this.backcolor, 0.5), this.x, this.y, this.w, this.h, 0, 2, this.edit ? 0 : 1);
		}
		// draw cursor
		if (this.edit && !this.select)
			this.drawcursor(gr);
	}

	this.drawcursor = function (gr) {
		if (cInputbox.cursor_state) {
			if (this.Cpos >= this.offset) {
				this.Cx = this.GetCx(this.Cpos);
				var x1 = this.x + this.Cx;
				var x2 = x1;
				var y1 = this.y + 2;
				var y2 = this.y + this.h - 3;
				var lt = 1;
				gr.DrawLine(x1, y1, x2, y2, lt, this.textcolor);
			}
		}
	}

	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.CalcText = function () {
		this.TWidth = this.text.substr(this.offset).calc_width(g_font_12);
	}

	this.GetCx = function (pos) {
		if (pos >= this.offset) {
			return this.text.substr(this.offset, pos - this.offset).calc_width(g_font_12);
		}
		return 0;
	}

	this.GetCPos = function (x) {
		var tx = x - this.x;
		var pos = 0;
		for (var i = this.offset; i < this.text.length; i++) {
			pos += this.text.substr(i, 1).calc_width(g_font_12);
			if (pos >= tx + 3) {
				break;
			}
		}
		return i;
	}

	this.on_focus = function (is_focused) {
		if (!is_focused && this.edit) {
			if (this.text.length == 0) {
				this.text = this.default_text;
				eval(this.func);
			} else {
				this.default_text = this.text;
				eval(this.func);
			}
			this.edit = false;
			if (cInputbox.cursor_interval) {
				window.ClearInterval(cInputbox.cursor_interval);
				cInputbox.cursor_interval = false;
				cInputbox.cursor_state = true;
			}
			this.repaint();
		} else if (is_focused) {
			if (!cInputbox.cursor_interval) {
				this.resetCursorTimer();
			}
		}
	}

	this.resetCursorTimer = function () {
		if (cInputbox.cursor_interval) {
			window.ClearInterval(cInputbox.cursor_interval);
			cInputbox.cursor_interval = false;
			cInputbox.cursor_state = true;
		}
		cInputbox.cursor_interval = window.SetInterval((function () {
			cInputbox.cursor_state = !cInputbox.cursor_state;
			this.repaint();
		}).bind(this), 500);
	}

	this.check = function (callback, x, y, delta) {
		this.hover = x >= this.x - 2 && x <= this.x + this.w + 1 && y > this.y && y < this.y + this.h;
		switch (callback) {
		case "lbtn_down":
			this.on_focus(this.hover);
			if (this.hover) {
				this.dblclk = false;
				this.drag = true;
				this.edit = true;
				this.Cpos = this.GetCPos(x);
				this.anchor = this.Cpos;
				this.SelBegin = this.Cpos;
				this.SelEnd = this.Cpos;
				if (!cInputbox.cursor_interval) {
					this.resetCursorTimer();
				}
			} else {
				this.edit = false;
				this.select = false;
				this.SelBegin = 0;
				this.SelEnd = 0;
				this.text_selected = "";
			}
			this.repaint();
			break;
		case "lbtn_up":
			if (!this.dblclk && this.drag) {
				this.SelEnd = this.GetCPos(x);
				if (this.select) {
					if (this.SelBegin > this.SelEnd) {
						this.sBeginSel = this.SelBegin;
						this.SelBegin = this.SelEnd;
						this.SelEnd = this.sBeginSel;
					}
				}
			} else {
				this.dblclk = false;
			}
			this.drag = false;
			break;
		case "lbtn_dblclk":
			if (this.hover) {
				this.dblclk = true;
				this.SelBegin = 0;
				this.SelEnd = this.text.length;
				this.text_selected = this.text;
				this.select = true;
				this.repaint();
			}
			break;
		case "move":
			if (this.drag) {
				this.CalcText();
				var tmp = this.GetCPos(x);
				var tmp_x = this.GetCx(tmp);
				if (tmp < this.SelBegin) {
					if (tmp < this.SelEnd) {
						if (tmp_x < this.x) {
							if (this.offset > 0) {
								this.offset--;
								this.repaint();
							}
						}
					} else if (tmp > this.SelEnd) {
						if (tmp_x + this.x > this.x + this.w) {
							var len = (this.TWidth > this.w) ? this.TWidth - this.w : 0;
							if (len > 0) {
								this.offset++;
								this.repaint();
							}
						}
					}
					this.SelEnd = tmp;
				} else if (tmp > this.SelBegin) {
					if (tmp_x + this.x > this.x + this.w) {
						var len = (this.TWidth > this.w) ? this.TWidth - this.w : 0;
						if (len > 0) {
							this.offset++;
							this.repaint();
						}
					}
					this.SelEnd = tmp;
				}
				this.Cpos = tmp;
				this.repaint();
			}
			if (this.hover || this.drag) {
				window.SetCursor(IDC_IBEAM);
			} else if (this.ibeam_set) {
				window.SetCursor(IDC_ARROW);
			}
			this.ibeam_set = (this.hover || this.drag);
			break;
		case "rbtn_up":
			if (this.hover) {
				this.edit = true;
				if (!cInputbox.cursor_interval) {
					this.resetCursorTimer();
				}
				this.repaint();
				this.show_context_menu(x, y);
			} else {
				this.edit = false;
				this.select = false;
				this.SelBegin = 0;
				this.SelEnd = 0;
				this.text_selected = "";
				if (cInputbox.cursor_interval) {
					window.ClearInterval(cInputbox.cursor_interval);
					cInputbox.cursor_interval = false;
					cInputbox.cursor_state = true;
				}
				this.repaint();
			}
			break;
		case "wheel":
			break;
		}
	}

	this.show_context_menu = function (x, y) {
		var _menu = window.CreatePopupMenu();
		cInputbox.clipboard = utils.GetClipboardText();
		_menu.AppendMenuItem(EnableMenuIf(this.select), 1, "Cut");
		_menu.AppendMenuItem(EnableMenuIf(this.select), 2, "Copy");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(EnableMenuIf(cInputbox.clipboard), 3, "Paste");
		var idx = _menu.TrackPopupMenu(x, y);
		switch (idx) {
		case 1:
			if (this.edit && this.select) {
				utils.SetClipboardText(this.text_selected);
				var p1 = this.SelBegin;
				var p2 = this.SelEnd;
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.select = false;
				this.text_selected = "";
				this.Cpos = this.SelBegin;
				this.SelEnd = this.SelBegin;
				this.text = this.text.slice(0, p1) + this.text.slice(p2);
				this.CalcText();

				this.repaint();
			}
			break;
		case 2:
			if (this.edit && this.select) {
				utils.SetClipboardText(this.text_selected);
			}
			break;
		case 3:
			if (this.edit && cInputbox.clipboard) {
				if (this.select) {
					var p1 = this.SelBegin;
					var p2 = this.SelEnd;
					this.select = false;
					this.text_selected = "";
					this.Cpos = this.SelBegin;
					this.SelEnd = this.SelBegin;

					if (this.Cpos < this.text.length) {
						this.text = this.text.slice(0, p1) + cInputbox.clipboard + this.text.slice(p2);
					} else {
						this.text = this.text + cInputbox.clipboard;
					}
					this.Cpos += cInputbox.clipboard.length;
					this.CalcText();
					this.repaint();
				} else {
					if (this.Cpos > 0) { // cursor pos > 0
						this.text = this.text.substring(0, this.Cpos) + cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
					} else {
						this.text = cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
					}
					this.Cpos += cInputbox.clipboard.length;
					this.CalcText();
					this.repaint();
				}
			}
			break;
		}
		_menu.Dispose();
	}

	this.on_key_down = function (vkey) {
		if (!cInputbox.cursor_interval) {
			this.resetCursorTimer();
		}

		var mask = GetKeyboardMask();
		if (mask == KMask.none) {
			switch (vkey) {
			case VK_SHIFT:
				break;
			case VK_BACK:
				//save text before update
				this.stext = this.text;
				if (this.edit) {
					if (this.select) {
						if (this.text_selected.length == this.text.length) {
							this.text = "";
							this.Cpos = 0;
						} else {
							if (this.SelBegin > 0) {
								this.text = this.text.substring(0, this.SelBegin) + this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							} else {
								this.text = this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							}
						}
					} else {
						if (this.Cpos > 0) {
							this.text = this.text.substr(0, this.Cpos - 1) + this.text.substr(this.Cpos, this.text.length - this.Cpos);
							if (this.offset > 0) {
								this.offset--;
							}
							this.Cpos--;
							this.repaint();
						}
					}
				}
				this.CalcText();
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.text_selected = "";
				this.SelBegin = this.Cpos;
				this.SelEnd = this.SelBegin;
				this.select = false;
				this.repaint();
				break;
			case VK_DELETE:
				//save text before update
				this.stext = this.text;
				if (this.edit) {
					if (this.select) {
						if (this.text_selected.length == this.text.length) {
							this.text = "";
							this.Cpos = 0;
						} else {
							if (this.SelBegin > 0) {
								this.text = this.text.substring(0, this.SelBegin) + this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							} else {
								this.text = this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							}
						}
					} else {
						if (this.Cpos < this.text.length) {
							this.text = this.text.substr(0, this.Cpos) + this.text.substr(this.Cpos + 1, this.text.length - this.Cpos - 1);
							this.repaint();
						}
					}
				}
				this.CalcText();
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.text_selected = "";
				this.SelBegin = this.Cpos;
				this.SelEnd = this.SelBegin;
				this.select = false;
				this.repaint();
				break;
			case VK_TAB:
			case VK_RETURN:
				if (this.edit && this.text.length >= 0) {
					eval(this.func);
				}
				break;
			case VK_ESCAPE:
				if (this.edit) {
					this.edit = false;
					this.text_selected = "";
					this.text = this.default_text; // restore the inputbox initial value on ESC
					this.select = false;
					this.repaint();
				}
				break;
			case VK_END:
				if (this.edit) {
					this.Cpos = this.text.length;
					this.SelBegin = 0;
					this.SelEnd = 0;
					this.select = false;
					this.repaint();
				}
				break;
			case VK_HOME:
				if (this.edit) {
					this.Cpos = 0;
					this.SelBegin = 0;
					this.SelEnd = 0;
					this.select = false;
					this.offset = 0;
					this.repaint();
				}
				break;
			case VK_LEFT:
				if (this.edit) {
					if (this.offset > 0) {
						if (this.Cpos <= this.offset) {
							this.offset--;
							this.Cpos--;
						} else {
							this.Cpos--;
						}
					} else {
						if (this.Cpos > 0)
							this.Cpos--;
					}
					this.SelBegin = this.Cpos;
					this.SelEnd = this.Cpos;
					this.select = false;
					this.repaint();
				}
				break;
			case VK_RIGHT:
				if (this.edit) {
					if (this.Cpos < this.text.length)
						this.Cpos++;
					this.SelBegin = this.Cpos;
					this.SelEnd = this.Cpos;
					this.select = false;
					this.repaint();
				}
				break;
			}
			if (this.edit)
				this.repaint();
		} else {
			switch (mask) {
			case KMask.shift:
				if (vkey == VK_HOME) { // SHIFT + HOME
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							this.select = true;
							if (this.Cpos > 0) {
								this.SelEnd = this.Cpos;
								this.SelBegin = 0;
								this.select = true;
								this.Cpos = 0;
							}
						} else {
							if (this.Cpos > 0) {
								if (this.anchor < this.Cpos) {
									this.SelBegin = 0;
									this.SelEnd = this.anchor;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin = 0;
								}
								this.Cpos = 0;
							}
						}
						if (this.offset > 0) {
							this.offset = 0;
						}
						this.repaint();
					}
				}
				if (vkey == VK_END) { // SHIFT + END
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							if (this.Cpos < this.text.length) {
								this.SelBegin = this.Cpos;
								this.SelEnd = this.text.length;
								this.Cpos = this.text.length;
								this.select = true;
							}
						} else {
							if (this.Cpos < this.text.length) {
								if (this.anchor < this.Cpos) {
									this.SelEnd = this.text.length;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin = this.anchor;
									this.SelEnd = this.text.length;
								}
								this.Cpos = this.text.length;
							}
						}

						this.Cx = this.text.substr(this.offset, this.Cpos - this.offset).calc_width(g_font_12);
						while (this.Cx >= this.w - this.right_margin) {
							this.offset++;
							this.Cx = this.text.substr(this.offset, this.Cpos - this.offset).calc_width(g_font_12);
						}

						this.repaint();
					}
				}
				if (vkey == VK_LEFT) { // SHIFT + KEY LEFT
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							this.select = true;
							if (this.Cpos > 0) {
								this.SelEnd = this.Cpos;
								this.SelBegin = this.Cpos - 1;
								this.select = true;
								this.Cpos--;
							}
						} else {
							if (this.Cpos > 0) {
								if (this.anchor < this.Cpos) {
									this.SelEnd--;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin--;
								}
								this.Cpos--;
							}
						}
						if (this.offset > 0) {
							var tmp = this.Cpos;
							var tmp_x = this.GetCx(tmp);
							if (tmp < this.offset) {
								this.offset--;
							}
						}
						this.repaint();
					}
				}
				if (vkey == VK_RIGHT) { // SHIFT + KEY RIGHT
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							if (this.Cpos < this.text.length) {
								this.SelBegin = this.Cpos;
								this.Cpos++;
								this.SelEnd = this.Cpos;
								this.select = true;
							}
						} else {
							if (this.Cpos < this.text.length) {
								if (this.anchor < this.Cpos) {
									this.SelEnd++;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin++;
								}
								this.Cpos++;
							}
						}

						// handle scroll text on cursor selection
						var tmp_x = this.GetCx(this.Cpos);
						if (tmp_x > (this.w - this.right_margin)) {
							this.offset++;
						}
						this.repaint();
					}
				}
				break;
			case KMask.ctrl:
				if (vkey == 65) { // CTRL+A
					if (this.edit && this.text.length > 0) {
						this.SelBegin = 0;
						this.SelEnd = this.text.length;
						this.text_selected = this.text;
						this.select = true;
						this.repaint();
					}
				}
				if (vkey == 67) { // CTRL+C
					if (this.edit && this.select) {
						utils.SetClipboardText(this.text_selected);
					}
				}
				if (vkey == 88) { // CTRL+X
					if (this.edit && this.select) {
						//save text avant MAJ
						this.stext = this.text;
						//
						utils.SetClipboardText(this.text_selected);
						var p1 = this.SelBegin;
						var p2 = this.SelEnd;
						this.select = false;
						this.text_selected = "";
						this.Cpos = this.SelBegin;
						this.SelEnd = this.SelBegin;
						this.text = this.text.slice(0, p1) + this.text.slice(p2);
						this.CalcText();
						this.repaint();
					}
				}
				if (vkey == 90) { // CTRL+Z (annulation saisie)
					if (this.edit) {
						this.text = this.stext;
						this.repaint();
					}
				}
				if (vkey == 86) { // CTRL+V
					cInputbox.clipboard = utils.GetClipboardText();
					if (this.edit && cInputbox.clipboard) {
						this.stext = this.text;
						if (this.select) {
							var p1 = this.SelBegin;
							var p2 = this.SelEnd;
							this.select = false;
							this.text_selected = "";
							this.Cpos = this.SelBegin;
							this.SelEnd = this.SelBegin;
							if (this.Cpos < this.text.length) {
								this.text = this.text.slice(0, p1) + cInputbox.clipboard + this.text.slice(p2);
							} else {
								this.text = this.text + cInputbox.clipboard;
							}
							this.Cpos += cInputbox.clipboard.length;
							this.CalcText();
							this.repaint();
						} else {
							if (this.Cpos > 0) { // cursor pos > 0
								this.text = this.text.substring(0, this.Cpos) + cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
							} else {
								this.text = cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
							}
							this.Cpos += cInputbox.clipboard.length;
							this.CalcText();
							this.repaint();
						}
					}
				}
				break;
			}
		}

		// autosearch: has text changed after on_key or on_char ?
		if (this.autovalidation) {
			if (this.text != this.prev_text) {
				// launch timer to process the search
				if (this.launch_timeout) window.ClearTimeout(this.launch_timeout);
				this.launch_timeout = window.SetTimeout(function () {
					this.launch_timeout = false;
					eval(this.func);
				}, 500);
				this.prev_text = this.text;
			}
		}
	}

	this.on_char = function (code, mask) {
		if (code == 1 && this.edit && mask == KMask.ctrl) {
			this.Spos = 0;
			this.Cpos = this.text.length;
			this.select = true;
			this.repaint();
		}
		if (code > 31 && this.edit) {
			//save text before update
			this.stext = this.text;
			if (this.select) {
				var p1 = this.SelBegin;
				var p2 = this.SelEnd;
				this.text_selected = "";
				this.Cpos = this.SelBegin;
				this.SelEnd = this.SelBegin;
			} else {
				var p1 = this.Cpos;
				var p2 = (this.text.length - this.Cpos) * -1;
			}
			if (this.Cpos < this.text.length) {
				this.text = this.text.slice(0, p1) + String.fromCharCode(code) + this.text.slice(p2);
			} else {
				this.text = this.text + String.fromCharCode(code);
			}
			this.Cpos++;
			if (this.select) {
				this.CalcText();
				if (this.TWidth <= (this.w)) {
					this.offset = 0;
				} else {
					if (this.Cpos - this.offset < 0) {
						this.offset = this.offset > 0 ? this.Cpos - 1 : 0;
					}
				}
				this.select = false;
			}
			this.repaint();
		}

		// autosearch: has text changed after on_key or on_char ?
		if (this.autovalidation) {
			if (this.text != this.prev_text) {
				// launch timer to process the search
				if (this.launch_timeout) window.ClearTimeout(this.launch_timeout);
				this.launch_timeout = window.SetTimeout(function () {
					this.launch_timeout = false;
					eval(this.func);
				}, 500);
				this.prev_text = this.text;
			}
		}
	}
}
