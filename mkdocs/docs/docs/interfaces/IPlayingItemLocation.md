**Properties**

||||
|---|---|---|
IsValid|`boolean`|read|
PlaylistIndex|`number`|read|
PlaylistItemIndex|`number`|read|

`IsValid` will always be `false` if [foobar2000](https://foobar2000.org) isn't playing. It can
also be `false` if the playing track has since been removed from the playlist it was on when playback was started.

!!! example
	```js
	var playing_item_location = plman.GetPlayingItemLocation();
	if (playing_item_location.IsValid) {
		console.log(playing_item_location.PlaylistIndex);
		console.log(playing_item_location.PlaylistItemIndex);
	}
	```
