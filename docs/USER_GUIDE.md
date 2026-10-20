# TTJ User Guide

## Logging a Trade (< 30 seconds)

1. Click **Add Trade** in the sidebar or top button.
2. Fill in:
   - **Date Open / Close** — when you entered and exited.
   - **Symbol** — pick from your list (configure in Settings).
   - **Direction** — Long or Short.
   - **Entry, SL, TP, Exit prices**.
   - **Position Size** — lots or units.
   - **Fees** — commission + swap.
3. Watch the **Auto-Calculated Preview** update live: Risk, P&L, R-multiple, Result.
4. Fill in Psychology: emotion, followed plan, mistake tags.
5. Optionally paste a screenshot URL.
6. Click **Save Trade** — it appears in Google Sheets within seconds.

---

## Reading the Dashboard

| Stat | Meaning |
|---|---|
| **Total P&L** | Net profit/loss across all trades |
| **Win Rate** | % of winning trades |
| **Profit Factor** | Gross wins ÷ gross losses (>1.5 is good) |
| **Expectancy** | Average P&L per trade |
| **Avg R** | Average R-multiple per trade |
| **Max Drawdown** | Largest peak-to-trough equity drop |
| **Best / Worst Trade** | Highest and lowest single-trade P&L |

### Charts

- **Equity Curve** — shows your running account balance over time.
- **P&L by Day of Week** — tells you which days you trade best.
- **P&L by Symbol** — shows which instruments are profitable.
- **P&L by Setup** — shows which strategies actually work.
- **Emotions Donut** — shows the emotional makeup of your trades.
- **Mistake Tags Bar** — highlights what costs you money most often.

---

## Discipline Tracker

Found under the dashboard:

- **Followed Plan %** — higher is better. If it drops below 70%, review your process.
- **Most Common Emotion** — watch for Fear, Greed, FOMO, or Revenge patterns.
- **Most Frequent Mistake** — the single tag you should focus on eliminating first.

---

## Calendar View

- Each day shows a **green or red cell** based on daily P&L.
- Click a day to see all trades for that day.
- Link to the **Daily Review** for that day.

---

## Daily Review

Fill in at the end of each trading day:

1. Select your **mood**.
2. The app auto-fills trade count and daily P&L.
3. Write: what went well, what to improve, plan for tomorrow.
4. Click **Save Review**.

---

## Exporting Data

- Go to **Trades** page.
- Click the **Export** button → choose **CSV** or **XLSX**.
- The file opens cleanly in Excel or Google Sheets.
- You can also open the sheet directly from **Settings → Open in Google Sheets**.

---

## Settings

| Setting | Description |
|---|---|
| Starting Balance | Your initial account size |
| Default Risk % | Used as a reminder only (not enforced) |
| Daily Loss Limit | App warns you when you hit this |
| Max Trades / Day | App warns you when you hit this |
| Symbols | List of instruments you trade |
| Setups | Your strategy names |
| Mistake Tags | Tags you use when logging errors |
| GAS URL | Your Google Apps Script deployment URL |

---

## Risk Guard

When you reach your **daily loss limit** or **max trades per day**, a banner appears at the top of the screen. This is a hard reminder — stop trading for the day.
