var cScrollBar = {
	visible: true,
	defaultWidth: 17,
	width: 17,
	ButtonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	defaultMinCursorHeight: 20,
	minCursorHeight: 20,
	timerID: false,
	timerCounter: -1
};

function oScrollbar() {
	this.buttons = new Array(3);
	this.buttonClick = false;

	this.setNewColours = function () {
		this.setButtons();
		this.setCursorButton();
	}

	this.setButtons = function () {
		var gb;

		this.upImage_normal = utils.CreateImage(this.w, this.w);
		gb = this.upImage_normal.GetGraphics();
		gb.WriteText(chars.up, g_font_awesome, g_color_normal_txt & 0x55ffffff, 0, 0, this.w, this.w, 2, 2);
		this.upImage_normal.ReleaseGraphics();

		this.upImage_hover = utils.CreateImage(this.w, this.w);
		gb = this.upImage_hover.GetGraphics();
		gb.WriteText(chars.up, g_font_awesome, g_color_normal_txt & 0x99ffffff, 0, 0, this.w, this.w, 2, 2);
		this.upImage_hover.ReleaseGraphics();

		this.upImage_down = utils.CreateImage(this.w, this.w);
		gb = this.upImage_down.GetGraphics();
		gb.WriteText(chars.up, g_font_awesome, g_color_normal_txt, 0, 0, this.w, this.w, 2, 2);
		this.upImage_down.ReleaseGraphics();

		this.downImage_normal = utils.CreateImage(this.w, this.w);
		gb = this.downImage_normal.GetGraphics();
		gb.WriteText(chars.down, g_font_awesome, g_color_normal_txt & 0x55ffffff, 0, 0, this.w, this.w, 2, 2);
		this.downImage_normal.ReleaseGraphics();

		this.downImage_hover = utils.CreateImage(this.w, this.w);
		gb = this.downImage_hover.GetGraphics();
		gb.WriteText(chars.down, g_font_awesome, g_color_normal_txt & 0x99ffffff, 0, 0, this.w, this.w, 2, 2);
		this.downImage_hover.ReleaseGraphics();

		this.downImage_down = utils.CreateImage(this.w, this.w);
		gb = this.downImage_down.GetGraphics();
		gb.WriteText(chars.down, g_font_awesome, g_color_normal_txt, 0, 0, this.w, this.w, 2, 2);
		this.downImage_down.ReleaseGraphics();

		this.buttons[cScrollBar.ButtonType.up] = new button(this.upImage_normal, this.upImage_hover, this.upImage_down);
		this.buttons[cScrollBar.ButtonType.down] = new button(this.downImage_normal, this.downImage_hover, this.downImage_down);
	}

	this.setCursorButton = function () {
		var gb;

		this.cursorImage_normal = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_normal.GetGraphics();
		gb.FillRectangle(1, 0, this.cursorw - 2, this.cursorh, blendColours(g_color_normal_txt, g_color_normal_bg, 0.5) & 0x88ffffff);
		gb.DrawRectangle(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, g_color_normal_txt & 0x44ffffff);
		this.cursorImage_normal.ReleaseGraphics();

		this.cursorImage_hover = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillRectangle(1, 0, this.cursorw - 2, this.cursorh, blendColours(g_color_normal_txt, g_color_normal_bg, 0.3) & 0x88ffffff);
		gb.DrawRectangle(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, g_color_normal_txt & 0x44ffffff);
		this.cursorImage_hover.ReleaseGraphics();

		this.cursorImage_down = utils.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillRectangle(1, 0, this.cursorw - 2, this.cursorh, blendColours(g_color_normal_txt, g_color_normal_bg, 0.05) & 0x88ffffff);
		gb.DrawRectangle(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, g_color_normal_txt & 0x44ffffff);
		this.cursorImage_down.ReleaseGraphics();

		this.buttons[cScrollBar.ButtonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
		this.buttons[cScrollBar.ButtonType.cursor].x = this.x;
		this.buttons[cScrollBar.ButtonType.cursor].y = this.cursory;
	}

	this.draw = function (gr) {
		gr.FillRectangle(this.x, this.y, this.w, this.h, g_color_normal_bg & 0x25ffffff);
		gr.FillRectangle(this.x, this.y, 1, this.h, g_color_normal_txt & 0x05ffffff);

		if (cScrollBar.visible) {
			this.buttons[cScrollBar.ButtonType.cursor].draw(gr, this.x, this.cursory, 200);
		}
		this.buttons[cScrollBar.ButtonType.up].draw(gr, this.x, this.y, 200);
		this.buttons[cScrollBar.ButtonType.down].draw(gr, this.x, this.areay + this.areah, 200);
	}

	this.updateScrollbar = function () {
		var prev_cursorh = this.cursorh;
		this.total = typeof brw.rowsCount == "number" ? brw.rowsCount : brw.rows.length;
		this.rowh = typeof brw.rowHeight == "number" ? brw.rowHeight : ppt.rowHeight;
		this.totalh = this.total * this.rowh;
		cScrollBar.visible = this.totalh > brw.h;
		this.cursorw = cScrollBar.width;
		if (this.total > 0) {
			this.cursorh = Math.round((brw.h / this.totalh) * this.areah);
			if (this.cursorh < cScrollBar.minCursorHeight)
				this.cursorh = cScrollBar.minCursorHeight;
		} else {
			this.cursorh = cScrollBar.minCursorHeight;
		}
		this.setCursorY();
		if (this.cursorw && this.cursorh && this.cursorh != prev_cursorh)
			this.setCursorButton();
	}

	this.setCursorY = function () {
		var ratio = scroll / (this.totalh - brw.h);
		this.cursory = this.areay + Math.round((this.areah - this.cursorh) * ratio);
	}

	this.setSize = function () {
		this.buttonh = cScrollBar.width;
		this.x = brw.x + brw.w;
		this.y = brw.y - ppt.headerBarHeight * 0;
		this.w = cScrollBar.width;
		this.h = brw.h + ppt.headerBarHeight * 0;
		this.areay = this.y + this.buttonh;
		this.areah = this.h - (this.buttonh * 2);
		this.setButtons();
	}

	this.setScrollFromCursorPos = function () {
		var ratio = (this.cursory - this.areay) / (this.areah - this.cursorh);
		scroll = Math.round((this.totalh - brw.h) * ratio);
	}

	this.cursorCheck = function (event, x, y) {
		if (!this.buttons[cScrollBar.ButtonType.cursor])
			return;
		switch (event) {
		case "lbtn_down":
			var tmp = this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (tmp == ButtonStates.down) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursory;
			}
			break;
		case "lbtn_up":
			this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.setScrollFromCursorPos();
				brw.repaint();
			}
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			break;
		case "move":
			this.buttons[cScrollBar.ButtonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursory = y - this.cursorDragDelta;
				if (this.cursory + this.cursorh > this.areay + this.areah) {
					this.cursory = (this.areay + this.areah) - this.cursorh;
				}
				if (this.cursory < this.areay) {
					this.cursory = this.areay;
				}
				this.setScrollFromCursorPos();
				brw.repaint();
			}
			break;
		}
	}

	this._isHover = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	}

	this._isHoverArea = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.areay && y <= this.areay + this.areah);
	}

	this._isHoverCursor = function (x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.cursory && y <= this.cursory + this.cursorh);
	}

	this.on_mouse = function (event, x, y, delta) {
		this.isHover = this._isHover(x, y);
		this.isHoverArea = this._isHoverArea(x, y);
		this.isHoverCursor = this._isHoverCursor(x, y);
		this.isHoverButtons = this.isHover && !this.isHoverCursor && !this.isHoverArea;
		this.isHoverEmptyArea = this.isHoverArea && !this.isHoverCursor;

		var scroll_step = this.rowh;
		var scroll_step_page = brw.h;

		switch (event) {
		case "lbtn_down":
		case "lbtn_dblclk":
			if ((this.isHoverCursor || this.cursorDrag) && !this.buttonClick && !this.isHoverEmptyArea) {
				this.cursorCheck(event, x, y);
			} else {
				var bt_state = ButtonStates.normal;
				for (var i = 1; i < 3; i++) {
					switch (i) {
					case 1: // up button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "lbtn_down" && bt_state == ButtonStates.down) || (event == "lbtn_dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll - scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function () {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll - scroll_step;
										scroll = check_scroll(scroll);
									} else {
										cScrollBar.timerCounter++;
									}
								}, 80);
							}
						}
						break;
					case 2: // down button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "lbtn_down" && bt_state == ButtonStates.down) || (event == "lbtn_dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll + scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function () {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll + scroll_step;
										scroll = check_scroll(scroll);
									} else {
										cScrollBar.timerCounter++;
									}
								}, 80);
							}
						}
						break;
					}
				}
				if (!this.buttonClick && this.isHoverEmptyArea) {
					if (y < this.cursory) {
						this.buttonClick = true;
						scroll = scroll - scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function () {
								if (cScrollBar.timerCounter > 6 && m_y < brw.scrollbar.cursory) {
									scroll = scroll - scroll_step_page;
									scroll = check_scroll(scroll);
								} else {
									cScrollBar.timerCounter++;
								}
							}, 80);
						}
					} else {
						this.buttonClick = true;
						scroll = scroll + scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function () {
								if (cScrollBar.timerCounter > 6 && m_y > brw.scrollbar.cursory + brw.scrollbar.cursorh) {
									scroll = scroll + scroll_step_page;
									scroll = check_scroll(scroll);
								} else {
									cScrollBar.timerCounter++;
								}
							}, 80);
						}
					}
				}
			}
			break;
		case "rbtn_up":
		case "lbtn_up":
			if (cScrollBar.timerID) {
				window.ClearInterval(cScrollBar.timerID);
				cScrollBar.timerID = false;
			}
			cScrollBar.timerCounter = -1;

			this.cursorCheck(event, x, y);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			}
			this.buttonClick = false;
			break;
		case "move":
			this.cursorCheck(event, x, y);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			}
			break;
		case "wheel":
			if (!this.buttonClick) {
				this.updateScrollbar();
			}
			break;
		}
	}
}
