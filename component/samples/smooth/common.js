String.prototype.calc_width = function (font_str) {
	var font = JSON.parse(font_str);
	return utils.CalcTextWidth(this, font.Name, font.Size, font.Weight || 400);
}

String.prototype.repeat = function (num) {
	if (num >= 0 && num <= 5) {
		var g = Math.round(num);
	} else {
		return "";
	}
	return new Array(g + 1).join(this);
}

function get_images() {
	var gb;
	var cover_size = 200;

	images.noart = utils.CreateImage(cover_size, cover_size);
	gb = images.noart.GetGraphics();
	gb.FillRectangle(0, 0, cover_size, cover_size, g_color_normal_txt & 0x10ffffff);
	gb.WriteText("NO\nCOVER", g_font_cover, blendColours(g_color_normal_txt, g_color_normal_bg, 0.30), 1, 1, cover_size, cover_size, 2, 2);
	images.noart.ReleaseGraphics();

	images.stream = utils.CreateImage(cover_size, cover_size);
	gb = images.stream.GetGraphics();
	gb.FillRectangle(0, 0, cover_size, cover_size, g_color_normal_txt & 0x10ffffff);
	gb.WriteText("STREAM", g_font_cover, blendColours(g_color_normal_txt, g_color_normal_bg, 0.30), 1, 1, cover_size, cover_size, 2, 2);
	images.stream.ReleaseGraphics();

	images.all = utils.CreateImage(cover_size, cover_size);
	gb = images.all.GetGraphics();
	gb.FillRectangle(0, 0, cover_size, cover_size, g_color_normal_txt & 0x10ffffff);
	gb.WriteText("ALL\nITEMS", g_font_cover, blendColours(g_color_normal_txt, g_color_normal_bg, 0.30), 1, 1, cover_size, cover_size, 2, 2);
	images.all.ReleaseGraphics();

	var size = 48;
	var icon_size = scale(20);

	images.magnify = utils.CreateImage(size, size);
	gb = images.magnify.GetGraphics();
	gb.WriteText(chars.search, g_font_awesome_40, g_color_normal_txt, 0, 0, size, size, 2, 2);
	images.magnify.ReleaseGraphics();

	images.reset = utils.CreateImage(size, size);
	gb = images.reset.GetGraphics();
	gb.WriteText(chars.close, g_font_awesome_40, blendColours(g_color_normal_txt, g_color_normal_bg, 0.35), 0, 0, size, size, 2, 2);
	images.reset.ReleaseGraphics();
	images.reset.Resize(icon_size, icon_size);

	images.reset_hover = utils.CreateImage(size, size);
	gb = images.reset_hover.GetGraphics();
	gb.WriteText(chars.close, g_font_awesome_40, RGB(255, 50, 50), 0, 0, size, size, 2, 2);
	images.reset_hover.ReleaseGraphics();
	images.reset_hover.Resize(icon_size, icon_size);
}

function validate_indexes(playlist, item) {
	return playlist >=0 && playlist < plman.PlaylistCount && item >= 0 && item < plman.GetPlaylistItemCount(playlist);
}

function play(playlist, item) {
	if (validate_indexes(playlist, item)) {
		plman.ExecutePlaylistDefaultAction(playlist, item);
	}
}

function reset_cover_timers() {
	if (timers.coverDone) {
		window.ClearTimeout(timers.coverDone);
		timers.coverDone = false;
	}
}

function generate_filename(cachekey, art_id) {
	var prefix = art_id == 4 ? "artist" : "front";
	return CACHE_FOLDER + prefix + cachekey + ".jpg";
}
0
function get_art(metadb, filename, art_id) {
	var img = images.cache[filename];
	if (img) return img;

	img = utils.LoadImage(filename);
	if (img) {
		images.cache[filename] = img;
		return img;
	}

	window.SetTimeout(function () {
		metadb.GetAlbumArtAsync(window.ID, art_id, false);
	}, 10);
	return img;
}

function on_get_album_art_done(metadb, art_id, image) {
	if (!image) return;
	var max_size = 300;
	for (var i = 0; i < brw.groups.length; i++) {
		if (brw.groups[i].metadb && brw.groups[i].metadb.Compare(metadb)) {
			if (image.Width > max_size || image.Height > max_size) {
				var s = Math.min(max_size / image.Width, max_size / image.Height);
				var w = Math.floor(image.Width * s);
				var h = Math.floor(image.Height * s);
				image.Resize(w, h);
			}
			var cached_filename = generate_filename(brw.groups[i].cachekey, art_id);
			image.SaveAs(cached_filename);
			images.cache[cached_filename] = image;
			brw.groups[i].cover_image = image;
			brw.repaint();
			break;
		}
	}
}

function drawImage(gr, img, dst_x, dst_y, dst_w, dst_h, auto_fill, border, opacity) {
	if (!img || !dst_w || !dst_h) {
		return;
	}
	if (auto_fill) {
		if (img.Width / img.Height < dst_w / dst_h) {
			var src_x = 0;
			var src_w = img.Width;
			var src_h = Math.round(dst_h * img.Width / dst_w);
			var src_y = Math.round((img.Height - src_h) / 2);
		} else {
			var src_y = 0;
			var src_w = Math.round(dst_w * img.Height / dst_h);
			var src_h = img.Height;
			var src_x = Math.round((img.Width - src_w) / 2);
		}
		gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, src_x + 3, src_y + 3, src_w - 6, src_h - 6, opacity || 1);
	} else {
		var s = Math.min(dst_w / img.Width, dst_h / img.Height);
		var w = Math.floor(img.Width * s);
		var h = Math.floor(img.Height * s);
		dst_x += Math.round((dst_w - w) / 2);
		dst_y += Math.round((dst_h - h) / 2);
		dst_w = w;
		dst_h = h;
		gr.DrawImage(img, dst_x, dst_y, dst_w, dst_h, 0, 0, img.Width, img.Height, opacity || 1);
	}
	if (border) {
		gr.DrawRectangle(dst_x, dst_y, dst_w - 1, dst_h - 1, 1, border);
	}
}

function GetKeyboardMask() {
	if (utils.IsKeyPressed(VK_CONTROL))
		return KMask.ctrl;
	if (utils.IsKeyPressed(VK_SHIFT))
		return KMask.shift;
	return KMask.none;
}

function replaceAll(str, search, repl) {
	while (str.indexOf(search) != -1) {
		str = str.replace(search, repl);
	}
	return str;
}

var ButtonStates = {
	normal: 0,
	hover: 1,
	down: 2
};

var button = function (normal, hover, down) {
	this.x = 0;
	this.y = 0;
	this.w = normal.Width;
	this.h = normal.Height;
	this.img = [normal, hover, down];
	this.state = ButtonStates.normal;

	this.update = function (normal, hover, down) {
		this.w = normal.Width;
		this.h = normal.Height;
		this.img = [normal, hover, down];
	}

	this.draw = function (gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		if (this.img[this.state]) {
			gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h);
		}
	}

	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.checkstate = function (event, x, y) {
		this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
		this.old = this.state;
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
		if (this.state != this.old)
			this.repaint();
		return this.state;
	}
}

function setWallpaperImg() {
	if (g_wallpaperImg) {
		g_wallpaperImg.Dispose();
		g_wallpaperImg = null;
	}

	switch (ppt.wallpapermode) {
	case 0:
		return;
	case 1:
		var metadb = fb.GetNowPlaying();
		if (metadb) g_wallpaperImg = metadb.GetAlbumArt();
		break;
	case 2:
		g_wallpaperImg = utils.LoadImage(ppt.wallpaperpath);
		break;
	}

	if (g_wallpaperImg && ppt.wallpaperblurred) {
		g_wallpaperImg.StackBlur(ppt.wallpaperblur);
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

function height(font) {
	return JSON.parse(font).Size + 4;
}

function scale(size) {
	return Math.round(size * g_fsize / 12);
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
	g_fsize = default_font.Size + ppt.extra_font_size;

	g_font = _font(name, 12, 0);
	g_font_bold = _font(name, 14, 1);
	g_font_box = _font(name, 10, 1);
	g_font_cover = _font(name, 40, 1);
	g_font_group1 = _font(name, 20, 1);
	g_font_group2 = _font(name, 16);
	g_font_awesome = _font("FontAwesome", 18);
	g_font_awesome_40 = _font("FontAwesome", 40);

	g_rating_width = chars.rating_off.repeat(5).calc_width(g_font_awesome) + 4;
	g_time_width = "00:00:00".calc_width(g_font) + 20;

	g_font_height = height(g_font);
	g_font_bold_height = height(g_font_bold);
	g_font_group2_height = height(g_font_group2);
}

function get_colors() {
	if (ppt.enableCustomColours) {
		g_color_normal_txt = window.GetProperty("SMOOTH.COLOUR.TEXT", RGB(255, 255, 255));
		g_color_normal_bg = window.GetProperty("SMOOTH.COLOUR.BACKGROUND.NORMAL", RGB(25, 25, 35));
		g_color_selected_bg = window.GetProperty("SMOOTH.COLOUR.BACKGROUND.SELECTED", RGB(15, 177, 255));
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
	get_images();
}

function on_font_changed() {
	get_font();
	get_metrics();
	brw.repaint();
}

function on_colours_changed() {
	get_colors();
	get_images();

	// Browser only
	if (brw.inputbox) {
		brw.inputbox.textcolor = g_color_normal_txt;
		brw.inputbox.backselectioncolor = g_color_selected_bg;
	}

	brw.scrollbar.setNewColours();
	brw.repaint();
}

var KMask = {
	none: 0,
	ctrl: 1,
	shift: 2,
};

var images = {
	cache : {},
	clear : function () {
		for (var i in this.cache) {
			this.cache[i].Dispose();
		}
		this.cache = {};
	}
}

var timers = {
	mouseWheel: false,
	mouseDown: false,
	movePlaylist: false,
};

var ppt = {
	enableCustomColours: window.GetProperty("SMOOTH.CUSTOM.COLOURS.ENABLED", false),
	extra_font_size: window.GetProperty("SMOOTH.EXTRA.FONT.SIZE", 0),
	showHeaderBar: window.GetProperty("SMOOTH.SHOW.TOP.BAR", true),
	autoFill: window.GetProperty("SMOOTH.AUTO.FILL", true),
	wallpapermode: window.GetProperty("SMOOTH.WALLPAPER.MODE", false), // 0 none, 1 front cover 2 custom image
	wallpaperblurred: window.GetProperty("SMOOTH.WALLPAPER.BLURRED", false),
	wallpaperblur: window.GetProperty("SMOOTH.WALLPAPER.BLUR", 50),
	wallpaperpath: window.GetProperty("SMOOTH.WALLPAPER.PATH", ""),
	wallpaperopacity: window.GetProperty("SMOOTH.WALLPAPER.OPACITY", 0.2),
	enableTouchControl: window.GetProperty("SMOOTH.TOUCH.CONTROL", true),
	refreshRate: 40,
	defaultHeaderBarHeight: 25,
	headerBarHeight: 25,
	scrollSmoothness: 2.5,
	rowScrollStep: 3,
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
	search : '\uF002',
};

var cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	y_current: 0,
	y_prev: 0,
	y_move: 0,
	scroll_delta: 0,
	t1: null,
	timer: false,
	multiplier: 0,
	delta: 0
};

var CACHE_FOLDER = fb.ProfilePath + "js_smooth_cache\\";
utils.CreateFolder(CACHE_FOLDER);

var g_font = "";
var g_font_bold = "";
var g_font_box = "";
var g_font_cover = "";
var g_font_group1 = "";
var g_font_group2 = "";
var g_font_awesome = "";
var g_font_awesome_40 = "";
var g_fsize = 16;

var g_color_normal_txt = 0;
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;

var g_time_width = 0;
var g_rating_width = 0;

var g_filter_text = "";
var g_wallpaperImg = null;
var isScrolling = false;
var need_repaint = false;
var g_start_ = 0, g_end_ = 0;
var m_x = 0, m_y = 0;
var scroll_ = 0, scroll = 0, scroll_prev = 0;
var ww = 0, wh = 0;

get_font();
get_colors();
