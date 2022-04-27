**Properties**

|||||
|---|---|---|---|
|utils.Version|`number`|read|

Returns a 5 digit number.

```
v3.0.0 -> 30000
v3.4.1 -> 30401
v3.10.12 -> 31012
```

!!! example
	```js
	if (utils.Version < 30000) {
		utils.ShowPopupMessage("This script requires JScript Panel v3.0.0 or above.");
	}
	```

**Methods**

## `utils.CalcTextWidth(text, font_name, font_size[, font_weight, font_style, font_stretch])`
|Arguments|||
|---|---|---|
|text|`string`||
|font_name|`string`||
|font_size|`number`||
|font_weight|[DWRITE_FONT_WEIGHT](../../flags/#dwrite_font_weight)|Default `400`.|
|font_style|[DWRITE_FONT_STYLE](../../flags/#dwrite_font_style)|Default `0`.|
|font_stretch|[DWRITE_FONT_STRETCH](../../flags/#dwrite_font_stretch)|Default `5`.|

Returns a `number`.

## `utils.CheckComponent(name)`
|Arguments|||
|---|---|---|
|name|`string`||

Returns a `boolean` value.

## `utils.CheckFont(name)`
|Arguments|||
|---|---|---|
|name|`string`||

Returns a `boolean` value.

## `utils.ColourPicker(default_colour)`
|Arguments|||
|---|---|---|
|default_colour|`number`||

Returns a `number` which can used as the `colour` in many methods.

The dialog is `modal` which means code directly after it will not run until
it is dismissed.

## `utils.CreateFolder(path)`
Returns `true` on success or if folder already exists. Returns
`false` if operation fails.

Parent folders are created if they don't exist.

## `utils.CreateImage(width, height)`
|Arguments|||
|---|---|---|
|width|`number`||
|height|`number`||

Returns an [IJSImage](../../interfaces/IJSImage) instance.

## `utils.CreateProfiler([name])`
|Arguments|||
|---|---|---|
|name|`string`|Optional|

Returns an [IProfiler](../../interfaces/IProfiler) instance. Check
link for an example.

## `utils.CreateTextLayout(text, font_name, font_size[, font_size, font_style, font_stretch, text_aligment, paragraph_aligment, word_wrapping])`
|Arguments|||
|---|---|---|
|text|`string`||
|font_name|`string`||
|font_size|`number`||
|font_weight|[DWRITE_FONT_WEIGHT](../../flags/#dwrite_font_weight)|Default `400`.|
|font_style|[DWRITE_FONT_STYLE](../../flags/#dwrite_font_style)|Default `0`.|
|font_stretch|[DWRITE_FONT_STRETCH](../../flags/#dwrite_font_stretch)|Default `5`.|
|text_aligment|[DWRITE_TEXT_ALIGNMENT](../../flags/#dwrite_text_alignment)|Default `0`.|
|paragraph_aligment|[DWRITE_PARAGRAPH_ALIGNMENT](../../flags/#dwrite_paragraph_alignment)|Default `0`.|
|word_wrapping|[DWRITE_WORD_WRAPPING](../../flags/#dwrite_word_wrapping)|Default `0`.|

Returns an [ITextLayout](../../interfaces/ITextLayout) instance.

You typically use this when you want to calculate the height of a long string
or need scrolling. When passing to [IJSGraphics WriteTextLayout](../../interfaces/IJSGraphics/#writetextlayouttext_layout-colour-x-y-w-h-vertical_offset),
you can supply a vertical offset.

!!! example
	```js
	// ==PREPROCESSOR==
	// @name "SimpleScroll"
	// @author "marc2003"
	// @import "%fb2k_component_path%helpers.txt"
	// ==/PREPROCESSOR==

	var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
	var layout = utils.CreateTextLayout(text, 'Segoe UI', 24);
	var offset = 0;
	var text_height = 0;

	var box = {
		x : 50,
		y : 50,
		w : 0,
		h : 0,
	}

	function on_paint(gr) {
		gr.DrawRectangle(box.x, box.y, box.w, box.h, 1, RGB(255, 0, 0));
		gr.WriteTextLayout(layout, RGB(0, 0, 0), box.x, box.y, box.w, box.h, offset);
	}

	function on_mouse_wheel(step) {
		if (text_height < box.h) return;
		offset += step * 60;
		if (offset > 0) offset = 0;
		else if (offset < box.h - text_height) offset = box.h - text_height;
		window.Repaint();
	}

	function on_size() {
		box.w = window.Width / 2;
		box.h = window.Height / 2;
		text_height = layout.CalcTextHeight(box.w);
		if (text_height < box.h) offset = 0;
		else if (offset < box.h - text_height) offset = box.h - text_height;
	}
	```

## `utils.DateStringToTimestamp(str)`
|Arguments|||
|---|---|---|
|str|`string`|Must be in full `YYYY-MM-DD HH:MM:SS` format.|

The return value is seconds since 00:00:00 Thursday, 1 January 1970 UTC.

It is expected date strings are timezone adjusted but timestamps are UTC (not adjusted).

!!! example
	```js
	var last_played_string = "2018-08-30 00:00:00";
	var last_played_timestamp = utils.DateStringToTimestamp(last_played_string);

	// Divide by 1000 because JavaScript timestamps are in milliseconds.
	var now = Math.round(new Date().getTime() / 1000);

	// number of seconds in a day
	var day = 24 * 60 * 60;

	// number of days since last played
	console.log(Math.floor((now - last_played_timestamp) / day));
	```

## `utils.DetectCharset(path)`
|Arguments|||
|---|---|---|
|path|`string`|Path to a text file.|

Returns a `number` which can be supplied to [utils.ReadTextFile](#utilsreadtextfilepath-codepage).

This may not be accurate and returns `0` if an error occurred.

## `utils.DownloadFileAsync(window_id, url, path)`
|Arguments|||
|---|---|---|
|window_id|[window.ID](../window)|
|url|`string`|The remote file you want to download.|
|path|`string`|Full path including extension. The parent folder must already exist.|

Use in conjunction with [on_download_file_done](../../callbacks/#on_download_file_donepath-success-error_text).

## `utils.FormatDuration(seconds)`
|Arguments|||
|---|---|---|
|seconds|`number`|

Returns a `string`.

!!! example
	```js
	var playlist_items = plman.GetPlaylistItems(plman.ActivePlaylist);
	var playlist_length_seconds = playlist_items.CalcTotalDuration();
	console.log(utils.FormatDuration(playlist_length_seconds)); // 5:24:44
	```

## `utils.FormatFileSize(bytes)`
|Arguments|||
|---|---|---|
|bytes|`number`|

Returns a `string`.

!!! example
	```js
	var playlist_items = plman.GetPlaylistItems(plman.ActivePlaylist);
	var playlist_bytes = playlist_items.CalcTotalSize()
	console.log(utils.FormatFileSize(playlist_bytes)); // 601 MB
	```

## `utils.GetClipboardText()`
Returns a `string`. It will be empty if the clipboard contents are not text.

## `utils.GetFileSize(path)`
|Arguments|||
|---|---|---|
|path|`string`|

Returns the size in bytes.

## `utils.GetLastModified(path)`
|Arguments|||
|---|---|---|
|path|`string`|

The return value is seconds since 00:00:00 Thursday, 1 January 1970 UTC.

## `utils.GetSysColour(index)`
|Arguments|||
|---|---|---|
|index|`number`|[https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-getsyscolor](https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-getsyscolor)|

Returns a `number` which can used as the `colour` in many methods. Could
be `0` if the `index` is invalid.

!!! example
	```js
	var splitter_colour = utils.GetSysColour(15);
	```

## `utils.GetSystemMetrics(index)`
|Arguments|||
|---|---|---|
|index|`number`|[https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-getsystemmetrics](https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-getsystemmetrics)|

Returns a `number`.

## `utils.Glob(pattern[, exc_mask, inc_mask])`
|Arguments|||
|---|---|---|
|pattern|`string`|
|exc_mask|[FILE_ATTRIBUTE](../../flags/#file_attribute)|Default `FILE_ATTRIBUTE_DIRECTORY`.|
|inc_mask|[FILE_ATTRIBUTE](../../flags/#file_attribute)|Default `0xffffffff`.|

Returns a `VBArray` so you need to use `.toArray()` on the result.

!!! example
	```js
	var arr = utils.Glob("C:\\Pictures\\*.jpg").toArray();
	```

## `utils.HTTPRequestAsync(window_id, type, url, user_agent_or_headers, post_data, content_type)`
|Arguments|||
|---|---|---|
|window_id|[window.ID](../window)|
|type|`number`|Use `0` for `GET`, `1` for `POST`.|
|url|`string`|
|user_agent_or_headers|`string`|See examples below.|
|post_data|`string`|Should be omitted for `GET` requests and will be ignored. It is required for `POST` requests. It could be form data or a stringified `JSON` object/array.|
|content_type|`string`|Should be omitted for `GET` requests and will be ignored. It is required for `POST` requests. 2 examples of valid values are `application/json` or `application/x-www-form-urlencoded`.|

Returns a unique `task_id` which is used as the first argument in
the [on_http_request_done](../../callbacks/#on_http_request_donetask_id-success-content) callback.

!!! note "Notes"
	- A `user agent` should not contain spaces. If they exist, they
	will be stripped automatically.

	- When making a `POST` request, do not add a `Content-Type` header. It
	must be set via the `content_type` argument listed above.

!!! example
	=== "Empty User Agent"
		```js
		var url = ...

		// Defaults to "JScriptPanel3".
		var user_agent = "";
		var task_id = utils.HTTPRequestAsync(window.ID, 0, url, user_agent);
		```

	=== "Custom User Agent"
		```js
		var url = ...
		var user_agent = "my_app/0.1";
		var task_id = utils.HTTPRequestAsync(window.ID, 0, url, user_agent);
		```

	=== "Custom Headers"
		```js
		var url = ...
		var headers = {
			"User-Agent" : "my_app/0.1",
			"Some other header" : "blah",
		};
		var task_id = utils.HTTPRequestAsync(window.ID, 0, url, JSON.stringify(headers));
		```

## `utils.InputBox(prompt, title[, default_value, error_on_cancel])`
|Arguments|||
|---|---|---|
|prompt|`string`|
|title|`string`|
|default_value|`string`|Defaults to an empty string if omitted.|
|error_on_cancel|`boolean`|Default `false`. If set to `true`, use try/catch to catch errors.|

Returns a `string`.

The dialog is `modal` which means code directly after it will not run until
it is dismissed.

With `error_on_cancel` not set (or set to `false`), cancelling the dialog will return `default_value`.

!!! example
	```js
	var username = utils.InputBox("Enter your username", "JScript Panel", "");
	```

Using the above example, you can't tell if `OK` or `Cancel` was
pressed if the return value is the same as `default_value`.

If you need to know, set `error_on_cancel` to `true` which throws
a script error when `Cancel` is pressed.

!!! example
	```js
	try {
		var username = utils.InputBox("Enter your name", "JScript Panel", "", true);
		// OK was pressed.
	} catch(e) {
		// Dialog was closed by pressing Esc, Cancel or the Close button.
	}
	```

## `utils.IsFile(path)`
|Arguments|||
|---|---|---|
|path|`string`|

Returns a `boolean` value.

## `utils.IsFolder(folder)`
|Arguments|||
|---|---|---|
|folder|`string`|

Returns a `boolean` value.

## `utils.IsKeyPressed(vkey)`
|Arguments|||
|---|---|---|
|vkey|`number`|[https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes](https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes)|

Returns a `boolean` value.

## `utils.ListFiles(folder[, recursive])`
|Arguments|||
|---|---|---|
|folder|`string`|
|recursive|`boolean`|Default `false`.|

Returns a `VBArray` so you need to use `.toArray()` on the result.

## `utils.ListFolders(folder[, recursive])`
|Arguments|||
|---|---|---|
|folder|`string`|
|recursive|`boolean`|Default `false`.|

Returns a `VBArray` so you need to use `.toArray()` on the result.

## `utils.ListFonts()`
Returns a `VBArray` so you need to use `.toArray()` on the result.

## `utils.LoadImage(path)`
|Arguments|||
|---|---|---|
|path|`string`|

Returns an [IJSImage](../../interfaces/IJSImage) instance or `null` on failure.

## `utils.LoadImageAsync(window_id, path)`
|Arguments|||
|---|---|---|
|window_id|[window.ID](../window)|
|path|`string`|

No return value.

Use in conjunction with [on_load_image_done](../../callbacks/#on_load_image_doneimage_path-image).

## `utils.LoadSVG(path_or_xml[, max_width])`
|Arguments|||
|---|---|---|
|path_or_xml|`string`|
|max_width|`number`|Default `0`. Original size is used if zero.|

Returns an [IJSImage](../../interfaces/IJSImage) instance or `null` on failure.

!!! example
	![SVG](../../images/android_svg.png)

	```js
	var svg_file = fb.ComponentPath + "samples\\svg\\android.svg";
	var svg_content = utils.ReadUTF8(svg_file);

	var original = utils.LoadSVG(svg_file);

	// Maybe manipulate the XML??? That's for others, not me!!
	var large = utils.LoadSVG(svg_content, 512);

	function on_paint(gr) {
		gr.DrawImage(original, 0, 0, original.Width, original.Height, 0, 0, original.Width, original.Height);
		gr.DrawImage(large, original.Width, 0, large.Width, large.Height, 0, 0, large.Width, large.Height);
	}
	```

## `utils.MessageBox(prompt, title, flags)`
|Arguments|||
|---|---|---|
|prompt|`string`|
|title|`string`|
|flags|[MessageBox Buttons](../../flags/#messagebox-buttons), [MessageBox Icons](../../flags/#messagebox-icons)|Can be combined.|

Returns a [MessageBox Return Value](../../flags/#messagebox-return-values).

The dialog is `modal` which means code directly after it will not run until
it is dismissed.

!!! example
	```js
	// ==PREPROCESSOR==
	// @import "%fb2k_component_path%helpers.txt"
	// ==/PREPROCESSOR==

	var prompt = "Do you really want to open the Preferences?";
	var title = "A very important question";
	if (utils.MessageBox(prompt, title, MB_YESNO | MB_ICONQUESTION) == IDYES) {
		fb.ShowPreferences();
	}
	```

## `utils.ReadINI(path, section, key[, default_value])`
|Arguments|||
|---|---|---|
|path|`string`|
|section|`string`|
|key|`string`|
|default_value|`string`|This will be the return value if the `key` isn't found. Defaults to an empty string if omitted.|

Returns a `string`. The maximum length is limited to 255 characters.

An INI file should look something like this:

```
[section]
key=val
```

!!! example
	```js
	var username = utils.ReadINI("e:\\my_file.ini", "Last.fm", "username");
	```

## `utils.ReadTextFile(path[, codepage])`
|Arguments|||
|---|---|---|
|path|`string`|
|codepage|`number`|Default `0`. See [utils.DetectCharset](#utilsdetectcharsetpath).|

Returns a `string`. Will be empty if `path` doesn't exist or there
was an error opening it.

!!! note
	If the file is determined to be `UCS2-LE` or `UTF8`, any
	supplied `codepage` will be ignored.

!!! example
	=== "Simple"
		```js
		var path = "E:\\some text file.txt";
		var text = utils.ReadTextFile(path);
		```

	=== "Using utils.DetectCharset"
		```js
		var path = "E:\\some text file.txt";
		var codepage = utils.DetectCharset(path);
		var text = utils.ReadTextFile(path, codepage);
		```

## `utils.ReadUTF8(path)`
|Arguments|||
|---|---|---|
|path|`string`|

Returns a `string`. Will be empty if `path` doesn't exist or there
was an error opening it.

!!!note
	It's preferable to use this when you know the file
	is `UTF8`. If you're unsure, continue to use [utils.ReadTextFile](#utilsreadtextfilepath-codepage)

## `utils.RemovePath(path)`
|Arguments|||
|---|---|---|
|path|`string`|Can be a file or folder. If it's a folder, it must be empty.|

Returns a `boolean` value.

## `utils.ReplaceIllegalChars(str[, modern])`
|Arguments|||
|---|---|---|
|str|`string`|
|modern|`boolean`|Default `true`.|

Returns a `string`.

!!! example
	=== "Legacy"
		```js
		var chars = '"\\\/*|:<>?';
		console.log(utils.ReplaceIllegalChars(chars, false));
		```

		``` markdown title="Output"
		''--x_-__
		```

	=== "Modern"
		```js
		var chars = '"\\\/*|:<>?';
		console.log(utils.ReplaceIllegalChars(chars, true));
		```

		``` markdown title="Output"
		''⧵⁄∗∣∶˂˃？
		```

!!! note
	These replacements should correspond with the settings available in
	the [foobar2000](https://foobar2000.org) `File Operations` and `Converter`
	advanced preferences.

## `utils.SetClipboardText(text)`
|Arguments|||
|---|---|---|
|text|`string`|

No return value.

## `utils.ShowPopupMessage(message[, title])`
|Arguments|||
|---|---|---|
|message|`string`|
|title|`string`|Default `JScript Panel 3`.|

No return value.

## `utils.TimestampToDateString(ts)`
|Arguments|||
|---|---|---|
|ts|`number`|Should be the number of seconds since 00:00:00 Thursday, 1 January 1970 UTC.|

Returns a `string`. It will be adjusted to your local time zone.

!!! example
	```js
	// Divide by 1000 because JavaScript timestamps are in milliseconds.
	var now = Math.round(new Date().getTime() / 1000);
	console.log(utils.TimestampToDateString(now));
	```

## `utils.WriteINI(path, section, key, value)`
|Arguments|||
|---|---|---|
|path|`string`|The parent folder must already exist.|
|section|`string`|
|key|`string`|
|value|`string`|

Returns a `boolean` value.

!!! example
	```js
	utils.WriteINI("e:\\my_file.ini", "Last.fm", "username", "Bob");
	```

## `utils.WriteTextFile(path, content)`
|Arguments|||
|---|---|---|
|path|`string`|The parent folder must already exist.|
|content|`string`|

Returns a `boolean` value.

!!! note
	Files are written as `UTF8` without `BOM`.
