'use strict';

function analyzeCodePath(codePath)
{
    let allReachable = true;
    const edges = [];
    const addEdge = (from, to) => edges.push(`${from} --> ${to}\n`);
    const segments = new Set();
    const { initialSegment } = codePath;
    addEdge('[*]', initialSegment.id);
    segments.add(initialSegment);
    for (const segment of segments)
    {
        if (!segment.reachable) allReachable = false;
        for (const nextSegment of segment.allNextSegments)
        {
            addEdge(segment.id, nextSegment.id);
            segments.add(nextSegment);
        }
    }
    for (const segment of codePath.returnedSegments) addEdge(segment.id, '[*]');
    for (const segment of codePath.thrownSegments) addEdge(segment.id, 'thrown');
    return { allReachable, edgesText: edges.join(''), segments };
}

function formatCodePath(codePath, { segmentNames } = { })
{
    const { allReachable, edgesText, segments } = analyzeCodePath(codePath);
    let text =
    'stateDiagram-v2\n' +
    'classDef common fill: white, stroke: black, text-align: center\n';
    if (!allReachable) text += 'classDef unreachable fill: #FF9800, stroke-dasharray: 5 5\n';
    const anyThrown = codePath.thrownSegments.length > 0;
    if (anyThrown) text += 'classDef thrown fill: none, line-height: 1, stroke: none\n';
    for (const segment of segments)
    {
        const { id } = segment;
        const lines = (segment.internal.nodes || []).map(node => node.replace(/:/g, '#58;'));
        if (!lines.length || segmentNames) lines.unshift(`<b>${id}</b>`);
        const label = lines.join('\\n');
        if (segment.reachable)
            text += `${id}::: common: ${label}\n`;
        else
        {
            text +=
            `${id}:::common: #60;#60;unreachable#62;#62;\\n${label}\n` +
            `${id}:::unreachable\n`;
        }
    }
    if (anyThrown) text += 'thrown:::thrown: ✘\n';
    text += edgesText;
    return text;
}

module.exports = formatCodePath;
