**Methods**

## `AppendMenuItem(flags, item_id, text)`
|Arguments|||
|---|---|---|
|flags|[AppendMenuItem Flags](../../flags/#appendmenuitem-flags)|
|item_id|`number`|Must not be zero. Each id must be unique.|
|text|`string`|

No return value.

## `AppendMenuSeparator()`
No return value.

## `AppendTo(parentMenu, flags, text)`
|Arguments|||
|---|---|---|
|parentMenu|[IMenuObj](../IMenuObj)|
flags|[AppendMenuItem Flags](../../flags/#appendmenuitem-flags)|
|text|`string`|

No return value.

## `CheckMenuItem(item_id, check)`
|Arguments|||
|---|---|---|
|item_id|`number`|
|check|`boolean`|

No return value.

## `CheckMenuRadioItem(first_item_id, last_item_id, selected_item_id)`
|Arguments|||
|---|---|---|
|first_item_id|`number`|
|last_item_id|`number`|
|selected_item_id|`number`|

No return value.

## `Dispose()`
No return value.

## `TrackPopupMenu(x, y[, flags])`
|Arguments|||
|---|---|---|
|x|`number`|
|y|`number`|
|flags|[TrackPopupMenu Flags](../../flags/#trackpopupmenu-flags)|Default `0`.|

Returns a `number`.
