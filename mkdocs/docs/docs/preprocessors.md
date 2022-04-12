# Preprocessors

Using a preprocessor section is not mandatory but it is useful for identifying scripts and loading external files so common code can be reused without having to update each panel instance.

The section should start with `==PREPROCESSOR==` and end with `==/PREPROCESSOR==`.

```
// ==PREPROCESSOR==
// ...
// ==/PREPROCESSOR==
```

A full example might look something like this:
```
// ==PREPROCESSOR==
// @name "my sooper dooper script"
// @author "marc"
// @version "0.1"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_profile_path%scripts\main.js"
// ==/PREPROCESSOR==
```

Each directive is case sensitive. It should be started with `@` and placed into a single comment.

```
// @directive "value here"
```

## Directives

### Name
```
// @name "name"
```

!!! note
	If you set a name here, it's also available in script via `window.Name`. You can use it to prefix console messages or use for titles on various dialog boxes.

### Version
```
// @version "version"
```

### Author
```
// @author "author"
```

### Import
```
// @import "path"
```

Load external script from `path`. These files should be `UTF8` only. You can place `%fb2k_component_path%` or `%fb2k_profile_path%` in to `path`. They will be expanded while parsing.
