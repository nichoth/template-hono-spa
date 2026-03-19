#!/bin/bash

# Config
PROMPT_FILE="PROMPT.md"
MAX_ITERATIONS=${1:-10} # Default to 10 iterations if no argument provided
ITERATION=0

echo "Starting Ralph Loop with Claude CLI..."

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo -e "\n\033[1;34m--- Iteration $ITERATION of $MAX_ITERATIONS ---\033[0m"

    # Codex CLI in headless mode
    # --yolo or --dangerously-skip-permissions: skips manual approval for tool calls
    # -: tells Codex to read the prompt from stdin
    # Capture the output to a variable
    # RESPONSE=$(cat "$PROMPT_FILE" | codex exec --yolo -)

    RESPONSE=$(cat PROMPT.md | claude --output-format stream-json --verbose -p --dangerously-skip-permissions | tee /dev/stderr) 

    # Print it so you can see what's happening
    echo "$RESPONSE"

    # Check if the agent gave the signal
    if [[ "$RESPONSE" == *"<promise>COMPLETE</promise>"* ]]; then
        echo -e "\n\033[1;32m✅ SUCCESS: Mission accomplished. Exiting loop.\033[0m"
        exit 0
    fi

    # 4. Optional: Small delay to prevent API rate limiting
    sleep 2

    echo "Iteration $ITERATION complete. Restarting with fresh context..."
done

echo -e "\n\033[1;31m⚠️  Loop reached max iterations without completion signal.\033[0m"
