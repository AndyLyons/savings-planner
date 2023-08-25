# TODO List

* When editing deposits/withdrawals in the main table, separate the action into "Edit" (pencil icon button maybe) and "Split" - edit behaves like it does now, but split lets you stop the previous deposit and start a new one at the selected date
  * Can also add a "Stop" button to stop an action at a particular date
* Tabular view for editing entities
  * E.g. Deposits view is a table of all deposits
  * Users can easily see all data for all deposits without having to dive into sub menus
  * Bulk edit multiple rows with the same update like changing the withdrawal rate (UX question on how bulk edit would work)
  * But does this work on mobile???
* Variable support
  * Allow users to define values that are derived from other values
* Remove MUI - it feels bulky and I don't like it
* Investigate replacing computedFn with an array of actual entities for each date, to see if it helps performance (have seen some potential slowness with the deep maps in computedFn and caching of params)