# BurnRate Demo VM Sequestration Result

## Environment

- Hypervisor: VirtualBox
- Guest OS: Ubuntu 24.04 LTS
- Node.js: 20.20.0
- npm: 10.8.2

## Regimen

1. A clean Ubuntu VM was created instead of using WSL.
2. The BurnRate candidate was packaged and copied into the VM.
3. The host file share was unmounted before execution.
4. The candidate was installed and tested from Ubuntu-local storage.
5. BurnRate-focused tests were run inside the VM.
6. The full public test suite was also run as a broader baseline check.

## Observed results

- BurnRate-focused suite: `26 passing`
- Full public suite: `147 passing`, `3 failing`

## Interpretation

The VM result is a success for the BurnRate sequestration objective.

The BurnRate-specific test slice passed in a foreign environment without relying on a mounted host share during execution.

The 3 failures from the full public suite were unrelated shared-helper failures, not BurnRate-specific isolation failures.
