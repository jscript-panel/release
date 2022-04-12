**Properties**

||||
|---|---|---|
|Base|`number`|write|
|Effect|`number`|read,write|
|Playlist|`number`|write|
|ToSelect|`boolean`|write|

To handle incoming files from other panels or Windows Explorer, there are 4 callbacks.

```js
function on_drag_drop(action, x, y, mask) {}
function on_drag_enter(action, x, y, mask) {}
function on_drag_leave() {}
function on_drag_over(action, x, y, mask) {}
```

First we'll look at the `action.Effect` property which is documented here.

[https://docs.microsoft.com/en-gb/windows/win32/com/dropeffect-constants](https://docs.microsoft.com/en-gb/windows/win32/com/dropeffect-constants)

Rather than set variables for `DROPEFFECT_NONE` and `DROPEFFECT_COPY`, I'll just use `0` and `1` in the examples below.

When used inside the `on_drag_over` callback, it can be used to provide feedback to the user as to whether you can drop files there or not. If you set the value to `0`, the mouse pointer will change to show that dropping files is prohibited. To show that dropping files is allowed, we would use the value of `1`.

If you had a playlist viewer script, usage could be as simple as this:

!!! example
	```js
	function on_drag_over(action, x, y, mask) {
		var ap = plman.ActivePlaylist;
		if (plman.PlaylistCount == 0 || ap == -1) {
			// no playlists or active playlist not set
			action.Effect = 0;
		} else if (plman.IsAutoPlaylist(ap)) {
			// autoplaylist, can't drop.
			action.Effect = 0;
		} else {
			// ok, we can drop here.
			action.Effect = 1;
		}
	}
	```

When it comes to handling the dropped files inside `on_drag_drop`, we make use of the `Base`, `Playlist` and `ToSelect` properties listed above.

We can use the exact same logic as before to set `action.Effect` as we need to do this so the `source` of our files gets notified of our intent. We should only ever use values of `0` or `1`.

!!! example
	```js
	function on_drag_drop(action, x, y, mask) {
		var ap = plman.ActivePlaylist;
		if (plman.PlaylistCount == 0 || ap == -1) {
			// no playlists or active playlist not set
			action.Effect = 0;
		} else if (plman.IsAutoPlaylist(ap)) {
			// autoplaylist, can't drop.
			action.Effect = 0;
		} else {
			// use extra properties here
			action.Playlist = ap;
			// append to end
			action.Base = plman.GetPlaylistItemCount(ap);
			action.ToSelect = true;
			action.Effect = 1;
		}
	}
	```
