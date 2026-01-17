import { NextRequest, NextResponse } from "next/server";

// Factorial function
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Prevent overflow
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function evaluateExpression(tokens: string[]): { validString: boolean; answer: number | null; tokenString: string } {
  // Join tokens with spaces (matches Python logic)
  let tokenString = tokens.join(" ");

  // Replace special characters (matches Python: ÷, ×, ^, √)
  tokenString = tokenString
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/\^/g, "**")
    .replace(/√/g, "Math.sqrt");

  // Handle factorial: convert "number !" or "(expr) !" to "factorial(number)" or "factorial(expr)"
  // Match number followed by !
  tokenString = tokenString.replace(/(\d+)\s*!/g, "factorial($1)");
  // Match closing paren followed by ! (for expressions like (3+2)!)
  tokenString = tokenString.replace(/\)\s*!/g, ")!");
  // Now handle the complex case with a function
  tokenString = processFactorials(tokenString);

  try {
    // Evaluate using Function constructor with factorial in scope
    const result = new Function("factorial", `return ${tokenString}`)(factorial);

    if (typeof result !== "number" || !isFinite(result)) {
      return { validString: false, answer: null, tokenString };
    }

    // Round to 2 decimal places (matches Python's round(..., 2))
    const answer = Math.round(result * 100) / 100;
    return { validString: true, answer, tokenString };
  } catch {
    return { validString: false, answer: null, tokenString };
  }
}

// Process factorial for parenthesized expressions like (3+2)!
function processFactorials(expr: string): string {
  // Find patterns like )! and wrap the preceding parenthesized expression
  let result = expr;
  let changed = true;

  while (changed) {
    changed = false;
    const match = result.match(/\([^()]*\)!/);
    if (match) {
      const idx = result.indexOf(match[0]);
      const inner = match[0].slice(0, -1); // Remove the !
      result = result.slice(0, idx) + "factorial" + inner + result.slice(idx + match[0].length);
      changed = true;
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer: tokens } = body;

    if (!Array.isArray(tokens)) {
      return NextResponse.json({ validString: false, tokenString: "" });
    }

    const result = evaluateExpression(tokens);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ validString: false, tokenString: "" });
  }
}
