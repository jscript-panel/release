All of these are provided in `helpers.txt` bundled with the component. You
can import it like this.

```
// ==PREPROCESSOR==
// @import "%fb2k_component_path%helpers.txt"
// ==/PREPROCESSOR==
```

See [Preprocessors](../preprocessors).

## DWRITE_FONT_WEIGHT
```js
var DWRITE_FONT_WEIGHT_THIN = 100;
var DWRITE_FONT_WEIGHT_EXTRA_LIGHT = 200;
var DWRITE_FONT_WEIGHT_ULTRA_LIGHT = 200;
var DWRITE_FONT_WEIGHT_LIGHT = 300;
var DWRITE_FONT_WEIGHT_SEMI_LIGHT = 350;
var DWRITE_FONT_WEIGHT_NORMAL = 400;
var DWRITE_FONT_WEIGHT_REGULAR = 400;
var DWRITE_FONT_WEIGHT_MEDIUM = 500;
var DWRITE_FONT_WEIGHT_DEMI_BOLD = 600;
var DWRITE_FONT_WEIGHT_SEMI_BOLD = 600;
var DWRITE_FONT_WEIGHT_BOLD = 700;
var DWRITE_FONT_WEIGHT_EXTRA_BOLD = 800;
var DWRITE_FONT_WEIGHT_ULTRA_BOLD = 800;
var DWRITE_FONT_WEIGHT_BLACK = 900;
var DWRITE_FONT_WEIGHT_HEAVY = 900;
var DWRITE_FONT_WEIGHT_EXTRA_BLACK = 950;
var DWRITE_FONT_WEIGHT_ULTRA_BLACK = 950;
```

## DWRITE_FONT_STYLE
```js
var DWRITE_FONT_STYLE_NORMAL = 0;
var DWRITE_FONT_STYLE_OBLIQUE = 1;
var DWRITE_FONT_STYLE_ITALIC = 2;
```

## DWRITE_FONT_STRETCH
```js
var DWRITE_FONT_STRETCH_ULTRA_CONDENSED = 1;
var DWRITE_FONT_STRETCH_EXTRA_CONDENSED = 2;
var DWRITE_FONT_STRETCH_CONDENSED = 3;
var DWRITE_FONT_STRETCH_SEMI_CONDENSED = 4;
var DWRITE_FONT_STRETCH_NORMAL = 5;
var DWRITE_FONT_STRETCH_MEDIUM = 5;
var DWRITE_FONT_STRETCH_SEMI_EXPANDED = 6;
var DWRITE_FONT_STRETCH_EXPANDED = 7;
var DWRITE_FONT_STRETCH_EXTRA_EXPANDED = 8;
var DWRITE_FONT_STRETCH_ULTRA_EXPANDED = 9;
```

## DWRITE_TEXT_ALIGNMENT
```js
var DWRITE_TEXT_ALIGNMENT_LEADING = 0;
var DWRITE_TEXT_ALIGNMENT_TRAILING = 1;
var DWRITE_TEXT_ALIGNMENT_CENTER = 2;
var DWRITE_TEXT_ALIGNMENT_JUSTIFIED = 3;
```

## DWRITE_PARAGRAPH_ALIGNMENT
```js
var DWRITE_PARAGRAPH_ALIGNMENT_NEAR = 0;
var DWRITE_PARAGRAPH_ALIGNMENT_FAR = 1;
var DWRITE_PARAGRAPH_ALIGNMENT_CENTER = 2;
```

## DWRITE_WORD_WRAPPING
```js
var DWRITE_WORD_WRAPPING_WRAP = 0;
var DWRITE_WORD_WRAPPING_NO_WRAP = 1;
var DWRITE_WORD_WRAPPING_EMERGENCY_BREAK = 2;
var DWRITE_WORD_WRAPPING_WHOLE_WORD = 3;
var DWRITE_WORD_WRAPPING_CHARACTER = 4;
```

## DWRITE_TRIMMING_GRANULARITY
```js
var DWRITE_TRIMMING_GRANULARITY_NONE = 0;
var DWRITE_TRIMMING_GRANULARITY_CHARACTER = 1;
var DWRITE_TRIMMING_GRANULARITY_WORD = 2;
```

## WICBitmapTransform
```js
var WICBitmapTransformRotate0 = 0;
var WICBitmapTransformRotate90 = 1;
var WICBitmapTransformRotate180 = 2;
var WICBitmapTransformRotate270 = 3;
var WICBitmapTransformFlipHorizontal = 8;
var WICBitmapTransformFlipVertical = 16;
```

## MessageBox Buttons
```js
var MB_OK = 0;
var MB_OKCANCEL = 1;
var MB_ABORTRETRYIGNORE = 2;
var MB_YESNOCANCEL = 3;
var MB_YESNO = 4;
```

## MessageBox Icons
```js
var MB_ICONHAND = 16;
var MB_ICONQUESTION = 32;
var MB_ICONEXCLAMATION = 48;
var MB_ICONASTERISK = 64;
```

## MessageBox Return Values
```js
var IDOK = 1;
var IDCANCEL = 2;
var IDABORT = 3;
var IDRETRY = 4;
var IDIGNORE = 5;
var IDYES = 6;
var IDNO = 7;
```

## AppendMenuItem Flags
```js
var MF_SEPARATOR = 0x00000800;
var MF_ENABLED = 0x00000000;
var MF_GRAYED = 0x00000001;
var MF_DISABLED = 0x00000002;
var MF_UNCHECKED = 0x00000000;
var MF_CHECKED = 0x00000008;
var MF_STRING = 0x00000000;
var MF_MENUBARBREAK = 0x00000020;
var MF_MENUBREAK = 0x00000040;
// var MF_BITMAP; // do not use
// var MF_OWNERDRAW // do not use
// var MF_POPUP // do not use
```

[https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-appendmenua](https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-appendmenua)

## TrackPopupMenu Flags
```js
var TPM_LEFTALIGN = 0x0000;
var TPM_CENTERALIGN = 0x0004;
var TPM_RIGHTALIGN = 0x0008;
var TPM_TOPALIGN = 0x0000;
var TPM_VCENTERALIGN = 0x0010;
var TPM_BOTTOMALIGN = 0x0020;
var TPM_HORIZONTAL = 0x0000;
var TPM_VERTICAL = 0x0040;
var TPM_HORPOSANIMATION = 0x0400;
var TPM_HORNEGANIMATION = 0x0800;
var TPM_VERPOSANIMATION = 0x1000;
var TPM_VERNEGANIMATION = 0x2000;
var TPM_NOANIMATION = 0x4000;
```

[https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-trackpopupmenu](https://docs.microsoft.com/en-gb/windows/win32/api/winuser/nf-winuser-trackpopupmenu)

## Mouse Mask Values
```js
var MK_LBUTTON = 0x0001;
var MK_RBUTTON = 0x0002;
var MK_SHIFT = 0x0004;
var MK_CONTROL = 0x0008;
var MK_MBUTTON = 0x0010;
var MK_XBUTTON1 = 0x0020;
var MK_XBUTTON2 = 0x0040;
```

## SetCursor Values
```js
var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;
var IDC_WAIT = 32514;
var IDC_CROSS = 32515;
var IDC_UPARROW = 32516;
var IDC_SIZE = 32640;
var IDC_ICON = 32641;
var IDC_SIZENWSE = 32642;
var IDC_SIZENESW = 32643;
var IDC_SIZEWE = 32644;
var IDC_SIZENS = 32645;
var IDC_SIZEALL = 32646;
var IDC_NO = 32648;
var IDC_APPSTARTING = 32650;
var IDC_HAND = 32649;
var IDC_HELP = 32651;
```

## FILE_ATTRIBUTE
```js
var FILE_ATTRIBUTE_READONLY = 0x00000001;
var FILE_ATTRIBUTE_HIDDEN = 0x00000002;
var FILE_ATTRIBUTE_SYSTEM = 0x00000004;
var FILE_ATTRIBUTE_DIRECTORY = 0x00000010;
var FILE_ATTRIBUTE_ARCHIVE = 0x00000020;
var FILE_ATTRIBUTE_NORMAL = 0x00000080;
var FILE_ATTRIBUTE_TEMPORARY = 0x00000100;
var FILE_ATTRIBUTE_SPARSE_FILE = 0x00000200;
var FILE_ATTRIBUTE_REPARSE_POINT = 0x00000400;
var FILE_ATTRIBUTE_COMPRESSED = 0x00000800;
var FILE_ATTRIBUTE_OFFLINE = 0x00001000;
var FILE_ATTRIBUTE_NOT_CONTENT_INDEXED = 0x00002000;
var FILE_ATTRIBUTE_ENCRYPTED = 0x00004000;
// var FILE_ATTRIBUTE_DEVICE // do not use
// var FILE_ATTRIBUTE_VIRTUAL // do not use
```

[http://msdn.microsoft.com/en-us/library/ee332330%28VS.85%29.aspx](http://msdn.microsoft.com/en-us/library/ee332330%28VS.85%29.aspx)

## Keyboard Mask Values
```js
var VK_BACK = 0x08;
var VK_TAB = 0x09;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
```

## AlbumArtId
```js
var AlbumArtId = {
	front : 0,
	back : 1,
	disc : 2,
	icon : 3,
	artist : 4,
};
```

## ColourTypeCUI
```js
var ColourTypeCUI = {
	text : 0,
	selection_text : 1,
	inactive_selection_text : 2,
	background : 3,
	selection_background : 4,
	inactive_selection_background : 5,
	active_item_frame : 6,
};
```

## ColourTypeDUI
```js
var ColourTypeDUI = {
	text : 0,
	background : 1,
	highlight : 2,
	selection : 3,
};
```

## FontTypeCUI
```js
var FontTypeCUI = {
	items : 0,
	labels : 1,
};
```

## FontTypeDUI
```js
var FontTypeDUI = {
	defaults : 0,
	tabs : 1,
	lists : 2,
	playlists : 3,
	statusbar : 4,
	console : 5,
};
```

## PlaylistLockFilterMask
```js
var PlaylistLockFilterMask = {
	filter_add : 1,
	filter_remove : 2,
	filter_reorder : 4,
	filter_replace : 8,
	filter_rename : 16,
	filter_remove_playlist : 32,
	filter_default_action : 64,
};
```

## ReplaygainMode
```js
var ReplaygainMode = {
	None : 0,
	Track : 1,
	Album : 2,
	Track_Album_By_Playback_Order : 3,
};
```

## PlaybackOrder
```js
var PlaybackOrder = {
	Default : 0,
	Repeat_Playlist : 1,
	Repeat_Track : 2,
	Random : 3,
	Shuffle_tracks : 4,
	Shuffle_albums : 5,
	Shuffle_folders : 6,
};
```

## PlaybackQueueOrigin
```js
var PlaybackQueueOrigin = {
	user_added : 0,
	user_removed : 1,
	playback_advance : 2,
};
```

## PlaybackStartingCMD
```js
var PlaybackStartingCMD = {
	default : 0,
	play : 1,
	next : 2,
	prev : 3,
	settrack : 4,
	rand : 5,
	resume : 6,
};
```

## PlaybackStopReason
```js
var PlaybackStopReason = {
	user : 0,
	eof : 1,
	starting_another : 2,
};
```

## SelectionType
```js
var SelectionType = {
	undefined : 0,
	active_playlist_selection : 1,
	caller_active_playlist : 2,
	playlist_manager : 3,
	now_playing : 4,
	keyboard_shortcut_list : 5,
	media_library_viewer : 6,
};
```

## ImageEffect
```js
var ImageEffect = {
	grayscale : 0,
	invert : 1,
	sepia : 2,
};
```
