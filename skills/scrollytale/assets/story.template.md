---
title: "Replace with story title"
structure: linear
data:
  sources:
    - id: main
      path: ./data/replace-with-data.csv
custom_style: ./src/styles/custom.css
---

---
id: opening
layout: hero
scene: focus
dek: "Add one short sentence that frames the story."
action:
  trigger: enter
---

# Replace with the main takeaway

Optional short intro summary.

---
id: section-one
layout: scrolly-right
scene: guide
---

## Replace with section headline

Add a short setup paragraph for this chart.

::vis{type="bar" data="main" x="category" y="value"}
::

::step
First step takeaway.
::

::step
Second step takeaway.
::

::step
Third step takeaway.
::

---
id: section-two
layout: scrolly-left
scene: observation
---

## Replace with another key pattern

Add a short setup paragraph for this second chart.

::vis{type="line" data="main" x="time" y="value" series="group"}
::

::step
Introduce the baseline pattern.
::

::step
Show where the trend changes.
::

::step
End with the main comparison.
::

---
id: closing
layout: full-width
scene: observation
action:
  trigger: scroll
---

## Replace with closing takeaway

Wrap up the story in one short paragraph.
