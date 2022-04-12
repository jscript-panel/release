This will be used in the examples below:
```js
var tooltip = window.CreateTooltip();
```

**Properties**

||||
|---|---|---|
|Text|`string`|read, write|
|TrackActivate|`boolean`|write|

!!! example
	```js
	tooltip.Text = "Whoop";
	```

**Methods**
## `Activate()`

No return value.

!!! note
	Only call this when text has changed otherwise it will flicker.

!!! example
	```js
	var text = "...";
	if (tooltip.Text != text) {
		tooltip.Text = text;
		tooltip.Activate();
	}
	```

## `Deactivate()`

No return value.

## `SetMaxWidth(width)`
|Arguments|||
|---|---|---|
|width|`number`|

No return value.

Use if you want multi-line tooltips.

!!! example
	```js
	tooltip.SetMaxWidth(800);

	// Use \n as a new line separator.
	tooltip.Text = "Line1\nLine2";
	```

## `TrackPosition(x, y)`
|Arguments|||
|---|---|---|
|x|`number`|
|y|`number`|

No return value.

!!! note
	Check x, y positions have changed from last time otherwise it will flicker. If making the tooltip
	text relative to the mouse position, you must add offsets so there is no danger of it being
	behind the mouse pointer.

!!! example
	```js
	var g_tooltip = window.CreateTooltip();
	var g_trackingMouse = false;
	var g_oldX, g_oldY;

	function on_mouse_move(x, y) {
		if (!g_trackingMouse) {
			g_tooltip.Activate();
			g_tooltip.TrackActivate = true;
			g_trackingMouse = true;
		}

		// Make sure the position is changed
		if (g_oldX != x || g_oldY != y) {
			g_tooltip.Text = "x:" + x + ", y:" + y;

			// add offsets here
			g_tooltip.TrackPosition(x + 20, y + 20);
			g_oldX = x;
			g_oldY = y;
		}
	}

	function on_mouse_leave() {
		g_trackingMouse = false;
		g_tooltip.TrackActivate = false;
	}
	```
