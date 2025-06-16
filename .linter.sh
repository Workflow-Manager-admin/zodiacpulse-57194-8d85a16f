#!/bin/bash
cd /home/kavia/workspace/code-generation/zodiacpulse-57194-8d85a16f/zodiacpulse
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

