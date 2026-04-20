# Inheritance Equity Analysis

**Prepared for Trustee | Demo Abbreviation**

---

## Purpose

This note reduces the inheritance logic to equations rather than household-specific payout tables.

## Core Variables

- `Estate` = net estate after tax
- `Equity` = documented equity claim contributed by the support household
- `SNTvalue` = value already held for the dependent household through the SNT
- `Remainder` = estate remainder available for equalization after prior claims
- `Target` = equal target share of Person A's wealth

## Equalization Model

1. `Remainder = Estate - Equity`
2. `Target = Remainder / 3`
3. `Dependent household top-up = max(Target - SNTvalue, 0)`
4. `Support household total receipt = Target + Equity`
5. `Trustee household total receipt = Target`

## Interpretation

- The equity claim `Equity` is treated as return of separate contributed capital, not as inheritance.
- The SNT value `SNTvalue` counts toward the dependent household's share of Person A's wealth.
- Equal inheritance means each branch receives the same amount of **Person A's wealth**, while contributed outside capital is returned separately.

## Sensitivity Framing

- If `Estate` grows, all equalized shares rise.
- If `SNTvalue` grows, the dependent-household top-up falls.
- If `Equity` is documented clearly, settlement arithmetic becomes mechanical instead of discretionary.

## Demo Takeaway

For demo purposes, the important point is not any single table of values. It is the structure:

`estate after tax -> repay outside capital -> equalize remaining family wealth`
