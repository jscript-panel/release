**Properties**

|||||
|---|---|---|---|
|window.DPI|`number`|read|This value is fixed when [foobar2000](https://foobar2000.org) starts. It will not change even if Windows display settings are updated.
|window.Height|`number`|read|
|window.ID|`number`|read|Unique identifier for the panel. Use in various `async` methods.|
|window.IsDark|`boolean`|read|
|window.IsDefaultUI|`boolean`|read|
|window.IsVisible|`boolean`|read|
|window.MaxHeight|`number`|read, write|
|window.MaxWidth|`number`|read, write|
|window.MinHeight|`number`|read, write|
|window.MinWidth|`number`|read, write|
|[window.Name](../../preprocessors/#name)|`string`|read|
|window.Width|`number`|read|

**Methods**

## `window.ClearInterval(timerID)`
|Arguments|||
|---|---|---|
|timerID|`number`|

No return value.

## `window.ClearTimeout(timerID)`
|Arguments|||
|---|---|---|
|timerID|`number`|

No return value.

## `window.CreateThemeManager(class_list)`
|Arguments|||
|---|---|---|
|class_list|`string`|[https://docs.microsoft.com/en-gb/windows/win32/controls/parts-and-states](https://docs.microsoft.com/en-gb/windows/win32/controls/parts-and-states)|

Returns an [IThemeManager](../../interfaces/IThemeManager) instance
or `null` on failure.

## `window.CreatePopupMenu()`
Returns an [IMenuObj](../../interfaces/IMenuObj) instance.

## `window.CreateTooltip([font_name, font_size_px)`
|Arguments|||
|---|---|---|
|font_name|`string`|Default `Segoe UI`.|
|font_size_px|`number`|Default `16`.|

Returns an [ITooltip](../../interfaces/ITooltip) instance.

!!! note
	Since it's not permitted to call this more than once
	in a panel, see the additional [window.SetTooltipFont](#windowsettooltipfontfont_name-font_size_px)
	method too.

## `window.GetColourCUI(type)`
|Arguments|||
|---|---|---|
|type|[ColourTypeCUI](../../flags/#colourtypecui)|

Returns a `number` which can used as the `colour` in many methods.

## `window.GetColourDUI(type)`
|Arguments|||
|---|---|---|
|type|[ColourTypeDUI](../../flags/#colourtypedui)|

Returns a `number` which can used as the `colour` in many methods.

## `window.GetFontCUI(type)`
|Arguments|||
|---|---|---|
|type|[FontTypeCUI](../../flags/#fonttypecui)|

Returns a `string` which can be passed directly to [IJSGraphics WriteText](../../interfaces/IJSGraphics/#writetexttext-font-colour-x-y-w-h-text_alignment-paragraph_alignment-word_wrapping).

!!! example
	```js
	var font = window.GetFontCUI(0);
	var colour = ...

	function on_paint(gr) {
		gr.WriteText("some text", font, colour, 0, 0, window.Width, window.Height);
	}
	```

The string is actually stringified `JSON` so it may look something like this:

!!! example
	```json
	{
		"Name": "Segoe UI",
		"Size": 16,
		"Style": 0,
		"Weight": 400
	}
	```

See [DWRITE_FONT_STYLE](../../flags/#dwrite_font_style) and [DWRITE_FONT_WEIGHT](../../flags/#dwrite_font_weight) for more info.

If you want to access/change any properties, you can use `JSON.parse`.

!!! example
	```js
	var font = window.GetFontCUI(0);
	var obj = JSON.parse(font);

	// double the size but keep other properties the same
	obj.Size = obj.Size * 2;

	// stringify the updated object
	font = JSON.stringify(obj);
	```

## `window.GetFontDUI(type)`
|Arguments|||
|---|---|---|
|type|[FontTypeDUI](../../flags/#fonttypedui)|

See above for the return value.

## `window.GetProperty(name[, default_value])`
|Arguments|||
|---|---|---|
|name|`string`|
|default_value|`string`,`number`,`boolean`|Default `null`.|

Returns the value of `name` from the panel properties. If no value is
present and `default_value` is not `null` or `undefined`, it will be
stored and returned.

!!! example
	```js
	// ==PREPROCESSOR==
	// @name "ColourPicker + Persistent Properties"
	// @author "marc2003"
	// @import "%fb2k_component_path%helpers.txt"
	// ==/PREPROCESSOR==

	var default_colour = RGB(255, 0, 0);

	// Default colour is used on first run, otherwise colour
	// saved on previous use.
	var colour = window.GetProperty('BASIC.COLOUR.PICKER.COLOUR', default_colour);

	function on_paint(gr) {
		gr.FillRectangle(0, 0, window.Width, window.Height, colour);
		gr.FillRectangle(0, 0, window.Width, 24, RGB(0, 0, 0));
		gr.WriteText('Click to open ColourPicker', '', RGB(255, 255, 255), 0, 0, window.Width, 24, 2, 0);
	}

	function on_mouse_lbtn_up() {
		colour = utils.ColourPicker(colour);

		/*
		Save the new colour and it will be read the next
		time the script starts. These properties are stored
		as part of your layout either in theme.fth (Default UI)
		or foo_ui_columns.cfg (Columns UI),
		*/
		window.SetProperty('BASIC.COLOUR.PICKER.COLOUR', colour);
		window.Repaint();
	}
	```

## `window.NotifyOthers(name, info)`
|Arguments|||
|---|---|---|
|name|`string`|
|info|`string`, `number`, `array`, `object`|

Listen for notifications in other panels with [on_notify_data](../../callbacks/#on_notify_dataname-info).

## `window.Reload([clear_properties])`
|Arguments|||
|---|---|---|
|clear_properties|`boolean`|Default `false`.|

No return value.

## `window.Repaint()`
No return value.

## `window.RepaintRect(x, y, w, h)`
No return value.

!!! note
	Use this instead of `window.Repaint` on frequently updated areas
	such as time, bitrate, seekbar, etc.

## `window.SetCursor(id)`
|Arguments|||
|---|---|---|
|id|[SetCursorID](../../flags/#setcursor-values)|Use `-1` if you want to hide the cursor.|

No return value.

!!! note
	This would usually be used inside the [on_mouse_move](../../callbacks/#on_mouse_movex-y-mask) callback.

## `window.SetInterval(func, delay)`
|Arguments|||
|---|---|---|
|function|`function`|
|delay|`number`|milliseconds

The return value is the `timerID` which can be used
to cancel it.

Creates a timer that will run indefinitely unless cancelled.

!!! example
	```js
	// This runs every 500ms forever because the return
	// was ignored!
	window.SetInterval(function () {
		// do something
	}, 500);
	```

## `window.SetProperty(name, value)`
|Arguments|||
|---|---|---|
|name|`string`|
|value|`string`,`number`,`boolean`|

No return value.

Sets a persistent property value. To remove an existing property, you
can supply `null` as the `value`.

See [window.GetProperty](#windowgetpropertyname-default_value) for an example.

## `window.SetTimeout(func, delay)`
|Arguments|||
|---|---|---|
|function|`function`|
|delay|`number`|milliseconds

The return value is the `timerID` which can be used
to cancel it.

!!! example
	```js
	window.SetTimeout(function () {
		// code here will run after 10 seconds, once.
	}, 10000);
	```

## `window.SetTooltipFont(font_name, font_size_px)`
|Arguments|||
|---|---|---|
|font_name|`string`||
|font_size_px|`number`||

No return value.

## `window.ShowConfigure()`

No return value.

Shows the [Configuration Window](../../configuration-window).

## `window.ShowProperties()`

No return value.

Shows the `Properties Window` of the current panel.
