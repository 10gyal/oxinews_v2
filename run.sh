#!/bin/bash

# List of all shadcn/ui components
components=(
  "accordion"
  "alert"
  "alert-dialog"
  "aspect-ratio"
  "avatar"
  "badge"
  "button"
  "calendar"
  "card"
  "carousel"
  "checkbox"
  "collapsible"
  "command"
  "context-menu"
  "dialog"
  "drawer"
  "dropdown-menu"
  "form"
  "hover-card"
  "input"
  "label"
  "menubar"
  "navigation-menu"
  "pagination"
  "popover"
  "progress"
  "radio-group"
  "resizable"
  "scroll-area"
  "select"
  "separator"
  "sheet"
  "skeleton"
  "slider"
  "sonner"
  "switch"
  "table"
  "tabs"
  "textarea"
  "toast"
  "toggle"
  "toggle-group"
  "tooltip"
)

# Loop through each component and add it
for component in "${components[@]}"
do
  echo "Adding $component..."
  npx shadcn@latest add "$component" -y
done

echo "All components have been added!"