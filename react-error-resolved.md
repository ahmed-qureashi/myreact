# 🚨 Error Encountered and Resolved in React Project

## 📝 Error:

When running the React app, the following issue occurred:

``` bash
Attempted import error: 'DynamicPage' is not exported from './component/todo'.
```

------------------------------------------------------------------------

## 🔍 Root Cause:

-   In **`src/component/todo.js`**, the component `DynamicPage` was
    defined but **not exported**.\
-   Meanwhile, in **`App.js`**, the component was being imported like
    this:

``` js
import { DynamicPage } from './component/todo';
```

Since no export was present in `todo.js`, React could not find
`DynamicPage`.

------------------------------------------------------------------------

## ✅ Resolution:

### Option 1 --- **Named Export**

Add a named export in `todo.js`:

``` js
function DynamicPage() {
  // component logic
}

export { DynamicPage };
```

And import with curly braces in `App.js`:

``` js
import { DynamicPage } from './component/todo';
```

------------------------------------------------------------------------

### Option 2 --- **Default Export**

Add a default export in `todo.js`:

``` js
function DynamicPage() {
  // component logic
}

export default DynamicPage;
```

And import without curly braces in `App.js`:

``` js
import DynamicPage from './component/todo';
```

------------------------------------------------------------------------

## 🎯 Lesson Learned:

-   **Named exports** require `{}` during import.\
-   **Default exports** don't require `{}` and can be imported with any
    name.\
-   Always ensure the component is exported before importing it in
    another file.
