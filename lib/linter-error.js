'use strict';

class LinterError extends Error
{
    constructor(lintMessages)
    {
        super(`Could not graph code\n${lintMessages.map(formatLintMessage).join('\n')}`);
        this.lintMessages = lintMessages;
    }
}

function formatLintMessage(lintMessage)
{
    let { message } = lintMessage;
    const { line, column } = lintMessage;
    if (line && column) message = `${message} on line ${line} column ${column}`;
    return message;
}

module.exports = LinterError;
