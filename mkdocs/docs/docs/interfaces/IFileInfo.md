This lets you iterate every available tag in a handle
without knowing their name in advance.

!!! example
	```js
	var handle = fb.GetFocusItem();

	var obj = {};
	var f = handle.GetFileInfo();

	for (var i = 0; i < f.MetaCount; i++) {
		var name = f.MetaName(i).toUpperCase();
		obj[name] = [];

		var num = f.MetaValueCount(i);
		for (var j = 0; j < num; j++) {
			obj[name].push(f.MetaValue(i, j));
		}
	}

	console.log(JSON.stringify(obj, null, 4));
	```

	``` markdown title="Example output"
	{
		"ALBUM": [
			"Chairlift at 6:15"
		],
		"ARTIST": [
			"Chairlift"
		],
		"DATE": [
			"2012-10-28"
		],
		"MUSICBRAINZ_ALBUMID": [
			"bc96af2e-11e9-4abe-a75b-2b91a5eff027"
		],
		"MUSICBRAINZ_ARTISTID": [
			"a3cd61ef-7fd4-44af-a27f-99641a82b22b"
		],
		"MUSICBRAINZ_RELEASEGROUPID": [
			"cb2114a7-87fb-44ea-8931-766b75840683"
		],
		"MUSICBRAINZ_RELEASETRACKID": [
			"008578a0-3188-31e5-887a-27194cecb069"
		],
		"MUSICBRAINZ_TRACKID": [
			"57632bd4-185d-40be-9c95-c3d690c697af"
		],
		"RELEASETYPE": [
			"EP"
		],
		"TITLE": [
			"I Belong in Your Arms (Japanese version)"
		],
		"TOTALTRACKS": [
			"6"
		],
		"TRACKNUMBER": [
			"6"
		]
	}
	```

**Properties**

||||
|---|---|---|
|MetaCount|`number`|read|
|InfoCount|`number`|read|

!!! example
	```js
	console.log(f.MetaCount);
	console.log(f.InfoCount);
	```

**Methods**

## `Dispose()`

No return value.

## `InfoFind(name)`
|Arguments|||
|---|---|---|
|name|`string`|

Returns a `number` to indicate the info index or `-1` on failure.

## `InfoName(idx)`
|Arguments|||
|---|---|---|
|idx|`number`|

Returns a `string`.

## `InfoValue(idx)`
|Arguments|||
|---|---|---|
|idx|`number`|

Returns a `string`.

## `MetaFind(name)`
|Arguments|||
|---|---|---|
|name|`string`|

Returns a `number` to indicate the metadata index or `-1` on failure.

## `MetaName(idx)`
|Arguments|||
|---|---|---|
|idx|`number`|

Returns a `string`.

!!! note
	The case of the tag name returned can be different depending on tag type so using `toLowerCase()` or `toUpperCase()` on the result is recommended.

## `MetaValue(idx, vidx)`
|Arguments|||
|---|---|---|
|idx|`number`|
|vidx|`number`|

Returns a `string`.

## `MetaValueCount(idx)`
|Arguments|||
|---|---|---|
|idx|`number`|

Returns a `number`.
