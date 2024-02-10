'use strict';

function analyzeCodePath(codePath)
{
    const edges = [];
    const addEdge = (from, to) => edges.push(`${from} --> ${to}\n`);
    const segments = new Set();
    const unreachableSegments = [];
    const { initialSegment } = codePath;
    addEdge('[*]', initialSegment.id);
    segments.add(initialSegment);
    for (const segment of segments)
    {
        if (!segment.reachable)
            unreachableSegments.push(segment);
        for (const nextSegment of segment.allNextSegments)
        {
            addEdge(segment.id, nextSegment.id);
            segments.add(nextSegment);
        }
    }
    for (const segment of codePath.returnedSegments) addEdge(segment.id, '[*]');
    for (const segment of codePath.thrownSegments) addEdge(segment.id, 'thrown');
    return { edgesText: edges.join(''), segments: [...segments], unreachableSegments };
}

function formatCodePath(codePath, { segmentNames } = { })
{
    const { edgesText, segments, unreachableSegments } = analyzeCodePath(codePath);
    let text =
    'stateDiagram-v2\n' +
    'classDef common fill: white, stroke: black\n' +
    `class ${joinIds(segments)} common\n`;
    if (unreachableSegments.length)
    {
        text +=
        'classDef unreachable fill: #FF9800, stroke-dasharray: 5 5\n' +
        `class ${joinIds(unreachableSegments)} unreachable\n`;
    }
    const anyThrown = codePath.thrownSegments.length > 0;
    if (anyThrown) text += 'classDef thrown fill: none, stroke: none\n';
    for (const segment of segments)
    {
        const { id } = segment;
        const lines = segment.internal.nodes || [];
        if (segmentNames)
            lines.unshift(`【${id}】`);
        const label = lines.join('\n');
        text += `state ${JSON.stringify(label)} as ${id}\n`;
    }
    if (anyThrown) text += 'thrown:::thrown: ✘\n';
    text += edgesText;
    return text;
}

const joinIds = segments => segments.map(({ id }) => id).join(', ');

module.exports = formatCodePath;
