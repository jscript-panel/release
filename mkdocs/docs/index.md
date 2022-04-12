---
hide: navigation
---

!!! note
	This is not available yet. I'm just putting the docs online so
	people can take a peek at the changes.

This component for [foobar2000](https://foobar2000.org) is based on [WSH Panel Mod](https://code.google.com/archive/p/foo-wsh-panel-mod/).

It allows the creation of customisable panels that can be written with `JavaScript` rather than the `C++` required by the [foobar2000 SDK](https://www.foobar2000.org/SDK).

Under the hood, it uses `Windows Script Host`. It is possible to use `ActiveX` objects like `WScript.Shell` to run external apps, etc.

Note that JS language support is limited to `ECMAScript 5`. Nothing newer will ever be supported.

Here are just some of the features provided by the component...

* Custom drawing of text, external images, lines, rectangles, etc.
* Use fonts/colours from the main preferences of whichever user interface you are using.
* Executing main/context menu commands.
* Ability to create custom buttons/menus.
* Capture keystrokes/mouse movement/clicks.
* [Callbacks](docs/callbacks) can be used to trigger code based on [foobar2000](https://foobar2000.org) events.
* Read/[write](docs/interfaces/IMetadbHandleList/#updatefileinfofromjsonstr) file tags.
* Complete manipulation of playlists.
* Media Library display/sorting/filtering
* [Save settings](docs/namespaces/window/#windowgetpropertyname-default_value) on a per panel basis. These persist between restarts and are stored inside the layout configuration file for whichever UI your are using. You can also write your own functions to load/save settings from `JSON` or plain text files.
* [Built in support](docs/namespaces/utils/#utilshttprequestasyncwindow_id-type-url-user_agent_or_headers-post_data-content_type) for making `GET / POST` requests which return plain text and there is also a method for downloading binary files. If you prefer, you can use the `Microsoft.XMLHTTP` `ActiveX` object.
* And much more...
