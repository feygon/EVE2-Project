# BurnRate Demo Report

## Summary

BurnRate is a demo of a private financial estate planning appi for elder trust, retirement, and real estate assets with dynamic budget optimization. It was anonymized and sanitized in a Virtual Machine to empirically ensure sequestration from its original source.

## Merge candidate

A stable `2.6.0` baseline was identified first, then the BurnRate work was extracted and validated as an additive delta against that baseline. The result was a clean sequestered BurnRate candidate.

## Sequestration and validation performed

- Extracted a clean BurnRate merge candidate from a sequestered host
- Verified the candidate excluded Nickerson/private runtime dependencies
- Validated the candidate in a clean Ubuntu VirtualBox VM
- Copied the candidate into Ubuntu-local storage and unmounted the host share before execution
- Installed dependencies fresh inside Ubuntu
- Ran the BurnRate-focused integration and sequestration suite inside the VM

## Results

- BurnRate-focused suite in development workspace: `26 passing`
- BurnRate-focused suite in clean candidate host: `26 passing`
- BurnRate-focused suite in Ubuntu VM: `26 passing`

## Conclusion

The BurnRate demo passed its focused sequestration and runtime validation in a foreign Ubuntu VM and is ready to be treated as a validated BurnRate merge candidate.
