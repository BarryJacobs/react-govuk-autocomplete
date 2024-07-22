# Change Log

## 1.1.0 2024-07-21

- Reworked the control to allow deletion of the search text to clear the currently selected value
- This functionality is now more inline with the older [GDS Autocomplete](https://alphagov.github.io/accessible-autocomplete/examples/)
- Added forward ref support to enable React Hook Form register and Controller usage in addition to other user cases where a ref is needed to be passed
- Removed the generic extension to LabelValuePair as there were no obvious use cases and to simplify the code

## 1.1.1 2024-07-22

- Modified hover styling to separate visually from selected/focused option
