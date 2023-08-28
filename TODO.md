# TODO List

* Simplify dates for Withdrawals and Deposits - they don't need to be down to the month. Just let them set start/end years so they can't start/end mid way. Still support the 'months' view and allow balances to be set for a month, and for the user to setup deposits/withdrawals that occur every month; just limit the start/end dates to years
* Add a 'starting balance' field for accounts - this is different to setting the balance of Jan as it will apply to any interest earned in Jan
* Use the 'payout annuity' formula to add an 'empty account in X years' option to withdrawals
  * https://ua.pressbooks.pub/collegealgebraformanagerialscience/chapter/8-3-payout-annuities
  * This would only work if no other deposits/withdrawals occur - I think that's OK, it can still be an option but other deposits/withdrawals will mess up the numbers
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
* UX idea: Plus sign to the right of the account headers to add a new account column
* Better mobile table view - don't use a full screen table, each column takes the whole screen and there are 'right' and 'left' arrow buttons to let the user switch to the next column (maybe also swipe left/right gestures)
* Fix tax calculations - these should be calculated per _person_ not per _account_
  * Maybe also consider some benefits for couples? E.g. can they share allowances?