# Google Sheets Clone

This project is mostly exploratory. It was meant to see how easy it would be to use InstantDB (turns out: very easy). It offers realtime, multi-user updates (it also has a single, global spreadsheet).

It's meant to be a functional programming variant of Google Sheets. For example, to add two numbers, you would write `(+ 10 5)`.

## Roadmap

There are currently some fundamental features missing:

- [ ] Ability to add more columns/rows (and probably including more by default)
- [x] Auth
- [x] Strings
- [x] Cell ranges
- [ ] Allowing the creation of multiple spreadsheets
- [ ] ... any function outside of PEMDAS

On top of that, there are a number of optimizations missing:

- [ ] Ability to resize columns/rows
- [ ] Any sort of user styling
- [ ] Better styling
- [ ] Improved focus control (e.g., select another cell while editing a formula)
- [ ] Multiple pages per spreadsheet
