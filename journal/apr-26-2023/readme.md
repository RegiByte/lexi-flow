## Apr 26 / 20 23

Since the last update I have resolved a couple bugs in the editor that were annoying me,

I talked about this issue in the last update with the floating toolbar / color picker.

```
The FloatingToolbar has a bug, if you select some text the toolbar will show up,
if you click the color picker in the top toolbar the Floating toolbar continues open,
it should close automatically if the editor loses focus, in this case the focus is being moved to the
colors dropdown.
```

After taking a look at lexical original playground I noticed that the floating toolbar is not
hidden when you use one of the dropdown menus in the fixed toolbar so it made sense to me to
keep it open when you click the color picker.

Another problem was that the z-index of the fixed toolbar dropdowns were getting below the floating toolbar
and this means that the color picker would show up behind the floating toolbar, I fixed this by
increasing the z-index of the fixed toolbar.

### Keyboard Support for floating toolbar

I have also added keyboard support for the floating toolbar, you can now use the arrow keys to navigate
between the actions and **Space/Enter** keys to toggle one of the actions, this is really useful for
setting multiple formatting styles at the same time without touching the mouse.

One minor issue is that after toggling a formatting style the floating toolbar will lose focus of the selected button,
that's not a big deal since the user can press **Tab** and come back to focus the button,
But I want to see if we can automatically retrieve the focus of the button after toggling it.


### Floating toolbar bug

I have found another bug in the floating toolbar, if you select some text node until the end and 
move the selection to the right (outside the text node, at the end of the paragraph), you will notice
that the toolbar doesn't show, this is because the selection is not inside the text node anymore,
instead it's inside the paragraph node, it could also be other nodes like a heading node.

For now I added a new rule to check if the selected node is a paragraph or a heading node and if so,
it considers it a text selection and shows the toolbar.

I'm not sure if this is the best approach but it seems to work for now.


### Radix UI components

I have also added some components from Radix UI, I'm using the `Dropdown` component for the dropdowns
and also the `Toolbar` component for the fixed toolbar and floating toolbar.

I know I should probably not include third-party vendor packages as part of my own package,
in the future I want to expose some primitive hooks and plugins that allows the user to decide on the behavior
without having to use a specific component, but for now I'm just exploring the framework and I want to
see how it works with some components from Radix UI (which has great accessibility by the way).

