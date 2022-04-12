function oTopBar() {
	this.logo = utils.LoadImage(fb.ComponentPath + "samples\\images\\foobar2000.png");

	this.setSize = function (x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.visible = (h > 0);
		this.setButtons();
	}

	this.setDatas = function () {
		this.playlist_name = plman.GetPlaylistName(g_active_playlist);
		this.item_count = plman.GetPlaylistItemCount(g_active_playlist);
		this.totalDurationText = p.list ? utils.FormatDuration(p.list.handleList.CalcTotalDuration()) : "";
	}
	this.setDatas();

	this.setButtons = function () {
		var close_off = utils.CreateImage(18, 18);
		var gb = close_off.GetGraphics();
		gb.WriteText(chars.close, g_font_awesome_12, blendColours(g_color_normal_bg, g_color_normal_txt, 0.75), 0, 0, 18, 18, 2, 2);
		close_off.ReleaseGraphics();

		this.button = new button(close_off, close_off, close_off);
	}

	this.draw = function (gr) {
		if (this.visible) {
			var borderHeight = cHeaderBar.borderWidth;
			var logoW = this.h - (borderHeight * 8);
			gr.FillRectangle(this.x, this.y, this.w, this.h - borderHeight, g_color_normal_txt & 0x03ffffff);
			gr.DrawImage(this.logo, this.x + borderHeight, this.y + (borderHeight * 4), logoW, logoW, 0, 0, this.logo.Width, this.logo.Height);
			gr.WriteText(this.playlist_name, g_font_19_1, g_color_normal_txt, this.x + logoW + borderHeight, this.y + 1 + borderHeight, this.w - logoW - 34, height(g_font_19_1), 0, 2);
			gr.WriteText(plman.PlaylistCount == 0 ? "no playlist" : this.item_count > 0 ? (this.item_count + (this.item_count > 1 ? " tracks. " : " track. ") + this.totalDurationText) : "empty playlist", g_font_12_1, blendColours(g_color_normal_txt, g_color_normal_bg, 0.35), this.x + logoW + borderHeight, Math.ceil(cTopBar.height / 2) + 1 + borderHeight, this.w - logoW - 15, height(g_font_12_1), 0, 2, 1);
			this.button.draw(gr, this.x + this.w - 20, this.y + 4);
		}
	}

	this.buttonCheck = function (event, x, y) {
		var state = this.button.checkstate(event, x, y);
		switch (event) {
		case "lbtn_down":
			if (state == ButtonStates.down) {
				this.buttonClicked = true;
			}
			break;
		case "lbtn_up":
			if (this.buttonClicked && state == ButtonStates.hover) {
				// action
				cTopBar.visible = false;
				window.SetProperty("JSPLAYLIST.TopBar.Visible", cTopBar.visible);
				resize_panels();
				full_repaint();
			}
			break;
		}
		return state;
	}
}
