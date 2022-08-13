Right click any panel>`Configure` to open the `Configuration Window`.

!!! note
	Some scripts may implement their own menu without a `Configure` option. If
	this happens, you can hold down the ++shift+windows++ keys and then right
	click. This always brings up the default menu.

![Configuration Window](../images/configuration_window.png)

!!! note
	As of `v3.1.0` there is no longer a menu. This is because I was not able
	to make it support `Dark Mode`.

Using the `Tools` button you can use the following commands which should be
self-explanatory.

- `Reset`
- `Import`
- `Export`
- `Docs`
- `Releases`
- `About`

Use the `Samples` button to quickly choose any of the included scripts.

`Edge Style` is only available when using `Columns UI`.

## Keyboard shortcuts
|||
|---|---|
|++ctrl+'F'++|Open`Find` dialog|
|++ctrl+'G'++|Open `Go To Line` dialog|
|++ctrl+'H'++|Open `Replace` dialog|
|++ctrl+'S'++|Apply|
|++f3++|Find next|
|++shift+f3++|Find previous|

## Editor Properties

From the main [foobar2000](https://foobar2000.org) `Preferences>Tools>JScript Panel 3`
you can customise the fonts/colours used in the editor above.

![Editor Properties](../images/editor_properties.png)

`style.caret.fore` and `style.selection.back` accept hex colours only.

For all the others, you can combine any of the following options
separated by a comma.

||
|---|
|font:NAME|
|size:PIXELS|
|bold|
|italics|
|fore:HEX_COLOUR|
|back:HEX_COLOUR|

Hex colours must be the full 6 digits like `#FF0000`.
