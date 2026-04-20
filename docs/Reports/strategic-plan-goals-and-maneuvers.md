# Strategic Plan: Goals, Trust Structures, and Sequence of Maneuvers

**Prepared for Trustee and Elder Law Attorney | March 2026**

---

## Table of Contents

1. [Primary Goals](#primary-goals)
2. [Secondary Goals](#secondary-goals)
3. [Trust Structures](#trust-structures)
4. [Sequence of Maneuvers](#sequence-of-maneuvers)
5. [Sensitivity and Break-Even](#sensitivity-and-break-even)

---

## Primary Goals

### 1. Maintain Person A's Quality of Life and Care Continuity

Person A (age 70, aging in place from 2026 onward) must be provided with a stable, dignified standard of living through the progression from independent living to later-life care, without disruption or displacement.

**Pre-Memory Care:**
- Lifestyle maintained at $2,400/mo floor, funded by IRA withdrawals + Social Security + LTC insurance payout
- Charitable giving (tithe) continues at A's direction at $800/mo. This matters to her.
- A support sibling moves in as live-in companion and caregiver at the primary residence
- Medical expenses covered from IRA/LTC savings, tax-deductible

**Memory Care Transition (~2034):**
- Facility selected during the at-home nursing window, by the time of intensification of care ~2031, while A can still participate in the choice. Family selects the facility, not the hospital during a crisis.
- 3 years of private pay guarantees a Medicaid bed contract, in writing. The facility cannot displace Person A when private pay ends and Medicaid begins. No waiting lists.
- No mid-care facility transfer. Person A stays in the same room, same caregivers, same routine through end of life. Continuity of care is non-negotiable.

**If NOT planned:** Crisis placement into whatever facility has a bed. No Medicaid bed guarantee. Facility can discharge when funds run out. Transfer trauma can sharply worsen instability during later-life decline.

---

### 2. Protect the Legacy Condo from Creditor Claims

Outside creditors must not be allowed to attach the legacy condo or its sale proceeds.

**Vehicle:** Existing irrevocable trust, restructured into the MAPT via judicial modification (ORS 130.200). Oregon has no decanting statute, so court approval is required.

**Mechanism:** The legacy condo transfers trust-to-trust, never entering an individual beneficiary's personal name. The MAPT trustee sells the legacy condo as a trust-level transaction. Creditors see nothing.

**If broken:** Creditors attach the legacy condo or its sale proceeds.

---

### 3. Prevent SSA from Counting C2's Condo as Support in Kind, and from collecting on the SNT condo during Medicaid Recovery upon the beneficiary and spouse's passing

C2 (disabled, on SSDI) must own nothing in their personal name that SSA could construe as countable assets or in-kind support.

**Vehicle:** Third-party Special Needs Trust (C1 as trustee, C2 as beneficiary)

**Mechanism:** The SNT owns the SNT condo, not C2. C2 is the beneficiary but does not own trust assets. The trustee (C1) has sole discretion over all distributions. Because this is a third-party SNT (funded by someone other than C2), there is no Medicaid payback provision at C2's death.

**Condition:** C2's SSDI contributions toward SNT expenses are permissible because SSDI is not means-tested (unlike SSI).

**If broken:** SSA reduces C2's benefits or disqualifies C2 from future Medicaid eligibility.

---

### 4. Protect IRA and Annuities from Medicaid Seizure

Without intervention, Medicaid will treat Person A's IRA and annuity income as patient pay for the duration of each contract, and seek recovery on remaining balances after death.

**Vehicle:** Proactive liquidation into the SNT, executed before the Medicaid application is filed

**Mechanism:** At the Medicaid trigger (around 2037), all remaining IRA balances and annuity contracts are liquidated. Proceeds are deposited into the SNT after tax withholding (about $159k). Once in the SNT, these assets are no longer Person A's property. Medicaid cannot seize them. MERP cannot recover them.

**Timing is critical:** This must happen before the Medicaid application is filed. Once Medicaid is active, all income in Person A's name is seized as patient pay.

**Cost:** ~$159k in tax withholding to protect ~$300k+ in assets.

**If NOT done:** Medicaid seizes monthly annuity payments as Person A's income for the life of each contract (~$188k in remaining annuity value consumed). Remaining IRA balance subject to MERP recovery after death.

---

### 5. Protect the Primary House from Medicaid Estate Recovery (MERP)

The primary house (~$825k, appreciating to ~$1.6M by 2040) is the family's largest asset. Without protection, Oregon's MERP program will place a lien on it after Person A's death.

**Vehicle:** Medicaid Asset Protection Trust (MAPT) with Limited Power of Appointment (LPOA)

**Mechanism:** The house is transferred into the MAPT, removing it from Person A's probate estate. Oregon MERP can only recover from the probate estate. MAPT assets are outside probate and beyond MERP's reach.

**Condition:** The transfer must occur at least 5 years before the Medicaid application (lookback period). Formation in 2026, lookback clears 2031, Medicaid projected 2037 -- providing 6 years of margin.

**If house is NOT in MAPT:** MERP places a lien after Person A's death. Over a long care window, that claim can consume a large share of the house equity.

---

### 6. Preserve Stepped-Up Basis on the Primary House

Without the LPOA, heirs selling the house would owe capital gains tax on the full appreciation.

**Vehicle:** Limited Power of Appointment (LPOA) written into the MAPT

**Mechanism:** The LPOA causes MAPT assets to be included in Person A's gross estate for federal tax purposes under IRC Section 1014, triggering a stepped-up basis at death. The basis resets to fair market value (~$1.6M), eliminating capital gains on ~$1.2M of appreciation.

**Key distinction:** The LPOA puts the house in the *gross estate* (tax basis step-up) but NOT in the *probate estate* (MERP protection). Both benefits are preserved simultaneously.

**Without LPOA:** Heirs inherit a much less efficient tax basis and lose one of the cleanest financial advantages in the structure.

---

## Secondary Goals

### 7. Minimize Taxable Income and Avoid IRMAA Medicare Penalties

**Vehicle:** Dynamic Programming withdrawal optimizer (built into BurnRate)

**Mechanism:**
- The optimizer shelters IRA withdrawals under the standard deduction and medical expense wash during high-medical years, keeping taxable income near zero when possible.
- MAGI is kept below IRMAA cliffs ($106k single filing) to avoid Medicare Part B/D surcharges that would otherwise cost thousands per year.
- The optimizer balances annual tax cost against lifetime totals, sometimes accepting slightly higher tax in one year to avoid triggering a cliff in the next.
- Post-Medicaid, IRMAA surcharges become self-funding (deducted from Social Security before the patient pay calculation) and require no further action.

**Value:** ~$5,000 in lifetime tax savings vs a naive 50/50 IRA/LTC split. More importantly, the optimizer prioritizes solvency (preserving IRA for the SNT safety net) over marginal tax savings.

---

### 8. Fund Primary House Expenses After Person A Enters Memory Care

Once Person A is in memory care (~2034+), the primary house continues to incur property taxes, insurance, maintenance, and utilities. A support sibling lives there. These costs must be covered to prevent liens and deterioration.

**Vehicle:** MAPT checking account + SNT backup

**Mechanism:**
- MAPT checking covers carrying costs from remaining trust funds and roommate income.
- If the MAPT runs low, the SNT pays the carrying costs. This is permissible under SNT rules (housing-related expenses are an allowed expenditure).
- Roommate income ($1,100/mo) flows to the MAPT post-memory-care to help offset costs.
- The SNT paying carrying costs is not charity toward another beneficiary. It protects the primary house from liens, which protects all siblings' inheritance, including C2's. This is C2 protecting C2's own inheritance, as required by SNT rules.

**If NOT funded:** Property taxes go unpaid (liens attach). Insurance lapses (uninsured loss risk). House deteriorates (reduced sale value). All siblings' inheritance is diminished.

**Estimated carrying costs post-Medicaid:** meaningful enough that they must be planned for explicitly, not assumed away.

---

### 9. Maintain Equitable Inheritance Without Violating SSA or Trust Rules

Person A's wish is an equal inheritance among C1, C2, and C3. The plan must honor this while acknowledging that one household contributed separate capital and C2 received substantial pre-inheritance through the SNT.

**Vehicle:** Documented equity ledger + estate settlement plan

**Mechanism:**
- **The documented equity claim** from the legacy condo sale is documented at trust formation. This is separate contributed capital, not Person A's wealth. It is repaid first at estate settlement before the equal split.
- **C2's pre-inheritance** (SNT condo purchase + seed funding + IRA/annuity liquidation proceeds) is tracked. C2's share of Person A's estate is offset by these assets already received.
- **Each child receives an equal share of Person A's wealth.** The contributing sibling additionally recovers the contributed capital.
- **C2's SNT paying primary house carrying costs when needed** is not a gift to another beneficiary. It protects the house from liens that would diminish C2's own inheritance. The equity ledger documents this as C2's self-interested asset protection, not inter-sibling transfer.

**At estate settlement:**
- House sold (stepped-up basis, $0 capital gains)
- Oregon estate tax applied
- The documented equity claim repaid from proceeds
- Remainder divided in equal thirds
- C2's third offset by SNT assets already received

**Constraints:**
- SNT distributions must be at trustee (C1) discretion. C2 cannot demand or direct payments.
- No distributions that jeopardize C2's SSDI or future Medicaid eligibility.
- The equity ledger is advisory. Actual distribution follows the trust document terms.

**Break-even framing:** The structure remains viable under modest appreciation assumptions. The point of the model is not chasing upside; it is keeping the estate mechanics orderly under stress.

---

## Trust Structures

| Trust | Purpose | Trustee | Beneficiaries | Tax Treatment |
|---|---|---|---|---|
| **Existing Irrevocable Trust** | Currently holds legacy condo. Protects from outside creditors. Will be restructured into MAPT (ORS 130.200, court approval required). | TBD (confirm with attorney) | contributing sibling (confirm) | Separate entity |
| **MAPT** | Holds primary house + legacy condo sale proceeds. MERP protection. Stepped-up basis via LPOA. | C1 | C1, C2, C3 | Grantor trust (flows to Person A's 1040) |
| **SNT** | Holds C2's condo + IRA/annuity liquidation proceeds. SSA compliance. Medicaid asset protection. | C1 | C2 | Separate tax entity (1041/OR-41) |

---

## Sequence of Maneuvers

### Phase 1: Trust Formation (Spring 2026)

```
1. Form the MAPT
   - C1 appointed trustee
   - Beneficiaries: C1, C2, C3
   - Include LPOA for stepped-up basis
   - Grantor trust for income tax purposes

2. Form the SNT
   - C1 appointed trustee
   - Beneficiary: C2
   - Third-party SNT (no Medicaid payback)
```

### Phase 2: Asset Transfers (Spring 2026)

```
3. Restructure existing irrevocable trust into MAPT
     - Oregon has no decanting statute
     - Requires judicial modification under ORS 130.200:
       court petition, consent of settlor + all beneficiaries, judge approval
     - Attorney files the petition; all parties consent; court approves
     - The legacy condo stays in trust throughout — never enters an individual beneficiary's personal name

   CRITICAL: The legacy condo never enters an individual beneficiary's personal name (creditor protection).

4. Transfer primary house → MAPT
   (Starts the 5-year Medicaid lookback clock)
```

### Phase 3: Condo Disposition (Spring-Summer 2026)

```
5. IF selling the legacy condo upfront (current demo baseline):
     a. MAPT sells the legacy condo (trust-level sale)
     b. MAPT funds SNT: SNT condo down payment + $10k seed
     c. Remaining legacy condo sale proceeds stay in MAPT checking
     d. No primary house refinance needed
     e. SNT purchases C2's condo

   ELSE (keeping the legacy condo as a rental):
     a. Refinance primary house (IO mortgage) to generate:
        - SNT condo down payment
        - SNT seed funding ($10k)
        - $20k deferred maintenance / closing costs
     b. SNT purchases C2's condo (P&I mortgage for remainder)
     c. MAPT rents out the legacy condo
     d. Rental income offsets IO interest + legacy condo operating costs
     e. C1 manages two properties for 15 years
```

### Phase 4: Household Transition (Summer 2026)

```
6. A support sibling moves into primary house with Person A
7. C2 moves into SNT condo
8. Document the equity claim in the equity ledger
```

### Phase 5: Pre-Memory Care (2026-2034)

```
9. Withdrawal optimizer manages IRA/LTC distributions
   - Minimizes taxable income
   - Avoids IRMAA cliffs
   - Prioritizes solvency over tax savings

10. ~2031: Begin memory care facility search
    - Select facility that guarantees Medicaid bed
      after 3 years of private pay
    - Person A participates in the choice while able
```

### Phase 6: Memory Care (2034-2037)

```
11. Person A enters memory care facility
    - 3 years private pay from IRA + LTC insurance
    - Facility bed guarantee contract in place

12. IF roommates enabled:
      A support sibling takes roommate(s) — $1,100/mo income flows to MAPT (more if 2 rooms rented out)

13. MAPT covers primary house carrying costs
    SNT provides backup if MAPT runs low
```

### Phase 7: Medicaid Transition (~2037)

```
14. BEFORE filing Medicaid application:
    a. Liquidate all remaining IRA balances
    b. Surrender all annuity contracts (85% of remaining value)
    c. Deposit all proceeds into SNT (after tax withholding)
    d. Pay off any remaining condo mortgage from SNT

15. File Medicaid application
    - Lookback period cleared (2026 + 5 = 2031, now 2037)
    - No countable assets in Person A's name
    - Person A's Social Security seized as patient pay
    - IRMAA surcharges self-funding (deducted from SS)

16. Person A remains in same facility, same room
    - Medicaid bed guarantee honored
    - No transfer, no disruption
```

### Phase 8: Post-Medicaid Through End of Life (2037-2040)

```
17. SNT pays primary house carrying costs as needed
    - Protects house from liens
    - Protects all siblings' inheritance

18. C1 continues trustee duties for both MAPT and SNT
    - Annual tax filings (1041/OR-41 for SNT)
    - Person A's 1040 (MAPT grantor trust income)
    - Maintain equity ledger
```

### Phase 9: Estate Settlement (at Person A's death)

```
19. Sell primary house
    - Stepped-up basis via LPOA ($0 capital gains)
    - Oregon estate tax (~$118k on ~$2.1M estate)

20. Distribute per equity ledger:
    - Repay the documented equity claim (contributed capital, not inheritance)
    - Divide remainder in equal thirds
    - C2's third offset by SNT assets already received
    - C1's share from house sale proceeds

21. SNT: C2 retains condo + remaining cash
    - Third-party SNT — no Medicaid payback at C2's death
    - Remaining assets pass per trust document at C2's death

22. IF Person A dies BEFORE Medicaid trigger (~2037):
    - IRA and annuities were NOT liquidated into SNT
    - IRA passes to named beneficiaries (C1, C2, C3 or as designated)
    - Under SECURE Act 10-year rule: non-spouse beneficiaries must
      distribute inherited IRA within 10 years, with annual RMDs
    - Individual beneficiaries will owe income tax on RMDs at their marginal rates
    - C2's share should be directed to the SNT (as trust beneficiary)
      to preserve SSA/Medicaid eligibility
    - Annuity contracts pass to named beneficiaries with required
      distributions — also taxable as ordinary income
    - This is a BETTER tax outcome than proactive liquidation
      (spread over 10 years vs lump sum)
    - The MAPT still protected all assets for the duration —
      protection from future Medicaid seizure was in place
      from trust formation, even if never triggered
    - Moot if Person A dies after Medicaid trigger, since
      liquidation already occurred
```

---

## Protected Condo Financing

The current demo state uses a lightly leveraged protected condo rather than a heavily financed one. The reason is structural:

- lower debt drag means fewer forced IRA withdrawals
- fewer forced IRA withdrawals means less tax friction
- less tax friction leaves more room for trust solvency during the care years
- a cleaner structure is easier for the trustee to administer under stress

The point of this section is not a single exact percentage. It is the direction of the tradeoff. As leverage rises, pressure rises everywhere else in the plan.

*For detailed year-by-year equity tables at each down payment level and appreciation rate, see: [Down Payment Equity Comparison](down-payment-equity-comparison.md).*

---

*This document is a planning framework for discussion with the family's elder law attorney. It is not legal advice. All trust formations, judicial modifications, and Medicaid strategies must be reviewed and executed by a licensed attorney familiar with Oregon trust law, Medicaid regulations, and SSA compliance.*

*Financial projections generated by BurnRate. Live demo assumptions should be treated as the source of truth for the current scenario values and outputs. Oregon estate tax and trust-law references still require attorney review in any real-world use.*
