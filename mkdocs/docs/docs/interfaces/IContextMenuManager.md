**Methods**

## `BuildMenu(menu, base_id)`
|Arguments|||
|---|---|---|
|menu|[IMenuObj](../IMenuObj)|
|base_id|`number`|

No return value.

## `Dispose()`

No return value.

## `ExecuteByID(id)`
|Arguments|||
|---|---|---|
|id|`number`|

Returns a `boolean` value.
## `InitContext(handle_list)`
|Arguments|||
|---|---|---|
|handle_list|[IMetadbHandleList](../IMetadbHandleList)|

No return value.

## `InitContextPlaylist()`

No return value.

Shows playlist specific options that aren't available when passing a handle list to `InitContext`.

## `InitNowPlaying()`

No return value.

!!! example
	```js
	// click panel to see context menu for playing track
	function on_mouse_lbtn_up(x, y) {
		var menu = window.CreatePopupMenu();
		var context = fb.CreateContextMenuManager();

		if (fb.IsPlaying) {
			context.InitNowPlaying();
			context.BuildMenu(menu, 1);
		}

		var idx = menu.TrackPopupMenu(x, y);
		if (idx > 0) {
			context.ExecuteByID(idx - 1);
		}

		menu.Dispose();
		context.Dispose();
	}
	```
