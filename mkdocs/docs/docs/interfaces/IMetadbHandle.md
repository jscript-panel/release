This will be used in the examples below:

```js
var handle = fb.GetFocusItem();
```

!!! note
	In real world code, you should alaways check the return
	values from methods like [fb.GetFocusItem](../../namespaces/fb/#fbgetfocusitem) and
	[fb.GetNowPlaying](../../namespaces/fb/#fbgetnowplaying) are not `null`.

**Properties**

||||
|---|---|---|
|FileSize|`number`|read|
|Length|`number`|read|
|Path|`string`|read|
|RawPath|`string`|read|
|SubSong|`number`|read|

!!! example
	```js
	console.log(handle.Path); // D:\SomeSong.flac
	console.log(handle.RawPath); // file://D:\SomeSong.flac
	```

**Methods**

## `Compare(handle)`
|Arguments|||
|---|---|---|
|handle|[IMetadbHandle](../IMetadbHandle)|

Returns a `boolean` value.

!!! example
	```js
	if (handle.Compare(handle2)) {
		// do something
	}
	```

## `Dispose()`

No return value.

## `GetAlbumArt([art_id, want_stub])`
|Arguments|||
|---|---|---|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|
|want_stub|`boolean`|Default `true`.|

Returns an [IJSImage](../IJSImage) instance or `null` on failure.

!!! note
	This method can return album art from certain radio streams
	if the requested type is `Front`. Use [on_playback_dynamic_info_track](../../callbacks/#on_playback_dynamic_info_tracktype)
	to get notified of stream artwork changes.

!!! example
	```js
	var image = handle.GetAlbumArt();
	if (image != null) {
		// The path is now a property of the image.
		console.log(image.Path);
	}
	```

## `GetAlbumArtAsync(window_id, art_id, want_stub)`
|Arguments|||
|---|---|---|
|window_id|[window.ID](../../namespaces/window)|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|
|want_stub|`boolean`|Default `true`.|

Use in conjunction with [on_get_album_art_done](../../callbacks/#on_get_album_art_donehandle-art_id-image-image_path).

## `GetAlbumArtEmbedded([art_id])`
|Arguments|||
|---|---|---|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|

Returns an [IJSimage](../IJSImage) instance or `null` on failure.

## `GetFileInfo([full_info])`
|Arguments|||
|---|---|---|
|full_info|`boolean`|Default `false`.|

Returns an [IFileInfo](../IFileInfo) instance.

If `full_info` is omitted or `false`, the return value
is always a valid [IFileInfo](../IFileInfo) instance.

If `full_info` is set to `true`, the file is opened
for reading and this may fail and return `null`. Therefore,
you you must always check the return value before using it.

Typically you'd only use `full_info` when you wanted
to access tags that contain large chunks of text such as
`LYRICS` which are usually hidden behind the period character ever
since [foobar2000](https://foobar2000.org) `v1.3` for
performance reasons.

!!! example
	=== "Default"
		```js
		var f = handle.GetFileInfo();

		// No need to check f before using, we know it's valid
		console.log(f.MetaCount);
		```

	=== "Full Info"
		```js
		var f = handle.GetFileInfo(true);
		var lyrics_text = "";

		// Must check.
		if (f) {
			var idx = f.MetaFind("LYRICS");
			if (idx > -1) {
				lyrics_text = f.MetaValue(idx, 0);
			}
		}
		```

## `IsInLibrary()`

Returns a `boolean` value.

## `ShowAlbumArtViewer([art_id, want_stub])`
|Arguments|||
|---|---|---|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|
|want_stub|`boolean`|Default `true`.|

No return value.
