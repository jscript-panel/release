## v3.0.0

### Removed features

- There is no longer a playback stats database.
- There are no edge style or pseudo transparent options in `Columns UI`.
- Panels cannot be added as toolbars in `Columns UI`.
- Support for `WebP` images is no longer baked in to the component. Now
it relies on the `Windows Imaging Component`. `Windows 10/11` users
should have `WebP` extensions already installed by default from the
`Windows Store`. If you're really averse to using the store or are
running `Windows 7/8/8.1`, you can install [this](https://storage.googleapis.com/downloads.webmproject.org/releases/webp/WebpCodecSetup.exe) to enable `WebP`
support. Like `Columns UI` and `Spider Monkey Panel`, using the
`Windows Imaging Component` opens up the possibility of using more
exotic formats like `HEIF` and `AVIF`. Extensions for these and more
can be installed via the `Windows Store` on `Windows 10/11`.

### Removal of `gdi`

There is no longer a `gdi` namespace. Those methods have
been replaced as follows:

|Old|New
|---|---|
|gdi.CreateImage|[utils.CreateImage](../namespaces/utils/#utilscreateimagewidth-height)|
|gdi.Font|Stringified `JSON`|
|gdi.Image|[utils.LoadImage](../namespaces/utils/#utilsloadimagepath)|
|gdi.LoadImageAsync|[utils.LoadImageAsync](../namespaces/utils/#utilsloadimageasyncwindow_id-path)|

### Removal of `IGdiGraphics`

The replacement is [IJSGraphics](../interfaces/IJSGraphics) which uses `DirectWrite` instead
of `Gdiplus`. This means pretty much every method has changed.

Since `GdiDrawText` and `DrawString` no longer exist, the new method that needs the most
attention is [WriteText](../interfaces/IJSGraphics/#writetexttext-font-colour-x-y-w-h-text_alignment-paragraph_alignment-word_wrapping).

### Removal of `IGdiBitmap`

Since `Gdiplus` is no longer used, the `Windows Imaging Component` is used for all
image handling. I've managed to transfer most but not all previous functionality.

The main omission is `ApplyMask` which I've not been able to rewrite. See
[IJSImage](../interfaces/IJSImage) for full details.

### Renamed/moved methods

This list may be incomplete.

|Old|New|Notes
|---|---|---|
|fb.AcquireUiSelectionHolder|[fb.AcquireSelectionHolder](../namespaces/fb/#fbacquireselectionholder)|
|fb.CopyHandleListToClipboard|[IMetadbHandleList CopyToClipboard](../interfaces/IMetadbHandleList/#copytoclipboard)|
|fb.CreateProfiler|[utils.CreateProfiler](../namespaces/utils/#utilscreateprofilername)|
|fb.DoDragDrop|[IMetadbHandleList DoDragDrop](../interfaces/IMetadbHandleList/#dodragdropeffect)|
|fb.GetQueryItems|[IMetadbHandleList GetQueryItems](../interfaces/IMetadbHandleList/#getqueryitemsquery)|
|fb.GetSelections|[fb.GetSelection](../namespaces/fb/#fbgetselectionflags)|This replaces the old fb.GetSelection|
|fb.IsMetadbInMediaLibrary|[IMetadbHandle IsInLibrary](../interfaces/IMetadbHandle/#isinlibrary)|
|fb.RunContextCommandWithMetadb|[IMetadbHandleList RunContextCommand](../interfaces/IMetadbHandleList/#runcontextcommandcommand)|
|fb.ShowPopupMessage|[utils.ShowPopupMessage](../namespaces/utils/#utilsshowpopupmessagemessage-title)|
|plman.PlaylistItemCount|[plman.GetPlaylistItemCount](../namespaces/plman/#plmangetplaylistitemcountplaylistindex)|
|utils.Chardet|[utils.DetectCharset](../namespaces/utils/#utilsdetectcharsetpath)|
|utils.GetAlbumArtAsync|[IMetadbHandle GetAlbumArtAsync](../interfaces/IMetadbHandle/#getalbumartasyncwindow_id-art_id-want_stub)|
|utils.GetAlbumArtEmbedded|[IMetadbHandle GetAlbumArtEmbedded](../interfaces/IMetadbHandle/#getalbumartembeddedart_id)|
|utils.GetAlbumArtV2|[IMetadbHandle GetAlbumArt](../interfaces/IMetadbHandle/#getalbumartart_id-want_stub)|
|utils.GetRequestAsync, utils.PostRequestAsync|[utils.HTTPRequestAsync](../namespaces/utils/#utilshttprequestasyncwindow_id-type-url-user_agent_or_headers-post_data-content_type)|
|window.InstanceType|[window.IsDefaultUI](../namespaces/window/)|Now returns a `boolean` value|
|IMetadbHandleList Add|[IMetadbHandleList AddItem](../interfaces/IMetadbHandleList/#additemhandle)
|IMetadbHandleList AddRange|[IMetadbHandleList AddItems](../interfaces/IMetadbHandleList/#additemshandle_list)|
|IMetadbHandleList Insert|[IMetadbHandleList InsertItem](../interfaces/IMetadbHandleList/#insertitemindex-handle)|
|IMetadbHandleList InsertRange|[IMetadbHandleList InsertItems](../interfaces/IMetadbHandleList/#insertitemsindex-handle_list)|
|IMetadbHandleList Item|[IMetadbHandleList GetItem](../interfaces/IMetadbHandleList/#getitemindex), [IMetadbHandleList ReplaceItem](../interfaces/IMetadbHandleList/#replaceitemindex-handle)|
|IMetadbHandleList OrderByFormat|[IMetadbHandleList SortByFormat](../interfaces/IMetadbHandleList/#sortbyformatpattern-direction)|
|IMetadbHandleList OrderByPath|[IMetadbHandleList SortByPath](../interfaces/IMetadbHandleList/#sortbypath)|
|IMetadbHandleList OrderByRelativePath|[IMetadbHandleList SortByRelativePath](../interfaces/IMetadbHandleList/#sortbyrelativepath)|

### Methods with changed behaviour

- [gr.DrawImage](../interfaces/IJSGraphics/#drawimageimage-dstx-dsty-dstw-dsth-srcx-srcy-srcw-srch-opacity) (no `angle` parameter, `alpha` has been replaced by `opacity` which
takes values between `0` and `1`).
- [fb.CreateMainMenuManager](../namespaces/fb/#fbcreatemainmenumanagerroot_name) now takes a `name` parameter for `File`, `Edit`, `View` etc
and the returned `IMainMenuManager` object no longer has an `Init` method.
- [IMetadbHandleList RemoveDuplicatesByFormat](../interfaces/IMetadbhandleList/#removeduplicatesbyformatpattern) and [IMetadbHandleList SortByFormat](../interfaces/IMetadbhandleList/#sortbyformatpattern-direction)
now take a title format pattern as a `string`.

### Removals with no replacement

- plman.AddPlaylistItemToPlaybackQueue
- plman.EnsurePlaylistItemVisible
- plman.FlushPlaybackQueue
- plman.GetPlaybackQueueHandles
- plman.RemoveItemFromPlaybackQueue
- plman.RemoveItemsFromPlaybackQueue
- plman.SetPlaylistFocusItemByHandle
- utils.MapString
- utils.PathWildcardMatch
- window.IsTransparent
- IMetadbHandleList BSearch
- on_main_menu
- on_playlist_item_ensure_visible

### New additions

- [utils.CreateFolder](../namespaces/utils/#utilscreatefolderpath) (creates all parent folders if necessary)
- [utils.CreateTextLayout](../namespaces/utils/#utilscreatetextlayouttext-font_name-font_size-font_size-font_style-font_stretch-text_aligment-paragraph_aligment-word_wrapping), [gr.WriteTextLayout](../interfaces/IJSGraphics/#writetextlayouttext_layout-colour-x-y-w-h-vertical_offset)
- [utils.GetClipboardText](../namespaces/utils/#utilsgetclipboardtext), [utils.SetClipboardText](../namespaces/utils/#utilssetclipboardtexttext)
- [utils.GetLastModified](../namespaces/utils/#utilsgetlastmodifiedpath)
- [utils.MessageBox](../namespaces/utils/#utilsmessageboxprompt-title-flags)
- [utils.RemovePath](../namespaces/utils/#utilsremovepathpath)
- [gr.FillGradientRectangleAdvanced](../interfaces/IJSGraphics/#fillgradientrectangleadvancedx-y-w-h-str) (allows you to create `D2D` [Linear](https://docs.microsoft.com/en-us/windows/win32/direct2d/direct2d-brushes-overview#using-linear-gradient-brushes) and [Radial](https://docs.microsoft.com/en-us/windows/win32/direct2d/direct2d-brushes-overview#using-radial-gradient-brushes) brushes.)
- [gr.WriteText](../interfaces/IJSGraphics/#writetexttext-font-colour-x-y-w-h-text_alignment-paragraph_alignment-word_wrapping) (supports coloured emoji, styling ranges of text)

### Sample changes

- The `Queue Viewer` and `Playback Buttons` samples have been removed.
- The `Album Art` sample no longer has a `CD Jewel Case` option.
- `JS Smooth Browser` no longer creates playlists on selection changes. To send tracks to the `Library selection` playlist, a group has to be double clicked. The destination playlist name can be changed via the panel properties. As before, groups can be added to existing playlists using the right click>`Add to...` option.
- The default view in `JS Smooth Browser` has been changed to `Column + Album Art` with extra group count and group length info. All previous options are still available via the right click menu.
- The group headers in `JS Smooth Playlist` are no longer collapsable.
