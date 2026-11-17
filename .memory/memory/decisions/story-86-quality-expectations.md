The user selected Chromium only on Windows for the catalog and product-details quality cases. Accessibility scope is keyboard reachability using Tab/Shift+Tab, visible focus without traps, meaningful accessible names, Enter opening matching product details, and keyboard-editable quantity at 1920x1080 CSS pixels and 100% zoom.

Responsive expectations apply at 390x844, 768x1024 and 1920x1080 CSS pixels at 100% zoom: catalog cards, six detail values and purchase controls remain readable without clipping, overlap or horizontal page scrolling, and remain reachable and usable with vertical scrolling.

Each quantity/cart variation uses a fresh isolated empty cart. Quantities 1 and 2 must add the selected product with the exact entered quantity; valid paths remove the case-owned item and verify empty cart. Blank, 0, -1, 1.5 and non-numeric input must prevent addition, show visible validation with no fixed wording, and leave cart empty. No upper quantity limit was selected.

These are user-accepted test expectations, not observed application behavior. The detailed acceptance receipt and source-bound owner decisions are retained locally; remote story fields were not changed.

Evidence: .harness/state/test-case-design/story-86-quality-acceptance.json and .harness/state/test-case-design/story-86-quality-requirements.txt. These consumer state files are ignored by Git, so they are retained as evidence references rather than code anchors.