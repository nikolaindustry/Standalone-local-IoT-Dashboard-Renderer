# Industrial UI Design System

## Overview
This document describes the enterprise-grade industrial software interface design implemented in the Standalone IoT Dashboard Renderer application.

## Design Philosophy
The interface prioritizes **functionality over decoration**, designed to resemble professional industrial control software rather than consumer-facing web applications. The design emphasizes:

- **Clarity**: Clear information hierarchy with prominent data displays
- **Reliability**: High-contrast elements for critical status indicators
- **Functionality**: Purpose-built controls suitable for industrial environments
- **Professionalism**: Serious, robust appearance appropriate for industrial contexts

## Color Palette

### Primary Colors
- **Background Dark**: `#263347` - Main application background (dark blue-gray)
- **Surface Dark**: `#1a1f2e` - Panels, cards, and control surfaces (darker blue-gray)
- **Primary Text**: `#F9F9FA` - Main text and labels (off-white)
- **Borders**: `#E6E8EA` - Dividers and borders (light gray at low opacity)

### Status Colors
- **Active/Success**: Emerald `#10b981` - Running systems, active connections
- **Warning/Alert**: Red `#ef4444` - Errors, destructive actions
- **Inactive**: Gray with opacity - Disabled or secondary states

### Application
```css
/* Main Application Background */
background: #263347

/* Control Panels & Cards */
background: #1a1f2e
border: #E6E8EA with 10% opacity

/* Primary Interactive Elements */
background: #F9F9FA (white)
color: #263347

/* Text Colors */
primary-text: #F9F9FA
secondary-text: #E6E8EA/60 (60% opacity)
tertiary-text: #E6E8EA/40 (40% opacity)
```

## Typography

### Font Family
- **Primary**: System font stack (default)
- **Monospace**: Used for technical data, IDs, and values (`font-mono` class)

### Text Hierarchy
1. **Section Headers**: 
   - `text-sm font-bold uppercase tracking-wider`
   - Color: `#F9F9FA`
   
2. **Dashboard Titles**: 
   - `text-lg font-bold uppercase tracking-wide`
   - Color: `#F9F9FA`
   
3. **Labels**: 
   - `text-xs font-mono uppercase tracking-wider`
   - Color: `#E6E8EA`
   
4. **Values/Data**: 
   - `text-sm font-bold font-mono`
   - Color: `#F9F9FA`

## Layout Components

### 1. Top System Bar
```
Background: #1a1f2e
Border: 2px solid #E6E8EA/10
Padding: py-3 px-6

Features:
- System status indicator (pulsing green dot)
- Version number
- Application name
```

### 2. Page Header
```
Background: #1a1f2e
Border: 1px solid #E6E8EA/10
Padding: p-6

Components:
- Icon container (squared, bordered)
- Title (uppercase, tracked)
- Status badge (emerald for ready states)
- Description (monospace)
```

### 3. Section Headers
```
Background: #1a1f2e/50
Border Bottom: 1px solid #E6E8EA/10
Padding: px-6 py-4

Features:
- Vertical accent line (1px wide, #F9F9FA)
- Title (uppercase, bold)
- Item count badge
- Control actions (search, view toggle)
```

### 4. Dashboard Cards
```
Inactive State:
- Background: #263347
- Border: 2px solid #E6E8EA/20
- Hover: border-#F9F9FA

Active State:
- Background: #F9F9FA
- Border: 2px solid #F9F9FA
- Top indicator: 4px emerald bar
- Badge: "ACTIVE" in emerald
```

### 5. Form Inputs
```
Background: #263347
Border: 1px solid #E6E8EA/20
Text: #F9F9FA
Placeholder: #E6E8EA/40 (uppercase)
Font: Monospace

Focus State:
- Border: #F9F9FA
- No ring (ring-0)
```

### 6. Buttons

**Primary Action (System Control)**
```
background: #F9F9FA
color: #263347
border: 1px solid #F9F9FA
font: bold uppercase monospace
tracking: wider

hover: bg-#E6E8EA
```

**Secondary Action (Navigation/Export)**
```
background: transparent
color: #F9F9FA
border: 1px solid #E6E8EA/20
font: uppercase monospace

hover: bg-#263347, border-#F9F9FA
```

**Destructive Action**
```
color: red-400/red-600
border: 1px solid red/20
background: transparent

hover: bg-red/10
```

## UI Patterns

### Status Indicators
1. **Pulsing Dot**: For active/live connections
   ```html
   <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
   ```

2. **Status Badge**: For system states
   ```html
   <div class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30">
     <span class="text-xs font-mono text-emerald-400 uppercase">Active</span>
   </div>
   ```

3. **Accent Lines**: For visual hierarchy
   ```html
   <div class="w-1 h-6 bg-[#F9F9FA]" />
   ```

### Data Display Grids
```html
<div class="grid grid-cols-2 gap-3 border-b border-[#E6E8EA]/10">
  <div class="flex items-center gap-2">
    <!-- Icon container -->
    <div class="p-1.5 border bg-[#1a1f2e] border-[#E6E8EA]/20">
      <Icon class="w-3.5 h-3.5 text-[#F9F9FA]" />
    </div>
    <!-- Label & Value -->
    <div>
      <div class="text-xs font-mono text-[#E6E8EA]/60">LABEL</div>
      <div class="text-sm font-bold font-mono text-[#F9F9FA]">VALUE</div>
    </div>
  </div>
</div>
```

### Dividers
- **Vertical**: `<div class="w-px h-4 bg-[#E6E8EA]/20" />`
- **Horizontal**: `border-b border-[#E6E8EA]/10`

## Spacing System

### Container Padding
- **Sections**: `p-6`
- **Cards**: `p-5`
- **Control Bar**: `py-3 px-6`
- **Section Headers**: `px-6 py-4`

### Gap Spacing
- **Grid Columns**: `gap-4` or `gap-6`
- **Inline Elements**: `gap-2` or `gap-3`
- **Form Fields**: `space-y-4` or `space-y-5`

## Interactive States

### Hover States
```css
/* Cards */
hover:border-[#F9F9FA] hover:shadow-md

/* Buttons - Primary */
hover:bg-[#E6E8EA]

/* Buttons - Secondary */
hover:bg-[#263347] hover:border-[#F9F9FA]

/* Buttons - Destructive */
hover:bg-red-500/10
```

### Active/Selected States
- Inverted colors (dark background → light, light text → dark)
- Emerald accent indicators
- Increased shadow/elevation

### Disabled States
```css
disabled:opacity-30 disabled:cursor-not-allowed
```

## Component Examples

### Dashboard Management Interface
- System status bar at top
- Large section headers with accent lines
- Grid/list toggle for dashboard cards
- Monospace search with uppercase placeholder
- Industrial card design with squared corners

### Runtime Dashboard Header
- Dark control bar (#1a1f2e)
- Active status with pulsing indicator
- Connection details in monospace
- Squared icon containers
- Industrial control buttons

### Import Configuration Panel
- Two-column layout
- Clear section separation
- File upload with industrial styling
- System status alerts with icons
- Technical specifications list

## Best Practices

1. **Always use uppercase** for labels, buttons, and headings
2. **Prefer monospace fonts** for technical data (IDs, URLs, values)
3. **Use squared corners** instead of rounded (no rounded-xl)
4. **Implement clear borders** rather than shadows for depth
5. **Maintain high contrast** between text and backgrounds
6. **Include status indicators** for system states
7. **Use accent lines** for visual hierarchy
8. **Apply consistent spacing** with Tailwind utilities
9. **Implement functional icons** (avoid decorative use)
10. **Keep interactions minimal** (no animations except status pulses)

## Accessibility

- High contrast ratios maintained throughout
- Clear focus states on interactive elements
- Monospace fonts for improved readability of technical data
- Status indicators use both color and text
- Large touch targets for controls (minimum h-9)

## Technical Implementation

All styles implemented using Tailwind CSS utility classes with the following custom color values:
- `#263347` - Dark background
- `#1a1f2e` - Panel surfaces
- `#F9F9FA` - Primary text/interactive
- `#E6E8EA` - Borders (with opacity)

Emerald and red from Tailwind's default palette for status colors.
