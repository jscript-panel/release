This will be used in the examples below:

```js
var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
```

You can create an empty handle list with [fb.CreateHandleList](../../namespaces/fb/#fbcreatehandlelisthandle).
```js
var handle_list = fb.CreateHandleList();
```

If you need to create a handle list from a single handle, you can do this...
```js
var handle = fb.GetFocusItem();
if (handle) {
	var handle_list = fb.CreateHandleList(handle);
}
```

**Properties**

||||
|---|---|---|
Count|`number`|read|

**Methods**

## `AddItem(handle)`
|Arguments|||
|---|---|---|
|handle|[IMetadbHandle](../IMetadbHandle)|

No return value.

## `AddItems(handle_list)`
|Arguments|||
|---|---|---|
|handle_list|[IMetadbHandleList](../IMetadbHandleList)|

No return value.

## `AttachImage(image_path[, art_id])`
|Arguments|||
|---|---|---|
|image_path|`string`|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|

No return value.

Any errors such as invalid path, corrupt image,
target file type not supporting embedded art, etc
should all silently fail. A progress dialog
will be shown for larger file selections. Any
existing artwork of the specified type will be
overwritten. There is no need to remove it first.

!!! example
	```js
	var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
	if (handle_list.Count > 0) {
		var image_path = "C:\\path\\to\\image.jpg";
		handle_list.AttachImage(image_path, 0);
	}
	handle_list.Dispose();
	```

## `CalcTotalDuration()`
Returns total in seconds.

## `CalcTotalSize()`
Returns total in bytes.

## `Clone()`
Returns an [IMetadbHandleList](../IMetadbHandleList) instance.

!!! example
	```js
	var handle_list2 = handle_list.Clone();
	```

## `CopyToClipboard()`

Returns a `boolean` value.

!!! example
	===  "Copy playlist items"
		```js
		var handle_list = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
		handle_list.CopyToClipboard();
		handle_list.Dispose();
		```

	=== "Cut playlist items"
		```js
		// To "cut" playlist items, we need to check there are
		// no locks in place preventing removal.

		var PlaylistLockFilterMask = {
			filter_add : 1,
			filter_remove: 2,
			filter_reorder: 4,
			filter_replace: 8,
			filter_rename: 16,
			filter_remove_playlist: 32,
			filter_default_action: 64
		};

		var ap = plman.ActivePlaylist;
		var mask = plman.GetPlaylistLockFilterMask(ap);

		if (!(mask & PlaylistLockFilterMask.filter_remove)) {
			var handle_list = plman.GetPlaylistSelectedItems(ap);
			if (handle_list.CopyToClipboard()) {
				plman.UndoBackup(ap);
				plman.RemovePlaylistSelection(ap);
			}
			handle_list.Dispose();
		}
		```

## `DoDragDrop(effect)`
|Arguments|||
|---|---|---|
|effect|`number`|

Returns a `number`.

## `Dispose()`
No return value.

## `Find(handle)`
|Arguments|||
|---|---|---|
|handle|[IMetadbHandle](../IMetadbHandle)|

Returns position of handle or `-1` on failure.

## `GetItem(index)`
|Arguments|||
|---|---|---|
|index|`number`|

Returns an [IMetadbHandle](../IMetadbHandle) instance.

!!! example
	```js
	var handle = handle_list.GetItem(0);
	```

## `GetLibraryRelativePaths()`

Returns a `VBArray` so you need to use `.toArray()` on the result.

This is useful for creating an `Album List` like script in
`folder structure` mode where you'd like the monitored music
folder removed from the path of each handle list item.

!!! example
	If the [foobar2000](https://foobar2000.org) Media Library is
	configured to watch `D:\Music\` and the path of
	the first item in the handle list is

	`D:\Music\Albums\Artist\Some Album\Some Song.flac`

	then...

	```js
	var handle_list = fb.GetLibraryItems();
	handle_list.SortByRelativePath();
	var relative_paths = handle_list.GetLibraryRelativePaths().toArray();
	console.log(relative_paths[0]);
	// Albums\Artist\Some Album\Some Song.flac
	```

## `GetOtherInfo()`

This returns a `JSON` object in string form so you need to
use `JSON.parse` on the result. It provides all the information
viewable on the `Details` tab in the main `Properties` dialog. This
can be technical/location info as well as database fields
from 3rd party components if present.

!!! example
	```js
	var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
	var str = handle_list.GetOtherInfo();
	console.log(str);
	```

	``` markdown title="Example output"
	{
		"General": {
			"Avg. bitrate": "259 kbps",
			"Channels": "2",
			"Codec": "MP3 (82.5%); AAC (17.5%)",
			"Codec profile": "MP3 VBR V0 (39.1%); MP3 CBR (24.3%); AAC LC (17.5%); MP3 VBR V2 (11.7%); MP3 VBR (3.9%); MP3 ABR (3.5%)",
			"Duration": "5:24:44.445 (859 264 046 samples)",
			"Encoding": "lossy",
			"Sample rate": "44100 Hz",
			"Tag type": "id3v2.4 (82.5%)",
			"Tool": "LAME3.97 (27.6%); LAME3.99r (13.7%); LAME3.90 (7.4%); LAME3.98r (5.5%); LAME3.99 (5.4%); Lavf (4.7%); LAME3.97b (3.8%); LAME3.98b (3.5%); LAME3.96r (1.2%); LAME3.100 (1.1%)"
		},
		"Location": {
			"File names": "Bat For Lashes - Clouds.mp3, Bat For Lashes - Daphne.m4a, Bat For Lashes - Lumen.m4a, Bat For Lashes - Plan The Escape.mp3 ...",
			"Folder name": "E:\\Music\\Tracks",
			"Last modified": "2021-12-01 00:00:00",
			"Total size": "601 MB (631 125 587 bytes)"
		}
	}
	```

## `GetQueryItems(query)`
|Arguments|||
|---|---|---|
|query|`string`|

Returns an [IMetadbHandleList](../IMetadbHandlelist) instance.

!!! note
	Errors will be thrown on invalid queries so if you're not
	using predefined safe queries and are accepting user
	input, you should use this inside a try/catch statement.
	An empty handle list will be returned if the query is valid but there are no results.

## `InsertItem(index, handle)`
|Arguments|||
|---|---|---|
|index|`number`|
|handle|[IMetadbHandle](../IMetadbHandle)|

No return value.

!!! example
	```js
	var handle = ...
	handle_list.InsertItem(0, handle);
	```

## `InsertItems(index, handle_list)`
|Arguments|||
|---|---|---|
|index|`number`|
|handle_list|[IMetadbHandleList](../IMetadbHandleList)|

No return value.

## `MakeDifference(handle_list)`
|Arguments|||
|---|---|---|
|handle_list|[IMetadbHandleList](../IMetadbHandleList)|

No return value.

!!! example
	```js
	var one = plman.GetPlaylistItems(0);
	var two = plman.GetPlaylistItems(1);
	one.MakeDifference(two);
	```

`one` now only contains handles that were unique to `one`. Anything
that also existed in `two` will have been removed. The order of
items in `one` will be randomised. `two` should be untouched.

## `MakeIntersection(handle_list)`
|Arguments|||
|---|---|---|
|handle_list|[IMetadbHandleList](../IMetadbHandleList)|

No return value.

!!! example
	```js
	var one = plman.GetPlaylistItems(0);
	var two = plman.GetPlaylistItems(1);
	one.MakeIntersection(two);
	```

`one` now only contains handles that were in BOTH `one`
AND `two`. The order of items in `one` will be randomised.
`two` should be untouched.

## `OptimiseFileLayout([minimise])`
|Arguments|||
|---|---|---|
|minimise|`boolean`|Default `false`.|

No return value.

With `minimise` set to `false`, provides the functionality
of `Utilities>Optimize file layout` or if `minimise`
is `true` then `Utilities>Optimize file layout + minimize file size`.
Unlike the context menu versions, there is no prompt.

## `Randomise()`
No return value.

## `RemoveAll()`
No return value.

## `RemoveAttachedImage([art_id])`
|Arguments|||
|---|---|---|
|art_id|[AlbumArtId](../../flags/#albumartid)|Default `0`.|

No return value.

## `RemoveAttachedImages()`
No return value.

## `RemoveByIdx(idx)`
|Arguments|||
|---|---|---|
|idx|`number`|

No return value.

!!! example
	```js
	handle_list.RemoveByIdx(0);
	```

## `RemoveDuplicates()`
No return value.

## `RemoveDuplicatesByFormat(pattern)`
|Arguments|||
|---|---|---|
|pattern|`string`|

No return value.

!!! example
	```js
	// This ensures the handle list will
	// contain no more than 1 track by the same artist.
	var handle_list = fb.GetLibraryItems();
	handle_list.Randomise();
	handle_list.RemoveDuplicatesByFormat("%artist%");
	```


## `RemoveFromIdx(from, num)`
|Arguments|||
|---|---|---|
|from|`number`|
|num|`number`|

No return value.

## `ReplaceItem(index, handle)`
|Arguments|||
|---|---|---|
|index|`number`|
|handle|[IMetadbHandle](../IMetadbHandle)|

No return value.

## `RunContextCommand(command)`
|Arguments|||
|---|---|---|
|command|`string`|The full path to the command must be supplied. Case is not important.|

Returns `true` if a matching command was found, `false` otherwise.

## `SaveAs(path)`
|Arguments|||
|---|---|---|
|path|`string`|

No return value.

Saves using native [foobar2000](https://foobar2000.org) `.fpl`
format so you should use that as the file extension. The
parent folder must already exist.

!!! example
	```js
	plman.GetPlaylistItems(plman.ActivePlaylist).SaveAs("z:\\blah.fpl");
	```

## `SortByFormat(pattern, direction)`
|Arguments|||
|---|---|---|
|pattern|`string`|
|direction|`number`|Ascending while > `0`.|

No return value.

!!! example
	```js
	var handle_list = fb.GetLibraryItems();
	var pattern = "%album artist%|%date%|%album%|%discnumber%|%tracknumber%";
	handle_list.SortByFormat(pattern, 1);
	```

## `SortByPath()`
No return value.

## `SortByRelativePath()`
No return value.

!!! note
	This method should only be used on a handle list containing items that are
	monitored as part of the `Media Library`.

## `UpdateFileInfoFromJSON(str)`
|Arguments|||
|---|---|---|
|str|`string`|

This method takes either an `array` or an `object` as the argument
and this must be ran through the `JSON.stringify` function before using.

!!! example
	=== "Array"
		This example uses an `array` and its length must match the
		`handle list` count. A fail safe way of doing this is
		looping through the `handle list` and filling the array as you go.

		```js
		// assume we've selected one album
		var handle_list = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);

		// an empty array
		var arr = [];

		for (var i = 0; i < handle_list.Count; i++) {
			// Each element of the array must be an object
			// of key names/values, indicated by the curly braces.
			arr.push({
				"tracknumber" : i + 1,
				"totaltracks" : handle_list.Count,
				"album" : "Greatest Hits", // a simple string for a single value
				"genre" : ["Rock", "Hard Rock"] // use an array for multi-value tags
			});
		}

		var str = JSON.stringify(arr);

		handle_list.UpdateFileInfoFromJSON(str);
		handle_list.Dispose();
		```

	=== "Object"
		If you want to write the exact same tags to each and every track in the
		`handle list`, you can use an `object` instead.

		```js
		var handle_list = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);

		var obj = {
			"album" : "Greatest Hits",
			"genre" : ["Rock", "Hard Rock"]
		};

		var str = JSON.stringify(obj);
		handle_list.UpdateFileInfoFromJSON(str);
		handle_list.Dispose();
		```

As before, you can use blank values to clear any existing tags.

!!! example
	```js
	var obj = {
		"album" : ""
	};
	```

Do not try using any method of using empty objects or blank tag names to
avoid tagging any files. You should filter your `handle list` first
to make sure it only contains files you really want to update.
