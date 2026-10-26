<div align="center">

# 🧵 Elegoo Canvas Card

**English** · [Русский](https://github.com/AlexanderDyom/elegoo-canvas-card/blob/main/README.ru.md)

**Beautiful Home Assistant cards for Elegoo printers with the Canvas multi-material system**

Spools A1–A4 laid out exactly like on the printer, live camera, print progress and controls — all in one place.

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?logo=homeassistantcommunitystore&logoColor=white)](https://hacs.xyz)
[![GitHub Release](https://img.shields.io/github/v/release/AlexanderDyom/elegoo-canvas-card?label=release&color=03a9f4)](https://github.com/AlexanderDyom/elegoo-canvas-card/releases)
[![Validate](https://img.shields.io/github/actions/workflow/status/AlexanderDyom/elegoo-canvas-card/validate.yml?label=HACS%20validation)](https://github.com/AlexanderDyom/elegoo-canvas-card/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/AlexanderDyom/elegoo-canvas-card/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/AlexanderDyom/elegoo-canvas-card?style=social)](https://github.com/AlexanderDyom/elegoo-canvas-card/stargazers)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=AlexanderDyom&repository=elegoo-canvas-card&category=plugin)

<img src="https://raw.githubusercontent.com/AlexanderDyom/elegoo-canvas-card/main/docs/images/combo.png" alt="Combined printer and Canvas card" width="640">

</div>

---

## ✨ Features

- 🎨 **Canvas spools as on the printer**: A1 above A2 on the left, A4 above A3 on the right, real filament colors
- 🔵 **Active slot** highlighted, and its spool spins while printing
- 🏷️ **Filament type, brand and name**, plus grams used by the current print
- 🔀 **Tray selection** (Auto / A1–A4) right from the card
- 🖼️ **Model preview**, tap it for the **live camera** with "back" and "fullscreen" buttons
- 📊 **Progress**, layer, Z height, time left and ETA
- 🌡️ **Nozzle, bed and chamber temperatures** with targets
- 💡 **Light, fan, pause / resume / stop**
- 🌗 Light and dark themes, English and Russian (follows your Home Assistant language)
- 🧩 **Visual editor**: the printer is found automatically, no YAML needed

## 🖼️ Cards

| 🧵 Canvas | 🖨️ Printer | 📹 Camera |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/AlexanderDyom/elegoo-canvas-card/main/docs/images/canvas.png" width="260"> | <img src="https://raw.githubusercontent.com/AlexanderDyom/elegoo-canvas-card/main/docs/images/printer.png" width="260"> | <img src="https://raw.githubusercontent.com/AlexanderDyom/elegoo-canvas-card/main/docs/images/camera.png" width="260"> |
| `custom:elegoo-canvas-card` | `custom:elegoo-printer-card` | tap the preview |

### 🧩 Printer + Canvas — `custom:elegoo-combo-card`

<img src="https://raw.githubusercontent.com/AlexanderDyom/elegoo-canvas-card/main/docs/images/combo.png" alt="Combined printer and Canvas card" width="640">

## 📋 Requirements

| | What | Why |
|:---:|---|---|
| 🏠 | [Home Assistant](https://www.home-assistant.io) 2024.8 or newer | |
| 📦 | [HACS](https://hacs.xyz/docs/use/) | install and update the card |
| 🔌 | **[Elegoo Printers for Home Assistant](https://github.com/danielcherubini/elegoo-homeassistant)** | **required**: the card reads all its data from this integration |
| 🧾 | G-code proxy enabled in the integration | optional: grams, names and colors from the slicer |

> [!IMPORTANT]
> The card knows nothing about the printer on its own. Install and set up the
> [elegoo-homeassistant](https://github.com/danielcherubini/elegoo-homeassistant) integration first, then this card.

Tested with a **Centauri Carbon 2 Combo** with Canvas. The printer card also works with other Elegoo FDM printers supported by the integration.

## 🚀 Installation

### HACS (recommended)

1. Click **Open in HACS** above, or manually: HACS → ⋮ → **Custom repositories** →
   `https://github.com/AlexanderDyom/elegoo-canvas-card`, type **Dashboard**.
2. Find **Elegoo Canvas Card** → **Download**.
3. Hard-refresh your browser (**Ctrl+F5**).

### Manual

1. Download `elegoo-canvas-card.js` from [Releases](https://github.com/AlexanderDyom/elegoo-canvas-card/releases).
2. Put it into `/config/www/`.
3. Settings → Dashboards → ⋮ → **Resources** → **Add resource**: `/local/elegoo-canvas-card.js`, type **JavaScript module**.
4. Hard-refresh your browser (**Ctrl+F5**).

## ⚙️ Configuration

Dashboard → ✏️ **Edit** → **Add card** → search for `Elegoo`. Everything is available in the visual editor.

<details>
<summary>🧵 <b>Canvas</b> — <code>custom:elegoo-canvas-card</code></summary>

```yaml
type: custom:elegoo-canvas-card
device: 0123456789abcdef   # optional if you have one printer
layout: grid               # grid — 2×2 like the printer, row — 1×4
show_details: true         # brand, name, grams
show_tray_select: true     # tray selector
```

</details>

<details>
<summary>🖨️ <b>Printer</b> — <code>custom:elegoo-printer-card</code></summary>

```yaml
type: custom:elegoo-printer-card
camera: auto        # auto | camera | thumbnail | none
show_temps: true
show_controls: true
show_light: true
show_fan: true
```

</details>

<details>
<summary>🧩 <b>Printer + Canvas</b> — <code>custom:elegoo-combo-card</code></summary>

```yaml
type: custom:elegoo-combo-card
layout: row
camera: auto
```

Accepts every option of the two cards above.

</details>

### 📹 Camera

By default the card shows the model preview with a 📹 icon. Tap it to open the live camera, which has two buttons:
⬅️ back to the model and ⛶ fullscreen. If the browser or mobile app can't go fullscreen,
the standard Home Assistant camera dialog opens instead.

| `camera:` | Behavior |
|---|---|
| `auto` | model preview, camera on tap (default) |
| `camera` | camera right away |
| `thumbnail` | model preview, camera on tap |
| `none` | no image |

### 🔧 If an entity isn't found

The card finds the device's entities by the end of their `entity_id` (`..._a1_color`, `..._print_status`, etc.).
If you renamed them, set them explicitly:

```yaml
type: custom:elegoo-combo-card
entities:
  a1_color: sensor.my_printer_a1_color
  active_tray: sensor.my_printer_active_tray_id
  camera: camera.my_printer_chamber_camera
```

Or use `prefix: centauri_carbon_2` to match entities by `entity_id` prefix instead of by device.

<details>
<summary>All <code>entities</code> keys</summary>

`print_status`, `current_status`, `progress`, `remaining`, `current_layer`, `total_layers`, `current_z`,
`filename`, `nozzle_temp`, `bed_temp`, `box_temp`, `nozzle_target`, `bed_target`, `light`, `fan`,
`pause`, `resume`, `stop`, `print_tray`, `active_tray`, `canvas_connected`, `camera`, `thumbnail`,
`aN_color`, `aN_name`, `aN_type`, `aN_grams` (N = 1…4).

</details>

## ❓ FAQ

**What are the grams under a spool?** How much filament the *current* print takes from that slot (from the G-code), not what's left on the spool.
They only appear with the integration's G-code proxy enabled.

**The card isn't in the list.** Hard-refresh with Ctrl+F5. The browser console (F12) should show `ELEGOO-CANVAS-CARD`.

**The card shows dashes.** Check that the Elegoo integration works and the printer is online, or set the entities manually (see above).

## 🙏 Credits

- [danielcherubini/elegoo-homeassistant](https://github.com/danielcherubini/elegoo-homeassistant) — the integration this card is built on
- [Elegoo](https://www.elegoo.com) — for the Centauri Carbon 2 and Canvas

This project is not affiliated with or endorsed by Elegoo.

## 📄 License

[MIT](https://github.com/AlexanderDyom/elegoo-canvas-card/blob/main/LICENSE)
