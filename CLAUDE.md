# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple shell calculator (`calc.sh`) that performs basic arithmetic operations with input validation. The project appears to be a study repository for AI-driven development.

## How to Run the Calculator

```bash
./calc.sh <operator> <number1> <number2>
```

Examples:
```bash
./calc.sh + 1 2      # Returns: 3
./calc.sh x 15 20    # Returns: 300
./calc.sh - 10 5     # Returns: 5
./calc.sh / 8 2      # Returns: 4
```

Supported operators: `+`, `-`, `x`, `*`, `/`

## Testing

Since there's no formal test framework, use manual testing:

```bash
# Test basic operations
./calc.sh + 5 3
./calc.sh - 10 4
./calc.sh x 6 7
./calc.sh / 15 3

# Test error cases
./calc.sh / 5 0      # Division by zero
./calc.sh + abc 5    # Invalid input
./calc.sh ^ 2 3      # Unsupported operator
```

## Code Structure

- `calc.sh`: Main calculator script with:
  - Argument validation (requires exactly 3 arguments)
  - Input validation (ensures numeric inputs)
  - Arithmetic operations with error handling
  - Japanese language error messages and usage instructions

## Development Commands

```bash
# Make script executable
chmod +x calc.sh

# Check script syntax
sh -n calc.sh

# Run shellcheck if available
shellcheck calc.sh
```