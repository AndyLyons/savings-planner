# TODO List

* Variable support
  * Allow users to define values that are derived from other values
* Fix tax calculations - these should be calculated per _person_ not per _account_
  * Maybe also consider some benefits for couples? E.g. can they share allowances?
* Adding an item to a Collection should also set the ID of the parent on the child
  * currently this is handled by Dialogs.ts initial values, but this feels a bit messy
  * this might be trickier than planned as parent IDs are currently required by children and can't be null'd
* Tabular view for editing entities
  * E.g. Deposits view is a table of all deposits
  * Users can easily see all data for all deposits without having to dive into sub menus
  * Bulk edit multiple rows with the same update like changing the withdrawal rate (UX question on how bulk edit would work)
  * But does this work on mobile???
* Remove MUI - it feels bulky and I don't like it
* Investigate replacing computedFn with an array of actual entities for each date, to see if it helps performance (have seen some potential slowness with the deep maps in computedFn and caching of params)
* UX idea: Plus sign to the right of the account headers to add a new account column
* Better mobile table view - don't use a full screen table, each column takes the whole screen and there are 'right' and 'left' arrow buttons to let the user switch to the next column (maybe also swipe left/right gestures)
* Persist data to the cloud somewhere so users can login any access their data on any machine
  * maybe a custom BE with something like Firebase
  * maybe we can use google drive or similar and write json files with their data? not sure if it's supported by the Drive API