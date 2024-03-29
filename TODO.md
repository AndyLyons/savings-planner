# TODO List

* Do we need month view at all? Can month balances just be entered via the year display? Do we need to view inter-year data to see if we're on track?
* Variable support
  * Allow users to define values that are derived from other values
* Dialog autofocus not working?
* Is `createDialogs` a good pattern? Maybe these should just be standard React components that you can quickly compose to build a dialog
* Easier child/parent management
  * Adding an item to a Collection chould also set the ID of the parent on the child
    * currently this is handled by Dialogs.ts initial values, but this feels a bit messy
    * this might be trickier than planned as parent IDs are currently required by children and can't be null'd
  * normalize data structure more?
    * parents don't need to physically hold their children
    * children are just stored elsewhere (could even come from a DI framework?)
    * parents store IDs and then a computed property generates the array of children
* Tabular view for editing entities
  * E.g. Deposits view is a table of all deposits
  * Users can easily see all data for all deposits without having to dive into sub menus
  * Bulk edit multiple rows with the same update like changing the withdrawal rate (UX question on how bulk edit would work)
  * But does this work on mobile???
* Remove MUI - it feels bulky and I don't like it
* Investigate replacing computedFn with an array of actual entities for each date, to see if it helps performance (have seen some potential slowness with the deep maps in computedFn and caching of params)
* UX idea: Be able to select a Person: None (or Anon or Guest etc.) if you don't want to setup lots of user
* Better mobile table view - don't use a full screen table, each column takes the whole screen and there are 'right' and 'left' arrow buttons to let the user switch to the next column (maybe also swipe left/right gestures)
* Persist data to the cloud somewhere so users can login any access their data on any machine
  * maybe a custom BE with something like Firebase
  * maybe we can use google drive or similar and write json files with their data? not sure if it's supported by the Drive API