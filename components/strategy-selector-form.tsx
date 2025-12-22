// Strategy matching logic from Table 2
const STRATEGY_PATTERNS = {
  "Small Business Re-Birth (i) - Sell Asset & Buy Home": [3, 14, 15, 40],
  "Small Business Re-Birth (ii) - Sell Asset & Stay in Current Home": [3, 12, 14, 15, 40],
  "Small Business Re-Birth (iii) - Sell Asset & Extend Current Home": [3, 12, 15, 40],
  "Small Business Re-Birth (iv) - Sell Asset & Upgrade Home": [3, 12, 14, 40],
  "Twist Exist Re-Structure (i) - Stop Renting & Buy Home": [14, 15, 25, 40],
  "Twist Exist Re-Structure (ii) - Stay & Continue Business": [12, 14, 15, 25, 40],
  "Twist Exist Re-Structure (iii) - Stay & Extend Home": [12, 15, 25, 40],
  "Twist Exist Re-Structure (iv) - Upgrade Home": [12, 14, 25, 40],
  "Home Business Re-Structure (i) - Buy Home & Start Business": [3, 14, 15, 25, 40],
  "Home Business Re-Structure (ii) - Stay & Start Business": [3, 12, 14, 15, 25, 40],
  "Home Business Re-Structure (iii) - Extend & Start Business": [3, 12, 15, 25, 40],
  "Home Business Re-Structure (iv) - Upgrade & Start Business": [3, 12, 14, 25, 40],
  "Small Business Lease Buster (i) - Buy Home & Start Business": [3, 14, 15, 25],
  "Small Business Lease Buster (ii) - Stay & Start Business": [3, 12, 14, 15, 25],
  "Small Business Lease Buster (iii) - Extend & Start Business": [3, 12, 15, 25],
  "Small Business Lease Buster (iv) - Upgrade & Start Business": [3, 12, 14, 25],
}
