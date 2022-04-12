function oFilterBox() {
	this.magnify_image = null;

	this.getImages = function () {
		var gb;
		var size = 48;

		this.magnify_image = utils.CreateImage(size, size);
		gb = this.magnify_image.GetGraphics();
		gb.WriteText(chars.search, g_font_awesome_40, g_color_normal_txt, 0, 0, size, size, 2, 2);
		this.magnify_image.ReleaseGraphics();

		var resetIcon = utils.CreateImage(size, size);
		gb = resetIcon.GetGraphics();
		gb.WriteText(chars.close, g_font_awesome_40, blendColours(g_color_normal_txt, g_color_normal_bg, 0.35), 0, 0, size, size, 2, 2);
		resetIcon.ReleaseGraphics();
		resetIcon.Resize(cFilterBox.h, cFilterBox.h);

		var resetIcon_hover = utils.CreateImage(size, size);
		gb = resetIcon_hover.GetGraphics();
		gb.WriteText(chars.close, g_font_awesome_40, RGB(255, 50, 50), 0, 0, size, size, 2, 2);
		resetIcon_hover.ReleaseGraphics();
		resetIcon_hover.Resize(cFilterBox.h, cFilterBox.h);

		this.reset_bt = new button(resetIcon, resetIcon, resetIcon_hover);
	}
	this.getImages();

	this.init = function () {
		this.inputbox = new oInputbox(cFilterBox.w, cFilterBox.h, "", "Filter", g_color_normal_txt, 0, 0, g_color_selected_bg, g_sendResponse);
		this.inputbox.autovalidation = true;
	}
	this.init();

	this.reset_colors = function () {
		this.inputbox.textcolor = g_color_normal_txt;
		this.inputbox.backselectioncolor = g_color_selected_bg;
	}

	this.setSize = function (w, h, font_size) {
		this.inputbox.setSize(w, h, font_size);
		this.getImages();
	}

	this.clearInputbox = function () {
		if (this.inputbox.text.length > 0) {
			this.inputbox.text = "";
			this.inputbox.offset = 0;
			g_filter_text = "";
		}
	}

	this.draw = function (gr, x, y) {
		if (this.inputbox.text.length > 0) {
			this.reset_bt.draw(gr, x, y);
		} else {
			gr.DrawImage(this.magnify_image, x, y, cFilterBox.h - 1, cFilterBox.h - 1, 0, 0, this.magnify_image.Width, this.magnify_image.Height);
		}
		for (var i = 0; i < cFilterBox.h - 2; i += 2) {
			gr.FillRectangle(x + scale(22) + cFilterBox.w, y + 2 + i, 1, 1, RGB(100, 100, 100));
		}
		this.inputbox.draw(gr, x + scale(22), y, 0, 0);
	}

	this.on_mouse = function (event, x, y, delta) {
		switch (event) {
		case "lbtn_down":
			this.inputbox.check("lbtn_down", x, y);
			if (this.inputbox.text.length > 0)
				this.reset_bt.checkstate("lbtn_down", x, y);
			break;
		case "lbtn_up":
			this.inputbox.check("lbtn_up", x, y);
			if (this.inputbox.text.length > 0) {
				if (this.reset_bt.checkstate("lbtn_up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					g_sendResponse();
				}
			}
			break;
		case "lbtn_dblclk":
			this.inputbox.check("lbtn_dblclk", x, y);
			break;
		case "rbtn_up":
			this.inputbox.check("rbtn_up", x, y);
			break;
		case "move":
			this.inputbox.check("move", x, y);
			if (this.inputbox.text.length > 0)
				this.reset_bt.checkstate("move", x, y);
			break;
		}
	}
}
