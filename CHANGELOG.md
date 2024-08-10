# Change Log

## 1.1.0 2024-07-21

- Reworked the control to allow deletion of the search text to clear the currently selected value
- This functionality is now more inline with the older [GDS Autocomplete](https://alphagov.github.io/accessible-autocomplete/examples/)
- Added forward ref support to enable React Hook Form register and Controller usage in addition to other user cases where a ref is needed to be passed
- Removed the generic extension to LabelValuePair as there were no obvious use cases and to simplify the code

## 1.1.1 2024-07-22

- Modified hover styling to separate visually from selected/focused option

## 1.1.2 2024-07-24

- Modified search term changes to set focus to the first menu option to fix focus issue with creatable selects

## 1.1.3 2024-08-10

- Modified keyboard focused menu items to use the gds focus colour to differentiate fully between selected, focused and hover states
