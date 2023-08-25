# TODO List

* Adding an item to a Collection should also set the ID of the parent on the child
  * currently this is handled by Dialogs.ts initial values, but this feels a bit messy
* Variable support
  * Allow users to define values that are derived from other values
* Tabular view for editing entities
  * E.g. Deposits view is a table of all deposits
  * Users can easily see all data for all deposits without having to dive into sub menus
  * Bulk edit multiple rows with the same update like changing the withdrawal rate (UX question on how bulk edit would work)
  * But does this work on mobile???
* Remove MUI - it feels bulky and I don't like it
* Investigate replacing computedFn with an array of actual entities for each date, to see if it helps performance (have seen some potential slowness with the deep maps in computedFn and caching of params)