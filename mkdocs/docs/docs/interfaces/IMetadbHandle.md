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

## `GetFileInfo()`

Returns an [IFileInfo](../IFileInfo) instance.

!!! note
	The previously optional `full_info` argument is no longer necessary
	with [foobar2000](https://foobar2000.org) `v2.0.0`. Any supplied
	value will be ignored.

## `IsInLibrary()`

Returns a `boolean` value.

## `ShowAlbumArtViewer([art_id, want_stub])`
|Arguments|||
|---|---|---|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|
|want_stub|`boolean`|Default `true`.|

No return value.
